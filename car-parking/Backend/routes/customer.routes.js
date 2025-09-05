const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, customerController.createCustomer);
router.get('/', verifyToken, customerController.getCustomers);
router.get('/:id', verifyToken, customerController.getCustomerById);
router.put('/:id', verifyToken, customerController.updateCustomer);
router.delete('/:id', verifyToken, customerController.deleteCustomer);

module.exports = router;
