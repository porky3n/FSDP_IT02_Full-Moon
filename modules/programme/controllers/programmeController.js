const Programme = require("../../../models/programme");
const ProgrammeClass = require("../../../models/programmeClass");
const ProgrammeSchedule = require("../../../models/programmeSchedule");
const ProgrammeClassBatch = require("../../../models/programmeClassBatch");
const ProgrammeImages = require("../../../models/programmeImages");
const axios = require('axios');
const fs = require('fs');
const sharp = require('sharp');
const FormData = require('form-data');
const TelegramBot = require('node-telegram-bot-api');
const { fromBuffer } = require('file-type');
const { fileTypeFromBuffer } = require('file-type');
const path = require('path');




// Create a new Telegram bot instance
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Function to convert base64 to a temporary file
const base64ToFile = async (base64, filePath) => {
    const buffer = Buffer.from(base64, 'base64');
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
};

const decodeBase64ToFile = async (base64String, outputPath) => {
    try {
        // Clean the base64 string by removing any data URI prefixes
        const cleanedBase64 = base64String.replace(/^data:image\/\w+;base64,/, '');

        // Convert the base64 string to a buffer
        const buffer = Buffer.from(cleanedBase64, 'base64');

        // Use file-type to determine the format of the buffer
        const fileType = await fileTypeFromBuffer(buffer);
        if (fileType) {
            console.log(`Detected file type: ${fileType.mime}`);
        } else {
            console.error('Unable to detect the file type. The data may be corrupted.');
            return;
        }

        // Ensure the file extension matches the detected file type
        const correctOutputPath = outputPath.replace(/(\.\w+)$/, `.${fileType.ext}`);
        await fs.writeFile(correctOutputPath, buffer);
        console.log(`Decoded image saved to ${correctOutputPath}`);

        // Verify the size of the written file
        const fileStats = await fs.stat(correctOutputPath);
        console.log(`File size: ${fileStats.size} bytes`);

    } catch (error) {
        console.error('Error decoding Base64 string:', error);
    }
};

// Example function call with error handling
const uploadImage = async (programme) => {
    try {
        if (!programme.ProgrammePicture) {
            console.log('No image available for upload.');
            return;
        }

        // Convert to base64 string if it's a buffer
        let base64Data;
        if (Buffer.isBuffer(programme.ProgrammePicture)) {
            base64Data = programme.ProgrammePicture.toString('base64');
        } else if (typeof programme.ProgrammePicture === 'string') {
            base64Data = programme.ProgrammePicture.replace(/^data:image\/\w+;base64,/, '');
        } else {
            console.error('Unsupported image format.');
            return;
        }

        const outputPath = path.join(__dirname, '../../../temp', 'decoded-programme-40.png');
        await decodeBase64ToFile(base64Data, outputPath);

    } catch (error) {
        console.error('Error in uploadImage function:', error);
    }
};


// ver 2

// const uploadImage = async (programme) => {
//     try {
//         if (!programme.ProgrammePicture) {
//             console.log('No image available for upload.');
//             return;
//         }

//         let base64Data;
//         if (Buffer.isBuffer(programme.ProgrammePicture)) {
//             base64Data = programme.ProgrammePicture.toString('base64');
//         } else if (typeof programme.ProgrammePicture === 'string') {
//             base64Data = programme.ProgrammePicture.replace(/^data:image\/\w+;base64,/, '');
//         } else {
//             console.error('Unsupported image format.');
//             return;
//         }
        
//         // Convert base64 string to a temporary file
//         // const tempFilePath = path.join(__dirname, '../../../temp', `temp_${Date.now()}.jpg`);
//         // await base64ToFile(base64Data, tempFilePath);

//         // // Check if the file was created successfully
//         // if (!fs.existsSync(tempFilePath)) {
//         //     console.error('Temporary file was not created.');
//         //     return;
//         // }

//         // const tempFilePath = path.join(__dirname, '../../../temp', `programme-40.png`);
//         // console.log(`Temporary file created at: ${tempFilePath}`);

