// const Programme = require("../../../models/programme");

// // Controller to get all programmes
// const getAllProgrammes = async (req, res) => {
//     try {
//         const programmes = await Programme.getAllProgrammes();
//         res.json(programmes);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error retrieving programmes");
//     }
// };

// // Controller to get featured programmes
// const getFeaturedProgrammes = async (req, res) => {
//     try {
//         const featuredProgrammes = await Programme.getFeaturedProgrammes();
//         res.json(featuredProgrammes);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error retrieving featured programmes");
//     }
// };

// // Controller to get programmes by category
// // const getProgrammesByCategory = async (req, res) => {
// //     const { category } = req.params;
// //     try {
// //         const programmes = await Programme.getProgrammesByCategory(category);
// //         res.json(programmes);
// //     } catch (error) {
// //         console.error(error);
// //         res.status(500).send("Error retrieving programmes by category");
// //     }
// // };

// const getProgrammesByCategory = async (req, res) => {
//     const { category } = req.params;
//     const excludeProgrammeID = req.query.excludeProgrammeID ? parseInt(req.query.excludeProgrammeID) : null;
//     const limit = req.query.limit ? parseInt(req.query.limit) : null;

//     try {
//         const programmes = await Programme.getProgrammesByCategory(category, excludeProgrammeID, limit);
//         res.json(programmes);
//     } catch (error) {
//         console.error("Error retrieving programmes by category:", error);
//         res.status(500).send("Error retrieving programmes by category");
//     }
// };


// // Controller to search programmes
// const searchProgrammes = async (req, res) => {
//     const { keyword } = req.query;
//     try {
//         const programmes = await Programme.searchProgrammes(keyword);
//         res.json(programmes);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error searching programmes");
//     }
// };

// const getProgrammeByID = async (req, res) => {
//     const programmeID = req.params.id;

//     try {
//         const programme = await Programme.getProgrammeByID(programmeID);
//         if (programme) {
//             // Convert the primary image to Base64 if it's a buffer
//             if (programme.programmePicture instanceof Buffer) {
//                 programme.programmePicture = programme.programmePicture.toString('base64');
//             }

//             // Convert each additional image to Base64 if they are buffers
//             programme.images = programme.images.map(image =>
//                 image instanceof Buffer ? image.toString('base64') : image
//             );

//             res.json(programme);
//         } else {
//             res.status(404).send("Programme not found");
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error fetching programme details", error: error.message });
//     }
// };

const Programme = require("../../../models/programme");

// Utility function to convert binary images to Base64
const convertToBase64 = (programme) => {
    if (programme.programmePicture instanceof Buffer) {
        programme.programmePicture = `data:image/jpeg;base64,${programme.programmePicture.toString('base64')}`;
    }
    if (programme.images) {
        programme.images = programme.images.map(image =>
            image instanceof Buffer ? `data:image/jpeg;base64,${image.toString('base64')}` : image
        );
    }
    return programme;
};

// Controller to get all programmes
const getAllProgrammes = async (req, res) => {
    try {
        const programmes = await Programme.getAllProgrammes();
        const programmesWithBase64Images = programmes.map(convertToBase64);
        res.json(programmesWithBase64Images);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving programmes");
    }
};

// Controller to get featured programmes
const getFeaturedProgrammes = async (req, res) => {
    try {
        const featuredProgrammes = await Programme.getFeaturedProgrammes();
        const featuredProgrammesWithBase64Images = featuredProgrammes.map(convertToBase64);
        res.json(featuredProgrammesWithBase64Images);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving featured programmes");
    }
};

// Controller to get programmes by category with optional exclusion and limit
const getProgrammesByCategory = async (req, res) => {
    const { category } = req.params;
    const excludeProgrammeID = req.query.excludeProgrammeID ? parseInt(req.query.excludeProgrammeID) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    try {
        const programmes = await Programme.getProgrammesByCategory(category, excludeProgrammeID, limit);
        const programmesWithBase64Images = programmes.map(convertToBase64);
        res.json(programmesWithBase64Images);
    } catch (error) {
        console.error("Error retrieving programmes by category:", error);
        res.status(500).send("Error retrieving programmes by category");
    }
};

// Controller to search programmes
const searchProgrammes = async (req, res) => {
    const { keyword = '', page = 1, limit = 6 } = req.query;
    
    try {
        const { programmes, total } = await Programme.searchProgrammes(keyword, parseInt(page), parseInt(limit));
        const programmesWithBase64Images = programmes.map(convertToBase64);
        
        res.json({
            programmes: programmesWithBase64Images,
            total,           // Total count of results
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)  // Calculate total pages
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error searching programmes");
    }
};


// Controller to get a programme by ID with Base64 image conversion
const getProgrammeByID = async (req, res) => {
    const programmeID = req.params.id;

    try {
        const programme = await Programme.getProgrammeByID(programmeID);
        if (programme) {
            // Convert primary and additional images to Base64
            const programmeWithBase64Image = convertToBase64(programme);
            res.json(programmeWithBase64Image);
        } else {
            res.status(404).send("Programme not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching programme details", error: error.message });
    }
};



module.exports = {
    getAllProgrammes,
    getFeaturedProgrammes,
    getProgrammesByCategory,
    searchProgrammes,
    getProgrammeByID,
    // createProgramme,
    // getUpcomingSchedules,
    // getProgrammeFees,
};

