const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');
const settingsController = require('../controllers/settingsController');
const { authenticate, requireRole, branchScope } = require('../middleware/auth');

// Helper to create CRUD routes with admin-only access
const createCrudRoutes = (path, model) => {
    router.get(`/${path}`, authenticate, requireRole(['admin']), masterDataController.getAll(model));
    router.post(`/${path}`, authenticate, requireRole(['admin']), masterDataController.createItem(model));
    router.put(`/${path}/:id`, authenticate, requireRole(['admin']), masterDataController.updateItem(model));
    router.delete(`/${path}/:id`, authenticate, requireRole(['admin']), masterDataController.deleteItem(model));
};

createCrudRoutes('packages', 'package');
createCrudRoutes('addons', 'addon');
createCrudRoutes('cafe-snacks', 'cafeSnack');
createCrudRoutes('promos', 'promo');
createCrudRoutes('themes', 'theme');

// Settings (admin can write, cashier can read)
router.get('/settings', authenticate, requireRole(['admin', 'cashier']), branchScope, settingsController.getSettings);
router.post('/settings', authenticate, requireRole(['admin']), settingsController.updateSetting);

module.exports = router;
