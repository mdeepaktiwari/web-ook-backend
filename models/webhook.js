const mongoose = require("mongoose");

const webhookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  callback: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["subscribed", "unsubscribed"],
    default: "subscribed",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Webhook", webhookSchema);
