const Slot = require("../models/Slot");
const Booking = require("../models/Booking");

// Get all available slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const slots = await Slot.find({ status: "available" }).populate("currentBookingId");
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all slots (Admin)
exports.getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find().populate("currentBookingId");
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new slot (Admin)
exports.createSlot = async (req, res) => {
  try {
    const { slotNumber, isChargingEnabled, chargingPower, location } = req.body;
    const level = req.body.level || 1;
    const vehicleType = req.body.vehicleType || undefined;

    const existingSlot = await Slot.findOne({ slotNumber });
    if (existingSlot) {
      return res.status(400).json({ message: "Slot already exists" });
    }

    const newSlot = new Slot({
      slotNumber,
      level,
      vehicleType,
      isChargingEnabled,
      chargingPower,
      location,
      status: "available",
    });

    await newSlot.save();

    // Emit real-time event
    req.io.emit("slot-updated", { slotId: newSlot._id, status: "available", action: "created" });

    res.status(201).json({ message: "Slot created successfully", slot: newSlot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update slot (Admin)
exports.updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const unsetData = {};

    if (!updateData.vehicleType) {
      delete updateData.vehicleType;
      unsetData.vehicleType = "";
    }

    const updateOperation = Object.keys(unsetData).length
      ? { $set: updateData, $unset: unsetData }
      : updateData;

    const updatedSlot = await Slot.findByIdAndUpdate(id, updateOperation, { new: true });

    if (!updatedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Emit real-time event
    req.io.emit("slot-updated", { slotId: updatedSlot._id, status: updatedSlot.status, action: "updated" });

    res.json({ message: "Slot updated successfully", slot: updatedSlot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete slot (Admin)
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSlot = await Slot.findByIdAndDelete(id);

    if (!deletedSlot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Emit real-time event
    req.io.emit("slot-updated", { slotId: id, action: "deleted" });

    res.json({ message: "Slot deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get slot by ID
exports.getSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Slot.findById(id).populate("currentBookingId");

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get slots by level (Admin dashboard)
exports.getSlotsByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const slots = await Slot.find({ level }).populate("currentBookingId");
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
