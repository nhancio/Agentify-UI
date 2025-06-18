/*
  # Twilio Webhook Handler
  
  Handles incoming calls and routes them to appropriate AI agents.
  Processes call events, recordings, and transcriptions.
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TwilioWebhookPayload {
  CallSid: string;
  From: string;
  To: string;
  CallStatus: string;
  Direction: string;
  RecordingUrl?: string;
  TranscriptionText?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const payload: TwilioWebhookPayload = {
      CallSid: formData.get('CallSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      CallStatus: formData.get('CallStatus') as string,
      Direction: formData.get('Direction') as string,
      RecordingUrl: formData.get('RecordingUrl') as string,
      TranscriptionText: formData.get('TranscriptionText') as string,
    }

    // Find the agent associated with this phone number
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, agents(*)')
      .eq('twilio_phone_number', payload.To)
      .single()

    if (!profile || !profile.agents?.length) {
      return new Response('No agent found for this number', { status: 404 })
    }

    const agent = profile.agents[0]

    // Handle different call statuses
    switch (payload.CallStatus) {
      case 'ringing':
      case 'in-progress':
        // Create or update call record
        await supabase
          .from('calls')
          .upsert({
            call_sid: payload.CallSid,
            agent_id: agent.id,
            from_number: payload.From,
            to_number: payload.To,
            status: payload.CallStatus === 'ringing' ? 'initiated' : 'in_progress',
            started_at: new Date().toISOString()
          })

        // Return TwiML response for agent greeting
        const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
          <Response>
            <Say voice="alice">${agent.greeting_message || 'Hello! Thank you for calling. How can I help you today?'}</Say>
            <Record 
              action="/functions/v1/handle-recording" 
              method="POST" 
              maxLength="300" 
              transcribe="true"
              transcribeCallback="/functions/v1/handle-transcription"
            />
          </Response>`

        return new Response(twimlResponse, {
          headers: { ...corsHeaders, 'Content-Type': 'application/xml' }
        })

      case 'completed':
        // Update call as completed
        await supabase
          .from('calls')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString()
          })
          .eq('call_sid', payload.CallSid)

        // Process recording if available
        if (payload.RecordingUrl) {
          await supabase
            .from('calls')
            .update({ recording_url: payload.RecordingUrl })
            .eq('call_sid', payload.CallSid)
        }

        break

      case 'failed':
      case 'busy':
      case 'no-answer':
        await supabase
          .from('calls')
          .update({
            status: 'failed',
            ended_at: new Date().toISOString()
          })
          .eq('call_sid', payload.CallSid)
        break
    }

    return new Response('OK', { headers: corsHeaders })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})