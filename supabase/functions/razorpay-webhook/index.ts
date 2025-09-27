import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      return new Response(JSON.stringify({ error: "Missing Razorpay key secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the webhook signature
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the webhook body
    const body = await req.text();
    
    // Verify webhook signature
    const crypto = await import("https://deno.land/std@0.177.0/crypto/mod.ts");
    const encoder = new TextEncoder();
    const message = encoder.encode(body);
    const key = encoder.encode(razorpayKeySecret);
    
    const hmacKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", hmacKey, message);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    
    if (signature !== expectedSignature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const payment = payload.payload.payment.entity;

    console.log(`Processing webhook event: ${event}`, { paymentId: payment.id });

    // Handle different webhook events
    switch (event) {
      case "payment.captured":
        await handlePaymentSuccess(payment);
        break;
      
      case "payment.failed":
        await handlePaymentFailure(payment);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handlePaymentSuccess(payment: any) {
  try {
    // Extract order details from payment notes
    const notes = payment.notes || {};
    const productId = notes.productId;
    const billingPeriod = notes.billingPeriod;
    const credits = parseInt(notes.credits) || 0;
    
    if (!productId || !billingPeriod) {
      console.error("Missing product details in payment notes");
      return;
    }

    // Here you would typically:
    // 1. Update user credits in your database
    // 2. Send confirmation email
    // 3. Log the successful payment
    
    console.log(`Payment successful for ${productId} ${billingPeriod} plan`, {
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      credits: credits
    });

    // TODO: Update user credits in your database
    // This would typically involve:
    // 1. Getting the user ID from the order or payment metadata
    // 2. Updating the user's credit balance
    // 3. Logging the credit purchase
    
    // Example implementation:
    // const supabase = createClient(
    //   Deno.env.get("SUPABASE_URL")!,
    //   Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    // );
    
    // const { data, error } = await supabase
    //   .from('users')
    //   .update({ 
    //     credits: supabase.sql`credits + ${credits}`,
    //     last_credit_purchase: new Date().toISOString()
    //   })
    //   .eq('id', userId);
    
    // if (error) {
    //   console.error("Failed to update user credits:", error);
    // } else {
    //   console.log(`Successfully added ${credits} credits to user ${userId}`);
    // }
    
  } catch (err) {
    console.error("Error handling payment success:", err);
  }
}

async function handlePaymentFailure(payment: any) {
  try {
    console.log(`Payment failed for order ${payment.order_id}`, {
      paymentId: payment.id,
      errorCode: payment.error_code,
      errorDescription: payment.error_description
    });

    // TODO: Handle failed payment (notify user, retry logic, etc.)
    
  } catch (err) {
    console.error("Error handling payment failure:", err);
  }
} 