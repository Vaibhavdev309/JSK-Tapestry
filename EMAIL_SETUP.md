# Email Verification Setup Guide

This guide will help you configure email verification for user account creation.

## Step 1: Install Nodemailer

Run this command in the backend directory:

```bash
cd backend
npm install nodemailer
```

## Step 2: Configure Email Service

### Option A: Gmail (Recommended for Development)

1. **Enable 2-Step Verification:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password:**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "Tapestry" as the name
   - Click "Generate"
   - Copy the 16-character password (you'll use this in `.env`)

3. **Update `.env` file:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_character_app_password
   FRONTEND_URL=http://localhost:5174
   ```

### Option B: Other Email Providers

#### Outlook/Hotmail:
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@outlook.com
EMAIL_PASSWORD=your_password
```

#### Yahoo:
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@yahoo.com
EMAIL_PASSWORD=your_app_password
```

#### Custom SMTP:
```env
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_password
FRONTEND_URL=http://localhost:5174
```

## Step 3: Update Frontend URL

For production, update `FRONTEND_URL` in `.env`:

```env
FRONTEND_URL=https://yourdomain.com
```

## Step 4: Test Email Configuration

1. Restart your backend server
2. Try registering a new account
3. Check your email inbox (and spam folder) for verification email
4. Click the verification link

## Email Verification Flow

### Registration:
1. User signs up with email and password
2. System creates account with `isEmailVerified: false`
3. Verification email is sent with unique token
4. User receives email with verification link
5. User clicks link → Email verified → Auto-login

### Login:
1. User logs in with email/password
2. If email not verified → Warning shown, but login allowed
3. User can resend verification email from profile page

### Verification Link:
- Format: `http://yourdomain.com/verify-email?token=<token>`
- Token expires in 24 hours
- One-time use (token cleared after verification)

## Troubleshooting

### Email Not Sending?

1. **Check `.env` file:**
   - Verify all email variables are set correctly
   - No extra spaces or quotes around values
   - App password is correct (for Gmail)

2. **Check Backend Logs:**
   - Look for email service errors
   - Check if transporter verification passes
   - Verify SMTP connection

3. **Common Issues:**
   - **Gmail "Less secure app" error:** Use App Password, not regular password
   - **Connection timeout:** Check firewall/network settings
   - **Authentication failed:** Verify email and password are correct
   - **Email in spam:** Check spam folder, consider using custom domain

### Verification Link Not Working?

1. **Check token expiry:** Links expire after 24 hours
2. **Check frontend URL:** Must match `FRONTEND_URL` in `.env`
3. **Check backend logs:** Look for verification errors

## Security Best Practices

1. ✅ Use App Passwords (not regular passwords)
2. ✅ Keep `.env` file secure (never commit to git)
3. ✅ Use HTTPS in production
4. ✅ Set appropriate token expiry (24 hours)
5. ✅ Rate limit verification requests
6. ✅ Log all verification attempts

## Production Deployment

For production:

1. Use a professional email service (SendGrid, Mailgun, AWS SES)
2. Set up SPF/DKIM records for your domain
3. Use environment-specific `.env` files
4. Monitor email delivery rates
5. Set up email bounce handling

## Email Service Providers

### Free Options:
- **Gmail:** 500 emails/day (with App Password)
- **SendGrid:** 100 emails/day free tier
- **Mailgun:** 5,000 emails/month free tier

### Paid Options:
- **SendGrid:** Starting at $15/month
- **Mailgun:** Starting at $35/month
- **AWS SES:** Pay-as-you-go (very cheap)

## Support

If you encounter issues:
1. Check backend console logs
2. Verify email credentials
3. Test SMTP connection
4. Check spam folder
5. Verify frontend URL matches
