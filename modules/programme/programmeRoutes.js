// ========== Packages ==========
const express = require("express");
const { programmeEmitter } = require("../../models/programme"); // Event emitter for programme actions (if needed)

// ========== Controllers ==========
const programmeController = require("./controllers/programmeController"); // Importing programme controller

// ========== Middleware ==========
// const authorizeUser = require("../../middlewares/authMiddleware"); // Uncomment if authorization is required for routes

// ========== Set-up ==========
const programmeRoutes = express.Router();

// ========== Routes ==========

// Route to get all programme details including classes, schedules, and batches
programmeRoutes.get("/all", programmeController.getAllProgrammeDetails);

// Route to get all programmes
programmeRoutes.get("/", programmeController.getAllProgrammes);

// Route to get featured programmes
programmeRoutes.get("/featured", programmeController.getFeaturedProgrammes);

// Route to search programmes by keyword
programmeRoutes.get("/search", programmeController.searchProgrammes);

// Route to get a programme by its ID
programmeRoutes.get("/:id", programmeController.getProgrammeByID);

// Uncomment and use if schedules and fees features are implemented
// Route to get schedules for a specific programme by ID
// programmeRoutes.get("/:id/schedules", programmeController.getUpcomingSchedules);

// Route to get fees for a specific programme by ID
// programmeRoutes.get("/:id/fees", programmeController.getProgrammeFees);

// Route to get all programmes by category
programmeRoutes.get("/category/:category", programmeController.getProgrammesByCategory);

// Route to add a new programme (with associated classes and schedules)
programmeRoutes.post("/new", programmeController.createProgramme);

// Route to delete a specific programme by its ID
programmeRoutes.delete("/:id", programmeController.deleteProgramme);

// Route to update a specific programme by its ID
programmeRoutes.put("/:id", programmeController.updateProgramme);

// ========== Export Route ==========
// Exporting the programme routes for use in the main application
module.exports = programmeRoutes;
