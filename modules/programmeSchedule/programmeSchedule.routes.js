// ========== Packages ==========
// Initializing express
const express = require("express");
const { programmeScheduleEmitter } = require("../../models/programmeSchedule");

// ========== Controllers ==========
// Initializing programmeController
const programmeScheduleController = require("./controllers/programmeScheduleController");

// ========== Middleware ==========
// Initializing authMiddleware
//const authorizeUser = require("../../middlewares/authMiddleware");

// ========== Set-up ==========
// Initializing programmeRoutes
const programmeScheduleRoutes = express.Router();

// ========== Routes ==========


programmeScheduleRoutes.get('/:id/first-schedule', programmeScheduleController.getFirstSchedule);

// Get all programme schedules
programmeScheduleRoutes.get("/:id/schedules", programmeScheduleController.getProgrammeSchedules);

// ========== Export Route ==========
// Export the programme routes to be used in other parts of the application
module.exports = programmeScheduleRoutes;

