const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

router.get('/', queueController.getQueue);
router.post('/call-next', queueController.callNextQueue);
router.post('/start', queueController.startSession);
router.post('/finish', queueController.finishSession);

module.exports = router;
