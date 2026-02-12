/**
 * SMS OTP service. Supports Twilio; falls back to logging OTP when not configured (e.g. dev).
 * Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to enable real SMS.
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID?.trim();
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN?.trim();
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER?.trim();

/** Normalize phone to E.164 for Twilio (e.g. +91XXXXXXXXXX) */
function normalizePhone(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("6") === false && digits.startsWith("7") === false) {
    return "+91" + digits;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return "+" + digits;
  }
  return "+91" + digits.slice(-10);
}

/**
 * Send OTP to the given phone number.
 * @param {string} phone - Phone number (10 digits or with country code)
 * @param {string} otp - 6-digit OTP string
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function sendOtpSms(phone, otp) {
  const to = normalizePhone(phone);
  const message = `Your Tapestry verification code is ${otp}. Valid for 5 minutes.`;

  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    try {
      const twilio = await import("twilio");
      const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to,
      });
      return { success: true };
    } catch (err) {
      if (err?.code === "ERR_MODULE_NOT_FOUND" || err?.message?.includes("twilio")) {
        console.log("[SMS OTP] Twilio not installed. Run: npm install twilio. OTP:", otp);
        return { success: true };
      }
      console.error("Twilio SMS error:", err?.message || err);
      return { success: false, error: err?.message || "Failed to send SMS" };
    }
  }

  // Dev / no Twilio: log OTP so you can use it in testing
  console.log("[SMS OTP] (Twilio not configured) To:", to, "OTP:", otp);
  return { success: true };
}
