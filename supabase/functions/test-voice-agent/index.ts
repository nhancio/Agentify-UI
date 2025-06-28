/*
  # Test Voice Agent
  
  Initiates a test call to verify agent functionality.
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface TestRequest {
  agentId: string;
  testPhoneNumber: string;
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

    const { agentId, testPhoneNumber }: TestRequest = await req.json()

    // Get agent details
    const { data: agent } = await supabase
      .from('agents')
      .select('*, profiles(twilio_phone_number)')
      .eq('id', agentId)
      .single()

    if (!agent) {
      throw new Error('Agent not found')
    }

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured')
    }

    // Initiate test call
    const callResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: agent.profiles.twilio_phone_number || '+15551234567',
          To: testPhoneNumber,
          Url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-twilio-webhook`,
          Method: 'POST'
        })
      }
    )

    if (!callResponse.ok) {
      throw new Error('Failed to initiate test call')
    }

    const callData = await callResponse.json()

    return new Response(
      JSON.stringify({
        callSid: callData.sid,
        status: callData.status,
        message: 'Test call initiated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Test call error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})