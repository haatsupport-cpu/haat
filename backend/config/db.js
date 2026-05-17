import mongoose from "mongoose";

export const connectDB = async (uri) => {
  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment");
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("MongoDB connected.");
};
