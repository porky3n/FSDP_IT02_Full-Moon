module.exports = {
    user: "FullMoonn", // Replace with your SQL Server login username
    password: "FullMoon", // Replace with your SQL Server login password
    server: "localhost",
    port: 1433, // Default SQL Server port
    database: "FSDP",
    trustServerCertificate: true,
    options: {
      port: 1433, // Default SQL Server port
      connectionTimeout: 60000, // Connection timeout in milliseconds
    },
};