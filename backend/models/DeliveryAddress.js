import mongoose from "mongoose";

const deliveryAddressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true, trim: true },
    phoneno: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    landmark: { type: String, required: true, trim: true },
    deliveryType: { type: String, enum: ["instant", "scheduled"], default: "instant" },
    scheduledDeliveryAt: { type: Date, default: null },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryAddress", deliveryAddressSchema);
