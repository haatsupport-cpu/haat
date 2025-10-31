import Order from "../models/Order.js"

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount } = req.body
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      status: "pending",
      date: new Date(),
    })
    await newOrder.save()
    res.status(201).json({ msg: "Order placed successfully" })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId")
      .populate("items.productId")
    res.json(orders)
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    await Order.findByIdAndUpdate(id, { status })
    res.json({ msg: "Order status updated successfully" })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
}
