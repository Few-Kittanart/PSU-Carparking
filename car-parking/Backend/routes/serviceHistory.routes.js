const express = require('express');
const router = express.Router();
const serviceHistoryController = require('../controllers/serviceHistory.controller');

router.post('/', serviceHistoryController.createServiceHistory);
router.get('/', serviceHistoryController.getAllServiceHistories);
router.get('/:id', serviceHistoryController.getServiceHistoryById);
router.put('/:id', serviceHistoryController.updateServiceHistory);
router.delete('/:id', serviceHistoryController.deleteServiceHistory);

module.exports = router;
