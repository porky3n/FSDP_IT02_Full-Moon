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
            console.error("Error fetching programme classes:", error);
            throw error;
        }
    }

    // Create a new programme class entry
    static async createSchedule({ instanceID, startDateTime, endDateTime }) {
        const sqlQuery = `
            INSERT INTO ProgrammeSchedule (InstanceID, StartDateTime, EndDateTime)
            VALUES (?, ?, ?)
        `;
        await pool.query(sqlQuery, [instanceID, startDateTime, endDateTime]);
    }

    static async getAllSchedules() {
        const sqlQuery = `
            SELECT 
                ScheduleID, 
                InstanceID, 
                StartDateTime, 
                EndDateTime
            FROM ProgrammeSchedule
        `;

        try {
            const [rows] = await pool.query(sqlQuery);
            // Ensure mapping does not refer to ProgrammeSchedule within itself
            return rows.map(row => ({
                scheduleID: row.ScheduleID,
                instanceID: row.InstanceID,
                startDateTime: row.StartDateTime,
                endDateTime: row.EndDateTime
            }));
        } catch (error) {
            console.error("Error fetching all schedules:", error);
            throw error;
        }
    }
}

module.exports = ProgrammeClass;
