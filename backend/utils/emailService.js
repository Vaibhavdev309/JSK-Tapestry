import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
  // Use environment variables for email configuration
  // For Gmail, you can use OAuth2 or App Password
  // For other providers, adjust accordingly
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
    },
    // Connection timeout settings for cloud platforms
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 10000, // 10 seconds
    // Pool connections for better performance
    pool: true,
    maxConnections: 1,
    maxMessages: 3,
    // Retry configuration
    retry: {
      attempts: 3,
      delay: 2000, // 2 seconds between retries
    },
    // TLS options for better compatibility with cloud platforms
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates (needed for some cloud providers)
      // Use modern TLS settings
      minVersion: 'TLSv1.2',
    },
    // Debug mode (set to true for troubleshooting)
    debug: process.env.NODE_ENV === "development",
    logger: process.env.NODE_ENV === "development",
  });

  return transporter;
};

// Send verification email
export const sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    console.log("📧 [EMAIL] Sending verification email to:", email);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("❌ Email credentials not configured");
      throw new Error("Email service not configured");
    }

    const transporter = createTransporter();
    
    // Verify transporter configuration with timeout
    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Connection timeout")), 8000)
        )
      ]);
      console.log("✅ Email server connection verified");
    } catch (verifyError) {
      console.error("⚠️ Email server verification failed:", verifyError.message);
      // Continue anyway - sometimes verify fails but sending works
      if (verifyError.message.includes("timeout")) {
        console.log("⚠️ Continuing without verification - connection may still work");
      } else {
        throw verifyError;
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"Tapestry" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email Address - Tapestry",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Tapestry!</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for creating an account with Tapestry! Please verify your email address to complete your registration.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background: #D97706; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
              ${verificationUrl}
            </p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              This link will expire in 24 hours. If you didn't create an account with Tapestry, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Tapestry. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Tapestry!
        
        Hi ${name},
        
        Thank you for creating an account with Tapestry! Please verify your email address by clicking the link below:
        
        ${verificationUrl}
        
        This link will expire in 24 hours. If you didn't create an account with Tapestry, please ignore this email.
        
        © ${new Date().getFullYear()} Tapestry. All rights reserved.
      `,
    };

    // Send email with timeout protection
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Email send timeout after 15 seconds")), 15000)
    );
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log("✅ Verification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ [EMAIL] Error sending verification email:", error.message);
    // Don't throw - allow registration to complete even if email fails
    // User can request resend later
    console.log("⚠️ Registration will continue - user can request email resend");
    return { success: false, error: error.message };
  }
};

// Send contact form notification to admin
export const sendContactNotificationEmail = async (contact) => {
  try {
    console.log("📧 [EMAIL] Sending contact notification to admin");
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("❌ Email credentials not configured");
      return; // Don't throw - contact form should work even if email fails
    }

    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const mailOptions = {
      from: `"Tapestry Contact Form" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Contact Form Submission: ${contact.subject || "General Inquiry"}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p><strong>Name:</strong> ${contact.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
            <p><strong>Subject:</strong> ${contact.subject || "General Inquiry"}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${contact.message}</div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 12px; color: #9ca3af;">
              Submitted: ${new Date(contact.createdAt).toLocaleString()}
              ${contact.userId ? `<br>User ID: ${contact.userId}` : '<br>Guest submission'}
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${contact.name}
        Email: ${contact.email}
        Subject: ${contact.subject || "General Inquiry"}
        
        Message:
        ${contact.message}
        
        Submitted: ${new Date(contact.createdAt).toLocaleString()}
        ${contact.userId ? `User ID: ${contact.userId}` : 'Guest submission'}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Contact notification email sent to admin");
    return { success: true };
  } catch (error) {
    console.error("❌ [EMAIL] Error sending contact notification:", error);
    // Don't throw - contact form should work even if email fails
    return { success: false, error: error.message };
  }
};

// Recipients for price-request and chat notifications (high interaction)
const NOTIFICATION_EMAILS = [
  "vaibhav.dev.309@gmail.com",
  "swapnilmauryavidhay@gmail.com",
];

const createTransporterSafe = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return null;
  }
  return createTransporter();
};

