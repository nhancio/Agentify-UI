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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("WAVESPEED_API_KEY");
  if (!apiKey) {
    console.error("Missing WAVESPEED_API_KEY environment variable");
    return new Response(JSON.stringify({ error: "Missing WAVESPEED_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  console.log("WaveSpeed API key found, length:", apiKey.length);

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
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);

    const isTargetPath =
      url.pathname.endsWith("/wavespeed-wan-animate") ||
      url.pathname.endsWith("/swift-action");

    console.log("Is target path:", isTargetPath);

    if (req.method === "POST" && isTargetPath) {
      // Safely parse JSON body
      let body: SubmitBody | null = null;
      try {
        const text = await req.text();
        console.log("Request body text:", text);
        body = text ? (JSON.parse(text) as SubmitBody) : null;
        console.log("Parsed body:", body);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        body = null;
      }
      if (!body) {
        return new Response(JSON.stringify({ error: "Invalid or empty JSON body" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const mode = body.mode || "i2v";
      console.log("Mode:", mode);
      if (mode === "i2v" && (!body.inputImageUrl || !body.motionVideoUrl)) {
        console.log("Missing i2v inputs");
        return new Response(JSON.stringify({ error: "Missing inputImageUrl or motionVideoUrl" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (mode === "t2v" && (!body.prompt || !body.prompt.trim())) {
        console.log("Missing t2v prompt");
        return new Response(JSON.stringify({ error: "Missing prompt for text-to-video" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check credits (do NOT deduct yet)
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

      const submitRes = await fetch("https://api.wave.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      
      let submitJson;
      try {
        const responseText = await submitRes.text();
        console.log("WaveSpeed API response status:", submitRes.status);
        console.log("WaveSpeed API response text (first 200 chars):", responseText.substring(0, 200));
        
        if (!submitRes.ok) {
          console.error("WaveSpeed API error response:", responseText);
          await sb
            .from("video_generations")
            .update({ status: "failed", error_message: `WaveSpeed API error: ${submitRes.status} - ${responseText.substring(0, 100)}` })
            .eq("id", job.id);
          return new Response(JSON.stringify({ success: false, error: `WaveSpeed API error: ${submitRes.status}` }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        submitJson = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse WaveSpeed response:", parseError);
        console.error("Raw response:", await submitRes.text());
        await sb
          .from("video_generations")
          .update({ status: "failed", error_message: "Invalid response from WaveSpeed API" })
          .eq("id", job.id);
        return new Response(JSON.stringify({ success: false, error: "Invalid response from WaveSpeed API" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // At this point, submission succeeded. Deduct credits now.
      {
        const { error: updErr } = await sb.rpc("decrement_user_credits", { p_user_id: body.userId, p_cost: cost });
        if (updErr) {
          const { error: updDirectErr } = await sb
            .from("users")
            .update({ credits: (userRow.credits ?? 0) - cost })
            .eq("id", body.userId);
          if (updDirectErr) throw updDirectErr;
        }
      }

      // Polling simple loop (short)
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
          // Refund on failure
          await sb
            .from("users")
            .update({ credits: (userRow.credits ?? 0) })
            .eq("id", body.userId);
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
        // Refund on timeout
        await sb
          .from("users")
          .update({ credits: (userRow.credits ?? 0) })
          .eq("id", body.userId);
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
        `https://api.wavespeed.ai/api/v3/predictions/${id}/result`,
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
    console.error("[wavespeed-wan-animate]", error);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
