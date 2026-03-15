const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public
router.post('/login', authController.login);

// Authenticated
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

// Admin only
router.post('/register', authenticate, requireRole(['admin']), authController.register);

// Admin + Cashier can view staff list
router.get('/staff', authenticate, requireRole(['admin', 'cashier']), authController.getStaff);

module.exports = router;
