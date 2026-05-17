import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    unit: { type: String, default: "kg", trim: true },
    tag: { type: String, trim: true, default: "Fresh" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
