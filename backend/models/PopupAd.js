import mongoose from "mongoose";

const popupAdSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    textContent: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    targetLink: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("PopupAd", popupAdSchema);
