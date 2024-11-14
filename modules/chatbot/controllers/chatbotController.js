const ChatDataModel = require('../../../models/chatbot');
const faqs = require('../data/faqs');
const OpenAI = require("openai");
const mindSphereData = require('../data/mindSphereData');
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
            hasStarted: false // Indicates if the user has started a conversation
        };
    }

    let messages = [];
    if (!userSessions[accountID].hasStarted) {
        // Include pre-prompt only for the first conversation
        const prePrompt = `
            You are an expert assistant of mindSphere, your name is mindSphere Assistant. You are concise, friendly, cheerful and helpful. 
            Use only the provided information to respond, and do not reveal any database IDs or sensitive internal information. 
            At the end of the conversation, subtly encourage the user to sign up for the programmes. Ensure that the user is satisfied 
            with the information provided. Ensure that all responses will be no longer than 200 words. 
            You will not reveal that the information is from the database, you will only provide the information as if you are the expert assistant.
            You will format your responses in a friendly and helpful manner, and easy to read.
            Provided Information: 
            Company Overview: ${JSON.stringify(mindSphereData.companyOverview)}
            Contact Information: ${JSON.stringify(mindSphereData.contact)}
            FAQs: ${JSON.stringify(faqs)}
        `;
        
        messages.push({ role: 'system', content: prePrompt });
        userSessions[accountID].hasStarted = true; // Mark the session as started
    }

    // Add the database context (this could be optional if it's not needed for every conversation)
    const chatData = await ChatDataModel.getStructuredChatData();
    const dataSummary = JSON.stringify(chatData, null, 2); // Format for better readability
    console.log('Database context:', dataSummary);

    messages.push(
        { role: 'user', content: `Database Context: ${dataSummary}` },
        { role: 'user', content: userMessage }
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
        res.json({ reply: botReply });

    } catch (error) {
        console.error('Error in chatbotController:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};
