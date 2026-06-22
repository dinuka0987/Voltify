const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const ChargingRate = require("../models/ChargingRate");
const { createNotification } = require("./notificationController");

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { slotId, batteryChargedPercentage = 0, chargerType = "AC" } = req.body;

    // Check if user already has an active booking
    const existingActiveBooking = await Booking.findOne({ userId: req.userId, status: "active" });
    if (existingActiveBooking) {
      return res.status(400).json({ message: "You already have an active booking. Please end it before booking another slot." });
    }

    // Check if slot is available
    const slot = await Slot.findById(slotId);
    if (!slot || slot.status !== "available") {
      return res.status(400).json({ message: "Slot is not available" });
    }

    // Create booking
    const newBooking = new Booking({
      userId: req.userId,
      slotId,
      batteryChargedPercentage,
      chargerType,
      startTime: new Date(),
      status: "active",
    });

    await newBooking.save();

    // Update slot status
    slot.status = "occupied";
    slot.currentBookingId = newBooking._id;
    await slot.save();

    // Emit real-time events
    req.io.emit("booking-created", newBooking);
    req.io.emit("slot-updated", { slotId: slot._id, status: "occupied" });

    // Create notification
    await createNotification(req.io, {
      userId: req.userId,
      type: "booking",
      priority: "success",
      title: "Booking Confirmed",
      message: `Your slot ${slot.slotNumber} has been successfully booked. Please park your vehicle and plug in to start charging.`,
      actionUrl: "/user/home",
      actionLabel: "View Booking",
      metadata: { bookingId: newBooking._id, slotNumber: slot.slotNumber },
    });

    res.status(201).json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate("slotId")
      .populate("userId", "-password")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start charging (plug in)
exports.startCharging = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.isChargingStarted = true;
    booking.chargingStartTime = new Date();
    
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id).populate("slotId");

    req.io.emit("booking-updated", populatedBooking);

    // Create notification
    await createNotification(req.io, {
      userId: req.userId,
      type: "charging",
      priority: "normal",
      title: "Charging Started",
      message: `Your ${booking.chargerType} charging session has started at Slot ${populatedBooking.slotId?.slotNumber || "-"}.`,
      actionUrl: "/user/home",
      actionLabel: "View Session",
      metadata: { bookingId: booking._id, chargerType: booking.chargerType },
    });

    res.json({ message: "Charging started", booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// End booking (check out)
exports.endBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Calculate costs
    const endTime = new Date();
    const durationMinutes = Math.ceil((endTime - booking.startTime) / (1000 * 60));
    const durationHours = durationMinutes / 60;

    let chargingDurationMinutes = 0;
    let chargingDurationHours = 0;
    if (booking.isChargingStarted && booking.chargingStartTime) {
      chargingDurationMinutes = Math.ceil((endTime - booking.chargingStartTime) / (1000 * 60));
      chargingDurationHours = chargingDurationMinutes / 60;
    }

    const rates = await ChargingRate.findOne();

    let parkingRate = rates?.parkingRatePerHour || 5;
    let chargingRate = rates?.chargingRatePerKWh || 0.25;

    // Apply peak hour multiplier if booking overlaps with peak hours
    if (rates?.peakHourStart && rates?.peakHourEnd && rates?.peakHourMultiplier) {
      const [peakStartHour, peakStartMin] = rates.peakHourStart.split(":").map(Number);
      const [peakEndHour, peakEndMin] = rates.peakHourEnd.split(":").map(Number);
      
      const startMinOfDay = booking.startTime.getHours() * 60 + booking.startTime.getMinutes();
      const endMinOfDay = endTime.getHours() * 60 + endTime.getMinutes();
      const peakStartOfDay = peakStartHour * 60 + peakStartMin;
      const peakEndOfDay = peakEndHour * 60 + peakEndMin;

      // Simplistic check for overlap
      const overlaps = (startMinOfDay <= peakEndOfDay && endMinOfDay >= peakStartOfDay);
      
      if (overlaps) {
        parkingRate *= rates.peakHourMultiplier;
        chargingRate *= rates.peakHourMultiplier;
      }
    }

    let parkingCost = durationHours * parkingRate;
    if (parkingCost < (rates?.minimumParkingCharge || 2)) {
      parkingCost = rates?.minimumParkingCharge || 2;
    }

    // Calculate energy consumed based on charger type and CHARGING duration
    const chargerPowerMap = { "AC": 7.4, "DC-Fast": 50, "Super-Fast": 150 };
    const chargerPower = chargerPowerMap[booking.chargerType] || 7.4;
    const energyConsumed = Number((chargerPower * chargingDurationHours).toFixed(2));
    
    // Cost based on energy consumed
    const chargingCost = energyConsumed * chargingRate;

    // If charging never started, it's essentially a cancellation
    if (!booking.isChargingStarted) {
      parkingCost = 0;
      booking.status = "cancelled";
    } else {
      booking.status = "completed";
    }

    // Update booking
    booking.endTime = endTime;
    booking.duration = durationMinutes;
    booking.chargingDuration = chargingDurationMinutes;
    booking.energyConsumed = energyConsumed;
    booking.parkingCost = parkingCost;
    booking.chargingCost = chargingCost;
    booking.totalCost = parkingCost + chargingCost;

    await booking.save();

    // Free up slot
    const slot = await Slot.findById(booking.slotId);
    if (slot) {
      slot.status = "available";
      slot.currentBookingId = null;
      await slot.save();

      // Emit real-time events
      req.io.emit("slot-updated", { slotId: slot._id, status: "available" });
    }

    req.io.emit("booking-ended", booking);

    // Create notification
    if (booking.status === "cancelled") {
      await createNotification(req.io, {
        userId: booking.userId,
        type: "booking",
        priority: "warning",
        title: "Booking Cancelled",
        message: `Your booking for Slot ${slot?.slotNumber || "-"} has been cancelled.`,
        actionUrl: "/user/home",
        actionLabel: "Book Again",
        metadata: { bookingId: booking._id },
      });
    } else {
      await createNotification(req.io, {
        userId: booking.userId,
        type: "charging",
        priority: "success",
        title: "Charging Completed",
        message: `Session complete! Energy: ${energyConsumed} kWh. Total cost: $${booking.totalCost.toFixed(2)}.`,
        actionUrl: "/user/charging",
        actionLabel: "View History",
        metadata: { bookingId: booking._id, energyConsumed, totalCost: booking.totalCost },
      });

      // Payment notification
      await createNotification(req.io, {
        userId: booking.userId,
        type: "payment",
        priority: "success",
        title: "Payment Processed",
        message: `Payment of $${booking.totalCost.toFixed(2)} was successfully processed (Parking: $${parkingCost.toFixed(2)}, Charging: $${chargingCost.toFixed(2)}).`,
        actionUrl: "/user/charging",
        actionLabel: "View Receipt",
        metadata: { bookingId: booking._id, parkingCost, chargingCost, totalCost: booking.totalCost },
      });
    }

    res.json({ message: "Booking ended successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("slotId")
      .populate("userId", "-password")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate("slotId")
      .populate("userId", "-password");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active bookings count
exports.getActiveBookingsCount = async (req, res) => {
  try {
    const count = await Booking.countDocuments({ status: "active" });
    res.json({ activeBookings: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
