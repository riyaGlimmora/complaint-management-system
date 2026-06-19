// src/controllers/userController.js
const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const user = await userService.createStaffUser(req.body);
  res.status(201).json({ data: user });
});

const list = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(req.query);
  res.status(200).json({ data: users });
});

module.exports = { create, list };
