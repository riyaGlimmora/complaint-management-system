// src/routes/productRoutes.js
const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const productValidation = require('../validations/productValidation');

const router = express.Router();

router.use(authenticate);

router.get('/', productController.list); // any authenticated role can browse products
router.post(
  '/',
  authorize('admin'),
  validateBody(productValidation.create),
  productController.create
);
router.patch(
  '/:id',
  authorize('admin'),
  validateBody(productValidation.update),
  productController.update
);

module.exports = router;
