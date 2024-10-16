const dbConfig = require("./dbConfig");
const sql = require('mssql');

async function queryTestTable() {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM test');
        console.log('Query result:', result.recordset);
    } catch (err) {
        console.error('Error querying test table:', err);
    } finally {
        sql.close();
    }
}

queryTestTable();
