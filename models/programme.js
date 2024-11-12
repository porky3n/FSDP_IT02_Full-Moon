const pool = require("../dbConfig");

class Programme {
    constructor(programmeID, programmeName, category, programmePictureURL, description) {
        this.programmeID = programmeID;
        this.programmeName = programmeName;
        this.category = category;
        this.programmePictureURL = programmePictureURL;
        this.description = description;
    }

    // Get all programmes
    static async getAllProgrammes() {
        const sqlQuery = `SELECT * FROM Programme`;
        const [rows] = await pool.query(sqlQuery);
        return rows.map(row => new Programme(
            row.ProgrammeID,
            row.ProgrammeName,
            row.Category,
            row.ProgrammePictureURL,
            row.Description
        ));
    }

    // Get programme by ID
    static async getProgrammeByID(programmeID) {
        const sqlQuery = `SELECT * FROM Programme WHERE ProgrammeID = ?`;
        const [rows] = await pool.query(sqlQuery, [programmeID]);

        if (rows.length === 0) return null;
        const row = rows[0];
        return new Programme(
            row.ProgrammeID,
            row.ProgrammeName,
            row.Category,
            row.ProgrammePictureURL,
            row.Description
        );
    }

    // Get featured programmes
    static async getFeaturedProgrammes() {
        const sqlQuery = `
            SELECT * FROM Programme
            ORDER BY ProgrammeID DESC
            LIMIT 5;
        `;
        const [rows] = await pool.query(sqlQuery);
        return rows.map(row => new Programme(
            row.ProgrammeID,
            row.ProgrammeName,
            row.Category,
            row.ProgrammePictureURL,
            row.Description
        ));
    }

    // Get programmes by category with optional exclusion and limit
    static async getProgrammesByCategory(category, excludeProgrammeID = null, limit = null) {
        let sqlQuery = `SELECT * FROM Programme WHERE Category = ?`;
        const params = [category];

        if (excludeProgrammeID) {
            sqlQuery += ` AND ProgrammeID != ?`;
            params.push(excludeProgrammeID);
        }

        sqlQuery += ` ORDER BY ProgrammeID DESC`;
        
        if (limit) {
            sqlQuery += ` LIMIT ?`;
            params.push(limit);
        }

        const [rows] = await pool.query(sqlQuery, params);
        return rows.map(row => new Programme(
            row.ProgrammeID,
            row.ProgrammeName,
            row.Category,
            row.ProgrammePictureURL,
            row.Description
        ));
    }

    // Search programmes by keyword in ProgrammeName or Description
    static async searchProgrammes(keyword) {
        const sqlQuery = `
            SELECT * FROM Programme
            WHERE ProgrammeName LIKE ? OR Description LIKE ?
        `;
        const [rows] = await pool.query(sqlQuery, [`%${keyword}%`, `%${keyword}%`]);
        return rows.map(row => new Programme(
            row.ProgrammeID,
            row.ProgrammeName,
            row.Category,
            row.ProgrammePictureURL,
            row.Description
        ));
    }

    // Add a new programme
    static async createProgramme({ title, category, picture, description }) {
        const sqlQuery = `
            INSERT INTO Programme (ProgrammeName, Category, ProgrammePicture, Description)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.query(sqlQuery, [title, category, picture, description]);
        return result.insertId; // Returns the newly created programme's ID
    }

    static async updateProgramme(id, { programmeName, category, description }) {
        const sqlQuery = `
            UPDATE Programme
            SET ProgrammeName = ?, Category = ?, Description = ?
            WHERE ProgrammeID = ?
        `;
        try {
            await pool.query(sqlQuery, [programmeName, category, description, id]);
            return { message: "Programme updated successfully" };
        } catch (error) {
            console.error("Error updating programme:", error);
            throw error;
        }
    }

    static async deleteProgramme(programmeID) {
        const connection = await pool.getConnection(); // Get a database connection
        try {
            await connection.beginTransaction();

            // Delete ProgrammeImages associated with the programme
            await connection.query("DELETE FROM ProgrammeImages WHERE ProgrammeID = ?", [programmeID]);

            // Delete ProgrammeSchedules associated with the programme's classes and batches
            await connection.query(`
                DELETE ProgrammeSchedule 
                FROM ProgrammeSchedule 
                JOIN ProgrammeClassBatch ON ProgrammeSchedule.InstanceID = ProgrammeClassBatch.InstanceID
                JOIN ProgrammeClass ON ProgrammeClassBatch.ProgrammeClassID = ProgrammeClass.ProgrammeClassID
                WHERE ProgrammeClass.ProgrammeID = ?`, [programmeID]);

            // Delete ProgrammeClassBatch entries
            await connection.query(`
                DELETE ProgrammeClassBatch 
                FROM ProgrammeClassBatch 
                JOIN ProgrammeClass ON ProgrammeClassBatch.ProgrammeClassID = ProgrammeClass.ProgrammeClassID
                WHERE ProgrammeClass.ProgrammeID = ?`, [programmeID]);

            // Delete ProgrammeClass entries
            await connection.query("DELETE FROM ProgrammeClass WHERE ProgrammeID = ?", [programmeID]);

            // Delete the Programme itself
            await connection.query("DELETE FROM Programme WHERE ProgrammeID = ?", [programmeID]);

            await connection.commit();
            console.log(`Programme with ID ${programmeID} and all related data deleted successfully.`);
        } catch (error) {
            await connection.rollback();
            console.error("Error deleting programme:", error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Programme;


