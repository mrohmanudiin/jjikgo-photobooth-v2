const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');

router.get('/', themeController.getThemes);

module.exports = router;
