const Programme = require("../../../models/programme");
const axios = require("axios");
const FormData = require("form-data");
const OpenAI = require("openai");


// Configure OpenAI API
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const fileType = require("file-type");
require("dotenv").config();
const mindSphereData = require("../../chatbot/data/mindSphereData");
const pool = require("../../../dbConfig"); // Database connection
const cron = require("node-cron");
const { v4: uuidv4 } = require("uuid");

// for chatbot
const moment = require('moment-timezone');
const ChatDataModel = require('../../../models/chatbot'); 
const faqs = require('../../../modules/chatbot/data/faqs'); 

// OpenAI API setup
const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_API_KEY}`,
});

// Telegram Bot Setup
const TelegramBot = require("node-telegram-bot-api");
const isProduction = process.env.NODE_ENV === "production";
const botOptions = isProduction ? { webHook: { port: process.env.PORT || 3000 } } : { polling: true };
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, botOptions);
const CHANNEL_ID = process.env.CHANNEL_ID; // Telegram Channel ID
const GROUP_ID = process.env.GROUP_ID; // Telegram Group ID

const website = `https:///${process.env.RAILWAY_DOMAIN}`; // Website link to embed in messages
const CHANNEL_INVITE = process.env.CHANNEL_INVITE; // Invite link for the Telegram Channel
const GROUP_INVITE = process.env.GROUP_INVITE; // Invite link for the Telegram Group

const Tier = require("../../../models/tier");

// Log errors
// bot.on("polling_error", (error) => {
//   console.error("Polling error:", error);
// });

// Function to initialize the bot (receives `app` from `app.js`)
const initBot = (app) => {
  if (isProduction) {
    const WEBHOOK_URL = `https://${process.env.RAILWAY_DOMAIN}/bot${process.env.TELEGRAM_BOT_TOKEN}`;
    bot.setWebHook(WEBHOOK_URL);
    app.use(bot.webhookCallback(`/bot${process.env.TELEGRAM_BOT_TOKEN}`));
    console.log("Running in Webhook mode (Railway)");
  } else {
    console.log("Running in Polling mode (Local)");
  }

  return bot; // Return the bot instance
};

// Delete expired Telegram IDs from the database
cron.schedule("0 0 * * *", async () => { // Every midnight
    try {
        await pool.query(`DELETE FROM TemporaryTelegramIDs WHERE expires_at <= NOW()`);
        console.log("Expired tokens cleaned up.");
    } catch (error) {
        console.error("Error cleaning up expired tokens:", error);
    }
});


