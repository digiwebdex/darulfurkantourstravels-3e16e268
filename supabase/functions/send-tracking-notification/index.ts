import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Management notification number
const MANAGEMENT_PHONE = "8801867666888";

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
    let formattedPhone = phone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '880' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('880')) {
      formattedPhone = '880' + formattedPhone;
    }

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

interface NotificationRequest {
  bookingId: string;
  newStatus: string;
  notes?: string;
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

interface WhatsAppConfig {
  provider: string;
  account_sid: string;
  auth_token: string;
  from_number: string;
  message_template: string;
}

const formatCurrency = (amount: number): string => {
  return `৳${amount.toLocaleString("en-BD")}`;
};

const formatWhatsAppNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '880' + cleaned.substring(1);
  }
  return `whatsapp:+${cleaned}`;
};

// Status-specific SMS messages for CUSTOMER
const getCustomerSmsMessage = (
  status: string,
  customerName: string,
  packageTitle: string,
  bookingIdShort: string,
  totalPrice: number,
  bookingId: string,
  notes?: string
): string => {
  const trackingLink = `https://darulfurkantourstravels.lovable.app/track-order?id=${bookingId}`;
  const companyName = "দারুল ফুরকান ট্যুরস";
  
  switch (status) {
    case 'order_submitted':
      return `প্রিয় ${customerName}, ${packageTitle} এর বুকিং সফলভাবে জমা হয়েছে! আইডি: ${bookingIdShort}. অনুগ্রহ করে প্রয়োজনীয় ডকুমেন্ট আপলোড করুন। স্ট্যাটাস দেখুন: ${trackingLink} - ${companyName}`;
    
    case 'documents_received':
      return `প্রিয় ${customerName}, ${packageTitle} এর ডকুমেন্ট পাওয়া গেছে। শীঘ্রই রিভিউ শুরু হবে। আইডি: ${bookingIdShort}. স্ট্যাটাস দেখুন: ${trackingLink} - ${companyName}`;
    
    case 'under_review':
      return `প্রিয় ${customerName}, ${packageTitle} এর ডকুমেন্ট রিভিউ চলছে। শীঘ্রই আপডেট পাবেন। আইডি: ${bookingIdShort}. স্ট্যাটাস দেখুন: ${trackingLink} - ${companyName}`;
    
    case 'approved':
      return `প্রিয় ${customerName}, অভিনন্দন! ${packageTitle} এর বুকিং অনুমোদন হয়েছে! মোট: ${formatCurrency(totalPrice)}. পেমেন্ট সম্পন্ন করুন। আইডি: ${bookingIdShort}. স্ট্যাটাস দেখুন: ${trackingLink} - ${companyName}`;
    
    case 'processing':
      return `প্রিয় ${customerName}, ${packageTitle} এর বুকিং প্রসেসিং হচ্ছে। আইডি: ${bookingIdShort}. স্ট্যাটাস দেখুন: ${trackingLink} - ${companyName}`;
    
    case 'completed':
      return `প্রিয় ${customerName}, ${packageTitle} এর বুকিং সম্পন্ন হয়েছে! আল্লাহ আপনার হজ্জ/উমরাহ কবুল করুন। আইডি: ${bookingIdShort}. ধন্যবাদ! - ${companyName}`;
    
    default:
      return `প্রিয় ${customerName}, বুকিং স্ট্যাটাস আপডেট: ${status}. আইডি: ${bookingIdShort}. স্ট্যাটাস দেখুন: ${trackingLink} - ${companyName}`;
  }
};

