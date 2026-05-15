import { supabaseFromRequest } from "../supabase/supabaseClient.js";

const getAccessTokenFromReq = (req) => {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
};

const transformCartItems = (rows) => {
  // rows are joined with products for frontend compatibility
  return rows.map((row) => ({
    id: row.product_id,
    cartItemId: row.id, // cart_items.id
    name: row.product_name,
    price: row.product_price,
    quantity: row.quantity,
    imageUrl: row.product_image_url ?? "",
    unit: row.product_unit ?? "kg",
    tag: row.product_tag ?? "",
    category: row.product_category_id ?? "",
  }));
};


export const getCart = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.json([]);

  // If a userId is provided,  only allow when it matches the caller's auth user (when token exists).
  const accessToken = getAccessTokenFromReq(req);
  const supabase = supabaseFromRequest(accessToken);

  try {
    if (supabase && accessToken) {
      const { data: auth, error: authErr } = await supabase.auth.getUser();
      if (authErr || !auth?.user) return res.status(401).json({ message: "Unauthorized" });
      if (auth.user.id !== userId) return res.status(403).json({ message: "Forbidden" });
    }

    // Read from cart tables
    const { data, error } = await (supabase ?? supabaseFromRequest(null)).from("carts").select("id").eq("user_id", userId).maybeSingle();
    if (error) return res.status(500).json({ message: "Error fetching cart", error: error.message });
    if (!data?.id) return res.json([]);

    const cartId = data.id;

    // join cart_items with products
    const { data: items, error: itemsErr } = await (supabase ?? supabaseFromRequest(null))
      .from("cart_items")
      .select("id, quantity, product_id, product:products(id, name, price, stock, image_url, unit, tag, category_id)")
      .eq("cart_id", cartId);

    if (itemsErr) return res.status(500).json({ message: "Error fetching cart", error: itemsErr.message });

    // map to frontend expectations
    const transformed = (items ?? []).map((item) => ({
      ...item,
      product_id: item.product_id,
      product_name: item.product?.name,
      product_price: item.product?.price,
      product_image_url: item.product?.image_url,
      product_unit: item.product?.unit,
      product_tag: item.product?.tag,
      product_category_id: item.product?.category_id,
    }));

    return res.json(transformCartItems(transformed));
  } catch (err) {
    return res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
};


export const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: "userId and productId are required" });
  }

  const accessToken = getAccessTokenFromReq(req);
  const supabase = supabaseFromRequest(accessToken);
  if (!supabase || !accessToken) return res.status(401).json({ message: "Unauthorized" });

  // Ensure caller matches userId
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) return res.status(401).json({ message: "Unauthorized" });
  if (auth.user.id !== userId) return res.status(403).json({ message: "Forbidden" });

  try {
    // Ensure product exists
    const { data: product, error: productErr } = await supabase
      .from("products")
      .select("id, price, unit, tag, category_id, image_url, is_active, stock")
      .eq("id", productId)
      .maybeSingle();

    if (productErr) return res.status(500).json({ message: "Product lookup failed", error: productErr.message });
    if (!product || product.is_active === false) return res.status(404).json({ message: "Product not found" });

    const qty = quantity && Number(quantity) > 0 ? Number(quantity) : 1;

    // Upsert cart for user 
    const { data: cart, error: cartErr } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (cartErr) return res.status(500).json({ message: "Cart lookup failed", error: cartErr.message });

    let cartId = cart?.id;
    if (!cartId) {
      const { data: newCart, error: newCartErr } = await supabase
        .from("carts")
        .insert({ user_id: userId, is_active: true })
        .select("id")
        .maybeSingle();

      if (newCartErr) return res.status(500).json({ message: "Cart create failed", error: newCartErr.message });
      cartId = newCart.id;
    }

    // Upsert cart item (by productId)
    const { data: existingItem, error: existingErr } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingErr) return res.status(500).json({ message: "Cart item lookup failed", error: existingErr.message });

    if (existingItem) {
      const newQty = existingItem.quantity + qty;

      const { error: updErr } = await supabase
        .from("cart_items")
        .update({ quantity: newQty, price: product.price, unit: product.unit ?? "kg" })
        .eq("id", existingItem.id);

      if (updErr) return res.status(500).json({ message: "Cart item update failed", error: updErr.message });
    } else {
      const { error: insErr } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity: qty,
          price: product.price,
          unit: product.unit ?? "kg",
        });

      if (insErr) return res.status(500).json({ message: "Cart item insert failed", error: insErr.message });
    }

    // Fetch updated cart and return
    return await getCartInternal(supabase, cartId, res);
  } catch (err) {
    return res.status(500).json({ message: "Error adding to cart", error: err.message });
  }
};

