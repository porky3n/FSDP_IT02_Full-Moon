const pool = require("../dbConfig");

class ProgrammeImages {
    static async createImage({ programmeID, image }) {
        const sqlQuery = `
            INSERT INTO ProgrammeImages (ProgrammeID, Image)
            VALUES (?, ?)
        `;

        try {
            const [result] = await pool.query(sqlQuery, [programmeID, image]);
            return result.insertId;
        } catch (error) {
            console.error("Error creating image in ProgrammeImages:", error);
            throw error;
        }
    }
}

module.exports = ProgrammeImages;
