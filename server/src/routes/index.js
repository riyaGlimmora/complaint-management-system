// src/routes/index.js
const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const teamRoutes = require('./teamRoutes');
const productRoutes = require('./productRoutes');
const ticketRoutes = require('./ticketRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/products', productRoutes);
router.use('/tickets', ticketRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

module.exports = router;
