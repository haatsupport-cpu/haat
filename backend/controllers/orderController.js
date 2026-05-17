import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { generateOrderNumber } from "../utils/orderGenerator.js";

const parseNumeric = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildLineItems = async (items, session) => {
  const converted = [];

  for (const item of items) {
    const productId = item.productId ?? item.product_id ?? item.id;
    const quantity = Number(item.quantity ?? item.qty ?? 1);

    if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
      throw new Error("Invalid order item format");
    }

    const product = await Product.findById(productId).session(session);
    if (!product || !product.isActive) {
      const err = new Error("Product not found or unavailable");
      err.statusCode = 404;
      throw err;
    }

    if (product.stock < quantity) {
      const err = new Error(`Not enough stock for ${product.name}`);
      err.statusCode = 400;
      throw err;
    }

    converted.push({
      productId: product._id,
      name: product.name,
      quantity,
      unitPrice: product.price,
      total: product.price * quantity,
      imageUrl: product.imageUrl ?? "",
      category: product.category?.toString() ?? "",
      vendorId: product.vendor?.toString() ?? null,
    });
  }

  return converted;
};

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.user.id;
    const { items, totalAmount } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const subtotal = parseNumeric(totalAmount?.subtotal ?? totalAmount?.sub_total ?? 0);
    const tax = parseNumeric(totalAmount?.tax ?? 0);
    const shipping = parseNumeric(totalAmount?.shipping ?? 0);
    const total = parseNumeric(totalAmount?.total_amount ?? subtotal + tax + shipping);

    session.startTransaction();
    const lineItems = await buildLineItems(items, session);
    const order = await Order.create(
      [
        {
          userId,
          customerName: req.body.customerName ?? req.user.name,
          customerPhone: req.body.customerPhone ?? "",
          deliveryAddress: req.body.deliveryAddress ?? "",
          landmark: req.body.landmark ?? "",
          deliveryType: req.body.deliveryType ?? "instant",
          scheduledDeliveryAt: req.body.scheduledDeliveryAt ? new Date(req.body.scheduledDeliveryAt) : null,
          paymentMode: req.body.paymentMode ?? "unknown",
          promoCodeId: req.body.promoCodeId || null,
          promoDiscount: parseNumeric(req.body.promoDiscount ?? 0),
          deliveryFee: parseNumeric(req.body.deliveryFee ?? 0),
          codFee: parseNumeric(req.body.codFee ?? 0),
          subtotal: Number.isFinite(subtotal) ? subtotal : lineItems.reduce((sum, item) => sum + item.total, 0),
          totalAmount: Number.isFinite(total) ? total : lineItems.reduce((sum, item) => sum + item.total, 0),
          status: "pending",
          orderNumber: generateOrderNumber(),
          items: lineItems,
        },
      ],
      { session }
    );

    for (const item of lineItems) {
      await Product.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    const activeCart = await Cart.findOne({ user: userId, isActive: true }).session(session);
    if (activeCart) {
      activeCart.items = [];
      await activeCart.save({ session });
    }

    await session.commitTransaction();
    const createdOrder = order[0];
    return res.status(201).json({ message: "Order placed successfully", orderId: createdOrder._id.toString() });
  } catch (err) {
    await session.abortTransaction();
    return res.status(err.statusCode || 500).json({ message: "Failed to place order", details: err.message });
  } finally {
    session.endSession();
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(
      orders.map((order) => ({
        id: order._id.toString(),
        user_id: order.userId.toString(),
        status: order.status,
        total_amount: order.totalAmount,
        placed_at: order.createdAt,
        created_at: order.createdAt,
      }))
    );
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch orders", details: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Order status is required" });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order status updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update order status", details: err.message });
  }
};
