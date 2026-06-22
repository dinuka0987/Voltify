const express = require("express");
const router = express.Router();
const {
  createMaintenance,
  getAllMaintenance,
  updateMaintenance,
  deleteMaintenance,
} = require("../controllers/maintenanceController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// Admin routes for maintenance
router.post("/", authMiddleware, adminMiddleware, createMaintenance);
router.get("/", authMiddleware, adminMiddleware, getAllMaintenance);
router.put("/:id", authMiddleware, adminMiddleware, updateMaintenance);
router.delete("/:id", authMiddleware, adminMiddleware, deleteMaintenance);

module.exports = router;