// 📌 **Handle `/start` Command**
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  if (msg.chat.type === "group" || msg.chat.type === "supergroup" || msg.chat.type === "channel") {
    bot.sendMessage(chatId, "⚠️ This command can only be used in *direct messages*. Please message me privately.", {
      parse_mode: "markdown"
    })
    return;
  };
  const firstName = msg.chat.first_name || "User";

  // Send a welcome message and ask for email or phone
  bot.sendMessage(
    chatId,
    `Hi ${firstName}! 👋\n\nWelcome to *MindSphere*! 🚀\n\n✅ Before we continue, please reply with your *email address* so we can link your Telegram account.`, { parse_mode: "markdown" }
  );

  bot.once("message", async (response) => {
    const identifier = response.text; // Assume the user replies with an email

    try {
      // Save the chatId and identifier in the database
      await pool.query(
        `INSERT INTO TemporaryTelegramIDs (telegram_id, token, expires_at)
         VALUES (?, ?, NOW() + INTERVAL 1 DAY)
         ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
        [chatId, identifier]
      );


    // Escape message correctly
    const inviteMessage = `
    🎉 *Great! Now join our official Telegram communities:*\n🔹 [Join Our Channel](${CHANNEL_INVITE}) \
    \n🔹 [Join Our Group](${GROUP_INVITE})\
    \n⚠️ *Once you've joined, type* /confirm *to verify your membership.*
      `;
    
      bot.sendMessage(chatId, inviteMessage, { parse_mode: "markdown" });
      
    } catch (error) {
      console.error("Error saving Telegram ID and identifier:", error);
      bot.sendMessage(chatId, "❌ An error occurred. Please try again later.");
    }
  });
});

// 📌 **Handle `/confirm` Command (Check if user joined)**
bot.onText(/\/confirm/, async (msg) => {
  const chatId = msg.chat.id;
  if (msg.chat.type === "group" || msg.chat.type === "supergroup" || msg.chat.type === "channel") {
    bot.sendMessage(chatId, "⚠️ This command can only be used in *direct messages*. Please message me privately.", {
      parse_mode: "markdown"
    })
    return;
  };

  try {
    // Check if user is in the channel
    const channelMember = await bot.getChatMember(CHANNEL_ID, chatId);
    const groupMember = await bot.getChatMember(GROUP_ID, chatId);

    if (
      ["member", "administrator", "creator"].includes(channelMember.status) &&
      ["member", "administrator", "creator"].includes(groupMember.status)
    ) {
      bot.sendMessage(
        chatId,
        `✅ *Thank you for joining our communities!* 🎉\n\nYou're all set! Stay tuned for updates and discussions in our group.`
      );
    } else {
      const inviteMessage = 
        `⚠️ *It looks like you haven't joined both our Telegram Channel and Group.*\n\n` +
        `Please make sure you've joined:\n` +
        `🔹 [Join Our Channel](${CHANNEL_INVITE})\n` +  
        `🔹 [Join Our Group](${GROUP_INVITE})\n\n` +
        `Once you've joined, type *"/confirm"* again.`;
      bot.sendMessage(chatId, inviteMessage, { parse_mode: "markdown" }); // Ensuring proper Markdown parsing
    }
  } catch (error) {
    console.error("Error checking Telegram membership:", error);
    bot.sendMessage(chatId, "❌ An error occurred while verifying your membership. Please try again.");
  }
});

cron.schedule("*/5 * * * *", async () => { // Runs every minute for testing
  try {
      // Fetch all tier details dynamically (MinPurchases, TierDuration, Discounts)
      const tiers = await Tier.getMembershipTier();

      if (!tiers.length) {
          console.log("⚠️ No membership tiers with expiry durations found. Skipping reminders.");
          return;
      }

      // Loop through each tier and calculate when reminders should be sent
      for (const aTier of tiers) {
          const { tier, tierDuration } = aTier;
          // Calculate when reminders should be sent
          const minReminderDays = Math.floor((tierDuration * 5) / 6); // 5/6 of TierDuration (when reminders start)
          const maxReminderDays = tierDuration; // Exact expiry date

          console.log(`🔍 Checking reminders for Tier: ${tier}`);
          console.log(`📆 Reminder range: ${minReminderDays} to ${maxReminderDays} days before expiry`);
          // Fetch users whose memberships expire soon
          const [usersExpiringSoon] = await pool.query(
            `SELECT P.ParentID, P.FirstName, P.Membership, P.StartDate, P.TelegramChatID, T.TierDuration
             FROM Parent P
             JOIN TierCriteria T ON P.Membership = T.Tier
             WHERE T.TierDuration > 0
              AND DATE_ADD(P.StartDate, INTERVAL ? DAY) <= CURDATE()
              AND DATE_ADD(P.StartDate, INTERVAL ? DAY) >= CURDATE()`, 
              [minReminderDays, maxReminderDays]
        );

        
        if (usersExpiringSoon.length === 0) {
          console.log(`No users need reminders for ${aTier}.`);
          continue;
        }

        // get today's date
        const today = moment().format("YYYY-MM-DD");

        console.log("Users Expiring Soon: ", JSON.stringify(usersExpiringSoon, null, 2));
        console.log("Tier Duration: ", tierDuration);
          // Send reminders
          for (const user of usersExpiringSoon) {
            console.log("User: ", JSON.stringify(user, null, 2));
            await sendMembershipReminder(user, maxReminderDays - today);
          }
      }

      console.log("Dynamic membership expiry reminders sent successfully.");
  } catch (error) {
      console.error("Error sending membership reminders:", error);
  }
});


