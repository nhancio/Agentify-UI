import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

interface TwilioWebhookPayload {
  CallSid: string
  From: string
  To: string
  CallStatus: string
  Direction: string
  RecordingUrl?: string
  TranscriptionText?: string
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const bodyText = await req.text()
    const params = new URLSearchParams(bodyText)

    const payload: TwilioWebhookPayload = {
      CallSid: params.get("CallSid")!,
      From: params.get("From")!,
      To: params.get("To")!,
      CallStatus: params.get("CallStatus")!,
      Direction: params.get("Direction")!,
      RecordingUrl: params.get("RecordingUrl") ?? undefined,
      TranscriptionText: params.get("TranscriptionText") ?? undefined,
    }

    // Get agent info by phone number
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?twilio_phone_number=eq.${payload.To}&select=id,agents(*)&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    )
    const profileData = await profileRes.json()
    const profile = profileData[0]

    if (!profile || !profile.agents?.length) {
      return new Response("No agent found for this number", { status: 404 })
    }

    const agent = profile.agents[0]

    const now = new Date().toISOString()

    switch (payload.CallStatus) {
      case "ringing":
      case "in-progress": {
        // Create or update the call record
        await fetch(`${SUPABASE_URL}/rest/v1/calls`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            call_sid: payload.CallSid,
            agent_id: agent.id,
            from_number: payload.From,
            to_number: payload.To,
            status: payload.CallStatus === "ringing" ? "initiated" : "in_progress",
            started_at: now,
          }),
        })

        // Respond with TwiML
        const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${agent.greeting_message || "Hello! Thank you for calling. How can I help you today?"}</Say>
  <Record 
    action="/functions/v1/handle-recording" 
    method="POST" 
    maxLength="300" 
    transcribe="true"
    transcribeCallback="/functions/v1/handle-transcription"
  />
</Response>`

        return new Response(twimlResponse, {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/xml",
          },
        })
      }

      case "completed": {
        await fetch(`${SUPABASE_URL}/rest/v1/calls?call_sid=eq.${payload.CallSid}`, {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "completed",
            ended_at: now,
            ...(payload.RecordingUrl ? { recording_url: payload.RecordingUrl } : {}),
          }),
        })
        break
      }

      case "failed":
      case "busy":
      case "no-answer": {
        await fetch(`${SUPABASE_URL}/rest/v1/calls?call_sid=eq.${payload.CallSid}`, {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "failed",
            ended_at: now,
          }),
        })
        break
      }
    }

    return new Response("OK", { headers: corsHeaders })
  } catch (err) {
    console.error("Webhook error:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    })
  }
})
