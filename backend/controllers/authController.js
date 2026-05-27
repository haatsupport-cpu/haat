import {
  changePassword,
  getUserById,
  login,
  register,
  updateUserProfile,
} from "../services/authService.js";

export const registerUser = async (req, res) => {
  const { token, user } = await register(req.body);
  return res.status(201).json({ success: true, token, user });
};

export const loginUser = async (req, res) => {
  const { token, user } = await login(req.body);
  return res.json({ success: true, token, user });
};

export const updateProfile = async (req, res) => {
  const user = await updateUserProfile(req.user.id, req.body);
  return res.json({ success: true, user });
};

export const updatePassword = async (req, res) => {
  const result = await changePassword(req.user.id, req.body);
  return res.json({ success: true, ...result });
};

export const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  const user = await getUserById(req.user.id);
  return res.json({ success: true, user });
};

export const logoutUser = async (req, res) => {
  return res.json({ success: true, message: "Logout successful" });
};
