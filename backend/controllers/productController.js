import Product from "../models/Product.js";

const transformProduct = (product) => ({
  id: product._id.toString(),
  name: product.name,
  description: product.description ?? "",
  price: product.price,
  stock: product.stock,
  category_id: product.category?.toString() ?? null,
  categoryId: product.category?.toString() ?? null,
  vendor_id: product.vendor?.toString() ?? null,
  vendorId: product.vendor?.toString() ?? null,
  image_url: product.imageUrl ?? null,
  imageUrl: product.imageUrl ?? null,
  is_active: product.isActive,
  isActive: product.isActive,
  created_at: product.createdAt,
  updated_at: product.updatedAt,
});

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return res.json(products.map(transformProduct));
  } catch (err) {
    return res.status(500).json({ message: "Failed to load products", details: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category_id, price, stock, image_url, description, is_active, vendor_id } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!name || !category_id || price === undefined) {
      return res.status(400).json({ message: "name, category_id and price are required" });
    }

    const ownerId = role === "admin" ? vendor_id ?? userId : userId;
    if (role === "vendor" && vendor_id && vendor_id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description ?? "",
      price: Number(price),
      stock: Number(stock ?? 0),
      category: category_id,
      vendor: ownerId,
      imageUrl: image_url ?? "",
      isActive: is_active !== undefined ? Boolean(is_active) : true,
    });

    return res.status(201).json(transformProduct(product));
  } catch (err) {
    return res.status(500).json({ message: "Failed to create product", details: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const payload = { ...req.body };

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (role === "vendor" && product.vendor?.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (role !== "admin" && payload.vendor_id && payload.vendor_id !== userId) {
      delete payload.vendor_id;
    }

    if (payload.name !== undefined) product.name = payload.name;
    if (payload.description !== undefined) product.description = payload.description;
    if (payload.price !== undefined) product.price = Number(payload.price);
    if (payload.stock !== undefined) product.stock = Number(payload.stock);
    if (payload.category_id !== undefined) product.category = payload.category_id;
    if (payload.image_url !== undefined) product.imageUrl = payload.image_url;
    if (payload.is_active !== undefined) product.isActive = Boolean(payload.is_active);
    if (role === "admin" && payload.vendor_id !== undefined) product.vendor = payload.vendor_id;

    await product.save();
    return res.json(transformProduct(product));
  } catch (err) {
    return res.status(500).json({ message: "Failed to update product", details: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (role === "vendor" && product.vendor?.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await product.deleteOne();
    return res.json({ message: "Product deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete product", details: err.message });
  }
};
