// ========== Packages ==========
// Initializing express
const express = require("express");
const { meetingEmitter } = require("../../models/meeting");

// ========== Controllers ==========
// Initializing programmeController
const meetingController = require("./controllers/meetingController");

// ========== Middleware ==========
// Initializing authMiddleware
//const authorizeUser = require("../../middlewares/authMiddleware");

// ========== Set-up ==========
// Initializing programmeRoutes
const meetingRoutes = express.Router();

// ========== Routes ==========
// meetingRoutes.post('/new', meetingController.createMeeting);      

// meetingRoutes.get('/:id', meetingController.getMeetingById);  

meetingRoutes.post('/create', meetingController.createMeeting);
meetingRoutes.post('/delete', meetingController.deleteMeeting);


// ========== Export Route ==========
// Export the programme routes to be used in other parts of the application
module.exports = meetingRoutes;

