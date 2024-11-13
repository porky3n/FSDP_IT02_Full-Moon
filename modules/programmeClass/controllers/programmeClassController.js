const ProgrammeClass = require("../../../models/programmeClass");

// Get classes for a specific programme
const getProgrammeClasses = async (req, res) => {
    const programmeID = req.params.id;

    try {
        const classes = await ProgrammeClass.getProgrammeClasses(programmeID);
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching classes",   error });
    }
};

// Controller method to get programme cart details
const getProgrammeCartDetails = async (req, res) => {
    const programmeClassID = req.params.id; // Get programmeClassID from the request parameters

    console.log("programmeClassID:", programmeClassID);
    try {
        // Fetch programme cart details using the model method
        const programmeDetails = await ProgrammeClass.getProgrammeCartDetails(programmeClassID);

        // Check if any data was returned
        if (!programmeDetails) {
            return res.status(404).json({ message: "Programme details not found." });
        }

        // Send the programme details as JSON response
        res.status(200).json(programmeDetails);
    } catch (error) {
        console.error("Error fetching programme cart details:", error);
        res.status(500).json({ message: "Failed to retrieve programme cart details." });
    }
}

// Create a new programme class
const createProgrammeClass = async (req, res) => {
    const { programmeID, shortDescription, location, fee, maxSlots, programmeLevel, remarks } = req.body;

    try {
        const programmeClassID = await ProgrammeClass.createProgrammeClass({
            programmeID,
            shortDescription,
            location,
            fee,
            maxSlots,
            programmeLevel,
            remarks
        });
        res.status(201).json({ message: "Programme class created successfully", programmeClassID });
    } catch (error) {
        console.error("Error creating programme class:", error);
        res.status(500).json({ message: "Error creating programme class", error });
    }
};
// Get fee information for a specific programme class
// const getSpecificProgrammeClass = async (req, res) => {
//     const { programmeID, programmeClassID } = req.params;
//     try {
//         const fee = await ProgrammeClass.getSpecificProgrammeClass(programmeID, programmeClassID);
//         res.json({ fee });
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching class fee", error });
//     }
// };

module.exports = {
    getProgrammeClasses,
    getProgrammeCartDetails,
    createProgrammeClass
    // getSpecificProgrammeClass
};