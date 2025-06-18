/*
  # Transcription Handler
  
  Processes call transcriptions and extracts lead information using AI.
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const callSid = formData.get('CallSid') as string
    const transcriptionText = formData.get('TranscriptionText') as string

    // Update call with transcription
    const { data: call } = await supabase
      .from('calls')
      .update({ transcript: transcriptionText })
      .eq('call_sid', callSid)
      .select('*, agents(user_id)')
      .single()

    if (!call) {
      return new Response('Call not found', { status: 404 })
    }

    // Use OpenAI to extract lead information from transcript
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Extract lead information from this call transcript. Return JSON with:
            {
              "name": "caller name if mentioned",
              "email": "email if provided", 
              "phone": "phone if provided",
              "company": "company if mentioned",
              "interest_level": 1-10,
              "summary": "brief summary of the call",
              "sentiment": "positive/neutral/negative"
            }`
          },
          {
            role: 'user',
            content: transcriptionText
          }
        ],
        temperature: 0.3
      })
    })

    const aiResult = await openAIResponse.json()
    const leadData = JSON.parse(aiResult.choices[0].message.content)

    // Create lead record if we extracted useful information
    if (leadData.name || leadData.email || leadData.phone) {
      await supabase
        .from('leads')
        .insert({
          call_id: call.id,
          agent_id: call.agent_id,
          user_id: call.agents.user_id,
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company,
          interest_level: leadData.interest_level,
          notes: leadData.summary
        })
    }

    // Update call with AI summary and sentiment
    await supabase
      .from('calls')
      .update({
        summary: leadData.summary,
        sentiment_score: leadData.sentiment === 'positive' ? 0.8 : 
                        leadData.sentiment === 'negative' ? 0.2 : 0.5
      })
      .eq('id', call.id)

    return new Response('OK', { headers: corsHeaders })

  } catch (error) {
    console.error('Transcription processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})