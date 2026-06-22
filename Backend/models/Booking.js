const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in minutes
    },
    chargingDuration: {
      type: Number, // in minutes
    },
    isChargingStarted: {
      type: Boolean,
      default: false,
    },
    chargingStartTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    parkingCost: {
      type: Number,
      default: 0,
    },
    chargingCost: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    batteryChargedPercentage: {
      type: Number,
      default: 0,
    },
    chargerType: {
      type: String,
      enum: ["AC", "DC-Fast", "Super-Fast"],
      default: "AC",
    },
    energyConsumed: {
      type: Number, // in kWh
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
