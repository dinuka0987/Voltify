const mongoose = require("mongoose");

const chargingRateSchema = new mongoose.Schema(
  {
    parkingRatePerHour: {
      type: Number,
      required: true,
      default: 5, // dollars per hour
    },
    chargingRatePerKWh: {
      type: Number,
      required: true,
      default: 0.25, // dollars per kWh
    },
    peakHourStart: {
      type: String, // e.g., "08:00"
      default: "08:00",
    },
    peakHourEnd: {
      type: String, // e.g., "18:00"
      default: "18:00",
    },
    peakHourMultiplier: {
      type: Number,
      default: 1.5,
    },
    minimumParkingCharge: {
      type: Number,
      default: 2,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChargingRate", chargingRateSchema);
