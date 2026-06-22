const Notification = require("../models/Notification");

// Helper: Create a notification and emit via socket
const createNotification = async (io, data) => {
  try {
    const notification = new Notification(data);
    await notification.save();

    // Populate for frontend
    const populated = await Notification.findById(notification._id);

    if (data.userId) {
      // Personal notification - emit to specific user
      io.emit(`notification-${data.userId}`, populated);
    } else {
      // Broadcast notification
      io.emit("notification-broadcast", populated);
    }

    return populated;
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};

// GET /api/notifications - Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { type, read, page = 1, limit = 50 } = req.query;

    const filter = {
      $or: [
        { userId: req.userId },
        { userId: null }, // broadcast notifications
      ],
    };

    if (type && type !== "all") {
      filter.type = type;
    }

    if (read === "true") {
      filter.isRead = true;
    } else if (read === "false") {
      filter.isRead = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(filter);

    res.json({ notifications, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      $or: [
        { userId: req.userId },
        { userId: null },
      ],
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notifications/mark-all-read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { userId: req.userId },
          { userId: null },
        ],
        isRead: false,
      },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export the helper for use in other controllers
exports.createNotification = createNotification;
