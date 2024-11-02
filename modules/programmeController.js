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
const getProgrammesByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const programmes = await Programme.getProgrammesByCategory(category);
        res.json(programmes);
    } catch (error) {
        console.error(error);
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
    const { programmeID } = req.params;
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
};
