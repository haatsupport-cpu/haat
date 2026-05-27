import User from "../models/User.js";

const transformProfile = (user) => ({
  id: user._id.toString(),
  full_name: user.name,
  phoneno: user.phoneno,
  photo_url: user.photo,
  role: user.role,
  created_at: user.createdAt,
});

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: user._id.toString(),
      phoneno: user.phoneno,
      authProvider: user.authProvider,
      profile: transformProfile(user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load profile", details: err.message });
  }
};

export const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phoneno, photo_url } = req.body;
    const payload = {};

    if (full_name !== undefined) payload.name = full_name;
    if (phoneno !== undefined) payload.phoneno = phoneno;
    if (photo_url !== undefined) payload.photo = photo_url;

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const user = await User.findByIdAndUpdate(userId, payload, {
      new: true,
    }).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(transformProfile(user));
  } catch (err) {
    return res.status(500).json({ message: "Failed to update profile", details: err.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return res.json(users.map(transformProfile));
  } catch (err) {
    return res.status(500).json({ message: "Failed to list users", details: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(transformProfile(user));
  } catch (err) {
    return res.status(500).json({ message: "Failed to load user", details: err.message });
  }
};
