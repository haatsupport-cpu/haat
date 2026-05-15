import express from "express";
import { supabaseFromRequest } from "../supabase/supabaseClient.js";

const requireAdmin = async (req, res) => {
  const accessToken = (req.headers.authorization || "").startsWith("Bearer ")
    ? req.headers.authorization.slice("Bearer ".length)
    : null;

  const supabase = supabaseFromRequest(accessToken);
  if (!supabase || !accessToken) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (profileErr) {
    res.status(500).json({ message: "Admin check failed" });
    return null;
  }

  if (profile?.role !== "admin") {
    res.status(403).json({ message: "Admin only" });
    return null;
  }

  return { supabase, accessToken, authUserId: auth.user.id };
};

// Admin Dashboard Stats
const router = express.Router();

router.get("/stats", async (req, res) => {
  const ctx = await requireAdmin(req, res);
  if (!ctx) return;

  const { supabase } = ctx;

  try {
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("total_amount,status,placed_at");

    if (ordersErr) return res.status(500).json({ message: ordersErr.message });

    const totalSales = (orders ?? []).reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);

    const { count: orderCount, error: orderCountErr } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    const { count: productCount, error: productCountErr } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    const { count: customerCount, error: customerCountErr } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer");

    if (orderCountErr) return res.status(500).json({ message: orderCountErr.message });
    if (productCountErr) return res.status(500).json({ message: productCountErr.message });
    if (customerCountErr) return res.status(500).json({ message: customerCountErr.message });

    return res.json({
      totalSales,
      orderCount: orderCount ?? 0,
      productCount: productCount ?? 0,
      customerCount: customerCount ?? 0,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});

// Recent Orders
router.get("/recent-orders", async (req, res) => {
  const ctx = await requireAdmin(req, res);
  if (!ctx) return;

  const { supabase } = ctx;

  try {
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .order("placed_at", { ascending: false })
      .limit(5);

    if (ordersErr) return res.status(500).json({ message: ordersErr.message });

    const orderIds = (orders ?? []).map((o) => o.id);
    let itemsByOrder = new Map();

    if (orderIds.length) {
      const { data: itemsRows, error: itemsErr } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsErr) return res.status(500).json({ message: itemsErr.message });

      itemsByOrder = new Map((itemsRows ?? []).map((r) => [r.order_id, r]));
    }

    
    return res.json({
      orders: orders ?? [],
    });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching orders" });
  }
});

// Get all customers
router.get("/customers", async (req, res) => {
  const ctx = await requireAdmin(req, res);
  if (!ctx) return;

  const { supabase } = ctx;

  try {
    const { data: customers, error: customersErr } = await supabase
      .from("profiles")
      .select("id, full_name, phone, photo_url, role, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (customersErr) return res.status(500).json({ message: customersErr.message });

    return res.json(customers ?? []);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching customers" });
  }
});

export default router;
