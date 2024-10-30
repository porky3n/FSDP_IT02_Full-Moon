// module.exports = {
//     user: "FullMoonn", // Replace with your SQL Server login username
//     password: "FullMoon", // Replace with your SQL Server login password
//     server: "localhost",
//     port: 1433, // Default SQL Server port
//     database: "FSDP",
//     trustServerCertificate: true,
//     options: {
//       port: 1433, // Default SQL Server port
//       connectionTimeout: 60000, // Connection timeout in milliseconds
//     },
// };

// Load environment variables from .env
require('dotenv').config();
const mysql = require('mysql2');

// Create a connection pool (recommended for production)
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,  // Adjust based on your usage
  queueLimit: 0
});

// Export the pool to use in other parts of your app
module.exports = pool.promise();
