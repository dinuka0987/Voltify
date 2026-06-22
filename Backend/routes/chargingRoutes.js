const express = require("express");
const chargingController = require("../controllers/chargingController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/rates", chargingController.getChargingRates);
router.get("/stations", chargingController.getChargingStations);
router.get("/nearest", chargingController.getNearestStation);

// Admin routes
router.put("/rates", authMiddleware, adminMiddleware, chargingController.updateChargingRates);
router.post("/stations", authMiddleware, adminMiddleware, chargingController.createChargingStation);
router.put("/stations/:stationId", authMiddleware, adminMiddleware, chargingController.updateChargingStation);

module.exports = router;
