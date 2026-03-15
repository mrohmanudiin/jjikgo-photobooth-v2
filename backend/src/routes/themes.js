const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { authenticate, requireRole, branchScope } = require('../middleware/auth');

// Theme viewing (branch scoped for non-admin)
router.get('/', authenticate, branchScope, themeController.getThemes);

module.exports = router;