//         const imagePath = path.join(__dirname, '../../../temp', `programme-40.png`); 
//         console.log(`Temporary file created at: ${imagePath}`);
//         const imageBuffer = programme.ProgrammePicture;
//         const base64Image = imageBuffer.toString('base64');

//         // Decode and save the file for verification
//         await decodeBase64ToFile(base64Image, 'decoded-programme-40.png');
        
//         // Create a form to send the image
//         // const form = new FormData();
//         // form.append('chat_id', process.env.CHANNEL_ID);
//         // form.append('caption', `📢 New Programme: ${programme.ProgrammeName}`);
//         // form.append('photo', fs.createReadStream(tempFilePath));

//         // Log form data for debugging
//         form.getLength((err, length) => {
//             if (err) {
//                 console.error('Error getting form length:', err);
//                 return;
//             }
//             console.log('Form length:', length);
//         });

                
//         // Send the image to Telegram using axios
//         const response = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, form, {
//             headers: {
//                 ...form.getHeaders()
//             }
//         });
//         console.log(response.data);

//         console.log("Image uploaded successfully.");
//     } catch (error) {
//         console.error('Error uploading image:', error);
//     }
// };

// older ver, ver 1
// const uploadImage = async (programme) => {
//     try {

//         // Convert Buffer to Base64 string
//         const base64String = programme.ProgrammePicture.toString('base64');

//         // Format it to be used in an HTML `src` or in a data URI format
//         const base64Image = `data:image/jpeg;base64,${base64String}`; // Change 'jpeg' as needed
//         await bot.sendPhoto(process.env.CHANNEL_ID, base64Image, { caption: `📢 New Programme: ${programme.ProgrammeName}` });

//         console.log("Image uploaded successfully.");
//     } catch (error) {
//         console.error('Error uploading image:', error);
//     }
// };


// Function to handle sending text announcements to Telegram
const sendAnnouncement = async (programme) => {
    try {
        const fee = parseFloat(programme.Fee);
        const message = `
📢 *Upcoming Programme Alert!*

*Name*: ${programme.ProgrammeName}
*Description*: ${programme.Description}
*Location*: ${programme.Location}
*Fee*: $${fee.toFixed(2)}
*Level*: ${programme.ProgrammeLevel}
*Schedule*: ${new Date(programme.EarliestStartDateTime).toLocaleString()} to ${new Date(programme.LatestEndDateTime).toLocaleString()}
*Remarks*: ${programme.Remarks.replace(/~/g, ', ')}
        `;

        await bot.sendMessage(process.env.CHANNEL_ID, message, { parse_mode: 'Markdown' });
        console.log('Announcement message sent successfully.');
    } catch (error) {
        console.error('Error sending announcement message:', error);
    }
};

// Main function to handle programme announcements
const announceProgrammes = async (req, res) => {
    try {
        console.log("testing");
        const programmes = await Programme.getProgrammesThreeDaysAway();

        if (programmes.length === 0) {
            return res.send('No new programmes found.');
        }

        for (const programme of programmes) {
            // Send the image first
            await uploadImage(programme);
            // Send the announcement message
            await sendAnnouncement(programme);
        }

        res.send('Programmes announced successfully!');
    } catch (error) {
        console.error('Error announcing programmes:', error);
        res.status(500).send('Error announcing programmes.');
    }
};

// // Function to convert base64 to file
// const base64ToFile = async (base64, filePath) => {
//     const buffer = Buffer.from(base64, 'base64');
//     await fs.promises.writeFile(filePath, buffer);
//     return filePath;
// };
  
// const uploadImage = async (programme) => {
//     try {
//         JSON.stringify(programme); // Ensure programme is a JSON object
        
//         if (!programme.ProgrammePicture) {
//             console.log('No image available for upload.');
//             return;
//         }

//         let imageBuffer;
//         let imagePath = `./temp/temp_${Date.now()}.jpg`;

        
//         // Ensure the directory exists
//         if (!fs.existsSync('./temp')) {
//             fs.mkdirSync('./temp', { recursive: true });
//         }

