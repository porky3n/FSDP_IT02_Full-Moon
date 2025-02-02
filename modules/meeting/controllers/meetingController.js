const Meeting = require("../../../models/meeting");
const telegramController = require("../../telegram/controllers/telegramController");
const ProgrammeClass = require("../../../models/programmeClass");
const Slot = require("../../../models/slot");
const ProgrammeSchedule = require("../../../models/programmeSchedule");
const pool = require("../../../dbConfig");
const moment = require("moment-timezone");

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

      console.log("Viewer Meeting Link: ", result.viewerMeetingLink);
      // Notify participant(s) through Telegram
      await notifyParticipants(programmeClassID, instanceID, result.viewerMeetingLink);    

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

// Notify participants
// for now each meeting link is for one slot, one participant. in future meeting link will be for all participants in a slot, hence the for loop
const notifyParticipants = async (programmeClassID, instanceID, meetingLink) => {
  try {
      // Get all booked slots (parents/children)
      const slots = await Slot.getSlotsAndParticipants(instanceID, programmeClassID);
      console.log("Slots:", slots);
      const programmeClassDetails = await ProgrammeClass.getProgrammeByProgrammeClassID(programmeClassID);
      console.log("Programme Name:", programmeClassDetails);
      const { firstStartDate, lastEndDate } = await ProgrammeSchedule.getStartEndDate(instanceID);
      console.log("Start Date Time:", firstStartDate, "End Date Time:", lastEndDate);
      if (slots.length === 0) {
          console.log("No participants found for this meeting.");
          return;
      }

      // Get Parent Telegram Chat IDs
      const parentIDs = slots.map(slot => slot.ParentID).filter(id => id !== null);
      if (parentIDs.length === 0) {
          console.log("No registered parents with Telegram Chat IDs.");
          return;
      }

      const query = `SELECT TelegramChatID FROM Parent WHERE ParentID IN (?) AND TelegramChatID IS NOT NULL`;
      const [parentRows] = await pool.query(query, [parentIDs]);

      const chatIDs = parentRows.map(row => row.TelegramChatID);

      if (chatIDs.length === 0) {
          console.log("No Telegram chat IDs found.");
          return;
      }

      // Format the start & end date in a user-friendly way
      const formattedStartDate = moment(firstStartDate).tz("Asia/Singapore").format("dddd, D MMMM YYYY");
      const formattedStartTime = moment(firstStartDate).tz("Asia/Singapore").format("h:mm A");
      const formattedEndTime = moment(lastEndDate).tz("Asia/Singapore").format("h:mm A");
            
      // Format the message
      const message = `📅 *New Meeting Scheduled!*\n\n` +
                      `📚 *Programme*: ${programmeClassDetails.programmeName}\n` +
                      `📌 *Programme Class*: Class ${programmeClassID}\n` +
                      `🔗 *Join Here*: [Click to Join](${meetingLink})\n\n` +
                      `📅 *Date*: ${formattedStartDate}\n` +
                      `🕒 *Time*: ${formattedStartTime} - ${formattedEndTime} SGT\n\n` +
                      `_Make sure to join on time!_ 🚀`;

      // Send message to each participant
      for (const chatId of chatIDs) {
          await telegramController.sendTelegramMessage(chatId, message);
      }

      console.log("Meeting notification sent successfully.");
  } catch (error) {
      console.error("Error sending meeting notifications:", error.message);
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