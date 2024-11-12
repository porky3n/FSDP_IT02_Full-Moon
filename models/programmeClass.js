// programmeClass.js

const pool = require("../dbConfig");

class ProgrammeClass {
    constructor(programmeClassID, programmeID, shortDescription, location, fee, maxSlots, programmeLevel, remarks) {
        this.programmeClassID = programmeClassID;
        this.programmeID = programmeID;
        this.shortDescription = shortDescription;
        this.location = location;
        this.fee = fee;
        this.maxSlots = maxSlots;
        this.programmeLevel = programmeLevel;
        this.remarks = remarks;
    }

    // Get all programme classes
    static async getAllProgrammeClasses() {
        const sqlQuery = `
            SELECT 
                ProgrammeClassID, 
                ProgrammeID, 
                ShortDescription,
                Location, 
                Fee, 
                MaxSlots, 
                ProgrammeLevel, 
                Remarks
            FROM ProgrammeClass
        `;

        try {
            const [rows] = await pool.query(sqlQuery);
            return rows.map(row => new ProgrammeClass(
                row.ProgrammeClassID,
                row.ProgrammeID,
                row.ShortDescription,
                row.Location,
                row.Fee,
                row.MaxSlots,
                row.ProgrammeLevel,
                row.Remarks || ''
            ));
        } catch (error) {
            console.error("Error fetching all programme classes:", error);
            throw error;
        }
    }

    // Get all classes for a specific programme
    static async getProgrammeClasses(programmeID) {
        const sqlQuery = `
            SELECT 
                ProgrammeClassID, 
                ProgrammeID, 
                ShortDescription,
                Location, 
                Fee, 
                MaxSlots, 
                ProgrammeLevel, 
                Remarks
            FROM ProgrammeClass
            WHERE ProgrammeID = ?
        `;

        try {
            const [rows] = await pool.query(sqlQuery, [programmeID]);
            return rows.map(row => new ProgrammeClass(
                row.ProgrammeClassID,
                row.ProgrammeID,
                row.ShortDescription,
                row.Location,
                row.Fee,
                row.MaxSlots,
                row.ProgrammeLevel,
                row.Remarks || ''
            ));
        } catch (error) {
            console.error("Error fetching programme classes for ProgrammeID:", programmeID, error);
            throw error;
        }
    }

    // Create a new programme class entry
    static async createProgrammeClass({ programmeID, shortDescription, location, fee, maxSlots, level, remarks }) {
        const sqlQuery = `
            INSERT INTO ProgrammeClass 
            (ProgrammeID, ShortDescription, Location, Fee, MaxSlots, ProgrammeLevel, Remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
    
        try {
            const [result] = await pool.query(sqlQuery, [
                programmeID,
                shortDescription,
                location,
                fee,
                maxSlots,
                level,
                remarks
            ]);
            return result.insertId; // Returns the ID of the new programme class
        } catch (error) {
            console.error("Error creating programme class:", error);
            throw error;
        }
    }
}

module.exports = ProgrammeClass;
