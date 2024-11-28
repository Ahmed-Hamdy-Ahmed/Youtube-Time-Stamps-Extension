// Ensure communication with background script
console.log('Content script loaded');

function extractTimestampURL() {
  const videoTitle = document.title;
  const baseURL = window.location.href.split('&t=')[0];
  const player = document.querySelector('video');
  
  if (player) {
    const currentTime = Math.floor(player.currentTime);
    const timestampURL = `${baseURL}&t=${currentTime}s`;
    return { title: videoTitle, url: timestampURL };
  }
  
  return { title: videoTitle, url: window.location.href };
}

// Inject copy and save button
function injectCopyAndSaveButton() {
  // Check if button already exists
  if (document.getElementById('timestamp-copy-save-btn')) return;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';

  const copyAndSaveButton = document.createElement('button');
  copyAndSaveButton.textContent = '📋 Copy & Save Timestamp';
  copyAndSaveButton.id = 'timestamp-copy-save-btn';
  copyAndSaveButton.style.cssText = `
    background-color: red;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    z-index: 9999;
  `;

  copyAndSaveButton.addEventListener('click', () => {
    const timestampInfo = extractTimestampURL();
    
    // Copy URL to clipboard
    navigator.clipboard.writeText(timestampInfo.url).then(() => {
      // Send message to save timestamp
      chrome.runtime.sendMessage({
        action: "saveTimestamp",
        title: timestampInfo.title,
        url: timestampInfo.url
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error saving timestamp:', chrome.runtime.lastError);
          alert('Failed to save timestamp');
        } else {
          alert('Timestamp URL copied and saved!');
        }
      });
    }).catch(err => {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL');
    });
  });

  container.appendChild(copyAndSaveButton);
  document.body.appendChild(container);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  
  if (request.action === "getTimestamp") {
    const timestampInfo = extractTimestampURL();
    
    // Send message back to background script
    chrome.runtime.sendMessage({
      action: "saveTimestamp",
      title: timestampInfo.title,
      url: timestampInfo.url
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
      }
    });
  }
  
  // Allow the message listener to stay active
  return true;
});

// Inject the copy and save button after a short delay
setTimeout(injectCopyAndSaveButton, 2000);
