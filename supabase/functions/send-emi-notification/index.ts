import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EMINotificationRequest {
  bookingId: string;
  notificationType: "payment_recorded" | "payment_due" | "payment_overdue" | "emi_plan_created";
  installmentNumber?: number;
  amount?: number;
  dueDate?: string;
  paidEmis?: number;
  totalEmis?: number;
  remainingAmount?: number;
}

interface SMSConfig {
  provider: string;
  api_url: string;
  api_key: string;
  sender_id: string;
}

interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("BDT", "৳");
};

const getNotificationContent = (
  type: string,
  customerName: string,
  packageTitle: string,
  bookingId: string,
  data: Partial<EMINotificationRequest>
) => {
  switch (type) {
    case "emi_plan_created":
      return {
        emoji: "📋",
        subject: `EMI Plan Created - ${packageTitle}`,
        smsText: `Dear ${customerName}, your EMI plan for ${packageTitle} has been created. Total ${data.totalEmis} installments of ${formatCurrency(data.amount || 0)} each. Booking ID: ${bookingId}`,
        title: "EMI Plan Created",
        description: `Your installment payment plan has been set up successfully.`,
      };
    case "payment_recorded":
      return {
        emoji: "✅",
        subject: `EMI Payment Received - Installment ${data.installmentNumber}`,
        smsText: `Dear ${customerName}, we received your EMI payment of ${formatCurrency(data.amount || 0)} for installment ${data.installmentNumber}. ${data.paidEmis}/${data.totalEmis} paid. Remaining: ${formatCurrency(data.remainingAmount || 0)}. Booking: ${bookingId}`,
        title: "Payment Received",
        description: `Your EMI payment for installment ${data.installmentNumber} has been recorded.`,
      };
    case "payment_due":
      return {
        emoji: "⏰",
        subject: `EMI Payment Reminder - Installment ${data.installmentNumber} Due`,
        smsText: `Dear ${customerName}, reminder: EMI payment of ${formatCurrency(data.amount || 0)} for installment ${data.installmentNumber} is due on ${data.dueDate}. Please pay on time. Booking: ${bookingId}`,
        title: "Payment Reminder",
        description: `Your EMI payment for installment ${data.installmentNumber} is due soon.`,
      };
    case "payment_overdue":
      return {
        emoji: "⚠️",
        subject: `EMI Payment Overdue - Installment ${data.installmentNumber}`,
        smsText: `Dear ${customerName}, your EMI payment of ${formatCurrency(data.amount || 0)} for installment ${data.installmentNumber} is overdue. Due date was ${data.dueDate}. Please pay immediately. Booking: ${bookingId}`,
        title: "Payment Overdue",
        description: `Your EMI payment for installment ${data.installmentNumber} is overdue.`,
      };
    default:
      return {
        emoji: "📢",
        subject: `EMI Update - ${packageTitle}`,
        smsText: `Dear ${customerName}, there's an update about your EMI plan for ${packageTitle}. Booking: ${bookingId}`,
        title: "EMI Update",
        description: `There's an update about your EMI plan.`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-emi-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData: EMINotificationRequest = await req.json();
    const { bookingId, notificationType, ...notificationData } = requestData;
    
    console.log("Processing EMI notification for booking:", bookingId, "Type:", notificationType);

    // Fetch booking details with package info
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        package:packages(title, duration_days, type)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError);
      throw new Error("Booking not found");
    }

    console.log("Booking found:", booking.id);

    // Fetch profile if user_id exists
    let profile = null;
    if (booking.user_id) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", booking.user_id)
        .single();
      profile = profileData;
    }

    // Get customer details
    const customerName = profile?.full_name || booking.guest_name || "Customer";
    const customerEmail = profile?.email || booking.guest_email;
    const customerPhone = profile?.phone || booking.guest_phone;

    console.log("Customer details:", { customerName, customerEmail, customerPhone });

    // Fetch notification settings
    const { data: settings, error: settingsError } = await supabase
      .from("notification_settings")
      .select("*");

    if (settingsError) {
      console.error("Error fetching notification settings:", settingsError);
      throw new Error("Could not fetch notification settings");
    }

    const smsSettings = settings?.find(s => s.setting_type === "sms");
    const emailSettings = settings?.find(s => s.setting_type === "email");

    console.log("SMS enabled:", smsSettings?.is_enabled);
    console.log("Email enabled:", emailSettings?.is_enabled);

    const results = {
      sms: { sent: false, error: null as string | null },
      email: { sent: false, error: null as string | null },
    };

    const content = getNotificationContent(
      notificationType,
      customerName,
      booking.package.title,
      booking.id.slice(0, 8).toUpperCase(),
      notificationData
    );

    // Send SMS if enabled and phone exists
    if (smsSettings?.is_enabled && customerPhone) {
      try {
        const smsConfig = smsSettings.config as unknown as SMSConfig;
        console.log("Sending SMS to:", customerPhone);

        const smsResponse = await fetch(smsConfig.api_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${smsConfig.api_key}`,
          },
          body: JSON.stringify({
            to: customerPhone,
            from: smsConfig.sender_id,
            message: content.smsText,
          }),
        });

        if (!smsResponse.ok) {
          const errorText = await smsResponse.text();
          throw new Error(`SMS API error: ${errorText}`);
        }

        results.sms.sent = true;
        console.log("SMS sent successfully");

        await supabase.from("notification_logs").insert({
          booking_id: bookingId,
          notification_type: `sms_emi_${notificationType}`,
          recipient: customerPhone,
          status: "sent",
        });
      } catch (smsError: any) {
        console.error("SMS sending error:", smsError);
        results.sms.error = smsError.message;

        await supabase.from("notification_logs").insert({
          booking_id: bookingId,
          notification_type: `sms_emi_${notificationType}`,
          recipient: customerPhone,
          status: "failed",
          error_message: smsError.message,
        });
      }
    }

    // Send Email if enabled and email exists
    if (emailSettings?.is_enabled && customerEmail) {
      try {
        const emailConfig = emailSettings.config as unknown as EmailConfig;
        console.log("Sending email to:", customerEmail);

        const client = new SMTPClient({
          connection: {
            hostname: emailConfig.smtp_host,
            port: emailConfig.smtp_port,
            tls: emailConfig.smtp_port === 465,
            auth: {
              username: emailConfig.smtp_user,
              password: emailConfig.smtp_password,
            },
          },
        });

        const statusColor = notificationType === "payment_overdue" ? "#dc2626" : 
                           notificationType === "payment_due" ? "#f59e0b" : "#d4a853";

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${content.subject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, ${statusColor}, ${statusColor}dd); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">${content.emoji} ${content.title}</h1>
                <p style="margin: 10px 0 0 0;">${content.description}</p>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Dear ${customerName},</p>
                
                ${notificationType === "emi_plan_created" ? `
                <p>Your EMI payment plan has been set up for your booking. Here are the details:</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
                  <div style="margin-bottom: 10px;"><strong>Package:</strong> ${booking.package.title}</div>
                  <div style="margin-bottom: 10px;"><strong>Total Installments:</strong> ${notificationData.totalEmis}</div>
                  <div style="margin-bottom: 10px;"><strong>Monthly EMI:</strong> ${formatCurrency(notificationData.amount || 0)}</div>
                </div>
                ` : ""}
                
                ${notificationType === "payment_recorded" ? `
                <p>We have received your EMI payment. Thank you!</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                  <div style="margin-bottom: 10px;"><strong>Installment Number:</strong> ${notificationData.installmentNumber}</div>
                  <div style="margin-bottom: 10px;"><strong>Amount Paid:</strong> ${formatCurrency(notificationData.amount || 0)}</div>
                  <div style="margin-bottom: 10px;"><strong>Progress:</strong> ${notificationData.paidEmis}/${notificationData.totalEmis} installments paid</div>
                  <div style="margin-bottom: 10px;"><strong>Remaining Amount:</strong> ${formatCurrency(notificationData.remainingAmount || 0)}</div>
                </div>
                ` : ""}
                
                ${notificationType === "payment_due" ? `
                <p>This is a friendly reminder that your EMI payment is due soon.</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <div style="margin-bottom: 10px;"><strong>Installment Number:</strong> ${notificationData.installmentNumber}</div>
                  <div style="margin-bottom: 10px;"><strong>Amount Due:</strong> ${formatCurrency(notificationData.amount || 0)}</div>
                  <div style="margin-bottom: 10px;"><strong>Due Date:</strong> ${notificationData.dueDate}</div>
                </div>
                <p style="color: #f59e0b; font-weight: bold;">Please ensure timely payment to avoid any service interruption.</p>
                ` : ""}
                
                ${notificationType === "payment_overdue" ? `
                <p>We noticed that your EMI payment is overdue. Please make the payment as soon as possible.</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                  <div style="margin-bottom: 10px;"><strong>Installment Number:</strong> ${notificationData.installmentNumber}</div>
                  <div style="margin-bottom: 10px;"><strong>Overdue Amount:</strong> ${formatCurrency(notificationData.amount || 0)}</div>
                  <div style="margin-bottom: 10px;"><strong>Due Date Was:</strong> ${notificationData.dueDate}</div>
                </div>
                <p style="color: #dc2626; font-weight: bold;">⚠️ Please pay immediately to avoid any penalties or service issues.</p>
                ` : ""}
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                    <span style="color: #666;">Booking ID:</span>
                    <span style="font-weight: bold;">${booking.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span style="color: #666;">Package:</span>
                    <span style="font-weight: bold;">${booking.package.title}</span>
                  </div>
                </div>
                
                <p>If you have any questions about your payment plan, please contact us.</p>
              </div>
              <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>This is an automated notification. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await client.send({
          from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
          to: customerEmail,
          subject: `${content.emoji} ${content.subject} - Booking ${booking.id.slice(0, 8).toUpperCase()}`,
          content: content.smsText,
          html: emailHtml,
        });

        await client.close();
        results.email.sent = true;
        console.log("Email sent successfully");

        await supabase.from("notification_logs").insert({
          booking_id: bookingId,
          notification_type: `email_emi_${notificationType}`,
          recipient: customerEmail,
          status: "sent",
        });
      } catch (emailError: any) {
        console.error("Email sending error:", emailError);
        results.email.error = emailError.message;

        await supabase.from("notification_logs").insert({
          booking_id: bookingId,
          notification_type: `email_emi_${notificationType}`,
          recipient: customerEmail,
          status: "failed",
          error_message: emailError.message,
        });
      }
    }

    console.log("EMI notification results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-emi-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
