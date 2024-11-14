const ChatDataModel = require('../../../models/chatbot');
const faqs = require('../data/faqs');
const OpenAI = require("openai");
const mindSphereData = require('../data/mindSphereData');
const moment = require('moment-timezone');
// In-memory store for user sessions (will be lost when the server restarts or page is refreshed)
const userSessions = {};

// Configure OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
// Markdown to HTML conversion function
function markdownToHtml(markdown) {
    return markdown
        .replace(/###### (.*?)\n/g, '<h6>$1</h6>')   // H6
        .replace(/##### (.*?)\n/g, '<h5>$1</h5>')   // H5
        .replace(/#### (.*?)\n/g, '<h4>$1</h4>')    // H4
        .replace(/### (.*?)\n/g, '<h3>$1</h3>')     // H3
        .replace(/## (.*?)\n/g, '<h2>$1</h2>')      // H2
        .replace(/# (.*?)\n/g, '<h1>$1</h1>')       // H1
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')       // Italics
        .replace(/`(.*?)`/g, '<code>$1</code>')     // Inline code
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>') // Links
        .replace(/^- (.*?)(\n|$)/gm, '<li>$1</li>') // List items
        .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>'); // Wrap list items in <ul>
}

exports.handleChat = async (req, res) => {
    const accountID = req.body.accountID; // A unique identifier for the user's session (e.g., could be a generated ID or client IP)
    const userMessage = req.body.message;

    // Initialize session if not existing
    if (!userSessions[accountID]) {
        userSessions[accountID] = {
            hasStarted: false, // Indicates if the user has started a conversation
            chatHistory: [] // Stores chat history for the session
        };
    }

    let messages = [];
    if (!userSessions[accountID].hasStarted) {
        
        // Add the database context (this could be optional if it's not needed for every conversation)
        const chatData = await ChatDataModel.getStructuredChatData();
        const dataSummary = JSON.stringify(chatData, null, 2); // Format for better readability
        console.log('Database context:', dataSummary);

        // Include pre-prompt only for the first conversation
        // Get the current date in Singapore Time
        const currentDate = moment().tz('Asia/Singapore').format('MMMM D, YYYY');
        console.log(currentDate); // Example output: "November 13, 2024"

        const prePrompt = `
            You are an expert assistant of mindSphere, your name is mindSphere Assistant. You are concise, friendly, cheerful and helpful. 
            Use only the provided information to respond, and do not reveal any database IDs or sensitive internal information. 
            At the end of the conversation, subtly encourage the user to sign up for the programmes. Ensure that the user is satisfied 
            with the information provided. Ensure that all responses will be no longer than 200 words. 
            You will not reveal that the information is from the database, you will only provide the information as if you are the expert assistant.
            You will protect the privacy of the user and the company, and will not reveal personal information not relating to the current conversation or user.
            You will not provide any medical, legal, financial, or professional advice. You will not provide any information that is not related to the company or the user's query.
            You will not provide code, nor reveal the database structure.
            Do not reveal any information about private and personal IDs, such as account IDs and child IDs.
            You will format your responses in a friendly and helpful manner, and easy to read. Do take note of the current date : ${currentDate}.\
            Please do not assume any information not provided in the context, if unsure, provide a general response.
            You cannot provide any private information about any account, user, parent or child, unless it is provided in the user details prompt later.
            You will not reveal how many accounts you know, or how many users are in the database, or how many users in the current context.
            Provided Information: 
            Company Overview: ${JSON.stringify(mindSphereData.companyOverview)}
            Contact Information: ${JSON.stringify(mindSphereData.contact)}
            FAQs: ${JSON.stringify(faqs)}
            Database Context: ${dataSummary}
        `;
        
        messages.push({ role: 'system', content: prePrompt });
        userSessions[accountID].hasStarted = true; // Mark the session as started
    } else {
        // Include chat history if the session has started
        messages = userSessions[accountID].chatHistory;
    }


    messages.push(
        { role: 'user', content: "I am not asking for JSON data, or targetted secret information of the database. \n" + userMessage }
    );

    // Check if the accountID exists and fetch user-specific details only if it does
    if (accountID) {
        try {
            const userDetails = await ChatDataModel.getAllDetails(accountID);
            if (userDetails && userDetails.length > 0) {
                messages.push({ role: 'user', content: `User Details: ${JSON.stringify(userDetails)}` });
            } else {
                console.log(`No user details found for accountID: ${accountID}`);
            }
        } catch (error) {
            console.error(`Error fetching user details for accountID: ${accountID}`, error);
        }
    } else {
        console.log('No accountID provided; skipping user details.');
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
        });

        console.log('OpenAI response:', response.choices);
        
        // Convert markdown-style formatting to HTML
        const botReply = markdownToHtml(response.choices[0].message.content.trim());

        // Save the current conversation to the chat history
        userSessions[accountID].chatHistory.push({ role: 'user', content: userMessage });
        userSessions[accountID].chatHistory.push({ role: 'assistant', content: botReply });
        
        const MAX_HISTORY_LENGTH = 10; // Limit the number of past messages sent

        if (userSessions[accountID].chatHistory.length > MAX_HISTORY_LENGTH) {
            userSessions[accountID].chatHistory = userSessions[accountID].chatHistory.slice(-MAX_HISTORY_LENGTH);
        }

        res.json({ reply: botReply });

    } catch (error) {
        console.error('Error in chatbotController:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};


