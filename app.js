const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
