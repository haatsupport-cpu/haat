import { normalizeUploadPath, resolvePublicUrl } from "../utils/publicUrl.js";

const validatePathPrefix = (bucket, objectPath, userId) => {
  if (bucket === "profile-images") {
    // Ensure user can only upload to their own profile folder
    return objectPath.startsWith(`profiles/${userId}/`);
  }

  if (bucket === "product-images") {
    return objectPath.startsWith(`products/${userId}/`);
  }

  return false;
};

export const createUploadUrl = async (req, res) => {
  try {
    const { bucket, objectPath, expiresIn = 300 } = req.body;
    const userId = req.user.id;

    if (!bucket || !objectPath) { // Basic validation
      return res.status(400).json({ message: "bucket and objectPath are required" });
    }

    if (!validatePathPrefix(bucket, objectPath, userId)) {
      return res.status(403).json({ message: "Invalid upload path for current user" });
    }

    if (bucket === "product-images" && !["vendor", "admin"].includes(req.user.role)) {
      // Only vendors or admins can upload product images
      return res.status(403).json({ message: "Only vendor or admin can upload product images" });
    }

    const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const uploadUrl = `${baseUrl}/uploads/${bucket}/${encodeURIComponent(objectPath)}?expiresIn=${expiresIn}`;

    return res.json({ uploadUrl, bucket, objectPath, expiresIn });
  } catch (err) {
    return res.status(500).json({ message: "Failed to generate upload URL", details: err.message });
  }
};

const toPublicPath = (file) => normalizeUploadPath(file.filename);

export const uploadSingleImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image file is required",
    });
  }

  // Store only this relative path or URL in MongoDB, never image binary data.
  return res.status(201).json({
    success: true,
    image: {
      path: toPublicPath(req.file),
      url: resolvePublicUrl(toPublicPath(req.file)),
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });
};

export const uploadMultipleImages = async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({
      success: false,
      message: "At least one image file is required",
    });
  }

  return res.status(201).json({
    success: true,
    images: req.files.map((file) => ({
      path: toPublicPath(file),
      url: resolvePublicUrl(toPublicPath(file)),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    })),
  });
};
