const Programme = require("../../../models/programme");
const axios = require("axios");
const FormData = require("form-data");
const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const fileType = require("file-type");
require("dotenv").config();
const mindSphereData = require("../../chatbot/data/mindSphereData");

// OpenAI API setup
const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_API_KEY}`,
});

// Telegram bot instance
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

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
  
    // Format the details with Markdown-friendly styling
    const programmeDetails = `
  🔍 *${programme.ProgrammeName}*
  
  💡 *Category*: ${programme.Category}
  📍 *Location*: ${programme.Location || "To be confirmed"}
  ⏳ *Duration*: ${programme.Duration || "Not specified"}
  📅 *Date*: ${new Date(programme.EarliestStartDateTime).toLocaleString()} to ${new Date(
      programme.LatestEndDateTime
    ).toLocaleString()}
  💵 *Fee*: ${programme.Fee ? `$${parseFloat(programme.Fee).toFixed(2)}` : "Free"}
  🎯 *Level*: ${programme.ProgrammeLevel || "All levels"}
  
  📖 *Description*: ${programme.Description}
  
  ⚠️ *Remarks*: ${programme.Remarks || "None"}
  🎟 *Slots Available*: ${programme.SlotsLeft || "Not specified"}
  
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
                Do not reveal any private or personal information, and ensure that user privacy is protected. The current date is ${currentDate}. 
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
      const programmeLink = `https://mindsphere.sg/`
      const clickableLink = `[mindSphere](${programmeLink})`;
      formattedDetails += `\nClick here to view details on ${clickableLink}.`;
  
      let imagePath;
  
      if (Buffer.isBuffer(programme.ProgrammePicture)) {
        const bufferString = programme.ProgrammePicture.toString("utf-8");
  
        if (bufferString.includes("/") || bufferString.includes("\\")) {
          console.log("Programme picture buffer contains a relative path. Using local file...");
          const relativePath = path.join(__dirname, "../../../", bufferString);
          if (!fs.existsSync(relativePath)) {
            throw new Error(`Image file not found at relative path: ${relativePath}`);
          }
          imagePath = relativePath;
        } else {
          console.log("Programme picture is binary data. Processing as image...");
          const detectedType = await fileType.fromBuffer(programme.ProgrammePicture);
  
          if (!detectedType || !["image/jpeg", "image/png", "image/webp"].includes(detectedType.mime)) {
            throw new Error(`Unsupported image format: ${detectedType ? detectedType.mime : "unknown"}`);
          }
  
          const tempDir = path.join(__dirname, "../../../temp");
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  
          tempFilePath = path.join(tempDir, `programme_${programmeID}_${Date.now()}.${detectedType.ext}`);
          fs.writeFileSync(tempFilePath, programme.ProgrammePicture);
  
          optimizedFilePath = await validateAndOptimizeImage(tempFilePath);
          imagePath = optimizedFilePath;
        }
      } else if (typeof programme.ProgrammePicture === "string") {
        const relativePath = path.join(__dirname, "../../../", programme.ProgrammePicture);
        if (!fs.existsSync(relativePath)) {
          throw new Error(`Image file not found at relative path: ${relativePath}`);
        }
        imagePath = relativePath;
      } else {
        throw new Error("Invalid ProgrammePicture format. Expected a Buffer or a relative path.");
      }
  
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
    res.status(500).json({ message: "Error sending programme to Telegram", error: error.message });
  }
};

module.exports = {
  sendProgramme,
};
