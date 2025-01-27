// ========== Packages ==========
// Initializing express
const express = require("express");
const { programmeEmitter } = require("../../models/programme");

// ========== Controllers ==========
// Initializing telegramController
telegramController = require("./controllers/telegramController");

// ========== Middleware ==========
// Initializing authMiddleware

//const authorizeUser = require("../../middlewares/authMiddleware"); // Uncomment if authorization is required for routes

// ========== Set-up ==========
// Initializing telegramRoutes
const telegramRoutes = express.Router();

// ========== Routes ==========

// Route to announce programmes using Telegram bot and ChatGPT 4 for formatting
// telegramRoutes.post('/announce', telegramController.sendFormattedProgramme);

// // Route to send the programme image to Telegram
// telegramRoutes.get("/sendProgrammeImage/:programmeID", telegramController.sendProgrammeImage);   

// // Route to send the programme details to Telegram
telegramRoutes.get('/send/programme/:programmeID', telegramController.sendProgramme);
module.exports = telegramRoutes;