import express from "express"
import Cart from "../models/Cart.js"
import Product from "../models/Product.js"

const router = express.Router()

// Helper function to transform cart items to frontend format
const transformCartItems = (items) => {
  return items.map((item) => ({
    id: item.product._id || item.product.id,
    cartItemId: item._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    imageUrl: item.product.image || item.product.imageUrl || "",
    unit: item.product.unit || "kg",
    tag: item.product.tag || "",
    category: item.product.category || "",
  }))
}

// ✅ Get cart (simple endpoint - requires userId in query)
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId
    if (!userId) {
      return res.json([])
    }
    const cart = await Cart.findOne({ user: userId }).populate("items.product")
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.json([])
    }
    // Transform to frontend format
    const items = transformCartItems(cart.items)
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart", error: err.message })
  }
})

// ✅ Get cart by user ID
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate(
      "items.product"
    )
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.json([])
    }
    // Transform to frontend format
    const items = transformCartItems(cart.items)
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart", error: err.message })
  }
})

// ✅ Add item to cart (simple endpoint)
router.post("/", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "userId and productId are required" })
    }

    let cart = await Cart.findOne({ user: userId })
    const product = await Product.findById(productId)

    if (!product) return res.status(404).json({ message: "Product not found" })

    if (!cart) {
      cart = new Cart({ user: userId, items: [] })
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    )

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += quantity || 1
    } else {
      cart.items.push({ product: productId, quantity: quantity || 1 })
    }

    await cart.save()
    const populatedCart = await cart.populate("items.product")

    // Transform to frontend format
    const items = transformCartItems(populatedCart.items)
    res.json(items)
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: err.message })
  }
})

// ✅ Add item to cart (original endpoint)
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body

    let cart = await Cart.findOne({ user: userId })
    const product = await Product.findById(productId)

    if (!product) return res.status(404).json({ message: "Product not found" })

    if (!cart) {
      cart = new Cart({ user: userId, items: [] })
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    )

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity += quantity
    } else {
      cart.items.push({ product: productId, quantity })
    }

    await cart.save()
    res.json(await cart.populate("items.product"))
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: err.message })
  }
})

// ✅ Update item quantity (simple endpoint using cartItemId or productId)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { userId, quantity } = req.body

    if (!userId) {
      return res.status(400).json({ message: "userId is required" })
    }

    const cart = await Cart.findOne({ user: userId })
    if (!cart) return res.status(404).json({ message: "Cart not found" })

    // Try to find by cartItemId first, then by productId
    const item = cart.items.find(
      (item) => item._id.toString() === id || item.product.toString() === id
    )
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" })

    item.quantity = quantity
    await cart.save()

    const populatedCart = await cart.populate("items.product")
    // Transform to frontend format
    const items = transformCartItems(populatedCart.items)
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: "Error updating cart", error: err.message })
  }
})

// ✅ Update item quantity (original endpoint)
router.put("/update", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body

    const cart = await Cart.findOne({ user: userId })
    if (!cart) return res.status(404).json({ message: "Cart not found" })

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    )
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" })

    item.quantity = quantity
    await cart.save()

    res.json(await cart.populate("items.product"))
  } catch (err) {
    res.status(500).json({ message: "Error updating cart", error: err.message })
  }
})

// ✅ Remove item from cart (simple endpoint)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.query.userId

    if (!userId) {
      return res.status(400).json({ message: "userId is required in query" })
    }

    const cart = await Cart.findOne({ user: userId })
    if (!cart) return res.status(404).json({ message: "Cart not found" })

    // Remove by cartItemId or productId
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== id && item.product.toString() !== id
    )

    await cart.save()
    const populatedCart = await cart.populate("items.product")
    // Transform to frontend format
    const items = transformCartItems(populatedCart.items)
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: "Error removing item", error: err.message })
  }
})

// ✅ Remove item from cart (original endpoint)
router.delete("/remove/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params
    const cart = await Cart.findOne({ user: userId })
    if (!cart) return res.status(404).json({ message: "Cart not found" })

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    )

    await cart.save()
    res.json(await cart.populate("items.product"))
  } catch (err) {
    res.status(500).json({ message: "Error removing item", error: err.message })
  }
})

export default router
