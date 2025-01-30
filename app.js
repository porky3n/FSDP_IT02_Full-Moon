require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const cors = require("cors");
const passport = require("./modules/auth/passportConfig"); // Load passport setup
const bodyParser = require("body-parser");
const authRoutes = require("./modules/auth/authRoutes"); // Import auth routes
const profileRoutes = require("./modules/auth/profileRoutes"); // Import profile routes
const userProfileRoutes = require("./modules/auth/userProfileRoutes");
const childRoutes = require("./modules/auth/addChildRoutes");
const adminRoutes = require("./modules/admin/adminDashboardRoutes");
const { ensureAdminAuthenticated } = require("./middlewares/auth");

// const programmeRoutes = require("./modules/programme/programmeRoutes"); // Import programme routes
// const programmeClassRoutes = require("./modules/programmeClass/programmeClassRoutes"); // Import programme class routes
// const programmeScheduleRoutes = require("./modules/programmeSchedule/programmeScheduleRoutes"); // Import programme schedule routes

const app = express();
const port = process.env.PORT || 3000;

// const programmeController = require("./modules/programme/programmeController");
const programmeRoutes = require("./modules/programme/programme.routes");
const programmeClassRoutes = require("./modules/programmeClass/programmeClass.routes");
const programmeScheduleRoutes = require("./modules/programmeSchedule/programmeSchedule.routes");
const slotRoutes = require("./modules/slot/slot.routes");
const paymentRoutes = require("./modules/payment/payment.routes");
const chatbotRoutes = require("./modules/chatbot/chatbot.routes");
const telegramRoutes = require("./modules/telegram/telegram.routes");

const tierRoutes = require("./modules/tier/tier.routes");
const meetingRoutes = require("./modules/meeting/meeting.routes");

const { bot } = require("./modules/telegram/controllers/telegramController");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Middleware
app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
    },
  })
);

// Set up session handling
// app.use(
//   session({
//     secret: "jason1234",
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/private-images/programme-pictures",
  express.static(path.join(__dirname, "private-images/programme-pictures"))
);
app.use(
  "/private-images/profile-pictures",
  express.static(path.join(__dirname, "private-images/profile-pictures"))
);
// Middleware for parsing JSON and URL-encoded request bodies
app.use(express.json({ limit: "12mb" })); // Adjust limit as needed
app.use(express.urlencoded({ limit: "12mb", extended: true }));
// Configure body-parser with a higher limit
app.use(bodyParser.json({ limit: "50mb" })); // Adjust limit as needed
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Mount authentication routes at /auth
app.use("/auth/profile", profileRoutes); // Mount profile routes
app.use("/api/children", childRoutes); // Mount child routes
app.use("/auth", authRoutes);
app.use("/auth", userProfileRoutes);

// Mount programme-related routes
// app.use("/api/programmes", programmeRoutes); // Programme routes
// app.use("/api/programme-classes", programmeClassRoutes); // Programme class routes
// app.use("/api/programme-schedules", programmeScheduleRoutes); // Programme schedule routes

// Middleware to parse JSON bodies
app.use(express.json({ limit: "50mb" }));

// Route for the index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/testPage", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "testProgrammePage.html"));
});
// Route protected with middleware for admin access
app.get("/adminHomePage.html", ensureAdminAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "adminHomePage.html"));
});

app.get("/programme", async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "public", "userProgrammePage.html"));
    //const [rows] = await pool.query('SELECT * FROM Programme');  // Example query
    //res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database query failed");
  }
});
// Add this with your other app.use() statements
app.use("/api/admin", adminRoutes);

// app.get('/payment', async (req, res) => {
//   try {
//     res.sendFile(path.join(__dirname, 'public', 'userSelectSchedule.html'));
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Database query failed');
//   }
// });

// app.get('/programme/:id', async (req, res) => {
//   try {
//     console.log(__dirname);
//     console.log(path.join(__dirname, 'public', 'userProgrammeInfoPage.html'));
//     res.sendFile(path.join(__dirname, 'public', 'userProgrammeInfoPage.html'));
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Database query failed');
//   }
// });

app.use("/api/programme", programmeRoutes);
app.use("/api/programmeClass", programmeClassRoutes);
app.use("/api/programmeSchedule", programmeScheduleRoutes);
app.use("/api/slot", slotRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/meeting", meetingRoutes);

// Route for handling chatbot interactions
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/tier", tierRoutes);

// Route for Google Auth
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/telegram", telegramRoutes);


// api for paymentintent
// app.get("/api/payment-intent", async (req, res) => {
//   const intent =
//   res.json({ client_secret: intent.client_secret });
// });
// app.get('/api/programme', programmeController.getAllProgrammes);
// app.get('/api/programme/featuredProgramme', programmeController.getFeaturedProgrammes);
// app.get('/api/programme/searchProgramme', programmeController.searchProgrammes);
// app.get('/api/programme/:id', programmeController.getProgrammeByID);

// // Route to get schedules for a specific programme
// app.get("/api/programme/:id/schedules", programmeController.getUpcomingSchedules);

// // Route to get fees for a specific programme
// app.get("/api/programme/:id/fees", programmeController.getProgrammeFees);

// app.get('/api/programme/category/:category', programmeController.getProgrammesByCategory);

//app.get("/api/upcoming-schedules", programmeController.getUpcomingSchedules);

/*chat gpt
// Route to fetch schedules
app.get('/api/programme-schedules', async (req, res) => {
    try {
        const schedules = await Programme.getUpcomingSchedules();
        res.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Error fetching schedules' });
    }
});

// Route to fetch fees
app.get('/api/programme-fees', async (req, res) => {
    try {
        const fees = await Programme.getProgrammeFees();
        res.json(fees);
    } catch (error) {
        console.error('Error fetching fees:', error);
        res.status(500).json({ error: 'Error fetching fees' });
    }
});

*/

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
