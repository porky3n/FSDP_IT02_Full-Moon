const axios = require('axios');
const ProgrammeModel = require('../models/programmeModel');

class ChatController {
  static async sendMessageToChatbot(req, res) {
    const { sessionId, message } = req.body;
    const initialMessageFlag = req.body.initialMessage; // A flag to indicate if it's the first message

    try {
      let messages = [];

      // Add a pre-prompt with programme information and response formatting for the initial message
      if (initialMessageFlag) {
        const programmes = await ProgrammeModel.getProgrammes();
        const programmeDetails = programmes.map(p => `${p.ProgrammeName}: ${p.Description}`).join('. ');

        const prePrompt = `
          You are a customer service assistant for a programme-selling website. Respond in a friendly, helpful tone.
          Format your responses neatly and use regular \n for new lines. Limit responses to 100 words per reply.
          Respond with concise information that a layperson can understand. Always end responses with an invitation
          for further questions. Here are the details of our programmes: ${programmeDetails}
        `;

        messages.push({ role: 'system', content: prePrompt });
      }

      // Add the user's current message
      messages.push({ role: 'user', content: message });

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: messages,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      const botReply = response.data.choices[0].message.content.trim();
      res.status(200).json({ response: botReply });
    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
      res.status(500).json({ error: 'Failed to get response from chatbot' });
    }
  }
}

module.exports = ChatController;
