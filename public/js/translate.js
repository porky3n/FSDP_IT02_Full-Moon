function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: "en",
      includedLanguages: "en,ta,ms,zh-CN",
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false,
    },
    "google_translate_element"
  );
}

function cleanupTranslateElements() {
  // Remove the top bar iframe
  const bannerFrame = document.querySelector(".goog-te-banner-frame");
  if (bannerFrame) {
    bannerFrame.remove();
  }

  // Remove all translation-related iframes
  const iframes = document.getElementsByTagName("iframe");
  Array.from(iframes).forEach((iframe) => {
    if (
      iframe.className === "skiptranslate" ||
      iframe.id?.includes("google_translate_element")
    ) {
      iframe.remove();
    }
  });

  // Reset body positioning
  document.body.style.top = "0px";
  document.body.style.position = "static";

  // Ensure no scroll position shifts
  window.scrollTo(0, window.scrollY);
}

function initTranslation() {
  if (!document.getElementById("google_translate_element")) {
    const translateDiv = document.createElement("div");
    translateDiv.id = "google_translate_element";
    document.body.insertBefore(translateDiv, document.body.firstChild);
  }

  const script = document.createElement("script");
  script.src =
    "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  script.onerror = function () {
    console.error("Google Translate script failed to load.");
  };
  document.body.appendChild(script);

  const observer = new MutationObserver(() => {
    cleanupTranslateElements();

    const select = document.querySelector(".goog-te-combo");
    if (select && !select.hasListener) {
      select.hasListener = true;
      select.addEventListener("change", function () {
        localStorage.setItem("selectedLanguage", select.value);
        setTimeout(cleanupTranslateElements, 100);
      });

      const savedLang = localStorage.getItem("selectedLanguage");
      if (savedLang && savedLang !== "en") {
        select.value = savedLang;
        select.dispatchEvent(new Event("change"));
      } else {
        select.value = "en";
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

window.addEventListener("load", initTranslation);
