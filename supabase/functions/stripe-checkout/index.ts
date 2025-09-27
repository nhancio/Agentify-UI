import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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
    const { productId, userId, email } = await req.json();

    console.log("Stripe checkout request:", { productId, userId, email });

    if (!productId) {
      return new Response(
        JSON.stringify({ error: "productId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Get price ID
    const priceId = Deno.env.get(`STRIPE_PRICE_ID_${productId.toUpperCase()}`);
    console.log("Price ID for", productId, ":", priceId);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: Deno.env.get("STRIPE_SUCCESS_URL") || "http://localhost:5173/success",
      cancel_url: Deno.env.get("STRIPE_CANCEL_URL") || "http://localhost:5173/billing",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        productId: productId,
        userId: userId || "",
        email: email || "",
      },
      customer_email: email || undefined,
      payment_method_types: ["card"],
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic",
        },
      },
    });

    console.log("Created Stripe session:", session.id, "with metadata:", session.metadata);

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
