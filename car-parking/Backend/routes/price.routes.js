const express = require('express');
const router = express.Router();
const priceController = require('../controllers/price.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, priceController.getPrices);
router.post('/', verifyToken, priceController.updatePrices);

module.exports = router;