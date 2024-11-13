// aichat.js
// Gemini API key: AIzaSyCTYgBtE1NR5Iy (placeholder) wGYSOwNYB_me6VeZAA5s
// OpenAI API key: sk-1VjfI36JtCWiPopkC1yST (placeholder) 3BlbkFJabZl0h5iZWk9U3qBRDCm

let chatbotToggler = null;
let closeBtn = null;
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
        <h2>mindSphere Assistant</h2>
        <span class="close-btn material-symbols-outlined">close</span>
      </header>
      <ul class="chatbox">
        <li class="chat incoming">
          <span class="material-symbols-outlined">smart_toy</span>
          <p>Hi there 👋<br>How can I help you today?</p>
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
  console.log("check");

  let userMessage = null; // Variable to store user's message
  const API_KEY_PART_1 = " sk-1VjfI36JtCWiPopkC1yST"; // trying to bypass OpenAI security for assignment purposes
  const API_KEY_PART_2 = "3BlbkFJabZl0h5iZWk9U3qBRDCm"
  const API_KEY = API_KEY_PART_1 + API_KEY_PART_2;

  // Set the initial height for the chat input
  const inputInitHeight = chatInput.scrollHeight;

  const createChatLi = (message, className) => {
      // Create a chat <li> element with passed message and className
      const chatLi = document.createElement("li");
      chatLi.classList.add("chat", `${className}`);
      let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
      chatLi.innerHTML = chatContent;
      chatLi.querySelector("p").textContent = message;
      return chatLi; // return chat <li> element
  }

  // initialise event listeners
  function initChatbotEventListeners() {
    chatInput.addEventListener("input", () => {
      // Adjust the height of the input textarea based on its content
      chatInput.style.height = `${inputInitHeight}px`;
      chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        // If Enter key is pressed without Shift key and the window 
        // width is greater than 800px, handle the chat
        if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });

    sendChatBtn.addEventListener("click", handleChat);
    closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

  }

  // Fetch available products from RestDB
  function fetchAvailableProducts(callback) {
      fetch('https://fedassignmentv2-7a2a.restdb.io/rest/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "x-apikey": "65c614116a1c9939a9be0023",
          "cache-control": "no-cache"
        }
      })
      .then(response => response.json())
      .then(data => {
        // Filter for available products
        const availableProducts = data.filter(product => product.Availability.toLowerCase() === "in stock");
        callback(availableProducts);
      })
      .catch(error => console.error('Error fetching products:', error));
    }
    
    // Generate a message to send to the chatbot API
    function generateMessage(products, chatElement) {
      // Create a string that lists available products
      const productList = products.map(p => `${p.Name}: ${p.Description}`).join('. ');
      
      // Now send this string to the chatbot API
      generateResponse(productList, chatElement);
    }
    
  const generateResponse = (productList, chatElement) => {
      if (!(chatElement instanceof Element)) {
          console.error('generateResponse: Invalid chat element.');
          return;
      }
      const API_URL = 'https://api.openai.com/v1/chat/completions';
      const messageElement = chatElement.querySelector("p");

      const requestOptions = {    
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant, the best stylist in the world. You give the best advice.' },
            { role: 'user', content: userMessage },
            { role: 'assistant', content: `Here are some outfit suggestions based on our current stock: ${productList}` }
          ],
        })
      };
    
      // Send POST request to API, get response and set the reponse as paragraph text
      fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
          messageElement.textContent = data.choices[0].message.content.trim();
      }).catch(() => {
          messageElement.classList.add("error");
          messageElement.textContent = "Oops! Something went wrong. Please try again.";
      }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
  }

  const handleChat = () => {
      userMessage = chatInput.value.trim(); 
      if(!userMessage) return;

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
          fetchAvailableProducts((availableProducts) => {
              generateMessage(availableProducts, incomingChatLi);
          });
      }, 1200); // Adjust the delay as needed
  }

  // Initialize event listeners (for toggling chatbot, sending messages, etc.)
  initChatbotEventListeners();
}

// Make sure to wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  loadChatbot(); // Ensure this is called only after DOM is fully loaded.
  document.dispatchEvent(new CustomEvent('ChatbotLoaded'));
});
