import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    storeName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  { minimize: false }
);

const Seller = mongoose.models.seller || mongoose.model("seller", sellerSchema);

export default Seller;
