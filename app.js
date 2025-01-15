require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./modules/auth/authRoutes"); // Import auth routes
const profileRoutes = require("./modules/auth/profileRoutes"); // Import profile routes
const userProfileRoutes = require("./modules/auth/userProfileRoutes");
const childRoutes = require("./modules/auth/addChildRoutes");
const adminRoutes = require("./modules/admin/adminDashboardRoutes");
const ensureAdminAuthenticated = require("./middlewares/auth");

const programmeRoutes = require("./modules/programme/programmeRoutes"); // Import programme routes
const programmeClassRoutes = require("./modules/programmeClass/programmeClassRoutes"); // Import programme class routes
const programmeScheduleRoutes = require("./modules/programmeSchedule/programmeScheduleRoutes"); // Import programme schedule routes

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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

app.post("/login", async (req, res) => {
  try {
    // After successful authentication
    req.session.user = {
      AccountID: user.AccountID,
      AccountType: user.AccountType,
      // other user data...
    };
    await req.session.save();
    res.json({ success: true, user: req.session.user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Middleware for parsing JSON and URL-encoded request bodies
app.use(express.json({ limit: "12mb" })); // Adjust limit as needed
app.use(express.urlencoded({ limit: "12mb", extended: true }));
// Configure body-parser with a higher limit
app.use(bodyParser.json({ limit: "50mb" })); // Adjust limit as needed
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Mount authentication routes at /auth
app.use("/auth", authRoutes);
app.use("/auth", userProfileRoutes);
app.use("/auth/profile", profileRoutes); // Mount profile routes
app.use("/api/children", childRoutes); // Mount child routes
app.use("/api/admin", adminRoutes);

// Mount programme-related routes
app.use("/api/programmes", programmeRoutes); // Programme routes
app.use("/api/programme-classes", programmeClassRoutes); // Programme class routes
app.use("/api/programme-schedules", programmeScheduleRoutes); // Programme schedule routes

// Route for the index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
