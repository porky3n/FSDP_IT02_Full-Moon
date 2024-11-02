const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables from .env

async function executeSQL() {
  try {
    // Create MySQL connection pool
    // Use the public TCP proxy details to connect
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT,
      connectTimeout: 30000, // 30 seconds timeout
    });

    console.log('Connected to MySQL server!');
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'SQL Scripts/testdata.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // Sanitize SQL content: Remove unnecessary line breaks and extra spaces
    sql = sql.replace(/\r/g, '').trim(); // Remove all \r and trim the string

    // Split the SQL file into individual queries
    const queries = sql.split(';').map(q => q.trim()).filter(q => q.length);

    // Execute each query individually
    for (const query of queries) {
      console.log(`Executing: ${query}`);
      await connection.query(query);
    }

    // Execute the SQL queries
    // await connection.query(sql);
    console.log('SQL script executed successfully!');

    // Close the connection
    await connection.end();
  } catch (error) {
    console.error('Error executing SQL script:', error);
  }
}

executeSQL();

