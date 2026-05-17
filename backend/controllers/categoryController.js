import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return res.json(
      categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        image_url: category.imageUrl,
        imageUrl: category.imageUrl,
        is_active: category.isActive,
        isActive: category.isActive,
      }))
    );
  } catch (err) {
    return res.status(500).json({ message: "Failed to load categories", details: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, image_url } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: "name and slug are required" });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      imageUrl: image_url ?? "",
      isActive: true,
    });

    return res.status(201).json({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      image_url: category.imageUrl,
      imageUrl: category.imageUrl,
      is_active: category.isActive,
      isActive: category.isActive,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create category", details: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, image_url, is_active } = req.body;
    const payload = {};

    if (name !== undefined) payload.name = name.trim();
    if (slug !== undefined) payload.slug = slug.trim().toLowerCase();
    if (image_url !== undefined) payload.imageUrl = image_url;
    if (is_active !== undefined) payload.isActive = Boolean(is_active);

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: "No category fields provided to update" });
    }

    const category = await Category.findByIdAndUpdate(id, payload, {
      new: true,
    }).lean();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      image_url: category.imageUrl,
      imageUrl: category.imageUrl,
      is_active: category.isActive,
      isActive: category.isActive,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update category", details: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.deleteOne();
    return res.json({ message: "Category deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete category", details: err.message });
  }
};
