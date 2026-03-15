const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const { authenticate, requireRole } = require('../middleware/auth');

// All branch routes are admin-only
router.get('/', authenticate, requireRole(['admin']), branchController.getBranches);
router.post('/', authenticate, requireRole(['admin']), branchController.createBranch);
router.put('/:id', authenticate, requireRole(['admin']), branchController.updateBranch);
router.delete('/:id', authenticate, requireRole(['admin']), branchController.deleteBranch);
router.get('/:id/stats', authenticate, requireRole(['admin']), branchController.getBranchStats);

module.exports = router;
