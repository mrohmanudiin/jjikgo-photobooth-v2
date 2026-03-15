const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/auth');

// All user routes are admin-only
router.get('/', authenticate, requireRole(['admin']), userController.getUsers);
router.post('/', authenticate, requireRole(['admin']), userController.createUser);
router.put('/:id', authenticate, requireRole(['admin']), userController.updateUser);
router.delete('/:id', authenticate, requireRole(['admin']), userController.deleteUser);

module.exports = router;
