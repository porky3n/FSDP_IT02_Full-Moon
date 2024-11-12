// ========== Packages ==========
// Initializing express
const express = require("express");
const { programmeScheduleEmitter } = require("../../models/programmeSchedule");

// ========== Controllers ==========
// Initializing programmeScheduleController
const programmeScheduleController = require("./controllers/programmeScheduleController");

// ========== Set-up ==========
// Initializing programmeScheduleRoutes
const programmeScheduleRoutes = express.Router();

// ========== Routes ==========

// Route to get the first schedule of a specific programme
programmeScheduleRoutes.get('/:id/first-schedule', programmeScheduleController.getFirstSchedule);

// Route to get all schedules for a specific programme
programmeScheduleRoutes.get("/:id/schedules", programmeScheduleController.getProgrammeSchedules);

// ========== Export Route ==========
// Export the programme schedule routes to be used in other parts of the application
module.exports = programmeScheduleRoutes;
