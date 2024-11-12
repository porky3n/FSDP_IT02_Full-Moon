const ProgrammeClass = require("../../../models/programmeClass");

// Get classes for a specific programme
const getProgrammeClasses = async (req, res) => {
    const programmeID = req.params.id;

    try {
        const classes = await ProgrammeClass.getProgrammeClasses(programmeID);
        res.json(classes);
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ message: "Error fetching classes", error });
    }
};

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

module.exports = {
    getProgrammeClasses,
    createProgrammeClass
};
