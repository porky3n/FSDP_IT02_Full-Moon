const pool = require("../dbConfig");    


const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmFwcGVhci5pbiIsImF1ZCI6Imh0dHBzOi8vYXBpLmFwcGVhci5pbi92MSIsImV4cCI6OTAwNzE5OTI1NDc0MDk5MSwiaWF0IjoxNzM1MzU3NDY3LCJvcmdhbml6YXRpb25JZCI6MzAwMzU3LCJqdGkiOiJhZDI2MjEzNy1lNDJkLTQ1MWUtYTkzOC1hZjk3OWIwZTViNDQifQ.bWfuBEg_K2Q9nS2eBbl-vxmfbbHkF-pNIcrVNIJOxrc';
const api = 'https://api.whereby.dev/v1/meetings';
// name = https://fsdp-dummy-test.whereby.com/f70fe698-cbee-416c-9d33-fb11decf1c4d

class Meeting {
    constructor(meetingId, meetingName, meetingLink, startDate, endDate) {
        this.meetingId = meetingId;
        this.meetingName = meetingName;
        this.meetingLink = meetingLink;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    static async getMeetingById(meetingId) {
        const sqlQuery = `
            SELECT * FROM Meeting WHERE MeetingID = ?
        `;

        try {
            const [rows] = await pool.query(sqlQuery, [meetingId]);
            if (rows.length === 0) return null;

            const row = rows[0];
            return new Meeting(
                row.MeetingID,
                row.MeetingName,
                row.MeetingLink,
                row.StartDate,
                row.EndDate
            );
        } catch (error) {
            console.error("Error fetching meeting by ID:", error);
            throw error;
        }
    }

    static async createMeeting() {
        const sqlQuery = `
            INSERT INTO Meeting (MeetingName, MeetingLink, StartDate, EndDate)
            VALUES (?, ?, ?, ?)
        `;

        try {
            const [result] = await pool.query(sqlQuery, [meetingName, meetingLink, startDate, endDate]);
            return result.insertId; // Return the ID of the new meeting
        } catch (error) {
            console.error("Error creating meeting:", error);
            throw error;
        }
    }


    
}

module.exports = Meeting;