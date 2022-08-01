const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  to: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
