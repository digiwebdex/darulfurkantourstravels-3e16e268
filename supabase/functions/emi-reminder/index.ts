import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// BulkSMSBD SMS sender helper
const sendBulkSMS = async (
  apiKey: string,
  senderId: string,
  phone: string,
  message: string
): Promise<{ success: boolean; response?: string; error?: string }> => {
  try {
    // Format phone number - remove + and ensure it starts with 880
    let formattedPhone = phone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '880' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('880')) {
      formattedPhone = '880' + formattedPhone;
    }

    // BulkSMSBD API uses GET request with URL parameters
    const encodedMessage = encodeURIComponent(message);
    const apiUrl = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${formattedPhone}&senderid=${senderId}&message=${encodedMessage}`;
    
    console.log("Sending SMS to:", formattedPhone);
    
    const response = await fetch(apiUrl, { method: "GET" });
    const responseText = await response.text();
    
    console.log("BulkSMSBD response:", responseText);
    
    try {
      const jsonResponse = JSON.parse(responseText);
      if (jsonResponse.response_code === 202 || jsonResponse.response_code === "202") {
        return { success: true, response: responseText };
      } else {
        return { success: false, error: responseText };
      }
    } catch {
      if (responseText.toLowerCase().includes('success') || response.ok) {
        return { success: true, response: responseText };
      }
      return { success: false, error: responseText };
    }
  } catch (error: any) {
    console.error("SMS sending error:", error);
    return { success: false, error: error.message };
  }
};

interface SMSConfig {
  provider: string;
  api_url: string;
  api_key: string;
  sender_id: string;
}

const formatCurrency = (amount: number): string => {
  return `৳${amount.toLocaleString("en-BD")}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    const todayStr = today.toISOString().split("T")[0];
    const threeDaysStr = threeDaysFromNow.toISOString().split("T")[0];

    console.log("EMI Reminder check - Today:", todayStr, "3 days from now:", threeDaysStr);

    // Find installments due in the next 3 days
    const { data: upcomingInstallments, error: upcomingError } = await supabase
      .from("emi_installments")
      .select(`
        id,
        installment_number,
        amount,
        due_date,
        emi_payment_id
      `)
      .eq("status", "pending")
      .gte("due_date", todayStr)
      .lte("due_date", threeDaysStr);

    if (upcomingError) {
      console.error("Error fetching upcoming installments:", upcomingError);
      throw upcomingError;
    }

    // Find overdue installments
    const { data: overdueInstallments, error: overdueError } = await supabase
      .from("emi_installments")
      .select(`
        id,
        installment_number,
        amount,
        due_date,
        emi_payment_id
      `)
      .eq("status", "pending")
      .lt("due_date", todayStr);

    if (overdueError) {
      console.error("Error fetching overdue installments:", overdueError);
      throw overdueError;
    }

    // Update overdue installments status
    if (overdueInstallments && overdueInstallments.length > 0) {
      const overdueIds = overdueInstallments.map(i => i.id);
      await supabase
        .from("emi_installments")
        .update({ status: "overdue" })
        .in("id", overdueIds);
    }

    const allInstallments = [
      ...(upcomingInstallments || []).map(i => ({ ...i, type: "upcoming" })),
      ...(overdueInstallments || []).map(i => ({ ...i, type: "overdue" })),
    ];

    console.log("Total installments to process:", allInstallments.length);

    if (allInstallments.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reminders to send", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get EMI payments for booking info
    const emiPaymentIds = [...new Set(allInstallments.map(i => i.emi_payment_id))];
    const { data: emiPayments } = await supabase
      .from("emi_payments")
      .select("id, booking_id, number_of_emis, paid_emis, remaining_amount")
      .in("id", emiPaymentIds);

    if (!emiPayments) {
      return new Response(
        JSON.stringify({ message: "No EMI payments found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get bookings for customer info
    const bookingIds = [...new Set(emiPayments.map(e => e.booking_id))];
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, guest_name, guest_email, guest_phone, user_id, package:packages(title)")
      .in("id", bookingIds);

    // Get user profiles for registered users
    const userIds = bookings?.filter(b => b.user_id).map(b => b.user_id) || [];
    let profiles: any[] = [];
    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, email, phone, full_name")
        .in("id", userIds);
      profiles = profileData || [];
    }

    // Check SMS notification settings
    const { data: notificationSettings } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("setting_type", "sms")
      .eq("is_enabled", true)
      .single();

    if (!notificationSettings) {
      console.log("SMS notifications are disabled");
      return new Response(
        JSON.stringify({ message: "SMS notifications disabled", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const smsConfig = notificationSettings.config as unknown as SMSConfig;
    let sentCount = 0;
    let failedCount = 0;

    for (const installment of allInstallments) {
      const emiPayment = emiPayments.find(e => e.id === installment.emi_payment_id);
      if (!emiPayment) continue;

      const booking = bookings?.find(b => b.id === emiPayment.booking_id);
      if (!booking) continue;

      const profile = profiles.find(p => p.id === booking.user_id);
      const customerPhone = profile?.phone || booking.guest_phone;
      const customerName = profile?.full_name || booking.guest_name || "Customer";
      const packageTitle = (booking.package as any)?.title || "Package";

      if (!customerPhone) {
        console.log("No phone number for booking:", booking.id);
        continue;
      }

      const bookingIdShort = booking.id.slice(0, 8).toUpperCase();
      const dueDate = new Date(installment.due_date);
      const formattedDate = dueDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const isOverdue = installment.type === "overdue";
      const daysOverdue = isOverdue
        ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      let message: string;
      if (isOverdue) {
        message = `⚠️ Dear ${customerName}, your installment #${installment.installment_number} of ${formatCurrency(installment.amount)} for ${packageTitle} is ${daysOverdue} days OVERDUE (was due ${formattedDate}). Please pay immediately. ID: ${bookingIdShort}. - SM Elite Hajj`;
      } else {
        message = `⏰ Dear ${customerName}, reminder: Installment #${installment.installment_number} of ${formatCurrency(installment.amount)} for ${packageTitle} is due on ${formattedDate}. Please pay on time. ID: ${bookingIdShort}. - SM Elite Hajj`;
      }

      console.log(`Sending ${isOverdue ? 'OVERDUE' : 'REMINDER'} SMS to:`, customerPhone);
      
      const smsResult = await sendBulkSMS(smsConfig.api_key, smsConfig.sender_id, customerPhone, message);

      if (smsResult.success) {
        sentCount++;
        await supabase.from("notification_logs").insert({
          booking_id: booking.id,
          notification_type: isOverdue ? "sms_customer_emi_overdue" : "sms_customer_emi_reminder",
          recipient: customerPhone,
          status: "sent",
        });
        console.log("SMS sent successfully to:", customerPhone);
      } else {
        failedCount++;
        await supabase.from("notification_logs").insert({
          booking_id: booking.id,
          notification_type: isOverdue ? "sms_customer_emi_overdue" : "sms_customer_emi_reminder",
          recipient: customerPhone,
          status: "failed",
          error_message: smsResult.error,
        });
        console.error("SMS failed for:", customerPhone, smsResult.error);
      }
    }

    console.log(`EMI reminders completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({
        message: "EMI reminders processed",
        sent: sentCount,
        failed: failedCount,
        upcoming: upcomingInstallments?.length || 0,
        overdue: overdueInstallments?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in EMI reminder function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
