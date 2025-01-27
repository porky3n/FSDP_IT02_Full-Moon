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
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

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




// Telegram Post
// Function to fetch messages from the Telegram group
const getUserMessage = async (req, res) => {
    try {
        // Make a GET request to the Telegram API to fetch updates
        const response = await axios.get(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`
        );

        // Extract updates from the response
        const updates = response.data.result;

        if (updates.length === 0) {
            return res.status(200).json({ message: "No new messages found." });
        }

        // Filter messages from the specific chat ID
        const filteredMessages = updates
            .filter(update => update.message && update.message.chat.id === -1002352524230)
            .map(update => {
                const message = update.message;
                return {
                    chatId: message.chat.id,
                    chatTitle: message.chat.title,
                    senderId: message.from.id,
                    senderUsername: message.from.username,
                    text: message.text,
                    date: new Date(message.date * 1000).toISOString(), // Convert timestamp to readable date
                };
            });

        if (filteredMessages.length === 0) {
            return res.status(200).json({ message: "No messages found for the specified chat." });
        }

        // Send the filtered messages as a response
        res.status(200).json({ messages: filteredMessages });
    } catch (error) {
        console.error("Error fetching user messages:", error);
        res.status(500).json({ message: "Failed to fetch user messages" });
    }
};






module.exports = {
    sendFormattedProgrammeToChatGPT,
    sendFormattedProgramme,
    announceProgrammes,
    sendProgrammeImage,
    getProgrammeImages,
    sendProgrammeImageToTelegram,
    getUserMessage,
};


// ===================== Telegram Bot Event Handlers ===================== //

// Listen for the "/start" command
// bot.onText(/\/start/, async (msg) => {
//     const chatId = msg.chat.id;
//     const messageId = msg.message_id;
//     const userName = msg.from.first_name || 'there';

//     // Send a welcome message to the user privately (via reply or direct message)
//     bot.sendMessage(chatId, `Hello, ${userName}! Welcome to our Telegram bot. How can I assist you today?`, {
//         reply_to_message_id: messageId,  // Optional: reply to the user's message
//     });

//     // Check if the message is from a group chat
//     if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
//         // Delete the original /start message to hide it from others
//         bot.deleteMessage(chatId, messageId).catch((error) => {
//             console.error("Failed to delete message:", error);
//         });
//     }
// });

// Listen for the "/start" command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'there';

    // Send a welcome message
    bot.sendMessage(chatId, `Hello, ${userName}! Welcome to our Telegram bot. How can I assist you today?`);
});

// Handle other messages
// const userCooldowns = {};  // To track user message timestamps
// const spamCooldownSeconds = 60;  // Allow posting every 60 seconds

// bot.on('message', async (msg) => {
//     const chatId = msg.chat.id;
//     const userId = msg.from.id;
//     const userMessage = msg.text;
//     const messageId = msg.message_id;

//     // Ignore bot's own messages
//     if (msg.from.is_bot) return;

//     // Spam prevention: Check if user is posting too frequently
//     if (userCooldowns[userId] && (Date.now() - userCooldowns[userId]) < spamCooldownSeconds * 1000) {
//         bot.deleteMessage(chatId, messageId).catch(() => {});
//         bot.sendMessage(userId, "You're sending messages too frequently. Please wait a while before posting again.");
//         return;
//     }

//     // Save the current timestamp to prevent spam
//     userCooldowns[userId] = Date.now();

//     // Moderate the message via OpenAI (ChatGPT)
//     try {
//         const response = await openai.chat.completions.create({
//             model: "gpt-4",
//             messages: [
//                 { role: "system", content: "You are a content moderator. Approve only relevant and polite messages." },
//                 { role: "user", content: userMessage }
//             ],
//         });

//         const moderationResult = response.choices[0].message.content.toLowerCase();

//         if (moderationResult.includes('approve')) {
//             bot.sendMessage(chatId, `${msg.from.first_name} posted:\n\n${userMessage}`);
//         } else {
//             bot.sendMessage(userId, "Your message was not approved. Please follow community guidelines.");
//         }

//         // Delete original message from group
//         bot.deleteMessage(chatId, messageId).catch(() => {});
//     } catch (error) {
//         console.error("Error during moderation:", error);
//         bot.sendMessage(userId, "An error occurred while processing your message. Please try again later.");
//     }
// });

// Message handling logic with spam and moderation checks
const userCooldowns = {}; // Store user cooldown timestamps
const spamCooldownSeconds = 5; // Cooldown period in seconds

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const messageId = msg.message_id;
    const userMessage = msg.text;

    // Ensure the message contains text
    if (!userMessage) {
        console.log('Received a non-text message, ignoring it.');
        return;
    }

    // Spam prevention: Check if the user is posting too frequently
    // if (userCooldowns[userId] && (Date.now() - userCooldowns[userId]) < spamCooldownSeconds * 1000) {
    //     // Delete the user's message
    //     bot.deleteMessage(chatId, messageId).catch(() => {}); // Ignore errors if the message was already deleted
    //     bot.sendMessage(chatId, `@${msg.from.username || msg.from.first_name}, you're sending messages too frequently. Please wait a while before posting again.`, { parse_mode: "Markdown" });
    //     return;
    // }

    // Save the current timestamp to track user activity
    userCooldowns[userId] = Date.now();

    // AI moderation
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a moderator. Return `1` if the message is polite and relevant, even if it is short or simple. Return `2` only if the message is explicitly impolite, irrelevant, or inappropriate." },
                { role: "user", content: userMessage }
            ],
        });
    
        console.log("Moderation response:", response.choices[0].message.content);
        const moderationResult = response.choices[0].message.content.trim();
    
        if (moderationResult === '1') {
            // Approved message
            // bot.deleteMessage(chatId, messageId).catch(() => {});
            // bot.sendMessage(chatId, `${mentionUser(msg.from)} posted:\n\n${userMessage}`, { parse_mode: "Markdown" });
        } else if (moderationResult === '2') {
            // Unapproved message
            bot.deleteMessage(chatId, messageId).catch(() => {});
            bot.sendMessage(chatId, `@${msg.from.username || msg.from.first_name}, Your message was not approved. Please follow the rules.`, { parse_mode: "Markdown" });
            await restrictUser(chatId, userId, 1, msg.from);
        } else {
            console.error("Unexpected moderation result:", moderationResult);
        }
    } catch (error) {
        console.error("Error during moderation:", error.message);
    }
    
});


