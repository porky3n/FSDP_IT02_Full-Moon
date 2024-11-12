const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    connectTimeout: 30000, // 30 seconds timeout
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

exports.getUpcomingProgrammes = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.ProgrammeName, 
        p.Description, 
        pc.Location, 
        pc.Fee, 
        pc.ProgrammeLevel,
        MIN(ps.StartDateTime) AS EarliestStartDateTime, 
        MAX(ps.EndDateTime) AS LatestEndDateTime, 
        pc.Remarks, 
        p.ProgrammePicture
      FROM Programme p
      JOIN ProgrammeClass pc ON p.ProgrammeID = pc.ProgrammeID
      JOIN ProgrammeSchedule ps ON pc.ProgrammeClassID = ps.InstanceID
      WHERE ps.StartDateTime > NOW()
      GROUP BY 
        p.ProgrammeName, 
        p.Description, 
        pc.Location, 
        pc.Fee, 
        pc.ProgrammeLevel, 
        pc.Remarks, 
        p.ProgrammePicture
      ORDER BY EarliestStartDateTime ASC;
    `;
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Upcoming programmes: ${JSON.stringify(results)}`);
        resolve(results);
      }
    });
  });
};
  