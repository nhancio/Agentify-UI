import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return new Response(
        JSON.stringify({ error: "sessionId and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log("Retrieved session:", session.id, "metadata:", session.metadata);

    if (session.payment_status === "paid") {
      const { productId, email } = session.metadata;

      // Credit amounts per product
      const credits = {
        starter: 1000,
        professional: 7500,
        enterprise: 20000,
      };

      const creditsToAdd = credits[productId as keyof typeof credits] || 0;

      if (creditsToAdd > 0) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Update user credits
        const { data: existing } = await supabase
          .from("users")
          .select("credits")
          .eq("id", userId)
          .single();

        if (existing) {
          const newCredits = (existing.credits || 0) + creditsToAdd;
          await supabase
            .from("users")
            .update({ 
              credits: newCredits,
              updated_at: new Date().toISOString()
            })
            .eq("id", userId);

          return new Response(
            JSON.stringify({ 
              success: true, 
              credits: newCredits,
              creditsAdded: creditsToAdd,
              productId 
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          await supabase
            .from("users")
            .upsert({
              id: userId,
              email: email || null,
              credits: creditsToAdd,
            });

          return new Response(
            JSON.stringify({ 
              success: true, 
              credits: creditsToAdd,
              creditsAdded: creditsToAdd,
              productId 
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ error: "Payment not found or not completed" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Manual payment processing error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process payment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
