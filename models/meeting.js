// const pool = require("../dbConfig");    


// const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmFwcGVhci5pbiIsImF1ZCI6Imh0dHBzOi8vYXBpLmFwcGVhci5pbi92MSIsImV4cCI6OTAwNzE5OTI1NDc0MDk5MSwiaWF0IjoxNzM1MzU3NDY3LCJvcmdhbml6YXRpb25JZCI6MzAwMzU3LCJqdGkiOiJhZDI2MjEzNy1lNDJkLTQ1MWUtYTkzOC1hZjk3OWIwZTViNDQifQ.bWfuBEg_K2Q9nS2eBbl-vxmfbbHkF-pNIcrVNIJOxrc';
// const api = 'https://api.whereby.dev/v1/meetings';
// // name = https://fsdp-dummy-test.whereby.com/f70fe698-cbee-416c-9d33-fb11decf1c4d

// class Meeting {
//     constructor(meetingId, meetingName, meetingLink, startDate, endDate) {
//         this.meetingId = meetingId;
//         this.meetingName = meetingName;
//         this.meetingLink = meetingLink;
//         this.startDate = startDate;
//         this.endDate = endDate;
//     }

//     static async getMeetingForProgramme(meetingId) {
//         const sqlQuery = `
//             SELECT * FROM Meeting WHERE MeetingID = ?
//         `;

//         try {
//             const [rows] = await pool.query(sqlQuery, [meetingId]);
//             if (rows.length === 0) return null;

//             const row = rows[0];
//             return new Meeting(
//                 row.MeetingID,
//                 row.MeetingName,
//                 row.MeetingLink,
//                 row.StartDate,
//                 row.EndDate
//             );
//         } catch (error) {
//             console.error("Error fetching meeting by ID:", error);
//             throw error;
//         }
//     }
    
// }

// module.exports = Meeting;

const pool = require("../dbConfig"); // Assumes you have a dbConfig for database connection
require("dotenv").config();

class ProgrammeClassBatchService {
    static async createMeeting(programmeClassID, endDateTime, instanceID) {
        const wherebyApiUrl = "https://api.whereby.dev/v1/meetings";
    
        try {
            // Step 1: Create a meeting using the Whereby API
            const response = await fetch(wherebyApiUrl, {
                method: 'POST',
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `${process.env.WHEREBY_API_KEY}`
                },
                body: JSON.stringify(
                    {
                        "isLocked": true,
                        // "roomNamePrefix": "waiting-room-example-",
                        // "roomNamePattern": "uuid",
                        "roomMode": "normal", //normal
                        "endDate": `${endDateTime}`,
                        "fields": ["hostRoomUrl", "viewerRoomUrl"] //viewerRoomUrl
                    }
                ),
            });

            // const data = await response.json();
    
            const hostMeetingLink = response.data.hostRoomUrl;
    
            // Step 2: Update the meeting link for the given ProgrammeClassID and InstanceID
            const updateQuery = `
                UPDATE ProgrammeClassBatch
                SET MeetingLink = ?
                WHERE ProgrammeClassID = ? AND InstanceID = ?
            `;
            const [result] = await pool.query(updateQuery, [hostMeetingLink, programmeClassID, instanceID]);
    
            // Check if the update was successful
            if (result.affectedRows === 0) {
            throw new Error("No matching row found to update. Ensure the ProgrammeClassID and InstanceID are correct.");
            }
    
            return {
                message: "Meeting link updated successfully.",
                hostMeetingLink,
                programmeClassID,
                instanceID,
            };
        } catch (error) {
            console.error("Error creating or updating meeting:", error);
            throw new Error("Unable to create or update the meeting link.");
        }
    }
}

module.exports = ProgrammeClassBatchService;