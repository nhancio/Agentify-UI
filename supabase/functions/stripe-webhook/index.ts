import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    const sig = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig!,
        Deno.env.get("STRIPE_WEBHOOK_SECRET")!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { productId, userId, email } = session.metadata;

      console.log("Webhook received checkout.session.completed:", {
        productId,
        userId,
        email,
        sessionId: session.id
      });

      // Credit amounts per product
      const credits = {
        starter: 1000,
        professional: 7500,
        enterprise: 20000,
      };

      const creditsToAdd = credits[productId as keyof typeof credits] || 0;

      console.log("Credits to add:", creditsToAdd, "for productId:", productId);

      if (creditsToAdd > 0 && userId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Update user credits
        console.log("Updating credits for userId:", userId);
        
        const { data: existing } = await supabase
          .from("users")
          .select("credits")
          .eq("id", userId)
          .single();

        console.log("Existing user data:", existing);

        if (existing) {
          const newCredits = (existing.credits || 0) + creditsToAdd;
          console.log("Updating existing user credits from", existing.credits, "to", newCredits);
          
          const { error: updateError } = await supabase
            .from("users")
            .update({ 
              credits: newCredits,
              updated_at: new Date().toISOString()
            })
            .eq("id", userId);
            
          if (updateError) {
            console.error("Error updating user credits:", updateError);
          } else {
            console.log("Successfully updated user credits");
          }
        } else {
          console.log("Creating new user with credits:", creditsToAdd);
          
          const { error: upsertError } = await supabase
            .from("users")
            .upsert({
              id: userId,
              email: email || null,
              credits: creditsToAdd,
            });
            
          if (upsertError) {
            console.error("Error creating user:", upsertError);
          } else {
            console.log("Successfully created user with credits");
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
