# Complete Supabase Setup for VoiceGenie AI

## 1. Apply Database Migration

**Important:**  
If you run the migration SQL in the Supabase SQL Editor, you must run it in the **"Database"** context (not "Auth" or "Storage").  
If you see no tables created, check for errors in the SQL output.  
- Make sure you are using the **"Run"** button, not "Save".
- If you see errors about missing extensions or permissions, you may need to run `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` as a separate query first.

**Troubleshooting Steps:**
1. Open **SQL Editor** in Supabase.
2. Paste only this and run it first:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
3. Then paste the rest of your migration SQL and run it.
4. Check the **"Tables"** section in the sidebar to confirm tables are created.
5. If you see errors, check for typos or permission issues in your SQL.

In your Supabase dashboard:
1. Go to **SQL Editor**
2. Copy and paste the content from `supabase/migrations/20250608100237_yellow_dust.sql`
3. Click **Run** to create all tables and policies

## 2. Enable Authentication

In your Supabase dashboard:
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Disable **Email Confirmations** (for easier testing)
4. Set **Site URL** to: `http://localhost:5173`

## 3. Deploy Edge Functions (Optional for now)

These handle Twilio integration:
```bash
# Install Supabase CLI first
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref crgxuhxhgdftagpukrxu

# Deploy functions
supabase functions deploy handle-twilio-webhook
supabase functions deploy deploy-voice-agent
supabase functions deploy test-voice-agent
supabase functions deploy handle-transcription
```

## 4. Test the Setup

1. Start your development server: `npm run dev`
2. Go to `http://localhost:5173`
3. Try signing up with a test account
4. Check if you can access the dashboard

## 5. Add Additional Environment Variables (When Ready)

For full functionality, you'll need:
```env
# Twilio (for voice calls)
VITE_TWILIO_ACCOUNT_SID=your_twilio_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_token

# OpenAI (for AI processing)
VITE_OPENAI_API_KEY=your_openai_key

# Stripe (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_STRIPE_SECRET_KEY=your_stripe_secret

# D-ID (for video agents)
VITE_DID_API_KEY=your_did_key
```

## 6. Set Stripe Environment Variables for Edge Functions

To enable Stripe checkout, set these environment variables in your Supabase project:

1. Go to your Supabase dashboard → **Settings** → **Project Settings** → **Environment Variables**.
2. Add the following variables:

   ```
   STRIPE_SECRET_KEY=sk_test_...         # Your Stripe secret key
   CHECKOUT_SUCCESS_URL=http://localhost:5173/success   # For local development
   CHECKOUT_CANCEL_URL=http://localhost:5173/cancel     # For local development
   ```

   - For production, replace `localhost:5173` with your deployed frontend URL, e.g. `https://yourdomain.com/success`.

3. Save and **restart your Edge Functions** if needed.

**Note:**  
- `yourdomain.com` refers to your deployed frontend domain.  
- For local testing, use your local dev server URL as shown above.

## Current Priority: Steps 1 & 2

Focus on completing the database migration and authentication setup first. The app should then be fully functional for creating and managing voice agents (without actual calling functionality until Twilio is configured).