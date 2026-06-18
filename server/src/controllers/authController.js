// src/controllers/authController.js
const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ data: user });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ data: result });
});

module.exports = { register, login };
