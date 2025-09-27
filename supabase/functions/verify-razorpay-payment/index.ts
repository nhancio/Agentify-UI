import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const hex: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const current = bytes[i].toString(16).padStart(2, "0");
    hex.push(current);
  }
  return hex.join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!keySecret) {
      return new Response(
        JSON.stringify({ error: "Missing Razorpay key secret" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase credentials" }),
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

    const { orderId, paymentId, signature, userId: userIdFromClient, email: emailFromClient } = body as {
      orderId: string;
      paymentId: string;
      signature: string;
      userId?: string;
      email?: string;
    };

    if (!orderId || !paymentId || !signature) {
      return new Response(
        JSON.stringify({ error: "Missing verification fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const message = `${orderId}|${paymentId}`;
    const enc = new TextEncoder();

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(keySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
    const expectedSignature = toHex(signatureBuffer);

    const valid = expectedSignature === signature;

    // If payment is valid and we have a userId, update the user's credits
    if (valid) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Get the order details to determine credits to add
        const keyId = Deno.env.get("RAZORPAY_KEY_ID");
        const auth = btoa(`${keyId}:${keySecret}`);
        
        const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        });

        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          const notes = orderData?.notes ?? {};
          const creditsToAdd = Number.parseInt(String(notes.credits ?? '0'), 10) || 0;
          console.log('Razorpay order notes:', notes, 'creditsToAdd:', creditsToAdd);
          const resolvedUserId = String(notes.userId || userIdFromClient || '').trim();
          const resolvedEmail = String(notes.email || emailFromClient || '').trim() || null;

          if (creditsToAdd > 0 && resolvedUserId) {
            // If the user row exists, increment; otherwise create it with initial credits
            const { data: existing, error: fetchErr } = await supabase
              .from('users')
              .select('id, credits')
              .eq('id', resolvedUserId)
              .maybeSingle();

            if (fetchErr) {
              console.error('Error fetching user row before credit update:', fetchErr);
            }

            if (existing) {
              const newCredits = (existing.credits ?? 0) + creditsToAdd;
              const { error: updateError } = await supabase
                .from('users')
                .update({ 
                  credits: newCredits,
                  updated_at: new Date().toISOString()
                })
                .eq('id', resolvedUserId);

              if (updateError) {
                console.error('Error updating user credits:', updateError);
              } else {
                console.log(`Successfully added ${creditsToAdd} credits to user ${resolvedUserId}`);
              }
            } else {
              const { error: upsertError } = await supabase
                .from('users')
                .upsert([{ id: resolvedUserId, email: resolvedEmail, credits: creditsToAdd }], { onConflict: 'id' });
              if (upsertError) {
                console.error('Error upserting user credits:', upsertError);
              } else {
                console.log(`Created user row and added ${creditsToAdd} credits for user ${resolvedUserId}`);
              }
            }
          }
        } else {
          const txt = await orderResponse.text();
          console.error('Failed to fetch order from Razorpay:', txt);
        }
      } catch (error) {
        console.error('Error updating user credits:', error);
        // Don't fail the payment verification, just log the error
      }
    }

    return new Response(
      JSON.stringify({ 
        valid,
        message: valid ? "Payment verified successfully" : "Payment verification failed"
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

