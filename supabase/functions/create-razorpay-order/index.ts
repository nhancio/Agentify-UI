import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: "Missing Razorpay credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON", details: e?.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { productId, userId, email } = body as { productId: string; userId?: string; email?: string };

    // Credit-based pricing structure with credits information
    const amountInInrByPlan: Record<string, { monthly: number; yearly: number }> = {
      starter: { monthly: 99, yearly: 99 },
      professional: { monthly: 499, yearly: 499 },
      enterprise: { monthly: 999, yearly: 999 },
    };

    const creditsByPlan: Record<string, { monthly: number; yearly: number }> = {
      starter: { monthly: 1000, yearly: 1000 },
      professional: { monthly: 7500, yearly: 7500 },
      enterprise: { monthly: 20000, yearly: 20000 },
    };

    const amountInInr = amountInInrByPlan[productId]?.[billingPeriod];
    if (!amountInInr) {
      return new Response(
        JSON.stringify({ error: "Invalid product/billing period" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const auth = btoa(`${keyId}:${keySecret}`);
    const receipt = `rcpt_${productId}_${billingPeriod}_${Date.now()}`;

    const createOrderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInInr * 100, // Convert to paise
        currency: "INR",
        receipt,
        payment_capture: 1,
        notes: { 
          productId,
          plan: productId,
          amount: amountInInr.toString(),
          credits: creditsByPlan[productId]?.["monthly"]?.toString() || "0",
          userId: userId ?? null,
          email: email ?? null
        },
      }),
    });

    if (!createOrderResponse.ok) {
      const errorText = await createOrderResponse.text();
      return new Response(
        JSON.stringify({ error: "Failed to create Razorpay order", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const order = await createOrderResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        keyId,
        order,
        planDetails: {
          productId,
          billingPeriod,
          amount: amountInInr,
          currency: "INR",
          credits: creditsByPlan[productId]?.[billingPeriod] || 0
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: err?.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

