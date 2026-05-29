import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" },
    category: { type: String, default: "" },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    deliveryAddress: { type: String, required: true, trim: true },
    landmark: { type: String, required: true, trim: true },
    // Standardized location object
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
      label: { type: String },
      landmark: { type: String },
      coordinates: {
        type: [Number], // [lng, lat] for GeoJSON
        default: undefined,
      },
    },
    deliveryType: { type: String, enum: ["instant", "scheduled"], default: "instant" },
    scheduledDeliveryAt: { type: Date, default: null },
    paymentMode: { type: String, required: true, trim: true },
    promoCodeId: { type: mongoose.Schema.Types.ObjectId, ref: "PromoCode", default: null },
    promoDiscount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    codFee: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
