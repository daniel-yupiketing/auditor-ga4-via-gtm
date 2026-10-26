// content.js - Injects the hook and relays events to background
(function () {
  const SENDER_ID = 'DATALAYER_AUDITOR';

  // Inject injected.js into the main execution context of the page
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  } catch (e) {
    console.error('[DataLayer Auditor] Failed to inject interception script:', e);
  }

  // Listen for messages from injected.js
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.source !== SENDER_ID) return;

    if (event.data.type === 'DATALAYER_EVENT') {
      // Send to background service worker
      chrome.runtime.sendMessage({
        action: 'RECORD_EVENT',
        event: event.data.payload
      }).catch(() => {
        // Ignore errors when popup/background might be cycling
      });
    }
  });
})();
