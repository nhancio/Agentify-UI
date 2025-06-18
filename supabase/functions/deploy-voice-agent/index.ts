/*
  # Deploy Voice Agent to Twilio
  
  Creates Twilio phone number and configures webhooks for voice agent.
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeployRequest {
  agentId: string;
  agent: any;
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

    const { agentId, agent }: DeployRequest = await req.json()

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured')
    }

    // Purchase a phone number from Twilio
    const phoneNumberResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          PhoneNumber: '+15551234567', // This would be dynamic in production
          VoiceUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-twilio-webhook`,
          VoiceMethod: 'POST',
          StatusCallback: `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-twilio-webhook`,
          StatusCallbackMethod: 'POST'
        })
      }
    )

    if (!phoneNumberResponse.ok) {
      throw new Error('Failed to purchase phone number from Twilio')
    }

    const phoneNumberData = await phoneNumberResponse.json()

    // Update user profile with assigned phone number
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', agent.user_id)
      .single()

    if (profile) {
      await supabase
        .from('profiles')
        .update({ twilio_phone_number: phoneNumberData.phone_number })
        .eq('id', agent.user_id)
    }

    // Create webhook URL for this specific agent
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-twilio-webhook`

    return new Response(
      JSON.stringify({
        phoneNumber: phoneNumberData.phone_number,
        webhookUrl: webhookUrl,
        sid: phoneNumberData.sid
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Deploy error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})