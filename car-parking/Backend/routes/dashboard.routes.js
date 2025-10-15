const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

// Executive Summary
router.get("/summary", dashboardController.getExecutiveSummary);

// Revenue by day
router.get("/revenue-by-slot", dashboardController.getRevenueBySlot);

// Customer Segments
router.get("/customer-segments", dashboardController.getCustomerSegments);

// Revenue Breakdown
router.get("/revenue-breakdown", dashboardController.getRevenueBreakdown);

// Active Sessions by Day
router.get("/active-sessions", dashboardController.getActiveSessionsByDay);

// Monthly Trend
router.get("/monthly-trend", dashboardController.getMonthlyTrend);

// Top Customers
router.get("/top-customers", dashboardController.getTopCustomers);

// Top Services
router.get("/services-by-count", dashboardController.getServicesByCount);

// Average Service Duration
router.get("/avg-service-duration", dashboardController.getAvgServiceDuration);

// Alerts (optional)
router.get("/alerts", dashboardController.getAlerts);

// Revenue by Payment Method
router.get("/revenue-by-payment-method", dashboardController.getRevenueByPaymentMethod);

module.exports = router;
