const mongoose = require("mongoose");

const chargingStationSchema = new mongoose.Schema(
  {
    stationName: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      address: String,
    },
    chargerType: {
      type: String,
      enum: ["Level1", "Level2", "DC-Fast"],
      default: "Level2",
    },
    availableChargers: {
      type: Number,
      required: true,
    },
    totalChargers: {
      type: Number,
      required: true,
    },
    operatingHours: {
      open: String, // e.g., "06:00"
      close: String, // e.g., "23:00"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChargingStation", chargingStationSchema);
