// aichat.js

let chatbotToggler = null;
let closeBtn = null;

// Retrieve and parse the user details from localStorage
const userDetailsString = localStorage.getItem('userDetails');
console.log("UserDetails :" + userDetailsString);
let accountId = null;
if (userDetailsString) {
    const userDetails = JSON.parse(userDetailsString); // Parse the JSON string into an object
    accountId = userDetails['accountId'] ? userDetails['accountId'] : null;
}

console.log("AccountID :" + accountId);

function loadChatbot() {
  // Create chatbot elements
  const chatbotDiv = document.createElement('div');
  chatbotDiv.id = 'chatbot';
  chatbotDiv.innerHTML = `
    <button class="chatbot-toggler">
      <span class="material-symbols-rounded">mode_comment</span>
      <span class="material-symbols-outlined">close</span>
    </button>
    <div class="chatbot">
      <header>
        <h2>InsightSphere</h2>
        <span class="close-btn material-symbols-outlined">close</span>
      </header>
      <ul class="chatbox">
        <li class="chat incoming">
          <span class="material-symbols-outlined">smart_toy</span>
          <p>Hi there 👋<br>How can I help you today? I provide insightful guidance on business ideas and more, feel free to ask!</p>
        </li>
      </ul>
      <div class="chat-input">
        <textarea placeholder="Enter a message..." spellcheck="false" required></textarea>
        <span id="send-btn" class="material-symbols-rounded">send</span>
      </div>
    </div>
  `;

  // Append the chatbot to the body
  document.body.appendChild(chatbotDiv);

  chatbotToggler = document.querySelector(".chatbot-toggler");
  closeBtn = document.querySelector(".close-btn");
  const chatbox = document.querySelector(".chatbox");
  const chatInput = document.querySelector(".chat-input textarea");
  const sendChatBtn = document.querySelector(".chat-input span");

  let userMessage = null; // Variable to store user's message

  // Set the initial height for the chat input
  const inputInitHeight = chatInput.scrollHeight;

  const createChatLi = (message, className) => {
    // Create a chat <li> element with the passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent; 

    // Use innerHTML to parse HTML tags in the response message
    chatLi.querySelector("p").innerHTML = message;

    return chatLi; // Return the chat <li> element
}

  // const createChatLi = (message, className) => {
  //   // Create a chat <li> element with passed message and className
  //   const chatLi = document.createElement("li");
  //   chatLi.classList.add("chat", `${className}`);
  //   let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  //   chatLi.innerHTML = chatContent;
  //   chatLi.querySelector("p").textContent = message;
  //   return chatLi; // return chat <li> element
  // }

  // Function to send a message to the backend and get a response
  const sendMessageToBackend = (message, callback) => {
    fetch('/api/chatbot/message/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountID: accountId, // Replace with actual account ID if available
        message: message
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.reply) {
        callback(data.reply);
      } else {
        callback("Sorry, I couldn't process your request at the moment.");
      }
    })
    .catch(error => {
      console.error('Error:', error);
      callback("An error occurred. Please try again later.");
    });
  }

  const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Simulate a delay before showing the chatbot's response
    setTimeout(() => {
      // Display "Thinking..." message while waiting for the response
      const incomingChatLi = createChatLi("Thinking...", "incoming");
      chatbox.appendChild(incomingChatLi);
      chatbox.scrollTo(0, chatbox.scrollHeight);

      // Send the user's message to the backend and get a response
      sendMessageToBackend(userMessage, (reply) => {
        incomingChatLi.querySelector("p").innerHTML = reply;
        chatbox.scrollTo(0, chatbox.scrollHeight);
      });
    }, 500); // Adjust the delay as needed
  }

  // Initialize event listeners
  function initChatbotEventListeners() {
    chatInput.addEventListener("input", () => {
      // Adjust the height of the input textarea based on its content
      chatInput.style.height = `${inputInitHeight}px`;
      chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
      // If Enter key is pressed without Shift key, handle the chat
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
      }
    });

    sendChatBtn.addEventListener("click", handleChat);
    closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
  }

  // Initialize event listeners (for toggling chatbot, sending messages, etc.)
  initChatbotEventListeners();
}

// Make sure to wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  loadChatbot(); // Ensure this is called only after DOM is fully loaded.
  document.dispatchEvent(new CustomEvent('ChatbotLoaded'));
});
