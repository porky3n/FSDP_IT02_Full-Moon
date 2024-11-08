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

    // Get classes for a specific programme with additional details
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
            
            return rows.map(row => ({
                programmeClassID: row.ProgrammeClassID,
                programmeID: row.ProgrammeID,
                shortDescription: row.ShortDescription,
                location: row.Location,
                fee: row.Fee,
                maxSlots: row.MaxSlots,
                programmeLevel: row.ProgrammeLevel,
                remarks: row.Remarks || ''
            }));
        } catch (error) {
            console.error("Error fetching programme classes:", error);
            throw error;
        }
    }

    // Get fee information for a specific programme class
    // static async getSpecificProgrammeClass(programmeID, programmeClassID) {
    //     const sqlQuery = `
    //     SELECT * FROM ProgrammeClass 
    //     WHERE ProgrammeID = ? AND ProgrammeClassID = ?`;
    //     const [rows] = await pool.query(sqlQuery, [programmeID, programmeClassID]);
    //     return rows.length ? rows[0].Fee : null;
    // }
}

module.exports = ProgrammeClass;
