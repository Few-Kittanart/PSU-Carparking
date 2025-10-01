const express = require('express');
const router = express.Router();
// 1. นำเข้า Controller ที่เพิ่งแก้ไขไป (dashboard.controller.js)
const dashboardController = require('../controllers/dashboard.controller');

/**
 * @route GET /api/dashboard/summary
 * @desc ดึงข้อมูลสรุปผู้บริหาร (KPIs)
 * @access Private (ควรมีการตรวจสอบสิทธิ์ เช่น verifyToken หากมีการนำไปใช้)
 */
router.get('/summary', dashboardController.getExecutiveSummary);

/**
 * @route GET /api/dashboard/revenue-by-slot
 * @desc ดึงข้อมูลรายได้ตามช่วงเวลา (Line Chart)
 */
router.get('/revenue-by-slot', dashboardController.getRevenueBySlot);

/**
 * @route GET /api/dashboard/sessions-by-hour
 * @desc ดึงข้อมูลจำนวนการใช้บริการตามชั่วโมง (Bar Chart)
 */
router.get('/sessions-by-hour', dashboardController.getSessionsByHour);

/**
 * @route GET /api/dashboard/customer-segments
 * @desc ดึงข้อมูลส่วนแบ่งลูกค้า (Pie Chart)
 */
router.get('/customer-segments', dashboardController.getCustomerSegments);

module.exports = router;
