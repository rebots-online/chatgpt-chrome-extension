// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ASK_CHATGPT" || message.type === "SEND_TERMINAL") {
    let originalActiveElement;
    let text;

    // If there's an active text input
    if (
      document.activeElement &&
      (document.activeElement.isContentEditable ||
        document.activeElement.nodeName.toUpperCase() === "TEXTAREA" ||
        document.activeElement.nodeName.toUpperCase() === "INPUT")
    ) {
      // Set as original for later
      originalActiveElement = document.activeElement;
      // Use selected text or all text in the input
      text =
        document.getSelection().toString().trim() ||
        document.activeElement.textContent.trim();
    } else {
      // If no active text input use any selected text on page
      text = document.getSelection().toString().trim();
    }

    if (!text) {
      alert(
        "No text found. Select this option after right-clicking on a textarea that contains text or on a selected portion of text."
      );
      return;
    }

    showLoadingCursor();

    // Send the text to the appropriate handler
    if (message.type === "ASK_CHATGPT") {
      fetch("http://localhost:3000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      })
      .then(response => response.json())
      .then(data => {
        // Send a message to the background script to open or reuse the terminal
        chrome.runtime.sendMessage({
          type: "OPEN_TERMINAL",
          command: data.reply
        });

        restoreCursor();
      })
      .catch(error => {
        restoreCursor();
        alert("Error. Make sure you're running the server by following the instructions on https://github.com/gragland/chatgpt-chrome-extension. Also make sure you don't have an adblocker preventing requests.");
        throw new Error(error);
      });
    } else if (message.type === "SEND_TERMINAL") {
      // Send a message to the background script to open or reuse the terminal directly
      chrome.runtime.sendMessage({
        type: "OPEN_TERMINAL",
        command: text
      });

      restoreCursor();
    }
  }
});

const showLoadingCursor = () => {
  const style = document.createElement("style");
  style.id = "cursor_wait";
  style.innerHTML = `* {cursor: wait;}`;
  document.head.insertBefore(style, null);
};

const restoreCursor = () => {
  document.getElementById("cursor_wait").remove();
};
