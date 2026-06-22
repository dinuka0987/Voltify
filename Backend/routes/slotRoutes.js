const express = require("express");
const slotController = require("../controllers/slotController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/available", slotController.getAvailableSlots);
router.get("/:id", slotController.getSlotById);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, slotController.getAllSlots);
router.post("/", authMiddleware, adminMiddleware, slotController.createSlot);
router.put("/:id", authMiddleware, adminMiddleware, slotController.updateSlot);
router.delete("/:id", authMiddleware, adminMiddleware, slotController.deleteSlot);
router.get("/level/:level", authMiddleware, adminMiddleware, slotController.getSlotsByLevel);

module.exports = router;