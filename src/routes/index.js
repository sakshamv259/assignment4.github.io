const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const { attachUser } = require('../middleware/auth');

// Apply the attachUser middleware to all routes
router.use(attachUser);

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/events', eventRoutes);

// 404 route
router.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

module.exports = router; 