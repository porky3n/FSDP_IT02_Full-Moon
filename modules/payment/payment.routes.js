// ========== Packages ==========
// Initializing express
const express = require("express");
const { paymentEmitter } = require("../../models/payment");

// ========== Controllers ==========
// Initializing programmeController
const paymentController = require("./controllers/paymentController");

// ========== Middleware ==========
// Initializing authMiddleware
//const authorizeUser = require("../../middlewares/authMiddleware");

// ========== Set-up ==========
// Initializing programmeRoutes
const paymentRoutes = express.Router();

// ========== Routes ==========


paymentRoutes.get('/', paymentController.getAllPayments);
paymentRoutes.post('/create', paymentController.createPaymentIntent);

// ========== Export Route ==========
// Export the programme routes to be used in other parts of the application
module.exports = paymentRoutes;

