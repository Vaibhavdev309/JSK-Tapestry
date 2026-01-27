import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailService.js";

const loginUser = async (req, res) => {
  try {
    console.log("🔵 [LOGIN] User login request received");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      console.error("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.password) {
      console.error("❌ Google sign-in user trying to use password");
      return res.status(400).json({
        success: false,
        message: "This account uses Google sign-in. Please use Continue with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("❌ Password mismatch");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check email verification status
    if (!user.isEmailVerified) {
      console.log("⚠️ User email not verified:", user._id);
      // Allow login but inform user about verification
      const token = createToken(user._id);
      return res.json({
        success: true,
        token,
        emailVerified: false,
        message: "Please verify your email address to access all features.",
      });
    }

    console.log("✅ User logged in successfully:", user._id);
    const token = createToken(user._id);
    res.json({
      success: true,
      token,
      emailVerified: true,
    });
  } catch (error) {
    console.error("❌ [LOGIN] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const registerUser = async (req, res) => {
  try {
    console.log("🔵 [REGISTER] User registration request received");
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      console.error("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (!validator.isEmail(email)) {
      console.error("❌ Invalid email format:", email);
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 8) {
      console.error("❌ Password too short");
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      console.error("❌ User already exists:", email);
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours expiry

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new userModel({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    const user = await newUser.save();
    console.log("✅ User created:", user._id);

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);
    if (emailResult.success) {
      console.log("✅ Verification email sent");
    } else {
      console.error("❌ Error sending verification email:", emailResult.error);
      // Don't fail registration if email fails, but log it
      // User can request resend later
    }

    // Don't send token immediately - user needs to verify email first
    res.status(201).json({
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      requiresVerification: true,
    });
  } catch (error) {
    console.error("❌ [REGISTER] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: "Missing Google credential" });
    }
    const clientId = (process.env.GOOGLE_CLIENT_ID || "").trim().replace(/^["']|["']$/g, "");
    if (!clientId) {
      return res.status(500).json({ success: false, message: "Google sign-in is not configured" });
    }
    let OAuth2Client;
    try {
      const lib = await import("google-auth-library");
      OAuth2Client = lib.OAuth2Client;
    } catch (e) {
      if (e?.code === "ERR_MODULE_NOT_FOUND" || e?.message?.includes("google-auth-library")) {
        return res.status(503).json({ success: false, message: "Google sign-in unavailable. Run: npm install google-auth-library" });
      }
      throw e;
    }
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || (email ? email.split("@")[0] : "User");
    const googleId = payload.sub;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email not provided by Google" });
    }

    let user = await userModel.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      const token = createToken(user._id);
      return res.json({ success: true, token });
    }
    const newUser = new userModel({ name, email, googleId });
    await newUser.save();
    const token = createToken(newUser._id);
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message || "Google sign-in failed" });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Never put credentials in the JWT. Use a role claim only.
      const token = jwt.sign(
        { role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    console.log("🔵 [GET USER PROFILE] Request received");
    console.log("📦 Headers:", { token: req.headers?.token ? "Present" : "Missing" });
    console.log("📦 Body:", req.body);
    
    const userId = req.body.userId;
    console.log("👤 User ID from token:", userId);
    
    if (!userId) {
      console.error("❌ No userId found in request body");
      return res.status(401).json({ success: false, message: "User ID not found. Please login again." });
    }

    const user = await userModel.findById(userId).select("-password -googleId");
    console.log("🔍 User found:", user ? "Yes" : "No");
    
    if (!user) {
      console.error("❌ User not found in database for ID:", userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    console.log("✅ User profile retrieved successfully");
    console.log("📊 User data:", {
      name: user.name,
      email: user.email,
      phone: user.phone || "Not set",
      addressesCount: user.addresses?.length || 0,
    });
    
    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ [GET USER PROFILE] Error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    console.log("🔵 [UPDATE USER PROFILE] Request received");
    const userId = req.body.userId;
    const { name, email, phone } = req.body;
    console.log("📦 Update data:", { userId, name, email, phone });
    
    if (!userId) {
      console.error("❌ No userId found");
      return res.status(401).json({ success: false, message: "User ID not found" });
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await userModel.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        console.error("❌ Email already in use:", email);
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
      if (!validator.isEmail(email)) {
        console.error("❌ Invalid email format:", email);
        return res.status(400).json({ success: false, message: "Invalid email format" });
      }
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.trim();
    if (phone !== undefined) user.phone = phone?.trim() || "";

    await user.save();
    console.log("✅ Profile updated successfully");
    const updatedUser = await userModel.findById(userId).select("-password -googleId");
    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("❌ [UPDATE USER PROFILE] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    console.log("🔵 [CHANGE PASSWORD] Request received");
    const userId = req.body.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      console.error("❌ No userId found");
      return res.status(401).json({ success: false, message: "User ID not found" });
    }

    if (!currentPassword || !newPassword) {
      console.error("❌ Missing password fields");
      return res.status(400).json({ success: false, message: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      console.error("❌ Password too short");
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.password) {
      console.error("❌ Google sign-in user cannot change password");
      return res.status(400).json({ success: false, message: "This account uses Google sign-in. Password cannot be changed." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.error("❌ Current password incorrect");
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    console.log("✅ Password changed successfully");
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ [CHANGE PASSWORD] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add address
const addAddress = async (req, res) => {
  try {
    console.log("🔵 [ADD ADDRESS] Request received");
    const userId = req.body.userId;
    const { fullName, phone, address, city, state, pincode, country, isDefault } = req.body;
    console.log("📦 Address data:", { userId, fullName, city, state });

    if (!userId) {
      console.error("❌ No userId found");
      return res.status(401).json({ success: false, message: "User ID not found" });
    }

    if (!fullName || !phone || !address || !city || !state || !pincode) {
      console.error("❌ Missing required address fields");
      return res.status(400).json({ success: false, message: "All address fields are required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    const newAddress = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: country || "India",
      isDefault: isDefault || false,
    };

    user.addresses.push(newAddress);
    await user.save();

    console.log("✅ Address added successfully");
    res.json({ success: true, message: "Address added successfully", address: user.addresses[user.addresses.length - 1] });
  } catch (error) {
    console.error("❌ [ADD ADDRESS] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    console.log("🔵 [UPDATE ADDRESS] Request received");
    const userId = req.body.userId;
    const { addressId, fullName, phone, address, city, state, pincode, country, isDefault } = req.body;
    console.log("📦 Update data:", { userId, addressId });

    if (!userId) {
      console.error("❌ No userId found");
      return res.status(401).json({ success: false, message: "User ID not found" });
    }

    if (!addressId) {
      console.error("❌ No addressId provided");
      return res.status(400).json({ success: false, message: "Address ID is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      console.error("❌ Address not found:", addressId);
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach((addr, idx) => {
        if (idx !== addressIndex) addr.isDefault = false;
      });
    }

    if (fullName) user.addresses[addressIndex].fullName = fullName.trim();
    if (phone) user.addresses[addressIndex].phone = phone.trim();
    if (address) user.addresses[addressIndex].address = address.trim();
    if (city) user.addresses[addressIndex].city = city.trim();
    if (state) user.addresses[addressIndex].state = state.trim();
    if (pincode) user.addresses[addressIndex].pincode = pincode.trim();
    if (country) user.addresses[addressIndex].country = country.trim();
    if (isDefault !== undefined) user.addresses[addressIndex].isDefault = isDefault;

    await user.save();
    console.log("✅ Address updated successfully");
    res.json({ success: true, message: "Address updated successfully", address: user.addresses[addressIndex] });
  } catch (error) {
    console.error("❌ [UPDATE ADDRESS] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    console.log("🔵 [DELETE ADDRESS] Request received");
    const userId = req.body.userId;
    const { addressId } = req.body;
    console.log("📦 Delete data:", { userId, addressId });

    if (!userId) {
      console.error("❌ No userId found");
      return res.status(401).json({ success: false, message: "User ID not found" });
    }

    if (!addressId) {
      console.error("❌ No addressId provided");
      return res.status(400).json({ success: false, message: "Address ID is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const beforeCount = user.addresses.length;
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    const afterCount = user.addresses.length;

    if (beforeCount === afterCount) {
      console.error("❌ Address not found to delete:", addressId);
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await user.save();
    console.log("✅ Address deleted successfully");
    res.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("❌ [DELETE ADDRESS] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    console.log("🔵 [SET DEFAULT ADDRESS] Request received");
    const userId = req.body.userId;
    const { addressId } = req.body;
    console.log("📦 Default address data:", { userId, addressId });

    if (!userId) {
      console.error("❌ No userId found");
      return res.status(401).json({ success: false, message: "User ID not found" });
    }

    if (!addressId) {
      console.error("❌ No addressId provided");
      return res.status(400).json({ success: false, message: "Address ID is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      console.error("❌ Address not found:", addressId);
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // Unset all defaults
    user.addresses.forEach(addr => { addr.isDefault = false; });
    // Set this one as default
    user.addresses[addressIndex].isDefault = true;

    await user.save();
    console.log("✅ Default address updated successfully");
    res.json({ success: true, message: "Default address updated successfully" });
  } catch (error) {
    console.error("❌ [SET DEFAULT ADDRESS] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    console.log("🔵 [VERIFY EMAIL] Email verification request received");
    const { token } = req.query;

    if (!token) {
      console.error("❌ No verification token provided");
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const user = await userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.error("❌ Invalid or expired verification token");
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link",
      });
    }

    if (user.isEmailVerified) {
      console.log("⚠️ Email already verified:", user._id);
      return res.json({
        success: true,
        message: "Email already verified",
        alreadyVerified: true,
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log("✅ Email verified successfully:", user._id);

    // Generate token for automatic login
    const authToken = createToken(user._id);

    res.json({
      success: true,
      message: "Email verified successfully!",
      token: authToken,
    });
  } catch (error) {
    console.error("❌ [VERIFY EMAIL] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Email verification failed",
    });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    console.log("🔵 [RESEND VERIFICATION] Resend verification request received");
    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      console.log("⚠️ Email already verified");
      return res.json({
        success: true,
        message: "Email is already verified",
        alreadyVerified: true,
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      console.log("✅ Verification email resent");
      res.json({
        success: true,
        message: "Verification email sent successfully. Please check your inbox.",
      });
    } catch (emailError) {
      console.error("❌ Error sending verification email:", emailError);
      res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("❌ [RESEND VERIFICATION] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to resend verification email",
    });
  }
};

// Forgot password - request password reset
const forgotPassword = async (req, res) => {
  try {
    console.log("🔵 [FORGOT PASSWORD] Request received");
    const { email } = req.body;

    if (!email || !email.trim()) {
      console.error("❌ Email is required");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!validator.isEmail(email)) {
      console.error("❌ Invalid email format:", email);
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await userModel.findOne({ email: email.trim().toLowerCase() });
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      console.log("⚠️ User not found (but not revealing this to client)");
      // Still return success to prevent email enumeration
      return res.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Check if user has a password (not Google-only account)
    if (!user.password) {
      console.log("⚠️ Google sign-in user cannot reset password");
      // Still return success to prevent account enumeration
      return res.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    console.log("✅ Password reset token generated for user:", user._id);

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      console.log("✅ Password reset email sent");
      res.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    } catch (emailError) {
      console.error("❌ Error sending password reset email:", emailError);
      // Clear the token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("❌ [FORGOT PASSWORD] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process password reset request",
    });
  }
};

// Reset password - with token
const resetPassword = async (req, res) => {
  try {
    console.log("🔵 [RESET PASSWORD] Request received");
    const { token, newPassword } = req.body;

    if (!token || !token.trim()) {
      console.error("❌ Reset token is required");
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!newPassword || newPassword.length < 8) {
      console.error("❌ Invalid password");
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const user = await userModel.findOne({
      passwordResetToken: token.trim(),
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.error("❌ Invalid or expired reset token");
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log("✅ Password reset successfully for user:", user._id);

    res.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("❌ [RESET PASSWORD] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password",
    });
  }
};

export { loginUser, registerUser, googleAuth, adminLogin, getUserProfile, updateUserProfile, changePassword, addAddress, updateAddress, deleteAddress, setDefaultAddress, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword };
