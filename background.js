console.log('Background script loaded');

// Ensure the extension works across different contexts
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveYouTubeTimestamp",
    title: "Save YouTube Timestamp",
    contexts: ["page"],
    documentUrlPatterns: ["*://www.youtube.com/*"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.pageUrl.includes('youtube.com')) {
    chrome.tabs.sendMessage(tab.id, {action: "getTimestamp"});
  }
});

// Listener for saving timestamps
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background script:', request);
  
  if (request.action === "saveTimestamp") {
    chrome.storage.local.get(['timestamps'], function(result) {
      const timestamps = result.timestamps || [];
      
      // Check for duplicates before adding
      const exists = timestamps.some(ts => ts.url === request.url);
      if (!exists) {
        timestamps.push({
          title: request.title,
          url: request.url
        });
        
        chrome.storage.local.set({timestamps: timestamps}, () => {
          console.log('Timestamp saved');
          sendResponse({status: 'success'});
        });
      }
    });
    
    // Return true to indicate we wish to send a response asynchronously
    return true;
  }
});
