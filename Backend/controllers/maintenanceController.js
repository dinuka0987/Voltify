const Maintenance = require("../models/Maintenance");
const Slot = require("../models/Slot");
const { createNotification } = require("./notificationController");

// Create maintenance record
exports.createMaintenance = async (req, res) => {
  try {
    const { slotId, stationId, issueDescription, status, scheduledDate, notes } = req.body;
    
    const maintenance = new Maintenance({
      slotId,
      stationId,
      issueDescription,
      status: status || "reported",
      scheduledDate,
      notes,
    });
    
    await maintenance.save();

    // If a slot is marked for maintenance, update its status to 'maintenance'
    if (slotId && (status === "reported" || status === "in-progress")) {
      const slot = await Slot.findById(slotId);
      if (slot) {
        slot.status = "maintenance";
        await slot.save();
        if (req.io) {
          req.io.emit("slot-updated", { slotId: slot._id, status: "maintenance" });
        }
      }
    }

    if (req.io) {
      req.io.emit("maintenance-created", maintenance);

      // Broadcast maintenance alert to all users
      await createNotification(req.io, {
        userId: null, // broadcast
        type: "system",
        priority: "warning",
        title: "Maintenance Alert",
        message: `${issueDescription || "Scheduled maintenance"} has been reported. Some slots may be temporarily unavailable.`,
        metadata: { maintenanceId: maintenance._id },
      });
    }

    res.status(201).json({ message: "Maintenance record created successfully", maintenance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all maintenance records
exports.getAllMaintenance = async (req, res) => {
  try {
    const records = await Maintenance.find()
      .populate("slotId")
      .populate("stationId")
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update maintenance record
exports.updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolvedDate, notes, scheduledDate } = req.body;

    const maintenance = await Maintenance.findById(id);
    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance record not found" });
    }

    maintenance.status = status || maintenance.status;
    maintenance.resolvedDate = resolvedDate || maintenance.resolvedDate;
    maintenance.notes = notes !== undefined ? notes : maintenance.notes;
    maintenance.scheduledDate = scheduledDate || maintenance.scheduledDate;

    // If resolved, update the slot status back to available
    if (status === "resolved") {
      maintenance.resolvedDate = new Date();
      const slot = await Slot.findById(maintenance.slotId);
      if (slot && slot.status === "maintenance") {
        slot.status = "available";
        await slot.save();
        if (req.io) {
          req.io.emit("slot-updated", { slotId: slot._id, status: "available" });
        }
      }
    }

    await maintenance.save();

    if (req.io) {
      req.io.emit("maintenance-updated", maintenance);
    }

    res.json({ message: "Maintenance record updated successfully", maintenance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete maintenance record
exports.deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMaintenance = await Maintenance.findByIdAndDelete(id);

    if (!deletedMaintenance) {
      return res.status(404).json({ message: "Maintenance record not found" });
    }

    // If the maintenance was not resolved, the slot might still be marked as 'maintenance'
    if (deletedMaintenance.slotId && deletedMaintenance.status !== "resolved") {
      const slot = await Slot.findById(deletedMaintenance.slotId);
      if (slot && slot.status === "maintenance") {
        slot.status = "available";
        await slot.save();
        if (req.io) {
          req.io.emit("slot-updated", { slotId: slot._id, status: "available" });
        }
      }
    }

    if (req.io) {
      req.io.emit("maintenance-deleted", { id });
    }

    res.json({ message: "Maintenance record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
