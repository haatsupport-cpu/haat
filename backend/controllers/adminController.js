import {
  getCustomers,
  getDashboardStats,
  getRecentOrders,
} from "../services/adminService.js";

export const getStats = async (req, res) => {
  const stats = await getDashboardStats();
  return res.json(stats);
};

export const listRecentOrders = async (req, res) => {
  const orders = await getRecentOrders();
  return res.json({ orders });
};

export const listCustomers = async (req, res) => {
  const customers = await getCustomers();
  return res.json(customers);
};
