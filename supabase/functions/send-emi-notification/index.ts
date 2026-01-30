import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple SMTP helper for sending emails
const sendSMTPEmail = async (
  config: { host: string; port: number; user: string; password: string; fromEmail: string; fromName: string },
  to: string,
  subject: string,
  htmlContent: string
): Promise<void> => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const conn = await Deno.connect({ hostname: config.host, port: config.port });
  
  const readResponse = async (): Promise<string> => {
    const buffer = new Uint8Array(1024);
    const n = await conn.read(buffer);
    return n ? decoder.decode(buffer.subarray(0, n)) : "";
  };

  const writeCommand = async (cmd: string): Promise<string> => {
    await conn.write(encoder.encode(cmd + "\r\n"));
    return await readResponse();
  };

  try {
    await readResponse();
    await writeCommand(`EHLO localhost`);
    
    const starttlsResp = await writeCommand("STARTTLS");
    if (starttlsResp.startsWith("220")) {
      const tlsConn = await Deno.startTls(conn, { hostname: config.host });
      
      const tlsReadResponse = async (): Promise<string> => {
        const buffer = new Uint8Array(2048);
        const n = await tlsConn.read(buffer);
        return n ? decoder.decode(buffer.subarray(0, n)) : "";
      };

      const tlsWriteCommand = async (cmd: string): Promise<string> => {
        await tlsConn.write(encoder.encode(cmd + "\r\n"));
        return await tlsReadResponse();
      };

      await tlsWriteCommand(`EHLO localhost`);
      await tlsWriteCommand("AUTH LOGIN");
      await tlsWriteCommand(btoa(config.user));
      const authResp = await tlsWriteCommand(btoa(config.password));
      
      if (!authResp.startsWith("235")) {
        throw new Error("SMTP authentication failed: " + authResp);
      }
      
      await tlsWriteCommand(`MAIL FROM:<${config.fromEmail}>`);
      await tlsWriteCommand(`RCPT TO:<${to}>`);
      await tlsWriteCommand("DATA");
      
      const emailContent = [
        `From: ${config.fromName} <${config.fromEmail}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`,
        ``,
        htmlContent,
        `.`
      ].join("\r\n");
      
      const dataResp = await tlsWriteCommand(emailContent);
      
      if (!dataResp.startsWith("250")) {
        throw new Error("Failed to send email: " + dataResp);
      }
      
      await tlsWriteCommand("QUIT");
      tlsConn.close();
    } else {
      throw new Error("STARTTLS not supported: " + starttlsResp);
    }
  } catch (error) {
    conn.close();
    throw error;
  }
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
  return `৳${amount.toLocaleString("en-BD")}`;
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
        subject: `কিস্তি পরিকল্পনা তৈরি হয়েছে - ${packageTitle}`,
        smsText: `প্রিয় ${customerName}, ${packageTitle} এর জন্য আপনার কিস্তি পরিকল্পনা তৈরি হয়েছে। মোট ${data.totalEmis} কিস্তি, প্রতিটি ${formatCurrency(data.amount || 0)}। আইডি: ${bookingId}। - দারুল ফুরকান ট্যুরস`,
        title: "কিস্তি পরিকল্পনা তৈরি",
        description: `আপনার কিস্তি পেমেন্ট প্ল্যান সফলভাবে সেটআপ হয়েছে।`,
      };
    case "payment_recorded":
      return {
        emoji: "✅",
        subject: `কিস্তি পেমেন্ট গৃহীত - #${data.installmentNumber}`,
        smsText: `প্রিয় ${customerName}, আপনার ${formatCurrency(data.amount || 0)} কিস্তি পেমেন্ট (#${data.installmentNumber}) গৃহীত হয়েছে। ${data.paidEmis}/${data.totalEmis} পরিশোধিত। বাকি: ${formatCurrency(data.remainingAmount || 0)}। আইডি: ${bookingId}। - দারুল ফুরকান ট্যুরস`,
        title: "পেমেন্ট গৃহীত",
        description: `আপনার কিস্তি পেমেন্ট #${data.installmentNumber} রেকর্ড হয়েছে।`,
      };
    case "payment_due":
      return {
        emoji: "⏰",
        subject: `কিস্তি পেমেন্ট রিমাইন্ডার - #${data.installmentNumber} বাকি`,
        smsText: `প্রিয় ${customerName}, রিমাইন্ডার: কিস্তি #${data.installmentNumber} ${formatCurrency(data.amount || 0)} ${data.dueDate} তারিখে বাকি। সময়মতো পরিশোধ করুন। আইডি: ${bookingId}। - দারুল ফুরকান ট্যুরস`,
        title: "পেমেন্ট রিমাইন্ডার",
        description: `আপনার কিস্তি পেমেন্ট #${data.installmentNumber} শীঘ্রই বাকি।`,
      };
    case "payment_overdue":
      return {
        emoji: "⚠️",
        subject: `কিস্তি পেমেন্ট বকেয়া - #${data.installmentNumber}`,
        smsText: `প্রিয় ${customerName}, আপনার কিস্তি #${data.installmentNumber} ${formatCurrency(data.amount || 0)} বকেয়া (${data.dueDate} তারিখে বাকি ছিল)। অনুগ্রহ করে এখনই পরিশোধ করুন। আইডি: ${bookingId}। - দারুল ফুরকান ট্যুরস`,
        title: "পেমেন্ট বকেয়া",
        description: `আপনার কিস্তি পেমেন্ট #${data.installmentNumber} বকেয়া।`,
      };
    default:
      return {
        emoji: "📢",
        subject: `কিস্তি আপডেট - ${packageTitle}`,
        smsText: `প্রিয় ${customerName}, ${packageTitle} এর জন্য আপনার কিস্তি পরিকল্পনা সম্পর্কে একটি আপডেট আছে। আইডি: ${bookingId}। - দারুল ফুরকান ট্যুরস`,
        title: "কিস্তি আপডেট",
        description: `আপনার কিস্তি পরিকল্পনা সম্পর্কে একটি আপডেট আছে।`,
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

    // Send SMS to CUSTOMER only
    if (smsSettings?.is_enabled && customerPhone) {
      try {
        const smsConfig = smsSettings.config as unknown as SMSConfig;
        console.log("Sending EMI SMS to CUSTOMER:", customerPhone);

        const smsResult = await sendBulkSMS(smsConfig.api_key, smsConfig.sender_id, customerPhone, content.smsText);

        if (smsResult.success) {
          results.sms.sent = true;
          console.log("SMS sent successfully");

          await supabase.from("notification_logs").insert({
            booking_id: bookingId,
            notification_type: `sms_customer_emi_${notificationType}`,
            recipient: customerPhone,
            status: "sent",
          });
        } else {
          throw new Error(smsResult.error || "SMS failed");
        }
      } catch (smsError: any) {
        console.error("SMS sending error:", smsError);
        results.sms.error = smsError.message;

        await supabase.from("notification_logs").insert({
          booking_id: bookingId,
          notification_type: `sms_customer_emi_${notificationType}`,
          recipient: customerPhone,
          status: "failed",
          error_message: smsError.message,
        });
      }
    }

    // Send Email to CUSTOMER
    if (emailSettings?.is_enabled && customerEmail) {
      try {
        const emailConfig = emailSettings.config as unknown as EmailConfig;
        console.log("Sending email to:", customerEmail);

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
                <p>Your installment payment plan has been set up for your booking. Here are the details:</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
                  <div style="margin-bottom: 10px;"><strong>Package:</strong> ${booking.package.title}</div>
                  <div style="margin-bottom: 10px;"><strong>Total Installments:</strong> ${notificationData.totalEmis}</div>
                  <div style="margin-bottom: 10px;"><strong>Monthly Installment:</strong> ${formatCurrency(notificationData.amount || 0)}</div>
                </div>
                ` : ""}
                
                ${notificationType === "payment_recorded" ? `
                <p>We have received your installment payment. Thank you!</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                  <div style="margin-bottom: 10px;"><strong>Installment Number:</strong> ${notificationData.installmentNumber}</div>
                  <div style="margin-bottom: 10px;"><strong>Amount Paid:</strong> ${formatCurrency(notificationData.amount || 0)}</div>
                  <div style="margin-bottom: 10px;"><strong>Progress:</strong> ${notificationData.paidEmis}/${notificationData.totalEmis} installments paid</div>
                  <div style="margin-bottom: 10px;"><strong>Remaining Amount:</strong> ${formatCurrency(notificationData.remainingAmount || 0)}</div>
                </div>
                ` : ""}
                
                ${notificationType === "payment_due" ? `
                <p>This is a friendly reminder that your installment payment is due soon.</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <div style="margin-bottom: 10px;"><strong>Installment Number:</strong> ${notificationData.installmentNumber}</div>
                  <div style="margin-bottom: 10px;"><strong>Amount Due:</strong> ${formatCurrency(notificationData.amount || 0)}</div>
                  <div style="margin-bottom: 10px;"><strong>Due Date:</strong> ${notificationData.dueDate}</div>
                </div>
                <p style="color: #f59e0b; font-weight: bold;">Please ensure timely payment to avoid any service interruption.</p>
                ` : ""}
                
                ${notificationType === "payment_overdue" ? `
                <p>We noticed that your installment payment is overdue. Please make the payment as soon as possible.</p>
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

        await sendSMTPEmail(
          {
            host: emailConfig.smtp_host,
            port: emailConfig.smtp_port,
            user: emailConfig.smtp_user,
            password: emailConfig.smtp_password,
            fromEmail: emailConfig.from_email,
            fromName: emailConfig.from_name,
          },
          customerEmail,
          `${content.emoji} ${content.subject} - Booking ${booking.id.slice(0, 8).toUpperCase()}`,
          emailHtml
        );

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
