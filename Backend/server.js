const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const adminRoutes = require("./routes/adminRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach Socket.io instance to requests so controllers can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// MongoDB Connection
mongoose.set("bufferCommands", false);

const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  dbName: "EV_parking",
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGO_URI, mongoOptions)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
      if (err.message.includes("IP whitelist")) {
        console.error("Hint: Add your IP to MongoDB Atlas whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/");
      }
      console.log("Retrying connection in 5 seconds...");
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/slots", require("./routes/slotRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/charging", require("./routes/chargingRoutes"));
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Health
app.get("/api/health", (req, res) => {
  res.json({
    api: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Socket.io
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("slot-updated", (data) => io.emit("slot-updated", data));
  socket.on("booking-created", (data) => io.emit("booking-created", data));
  socket.on("booking-ended", (data) => io.emit("booking-ended", data));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Trying next port...`);
    server.listen(PORT + 1, () => {
      console.log(`Server running on port ${PORT + 1}`);
    });
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});