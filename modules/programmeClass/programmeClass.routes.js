// ========== Packages ==========
// Initializing express
const express = require("express");
const { programmeClassEmitter } = require("../../models/programmeClass");

// ========== Controllers ==========
// Initializing programmeController
const programmeClassController = require("./controllers/programmeClassController");

// ========== Middleware ==========
// Initializing authMiddleware
//const authorizeUser = require("../../middlewares/authMiddleware");

// ========== Set-up ==========
// Initializing programmeRoutes
const programmeClassRoutes = express.Router();

// ========== Routes ==========

// Get all programme classes
programmeClassRoutes.get("/:id/classes", programmeClassController.getProgrammeClasses);
programmeClassRoutes.get("/:id/cart", programmeClassController.getProgrammeCartDetails);
// Get all programme fees (might need to change the path)
// programmeRoutes.get("/:id/classes/:classid", programmeController.getSpecificProgrammeClass);

// ========== Export Route ==========
// Export the programme routes to be used in other parts of the application
module.exports = programmeClassRoutes;

