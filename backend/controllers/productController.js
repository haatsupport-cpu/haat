import { supabaseFromRequest } from "../supabase/supabaseClient.js";

const transformProduct = (row) => ({
  id: row.id,
  name: row.name,
  price: row.price,
  category: row.category_id,
  stock: row.stock,
  imageUrl: row.image_url ?? "",
  image: row.image_url ?? "",
  icon: "",
  unit: row.unit ?? "kg",
  tag: row.tag ?? "",
  description: row.description ?? "",
});

export const getProducts = async (req, res) => {
  const supabase = supabaseFromRequest(
    (req.headers.authorization || "").startsWith("Bearer ")
      ? req.headers.authorization.slice("Bearer ".length)
      : null
  );

  // Allow public reads even without token, so we just use anon client if no token.
  const supabaseClient = supabase ?? supabaseFromRequest(null);

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("id,name,price,category_id,stock,image_url,unit,tag,description,is_active");

    if (error) return res.status(500).json({ msg: error.message });

    const rows = (data ?? []).filter((r) => r.is_active);
    return res.json(
      rows.map((row) => ({
        ...transformProduct(row),
       
        category: row.category_id,
      }))
    );
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

function requireAdminProfileRole(profile) {
  if (!profile?.role || profile.role !== "admin") {
    const e = new Error("Admin only");
    e.statusCode = 403;
    throw e;
  }
}


export const createProduct = async (req, res) => {
  const accessToken = (req.headers.authorization || "").startsWith("Bearer ")
    ? req.headers.authorization.slice("Bearer ".length)
    : null;

  const supabase = supabaseFromRequest(accessToken);
  if (!supabase) return res.status(401).json({ msg: "Missing access token" });

  try {
    const { name, category_id, price, stock, unit, tag, description } = req.body;

    if (!name || !category_id || price === undefined) {
      return res
        .status(400)
        .json({ msg: "name, category_id and price are required" });
    }

    // Role check 
    const { data: authUser, error: authUserErr } = await supabase.auth.getUser();
    if (authUserErr) return res.status(401).json({ msg: authUserErr.message });

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authUser.user.id)
      .maybeSingle();

    if (profileErr) return res.status(500).json({ msg: profileErr.message });
    requireAdminProfileRole(profile);

    const payload = {
      name,
      category_id,
      price,
      stock: stock ?? 0,
      unit: unit ?? "kg",
      tag: tag ?? "Fresh",
      description: description ?? "",
      is_active: true,
    };

    const { data, error } = await supabase.from("products").insert(payload).select("*").single();
    if (error) return res.status(400).json({ msg: error.message });

    return res.status(201).json({
      msg: "Product added successfully",
      product: {
        id: data.id,
        name: data.name,
        price: data.price,
        category: data.category_id,
        stock: data.stock,
        imageUrl: data.image_url ?? "",
        image: data.image_url ?? "",
        icon: "",
        unit: data.unit ?? "kg",
        tag: data.tag ?? "",
        description: data.description ?? "",
      },
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ msg: err.message });
  }
};

export const updateProduct = async (req, res) => {
  const accessToken = (req.headers.authorization || "").startsWith("Bearer ")
    ? req.headers.authorization.slice("Bearer ".length)
    : null;

  const supabase = supabaseFromRequest(accessToken);
  if (!supabase) return res.status(401).json({ msg: "Missing access token" });

  try {
    const { id } = req.params;

    const { data: authUser, error: authUserErr } = await supabase.auth.getUser();
    if (authUserErr) return res.status(401).json({ msg: authUserErr.message });

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authUser.user.id)
      .maybeSingle();

    if (profileErr) return res.status(500).json({ msg: profileErr.message });
    requireAdminProfileRole(profile);

    const payload = {
      ...req.body,
    };

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) return res.status(400).json({ msg: error.message });
    if (!data) return res.status(404).json({ msg: "Product not found" });

    return res.json({ msg: "Product updated successfully" });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ msg: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  const accessToken = (req.headers.authorization || "").startsWith("Bearer ")
    ? req.headers.authorization.slice("Bearer ".length)
    : null;

  const supabase = supabaseFromRequest(accessToken);
  if (!supabase) return res.status(401).json({ msg: "Missing access token" });

  try {
    const { id } = req.params;

    const { data: authUser, error: authUserErr } = await supabase.auth.getUser();
    if (authUserErr) return res.status(401).json({ msg: authUserErr.message });

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authUser.user.id)
      .maybeSingle();

    if (profileErr) return res.status(500).json({ msg: profileErr.message });
    requireAdminProfileRole(profile);

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return res.status(400).json({ msg: error.message });

    return res.json({ msg: "Product deleted successfully" });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ msg: err.message });
  }
};
