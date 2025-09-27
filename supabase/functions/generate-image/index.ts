import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ImageGenerationRequest {
  prompt: string;
  apiProvider: 'gpt5' | 'google_imagen' | 'gemini'; // 'qwen' removed but can be re-added
  userId: string;
}

interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  generationId?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, apiProvider, userId }: ImageGenerationRequest = await req.json();

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

    // Check user credits (require at least 5)
    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .maybeSingle();

    if (userErr) {
      console.error("Error fetching user credits:", userErr);
      return new Response(
        JSON.stringify({ success: false, error: "Unable to verify credits" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const availableCredits = userRow?.credits ?? 0;
    console.log(`[generate-image] userId=${userId} availableCredits=${availableCredits}`);
    const costPerImage = 5;
    if (availableCredits < costPerImage) {
      return new Response(
        JSON.stringify({ success: false, error: "Insufficient credits. You need at least 5 credits." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let imageUrl: string | null = null;
    let errorMessage: string | null = null;

    try {
      // Map provider for storage to satisfy DB check constraint
      const providerForStorage = apiProvider === 'gemini' ? 'google_imagen' : apiProvider;
      
      // Route to appropriate image generation service
      if (apiProvider === 'gemini') {
        console.log(`[generate-image] Using Gemini for provider=${apiProvider}`);
        imageUrl = await generateWithGemini(prompt);
      } else if (apiProvider === 'google_imagen') {
        console.log(`[generate-image] Using Google Imagen for provider=${apiProvider}`);
        imageUrl = await generateWithGoogleImagen(prompt);
      // } else if (apiProvider === 'qwen') {
      //   console.log(`[generate-image] Using Qwen for provider=${apiProvider}`);
      //   imageUrl = await generateWithQwen(prompt);
      } else {
        console.log(`[generate-image] Using OpenAI gpt-image-1 for provider=${apiProvider}`);
        imageUrl = await generateWithGPT5(prompt);
      }

      // Optionally upload to Supabase Storage if configured
      let finalUrl = imageUrl;
      try {
        const shouldUpload = Boolean(Deno.env.get('STORE_IMAGES_TO_SUPABASE'));
        if (shouldUpload && imageUrl) {
          const bucket = Deno.env.get('IMAGES_BUCKET') || 'generated-images';
          const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;

          let bytes: Uint8Array;
          if (imageUrl.startsWith('data:')) {
            const base64 = imageUrl.split(',')[1] || '';
            bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          } else {
            const resp = await fetch(imageUrl);
            bytes = new Uint8Array(await resp.arrayBuffer());
          }

          const uploadRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/storage/v1/object/${bucket}/${fileName}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'image/png',
            },
            body: bytes,
          });

          if (uploadRes.ok) {
            finalUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/${bucket}/${fileName}`;
          } else {
            console.error('Storage upload failed:', await uploadRes.text());
          }
        }
      } catch (e) {
        console.error('Storage upload error:', e);
      }

      // Insert completed record only
      const nowIso = new Date().toISOString();
      const { data: completedRow, error: completedInsertError } = await supabase
        .from("image_generations")
        .insert({
          user_id: userId,
          prompt: prompt,
          api_provider: providerForStorage,
          image_url: finalUrl,
          status: "completed",
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select()
        .single();

      if (completedInsertError) {
        console.error("Error saving completed generation:", completedInsertError, {
          user_id: userId,
          api_provider: providerForStorage,
          has_url: Boolean(imageUrl),
        });
        return new Response(
          JSON.stringify({ success: false, error: "Failed to save generated image" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Deduct credits after successful generation
      const newCredits = Math.max(0, availableCredits - costPerImage);
      console.log(`[generate-image] Deducting cost=${costPerImage} credits. New balance=${newCredits} for userId=${userId}`);
      const { error: creditUpdateErr } = await supabase
        .from("users")
        .update({ credits: newCredits, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (creditUpdateErr) {
        console.error("Failed to deduct credits after image generation:", creditUpdateErr);
        // Do not fail the response; image was generated. Consider logging for reconciliation.
      }

      return new Response(
        JSON.stringify({
          success: true,
          imageUrl: imageUrl,
          generationId: completedRow.id
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error generating image with ${apiProvider}:`, error);

      // Do not store failed generations
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Image generation function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// GPT-5 Image Generation (via OpenAI DALL-E 3)
async function generateWithGPT5(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const url: string | undefined = data?.data?.[0]?.url;
  if (url) {
    return url;
  }
  const b64: string | undefined = data?.data?.[0]?.b64_json;
  if (b64) {
    return `data:image/png;base64,${b64}`;
  }
  throw new Error("OpenAI response did not include an image URL or base64 image");
}

// Google Imagen Generation
async function generateWithGoogleImagen(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("GOOGLE_IMAGEN_API_KEY");
  if (!apiKey) {
    throw new Error("Google Imagen API key not configured");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt,
      config: {
        language: "en",
        includeRaiReason: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Imagen API error: ${error}`);
  }

  const data = await response.json();
  const base64 = data.generatedImages?.[0]?.imageBase64 as string | undefined;
  if (!base64) {
    throw new Error("Google Imagen did not return an image");
  }
  // Return a data URL so the frontend can render and download it directly
  return `data:image/png;base64,${base64}`;
}

// Qwen Image Generation (commented out - can be re-enabled if needed)
// async function generateWithQwen(prompt: string): Promise<string> {
//   const apiKey = Deno.env.get("QWEN_API_KEY");
//   if (!apiKey) {
//     throw new Error("Qwen API key not configured");
//   }

//   const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis", {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${apiKey}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: "wanx-v1",
//       input: {
//         prompt: prompt,
//         negative_prompt: "nsfw, low quality, blurry",
//         style: "realistic",
//       },
//       parameters: {
//         size: "1024*1024",
//         n: 1,
//         seed: Math.floor(Math.random() * 1000000),
//       },
//     }),
//   });

//   if (!response.ok) {
//     const error = await response.text();
//     throw new Error(`Qwen API error: ${error}`);
//   }

//   const data = await response.json();
//   return data.output.results[0].url;
// }

async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  // Use Gemini's image generation API
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Generate an image: ${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  
  // Check if the response contains an image
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    const parts = data.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inline_data && part.inline_data.data) {
        // Convert base64 to data URL
        return `data:image/png;base64,${part.inline_data.data}`;
      }
    }
  }
  
  // If no image found, fallback to a placeholder or throw error
  throw new Error("No image generated by Gemini");
}
