import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, secret_key, role = "admin" } = await req.json();

    // Validate secret key from environment variable
    const expectedSecret = Deno.env.get("SETUP_ADMIN_SECRET");
    if (!expectedSecret || secret_key !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role
    const validRoles = ["admin", "demo_admin"];
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be 'admin' or 'demo_admin'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    const displayName = role === "demo_admin" ? "Demo Admin" : "Super Admin";

    if (existingUser) {
      // User exists, just update their profile to the specified role
      const { error: updateError } = await adminClient
        .from("profiles")
        .update({ role: role })
        .eq("id", existingUser.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Existing user promoted to ${role}`,
          user_id: existingUser.id,
          email: existingUser.email,
          role: role
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new user with admin API
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update profile to the specified role
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ role: role })
      .eq("id", newUser.user!.id);

    if (profileError) {
      console.error("Error updating profile to role:", profileError);
      // Try to insert if update failed (profile might not exist yet)
      await adminClient
        .from("profiles")
        .upsert({
          id: newUser.user!.id,
          email: email,
          full_name: displayName,
          role: role
        });
    }

    console.log(`${displayName} created successfully:`, newUser.user?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${displayName} created successfully`,
        user_id: newUser.user?.id,
        email: newUser.user?.email,
        role: role
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in setup-super-admin:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
