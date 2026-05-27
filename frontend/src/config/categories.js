export const DEFAULT_CATEGORY_OPTIONS = [
  { id: "Vegetables", name: "Vegetables" },
  { id: "Fruits", name: "Fruits" },
  { id: "Groceries", name: "Groceries" },
  { id: "Meat & Eggs", name: "Meat & Eggs" },
  { id: "Dairy & Bakery", name: "Dairy & Bakery" },
  { id: "Beverages", name: "Beverages" },
  { id: "Snacks", name: "Snacks" },
  { id: "Frozen Foods", name: "Frozen Foods" },
  { id: "Instant Foods", name: "Instant Foods" },
  { id: "Personal Care", name: "Personal Care" },
  { id: "Household", name: "Household" },
  { id: "Baby Care", name: "Baby Care" },
  { id: "Smoking", name: "Smoking" },
];

export const CATEGORY_LABEL_MAP = {
  Vegetables: "🥦 Vegetables",
  Fruits: "🍎 Fruits",
  Groceries: "🛒 Groceries",
  "Meat & Eggs": "🥩 Meat & Eggs",
  "Dairy & Bakery": "🥛 Dairy & Bakery",
  Beverages: "🥤 Beverages & Alcohol",
  Snacks: "🍪 Snacks",
  "Frozen Foods": "🧊 Frozen Foods",
  "Instant Foods": "🍜 Instant Foods",
  "Personal Care": "🧴 Personal Care",
  Household: "🧹 Household",
  "Baby Care": "🍼 Baby Care",
  Smoking: "🚬 Cigarettes & Tobacco",
};

export function getCategoryId(category) {
  return String(category?._id || category?.id || "");
}

export function getCategoryName(category) {
  return category?.name || category?.title || category?.category_name || "Uncategorized";
}

export function getCategoryDisplayLabel(name) {
  return CATEGORY_LABEL_MAP[name] || name;
}

export function mergeCategoryOptions(apiCategories = []) {
  const merged = [...apiCategories, ...DEFAULT_CATEGORY_OPTIONS];
  const seen = new Set();

  return merged.filter((category) => {
    const key = getCategoryName(category).trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getProductCategoryId(product) {
  return String(
    product?.category_id ||
      product?.categoryId ||
      product?.category?._id ||
      product?.category?.id ||
      ""
  );
}

export function getProductCategoryLabel(product, categoryOptions = []) {
  const categoryFromObject = product?.category?.name || product?.category?.title || product?.category?.category_name;
  if (categoryFromObject) return categoryFromObject;
  if (typeof product?.category === "string") return product.category;

  const productCategoryId = getProductCategoryId(product);
  if (!productCategoryId) return "Uncategorized";

  const matched = categoryOptions.find((category) => getCategoryId(category) === productCategoryId);
  return matched ? getCategoryName(matched) : "Uncategorized";
}
