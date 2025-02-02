// ========== Packages ==========
// Initializing express
const express = require("express");
const { slotEmitter } = require("../../models/slot");

// ========== Controllers ==========
// Initializing programmeController
const slotController = require("./controllers/slotController");

// ========== Middleware ==========
// Initializing authMiddleware
//const authorizeUser = require("../../middlewares/authMiddleware");

// ========== Set-up ==========
// Initializing programmeRoutes
const slotRoutes = express.Router();

// ========== Routes ==========

slotRoutes.post('/getSlots', slotController.getSlots);

slotRoutes.post('/create', slotController.createSlotAndPayment);


// ========== Export Route ==========
// Export the programme routes to be used in other parts of the application
module.exports = slotRoutes;

