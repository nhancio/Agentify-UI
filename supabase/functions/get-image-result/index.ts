import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ResultRequestBody {
  requestId: string;
  generationId: string;
  apiProvider: 'gpt5' | 'google_imagen' | 'qwen';
}

interface ResultResponseBody {
  success: boolean;
  status?: 'pending' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { requestId, generationId, apiProvider }: ResultRequestBody = await req.json();
    if (!requestId || !generationId || !apiProvider) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const pollUrl = getProviderPollUrl(apiProvider, requestId);
    const apiKey = getProviderApiKey(apiProvider);

    const response = await fetch(pollUrl, {
      method: "GET",
      headers: {
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ success: false, error: `Provider poll failed: ${errorText}` } satisfies ResultResponseBody),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const status: 'pending' | 'completed' | 'failed' = mapProviderStatus(apiProvider, data);
    let imageUrl: string | undefined;

    if (status === 'completed') {
      imageUrl = extractImageUrl(apiProvider, data);
      await supabase
        .from('image_generations')
        .update({ status: 'completed', image_url: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', generationId);
    } else if (status === 'failed') {
      const errorMsg = typeof data?.error === 'string' ? data.error : 'Generation failed';
      await supabase
        .from('image_generations')
        .update({ status: 'failed', error_message: errorMsg, updated_at: new Date().toISOString() })
        .eq('id', generationId);
    }

    return new Response(
      JSON.stringify({ success: true, status, imageUrl } satisfies ResultResponseBody),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('get-image-result error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' } satisfies ResultResponseBody),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getProviderPollUrl(provider: ResultRequestBody['apiProvider'], requestId: string): string {
  switch (provider) {
    case 'gpt5':
      return `${Deno.env.get('IMAGE_POLL_URL_GPT5') ?? ''}/${requestId}`;
    case 'google_imagen':
      return `${Deno.env.get('IMAGE_POLL_URL_GOOGLE') ?? ''}/${requestId}`;
    case 'qwen':
      return `${Deno.env.get('IMAGE_POLL_URL_QWEN') ?? ''}/${requestId}`;
  }
}

function getProviderApiKey(provider: ResultRequestBody['apiProvider']): string | undefined {
  switch (provider) {
    case 'gpt5':
      return Deno.env.get('OPENAI_API_KEY');
    case 'google_imagen':
      return Deno.env.get('GOOGLE_IMAGEN_API_KEY');
    case 'qwen':
      return Deno.env.get('QWEN_API_KEY');
  }
}

function mapProviderStatus(provider: ResultRequestBody['apiProvider'], payload: any): 'pending' | 'completed' | 'failed' {
  switch (provider) {
    case 'gpt5':
      return payload?.status === 'succeeded' ? 'completed' : payload?.status === 'failed' ? 'failed' : 'pending';
    case 'google_imagen':
      return payload?.state === 'DONE' ? 'completed' : payload?.state === 'ERROR' ? 'failed' : 'pending';
    case 'qwen':
      return payload?.status === 'SUCCESS' ? 'completed' : payload?.status === 'FAILED' ? 'failed' : 'pending';
  }
}

function extractImageUrl(provider: ResultRequestBody['apiProvider'], payload: any): string | undefined {
  switch (provider) {
    case 'gpt5':
      return payload?.result?.url ?? payload?.data?.[0]?.url;
    case 'google_imagen':
      return payload?.imageUrl ?? payload?.result?.images?.[0]?.url;
    case 'qwen':
      return payload?.output?.results?.[0]?.url ?? payload?.data?.url;
  }
}


