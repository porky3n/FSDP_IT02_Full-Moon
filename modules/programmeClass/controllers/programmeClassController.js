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
    // getSpecificProgrammeClass
};