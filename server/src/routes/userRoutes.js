// src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validate');
const userValidation = require('../validations/userValidation');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.post('/', validateBody(userValidation.createStaffUser), userController.create);
router.get('/', validateQuery(userValidation.listUsersQuery), userController.list);

module.exports = router;
