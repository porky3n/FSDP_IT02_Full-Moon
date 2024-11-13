// ========== Packages ==========
// Initializing express
const express = require("express");
const { programmeEmitter } = require("../../models/programme");

// ========== Controllers ==========
// Initializing programmeController
const programmeController = require("./controllers/programmeController");

// ========== Middleware ==========
// Initializing authMiddleware
//const authorizeUser = require("../../middlewares/authMiddleware");

// ========== Set-up ==========
// Initializing programmeRoutes
const programmeRoutes = express.Router();

// ========== Routes ==========

// Get all programmes
programmeRoutes.get("/", programmeController.getAllProgrammes);

// Get featured programmes
programmeRoutes.get("/featured", programmeController.getFeaturedProgrammes);

// Search programmes by keyword
programmeRoutes.get("/search", programmeController.searchProgrammes);

// Get a programme by its ID
programmeRoutes.get("/:id", programmeController.getProgrammeByID);

// // Get schedules for a specific programme by ID
// programmeRoutes.get("/:id/schedules", programmeController.getUpcomingSchedules);

// // Get fees for a specific programme by ID
// programmeRoutes.get("/:id/fees", programmeController.getProgrammeFees);

// Get all programmes by category
programmeRoutes.get("/category/:category", programmeController.getProgrammesByCategory);

// ========== Export Route ==========
// Export the programme routes to be used in other parts of the application
module.exports = programmeRoutes;

