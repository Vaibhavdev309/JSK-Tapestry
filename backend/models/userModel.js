import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // omitted for Google-only users
    googleId: { type: String, required: false, sparse: true, unique: true },
    phone: { type: String, required: false },
    cartData: { type: Object, default: {} },
    addresses: [addressSchema],
    // Email verification fields
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, required: false },
    emailVerificationExpires: { type: Date, required: false },
    // Password reset fields
    passwordResetToken: { type: String, required: false },
    passwordResetExpires: { type: Date, required: false },
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("User", userSchema);

export default userModel;
