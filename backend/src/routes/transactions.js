const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, requireRole, branchScope } = require('../middleware/auth');

// Get all (admin filter by branch_id + date; cashier = their branch)
router.get('/', authenticate, requireRole(['admin', 'cashier']), branchScope, transactionController.getAllTransactions);

// Create new transaction
router.post('/', authenticate, requireRole(['cashier', 'admin']), branchScope, transactionController.createTransaction);

// Update queue/order status
router.put('/:id/status', authenticate, requireRole(['cashier', 'staff', 'admin']), branchScope, transactionController.updateOrderStatus);

// Delete transaction (admin only)
router.delete('/:id', authenticate, requireRole(['admin']), transactionController.deleteTransaction);

module.exports = router;
