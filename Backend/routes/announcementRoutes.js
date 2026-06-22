const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// Public/User routes
router.get("/active", authMiddleware, getActiveAnnouncements);

// Admin routes
router.post("/", authMiddleware, adminMiddleware, createAnnouncement);
router.get("/", authMiddleware, adminMiddleware, getAllAnnouncements);
router.put("/:id", authMiddleware, adminMiddleware, updateAnnouncement);
router.delete("/:id", authMiddleware, adminMiddleware, deleteAnnouncement);

module.exports = router;
