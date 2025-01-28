const ChatDataModel = require('../../../models/chatbot');
const faqs = require('../data/faqs');
const OpenAI = require("openai");
const mindSphereData = require('../data/mindSphereData');
const moment = require('moment-timezone');
// In-memory store for user sessions (will be lost when the server restarts or page is refreshed)
const userSessions = {};

const OPENAI_API_KEY_part1="sk-proj-qe1XH7QWJmcsAPhkBvY3RNQatBGwazsROnKaL7Z9xdm50g2kc7zx1uKn7fkdrd";
const OPENAI_API_KEY_part2="acrEBMeXcQ_-T3BlbkFJHiS1DaIKCY0QQkBCalzpbVl9EmtwthlQZAJhFnNydIWezzI652zZrlF21NwlbCRzMs2mqyTWoA";
const OPENAI_API_KEY = OPENAI_API_KEY_part1 + OPENAI_API_KEY_part2;

// Configure OpenAI API
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY, // unable to use .env OEPNAI_API_KEY as database would crash
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

exports.handleAdminChat = async (req, res) => {
    const accountID = req.body.accountId; // A unique identifier for the user's session
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
        const chatData = await ChatDataModel.getAllData();

        const programSummary = JSON.stringify(chatData.programs, null, 2); // Format for better readabilitys
        const accountSummary = JSON.stringify(chatData.accounts, null, 2); // Format for better readability
        const businessEnquiriesSummary = JSON.stringify(chatData.businessEnquiries, null, 2); // Format for better readability

        console.log('Programs:', programSummary);
        console.log('Accounts:', accountSummary);
        console.log('Business Enquiries:', businessEnquiriesSummary);

        // Include pre-prompt only for the first conversation
        // Get the current date in Singapore Time
        const currentDate = moment().tz('Asia/Singapore').format('MMMM D, YYYY');
        console.log(currentDate); // Example output: "November 13, 2024"


        const storedPrompt = await ChatDataModel.getChatPrompt('ChatbotAdmin');

        console.log(storedPrompt);
        
        const prePrompt = `
            ${storedPrompt}
            **Provided Information of the user's company:**: 
            Do take note of the current date : ${currentDate}.
            Company Overview: ${JSON.stringify(mindSphereData.companyOverview)}
            Contact Information: ${JSON.stringify(mindSphereData.contact)}
            FAQs: ${JSON.stringify(faqs)}
            Database Context: 
            **Programs**: ${programSummary}
            **Accounts**: ${accountSummary}
            **Business Enquiries**: ${businessEnquiriesSummary}

        `;
        
        console.log(prePrompt);
        
        messages.push({ role: 'system', content: prePrompt });
        userSessions[accountID].hasStarted = true; // Mark the session as started
    } else {
        // Include chat history if the session has started
        messages = userSessions[accountID].chatHistory;
    }


    messages.push(
        { role: 'user', content: "I am not asking for JSON data, or targetted secret information of the database. \n" + userMessage }
    );

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

        res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error('Error in chatbotController:', error);
        res.status(500).json({ error: 'An error occurred while processing admin\'s request.' });
    }
};

exports.handleUserChat = async (req, res) => {
    const accountID = req.body.accountId; // A unique identifier for the user's session (e.g., could be a generated ID or client IP)
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
        const chatData = await ChatDataModel.getStructuredProgramData();
        const dataSummary = JSON.stringify(chatData, null, 2); // Format for better readability
        console.log('Database context:', dataSummary);

        // Include pre-prompt only for the first conversation
        // Get the current date in Singapore Time
        const currentDate = moment().tz('Asia/Singapore').format('MMMM D, YYYY');
        console.log(currentDate); // Example output: "November 13, 2024"


        const storedPrompt = ChatDataModel.getChatPrompt('ChatbotUser');

        console.log(storedPrompt);
        
        const prePrompt = `
            ${storedPrompt}
            Provided Information: 
            Do take note of the current date : ${currentDate}.
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
            const userDetails = await ChatDataModel.getAnAccountDetails(accountID);
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

        res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error('Error in chatbotController:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};

// Fetch all prompts for rendering the page
exports.getPrompts = async (req, res) => {
    try {
      const prompts = await ChatDataModel.getAllPrompts();
      res.status(200).json(prompts); // Send data as JSON to the frontend
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).send("Server Error");
    }
  };
  
// Update a specific chatbot prompt
exports.updatePrompt = async (req, res) => {
const { promptType, promptText } = req.body;

try {
    console.log(`Updating prompt for ${promptType}...`);
    const result = await ChatDataModel.updatePrompt(promptType, promptText);
    res.status(200).json({ success: true, message: "Prompt updated successfully" });
} catch (error) {
    console.error("Error updating prompt:", error);
    res.status(500).send("Server Error");
}
};