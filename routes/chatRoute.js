const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// Get chat history
router.get("/chat/:chatId", chatController.getChatHistory);

module.exports = router;
