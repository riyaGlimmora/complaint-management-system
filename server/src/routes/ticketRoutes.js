// src/routes/ticketRoutes.js
const express = require('express');
const ticketController = require('../controllers/ticketController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validate');
const ticketValidation = require('../validations/ticketValidation');

const router = express.Router();

router.use(authenticate);

// Only customers raise complaints.
router.post(
  '/',
  authorize('customer'),
  validateBody(ticketValidation.create),
  ticketController.create
);

// Search/list is role-scoped inside the service - every role hits the same
// endpoint and automatically only sees what it's permitted to see.
router.get('/search', validateQuery(ticketValidation.search), ticketController.search);

router.get('/:id', ticketController.getById);

router.patch(
  '/:id/status',
  authorize('staff', 'manager', 'admin'),
  validateBody(ticketValidation.changeStatus),
  ticketController.changeStatus
);

router.patch(
  '/:id/assign',
  authorize('manager', 'admin'),
  validateBody(ticketValidation.assign),
  ticketController.assign
);

router.post(
  '/:id/comments',
  validateBody(ticketValidation.addComment),
  ticketController.addComment
);

module.exports = router;
