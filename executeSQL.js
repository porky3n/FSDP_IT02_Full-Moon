const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config(); // Load environment variables from .env

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

    console.log("Connected to MySQL server!");

    // Execute tableCreation.sql
    const tableSqlPath = path.join(__dirname, "SQL Scripts/dummyData.sql");
    let tableSql = fs.readFileSync(tableSqlPath, "utf8");
    tableSql = tableSql.replace(/\r/g, "").trim(); // Sanitize
    const tableQueries = tableSql
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length);

    console.log("Executing table creation script...");
    for (const query of tableQueries) {
      console.log(`Executing: ${query}`);
      await connection.query(query);
    }
    console.log("Table creation script executed successfully!");

    // // Execute dummyData.sql
    // const dummySqlPath = path.join(__dirname, "SQL Scripts/dummyData.sql");
    // let dummySql = fs.readFileSync(dummySqlPath, "utf8");
    // dummySql = dummySql.replace(/\r/g, "").trim(); // Sanitize
    // const dummyQueries = dummySql
    //   .split(";")
    //   .map((q) => q.trim())
    //   .filter((q) => q.length);

    // console.log("Executing dummy data script...");
    // for (const query of dummyQueries) {
    //   console.log(`Executing: ${query}`);
    //   await connection.query(query);
    // }
    // console.log("Dummy data script executed successfully!");

    // Close the connection
    await connection.end();
  } catch (error) {
    console.error("Error executing SQL script:", error);
  }
}

executeSQL();
