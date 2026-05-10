import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const buildAuthResponse = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      photo: user.photo,
      authProvider: user.authProvider,
    },
  }
}

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" })

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ name, email, password: hashedPassword, phone })
    await user.save()

    res.status(201).json(buildAuthResponse(user))
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ msg: "User not found" })
    if (!user.password) {
      return res.status(400).json({
        msg: "This account uses Google login. Please continue with Google.",
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" })

    res.json(buildAuthResponse(user))
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

export const googleAuthUser = async (req, res) => {
  try {
    const { name, email, photo, googleId } = req.body

    if (!email || !googleId) {
      return res.status(400).json({ msg: "Google email and id are required" })
    }

    let user = await User.findOne({ email })

    if (!user) {
      user = new User({
        name: name || email.split("@")[0],
        email,
        photo: photo || null,
        googleId,
        authProvider: "google",
      })
      await user.save()
    } else {
      user.googleId = googleId
      user.photo = photo || user.photo
      if (!user.authProvider || user.authProvider === "local") {
        user.authProvider = "google"
      }
      if (name && !user.name) {
        user.name = name
      }
      await user.save()
    }

    res.json(buildAuthResponse(user))
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}
