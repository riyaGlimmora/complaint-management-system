// src/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const { validateBody } = require('../middleware/validate');
const authValidation = require('../validations/authValidation');

const router = express.Router();

router.post('/register', validateBody(authValidation.register), authController.register);
router.post('/login', validateBody(authValidation.login), authController.login);

module.exports = router;