// Status-specific Email templates for CUSTOMER
const getCustomerEmailTemplate = (
  status: string,
  customerName: string,
  packageTitle: string,
  bookingIdShort: string,
  totalPrice: number,
  passengerCount: number,
  travelDate: string | null,
  durationDays: number,
  packageType: string,
  bookingId: string,
  notes?: string
): { subject: string; html: string } => {
  const trackingLink = `https://darulfurkantourstravels.lovable.app/track-order?id=${bookingId}`;
  const companyNameBn = "দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস";
  const companyNameEn = "Darul Furkan Tours & Travels";
  
  const baseStyles = `
    <style>
      body { font-family: 'Noto Sans Bengali', Arial, sans-serif; line-height: 1.8; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      .details-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
      .footer { text-align: center; padding: 20px; background: #1a4d2e; color: white; font-size: 12px; border-radius: 0 0 10px 10px; }
      .footer a { color: #d4a853; }
      .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4a853; }
      .success-highlight { background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
      .track-btn { display: inline-block; padding: 12px 24px; background: #1a4d2e; color: white !important; text-decoration: none; border-radius: 8px; margin: 15px 0; }
    </style>
  `;

  const footerHtml = `
    <div class="footer">
      <p style="font-size: 1.2em; font-weight: bold; margin-bottom: 5px;">${companyNameBn}</p>
      <p>${companyNameEn}</p>
      <p>📍 ৩৮২, বাগানবাড়ি, স্বাধীনতা সরণি, উত্তর বাড্ডা, ঢাকা ১২১২</p>
      <p>📞 01741-719932 | 01339-080532</p>
      <p>✉️ <a href="mailto:info@darulfurkantourstravels.com">info@darulfurkantourstravels.com</a></p>
      <p>🌐 <a href="https://darulfurkantourstravels.lovable.app">www.darulfurkantourstravels.com</a></p>
    </div>
  `;

  const bookingDetailsHtml = `
    <div class="details-box">
      <div class="detail-row"><span style="color: #666;">বুকিং আইডি:</span> <strong>${bookingIdShort}</strong></div>
      <div class="detail-row"><span style="color: #666;">প্যাকেজ:</span> <strong>${packageTitle}</strong></div>
      <div class="detail-row"><span style="color: #666;">ধরন:</span> <strong>${packageType === 'hajj' ? 'হজ্জ' : 'উমরাহ'}</strong></div>
      <div class="detail-row"><span style="color: #666;">সময়কাল:</span> <strong>${durationDays} দিন</strong></div>
      <div class="detail-row"><span style="color: #666;">যাত্রী সংখ্যা:</span> <strong>${passengerCount} জন</strong></div>
      <div class="detail-row"><span style="color: #666;">যাত্রার তারিখ:</span> <strong>${travelDate || "শীঘ্রই জানানো হবে"}</strong></div>
      <div class="detail-row"><span style="color: #666;">মোট পরিমাণ:</span> <strong style="color: #1a4d2e; font-size: 1.2em;">${formatCurrency(totalPrice)}</strong></div>
    </div>
    <p style="text-align: center;">
      <a href="${trackingLink}" class="track-btn">🔍 বুকিং স্ট্যাটাস দেখুন</a>
    </p>
  `;

  switch (status) {
    case 'order_submitted':
      return {
        subject: `📝 বুকিং জমা হয়েছে - ${packageTitle} | ${companyNameBn}`,
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"><title>বুকিং জমা হয়েছে</title>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #1a4d2e, #2d6a4f); color: white;">
                <h1>📝 বুকিং জমা হয়েছে!</h1>
                <p>আপনার বুকিং সফলভাবে গৃহীত হয়েছে</p>
              </div>
              <div class="content">
                <p>প্রিয় ${customerName},</p>
                <p>${companyNameBn} এ বুকিং করার জন্য ধন্যবাদ! আপনার বুকিং গৃহীত হয়েছে এবং <strong>ডকুমেন্ট রিভিউয়ের অপেক্ষায়</strong> আছে।</p>
                <div class="highlight">
                  <strong>⏭️ পরবর্তী পদক্ষেপ:</strong><br>
                  অনুগ্রহ করে প্রয়োজনীয় ডকুমেন্ট (পাসপোর্ট কপি, ছবি ইত্যাদি) আপলোড করুন যাতে আমরা রিভিউ প্রক্রিয়া শুরু করতে পারি।
                </div>
                ${bookingDetailsHtml}
                ${notes ? `<p><strong>নোট:</strong> ${notes}</p>` : ''}
                <p>ডকুমেন্ট রিভিউ সম্পন্ন হলে আমরা আপনাকে জানাব।</p>
              </div>
              ${footerHtml}
            </div>
          </body></html>
        `
      };

    case 'documents_received':
      return {
        subject: `📄 ডকুমেন্ট পাওয়া গেছে - ${packageTitle} | ${companyNameBn}`,
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"><title>ডকুমেন্ট পাওয়া গেছে</title>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #17a2b8, #138496); color: white;">
                <h1>📄 ডকুমেন্ট পাওয়া গেছে</h1>
                <p>আপনার ডকুমেন্ট সফলভাবে গৃহীত হয়েছে</p>
              </div>
              <div class="content">
                <p>প্রিয় ${customerName},</p>
                <p>আমরা আপনাকে জানাতে পেরে খুশি যে আপনার ডকুমেন্ট <strong>সফলভাবে পাওয়া গেছে</strong>।</p>
                <div class="highlight">
                  <strong>⏭️ পরবর্তী পদক্ষেপ:</strong><br>
                  আমাদের টিম শীঘ্রই আপনার ডকুমেন্ট রিভিউ শুরু করবে। রিভিউ সম্পন্ন হলে আপনি আপডেট পাবেন।
                </div>
                ${bookingDetailsHtml}
                ${notes ? `<p><strong>নোট:</strong> ${notes}</p>` : ''}
              </div>
              ${footerHtml}
            </div>
          </body></html>
        `
      };

    case 'under_review':
      return {
        subject: `🔍 ডকুমেন্ট রিভিউ চলছে - ${packageTitle} | ${companyNameBn}`,
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"><title>রিভিউ চলছে</title>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #6c757d, #5a6268); color: white;">
                <h1>🔍 রিভিউ চলছে</h1>
                <p>আপনার ডকুমেন্ট যাচাই করা হচ্ছে</p>
              </div>
              <div class="content">
                <p>প্রিয় ${customerName},</p>
                <p>আপনার ডকুমেন্ট বর্তমানে আমাদের টিম দ্বারা <strong>রিভিউ করা হচ্ছে</strong>।</p>
                <div class="highlight">
                  <strong>⏳ অনুগ্রহ করে অপেক্ষা করুন:</strong><br>
                  এই প্রক্রিয়া সাধারণত ১-৩ কর্মদিবস সময় নেয়। রিভিউ সম্পন্ন হলে আমরা আপনাকে জানাব।
                </div>
                ${bookingDetailsHtml}
                ${notes ? `<p><strong>নোট:</strong> ${notes}</p>` : ''}
              </div>
              ${footerHtml}
            </div>
          </body></html>
        `
      };

    case 'approved':
      return {
        subject: `✅ অনুমোদন হয়েছে - ${packageTitle} | ${companyNameBn}`,
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"><title>বুকিং অনুমোদন</title>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #28a745, #218838); color: white;">
                <h1>✅ বুকিং অনুমোদন হয়েছে!</h1>
                <p>অভিনন্দন! আপনার বুকিং অনুমোদিত হয়েছে</p>
              </div>
              <div class="content">
                <p>প্রিয় ${customerName},</p>
                <p>আমরা আপনাকে জানাতে পেরে আনন্দিত যে আপনার বুকিং ${companyNameBn} কর্তৃক <strong>অনুমোদিত</strong> হয়েছে!</p>
                <div class="success-highlight">
                  <strong>🎉 অভিনন্দন!</strong><br>
                  আপনার আবেদন সফলভাবে অনুমোদিত হয়েছে। অনুগ্রহ করে রিজার্ভেশন নিশ্চিত করতে পেমেন্ট সম্পন্ন করুন।
                </div>
                ${bookingDetailsHtml}
                <div class="highlight">
                  <strong>💳 পেমেন্ট প্রয়োজন</strong><br>
                  বুকিং নিশ্চিত করতে <strong style="color: #1a4d2e;">${formatCurrency(totalPrice)}</strong> পেমেন্ট করুন।<br><br>
                  <strong>পেমেন্ট অপশন:</strong><br>
                  • ব্যাংক ট্রান্সফার<br>
                  • বিকাশ / নগদ<br>
                  • অনলাইন পেমেন্ট (SSLCommerz)<br>
                  • কিস্তি পরিকল্পনা উপলব্ধ
                </div>
                ${notes ? `<p><strong>নোট:</strong> ${notes}</p>` : ''}
                <p>কোনো প্রশ্ন থাকলে অবিলম্বে যোগাযোগ করুন।</p>
              </div>
              ${footerHtml}
            </div>
          </body></html>
        `
      };

    case 'processing':
      return {
        subject: `⚙️ বুকিং প্রসেসিং - ${packageTitle} | ${companyNameBn}`,
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"><title>প্রসেসিং</title>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #fd7e14, #e96b0a); color: white;">
                <h1>⚙️ প্রসেসিং চলছে</h1>
                <p>আপনার বুকিং প্রক্রিয়াধীন</p>
              </div>
              <div class="content">
                <p>প্রিয় ${customerName},</p>
                <p>আপনার বুকিং এখন <strong>প্রক্রিয়াধীন</strong>। আমরা আপনার যাত্রার সবকিছু প্রস্তুত করছি।</p>
                ${bookingDetailsHtml}
                ${notes ? `<p><strong>নোট:</strong> ${notes}</p>` : ''}
                <p>সবকিছু প্রস্তুত হলে আমরা আপনাকে জানাব।</p>
              </div>
              ${footerHtml}
            </div>
          </body></html>
        `
      };

    case 'completed':
      return {
        subject: `🎉 বুকিং সম্পন্ন - ${packageTitle} | ${companyNameBn}`,
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"><title>সম্পন্ন</title>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #6f42c1, #5a32a3); color: white;">
                <h1>🎉 সম্পন্ন!</h1>
                <p>আপনার বুকিং প্রক্রিয়া সম্পূর্ণ</p>
              </div>
              <div class="content">
                <p>প্রিয় ${customerName},</p>
                <p>আমরা আপনাকে জানাতে পেরে আনন্দিত যে আপনার বুকিং প্রক্রিয়া <strong>সফলভাবে সম্পন্ন</strong> হয়েছে!</p>
                <div class="success-highlight">
                  <strong>🙏 ধন্যবাদ!</strong><br>
                  আপনার পবিত্র যাত্রার জন্য ${companyNameBn} বেছে নেওয়ার জন্য ধন্যবাদ। আল্লাহ আপনার হজ্জ/উমরাহ কবুল করুন।
                </div>
                ${bookingDetailsHtml}
                ${notes ? `<p><strong>নোট:</strong> ${notes}</p>` : ''}
                <p>ভবিষ্যতে আবার আপনাকে সেবা করার অপেক্ষায় রইলাম।</p>
              </div>
              ${footerHtml}
            </div>
          </body></html>
        `
      };

    default:
      return {
        subject: `📋 স্ট্যাটাস আপডেট - ${packageTitle} | ${companyNameBn}`,
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"><title>স্ট্যাটাস আপডেট</title>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #1a4d2e, #2d6a4f); color: white;">
                <h1>📋 স্ট্যাটাস আপডেট</h1>
              </div>
              <div class="content">
                <p>প্রিয় ${customerName},</p>
                <p>আপনার বুকিং স্ট্যাটাস আপডেট হয়েছে: <strong>${status}</strong></p>
                ${bookingDetailsHtml}
                ${notes ? `<p><strong>নোট:</strong> ${notes}</p>` : ''}
              </div>
              ${footerHtml}
            </div>
          </body></html>
        `
      };
  }
};

// Management SMS for order_submitted ONLY
const getManagementSmsMessage = (
  customerName: string,
  customerPhone: string,
  packageTitle: string,
  bookingIdShort: string,
  passengerCount: number,
  totalPrice: number
): string => {
  return `NEW BOOKING! Customer: ${customerName}, Phone: ${customerPhone}, Package: ${packageTitle}, Passengers: ${passengerCount}, Amount: ${formatCurrency(totalPrice)}, ID: ${bookingIdShort}. Please review documents.`;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-tracking-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingId, newStatus, notes }: NotificationRequest = await req.json();
    console.log("Processing tracking notification for booking:", bookingId, "Status:", newStatus);

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`*, package:packages(title, duration_days, type)`)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError);
      throw new Error("Booking not found");
    }

    let profile = null;
    if (booking.user_id) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", booking.user_id)
        .single();
      profile = profileData;
    }

    const customerName = profile?.full_name || booking.guest_name || "Customer";
    const customerEmail = profile?.email || booking.guest_email;
    const customerPhone = profile?.phone || booking.guest_phone;
    const bookingIdShort = booking.id.slice(0, 8).toUpperCase();

    console.log("Customer details:", { customerName, customerEmail, customerPhone });

    const { data: settings } = await supabase.from("notification_settings").select("*");

    const smsSettings = settings?.find(s => s.setting_type === "sms");
    const emailSettings = settings?.find(s => s.setting_type === "email");
    const whatsappSettings = settings?.find(s => s.setting_type === "whatsapp");

    const results = {
      sms: { sent: false, error: null as string | null },
      email: { sent: false, error: null as string | null },
      whatsapp: { sent: false, error: null as string | null },
      managementSms: { sent: false, error: null as string | null },
    };

    // Send WhatsApp if enabled
    if (whatsappSettings?.is_enabled && customerPhone) {
      try {
        const whatsappConfig = whatsappSettings.config as unknown as WhatsAppConfig;
        const smsMessage = getCustomerSmsMessage(
          newStatus,
          customerName,
          booking.package.title,
          bookingIdShort,
          booking.total_price,
          bookingId,
          notes
        );

        const toNumber = formatWhatsAppNumber(customerPhone);
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${whatsappConfig.account_sid}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('To', toNumber);
        formData.append('From', whatsappConfig.from_number);
        formData.append('Body', smsMessage);

        const authHeader = btoa(`${whatsappConfig.account_sid}:${whatsappConfig.auth_token}`);

        const whatsappResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${authHeader}`,
          },
          body: formData.toString(),
        });

        if (!whatsappResponse.ok) {
          const errorData = await whatsappResponse.json();
          throw new Error(`WhatsApp API error: ${errorData.message || JSON.stringify(errorData)}`);
        }

        results.whatsapp.sent = true;
        await supabase.from("notification_logs").insert({
          booking_id: bookingId,
          notification_type: `whatsapp_${newStatus}`,
          recipient: customerPhone,
          status: "sent",
        });
      } catch (whatsappError: any) {
        results.whatsapp.error = whatsappError.message;
        await supabase.from("notification_logs").insert({
          booking_id: bookingId,
          notification_type: `whatsapp_${newStatus}`,
          recipient: customerPhone,
          status: "failed",
          error_message: whatsappError.message,
        });
      }
    }

    // Send SMS to CUSTOMER
    if (smsSettings?.is_enabled && customerPhone) {
      try {
        const smsConfig = smsSettings.config as unknown as SMSConfig;
        const smsMessage = getCustomerSmsMessage(
          newStatus,
          customerName,
          booking.package.title,
          bookingIdShort,
          booking.total_price,
          bookingId,
          notes
        );

        console.log("Sending tracking SMS to CUSTOMER:", customerPhone);
        const smsResult = await sendBulkSMS(smsConfig.api_key, smsConfig.sender_id, customerPhone, smsMessage);
        
        if (smsResult.success) {
          results.sms.sent = true;
          console.log("Customer SMS sent successfully");
          
          await supabase.from("notification_logs").insert({
            booking_id: bookingId,
            notification_type: `sms_customer_${newStatus}`,
            recipient: customerPhone,
            status: "sent",
          });
        } else {
          throw new Error(smsResult.error || "SMS failed");
        }
      } catch (smsError: any) {
        results.sms.error = smsError.message;
        await supabase.from("notification_logs").insert({
          booking_id: bookingId,
          notification_type: `sms_customer_${newStatus}`,
          recipient: customerPhone,
          status: "failed",
          error_message: smsError.message,
        });
      }
    }

    // Send SMS to MANAGEMENT only for order_submitted
    if (newStatus === 'order_submitted' && smsSettings?.is_enabled) {
      try {
        const smsConfig = smsSettings.config as unknown as SMSConfig;
        const managementMessage = getManagementSmsMessage(
          customerName,
          customerPhone || "N/A",
          booking.package.title,
          bookingIdShort,
          booking.passenger_count,
          booking.total_price
        );

        console.log("Sending SMS to MANAGEMENT:", MANAGEMENT_PHONE);
        const smsResult = await sendBulkSMS(smsConfig.api_key, smsConfig.sender_id, MANAGEMENT_PHONE, managementMessage);
        
        if (smsResult.success) {
          results.managementSms.sent = true;
          console.log("Management SMS sent successfully");
          
          await supabase.from("notification_logs").insert({
            booking_id: bookingId,
            notification_type: "sms_management_new_booking",
            recipient: MANAGEMENT_PHONE,
            status: "sent",
          });
        } else {
          throw new Error(smsResult.error || "Management SMS failed");
        }
      } catch (smsError: any) {
        results.managementSms.error = smsError.message;
        await supabase.from("notification_logs").insert({
          booking_id: bookingId,
          notification_type: "sms_management_new_booking",
          recipient: MANAGEMENT_PHONE,
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

        const { subject, html } = getCustomerEmailTemplate(
          newStatus,
          customerName,
          booking.package.title,
          bookingIdShort,
          booking.total_price,
          booking.passenger_count,
          booking.travel_date,
          booking.package.duration_days,
          booking.package.type.charAt(0).toUpperCase() + booking.package.type.slice(1),
          bookingId,
          notes
        );

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
          subject,
          html
        );

        results.email.sent = true;
        console.log("Email sent successfully");

        await supabase.from("notification_logs").insert({
          booking_id: bookingId,
          notification_type: `email_${newStatus}`,
          recipient: customerEmail,
          status: "sent",
        });
      } catch (emailError: any) {
        console.error("Email sending error:", emailError);
        results.email.error = emailError.message;

        await supabase.from("notification_logs").insert({
          booking_id: bookingId,
          notification_type: `email_${newStatus}`,
          recipient: customerEmail,
          status: "failed",
          error_message: emailError.message,
        });
      }
    }

    console.log("Tracking notification results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-tracking-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
