const express = require("express");
const {
  getDashboardStats,
  getRecentBookings,
  getRevenueAnalytics,
  getUserStatistics,
  getSlotUtilizationReport,
  getAdvancedRevenueAnalytics,
  getHeatmapAnalytics,
} = require("../controllers/adminController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// All admin routes require authentication and admin role
router.get("/dashboard/stats", authMiddleware, adminMiddleware, getDashboardStats);
router.get("/bookings/recent", authMiddleware, adminMiddleware, getRecentBookings);
router.get("/analytics/revenue", authMiddleware, adminMiddleware, getRevenueAnalytics);
router.get("/analytics/revenue/advanced", authMiddleware, adminMiddleware, getAdvancedRevenueAnalytics);
router.get("/analytics/heatmap", authMiddleware, adminMiddleware, getHeatmapAnalytics);
router.get("/analytics/users", authMiddleware, adminMiddleware, getUserStatistics);
router.get("/reports/slot-utilization", authMiddleware, adminMiddleware, getSlotUtilizationReport);

module.exports = router;
