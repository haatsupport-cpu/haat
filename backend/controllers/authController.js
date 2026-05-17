import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const buildUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  photo: user.photo,
  authProvider: user.authProvider,
});

const createToken = (user) => {
  const token = jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
};

const respondError = (res, status, message, details) =>
  res.status(status).json({ message, details });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return respondError(res, 400, "name, email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return respondError(res, 409, "A user with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      authProvider: "local",
    });

    const token = createToken(user);
    return res.status(201).json({ token, user: buildUserResponse(user) });
  } catch (err) {
    console.error("[AUTH][REGISTER] unexpected error", err);
    return respondError(res, 500, "Registration failed", err.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return respondError(res, 400, "email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.password) {
      return respondError(res, 401, "Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return respondError(res, 401, "Invalid credentials");
    }

    const token = createToken(user);
    return res.json({ token, user: buildUserResponse(user) });
  } catch (err) {
    console.error("[AUTH][LOGIN] unexpected error", err);
    return respondError(res, 500, "Login failed", err.message);
  }
};

const verifyGoogleIdToken = async (idToken) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID is required for Google login");
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );

  if (!response.ok) {
    throw new Error("Invalid Google ID token");
  }

  const payload = await response.json();
  if (payload.aud !== googleClientId) {
    throw new Error("Google ID token audience mismatch");
  }

  return payload;
};

export const googleAuthUser = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return respondError(res, 400, "Google login requires an ID token");
    }

    const payload = await verifyGoogleIdToken(idToken);
    const email = payload.email?.toLowerCase()?.trim();
    if (!email) {
      return respondError(res, 400, "Google token did not include an email");
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email,
        googleId: payload.sub,
        photo: payload.picture || null,
        authProvider: "google",
      });
    } else if (user.authProvider === "local" && !user.googleId) {
      user.googleId = payload.sub;
      user.photo = user.photo || payload.picture || null;
      user.authProvider = "google";
      await user.save();
    }

    const token = createToken(user);
    return res.json({ token, user: buildUserResponse(user) });
  } catch (err) {
    console.error("[AUTH][GOOGLE] unexpected error", err);
    return respondError(res, 500, "Google auth failed", err.message);
  }
};

export const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(200).json({ user: null });
  }

  const user = await User.findById(req.user.id).lean();
  if (!user) {
    return res.status(200).json({ user: null });
  }

  return res.json({ user: buildUserResponse(user) });
};

export const logoutUser = async (req, res) => {
  return res.json({ message: "Logout successful" });
};
