import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getDashboardStats = async () => {
  const totalSalesResult = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
  ]);

  const [orderCount, productCount, customerCount] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: "customer" }),
  ]);

  return {
    totalSales: totalSalesResult[0]?.totalSales ?? 0,
    orderCount,
    productCount,
    customerCount,
  };
};

export const getRecentOrders = async () => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(5).lean();
  return orders ?? [];
};

export const getCustomers = async () => {
  const customers = await User.find({ role: "customer" })
    .select("name email phoneno photo role createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return (customers ?? []).map((customer) => ({
    id: customer._id.toString(),
    full_name: customer.name,
    phoneno: customer.phoneno,
    photo_url: customer.photo,
    role: customer.role,
    email: customer.email,
    created_at: customer.createdAt,
  }));
};
