// Create and inject Google Translate script
function loadGoogleTranslate() {
  // Create the main translate element
  const translateDiv = document.createElement("div");
  translateDiv.id = "google_translate_element";
  document.body.insertBefore(translateDiv, document.body.firstChild);

  // Create the initialization script
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "en,ta,ms,zh-CN",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      },
      "google_translate_element"
    );
  };

  // Create and inject the Google Translate script
  const script = document.createElement("script");
  script.src =
    "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

// Function to hide Google Translate top bar
function hideTranslateTopBar() {
  const frame = document.querySelector(".goog-te-banner-frame");
  if (frame) {
    frame.style.visibility = "hidden";
    frame.style.display = "none";
    document.body.style.top = "0px";
  }
}

// Handle translation and cleanup
function handleTranslation() {
  const observer = new MutationObserver(() => {
    // Hide top bar
    hideTranslateTopBar();

    const select = document.querySelector(".goog-te-combo");
    if (select && !select.hasListener) {
      select.hasListener = true;

      // Add change event listener
      select.addEventListener("change", function (event) {
        const lang = event.target.value;
        if (lang) {
          localStorage.setItem("selectedLanguage", lang);
          // Hide top bar after language change
          setTimeout(hideTranslateTopBar, 100);
        }
      });

      // Set initial language if saved
      const savedLang = localStorage.getItem("selectedLanguage");
      if (savedLang && savedLang !== "en") {
        select.value = savedLang;
        select.dispatchEvent(new Event("change"));
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  loadGoogleTranslate();
  handleTranslation();
  // Additional check for top bar
  setInterval(hideTranslateTopBar, 100);
});

// Also hide top bar when window loads
window.addEventListener("load", hideTranslateTopBar);
