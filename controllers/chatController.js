const ChatMessage = require("../models/ChatMessage");

exports.getChatHistory = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await ChatMessage.find({ chatId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