const sendMembershipReminder = async (user, reminderDays) => {
  const { FirstName, Membership, StartDate, TelegramChatID } = user;

  if (!TelegramChatID) {
      console.warn(`Skipping reminder for ${FirstName} (${Membership}) - No Telegram ID found.`);
      return;
  }

  // Fetch tier-specific details
  const tierDetails = await Tier.getSpecificTier(Membership);
  if (!tierDetails) {
      console.warn(`No tier details found for ${Membership}. Skipping reminder.`);
      return;
  }

  const { TierDuration, TierDiscount, MinPurchases } = tierDetails;

  const today = new Date();
  const expiryDate = moment(today).add(TierDuration, "days").format("MMMM D, YYYY");

  // Generate personalized reminder message using ChatGPT
  const chatMessages = [
      {
          role: "system",
          content: `
              You are an AI assistant crafting **personalized membership expiry reminders** for users.
              The user's membership tier is **${Membership}**, which gives them **${TierDiscount}% off all programs**.
              Their membership **expires on ${expiryDate}**, and they only have **${reminderDays} days left**.

              🔹 **Guidelines:**
              - Be **friendly & engaging**.
              - Emphasize that their **${TierDiscount}% discount will be lost** if they don’t renew.
              - Create **urgency**, but keep it **positive**.
              - Include a **call-to-action** (e.g., renew now to keep your discount).
              - Mention they need to **purchase ${MinPurchases} programs** to maintain their tier.

              Generate a **concise and engaging message** in Markdown format.
          `
      },
      {
          role: "user",
          content: `
              User: ${FirstName}
              Membership Tier: ${Membership}
              Discount: ${TierDiscount}%
              Expiry Date: ${expiryDate}
              Reminder Days Left: ${reminderDays}
              Renewal Requirement: Purchase ${MinPurchases} programs
              
              Provide a **clear, friendly renewal reminder** with a Markdown-formatted call-to-action, the markdown format should work in Telegram through the Telegram Bot API, but it should be in text format with some boldings and italics if needed.
              This is the website link to embed: "${website}"
          `
      }
  ];

  try {
      const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: chatMessages,
      });

      const reminderMessage = response.choices[0].message.content.trim();
      console.log("Chat ID:", TelegramChatID);
      console.log("Reminder Message:", reminderMessage);
      await bot.sendMessage(TelegramChatID, reminderMessage, { parse_mode: "Markdown" });

      console.log(`Reminder sent to ${FirstName} (${Membership}) - ${reminderDays} days left.`);
  } catch (error) {
      console.error(`Failed to send reminder to ${FirstName}:`, error);
  }
};


const sendTelegramMessage = async (chatId, message) => {
  try {
      await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      console.log(`Sent message to Telegram user: ${chatId}`);
  } catch (error) {
      console.error(`Error sending message to Telegram user ${chatId}:`, error.message);
  }
};

// Create a clickable location link
const createLocationLink = (location) => {
    if (location.toLowerCase().includes("http") || location.toLowerCase().includes("www.")) {
      // If the location is an online link (e.g., Zoom, Google Meet), return it as-is
      return `[Join the Online Meeting](${location})`;
    } else if (location.toLowerCase().includes("online")) {
      // If the location is an online platform, provide a generic message
      return `🌐 *Online Event* - Meeting Link Not Confirmed/Unknown, ask mindSphere admin for help if any.`
    } else {
      // Otherwise, treat it as a physical address and generate a Google Maps link
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      return `[${location}](${mapsLink})`;
    }
  };
  
