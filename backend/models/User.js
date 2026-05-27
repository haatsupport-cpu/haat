import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phoneno: { type: String, required: true, unique: true, trim: true },
    password: { type: String, default: null },
    photo: { type: String, default: null },
    role: { type: String, enum: ["customer", "vendor", "admin"], default: "customer" },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);