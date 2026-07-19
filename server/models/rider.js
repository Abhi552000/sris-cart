import mongoose from "mongoose";

const riderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    image: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    latitude: { type: Number, default: 22.6030 },
    longitude: { type: Number, default: 88.3660 },
    refreshToken: { type: String, default: "" },
    statusRemarks: { type: String, default: "" },
  },
  { minimize: false, timestamps: true }
);

riderSchema.index({ status: 1 });

const Rider = mongoose.models.rider || mongoose.model("rider", riderSchema);

export default Rider;
