const pool = require('../dbConfig');

class ProgrammeSchedule {
    constructor(scheduleID, instanceID, startDateTime, endDateTime) {
        this.scheduleID = scheduleID;
        this.instanceID = instanceID;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
    }
    
    // Get start date and time for the first schedule of a specifc programme
    // Get the first schedule's start date and time for a specific programme
    static async getStartEndDate(instanceID) {
        try {
            const sqlQuery = `
                SELECT 
                    MIN(StartDateTime) AS FirstStartDate,
                    MAX(EndDateTime) AS LastEndDate
                FROM ProgrammeSchedule 
                WHERE InstanceID = ? 
                ORDER BY StartDateTime ASC;
            `;
        
            const [rows] = await pool.query(sqlQuery, [instanceID]);
            if (rows.length === 0 || !rows[0].FirstStartDate || !rows[0].LastEndDate) return null;
        
            return {
                firstStartDate: rows[0].FirstStartDate,
                lastEndDate: rows[0].LastEndDate,
            };
        } catch (error) {
            console.error('Error in getStartEndDate:', error);
            throw error;
        }
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
        SELECT 
            ps.InstanceID,
            pcb.ProgrammeClassID,
            pc.ProgrammeID,
            ps.StartDateTime,
            ps.EndDateTime,
            pc.ProgrammeLevel,
            pc.MaxSlots - COALESCE(s.SlotsTaken, 0) AS slotsRemaining
        FROM ProgrammeSchedule ps
        JOIN ProgrammeClassBatch pcb 
            ON ps.InstanceID = pcb.InstanceID
        JOIN ProgrammeClass pc 
            ON pcb.ProgrammeClassID = pc.ProgrammeClassID 
        LEFT JOIN (
            SELECT 
                ProgrammeClassID, 
                COUNT(*) AS SlotsTaken
            FROM Slot
            GROUP BY ProgrammeClassID
        ) s 
            ON pcb.ProgrammeClassID = s.ProgrammeClassID
        WHERE pc.ProgrammeID = ?
            AND ps.InstanceID IN (
                SELECT InstanceID
                FROM ProgrammeSchedule
                GROUP BY InstanceID
                HAVING MIN(StartDateTime) >= NOW()
            )
        ORDER BY ps.InstanceID, ps.StartDateTime ASC;
        `;
        
        try {
            const [rows] = await pool.query(sqlQuery, [programmeID]);
    
            // Transform schedules by grouping and formatting them
            const schedulesByInstance = {};
            
            let count = 0;
            rows.forEach(schedule => {
                console.log(schedule);
                const { InstanceID, ProgrammeClassID, ProgrammeID, StartDateTime, EndDateTime, ProgrammeLevel, slotsRemaining } = schedule;
                
                // If the instanceID doesn't exist in the object, initialize it
                if (!schedulesByInstance[InstanceID]) {
                    schedulesByInstance[InstanceID] = {
                        instanceID: InstanceID,
                        programmeClassID: ProgrammeClassID,
                        programmeID: ProgrammeID,
                        programmeLevel: ProgrammeLevel,
                        slotsRemaining: slotsRemaining,
                        startDateTime: StartDateTime,
                        endDateTime: EndDateTime,  // Initialize with the first EndDateTime
                        dates: []  // Initialize empty dates array
                    };
                }
    
                // Only add unique StartDateTime values for this instance
                if (!schedulesByInstance[InstanceID].dates.includes(StartDateTime)) {
                    schedulesByInstance[InstanceID].dates.push(StartDateTime);
                }
    
                // Update endDateTime if this EndDateTime is later than the current endDateTime
                if (new Date(EndDateTime) > new Date(schedulesByInstance[InstanceID].endDateTime)) {
                    schedulesByInstance[InstanceID].endDateTime = EndDateTime;
                }
            });
    
            // Convert the object into the required format
            return Object.values(schedulesByInstance);
        } catch (error) {
            console.error("Error fetching programme schedules:", error);
            throw error;
        }
    }
    
    
    // Create a new programme class entry
    static async createSchedule({ instanceID, startDateTime, endDateTime }) {
        try {
            const sqlQuery = `
                INSERT INTO ProgrammeSchedule (InstanceID, StartDateTime, EndDateTime)
                VALUES (?, ?, ?)
            `;
            await pool.query(sqlQuery, [instanceID, startDateTime, endDateTime]);
        } catch (error) {
            console.error('Error in createSchedule:', error);
            throw error;
        }
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

module.exports = ProgrammeSchedule;
