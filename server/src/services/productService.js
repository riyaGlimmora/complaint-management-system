// src/services/productService.js
const productModel = require('../models/productModel');
const teamModel = require('../models/teamModel');
const ApiError = require('../utils/ApiError');

async function listProducts() {
  return productModel.findAll();
}

async function createProduct({ name, category, description, teamId }) {
  const team = await teamModel.findById(teamId);
  if (!team) {
    throw ApiError.badRequest('teamId does not refer to an existing team');
  }
  return productModel.create({ name, category, description, teamId });
}

async function updateProduct(id, fields) {
  const existing = await productModel.findById(id);
  if (!existing) {
    throw ApiError.notFound('Product not found');
  }
  return productModel.update(id, fields);
}

module.exports = { listProducts, createProduct, updateProduct };
