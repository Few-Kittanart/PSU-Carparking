// src/routes/setting.routes.js

const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// ✅ ตรวจสอบว่าชื่อฟังก์ชันถูกต้อง
router.get('/', verifyToken, settingController.getSettings);
router.put('/', verifyToken, settingController.saveSettings);

module.exports = router;