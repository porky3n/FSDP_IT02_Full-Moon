const Programme = require("../../../models/programme");
const ProgrammeClass = require("../../../models/programmeClass");
const ProgrammeSchedule = require("../../../models/programmeSchedule");
const ProgrammeClassBatch = require("../../../models/programmeClassBatch");
const ProgrammeImages = require("../../../models/programmeImages");

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
    const { keyword = '', category = '', page, limit } = req.query;
    
    try {
        const { programmes, total } = await Programme.searchProgrammes(keyword, category, parseInt(page), parseInt(limit));
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

// Controller to get all programme details (programmes, classes, schedules, and batches)
const getAllProgrammeDetails = async (req, res) => {
    try {
        const programmes = await Programme.getAllProgrammes();
        const programmeClasses = await ProgrammeClass.getAllProgrammeClasses();
        const schedules = await ProgrammeSchedule.getAllSchedules();
        const batches = await ProgrammeClassBatch.getAllBatches();

        res.json({ programmes, programmeClasses, schedules, batches });
    } catch (error) {
        console.error("Error fetching all programme details:", error);
        console.log("Fetching all programme details");
        res.status(500).json({ message: "Error fetching all programme details" });
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

// Controller to create a new programme with classes and schedules
const createProgramme = async (req, res) => {
    const { title, category, picture, description, classes, images } = req.body;

    try {

        // Only create buffer if picture is defined, else set null
        const pictureBuffer = picture ? Buffer.from(new Uint8Array(picture)) : null;
        // Insert into Programme table
        const programmeID = await Programme.createProgramme({
            title,
            category,
            picture: pictureBuffer,  // Ensure main image is a buffer
            description
        });

        // Insert additional images into ProgrammeImages table as binary blobs
        if (images && Array.isArray(images)) {
            for (const imageBinary of images) {
                await ProgrammeImages.createImage({
                    programmeID,
                    image: Buffer.from(imageBinary) // Convert each imageBinary to buffer
                });
            }
        }

        // Loop through each class and insert into ProgrammeClass table
        for (const cls of classes) {
            const { shortDescription, location, fee, maxSlots, level, remarks, days } = cls;

            // Insert class details into ProgrammeClass table
            const programmeClassID = await ProgrammeClass.createProgrammeClass({
                programmeID,
                shortDescription,
                location,
                fee,
                maxSlots,
                level,
                remarks
            });

            // Insert into ProgrammeClassBatch to create a unique InstanceID
            const instanceID = await ProgrammeClassBatch.createClassBatch({
                programmeClassID
            });

            // Insert each schedule day into ProgrammeSchedule using the generated InstanceID
            for (const day of days) {
                const { startDateTime, endDateTime } = day;
                await ProgrammeSchedule.createSchedule({
                    instanceID,
                    startDateTime,
                    endDateTime
                });
            }
        }

        

        res.status(201).json({ message: "Programme created successfully", programmeID });
    } catch (error) {
        console.error("Error creating new programme:", error);
        res.status(500).json({ message: "Error creating new programme" });
    }
};

// Controller to delete a programme
const deleteProgramme = async (req, res) => {
    const { id } = req.params;
    try {
        await Programme.deleteProgramme(id);
        res.status(200).json({ message: "Programme deleted successfully" });
    } catch (error) {
        console.error("Error deleting programme:", error);
        res.status(500).json({ message: "Error deleting programme" });
    }
};

// Controller to update a programme
const updateProgramme = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const result = await Programme.updateProgramme(id, updatedData);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error updating programme:", error);
        res.status(500).json({ message: "Error updating programme" });
    }
};

module.exports = {
    getAllProgrammes,
    getFeaturedProgrammes,
    getProgrammesByCategory,
    searchProgrammes,
    getAllProgrammeDetails,
    getProgrammeByID,
    createProgramme,
    deleteProgramme,
    updateProgramme,
};