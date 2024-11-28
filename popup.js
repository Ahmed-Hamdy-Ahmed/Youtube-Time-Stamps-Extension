document.addEventListener('DOMContentLoaded', function() {
  const savedTimestampsDiv = document.getElementById('savedTimestamps');
  const exportMDButton = document.getElementById('exportMD');
  const clearTimestampsButton = document.getElementById('clearTimestamps');

  // Load saved timestamps
  function loadTimestamps() {
    chrome.storage.local.get(['timestamps'], function(result) {
      const timestamps = result.timestamps || [];
      renderTimestamps(timestamps);
    });
  }

  // Render timestamps
  function renderTimestamps(timestamps) {
    savedTimestampsDiv.innerHTML = '';
    if (timestamps.length === 0) {
      savedTimestampsDiv.innerHTML = '<p style="text-align:center;color:#888;">No timestamps saved</p>';
      return;
    }

    timestamps.forEach((ts, index) => {
      const timestampItem = document.createElement('div');
      timestampItem.className = 'timestamp-item';
      timestampItem.innerHTML = `
        <span title="${ts.title}">${ts.title}</span>
        <div>
          <button class="action-btn copy-btn" data-url="${ts.url}">Copy URL</button>
          <button class="action-btn remove-btn" data-index="${index}">Remove</button>
        </div>
      `;
      savedTimestampsDiv.appendChild(timestampItem);
    });

    // Add copy event listeners
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        navigator.clipboard.writeText(url).then(() => {
          alert('URL Copied!');
        });
      });
    });

    // Add remove event listeners
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        chrome.storage.local.get(['timestamps'], function(result) {
          const timestamps = result.timestamps || [];
          timestamps.splice(index, 1);
          chrome.storage.local.set({timestamps: timestamps}, loadTimestamps);
        });
      });
    });
  }

  // Export Markdown file
  exportMDButton.addEventListener('click', function() {
    chrome.storage.local.get(['timestamps'], function(result) {
      const timestamps = result.timestamps || [];
      const markdownContent = timestamps.map(ts => `[${ts.title}](${ts.url})`).join('\n');
      
      // Create a Blob specifically as a Markdown file
      const blob = new Blob([markdownContent], {type: 'text/markdown;charset=utf-8'});
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url: url,
        filename: 'youtube_timestamps.md',
        saveAs: true,
        conflictAction: 'prompt'
      });
    });
  });

  // Clear all timestamps
  clearTimestampsButton.addEventListener('click', function() {
    chrome.storage.local.set({timestamps: []}, loadTimestamps);
  });

  // Initial load
  loadTimestamps();
});
