require("dotenv").config();
const OpenAI = require("openai");
const sql = require("mssql");
const fs = require("fs");
const path = require("path");
const dbConfig = require("../dbConfig");
const EventEmitter = require("events");
const { v4: uuidv4 } = require("uuid");

const openai = new OpenAI({
  apiKey: process.env.openAISecretKey,
});

class ChatbotEmitter extends EventEmitter {}
const chatbotEmitter = new ChatbotEmitter();

class Chatbot {
  async initializeChat(patientId) {
    const chatSessionId = uuidv4();
    const initialPrompt = `
    You are a helpful assistant for a programme-selling website. Respond in a friendly, helpful tone.
    Format your responses neatly, using regular \n for new lines. Limit responses to 100 words per reply.
    Respond with concise information that a layperson can understand. Always invite the user to ask further questions.
    Here are the programme details: ${programmeInfo}.    
      - Answers must be formatted neatly, adding regular \n after each new topic.
      - Ensure all responses do not exceed 100 words no matter what.
      - Do not reply to any prompts that are not related to health.
      - Your name is Health Buddy.
      - Give an answer that layman can understand.
      - Be concise, friendly, and cheerful.
      - Remind the user to visit a doctor at the end of each reply.
    `;

    await this.saveChatHistory(chatSessionId, patientId, "bot", initialPrompt);

    return chatSessionId;
  }

  async sendMessage(chatSessionId, patientId, message) {
    console.log(
      `Saving chat history for session: ${chatSessionId}, patient: ${patientId}, message: ${message}`
    );
    await this.saveChatHistory(chatSessionId, patientId, "user", message);

    console.log(`Retrieving chat history for session: ${chatSessionId}`);
    const chatHistory = await this.getChatHistory(chatSessionId);
    console.log(`Chat history: ${JSON.stringify(chatHistory)}`);

    // Filter out any entries with invalid message content (e.g., null or non-string values)
    const messages = chatHistory
      .filter(
        (entry) =>
          entry.message &&
          typeof entry.message === "string" &&
          entry.message.trim() !== ""
      )
      .map((entry) => ({
        role: entry.sender === "user" ? "user" : "system",
        content: entry.message,
      }));
    console.log(`Filtered messages: ${JSON.stringify(messages)}`);

    // Include the current message in the request to OpenAI
    messages.push({
      role: "user",
      content: message,
    });

    // Make the API call to OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });
      console.log(`OpenAI response: ${JSON.stringify(completion)}`);

      // Extract and save the bot's response
      const botMessage = completion.choices[0].message.content.trim();
      console.log(`Bot message: ${botMessage}`);

      console.log(
        `Saving bot response to chat history for session: ${chatSessionId}, patient: ${patientId}`
      );
      await this.saveChatHistory(chatSessionId, patientId, "bot", botMessage);

      return botMessage;
    } catch (error) {
      console.error(`Error calling OpenAI API: ${error.message}`);
      throw new Error("Failed to get response from OpenAI");
    }
  }

  async saveChatHistory(chatSessionId, patientId, sender, message) {
    const connection = await sql.connect(dbConfig);
    const sqlQuery = `
      INSERT INTO ChatHistory (ChatSessionID, PatientID, Sender, Message, Timestamp)
      VALUES (@ChatSessionID, @PatientID, @Sender, @Message, GETDATE())
    `;
    const request = connection.request();
    request.input("ChatSessionID", chatSessionId);
    request.input("PatientID", patientId);
    request.input("Sender", sender);
    request.input("Message", message);
    await request.query(sqlQuery);
    connection.close();
  }

  async getChatHistory(chatSessionId) {
    const connection = await sql.connect(dbConfig);
    const sqlQuery = `
      SELECT Sender, Message
      FROM ChatHistory
      WHERE ChatSessionID = @ChatSessionID
      ORDER BY Timestamp ASC
    `;
    const request = connection.request();
    request.input("ChatSessionID", chatSessionId);
    const result = await request.query(sqlQuery);
    connection.close();
    return result.recordset;
  }

  async saveRecognitionHistory(promptID, patientID, medicineName, mainPurpose, sideEffects, recommendedDosage, otherRemarks) {
    const connection = await sql.connect(dbConfig);
    const sqlQuery = `
      INSERT INTO MedicineRecognitionHistory (PromptID, PatientID, MedicineName, MainPurpose, SideEffects, RecommendedDosage, OtherRemarks, Timestamp)
      VALUES (@PromptID, @PatientID, @MedicineName, @MainPurpose, @SideEffects, @RecommendedDosage, @OtherRemarks, GETDATE())
    `;
    const request = connection.request();
    request.input("PromptID", promptID);
    request.input("PatientID", patientID);
    request.input("MedicineName", sql.NVarChar, medicineName);
    request.input("MainPurpose", sql.NVarChar, mainPurpose);
    request.input("SideEffects", sql.NVarChar, sideEffects);
    request.input("RecommendedDosage", sql.NVarChar, recommendedDosage);
    request.input("OtherRemarks", sql.NVarChar, otherRemarks);
    await request.query(sqlQuery);
    connection.close();
  }

  async analyzeText(patientID, text) {
    try {
      const promptID = uuidv4();
      const prompt = `
        You are a medicine expert.
        This is a medicine package or label recognition task. 

        Analyze the image or text from the image and generate the following details if it is a medicine package or label:
        - If information is not given on the image or label, generate it from your own knowledge.
        - Do not mention that information is not found on the package.
        - Ensure the response follows the format strictly with each key-value pair on a new line.
        - You must generate a response for each column given below.
        - If the text does not contain information about a medicine package or label, respond with:
        "Image uploaded does not seem to contain a medicine package or label. Please try again"

        Response format:
        Medicine Name: <value>
        Main Purpose: <value>
        Side Effects: <value>
        Recommended Dosage: <value>
        Other Remarks: <value>

        For recommended dosage: mention amount(pills/mg) per day

        For other remarks, mention
        -when is the best time to eat (example: after meal)
        -who should not eat this medicine if they have certain condition.

        Always start with "The image is a medicine product called [MEDICINE NAME]."
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text }
        ],
      });

      const botMessage = response.choices[0].message.content.trim();
      if (botMessage.startsWith("Image uploaded does not seem to contain a medicine package or label.")) {
        return botMessage;
      }

      const lines = botMessage.split('\n');
      const details = {
        MedicineName: "",
        MainPurpose: "",
        SideEffects: "",
        RecommendedDosage: "",
        OtherRemarks: ""
      };

      lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        switch (key.trim()) {
          case 'Medicine Name':
            details.MedicineName = value;
            break;
          case 'Main Purpose':
            details.MainPurpose = value;
            break;
          case 'Side Effects':
            details.SideEffects = value;
            break;
          case 'Recommended Dosage':
            details.RecommendedDosage = value;
            break;
          case 'Other Remarks':
            details.OtherRemarks = value;
            break;
        }
      });

      await this.saveRecognitionHistory(
        promptID,
        patientID,
        details.MedicineName,
        details.MainPurpose,
        details.SideEffects,
        details.RecommendedDosage,
        details.OtherRemarks
      );

      return botMessage;
    } catch (error) {
      console.error(`Error analyzing text with OpenAI: ${error.message}`);
      throw new Error("Failed to analyze text with OpenAI");
    }
  }

  
}
module.exports = { Chatbot, chatbotEmitter };
