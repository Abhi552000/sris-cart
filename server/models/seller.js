import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    storeName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    latitude: { type: Number, default: 22.6030 },
    longitude: { type: Number, default: 88.3660 },
    gstNumber: { type: String, default: "" },
    branch: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
    statusRemarks: { type: String, default: "" },
  },
  { minimize: false }
);

sellerSchema.index({ status: 1 });

const Seller = mongoose.models.seller || mongoose.model("seller", sellerSchema);

export default Seller;
