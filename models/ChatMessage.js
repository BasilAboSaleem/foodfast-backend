const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true, 
  },
  sender: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
