const pool = require('../dbConfig');

class ProgrammeSchedule {
    constructor(scheduleID, programmeClassID, programmeID, instanceID, startDateTime, endDateTime) {
        this.scheduleID = scheduleID;
        this.programmeClassID = programmeClassID;
        this.programmeID = programmeID;
        this.instanceID = instanceID;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
    }

    // Get start date and time for the first schedule of a specifc programme
    // Get the first schedule's start date and time for a specific programme
    static async getFirstSchedule(programmeID) {
        const sqlQuery = `
            SELECT * FROM ProgrammeSchedule 
            WHERE ProgrammeID = ? 
            ORDER BY StartDateTime ASC 
            LIMIT 1
        `;
        const [rows] = await pool.query(sqlQuery, [programmeID]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new ProgrammeSchedule(row.ScheduleID, row.ProgrammeClassID, row.ProgrammeID, row.instanceID, row.StartDateTime, row.EndDateTime);
    }

    // Get upcoming schedules grouped by instance for a specific programme

    // Should the StartDateTime be included in the SQL query?
    // (Because I dont think its efficient to query every date and time
    // That has already passed)

    // SELECT instanceID, ProgrammeClassID, ProgrammeID, StartDateTime, EndDateTime 
    //         FROM ProgrammeSchedule 
    //         WHERE ProgrammeID = ? AND StartDateTime >= NOW() 
    //         ORDER BY instanceID, StartDateTime ASC;
    // static async getProgrammeSchedules(programmeID) {
    //     const sqlQuery = `
    //         SELECT instanceID, ProgrammeClassID, ProgrammeID, StartDateTime, EndDateTime 
    //         FROM ProgrammeSchedule 
    //         WHERE ProgrammeID = ? 
    //         ORDER BY instanceID, StartDateTime ASC;
    //     `;
        
    //     try {
    //         const [rows] = await pool.query(sqlQuery, [programmeID]);

    //         // Transform schedules by grouping and formatting them
    //         const schedulesByInstance = {};
            
    //         rows.forEach(schedule => {
    //             const { instanceID, ProgrammeClassID, ProgrammeID, StartDateTime, EndDateTime } = schedule;
                
    //             // If the instanceID doesn't exist in the object, initialize it
    //             if (!schedulesByInstance[instanceID]) {
    //                 schedulesByInstance[instanceID] = {
    //                     instanceID,
    //                     programmeClassID: ProgrammeClassID,
    //                     programmeID: ProgrammeID,
    //                     startDateTime: StartDateTime,
    //                     endDateTime: EndDateTime,
    //                     dates: []
    //                 };
    //             }

    //             // Add each StartDateTime and EndDateTime to the dates array for this instance
    //             schedulesByInstance[instanceID].dates.push(StartDateTime);
    //             // schedulesByInstance[instanceID].dates.push(EndDateTime);
    //         });

    //         // Convert the object into the required format
    //         return Object.values(schedulesByInstance);
    //     } catch (error) {
    //         console.error("Error fetching programme schedules:", error);
    //         throw error;
    //     }
    // }


    static async getProgrammeSchedules(programmeID) {
        const sqlQuery = `
            SELECT instanceID, ProgrammeClassID, ProgrammeID, StartDateTime, EndDateTime 
            FROM ProgrammeSchedule 
            WHERE ProgrammeID = ? 
            ORDER BY instanceID, StartDateTime ASC;
        `;
        
        try {
            const [rows] = await pool.query(sqlQuery, [programmeID]);
    
            // Transform schedules by grouping and formatting them
            const schedulesByInstance = {};
            
            rows.forEach(schedule => {
                const { instanceID, ProgrammeClassID, ProgrammeID, StartDateTime, EndDateTime } = schedule;
                
                // If the instanceID doesn't exist in the object, initialize it
                if (!schedulesByInstance[instanceID]) {
                    schedulesByInstance[instanceID] = {
                        instanceID,
                        programmeClassID: ProgrammeClassID,
                        programmeID: ProgrammeID,
                        startDateTime: StartDateTime,
                        endDateTime: EndDateTime,  // Initialize with the first EndDateTime
                        dates: []
                    };
                }
    
                // Add each StartDateTime to the dates array for this instance
                schedulesByInstance[instanceID].dates.push(StartDateTime);
    
                // Update endDateTime if this EndDateTime is later than the current endDateTime
                if (new Date(EndDateTime) > new Date(schedulesByInstance[instanceID].endDateTime)) {
                    schedulesByInstance[instanceID].endDateTime = EndDateTime;
                }
            });
    
            // Convert the object into the required format
            return Object.values(schedulesByInstance);
        } catch (error) {
            console.error("Error fetching programme schedules:", error);
            throw error;
        }
    }
    

}

module.exports = ProgrammeSchedule;
