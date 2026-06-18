// src/controllers/productController.js
const productService = require('../services/productService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const products = await productService.listProducts();
  res.status(200).json({ data: products });
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ data: product });
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({ data: product });
});

module.exports = { list, create, update };