async function getCartInternal(supabase, cartId, res) {
  const { data: items, error: itemsErr } = await supabase
    .from("cart_items")
    .select("id, quantity, product_id, product:products(id, name, price, image_url, unit, tag, category_id)")
    .eq("cart_id", cartId);

  if (itemsErr) return res.status(500).json({ message: "Error fetching cart", error: itemsErr.message });

  const transformed = (items ?? []).map((item) => ({
    ...item,
    product_name: item.product?.name,
    product_price: item.product?.price,
    product_image_url: item.product?.image_url,
    product_unit: item.product?.unit,
    product_tag: item.product?.tag,
    product_category_id: item.product?.category_id,
  }));

  return res.json(transformCartItems(transformed));
}


export const updateCartItemQuantityById = async (req, res) => {
  const { id } = req.params;
  const { userId, quantity } = req.body;

  if (!userId) return res.status(400).json({ message: "userId is required" });

  const accessToken = getAccessTokenFromReq(req);
  const supabase = supabaseFromRequest(accessToken);
  if (!supabase || !accessToken) return res.status(401).json({ message: "Unauthorized" });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user || auth.user.id !== userId) return res.status(403).json({ message: "Forbidden" });

  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: "Invalid quantity" });

  // Ensure item belongs to user's cart
  const { data: item, error: itemErr } = await supabase
    .from("cart_items")
    .select("id, cart_id")
    .eq("id", id)
    .maybeSingle();

  if (itemErr) return res.status(500).json({ message: "Item lookup failed", error: itemErr.message });
  if (!item) return res.status(404).json({ message: "Item not found in cart" });

  const { data: cart, error: cartErr } = await supabase
    .from("carts")
    .select("id")
    .eq("id", item.cart_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (cartErr) return res.status(500).json({ message: "Cart lookup failed", error: cartErr.message });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const { error: updErr } = await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
  if (updErr) return res.status(500).json({ message: "Error updating cart", error: updErr.message });

  return await getCartInternal(supabase, cart.id, res);
};

// update by productId for easier frontend usage without cartItemId
export const updateCartItemQuantityByProduct = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  if (!userId) return res.status(400).json({ message: "userId is required" });
  if (!productId) return res.status(400).json({ message: "productId is required" });

  const accessToken = getAccessTokenFromReq(req);
  const supabase = supabaseFromRequest(accessToken);
  if (!supabase || !accessToken) return res.status(401).json({ message: "Unauthorized" });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user || auth.user.id !== userId) return res.status(403).json({ message: "Forbidden" });

  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: "Invalid quantity" });

  const { data: cart, error: cartErr } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (cartErr) return res.status(500).json({ message: "Cart lookup failed", error: cartErr.message });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const { error: updErr } = await supabase
    .from("cart_items")
    .update({ quantity: qty })
    .eq("cart_id", cart.id)
    .eq("product_id", productId);

  if (updErr) return res.status(500).json({ message: "Error updating cart", error: updErr.message });

  return await getCartInternal(supabase, cart.id, res);
};

// DELETE by cartItemId
export const removeCartItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId;

  if (!userId) return res.status(400).json({ message: "userId is required in query" });

  const accessToken = getAccessTokenFromReq(req);
  const supabase = supabaseFromRequest(accessToken);
  if (!supabase || !accessToken) return res.status(401).json({ message: "Unauthorized" });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user || auth.user.id !== userId) return res.status(403).json({ message: "Forbidden" });

  // Find cart
  const { data: cart, error: cartErr } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (cartErr) return res.status(500).json({ message: "Cart lookup failed", error: cartErr.message });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  // Delete by cart_item.id OR product_id
  
  const { data: itemRow } = await supabase
    .from("cart_items")
    .select("id")
    .eq("id", id)
    .eq("cart_id", cart.id)
    .maybeSingle();

  const { error: delErr } = itemRow
    ? await supabase.from("cart_items").delete().eq("id", id)
    : await supabase.from("cart_items").delete().eq("cart_id", cart.id).eq("product_id", id);

  if (delErr) return res.status(500).json({ message: "Error removing item", error: delErr.message });

  return await getCartInternal(supabase, cart.id, res);
};

// DELETE by productId for easier frontend usage without cartItemId
export const removeCartItemByProduct = async (req, res) => {
  const { userId, productId } = req.params;

  const accessToken = getAccessTokenFromReq(req);
  const supabase = supabaseFromRequest(accessToken);
  if (!supabase || !accessToken) return res.status(401).json({ message: "Unauthorized" });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user || auth.user.id !== userId) return res.status(403).json({ message: "Forbidden" });

  const { data: cart, error: cartErr } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (cartErr) return res.status(500).json({ message: "Cart lookup failed", error: cartErr.message });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const { error: delErr } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id)
    .eq("product_id", productId);

  if (delErr) return res.status(500).json({ message: "Error removing item", error: delErr.message });

  return await getCartInternal(supabase, cart.id, res);
};
