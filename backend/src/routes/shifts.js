const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');

router.post('/start', shiftController.startShift);
router.post('/:id/end', shiftController.endShift);
router.get('/current', shiftController.getCurrentShift);
router.post('/expenses', shiftController.addExpense);

module.exports = router;
