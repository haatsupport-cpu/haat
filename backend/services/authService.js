import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const buildUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  phoneno: user.phoneno,
  photo: user.photo,
  authProvider: user.authProvider,
});

const createToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      phoneno: user.phoneno,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const register = async ({ name, password, phoneno, phone, email, acceptedPolicies }) => {
  const providedPhone = String(phoneno || phone || "").trim();
  if (!name || !providedPhone || !password) {
    throw createHttpError(400, "Name, Phone number and Password are required");
  }
  if (acceptedPolicies !== true) {
    throw createHttpError(400, "You must accept Terms & Conditions and Privacy Policy");
  }

  const normalizedEmail = email ? email.toLowerCase().trim() : null;
  const existing = await User.findOne({ phoneno: providedPhone });
  if (existing) {
    throw createHttpError(409, "Account already exists. Forget password?");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phoneno: providedPhone,
    authProvider: "local",
  });

  return { token: createToken(user), user: buildUserResponse(user) };
};

export const login = async ({ phoneno, phone, password }) => {
  const providedPhone = String(phoneno || phone || "").trim();
  if (!providedPhone || !password) {
    throw createHttpError(400, "Phone number and password are required");
  }

  const user = await User.findOne({ phoneno: providedPhone });
  if (!user || !user.password) {
    throw createHttpError(401, "Invalid credentials");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw createHttpError(401, "Invalid credentials");
  }

  return { token: createToken(user), user: buildUserResponse(user) };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw createHttpError(401, "Invalid token");
  }
  return buildUserResponse(user);
};

export const updateUserProfile = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  user.name = payload.name || user.name;
  user.email = payload.email || user.email;
  user.phoneno = payload.phoneno || payload.phone || user.phoneno;

  if (payload.photo_url !== undefined) {
    user.photo = payload.photo_url;
  }

  await user.save();
  return buildUserResponse(user);
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw createHttpError(400, "currentPassword and newPassword are required");
  }

  if (String(newPassword).length < 6) {
    throw createHttpError(400, "New password must be at least 6 characters");
  }

  const user = await User.findById(userId);
  if (!user || !user.password) {
    throw createHttpError(404, "User not found");
  }

  const validPassword = await bcrypt.compare(currentPassword, user.password);
  if (!validPassword) {
    throw createHttpError(401, "Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: "Password updated successfully" };
};