// Save programme image to a temporary file
const saveProgrammeImageToTemp = async (programmeID) => {
  try {
    const imageData = await Programme.getProgrammePictureByID(programmeID);
    if (!imageData) throw new Error(`No image found for ProgrammeID: ${programmeID}`);

    const buffer = Buffer.from(imageData, "base64");
    const detectedType = await fileType.fromBuffer(buffer);

    if (!detectedType || !["image/jpeg", "image/png", "image/webp"].includes(detectedType.mime)) {
      throw new Error(`Unsupported image format: ${detectedType ? detectedType.mime : "unknown"}`);
    }

    console.log(`Detected image format: ${detectedType.mime}`);

    const tempDir = path.join(__dirname, "../../../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const tempFilePath = path.join(tempDir, `programme_${programmeID}_${Date.now()}.${detectedType.ext}`);
    fs.writeFileSync(tempFilePath, buffer);

    console.log(`Image saved to: ${tempFilePath}`);
    return tempFilePath;
  } catch (error) {
    console.error("Error saving programme image to temporary file:", error);
    throw error;
  }
};

// Validate and optimize image
const validateAndOptimizeImage = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    console.log(`Image format: ${metadata.format}, Dimensions: ${metadata.width}x${metadata.height}`);

    const optimizedDir = path.join(path.dirname(filePath), "optimized");
    if (!fs.existsSync(optimizedDir)) fs.mkdirSync(optimizedDir);

    const optimizedPath = path.join(
      optimizedDir,
      `${path.basename(filePath, path.extname(filePath))}-optimized${path.extname(filePath)}`
    );

    await sharp(filePath)
      .resize(800, 600, { fit: "inside" })
      .jpeg({ quality: 80 })
      .toFile(optimizedPath);

    console.log(`Optimized image saved to: ${optimizedPath}`);
    return optimizedPath;
  } catch (error) {
    console.error("Error validating or optimizing image:", error);
    throw error;
  }
};

// Delete temporary files
const cleanUpFiles = (files) => {
  files.forEach((filePath) => {
    try {
        console.log(`Attempting to delete temporary file: ${filePath}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted temporary file: ${filePath}`);
      }
    } catch (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  });
};