//         if (typeof programme.ProgrammePicture === 'string') {
//             console.log('ProgrammePicture is a string');
//             // Remove any base64 header if present
//             const base64Data = programme.ProgrammePicture.replace(/^data:image\/\w+;base64,/, '');
//             // Convert base64 to file
//             await base64ToFile(base64Data, imagePath);
//         } else if (Buffer.isBuffer(programme.ProgrammePicture)) {
//             console.log('ProgrammePicture is a Buffer');
//             // Assume it's already a buffer
//             imageBuffer = programme.ProgrammePicture;
//             // Convert and resize the image using sharp
//             await sharp(imageBuffer)
//             .resize({ width: 1280 }) // Resize to a reasonable width if needed
//             .jpeg({ quality: 80 }) // Convert to JPEG format and compress
//             .toFile(imagePath);
//         } else {
//             console.log('ProgrammePicture is of unknown type:', typeof programme.ProgrammePicture);
//             throw new Error('Unsupported ProgrammePicture type');
//         }

//         console.log('Image processed and saved to:', imagePath);

//         // Send the image to the Telegram channel
//         const formData = new FormData();
//         formData.append('chat_id', process.env.CHANNEL_ID);
//         formData.append('photo', fs.createReadStream(imagePath));
//         formData.append('caption', 'text'); // Add your caption here

//         const response = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, formData, {
//             headers: formData.getHeaders()
//         });

//         if (response.status === 200) {
//             console.log('Image sent successfully with caption!');
//         } else {
//             console.error('Failed to send image:', response.status, response.statusText);
//         }

//         // Delete the temporary file after sending
//         fs.unlinkSync(imagePath);
//         console.log('Temporary image file deleted:', imagePath);

//         console.log('Image uploaded successfully.');
//     } catch (error) {
//         console.error('Error uploading image:', error);
//     }
// };
  
// const sendAnnouncement = async (programme) => {
//     try {
//         JSON.stringify(programme); // Ensure programme is a JSON object

//         const fee = parseFloat(programme.Fee); // Ensure fee is a number
//         const message = `
//     📢 *New Programme Alert!*

//     *Name*: ${programme.ProgrammeName}
//     *Description*: ${programme.Description}
//     *Location*: ${programme.Location}
//     *Fee*: $${fee.toFixed(2)}
//     *Level*: ${programme.ProgrammeLevel}
//     *Schedule*: ${new Date(programme.EarliestStartDateTime).toLocaleString()} to ${new Date(programme.LatestEndDateTime).toLocaleString()}
//     *Remarks*: ${programme.Remarks.replace(/~/g, ', ')}
//         `;

//         // Send the announcement message to Telegram
//         const response = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
//         chat_id: process.env.CHANNEL_ID,
//         text: message,
//         parse_mode: 'Markdown'
//         });

//         if (response.status === 200) {
//         console.log('Announcement message sent successfully.');
//         } else {
//         console.error('Failed to send announcement message:', response.status, response.statusText);
//         }
//     } catch (error) {
//         console.error('Error sending announcement message:', error);
//     }
// };
  
// const announceProgrammes = async (req, res) => {
//     try {
//         const programmes = await Programme.getUpcomingProgrammes();

//         if (programmes.length === 0) {
//         return res.send('No new programmes found.');
//         }

//         for (const programme of programmes) {
//         // Upload the image first, if available
//         await exports.uploadImage(programme);

//         // Send the announcement message separately
//         await exports.sendAnnouncement(programme);
//         }

//         res.send('Programmes announced successfully!');
//     } catch (error) {
//         console.error('Error announcing programmes:', error);
//         res.status(500).send('Error announcing programmes.');
//     }
// };

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
    const { keyword = '', category = '', page = 1, limit = 6 } = req.query;
    
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
    base64ToFile,
    uploadImage,
    sendAnnouncement,
    announceProgrammes,
    getAllProgrammes,
    getAllProgrammeDetails,
    getFeaturedProgrammes,
    getProgrammesByCategory,
    searchProgrammes,
    getProgrammeByID,
    createProgramme,
    deleteProgramme,
    updateProgramme,
};