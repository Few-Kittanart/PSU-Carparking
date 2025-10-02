const express = require('express');
const router = express.Router();
// 💡 ตรวจสอบเส้นทางนี้อีกครั้ง:
const carSettingController = require('../controllers/carSetting.controller.js'); 
// ❌ ลบหรือคอมเมนต์บรรทัดนี้: const authMiddleware = require('../middleware/auth.middleware'); 

// ----------------------------------------------------
// 1. GET: ดึงข้อมูล Master Data ทั้งหมด (ไม่มี Auth)
// ----------------------------------------------------
// router.get('/', authMiddleware, carSettingController.getCarSettings); // โค้ดเดิม
router.get('/', carSettingController.getCarSettings); // 🆕 โค้ดใหม่

// ----------------------------------------------------
// 2. Brands (ยี่ห้อรถ) - ไม่มี Auth
// ----------------------------------------------------
router.post('/brands', carSettingController.addBrand);
router.delete('/brands/:id', carSettingController.deleteBrand);

// ----------------------------------------------------
// 3. Models (รุ่นรถ) - ไม่มี Auth
// ----------------------------------------------------
router.post('/models', carSettingController.addModel);
router.delete('/models/:id', carSettingController.deleteModel);

// ----------------------------------------------------
// 4. Types (ประเภทรถ) - ไม่มี Auth
// ----------------------------------------------------
router.post('/types', carSettingController.addType);
router.delete('/types/:id', carSettingController.deleteType);

// ----------------------------------------------------
// 5. Colors (สีรถ) - ไม่มี Auth
// ----------------------------------------------------
router.post('/colors', carSettingController.addColor);
router.delete('/colors/:id', carSettingController.deleteColor);


module.exports = router;