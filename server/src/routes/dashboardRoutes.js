// src/routes/dashboardRoutes.js
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get(
  '/staff/:id',
  authorize('staff', 'manager', 'admin'),
  dashboardController.staffPerformance
);
router.get('/team/:id', authorize('manager', 'admin'), dashboardController.teamPerformance);
router.get('/products', authorize('manager', 'admin'), dashboardController.productAnalysis);

module.exports = router;
