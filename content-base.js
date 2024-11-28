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

// Optional: Inject a copy button if needed
function injectCopyButton() {
  // Check if button already exists
  if (document.getElementById('timestamp-copy-btn')) return;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';

  const copyButton = document.createElement('button');
  copyButton.textContent = '📋 Copy Current Time URL';
  copyButton.id = 'timestamp-copy-btn';
  copyButton.style.cssText = `
    background-color: red;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    z-index: 9999;
  `;

  copyButton.addEventListener('click', () => {
    const timestampInfo = extractTimestampURL();
    navigator.clipboard.writeText(timestampInfo.url).then(() => {
      alert('Timestamp URL copied!');
    });
  });

  container.appendChild(copyButton);
  document.body.appendChild(container);
}

// Inject the copy button after a short delay
setTimeout(injectCopyButton, 2000);
