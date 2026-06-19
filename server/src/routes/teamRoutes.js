// src/routes/teamRoutes.js
const express = require('express');
const teamController = require('../controllers/teamController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const teamValidation = require('../validations/teamValidation');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin', 'manager'), teamController.list);
router.post('/', authorize('admin'), validateBody(teamValidation.create), teamController.create);
router.get('/:id/staff', authorize('admin', 'manager'), teamController.listStaff);

module.exports = router;
