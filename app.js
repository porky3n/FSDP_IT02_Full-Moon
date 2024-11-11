const express = require('express');
const path = require('path');
const pool = require('./dbConfig');  // Import the MySQL connection pool
const app = express();
const port = process.env.PORT || 3000;

// const programmeController = require("./modules/programme/programmeController");
const programmeRoutes = require('./modules/programme/programme.routes');
const programmeClassRoutes = require('./modules/programmeClass/programmeClass.routes');
const programmeScheduleRoutes = require('./modules/programmeSchedule/programmeSchedule.routes');
const slotRoutes = require('./modules/slot/slot.routes');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON bodies
app.use(express.json());

// Route for the index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.get('/account', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Account');  // Example query
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Database query failed');
  }
});

app.get('/programme', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'public', 'userProgrammePage.html'));
    //const [rows] = await pool.query('SELECT * FROM Programme');  // Example query
    //res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Database query failed');
  }
});

app.get('/payment', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'public', 'userSelectSchedule.html'));
  } catch (error) {
    console.error(error);
    res.status(500).send('Database query failed');
  }
});

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

// const dbConfig = require("./dbConfig");
// const sql = require('mssql');

// async function queryTestTable() {
//     try {
//         let pool = await sql.connect(dbConfig);
//         let result = await pool.request().query('SELECT * FROM test');
//         console.log('Query result:', result.recordset);
//     } catch (err) {
//         console.error('Error querying test table:', err);
//     } finally {
//         sql.close();
//     }
// }

// queryTestTable();
