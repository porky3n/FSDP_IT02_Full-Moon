const pool = require("../dbConfig");

class ProgrammeClassBatch {
    constructor(instanceID, programmeClassID) {
        this.instanceID = instanceID;
        this.programmeClassID = programmeClassID;
    }

    static async getAllBatches() {
        const sqlQuery = `
            SELECT 
                InstanceID, 
                ProgrammeClassID
            FROM ProgrammeClassBatch
        `;

        try {
            const [rows] = await pool.query(sqlQuery);
            // Map each row to an object with instanceID and programmeClassID properties
            return rows.map(row => ({
                instanceID: row.InstanceID,
                programmeClassID: row.ProgrammeClassID
            }));
        } catch (error) {
            console.error("Error fetching all batches:", error);
            throw error;
        }
    }

    static async createClassBatch({ programmeClassID }) {
        const sqlQuery = `
            INSERT INTO ProgrammeClassBatch (ProgrammeClassID)
            VALUES (?)
        `;

        try {
            const [result] = await pool.query(sqlQuery, [programmeClassID]);
            return result.insertId; // Return the generated InstanceID
        } catch (error) {
            console.error("Error creating class batch:", error);
            throw error;
        }
    }
}

module.exports = ProgrammeClassBatch;

