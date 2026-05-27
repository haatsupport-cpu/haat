import {
  createProductRecord,
  deleteProductRecord,
  getProductRecord,
  listProducts,
  updateProductRecord,
} from "../services/productService.js";

export const getProducts = async (req, res) => {
  const products = await listProducts();
  return res.json(products);
};

export const getProductById = async (req, res) => {
  const product = await getProductRecord(req.params.id);
  return res.json(product);
};

export const createProduct = async (req, res) => {
  const product = await createProductRecord(req.body, req.user);
  return res.status(201).json(product);
};

export const updateProduct = async (req, res) => {
  const product = await updateProductRecord(req.params.id, { ...req.body }, req.user);
  return res.json(product);
};

export const deleteProduct = async (req, res) => {
  const result = await deleteProductRecord(req.params.id, req.user);
  return res.json(result);
};
