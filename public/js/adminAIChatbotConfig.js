document.addEventListener("DOMContentLoaded", async () => { 
  const promptTypeSelect = document.getElementById("promptType");
  const promptTextArea = document.getElementById("promptText");
  const saveButton = document.getElementById("saveButton");
  const notification = document.getElementById("notification");

  // Fetch prompts from the server
  async function fetchPrompts() {
    try {
      const response = await fetch("/api/chatbot/prompts");
      const prompts = await response.json();
      
      prompts.forEach((prompt) => {
        const option = document.createElement("option");
        option.value = prompt.PromptType;
        option.textContent = prompt.PromptType;
        promptTypeSelect.appendChild(option);
        console.log("PromptType: ", prompt.PromptType);

        if (prompt.PromptType === promptTypeSelect.value) {
          promptTextArea.value = prompt.PromptText;
          console.log("PromptText: ", prompt.PromptText);
          saveButton.disabled = false;
        }
      });
    } catch (error) {
      console.error("Error fetching prompts:", error);
    }
  }

  // Load the selected prompt's text
  promptTypeSelect.addEventListener("change", async () => {
    const selectedType = promptTypeSelect.value;
    const response = await fetch("/api/chatbot/prompts");
    const prompts = await response.json();
    const selectedPrompt = prompts.find((p) => p.PromptType === selectedType);

    promptTextArea.value = selectedPrompt.PromptText;
    console.log("Selected PromptText: ", selectedPrompt.PromptText);
    saveButton.disabled = false;
  });

  // Show success notification
  function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove("hidden");
    notification.classList.add("visible");
    setTimeout(() => {
      notification.classList.remove("visible");
      notification.classList.add("hidden");
    }, 3000);
  }

  // Save prompt
  saveButton.addEventListener("click", async () => {
    const promptType = promptTypeSelect.value;
    const promptText = promptTextArea.value;

    await fetch("/api/chatbot/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptType, promptText }),
    });

    // Show success notification
    showNotification("Prompt saved successfully!");

    // Redirect to the homepage after a delay
    setTimeout(() => {
      window.location.href = "adminHomePage.html";
    }, 3000);
  });

  // Initialize
  await fetchPrompts();
});
