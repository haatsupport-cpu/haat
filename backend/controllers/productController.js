import Product from "../models/Product.js"

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
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
    res.status(201).json({ msg: "Product added successfully" })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    await Product.findByIdAndUpdate(id, req.body)
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