// Fetch programme details and format them
const fetchFormattedDetails = async (programme) => {
    const currentDate = new Date().toLocaleDateString("en-SG", { timeZone: "Asia/Singapore" });
  
    if (programme.DiscountValue === null || programme.DiscountValue === 0) {
        programme.DiscountValue = "Free";
    }


    // Create a clickable location link
    const locationLink = createLocationLink(programme.Location || "To be confirmed");

    // Format the details with Markdown-friendly styling
    const programmeDetails = `
  🔍Name: *${programme.ProgrammeName}*
  💡 *Category*: ${programme.Category}
  📍 *Location*: ${locationLink}
  ⏳ *Duration*: ${programme.Duration || "Not specified"}
  📅 *Date*: ${new Date(programme.EarliestStartDateTime).toLocaleString()} to ${new Date(
      programme.LatestEndDateTime
    ).toLocaleString()}
  💵 *Fee*: ${programme.Fee ? `$${parseFloat(programme.Fee).toFixed(2)}` : "Free"}
  🎯 *Level*: ${programme.ProgrammeLevel || "All levels"}
  
  📖 *Description*: ${programme.Description}
  Discount: ${programme.DiscountType === "Percentage" ? `${programme.DiscountValue}% off` : `$${programme.DiscountValue} off`}

  ⚠️ *Remarks*: ${programme.Remarks || "None"}
  🎟 *Slots Available*: ${programme.SlotsLeft || "Not specified"}
  Reviews: ${
                programme.Reviews
                    ? programme.Reviews.map(
                          (review) =>
                              `${review.ReviewerName} (${review.Rating}/5): "${review.ReviewText}"`
                      ).join("\n")
                    : "No reviews yet"
            }
  📌 _Don't miss this chance! Reserve your spot today!_
    `;
  
    // Use OpenAI to generate an engaging summary (optional)
    const messages = [
      {
        role: "system",
        content: `You are an expert assistant tasked with presenting programme details in a clear and engaging manner. Make the announcement friendly, inviting and neater using styles for Telegram messages.
                **Important: You will be provided the programme details.**
                You can use styles like bolding, which is '*' for Markdown. If the slots are low, make it stand out to users, and create a sense of urgency to sign up.
                If unsure, provide a general response. If there is a few days left to the event, make sure to highlight it and urge users to sign up. 
                You will write it in an engaging and informative manner. You can add emojis, bullet points, and other formatting to make it more appealing.
                You can use marketing gimmicks to attract more attention, such as limited slots, discounts (if any), or limited time left.
                Do not reveal any private or personal information, and ensure that user privacy is protected. \
                The current date is ${currentDate}. 
                Company Contact Information: ${JSON.stringify(mindSphereData.contact)}.
                Present the programme details in an easy-to-read format. Keep your responses at most 300 words. You should make an engaing description, here's a reference:
                "Hey FoodAIDers! 🫶🤗

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

                See you at Turning Flaws Into Fresh Finds #1!"`,
      },
      { role: "user", content: programmeDetails },
    ];
  
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });
  
    return response.choices[0].message.content.trim();
  };

  const escapeMarkdownV2 = (text) => {
    // Escape Telegram MarkdownV2 reserved characters
    return text
      .replace(/_/g, "\\_") // Escape underscores
      .replace(/\*/g, "\\*") // Escape asterisks
      .replace(/\[/g, "\\[") // Escape left square brackets
      .replace(/]/g, "\\]") // Escape right square brackets
      .replace(/\(/g, "\\(") // Escape left parentheses
      .replace(/\)/g, "\\)") // Escape right parentheses
      .replace(/~/g, "\\~") // Escape tildes
      .replace(/`/g, "\\`") // Escape backticks
      .replace(/>/g, "\\>") // Escape greater-than sign
      .replace(/#/g, "\\#") // Escape hash
      .replace(/\+/g, "\\+") // Escape plus
      .replace(/-/g, "\\-") // Escape minus
      .replace(/=/g, "\\=") // Escape equal
      .replace(/\|/g, "\\|") // Escape pipe
      .replace(/{/g, "\\{") // Escape left curly brace
      .replace(/}/g, "\\}") // Escape right curly brace
      .replace(/\./g, "\\.") // Escape dot
      .replace(/!/g, "\\!"); // Escape exclamation mark
  };
  
  const sendProgrammeToTelegram = async (programmeID) => {
    let tempFilePath;
    let optimizedFilePath;
  
    try {
      const programme = await Programme.getProgrammeDetailsByID(programmeID);
      if (!programme) throw new Error(`Programme not found for ID: ${programmeID}`);
  
      let formattedDetails = await fetchFormattedDetails(programme);
  
      // this will only work if its a public server.
      //const programmeLink = `http://localhost:3000/userProgrammeInfoPage.html?programmeId=${programmeID}`;
    // Add a link to the programme details page
    const programmeLink = `${website}/userProgrammeInfoPage.html?programmeId=${programmeID}`;
    const clickableLink = `[View More Details](${programmeLink})`;
    formattedDetails += `\n\n${clickableLink}`;

  
      let imagePath;
      
      if (programme.ProgrammePicture) {
          if (Buffer.isBuffer(programme.ProgrammePicture)) {
              console.log("🖼 Received a Buffer. Checking if it's a valid image...");
      
              let rawBuffer = programme.ProgrammePicture;
      
              // Convert buffer to a string for base64 detection
              const bufferString = programme.ProgrammePicture.toString("utf-8").trim();
      
              // Check if buffer is base64-encoded (valid Base64 strings have letters, numbers, "/", "+", and "=" padding)
              const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
              if (base64Regex.test(bufferString)) {
                  console.log("🔄 Base64 detected. Decoding to raw buffer...");
                  rawBuffer = Buffer.from(bufferString, "base64");
              }
      
              // Try detecting image type after base64 decoding
              const detectedType = await fileType.fromBuffer(rawBuffer);
      
              if (detectedType && ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(detectedType.mime)) {
                  console.log(`✅ Valid image detected (${detectedType.mime}). Processing as an image...`);
      
                  // Save image to a temporary directory
                  const tempDir = path.join(__dirname, "../../../temp");
                  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
      
                  tempFilePath = path.join(tempDir, `programme_${programmeID}_${Date.now()}.${detectedType.ext}`);
                  fs.writeFileSync(tempFilePath, rawBuffer); // Use the decoded rawBuffer
      
                  optimizedFilePath = await validateAndOptimizeImage(tempFilePath);
                  imagePath = optimizedFilePath;
              } else {
                  console.log("❌ No valid image detected. Checking if buffer is actually a stored file path...");
      
                  if (bufferString.includes("/") || bufferString.includes("\\")) {
                      console.log("🛠 Detected as a relative file path. Using local file...");
                      const relativePath = path.join(__dirname, "../../../", bufferString);
      
                      if (!fs.existsSync(relativePath)) {
                          throw new Error(`❌ Image file not found at: ${relativePath}`);
                      }
                      imagePath = relativePath;
                  } else {
                      throw new Error("❌ ProgrammePicture is neither an image nor a valid file path.");
                  }
              }
          } else {
              throw new Error("❌ ProgrammePicture is not a valid Buffer.");
          }
      } else {
          throw new Error("❌ ProgrammePicture is empty or undefined.");
      }
      
      // if (Buffer.isBuffer(programme.ProgrammePicture)) {
      //   const bufferString = programme.ProgrammePicture.toString("utf-8");
  
      //   if (bufferString.includes("/") || bufferString.includes("\\")) {
      //     console.log("Programme picture buffer contains a relative path. Using local file...");
      //     const relativePath = path.join(__dirname, "../../../", bufferString);
      //     if (!fs.existsSync(relativePath)) {
      //       throw new Error(`Image file not found at relative path: ${relativePath}`);
      //     }
      //     imagePath = relativePath;
      //   } else {
      //     console.log("Programme picture is binary data. Processing as image...");
      //     const detectedType = await fileType.fromBuffer(programme.ProgrammePicture);
  
      //     if (!detectedType || !["image/jpeg", "image/png", "image/webp"].includes(detectedType.mime)) {
      //       throw new Error(`Unsupported image format: ${detectedType ? detectedType.mime : "unknown"}`);
      //     }
  
      //     const tempDir = path.join(__dirname, "../../../temp");
      //     if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  
      //     tempFilePath = path.join(tempDir, `programme_${programmeID}_${Date.now()}.${detectedType.ext}`);
      //     fs.writeFileSync(tempFilePath, programme.ProgrammePicture);
  
      //     optimizedFilePath = await validateAndOptimizeImage(tempFilePath);
      //     imagePath = optimizedFilePath;
      //   }
      // } else if (typeof programme.ProgrammePicture === "string") {
      //   const relativePath = path.join(__dirname, "../../../", programme.ProgrammePicture);
      //   if (!fs.existsSync(relativePath)) {
      //     throw new Error(`Image file not found at relative path: ${relativePath}`);
      //   }
      //   imagePath = relativePath;
      // } else {
      //   throw new Error("Invalid ProgrammePicture format. Expected a Buffer or a relative path.");
      // }
  
      const imageResponse = await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
        {
          chat_id: process.env.CHANNEL_ID,
          photo: fs.createReadStream(imagePath),
        },
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      console.log("Image sent to Telegram successfully:", imageResponse.data);
  
      const textResponse = await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: process.env.CHANNEL_ID,
          text: formattedDetails,
          parse_mode: "markdown",
        }
      );
  
      console.log("Text sent to Telegram successfully:", textResponse.data);
    } catch (error) {
      console.error("Error sending programme to Telegram:", error);
      throw error;
    } finally {
      if (tempFilePath || optimizedFilePath) {
        cleanUpFiles([tempFilePath, optimizedFilePath]);
      }
    }
  };
  
  
