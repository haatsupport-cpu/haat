import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const router = express.Router();

router.get(
  "/stats",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const totalSalesResult = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
    ]);
    const totalSales = totalSalesResult[0]?.totalSales ?? 0;
    const orderCount = await Order.countDocuments();
    const productCount = await Product.countDocuments();
    const customerCount = await User.countDocuments({ role: "customer" });

    return res.json({
      totalSales,
      orderCount,
      productCount,
      customerCount,
    });
  })
);

router.get(
  "/recent-orders",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.json({ orders: orders ?? [] });
  })
);

router.get(
  "/customers",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const customers = await User.find({ role: "customer" })
      .select("name email phone photo role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(
      (customers ?? []).map((customer) => ({
        id: customer._id.toString(),
        full_name: customer.name,
        phone: customer.phone,
        photo_url: customer.photo,
        role: customer.role,
        email: customer.email,
        created_at: customer.createdAt,
      }))
    );
  })
);

export default router;
