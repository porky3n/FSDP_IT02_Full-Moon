const express = require('express');
const path = require('path');
const pool = require('./dbConfig');  // Import the MySQL connection pool
const app = express();
const port = process.env.PORT || 3000;

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
