const Meeting = require("../../../models/meeting");

const getMeetingById = async (req, res) => {
    const { id } = req.params;

    try {
        const meeting = await Meeting.getMeetingById(id);
        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json(meeting);
    } catch (error) {
        console.error("Error fetching meeting by ID:", error);
        res.status(500).json({ message: "Error fetching meeting" });
    }
}

const createMeeting = async (req, res) => {
    // const { meetingName, meetingLink, startDate, endDate } = req.body;

    try {
        // Validate input
        // if (!meetingName || !meetingLink || !startDate || !endDate) {
        //     return res.status(400).json({ message: "Missing required fields" });
        // }

        // Create new meeting
        const meetingID = await Meeting.createMeeting(meetingName, meetingLink, startDate, endDate);
        res.status(201).json({ message: "Meeting created successfully", meetingID });
    } catch (error) {
        console.error("Error creating meeting:", error);
        res.status(500).json({ message: "Error creating meeting" });
    }
}

module.exports = { 
    getMeetingById, 
    createMeeting 
};