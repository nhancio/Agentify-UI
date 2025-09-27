import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
};

interface SubmitBody {
  userId: string;
  mode?: "i2v" | "t2v";
  inputImageUrl?: string;
  motionVideoUrl?: string;
  prompt?: string;
  resolution?: "480p" | "720p" | "1080p";
  durationSeconds?: number;
}

serve(async (req: Request) => {
  console.log("🚀🚀🚀 NEW VERSION 31 DEPLOYED - wavespeed-wan-animate function called 🚀🚀🚀");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("WAVESPEED_API_KEY");
  console.log("=== API KEY DEBUGGING ===");
  console.log("WaveSpeed API Key found:", !!apiKey);
  console.log("API Key length:", apiKey?.length || 0);
  console.log("API Key starts with:", apiKey?.substring(0, 10) || "N/A");
  console.log("API Key ends with:", apiKey?.substring(apiKey.length - 4) || "N/A");
  console.log("Full API Key (first 20 chars):", apiKey?.substring(0, 20) || "N/A");
  console.log("Expected to end with: a976");
  console.log("Full API Key:", apiKey);
  console.log("=========================");
  if (!apiKey) {
    console.error("Missing WAVESPEED_API_KEY");
    return new Response(JSON.stringify({ error: "Missing WAVESPEED_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const sb = createClient(supabaseUrl, serviceKey);

  try {
    const url = new URL(req.url);

    const isTargetPath =
      url.pathname.endsWith("/wavespeed-wan-animate") ||
      url.pathname.endsWith("/swift-action");

    if (req.method === "POST" && isTargetPath) {
      console.log("Processing POST request");
      // Safely parse JSON body
      let body: SubmitBody | null = null;
      try {
        const text = await req.text();
        console.log("Request body text:", text);
        body = text ? (JSON.parse(text) as SubmitBody) : null;
        console.log("Parsed body:", body);
      } catch (e) {
        console.error("JSON parse error:", e);
        body = null;
      }
      if (!body) {
        console.error("Invalid or empty JSON body");
        return new Response(JSON.stringify({ error: "Invalid or empty JSON body" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const mode = body.mode || "i2v";
      if (mode === "i2v" && (!body.inputImageUrl || !body.motionVideoUrl)) {
        return new Response(JSON.stringify({ error: "Missing inputImageUrl or motionVideoUrl" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (mode === "t2v" && (!body.prompt || !body.prompt.trim())) {
        return new Response(JSON.stringify({ error: "Missing prompt for text-to-video" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check credits and decrement atomically (cost = 25)
      console.log("Checking credits for user:", body.userId);
      const { data: userRow, error: selErr } = await sb
        .from("users")
        .select("credits")
        .eq("id", body.userId)
        .single();
      if (selErr) {
        console.error("Error fetching user credits:", selErr);
        throw selErr;
      }
      console.log("User row:", userRow);
      const cost = 25;
      if (!userRow || (userRow.credits ?? 0) < cost) {
        console.log("Insufficient credits");
        return new Response(JSON.stringify({ success: false, error: "Insufficient credits" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: updErr } = await sb.rpc("decrement_user_credits", { p_user_id: body.userId, p_cost: cost });
      if (updErr) {
        // Fallback if RPC not available
        const { error: updDirectErr } = await sb
          .from("users")
          .update({ credits: (userRow.credits ?? 0) - cost })
          .eq("id", body.userId);
        if (updDirectErr) throw updDirectErr;
      }

      // Insert pending job
      console.log("Inserting job record");
      const { data: job, error: insErr } = await sb
        .from("video_generations")
        .insert({
          user_id: body.userId,
          prompt: body.prompt ?? null,
          api_provider: "alibaba_wan_2_2",
          input_image_url: body.inputImageUrl || null,
          motion_video_url: body.motionVideoUrl || null,
          status: "pending",
        })
        .select()
        .single();
      if (insErr) {
        console.error("Error inserting job:", insErr);
        throw insErr;
      }
      console.log("Job inserted:", job);

      // Call WaveSpeed depending on mode
      const payload =
        mode === "t2v"
          ? {
              model: "alibaba/wan-2.5/text-to-video",
              input: {
                prompt: body.prompt ?? "",
                resolution: body.resolution ?? "480p",
                duration_seconds: body.durationSeconds ?? 5,
              },
            }
          : {
              model: "wavespeed-ai/wan-2.2/i2v-480p",
              input: {
                image_url: body.inputImageUrl,
                motion_video_url: body.motionVideoUrl,
                prompt: body.prompt ?? undefined,
                resolution: body.resolution ?? "480p",
              },
            };

      console.log("WaveSpeed payload:", JSON.stringify(payload, null, 2));
      console.log("Calling WaveSpeed API...");
      console.log("API Key being used:", apiKey?.substring(0, 10) + "...");
      console.log("Authorization header:", `Bearer ${apiKey?.substring(0, 10)}...`);
      
      let submitRes;
      let submitJson;
      
      try {
        submitRes = await fetch("https://api.wave.com/v1/predictions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });
      
        console.log("WaveSpeed API response status:", submitRes.status);
        console.log("WaveSpeed API response headers:", Object.fromEntries(submitRes.headers.entries()));
      
        try {
          const responseText = await submitRes.text();
          console.log("WaveSpeed API response body:", responseText);
          submitJson = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error("Failed to parse WaveSpeed response:", parseError);
          await sb
            .from("video_generations")
            .update({ status: "failed", error_message: "Invalid response from WaveSpeed API" })
            .eq("id", job.id);
          return new Response(JSON.stringify({ success: false, error: "Invalid response from WaveSpeed API" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (fetchError) {
        console.error("Failed to call WaveSpeed API:", fetchError);
        await sb
          .from("video_generations")
          .update({ status: "failed", error_message: "Failed to call WaveSpeed API" })
          .eq("id", job.id);
        return new Response(JSON.stringify({ success: false, error: "Failed to call WaveSpeed API" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (!submitRes.ok) {
        await sb
          .from("video_generations")
          .update({ status: "failed", error_message: submitJson?.error ?? "submit failed" })
          .eq("id", job.id);
        return new Response(JSON.stringify({ success: false, error: submitJson?.error || "WaveSpeed submit failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Polling WaveSpeed prediction
      const predictionId = submitJson?.id || submitJson?.prediction_id || submitJson?.data?.id;
      let outputUrl: string | null = null;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const res = await fetch(`https://api.wave.com/v1/predictions/${predictionId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        
        let json;
        try {
          const responseText = await res.text();
          json = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error("Failed to parse prediction response:", parseError);
          continue; // Skip this iteration and try again
        }
        const status = json?.status;
        if (status === "succeeded" || status === "completed") {
          outputUrl = json?.output_url || json?.output?.video_url || json?.output?.[0];
          break;
        }
        if (status === "failed" || status === "canceled") {
          await sb
            .from("video_generations")
            .update({ status: "failed", error_message: json?.error || "generation failed" })
            .eq("id", job.id);
          return new Response(JSON.stringify({ success: false, error: json?.error || "Generation failed" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (!outputUrl) {
        await sb
          .from("video_generations")
          .update({ status: "failed", error_message: "Timed out waiting for result" })
          .eq("id", job.id);
        return new Response(JSON.stringify({ success: false, error: "Timed out" }), {
          status: 504,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await sb
        .from("video_generations")
        .update({ status: "completed", output_video_url: outputUrl })
        .eq("id", job.id);

      return new Response(JSON.stringify({ success: true, id: job.id, output: outputUrl }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && isTargetPath) {
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "Missing id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const resultRes = await fetch(
        `https://api.wave.com/v1/predictions/${id}/result`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
      
      let json;
      try {
        const responseText = await resultRes.text();
        json = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse result response:", parseError);
        return new Response(JSON.stringify({ error: "Invalid response from WaveSpeed API" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(json), {
        status: resultRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[wavespeed-wan-animate] Unexpected error:", error);
    console.error("[wavespeed-wan-animate] Error stack:", error?.stack);
    console.error("[wavespeed-wan-animate] Error message:", error?.message);
    return new Response(JSON.stringify({ 
      error: "Unexpected error", 
      details: error?.message,
      stack: error?.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
