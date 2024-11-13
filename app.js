require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const bodyParser = require("body-parser");
const authRoutes = require('./modules/auth/authRoutes'); // Import auth routes
const ensureAdminAuthenticated = require('./middlewares/auth');

const programmeRoutes = require('./modules/programme/programmeRoutes'); // Import programme routes
const programmeClassRoutes = require('./modules/programmeClass/programmeClassRoutes'); // Import programme class routes
const programmeScheduleRoutes = require('./modules/programmeSchedule/programmeScheduleRoutes'); // Import programme schedule routes

const app = express();
const port = process.env.PORT || 3000;

// Set up session handling
app.use(session({
  secret: 'jason1234',
  resave: false,
  saveUninitialized: false,
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing JSON and URL-encoded request bodies
app.use(express.json({ limit: '12mb' })); // Adjust limit as needed
app.use(express.urlencoded({ limit: '12mb', extended: true }));

// Configure body-parser with a higher limit
app.use(bodyParser.json({ limit: '50mb' })); // Adjust limit as needed
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Mount authentication routes at /auth
app.use('/auth', authRoutes);

// Mount programme-related routes
app.use('/api/programmes', programmeRoutes);               // Programme routes
app.use('/api/programme-classes', programmeClassRoutes);   // Programme class routes
app.use('/api/programme-schedules', programmeScheduleRoutes); // Programme schedule routes

// Route for the index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route protected with middleware for admin access
app.get('/adminHomePage.html', ensureAdminAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'adminHomePage.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
