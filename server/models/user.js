import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    cartItems: { type: Object, default: {} },
    refreshToken: { type: String, default: "" },
    statusRemarks: { type: String, default: "" },
  },
  { minimize: false }
);

userSchema.index({ status: 1 });

const User = mongoose.models.user || mongoose.model("user", userSchema);

export default User;
