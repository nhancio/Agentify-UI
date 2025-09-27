#!/bin/bash

echo "🚀 Deploying Razorpay Integration to Supabase..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Deploy the functions
echo "📦 Deploying create-razorpay-order function..."
supabase functions deploy create-razorpay-order

echo "📦 Deploying verify-razorpay-payment function..."
supabase functions deploy verify-razorpay-payment

echo "📦 Deploying razorpay-webhook function..."
supabase functions deploy razorpay-webhook

# Set environment variables
echo "🔑 Setting Razorpay environment variables..."
supabase secrets set RAZORPAY_KEY_ID=rzp_live_R9DRApgTvQiHea
supabase secrets set RAZORPAY_KEY_SECRET=ZmuT5RDoXvwzq3hsvOIV5sGv

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a .env file with your Razorpay keys"
echo "2. Set up webhooks in Razorpay dashboard"
echo "3. Test the payment flow"
echo ""
echo "🔗 Your webhook URL: https://your-project.supabase.co/functions/v1/razorpay-webhook" 