// Expose as API endpoint
const sendProgramme = async (req, res) => {
  const { programmeID } = req.params;
  try {
    await sendProgrammeToTelegram(programmeID);
    res.status(200).json({ message: "Programme sent to Telegram successfully." });
  } catch (error) {
    console.error("Error in sendProgramme:", error);
    if (!res.headersSent) {
        res.status(500).json({ message: "Error sending programme to Telegram", error: error.message });
      }
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

// // Listen for the "/start" command
// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat.id;
//     const userName = msg.from.first_name || 'there';

//     // Send a welcome message
//     bot.sendMessage(chatId, `Hello, ${userName}! Welcome to our Telegram bot. How can I assist you today?`);
// });

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
// const spamCooldownSeconds = 5; // Cooldown period in seconds

bot.onText(/\/rules/, (msg) => {
  const chatId = msg.chat.id;

  const rulesMessage = `
📜 *Group Rules* 📜

1️⃣ **Be Respectful** – Treat everyone with kindness and respect. No hate speech, harassment, or personal attacks.
2️⃣ **No Spam** – Avoid flooding the chat with repeated messages, links, or promotions.
3️⃣ **Stay On Topic** – Keep discussions relevant to the group’s purpose.
4️⃣ **No NSFW Content** – Do not share explicit, violent, or inappropriate material.
5️⃣ **Use Common Sense** – Be considerate and follow general etiquette.

Bot Commands:
/start - Begin interaction and link your Telegram account
/confirm - Verify your membership in the Telegram group and channel
/chatbot [query] - Ask the mindSphere Assistant any question, e.g., /chatbot What programmes does mindSphere offer?
/rules - View the community guidelines and rules

🚨 Violations may result in warnings, mutes, or bans.

👮 *Admins have the final say on enforcing the rules.* 

Thank you for being a part of mindSphere community! 😊
`;

  bot.sendMessage(chatId, rulesMessage, { parse_mode: "Markdown" });
});


bot.onText(/\/chatbot/, async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text || ""; // Ensure it's always a string

  // Check if msg.text exists and starts with "/chatbot"
  if (!userMessage || !userMessage.startsWith('/chatbot ')) {
      return; // Ignore messages that do not start with "/chatbot"
  }

  const userPrompt = userMessage.replace('/chatbot ', '').trim(); // Extract actual user message

  try {
        // Add the database context (this could be optional if it's not needed for every conversation)
        const programData = await ChatDataModel.getStructuredProgramData();
        const paymentData = await ChatDataModel.getPaymentDetails();
        const getSlotUtilization = await ChatDataModel.getSlotUtilization();
        const tierData = await ChatDataModel.getTierCriteria();
        const storedPrompt = await ChatDataModel.getChatPrompt('ChatbotUser');

        // Include pre-prompt only for the first conversation
        // Get the current date in Singapore Time
        const currentDate = moment().tz('Asia/Singapore').format('MMMM D, YYYY');
        
        const prePrompt = `
            ${storedPrompt}
            You are mindSphere's assistant. You are helping the company mindSphere.sg.
            Provided Information: 
            Do take note of the current date : ${currentDate}.
            Company Overview: ${JSON.stringify(mindSphereData.companyOverview)}
            Contact Information: ${JSON.stringify(mindSphereData.contact)}
            FAQs: ${JSON.stringify(faqs)}
            Database Context (includes at least the tier membership criterias, programs, classes, batches, reviews and slot utilisations.): 
            **Program**: ${JSON.stringify(programData, (key, value) => {
                if (Array.isArray(value)) {
                    return value.map(item => JSON.stringify(item));
                }
                return value;
            }, 2)}
            **Payment**: ${JSON.stringify(paymentData, null, 2)}
            **Tier Criteria**: ${JSON.stringify(tierData, null, 2)}
            **Slot Utilization**: ${JSON.stringify(getSlotUtilization, null, 2)}
        `;
      // Create message sequence for OpenAI API
      const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: "Do not reveal any company-secrets, or database secrets that a typical public user like me can see, such as payments by other customers and their details." +
            "Enforce levels of control accordingly. Here's my prompt:" + userPrompt }
      ];

      // Call OpenAI API
      const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages,
      });

      const botReply = response.choices[0].message.content.trim();

      const formattedReply = markdownToTelegram(botReply);
      bot.sendMessage(chatId, formattedReply, { parse_mode: 'Markdown' });

  } catch (error) {
      console.error('Error processing Telegram bot request:', error);
      bot.sendMessage(chatId, 'An error occurred while processing your request.');
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

        console.log(`${userInfo.username || userInfo.first_name} has been restricted for ${durationMinutes} minutes.`);

        // Schedule automatic unrestriction
        setTimeout(async () => {
            await unrestrictUser(chatId, userId);
        }, durationMinutes * 60 * 1000);

        //private dm
        bot.sendMessage(chatId, `${userInfo.username || userInfo.first_name} has been restricted for ${durationMinutes} minutes.`);
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

        bot.sendMessage(chatId, `${userInfo.username || userInfo.first_name} is now unrestricted.`, { parse_mode: "Markdown" });
    } catch (error) {
        console.error("Failed to unrestrict user:", error);
    }
};

