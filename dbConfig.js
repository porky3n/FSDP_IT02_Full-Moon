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
require("dotenv").config();
const mysql = require("mysql2");

// Create a connection pool (recommended for production)
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your usage
  queueLimit: 0,
});

// Export the pool to use in other parts of your app
module.exports = pool.promise();



// local database connection configuration
// module.exports = {
//   user: "booksapi_user", // Replace with your SQL Server login username
//   password: "booksapi_user", // Replace with your SQL Server login password
//   server: "localhost",
//   database: "FSDP",
//   trustServerCertificate: true,
//   options: {
//     port: 1433, // Default SQL Server port
//     connectionTimeout: 60000, // Connection timeout in milliseconds
//   },
// };