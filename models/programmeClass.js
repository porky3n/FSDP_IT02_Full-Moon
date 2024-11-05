const pool = require("../dbConfig");

class ProgrammeClass {
    constructor(programmeClassID, programmeID, location, fee, maxSlots, programmeLevel, remarks) {
        this.programmeClassID = programmeClassID;
        this.programmeID = programmeID;
        this.location = location;
        this.fee = fee;
        this.maxSlots = maxSlots;
        this.programmeLevel = programmeLevel;
        this.remarks = remarks;
    }

    // Get classes for a specific programme
    static async getProgrammeClasses(programmeID) {

        const sqlQuery = `
            SELECT * FROM ProgrammeClass 
            WHERE ProgrammeID = ?
        `;

        const [rows] = await pool.query(sqlQuery, [programmeID]);
        return rows.map(row => new ProgrammeClass(
            row.ProgrammeClassID, row.ProgrammeID, row.Location,
            row.Fee, row.MaxSlots, row.ProgrammeLevel, row.Remarks
        ));
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