// Send notification when a new price approval request is created
export const sendPriceRequestNotificationEmail = async (priceRequest) => {
  try {
    const transporter = createTransporterSafe();
    if (!transporter) {
      console.warn("⚠️ [EMAIL] Skipping price request notification - email not configured");
      return { success: false };
    }

    const user = priceRequest.userId;
    const userName = user?.name || "A customer";
    const userEmail = user?.email || "—";
    const itemsList = (priceRequest.items || [])
      .map((i) => {
        const name = i.productId?.name || "Product";
        return `• ${name} (Qty: ${i.quantity || 1}, Size: ${i.size || "—"})`;
      })
      .join("<br>");

    const mailOptions = {
      from: `"JSK Handloom" <${process.env.EMAIL_USER}>`,
      to: NOTIFICATION_EMAILS.join(", "),
      subject: `🔔 New Price Approval Request – JSK Handloom`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">New Price Approval Request</h1>
          </div>
          <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p><strong>Customer:</strong> ${userName}</p>
            <p><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
            <p><strong>Request ID:</strong> ${priceRequest._id}</p>
            <p><strong>Items requested:</strong></p>
            <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 8px 0;">${itemsList || "—"}</div>
            <p style="font-size: 12px; color: #6b7280;">${new Date().toLocaleString()}</p>
            <p style="font-size: 12px; color: #9ca3af;">Log in to the admin panel to respond.</p>
          </div>
        </body>
        </html>
      `,
      text: `New Price Approval Request\n\nCustomer: ${userName}\nEmail: ${userEmail}\nRequest ID: ${priceRequest._id}\n\nItems:\n${(priceRequest.items || []).map((i) => `- ${i.productId?.name || "Product"} (Qty: ${i.quantity || 1}, Size: ${i.size || "—"})`).join("\n")}\n\n${new Date().toLocaleString()}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Price request notification sent to", NOTIFICATION_EMAILS.length, "recipients");
    return { success: true };
  } catch (error) {
    console.error("❌ [EMAIL] Price request notification failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Send notification when a customer sends a chat message
export const sendChatMessageNotificationEmail = async ({ userName, userEmail, content, chatId }) => {
  try {
    const transporter = createTransporterSafe();
    if (!transporter) {
      console.warn("⚠️ [EMAIL] Skipping chat notification - email not configured");
      return { success: false };
    }

    const escapeHtml = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const safeContent = escapeHtml((content || "").slice(0, 500));
    const displayName = escapeHtml(userName || "A customer");
    const safeEmail = escapeHtml(userEmail || "");

    const mailOptions = {
      from: `"JSK Handloom Chat" <${process.env.EMAIL_USER}>`,
      to: NOTIFICATION_EMAILS.join(", "),
      subject: `💬 New Chat Message – JSK Handloom`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">New Chat Message</h1>
          </div>
          <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p><strong>From:</strong> ${displayName}</p>
            <p><strong>Email:</strong> <a href="mailto:${userEmail || ""}">${safeEmail || "—"}</a></p>
            <p><strong>Message:</strong></p>
            <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; white-space: pre-wrap;">${safeContent}</div>
            <p style="font-size: 12px; color: #6b7280;">${new Date().toLocaleString()} · Chat ID: ${chatId}</p>
            <p style="font-size: 12px; color: #9ca3af;">Reply from the admin panel chat.</p>
          </div>
        </body>
        </html>
      `,
      text: `New Chat Message\n\nFrom: ${displayName}\nEmail: ${userEmail || "—"}\n\nMessage:\n${safeContent}\n\n${new Date().toLocaleString()} · Chat ID: ${chatId}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Chat message notification sent to", NOTIFICATION_EMAILS.length, "recipients");
    return { success: true };
  } catch (error) {
    console.error("❌ [EMAIL] Chat message notification failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Send password reset email (for future use)
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  try {
    console.log("📧 [EMAIL] Sending password reset email to:", email);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email service not configured");
    }

    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Tapestry" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - Tapestry",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Password Reset Request</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Hi ${name},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: #D97706; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    };

    // Send email with timeout protection
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Email send timeout after 15 seconds")), 15000)
    );
    
    await Promise.race([sendPromise, timeoutPromise]);
    console.log("✅ Password reset email sent");
    return { success: true };
  } catch (error) {
    console.error("❌ [EMAIL] Error sending password reset email:", error.message);
    throw error; // Password reset is critical, so throw error
  }
};
