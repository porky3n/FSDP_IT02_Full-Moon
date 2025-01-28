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
            console.log("ProgrammeClassID:", programmeClassID);
            console.log("End Date Time:", endDateTime);
            console.log("InstanceID:", instanceID);
            // Convert endDateTime to ISO format
            const isoEndDateTime = convertToISO(endDateTime);
            console.log("Converted ISO End Date Time:", isoEndDateTime);

            // Step 1: Create a meeting using the Whereby API
            const response = await fetch(wherebyApiUrl, {
                method: 'POST',
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${process.env.MY_WHEREBY_API_KEY}`
                },
                body: JSON.stringify({
                    isLocked: true,
                    roomMode: "normal", 
                    endDate: isoEndDateTime,
                    fields: ["hostRoomUrl", "viewerRoomUrl"]
                }),
            });

            const data = await response.json();
            console.log("API Response Data:", data);

            const hostMeetingLink = data.hostRoomUrl;
            const viewerMeetingLink = data.roomUrl;
            const meetingID = data.meetingId;

            // Step 2: Update the meeting link for the given ProgrammeClassID and InstanceID
            const updateQuery = `
                UPDATE ProgrammeClassBatch
                SET HostMeetingLink = ?, ViewerMeetingLink = ?, MeetingID = ?
                WHERE ProgrammeClassID = ? AND InstanceID = ?
            `;
            const [result] = await pool.query(updateQuery, [hostMeetingLink, viewerMeetingLink, meetingID, programmeClassID, instanceID]);
    
            if (result.affectedRows === 0) {
                throw new Error("No matching row found to update. Ensure the ProgrammeClassID and InstanceID are correct.");
            }
    
            return {
                message: "Meeting link updated successfully.",
                hostMeetingLink,
                viewerMeetingLink,
                programmeClassID,
                instanceID,
                meetingID
            };
        } catch (error) {
            console.error("Error creating or updating meeting:", error);
            throw new Error("Unable to create or update the meeting link.");
        }
    }

    static async deleteMeeting(programmeClassID, instanceID, meetingID) {
        console.log("ProgrammeClassID:", programmeClassID);
        console.log("InstanceID:", instanceID);
        console.log("MeetingID:", meetingID);
        try {
          // Step 1: Call Whereby API to delete the meeting
          const wherebyResponse = await fetch(`https://api.whereby.dev/v1/meetings/${meetingID}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.MY_WHEREBY_API_KEY}`
            },
          });
    
          // If Whereby API call fails, throw an error with the response details
          if (!wherebyResponse.ok) {
            const errorDetails = await wherebyResponse.json();
            console.error("Error from Whereby API:", errorDetails);
            throw new Error(errorDetails.message || "Failed to delete meeting from Whereby.");
          }
    
          // Step 2: Update the database to clear meeting links
          const updateQuery = `
            UPDATE ProgrammeClassBatch
            SET HostMeetingLink = NULL, ViewerMeetingLink = NULL, MeetingID = NULL
            WHERE ProgrammeClassID = ? AND InstanceID = ?
          `;
          const [result] = await pool.query(updateQuery, [programmeClassID, instanceID]);
    
          if (result.affectedRows === 0) {
            throw new Error("No matching row found to delete. Ensure the ProgrammeClassID and InstanceID are correct.");
          }
    
          return { message: "Meeting deleted successfully." };
        } catch (error) {
          console.error("Error deleting meeting:", error);
          throw new Error(error.message || "Unable to delete the meeting.");
        }
      }
}


function convertToISO(endDateTime) {
    // Example input: "3 February 2025 at 00:00 pm"
    const dateParts = endDateTime.match(/^(\d+)\s([a-zA-Z]+)\s(\d{4})\sat\s(\d{1,2}):(\d{2})\s([apAP][mM])$/);
    if (!dateParts) {
        throw new Error("Invalid date format. Expected format: '3 February 2025 at 00:00 pm'");
    }

    const [_, day, month, year, hours, minutes, period] = dateParts;

    // Convert the month to a zero-based index for the Date object
    const monthIndex = new Date(`${month} 1`).getMonth();

    // Adjust hours for AM/PM
    let hour = parseInt(hours, 10);
    if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
    if (period.toLowerCase() === "am" && hour === 12) hour = 0;

    // Create a Date object
    const date = new Date(Date.UTC(parseInt(year, 10), monthIndex, parseInt(day, 10), hour, parseInt(minutes, 10)));

    return date.toISOString();
}


module.exports = ProgrammeClassBatchService;