# Credit Update System Test Guide

## 🔍 **Current Credit Update Flow**

### **1. Payment Processing**
- **Stripe Webhook**: `supabase/functions/stripe-webhook/index.ts`
- **Razorpay Webhook**: `supabase/functions/razorpay-webhook/index.ts`
- **Manual Processing**: `supabase/functions/process-payment-manual/index.ts`

### **2. Credit Amounts by Plan**
```typescript
const credits = {
  starter: 1000,      // $9.99
  professional: 7500, // $49.99
  enterprise: 20000   // $99.99
};
```

### **3. Update Logic**
1. **Check payment status** (paid)
2. **Get existing credits** from users table
3. **Add new credits** to existing balance
4. **Update database** with new total
5. **Return success response**

## 🧪 **Test Credit Update System**

### **Step 1: Check Current Credits**
```sql
-- In Supabase SQL Editor
SELECT id, email, credits, created_at, updated_at 
FROM users 
WHERE id = 'your-user-id';
```

### **Step 2: Test Manual Credit Update**
```bash
# Test the manual payment processing function
curl -X POST https://your-project.supabase.co/functions/v1/process-payment-manual \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-id",
    "userId": "your-user-id"
  }'
```

### **Step 3: Verify Credit Update**
1. **Check Success Page**: `/success?session_id=test-session-id`
2. **Check Database**: Query users table for updated credits
3. **Check UI**: Verify credits display in dashboard

## 🔧 **Troubleshooting Credit Updates**

### **Common Issues**

1. **Webhook Not Firing**
   - Check webhook URL configuration
   - Verify webhook secret in Supabase secrets
   - Check payment provider logs

2. **Credits Not Updating**
   - Check user ID in payment metadata
   - Verify database permissions
   - Check function logs in Supabase

3. **Duplicate Credit Addition**
   - Check for duplicate webhook calls
   - Implement idempotency keys
   - Add payment tracking table

### **Debug Steps**

1. **Check Function Logs**:
   ```bash
   npx supabase functions logs stripe-webhook
   npx supabase functions logs process-payment-manual
   ```

2. **Test Webhook Locally**:
   ```bash
   npx supabase functions serve stripe-webhook
   ```

3. **Verify Database Updates**:
   ```sql
   SELECT * FROM users WHERE id = 'user-id';
   ```

## 📊 **Credit Update Verification**

### **Expected Behavior**
1. ✅ Payment completes successfully
2. ✅ Webhook receives payment event
3. ✅ Credits are added to user account
4. ✅ Success page shows updated credits
5. ✅ User can use credits for image generation

### **Test Scenarios**
- [ ] Starter plan (1000 credits)
- [ ] Professional plan (7500 credits)  
- [ ] Enterprise plan (20000 credits)
- [ ] Multiple payments (credits accumulate)
- [ ] Failed payment (no credits added)
- [ ] Webhook failure (manual fallback works)

## 🚀 **Quick Test Commands**

```bash
# Deploy functions
npx supabase functions deploy stripe-webhook
npx supabase functions deploy process-payment-manual

# Check logs
npx supabase functions logs stripe-webhook --follow

# Test manual credit update
curl -X POST localhost:54321/functions/v1/process-payment-manual \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","userId":"test-user"}'
```
