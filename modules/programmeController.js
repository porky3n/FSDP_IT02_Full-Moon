const Programme = require("../models/programme");

// Controller to get all programmes
const getAllProgrammes = async (req, res) => {
    try {
        const programmes = await Programme.getAllProgrammes();
        res.json(programmes);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving programmes");
    }
};

// Controller to get featured programmes
const getFeaturedProgrammes = async (req, res) => {
    try {
        const featuredProgrammes = await Programme.getFeaturedProgrammes();
        res.json(featuredProgrammes);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving featured programmes");
    }
};

// Controller to get programmes by category
// const getProgrammesByCategory = async (req, res) => {
//     const { category } = req.params;
//     try {
//         const programmes = await Programme.getProgrammesByCategory(category);
//         res.json(programmes);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error retrieving programmes by category");
//     }
// };

const getProgrammesByCategory = async (req, res) => {
    const { category } = req.params;
    const excludeProgrammeID = req.query.excludeProgrammeID ? parseInt(req.query.excludeProgrammeID) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    try {
        const programmes = await Programme.getProgrammesByCategory(category, excludeProgrammeID, limit);
        res.json(programmes);
    } catch (error) {
        console.error("Error retrieving programmes by category:", error);
        res.status(500).send("Error retrieving programmes by category");
    }
};


// Controller to search programmes
const searchProgrammes = async (req, res) => {
    const { keyword } = req.query;
    try {
        const programmes = await Programme.searchProgrammes(keyword);
        res.json(programmes);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error searching programmes");
    }
};

const getProgrammeByID = async (req, res) => {
    const programmeID = req.params.id;
    try {
        const programme = await Programme.getProgrammeByID(programmeID);
        if (programme) {
            res.json(programme);
        } else {
            res.status(404).send("Programme not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving programme");
    }
};

// exports.getUpcomingSchedules = async (req, res) => {
//     try {
//         const schedules = await Programme.getUpcomingSchedules();
//         res.render("upcomingSchedules", { schedules }); // Render the view with schedules data
//     } catch (error) {
//         console.error("Error fetching upcoming schedules:", error);
//         res.status(500).send("Server Error");
//     }
// };

// Controller to get schedules for a specific programme
const getUpcomingSchedules = async (req, res) => {
    // whats the (ID, 10) for?
    const programmeId = parseInt(req.params.id, 10); // Get programmeId from route parameter
    if (isNaN(programmeId)) {
        return res.status(400).send("Invalid programme ID");
    }

    try {
        const schedules = await Programme.getUpcomingSchedules(programmeId);
        res.json(schedules); // Send schedules as JSON response
    } catch (error) {
        console.error("Error fetching upcoming schedules:", error);
        res.status(500).send("Error retrieving schedules");
    }
};

// Controller to get fees for a specific programme
const getProgrammeFees = async (req, res) => {
    const programmeId = parseInt(req.params.id, 10); // Get programmeId from route parameter
    if (isNaN(programmeId)) {
        return res.status(400).send("Invalid programme ID");
    }

    try {
        const fees = await Programme.getProgrammeFees(programmeId);
        res.json(fees); // Send fees as JSON response
    } catch (error) {
        console.error("Error fetching programme fees:", error);
        res.status(500).send("Error retrieving programme fees");
    }
};


// Controller to create a new programme
// const createProgramme = async (req, res) => {
//     try {
//         const newProgrammeData = req.body;
//         const newProgrammeID = await Programme.createProgramme(newProgrammeData);
//         res.status(201).json({ ProgrammeID: newProgrammeID });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error creating new programme");
//     }
// };

module.exports = {
    getAllProgrammes,
    getFeaturedProgrammes,
    getProgrammesByCategory,
    searchProgrammes,
    getProgrammeByID,
    // createProgramme,
    getUpcomingSchedules,
    getProgrammeFees,
};

