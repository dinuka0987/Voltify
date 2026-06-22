const express = require("express");
const notificationController = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/", authMiddleware, notificationController.getUserNotifications);
router.get("/unread-count", authMiddleware, notificationController.getUnreadCount);
router.put("/mark-all-read", authMiddleware, notificationController.markAllAsRead);
router.put("/:id/read", authMiddleware, notificationController.markAsRead);
router.delete("/:id", authMiddleware, notificationController.deleteNotification);

module.exports = router;
