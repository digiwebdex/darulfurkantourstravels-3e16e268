import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppBusinessConfig {
  provider: string;
  api_key: string;
  phone_number_id: string;
  business_account_id: string;
  message_template?: string;
  welcome_message_enabled?: boolean;
  welcome_message_template?: string;
}

interface SendMessageRequest {
  to: string;
  message: string;
  testMode?: boolean;
}

const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle Bangladesh numbers
  if (cleaned.startsWith('0')) {
    cleaned = '880' + cleaned.substring(1);
  } else if (!cleaned.startsWith('880') && cleaned.length === 10) {
    cleaned = '880' + cleaned;
  }
  
  return cleaned;
};

const sendWhatsAppMessage = async (
  config: WhatsAppBusinessConfig,
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const formattedPhone = formatPhoneNumber(to);
    
    // Meta WhatsApp Business API endpoint
    const apiUrl = `https://graph.facebook.com/v18.0/${config.phone_number_id}/messages`;
    
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "text",
      text: {
        preview_url: false,
        body: message
      }
    };

    console.log("Sending WhatsApp message to:", formattedPhone);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    console.log("WhatsApp API response:", JSON.stringify(data));

    if (!response.ok) {
      const errorMessage = data.error?.message || JSON.stringify(data);
      throw new Error(`WhatsApp API error: ${errorMessage}`);
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error: any) {
    console.error("WhatsApp sending error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-whatsapp-business function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { to, message, testMode }: SendMessageRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, message" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get WhatsApp Business settings from database
    const { data: settings, error: settingsError } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("setting_type", "whatsapp")
      .single();

    if (settingsError || !settings) {
      console.error("WhatsApp settings not found:", settingsError);
      return new Response(
        JSON.stringify({ error: "WhatsApp settings not configured" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const config = settings.config as unknown as WhatsAppBusinessConfig;

    // Check if using Meta WhatsApp Business API
    if (config.provider !== "meta" || !config.api_key || !config.phone_number_id) {
      return new Response(
        JSON.stringify({ error: "Meta WhatsApp Business API not configured properly" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!settings.is_enabled && !testMode) {
      return new Response(
        JSON.stringify({ error: "WhatsApp notifications are disabled" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send the message
    const result = await sendWhatsAppMessage(config, to, message);

    // Log the notification
    await supabase.from("notification_logs").insert({
      booking_id: null,
      notification_type: testMode ? "whatsapp_test" : "whatsapp_message",
      recipient: to,
      status: result.success ? "sent" : "failed",
      error_message: result.error || null,
    });

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("WhatsApp message sent successfully, ID:", result.messageId);

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-whatsapp-business:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
