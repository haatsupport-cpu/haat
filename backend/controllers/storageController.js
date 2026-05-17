const validatePathPrefix = (bucket, objectPath, userId) => {
  if (bucket === "profile-images") {
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

    if (!bucket || !objectPath) {
      return res.status(400).json({ message: "bucket and objectPath are required" });
    }

    if (!validatePathPrefix(bucket, objectPath, userId)) {
      return res.status(403).json({ message: "Invalid upload path for current user" });
    }

    if (bucket === "product-images" && !["vendor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only vendor or admin can upload product images" });
    }

    const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const uploadUrl = `${baseUrl}/uploads/${bucket}/${encodeURIComponent(objectPath)}?expiresIn=${expiresIn}`;

    return res.json({ uploadUrl, bucket, objectPath, expiresIn });
  } catch (err) {
    return res.status(500).json({ message: "Failed to generate upload URL", details: err.message });
  }
};
