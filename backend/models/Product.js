import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },

    // unit
    unit: { type: String, required: true, trim: true },

    // tag
    tag: {
      type: String,
      enum: ["Fresh", "Packaged", "Frozen", "Organic"],
      default: "Fresh",
    },

    // image
    image: { type: String, default: "" },

    // desc
    description: { type: String, default: "" },
  },
  { timestamps: true }
)

export default mongoose.model("Product", productSchema)
