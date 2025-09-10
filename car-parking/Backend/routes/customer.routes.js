const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Route สำหรับบันทึก/สร้างข้อมูลลูกค้า (จะเรียกใช้ฟังก์ชัน createOrUpdateCustomer ใน Controller)
router.post('/', verifyToken, customerController.createOrUpdateCustomer);

// Route สำหรับดึงลูกค้าทั้งหมด
router.get('/', verifyToken, customerController.getCustomers);

// Route สำหรับดึงลูกค้าตาม id
router.get('/:id', verifyToken, customerController.getCustomerById);

// Route สำหรับชำระเงิน (ต้องใช้ PUT)
router.put('/:id/pay', verifyToken, customerController.payService);

// Route สำหรับลบลูกค้า
router.delete('/:id', verifyToken, customerController.deleteCustomer);

module.exports = router;