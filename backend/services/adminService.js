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
    .select("name email phoneno phone photo role createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const customerIds = customers.map((customer) => customer._id);
  const orderSummaries = customerIds.length
    ? await Order.aggregate([
        { $match: { userId: { $in: customerIds } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$userId",
            totalSpent: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "delivered"] },
                      { $ne: ["$paymentStatus", "refunded"] },
                    ],
                  },
                  { $ifNull: ["$totalAmount", 0] },
                  0,
                ],
              },
            },
            recentOrder: {
              $first: {
                orderNumber: "$orderNumber",
                totalAmount: "$totalAmount",
                status: "$status",
                createdAt: "$createdAt",
              },
            },
          },
        },
      ])
    : [];

  const summaryByCustomerId = new Map(
    orderSummaries.map((summary) => [summary._id.toString(), summary])
  );

  return (customers ?? []).map((customer) => ({
    _id: customer._id.toString(),
    id: customer._id.toString(),
    full_name: customer.name,
    name: customer.name,
    phoneno: customer.phoneno,
    phone: customer.phone || customer.phoneno || "",
    photo_url: customer.photo,
    role: customer.role,
    email: customer.email,
    created_at: customer.createdAt,
    createdAt: customer.createdAt,
    totalSpent: Number(summaryByCustomerId.get(customer._id.toString())?.totalSpent ?? 0),
    recentOrder: summaryByCustomerId.get(customer._id.toString())?.recentOrder ?? null,
  }));
};
