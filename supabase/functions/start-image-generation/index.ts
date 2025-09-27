import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface StartRequestBody {
  prompt: string;
  apiProvider: 'gpt5' | 'google_imagen' | 'qwen';
  userId: string;
}

interface StartResponseBody {
  success: boolean;
  generationId?: string;
  requestId?: string;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, apiProvider, userId }: StartRequestBody = await req.json();

    if (!prompt || !apiProvider || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create a pending generation record
    const { data: generation, error: insertError } = await supabase
      .from("image_generations")
      .insert({
        user_id: userId,
        prompt,
        api_provider: apiProvider,
        status: "pending"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating generation record:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create generation record" } satisfies StartResponseBody),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Kick off provider job - provider endpoints pulled from env for flexibility
    const submitUrl = getProviderSubmitUrl(apiProvider);
    const apiKey = getProviderApiKey(apiProvider);

    const response = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      await supabase
        .from("image_generations")
        .update({ status: "failed", error_message: `Submit failed: ${errorText}` })
        .eq("id", generation.id);

      return new Response(
        JSON.stringify({ success: false, error: "Provider submit failed" } satisfies StartResponseBody),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submitData = await response.json();
    const requestId: string | undefined = submitData.request_id || submitData.requestId || submitData.id;

    if (!requestId) {
      await supabase
        .from("image_generations")
        .update({ status: "failed", error_message: "No request_id returned by provider" })
        .eq("id", generation.id);

      return new Response(
        JSON.stringify({ success: false, error: "No request_id from provider" } satisfies StartResponseBody),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return the generation id and request id to the client
    return new Response(
      JSON.stringify({ success: true, generationId: generation.id, requestId } satisfies StartResponseBody),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("start-image-generation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" } satisfies StartResponseBody),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getProviderSubmitUrl(provider: StartRequestBody['apiProvider']): string {
  switch (provider) {
    case 'gpt5':
      return Deno.env.get('IMAGE_SUBMIT_URL_GPT5') ?? '';
    case 'google_imagen':
      return Deno.env.get('IMAGE_SUBMIT_URL_GOOGLE') ?? '';
    case 'qwen':
      return Deno.env.get('IMAGE_SUBMIT_URL_QWEN') ?? '';
  }
}

function getProviderApiKey(provider: StartRequestBody['apiProvider']): string | undefined {
  switch (provider) {
    case 'gpt5':
      return Deno.env.get('OPENAI_API_KEY');
    case 'google_imagen':
      return Deno.env.get('GOOGLE_IMAGEN_API_KEY');
    case 'qwen':
      return Deno.env.get('QWEN_API_KEY');
  }
}


