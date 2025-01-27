const Programme = require("../../../models/programme");
const axios = require('axios');
const FormData = require('form-data');
const TelegramBot = require('node-telegram-bot-api');
// const { fromBuffer } = require('file-type');
// const { fileTypeFromBuffer } = require('file-type');
// const path = require('path');
// const tmp = require('tmp');
const OpenAI = require("openai");
const mindSphereData = require('../../chatbot/data/mindSphereData');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const fileType = require('file-type');
// Load environment variables from .env
require('dotenv').config();


// due to issue of Railway database when using .env file for OPEN API KEY, the key is hardcoded here
const OPENAI_API_KEY_part1="sk-proj-qe1XH7QWJmcsAPhkBvY3RNQatBGwazsROnKaL7Z9xdm50g2kc7zx1uKn7fkdrd";
const OPENAI_API_KEY_part2="acrEBMeXcQ_-T3BlbkFJHiS1DaIKCY0QQkBCalzpbVl9EmtwthlQZAJhFnNydIWezzI652zZrlF21NwlbCRzMs2mqyTWoA";
const OPENAI_API_KEY = OPENAI_API_KEY_part1 + OPENAI_API_KEY_part2;

// Create a new Telegram bot instance
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Configure OpenAI API
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const saveProgrammeImageToTemp = async (programmeID) => {
    try {
        // Fetch the image from the database
        const imageData = await Programme.getProgrammePictureByID(programmeID);

        if (!imageData) {
            throw new Error(`No image found for ProgrammeID: ${programmeID}`);
        }

        // Validate Base64 format
        const buffer = Buffer.from(imageData, "base64");
        const detectedType = await fileType.fromBuffer(buffer);

        if (!detectedType || !["image/jpeg", "image/png", "image/webp"].includes(detectedType.mime)) {
            throw new Error(`Unsupported image format: ${detectedType ? detectedType.mime : "unknown"}`);
        }

        console.log(`Detected image format: ${detectedType.mime}`);

        // Define the temporary file path
        const tempDir = path.join(__dirname, "../../../temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir); // Create the temp directory if it doesn't exist
        }

        const tempFilePath = path.join(tempDir, `programme_${programmeID}_${Date.now()}.${detectedType.ext}`);

        // Save the image to the temporary file
        fs.writeFileSync(tempFilePath, buffer);
        console.log(`Image saved to: ${tempFilePath}`);

        return tempFilePath;
    } catch (error) {
        console.error("Error saving programme image to temporary file:", error);
        throw error;
    }
};

const sendProgrammeImageToTelegram = async (programmeID, caption = "") => {
    try {
        const tempFilePath = await saveProgrammeImageToTemp(programmeID);

        // Validate and optimize the image
        const validImagePath = await validateAndOptimizeImage(tempFilePath);

        const formData = new FormData();
        formData.append("chat_id", process.env.TELEGRAM_CHANNEL_ID);
        formData.append("photo", fs.createReadStream(validImagePath));
        formData.append("caption", caption);

        // Send the image to Telegram
        const response = await axios.post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
            formData,
            { headers: formData.getHeaders() }
        );

        console.log("Image sent to Telegram successfully:", response.data);

        // Clean up temporary files
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(validImagePath);
    } catch (error) {
        console.error("Error sending programme image to Telegram:", error);
        throw error;
    }
};

const validateAndOptimizeImage = async (filePath) => {
    try {
        // Check if the file is a valid image
        const metadata = await sharp(filePath).metadata();
        console.log(`Image format: ${metadata.format}, Dimensions: ${metadata.width}x${metadata.height}`);

        // Define a new output file path
        const optimizedDir = path.join(path.dirname(filePath), 'optimized');
        if (!fs.existsSync(optimizedDir)) {
            fs.mkdirSync(optimizedDir); // Create the optimized directory if it doesn't exist
        }
        const optimizedPath = path.join(optimizedDir, `${path.basename(filePath, path.extname(filePath))}-optimized${path.extname(filePath)}`);

        // Optionally resize or optimize the image
        await sharp(filePath)
            .resize(800, 600, { fit: "inside" }) // Resize if necessary
            .jpeg({ quality: 80 }) // Optimize quality
            .toFile(optimizedPath);

        console.log(`Optimized image saved to: ${optimizedPath}`);
        return optimizedPath;
    } catch (error) {
        console.error("Error validating or optimizing image:", error);
        throw error;
    }
};

