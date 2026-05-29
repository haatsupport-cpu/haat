import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, unique: true, trim: true },
    description: { type: String, default: "" },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, default: 0, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    minimumOrderValue: { type: Number, default: 0, min: 0 },
    deliveryOptions: {
      type: [String],
      enum: ["instant", "scheduled"],
      default: ["instant", "scheduled"]
    },
    expiresAt: { type: Date },
    expiryDate: { type: Date },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    maxUses: { type: Number, default: 0, min: 0 },
    uses: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    activeStatus: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("PromoCode", promoCodeSchema);
