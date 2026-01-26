# Razorpay Payment Integration Setup Guide

This guide will help you set up Razorpay payment gateway for your Tapestry e-commerce application.

## Step 1: Create Razorpay Account

1. Go to [https://razorpay.com](https://razorpay.com)
2. Sign up for a new account (or log in if you already have one)
3. Complete the KYC verification process (required for live payments)

## Step 2: Get API Keys

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **API Keys**
3. You'll see two sets of keys:
   - **Test Keys** (for development/testing)
   - **Live Keys** (for production)

### For Development:
- Use **Test Keys**
- Test cards: [https://razorpay.com/docs/payments/test-cards/](https://razorpay.com/docs/payments/test-cards/)

### For Production:
- Use **Live Keys** (only after KYC verification)

## Step 3: Configure Backend

1. Open `backend/.env` file
2. Add your Razorpay keys:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

**Important:**
- Never commit `.env` file to git
- Use test keys for development
- Switch to live keys only in production

## Step 4: Test the Integration

### Test Cards (Development Mode)

Use these test card numbers to test payments:

| Card Number | CVV | Expiry | Result |
|------------|-----|--------|--------|
| 4111 1111 1111 1111 | Any | Any future date | Success |
| 5555 5555 5555 4444 | Any | Any future date | Success |
| 5104 0600 0000 0008 | Any | Any future date | Success (International) |

**Test UPI IDs:**
- `success@razorpay`
- `failure@razorpay`

**Test Netbanking:**
- Select any bank → Will always succeed in test mode

## Step 5: Payment Flow

### How It Works:

1. **User selects Razorpay** on checkout page
2. **Frontend** creates payment order via backend API
3. **Backend** creates Razorpay order and returns order details
4. **Frontend** opens Razorpay checkout modal
5. **User** completes payment in Razorpay modal
6. **Razorpay** sends payment response
7. **Frontend** sends payment details to backend for verification
8. **Backend** verifies payment signature and creates order
9. **User** is redirected to orders page

### API Endpoints:

- `POST /api/payment/razorpay/create-order` - Create Razorpay order
- `POST /api/payment/razorpay/verify` - Verify payment and create order
- `GET /api/payment/razorpay/key` - Get Razorpay key (for frontend)

## Step 6: Production Deployment

### Before Going Live:

1. ✅ Complete KYC verification on Razorpay
2. ✅ Switch to Live API keys in production `.env`
3. ✅ Test with real payment (small amount)
4. ✅ Set up webhooks (optional, for payment status updates)
5. ✅ Configure refund policies
6. ✅ Set up email notifications

### Webhook Setup (Optional):

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/payment/razorpay/webhook`
3. Select events: `payment.captured`, `payment.failed`, `order.paid`

## Troubleshooting

### Payment Not Working?

1. **Check API Keys:**
   - Verify keys are correct in `.env`
   - Ensure you're using test keys for development
   - Restart backend server after changing `.env`

2. **Check Console Logs:**
   - Backend logs show payment flow
   - Frontend console shows Razorpay checkout status

3. **Common Issues:**
   - "Payment gateway not configured" → Check `.env` file
   - "Payment verification failed" → Check signature verification
   - "Order not found" → Check Razorpay order ID

### Test Mode vs Live Mode:

- **Test Mode:** Use test keys, test cards, no real money
- **Live Mode:** Use live keys, real cards, real money transfers

## Security Best Practices

1. ✅ Never expose `RAZORPAY_KEY_SECRET` in frontend
2. ✅ Always verify payment signature on backend
3. ✅ Use HTTPS in production
4. ✅ Store keys securely (environment variables)
5. ✅ Implement rate limiting on payment endpoints
6. ✅ Log all payment transactions

## Support

- Razorpay Documentation: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- Razorpay Support: [https://razorpay.com/support/](https://razorpay.com/support/)

## Payment Status in Orders

Orders will have:
- `paymentMethod`: "razorpay" | "COD"
- `paymentStatus`: "pending" | "paid" | "failed" | "refunded"
- `razorpayOrderId`: Razorpay order ID
- `razorpayPaymentId`: Razorpay payment ID