// Function to mention the user by Telegram ID
// const mentionUser = (user) => {
//     if (user.username) {
//         return `@${user.username}`;
//     } else {
//         return `[${user.first_name || 'User'}](tg://user?id=${user.username})`;
//     }
// };

// Restrict user and start countdown for auto-unrestriction
async function restrictUser(chatId, userId, durationMinutes, userInfo) {
    try {
        // Check if the user is the chat owner or an admin
        const chatMember = await bot.getChatMember(chatId, userId);
        const userStatus = chatMember.status;

        // Skip restriction if user is owner or admin
        if (userStatus === 'creator' || userStatus === 'administrator') {
            console.log(`Cannot restrict user ${userId} as they are ${userStatus}.`);
            return;
        }

        // Restrict user for the specified duration
        const untilDate = Math.floor(Date.now() / 1000) + durationMinutes * 60;
        await bot.restrictChatMember(chatId, userId, {
            can_send_messages: false,
            can_send_media_messages: false,
            can_send_polls: false,
            can_send_other_messages: false,
            can_add_web_page_previews: false,
            until_date: untilDate,
        });

        console.log(`${userInfo.first_name} has been restricted for ${durationMinutes} minutes.`);

        // Schedule automatic unrestriction
        setTimeout(async () => {
            await unrestrictUser(chatId, userId);
        }, durationMinutes * 60 * 1000);

        //private dm
        bot.sendMessage(chatId, `${userInfo.first_name} has been restricted for ${durationMinutes} minutes.`);
    } catch (error) {
        console.error(`Failed to restrict user: ${error.message}`);
    }
}


// Function to unrestrict the user
const unrestrictUser = async (chatId, userId) => {
    try {
        await bot.restrictChatMember(chatId, userId, {
            permissions: {
                can_send_messages: true,
                can_send_media_messages: true,
                can_send_other_messages: true,
                can_add_web_page_previews: true,
            }
        });

        bot.sendMessage(chatId, `[${userId}](tg://user?id=${userId}) is now unrestricted.`, { parse_mode: "Markdown" });
    } catch (error) {
        console.error("Failed to unrestrict user:", error);
    }
};


const postComments = {}; // Temporary in-memory storage (use a database in production)

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const messageId = msg.message_id;
    const userMessage = msg.text;

    // Check if it's a post (you can define what qualifies as a post)
    if (!userMessage.startsWith('/')) {
        // Treat this as a post
        const postId = Object.keys(postComments).length + 1; // Generate a new post ID
        postComments[postId] = { messageId, comments: [] };

        bot.sendMessage(chatId, `Post created with ID: ${postId}. Users can comment using /comment ${postId}.`);
        return;
    }

    // Handle commands
    const [command, ...args] = userMessage.split(' ');

    if (command === '/comment') {
        const postId = args[0];
        const commentText = args.slice(1).join(' ');

        if (!postId || !postComments[postId]) {
            bot.sendMessage(chatId, 'Invalid post ID. Please provide a valid post to comment on.');
            return;
        }

        if (!commentText) {
            bot.sendMessage(chatId, 'Please provide a comment.');
            return;
        }

        // Add the comment to the post
        postComments[postId].comments.push({ user: msg.from.first_name, text: commentText });

        bot.sendMessage(chatId, `Your comment has been added to post ID: ${postId}.`);
        return;
    }

    if (command === '/viewcomments') {
        const postId = args[0];

        if (!postId || !postComments[postId]) {
            bot.sendMessage(chatId, 'Invalid post ID. Please provide a valid post ID to view comments.');
            return;
        }

        const comments = postComments[postId].comments;
        if (comments.length === 0) {
            bot.sendMessage(chatId, `No comments yet for post ID: ${postId}.`);
            return;
        }

        const commentsText = comments.map((c, i) => `${i + 1}. ${c.user}: ${c.text}`).join('\n');
        bot.sendMessage(chatId, `Comments for post ID ${postId}:\n\n${commentsText}`);
        return;
    }
});

// Function to start countdown and update the user every minute
// const startCountdown = (chatId, userId, durationMinutes) => {
//     let remainingTime = durationMinutes;

//     const countdownInterval = setInterval(async () => {
//         remainingTime--;
        
//         if (remainingTime > 0) {
//             bot.sendMessage(chatId, `User [${userId}](tg://user?id=${userId}) is restricted. ${remainingTime} minutes remaining.`, { parse_mode: "Markdown" });
//         } else {
//             clearInterval(countdownInterval);
//             await unrestrictUser(chatId, userId);
//         }
//     }, 60 * 1000); // Run every 1 minute
// };




console.log('Bot is running...');