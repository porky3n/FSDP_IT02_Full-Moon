require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const cors = require("cors");
const authRoutes = require("./modules/auth/authRoutes"); // Import auth routes
const profileRoutes = require("./modules/auth/profileRoutes"); // Import profile routes
const userProfileRoutes = require("./modules/auth/userProfileRoutes");
const ensureAdminAuthenticated = require("./middlewares/auth");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// Set up session handling
app.use(
  session({
    secret: "jason1234",
    resave: false,
    saveUninitialized: false,
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Middleware for parsing JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount authentication routes at /auth
app.use("/auth", authRoutes);
app.use("/api", userProfileRoutes);
app.use("/auth/profile", profileRoutes); // Mount profile routes

// Route for the index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route protected with middleware for admin access
app.get("/adminHomePage.html", ensureAdminAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "adminHomePage.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
