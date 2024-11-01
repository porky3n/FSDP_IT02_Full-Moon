require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./modules/auth/authRoutes'); // Import auth routes
const ensureAdminAuthenticated = require('./middlewares/auth');

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Mount authentication routes at /auth
app.use('/auth', authRoutes);

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
