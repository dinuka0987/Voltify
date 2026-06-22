const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: true,
      unique: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },
    isChargingEnabled: {
      type: Boolean,
      default: true,
    },
    chargingPower: {
      type: Number, // in kW
      default: 7.4,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "hatchback", "truck"],
    },
    currentBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slot", parkingSlotSchema);