// Wrapper function to handle HTTP requests
const sendProgrammeImage = async (req, res) => {
    const { programmeID } = req.params;

    try {
        const caption = "Check out this amazing programme!"; // Replace with actual caption logic
        await sendProgrammeImageToTelegram(programmeID, caption);

        res.status(200).json({ message: "Image sent to Telegram successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error sending image to Telegram", error: error.message });
    }
};

// Function to send announcements for programmes 3 days away
const sendThreeDayProgrammeAnnouncements = async () => {
    try {
        const programmes = await Programme.getProgrammesThreeDaysAway();

        if (programmes.length === 0) {
            console.log('No programmes found that are 3 days away.');
            return;
        }

        for (const programme of programmes) {
            // Send formatted programme details to Telegram
            const formattedProgrammeDetails = await sendProgrammeDetailsToChatGPT(programme);
            await bot.sendMessage(process.env.CHANNEL_ID, formattedProgrammeDetails, { parse_mode: 'Markdown' });
            console.log(`Programme announcement sent for: ${programme.ProgrammeName}`);
        }
    } catch (error) {
        console.error('Error announcing programmes:', error);
    }
};

// Schedule the task to run daily at a specific time (e.g., 8:00 AM)
cron.schedule('0 10 * * *', () => {
    console.log('Running scheduled task to announce programmes 3 days before start.');
    sendThreeDayProgrammeAnnouncements();
});

// Utility function to format and send data to ChatGPT for response
const sendProgrammeDetailsToChatGPT = async (programme) => {
    try {
        const currentDate = new Date().toLocaleDateString('en-SG', { timeZone: 'Asia/Singapore' });
        
        console.log(programme);

        // Format the programme details for ChatGPT
        const programmeDetails = `
            **Programme Name**: ${programme.ProgrammeName}
            **Category**: ${programme.Category}
            **Description**: ${programme.Description}
            **Location**: ${programme.Location ? programme.Location : 'To be confirmed'}
            **Fee**: ${programme.Fee ? `$${parseFloat(programme.Fee).toFixed(2)}` : 'Free'}
            **Level**: ${programme.ProgrammeLevel}
            **Schedule**: ${new Date(programme.EarliestStartDateTime).toLocaleString()} to ${new Date(programme.LatestEndDateTime).toLocaleString()}
            **Remarks**: ${programme.Remarks ? programme.Remarks.split('~').join('\n') : 'None'}
            **Slots Left**: ${programme.SlotsLeft}
        `;

        const messages = [
            {
                role: 'system',
                content: `You are an expert assistant tasked with presenting programme details in a clear and engaging manner. Make the announcement friendly, inviting and neater using styles for Telegram messages.
                You can use styles like bolding, which is '*' for Markdown. If the slots are low, make it stand out to users, and create a sense of urgency to sign up.
                If unsure, provide a general response. If there is a few days left to the event, make sure to highlight it and urge users to sign up.
                Do not reveal any private or personal information, and ensure that user privacy is protected. The current date is ${currentDate}. 
                Company Contact Information: ${JSON.stringify(mindSphereData.contact)}.
                Present the programme details in an easy-to-read format. Keep your responses at most 300 words. You should make an engaing description, here's a reference:
                Hey FoodAIDers! 🫶🤗

                FoodAID is excited to bring you our first Sub-comm event Turning Flaws Into Fresh Finds #1! 🍉 This is your chance to make a difference by redistributing imperfect produce and near-expiry food items, reducing food waste for a good cause. 

                "Details of Event:
                Date 📆: 16 November 2024, Saturday
                Reporting Time 🕑: 1.50 pm
                Dismissal Time 🕞: 7.50 pm
                Reporting Venue 📲: Entrance/Exit B - Thanggam LRT (SW4)
                Event Venue 📍: Thanggam Hub, 40 Fernvale Road, S(797699), Hardcourt next to Thanggam LRT
                Dress Code 👕: NP/FoodAID Shirt and Covered Shoes (Ensure you have either an NP/FoodAID Shirt)
                Things to Bring 🎒: Umbrella/Poncho, EZ-Link Card, Water Bottle, Hand Sanitiser

                For inquiries, contact:
                Fazal 🥐 WhatsApp: 8268 1571, Tele: @fazalz
                Rui Ning ☔️ WhatsApp: 8809 1773, Tele: @xpzro
                Rachel 🍓 WhatsApp: 9388 4734, Tele: @wreckgel

                📌 Successful FoodAIDers will be added to a WhatsApp group by 12 November, Tuesday upon confirmation
                📌 Limited Slots available
                📌 First-Come-First-Serve Basis. SIGN UP NOW!!
                📌 Waiting List slots available! Scroll through the form for more details!
                📌 You will be awarded 5.0 Service (S) hours for your participation.

                ✅ Please remember to have your meal before coming for the event
                ✅ This is a Face-to-Face event
                ✅ It is compulsory to have an NP/FoodAID Shirt for this event

                📝 Do take note that short pants are recommended as the venue may get humid!

                See you at Turning Flaws Into Fresh Finds #1!"`
            },
            {
                role: 'user',
                content: `Here is the programme detail that needs formatting:\n\n${programmeDetails}`
            }
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
        });

        const formattedResponse = response.choices[0].message.content.trim();
        console.log('Formatted Programme Details:', formattedResponse);

        return formattedResponse;
    } catch (error) {
        console.error('Error sending programme details to ChatGPT:', error.message);
        throw new Error('Failed to format programme details.');
    }
};

