const Meeting = require("../../../models/meeting");
const telegramController = require("../../telegram/controllers/telegramController");
// const getMeetingById = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const meeting = await Meeting.getMeetingById(id);
//         if (!meeting) {
//             return res.status(404).json({ message: "Meeting not found" });
//         }

//         res.status(200).json(meeting);
//     } catch (error) {
//         console.error("Error fetching meeting by ID:", error);
//         res.status(500).json({ message: "Error fetching meeting" });
//     }
// }

// const createMeeting = async (req, res) => {
//     // const { meetingName, meetingLink, startDate, endDate } = req.body;

//     try {
//         // Validate input
//         // if (!meetingName || !meetingLink || !startDate || !endDate) {
//         //     return res.status(400).json({ message: "Missing required fields" });
//         // }

//         // Create new meeting
//         const meetingID = await Meeting.createMeeting(meetingName, meetingLink, startDate, endDate);
//         res.status(201).json({ message: "Meeting created successfully", meetingID });
//     } catch (error) {
//         console.error("Error creating meeting:", error);
//         res.status(500).json({ message: "Error creating meeting" });
//     }
// }

const createMeeting = async (req, res) => {
    const { programmeClassID, endDateTime, instanceID } = req.body; // Assumes these are passed in the request body
  
    try {
      const result = await Meeting.createMeeting(programmeClassID, endDateTime, instanceID);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in creating/updating meeting:", error.message);
      res.status(500).json({ message: error.message });
    }
  };

const deleteMeeting = async (req, res) => {
  const { programmeClassID, instanceID, meetingID } = req.body;

  // Validate request body
  if (!programmeClassID || !instanceID || !meetingID) {
    return res.status(400).json({ message: "ProgrammeClassID, InstanceID, and MeetingID are required." });
  }

  try {
    // Call the model method to handle meeting deletion
    const result = await Meeting.deleteMeeting(programmeClassID, instanceID, meetingID);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteMeeting controller:", error);
    return res.status(500).json({ message: error.message || "Failed to delete meeting." });
  }
};

// module.exports = { 
//     getMeetingById, 
//     createMeeting 
// };

module.exports = {
    createMeeting,
    deleteMeeting
  };