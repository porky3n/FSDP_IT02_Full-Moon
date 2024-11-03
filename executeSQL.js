const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables from .env

async function executeSQL() {
  try {
    // Create MySQL connection
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT,
      connectTimeout: 30000, // 30 seconds timeout
    });

    console.log('Connected to MySQL server!');

    // Execute SQL Script
    const tableSqlPath = path.join(__dirname, 'SQL Scripts/tableCreation.sql'); // Path to SQL script, change as needed
    let tableSql = fs.readFileSync(tableSqlPath, 'utf8');
    tableSql = tableSql.replace(/\r/g, '').trim(); // Sanitize
    const tableQueries = tableSql.split(';').map(q => q.trim()).filter(q => q.length);
    
    console.log('Executing script...');
    for (const query of tableQueries) {
      console.log(`Executing: ${query}`);
      await connection.query(query);
    }
    console.log('SQL Script executed successfully!');

    // Close the connection
    await connection.end();
  } catch (error) {
    console.error('Error executing SQL script:', error);
  }
}

executeSQL();
