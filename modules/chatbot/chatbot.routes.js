const express = require('express');
const chatbotController = require('./controllers/chatbotController');

const router = express.Router();

// Import your chatbot controller

// Define routes
router.post('/message/user', chatbotController.handleUserChat);
router.post('/message/admin', chatbotController.handleAdminChat);

module.exports = router;