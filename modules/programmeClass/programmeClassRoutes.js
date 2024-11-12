// ========== Packages ==========
// Initializing express
const express = require("express");
const { programmeClassEmitter } = require("../../models/programmeClass");

// ========== Controllers ==========
// Initializing programmeClassController
const programmeClassController = require("./controllers/programmeClassController");

// ========== Middleware ==========
// Initializing authMiddleware
// const authorizeUser = require("../../middlewares/authMiddleware");

// ========== Set-up ==========
// Initializing programmeClassRoutes
const programmeClassRoutes = express.Router();

// ========== Routes ==========

// Get all programme classes for a specific programme ID
programmeClassRoutes.get("/:id/classes", programmeClassController.getProgrammeClasses);

// Create a new programme class
programmeClassRoutes.post("/new", programmeClassController.createProgrammeClass);

// ========== Export Route ==========
// Export the programme class routes to be used in other parts of the application
module.exports = programmeClassRoutes;
