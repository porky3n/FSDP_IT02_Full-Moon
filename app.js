const express = require('express');
const path = require('path');
const pool = require('./dbConfig');  // Import the MySQL connection pool
const app = express();
const port = process.env.PORT || 3000;

const programmeController = require("./modules/programmeController");

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/programme/:id', async (req, res) => {
  try {
    console.log(__dirname);
    console.log(path.join(__dirname, 'public', 'userProgrammeInfoPage.html'));
    res.sendFile(path.join(__dirname, 'public', 'userProgrammeInfoPage.html'));
  } catch (error) {
    console.error(error);
    res.status(500).send('Database query failed');
  }
});

app.get('/api/programme', programmeController.getAllProgrammes);
app.get('/api/featuredProgramme', programmeController.getFeaturedProgrammes);
app.get('/api/searchProgramme', programmeController.searchProgrammes);
app.get('/api/programme/:programmeID', programmeController.getProgrammeByID);
app.get('/api/programme/:category', programmeController.getProgrammesByCategory);

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
