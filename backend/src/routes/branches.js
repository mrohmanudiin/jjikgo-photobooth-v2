const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

router.get('/', branchController.getBranches);
router.post('/', branchController.createBranch);
router.get('/:id/stats', branchController.getBranchStats);

module.exports = router;
