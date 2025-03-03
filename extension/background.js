// Create context menu items
chrome.contextMenus.create({
  id: "ask-chatgpt",
  title: "Ask ChatGPT",
  contexts: ["all"],
});

chrome.contextMenus.create({
  id: "send-terminal",
  title: "Send Text to Terminal",
  contexts: ["all"],
});

// Listen for when the user clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ask-chatgpt") {
    // Send a message to the content script
    chrome.tabs.sendMessage(tab.id, { type: "ASK_CHATGPT" });
  } else if (info.menuItemId === "send-terminal") {
    // Send a message to the content script
    chrome.tabs.sendMessage(tab.id, { type: "SEND_TERMINAL" });
  }
});

// Function to open or reuse a terminal
let terminalWindowId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_TERMINAL") {
    if (terminalWindowId) {
      // Reuse the existing terminal
      chrome.windows.update(terminalWindowId, { focused: true });
    } else {
      // Open a new terminal
      chrome.windows.create({
        url: "chrome://terminal/?command=" + encodeURIComponent(message.command),
        type: "popup",
        width: 800,
        height: 600,
      }, (window) => {
        terminalWindowId = window.id;
      });
    }
  }
});
