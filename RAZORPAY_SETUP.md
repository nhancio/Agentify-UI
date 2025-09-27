# 🚀 Razorpay Integration Setup Guide

## 🔑 **Step 1: Environment Variables Setup**

Create a `.env` file in your project root with these variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Payment Provider Configuration
VITE_PAYMENT_PROVIDER=razorpay

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Backend Razorpay Keys (for Supabase Edge Functions)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## 🏗️ **Step 2: Supabase Edge Functions Setup**

### Deploy the Functions:
```bash
# Navigate to your project directory
cd your-project

# Deploy the Razorpay functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

### Set Environment Variables in Supabase:
```bash
# Set Razorpay credentials in Supabase
supabase secrets set RAZORPAY_KEY_ID=your_razorpay_key_id
supabase secrets set RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## 🎯 **Step 3: Razorpay Dashboard Setup**

### 1. **Create Products in Razorpay Dashboard:**
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Navigate to **Products** → **Create Product**

### 2. **Product Configuration:**
   ```
   Product Name: Agentify Starter Plan
   Description: AI Agent Creation Platform - Starter Plan
   Pricing: ₹999/month, ₹9,999/year
   
   Product Name: Agentify Professional Plan
   Description: AI Agent Creation Platform - Professional Plan
   Pricing: ₹1,999/month, ₹19,999/year
   
   Product Name: Agentify Enterprise Plan
   Description: AI Agent Creation Platform - Enterprise Plan
   Pricing: ₹4,999/month, ₹49,999/year
   ```

### 3. **Webhook Configuration:**
   - Go to **Settings** → **Webhooks**
   - Add webhook URL: `https://your-project.supabase.co/functions/v1/razorpay-webhook`
   - Events to listen: `payment.captured`, `payment.failed`

## 🔧 **Step 4: Frontend Configuration**

### Update your `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/functions/v1': {
        target: 'https://your-project.supabase.co',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
```

## 🧪 **Step 5: Testing**

### 1. **Test Order Creation:**
```bash
curl -X POST http://localhost:5173/functions/v1/create-razorpay-order \
  -H "Content-Type: application/json" \
  -d '{"productId": "starter", "billingPeriod": "monthly"}'
```

### 2. **Test Payment Verification:**
```bash
curl -X POST http://localhost:5173/functions/v1/verify-razorpay-payment \
  -H "Content-Type: application/json" \
  -d '{"orderId": "order_xxx", "paymentId": "pay_xxx", "signature": "xxx"}'
```

## 📱 **Step 6: Frontend Integration**

The Billing component is already configured to:
- Load Razorpay script dynamically
- Create orders via Supabase function
- Handle payment responses
- Verify payments securely

## 🔒 **Security Notes:**

1. **Never expose** `RAZORPAY_KEY_SECRET` in frontend code
2. **Always verify** payment signatures on the backend
3. **Use HTTPS** in production for all API calls
4. **Implement rate limiting** on your functions

## 🚨 **Troubleshooting:**

### Common Issues:
1. **CORS errors**: Check Supabase function CORS headers
2. **Payment verification fails**: Ensure signature verification logic is correct
3. **Orders not created**: Verify Razorpay credentials and API permissions

### Debug Mode:
Enable debug logging in your functions by adding:
```typescript
console.log('Debug info:', { keyId, amount, currency });
```

## 📞 **Support:**

- **Razorpay Docs**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Supabase Functions**: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **Payment Testing**: Use Razorpay test cards for development

---

**Next Steps:** Provide me with your Razorpay keys and I'll help you configure everything! 