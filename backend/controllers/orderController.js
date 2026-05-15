import { supabaseFromRequest } from "../supabase/supabaseClient.js";

const getAccessTokenFromReq = (req) => {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
};

function requireUserFromToken(supabase, req, res) {
 
  return supabase.auth
    .getUser()
    .then(({ data, error }) => {
      if (error || !data?.user) {
        res.status(401).json({ msg: "Unauthorized" });
        return null;
      }
      return data.user;
    });
}

export const createOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "userId and items are required" });
    }

    // Token auth:
    const accessToken = getAccessTokenFromReq(req);
    const supabase = supabaseFromRequest(accessToken);
    if (!supabase || !accessToken) return res.status(401).json({ msg: "Unauthorized" });

    const authUser = await requireUserFromToken(supabase, req, res);
    if (!authUser) return;

    if (authUser.id !== userId) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    // Transaction-safe flow 
    const subtotal = Number(totalAmount?.subtotal ?? totalAmount?.sub_total ?? totalAmount ?? 0);
    const tax = Number(totalAmount?.tax ?? 0);
    const shipping = Number(totalAmount?.shipping ?? 0);
    const totalAmountNum = Number(
      totalAmount?.total_amount ??
        totalAmount?.totalAmount ??
        subtotal + tax + shipping
    );

    const rpcItems = items.map((it) => ({
      product_id: it.productId ?? it.product_id ?? it.id,
      productId: it.productId ?? it.product_id ?? it.id,
      quantity: Number(it.quantity),
    }));

    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      "place_order_and_deduct_inventory",
      {
        p_user_id: userId,
        p_address_id: req.body.addressId ?? null,
        p_items: rpcItems,
        p_totals: {
          subtotal: Number.isFinite(subtotal) ? subtotal : 0,
          tax: Number.isFinite(tax) ? tax : 0,
          shipping: Number.isFinite(shipping) ? shipping : 0,
          total_amount: Number.isFinite(totalAmountNum) ? totalAmountNum : 0,
        },
      }
    );

    if (rpcErr) return res.status(400).json({ msg: rpcErr.message });

    const orderId = Array.isArray(rpcData)
      ? rpcData?.[0]?.order_id ?? rpcData?.[0]?.id
      : rpcData?.order_id;

    return res.status(201).json({
      msg: "Order placed successfully",
      orderId,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const accessToken = getAccessTokenFromReq(req);
    const supabase = supabaseFromRequest(accessToken);

    //  no token, return empty 
    if (!supabase || !accessToken) return res.json([]);

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth?.user) return res.status(401).json({ msg: "Unauthorized" });

    const { data: orders, error } = await supabase
      .from("orders")
      .select("id,user_id,address_id,status,subtotal,tax,shipping,total_amount,placed_at,created_at")
      .eq("user_id", auth.user.id)
      .order("placed_at", { ascending: false });

    if (error) return res.status(500).json({ msg: error.message });

    // Fetch order items + join product snapshot fields
    const orderIds = (orders ?? []).map((o) => o.id);
    let itemsByOrder = new Map();
    if (orderIds.length) {
      const { data: itemsRows, error: itemsErr } = await supabase
        .from("order_items")
        .select("order_id, product_id, product_name, quantity, unit, unit_price, line_total, created_at")
        .in("order_id", orderIds);

      if (itemsErr) return res.status(500).json({ msg: itemsErr.message });

      itemsByOrder = new Map((itemsRows ?? []).map((r) => [r.order_id, r]));
    }

    return res.json({
      orders: orders ?? [],
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const accessToken = getAccessTokenFromReq(req);
    const supabase = supabaseFromRequest(accessToken);
    if (!supabase || !accessToken) return res.status(401).json({ msg: "Unauthorized" });

    // Admin only
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth?.user) return res.status(401).json({ msg: "Unauthorized" });

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (profileErr) return res.status(500).json({ msg: profileErr.message });
    if (profile?.role !== "admin") return res.status(403).json({ msg: "Admin only" });

    const { error: updErr } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (updErr) return res.status(500).json({ msg: updErr.message });

    return res.json({ msg: "Order status updated successfully" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
