import Product from "../models/Product.js"

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
    // Transform to match frontend expectations
    const transformedProducts = products.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      imageUrl: product.image || "",
      icon: "", // Default empty, can be added to product model later
      unit: "kg", // Default unit, can be added to product model later
    }))
    res.json(transformedProducts)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// Add new product
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, image } = req.body
    const newProduct = new Product({ name, category, price, stock, image })
    await newProduct.save()
    
    // Return the created product with transformed format
    res.status(201).json({
      msg: "Product added successfully",
      product: {
        id: newProduct._id,
        name: newProduct.name,
        price: newProduct.price,
        category: newProduct.category,
        stock: newProduct.stock,
        imageUrl: newProduct.image || "",
        icon: "",
        unit: "kg",
      },
    })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    })
    if (!updatedProduct) {
      return res.status(404).json({ msg: "Product not found" })
    }
    res.json({ msg: "Product updated successfully" })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params
    await Product.findByIdAndDelete(id)
    res.json({ msg: "Product deleted successfully" })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}
