const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    vehicleNumber: {
      type: String,
    },
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "hatchback", "truck"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      privacyMode: {
        type: String,
        enum: ["public", "private"],
        default: "private",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);