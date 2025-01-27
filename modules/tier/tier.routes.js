// ========== Packages ==========
// Initializing express
const express = require("express");
const { tierEmitter } = require("../../models/tier");

// ========== Controllers ==========
// Initializing programmeController
const tierController = require("./controllers/tierController");

// ========== Middleware ==========
// Initializing authMiddleware
//const authorizeUser = require("../../middlewares/authMiddleware");

// ========== Set-up ==========
// Initializing programmeRoutes
const tierRoutes = express.Router();

// ========== Routes ==========


tierRoutes.put('/:accountId/checkMembership', tierController.checkAndResetMembershipForAccount);


// ========== Export Route ==========
// Export the programme routes to be used in other parts of the application
module.exports = tierRoutes;

