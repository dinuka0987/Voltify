const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChargingStation",
    },
    issueDescription: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["reported", "in-progress", "resolved"],
      default: "reported",
    },
    scheduledDate: {
      type: Date,
    },
    resolvedDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);
