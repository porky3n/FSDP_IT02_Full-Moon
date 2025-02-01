// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/adminDashboardController");

// Dashboard metrics endpoint
router.get("/dashboard-metrics", adminController.getDashboardMetrics);

module.exports = router;
