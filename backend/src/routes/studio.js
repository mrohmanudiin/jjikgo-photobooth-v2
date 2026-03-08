const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');
const settingsController = require('../controllers/settingsController');

// Helper to create CRUD routes
const createCrudRoutes = (path, model) => {
    router.get(`/${path}`, masterDataController.getAll(model));
    router.post(`/${path}`, masterDataController.createItem(model));
    router.put(`/${path}/:id`, masterDataController.updateItem(model));
    router.delete(`/${path}/:id`, masterDataController.deleteItem(model));
};

createCrudRoutes('packages', 'package');
createCrudRoutes('addons', 'addon');
createCrudRoutes('cafe-snacks', 'cafeSnack');
createCrudRoutes('promos', 'promo');
createCrudRoutes('themes', 'theme'); // Themes already have a controller but using this for CRUD is fine

// Settings
router.get('/settings', settingsController.getSettings);
router.post('/settings', settingsController.updateSetting);

module.exports = router;