function markdownToTelegram(markdown) {
  return markdown
      .replace(/###### (.*?)\n/g, '*$1*')   // H6 -> Bold
      .replace(/##### (.*?)\n/g, '*$1*')   // H5 -> Bold
      .replace(/#### (.*?)\n/g, '*$1*')    // H4 -> Bold
      .replace(/### (.*?)\n/g, '*$1*')     // H3 -> Bold
      .replace(/## (.*?)\n/g, '*$1*')      // H2 -> Bold
      .replace(/# (.*?)\n/g, '*$1*')       // H1 -> Bold
      .replace(/\*\*(.*?)\*\*/g, '*$1*')   // Bold
      .replace(/\*(.*?)\*/g, '_$1_')       // Italics
      .replace(/`(.*?)`/g, '`$1`')         // Inline code
      .replace(/\[(.*?)\]\((.*?)\)/g, '[$1]($2)') // Links
      .replace(/^- (.*?)(\n|$)/gm, '• $1\n'); // Bullet points
}


// user session
// bot.on('message', async (msg) => {
//     const chatId = msg.chat.id;
//     const userMessage = msg.text;

//     // Check if the message starts with "/chatbot"
//     if (!userMessage.startsWith('/chatbot ')) {
//         return; // Ignore messages that do not start with "/chatbot"
//     }

//     const userPrompt = userMessage.replace('/chatbot ', '').trim(); // Extract actual user message

//     // Initialize session if not existing
//     if (!userSessions[chatId]) {
//         userSessions[chatId] = {
//             hasStarted: false,
//             chatHistory: []
//         };
//     }

//     let messages = [];
 
//     if (!userSessions[chatId].hasStarted) {
//         const chatData = await ChatDataModel.getStructuredProgramData();
//         const dataSummary = JSON.stringify(chatData, null, 2);
//         console.log('Database context:', dataSummary);

//         const currentDate = moment().tz('Asia/Singapore').format('MMMM D, YYYY');
//         console.log(currentDate);

//         const storedPrompt = ChatDataModel.getChatPrompt('ChatbotUser');
//         console.log(storedPrompt);

//         const prePrompt = `
//             ${storedPrompt}
//             Provided Information:
//             Current Date: ${currentDate}.
//             Company Overview: ${JSON.stringify(mindSphereData.companyOverview)}
//             Contact Information: ${JSON.stringify(mindSphereData.contact)}
//             FAQs: ${JSON.stringify(faqs)}
//             Database Context: ${dataSummary}
//         `;

//         messages.push({ role: 'system', content: prePrompt });
//         userSessions[chatId].hasStarted = true;
//     } else {
//         messages = userSessions[chatId].chatHistory;
//     }

//     messages.push({ role: 'user', content: userPrompt });

//     try {
//         const response = await openai.chat.completions.create({
//             model: 'gpt-4o-mini',
//             messages: messages,
//         });

//         console.log('OpenAI response:', response.choices);
//         const botReply = response.choices[0].message.content.trim();

//         // Save chat history
//         userSessions[chatId].chatHistory.push({ role: 'user', content: userPrompt });
//         userSessions[chatId].chatHistory.push({ role: 'assistant', content: botReply });

//         const MAX_HISTORY_LENGTH = 10;
//         if (userSessions[chatId].chatHistory.length > MAX_HISTORY_LENGTH) {
//             userSessions[chatId].chatHistory = userSessions[chatId].chatHistory.slice(-MAX_HISTORY_LENGTH);
//         }

//         bot.sendMessage(chatId, botReply);
//     } catch (error) {
//         console.error('Error processing Telegram bot request:', error);
//         bot.sendMessage(chatId, 'An error occurred while processing your request.');
//     }
// });

// Export the functions
module.exports = {
  getUserMessage,
  sendProgramme,
  bot,
  initBot,
  sendTelegramMessage
};
