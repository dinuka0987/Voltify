const express = require("express");
const bookingController = require("../controllers/bookingController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// User routes
router.post("/", authMiddleware, bookingController.createBooking);
router.get("/user/bookings", authMiddleware, bookingController.getUserBookings);
router.put("/:bookingId/end", authMiddleware, bookingController.endBooking);
router.put("/:bookingId/start-charging", authMiddleware, bookingController.startCharging);
router.get("/:bookingId", authMiddleware, bookingController.getBookingDetails);
router.get("/active/count", bookingController.getActiveBookingsCount);

// Admin routes
router.get("/", authMiddleware, adminMiddleware, bookingController.getAllBookings);

module.exports = router;