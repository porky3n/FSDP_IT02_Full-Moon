const ProgrammeSchedule = require("../../../models/programmeSchedule");

// Controller to get the first schedule for a specific programme
const getFirstSchedule = async (req, res) => {
    const programmeID = req.params.id;
    try {
        const firstSchedule = await ProgrammeSchedule.getFirstSchedule(programmeID);
        if (!firstSchedule) {
            return res.status(404).json({ message: "No schedules found for this programme." });
        }
        res.status(200).json(firstSchedule);
    } catch (error) {
        console.error("Error fetching first schedule:", error);
        res.status(500).json({ message: "Server error while fetching first schedule." });
    }
};

// Controller to get upcoming schedules for a specific programme
const getProgrammeSchedules = async (req, res) => {
    try {
        const programmeID = req.params.id;
        const schedules = await ProgrammeSchedule.getProgrammeSchedules(programmeID);

        // Adding date range for each schedule
        const schedulesWithDates = schedules.map(schedule => ({
            ...schedule,
            dates: getDateRange(schedule.startDateTime, schedule.endDateTime)
        }));

        res.json(schedulesWithDates);
    } catch (error) {
        console.error("Error fetching programme schedules:", error);
        res.status(500).json({ error: "Failed to load programme schedules." });
    }
};

// Helper function to generate a date range
function getDateRange(startDate, endDate) {
    const dateArray = [];
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
}

module.exports = {
    getFirstSchedule,
    getProgrammeSchedules
};
