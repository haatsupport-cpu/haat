import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    default: null,
  },

  phone: {
    type: String,
    default: null,
  },

  googleId: {
    type: String,
    default: null,
  },

  photo: {
    type: String,
    default: null,
  },

  role: {
    type: String,
    default: "customer",
  },

  authProvider: {
    type: String,
    default: "local", // local or google
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("User", userSchema)