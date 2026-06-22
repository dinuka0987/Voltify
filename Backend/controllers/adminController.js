const Booking = require("../models/Booking");
const Slot = require("../models/Slot");
const User = require("../models/User");
const ChargingRate = require("../models/ChargingRate");

// Get dashboard statistics (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalSlots = await Slot.countDocuments();
    const availableSlots = await Slot.countDocuments({ status: "available" });
    const occupiedSlots = await Slot.countDocuments({ status: "occupied" });
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeBookings = await Booking.countDocuments({ status: "active" });
    const completedBookings = await Booking.countDocuments({ status: "completed" });

    // Revenue calculation
    const completedBookingsData = await Booking.find({ status: "completed" });
    const totalRevenue = completedBookingsData.reduce((sum, booking) => sum + (booking.totalCost || 0), 0);

    res.json({
      totalSlots,
      availableSlots,
      occupiedSlots,
      totalUsers,
      activeBookings,
      completedBookings,
      totalRevenue,
      occupancyRate: totalSlots > 0 ? ((occupiedSlots / totalSlots) * 100).toFixed(2) : "0.00",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent bookings (Admin)
exports.getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("slotId")
      .populate("userId", "-password")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get revenue analytics (Admin)
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "completed" });

    const revenueByDay = {};
    bookings.forEach((booking) => {
      const date = new Date(booking.endTime).toISOString().split("T")[0];
      revenueByDay[date] = (revenueByDay[date] || 0) + booking.totalCost;
    });

    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalCost, 0);
    const averageRevenue = bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(2) : 0;

    res.json({
      totalRevenue,
      averageRevenue,
      revenueByDay,
      totalTransactions: bookings.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user statistics (Admin)
exports.getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeUsers = await User.countDocuments({ isActive: true, role: "user" });

    // Get users by vehicle type
    const usersByVehicleType = await User.aggregate([
      { $match: { role: "user" } },
      { $group: { _id: "$vehicleType", count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers,
      activeUsers,
      usersByVehicleType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get slot utilization report (Admin)
exports.getSlotUtilizationReport = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "completed" }).populate("slotId");

    const slotUtilization = {};
    bookings.forEach((booking) => {
      const slotNumber = booking.slotId.slotNumber;
      slotUtilization[slotNumber] = (slotUtilization[slotNumber] || 0) + 1;
    });

    res.json(slotUtilization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get advanced revenue analytics (Weekly, Monthly, Yearly)
exports.getAdvancedRevenueAnalytics = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "completed" });
    
    const weekly = {};
    const monthly = {};
    const yearly = {};

    bookings.forEach((booking) => {
      const date = new Date(booking.endTime);
      
      // Weekly format: "YYYY-Www"
      const startDate = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil(days / 7);
      const weekKey = `${date.getFullYear()}-W${weekNumber}`;
      weekly[weekKey] = (weekly[weekKey] || 0) + booking.totalCost;

      // Monthly format: "YYYY-MM"
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthly[monthKey] = (monthly[monthKey] || 0) + booking.totalCost;

      // Yearly format: "YYYY"
      const yearKey = `${date.getFullYear()}`;
      yearly[yearKey] = (yearly[yearKey] || 0) + booking.totalCost;
    });

    res.json({
      weekly,
      monthly,
      yearly,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get booking heatmap analytics (Day of Week vs Time of Day)
exports.getHeatmapAnalytics = async (req, res) => {
  try {
    const bookings = await Booking.find();
    
    // Matrix: 7 days x 24 hours. Initialize with 0s.
    // Index 0 = Sunday, 6 = Saturday
    const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));

    bookings.forEach((booking) => {
      const date = new Date(booking.startTime);
      const day = date.getDay(); // 0-6
      const hour = date.getHours(); // 0-23
      
      heatmap[day][hour] += 1;
    });

    res.json({ heatmap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
