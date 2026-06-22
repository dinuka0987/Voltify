const Announcement = require("../models/Announcement");
const { createNotification } = require("./notificationController");

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, type, isActive, expiresAt } = req.body;
    const announcement = new Announcement({
      title,
      message,
      type,
      isActive,
      expiresAt,
    });
    await announcement.save();

    // Emit real-time event to all connected clients
    if (req.io) {
      req.io.emit("announcement-created", announcement);

      // Broadcast system notification to all users
      await createNotification(req.io, {
        userId: null, // broadcast
        type: "system",
        priority: type === "maintenance" ? "warning" : "normal",
        title: title,
        message: message,
        metadata: { announcementId: announcement._id, type },
      });
    }

    res.status(201).json({ message: "Announcement created successfully", announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all announcements (Admin view)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active announcements (User view - Notification bell)
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (req.io) {
      req.io.emit("announcement-updated", updatedAnnouncement);
    }

    res.json({ message: "Announcement updated successfully", announcement: updatedAnnouncement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (req.io) {
      req.io.emit("announcement-deleted", { id });
    }

    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
