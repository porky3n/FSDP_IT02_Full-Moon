const express = require('express');
const chatbotController = require('./controllers/chatbotController');

const router = express.Router();

// Import your chatbot controller

// Define routes
router.post('/message', chatbotController.handleChat);

module.exports = router;