// Controller to send a programme announcement to ChatGPT and Telegram
const sendFormattedProgrammeToChatGPT = async (programmeID) => {
    try {
        // Fetch the programme from the database
        const programme = await Programme.getProgrammeDetailsByID(programmeID);

        if (!programme) {
            return res.status(404).json({ message: 'Programme not found' });
        }

        // Get formatted programme details from ChatGPT
        const formattedProgrammeDetails = await sendProgrammeDetailsToChatGPT(programme);

        await bot.sendMessage(process.env.CHANNEL_ID, formattedProgrammeDetails, { parse_mode: 'Markdown' });
        console.log('Announcement message sent successfully.');

        // // Send the formatted text and image to Telegram
        // const channelId = process.env.CHANNEL_ID;
        // const form = new FormData();
        // form.append('chat_id', channelId);
        // form.append('caption', formattedProgrammeDetails);

        // // // Create a temporary file and write the image data to it
        // // const { path: tempFilePath } = await tmp.file();
        // // await fs.promises.writeFile(tempFilePath, programme.ProgrammePicture);

        // // // Append the temporary file to the form data
        // // form.append('photo', fs.createReadStream(tempFilePath), {
        // // filename: 'announcement.jpg',
        // // contentType: 'image/jpeg'
        // // });

        // // const optimizedImageBuffer = await optimizeImage(programme.ProgrammePicture);
        // const base64Image = programme.ProgrammePicture ? `data:image/jpeg;base64,${programme.ProgrammePicture.toString("base64")}` : null;
        // form.append('photo', base64Image, {
        //   filename: 'announcement.jpg',
        //   contentType: 'image/jpeg'
        // });

        // await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, form, {
        //     headers: {
        //         ...form.getHeaders()
        //     },
        //     timeout: 60000 // 60 seconds
        // });

        console.log('Programme announcement sent successfully to Telegram');
    } catch (error) {
        console.error('Error sending formatted programme to ChatGPT and Telegram:', error);
    }
};

// Wrapper function to handle HTTP requests
const sendFormattedProgramme = async (req, res) => {
    const programmeID = req.body.programmeID;
    try {
        await sendFormattedProgrammeToChatGPT(programmeID);
        res.status(200).json({ message: 'Programme announcement sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending programme announcement' });
    }

};

const getProgrammeImages = async (req, res) => {
    try {
        const [images] = await pool.query(`
            SELECT 
                ImageID, 
                ProgrammeID, 
                TO_BASE64(Image) AS Image 
            FROM ProgrammeImages
        `);
        res.json(images);
    } catch (error) {
        console.error("Error fetching programme images:", error);
        res.status(500).json({ message: "Failed to fetch programme images" });
    }
};

// Main function to handle programme announcements 3 days away
const announceProgrammes = async (req, res) => {
    try {
        console.log("testing");
        const programmes = await Programme.getProgrammesThreeDaysAway();

        if (programmes.length === 0) {
            return res.send('No new programmes found.');
        }

        for (const programme of programmes) {
            // // Send the image first
            // await uploadImage(programme);
            // // Send the announcement message
            // await sendAnnouncement(programme);

            sendAnnouncementToTelegram(programme);
        }

        res.send('Programmes announced successfully!');
    } catch (error) {
        console.error('Error announcing programmes:', error);
        res.status(500).send('Error announcing programmes.');
    }
};

module.exports = {
    sendFormattedProgrammeToChatGPT,
    sendFormattedProgramme,
    announceProgrammes,
    sendProgrammeImage,
    getProgrammeImages,
    sendProgrammeImageToTelegram,
};