// background.js - Service worker to store and coordinate dataLayer events

const STORAGE_KEY = 'dla_events';
const SETTINGS_KEY = 'dla_settings';

// Sequential promise queue to prevent race conditions when multiple events
// are pushed in the same millisecond (e.g. view_item_list batches on llamaya.com)
let storageQueue = Promise.resolve();

function enqueueStorageTask(taskFn) {
  storageQueue = storageQueue.then(taskFn).catch((err) => {
    console.error('[DataLayer Auditor Background] Queue error:', err);
  });
  return storageQueue;
}

// Initialize default storage if empty
chrome.runtime.onInstalled.addListener(() => {
  enqueueStorageTask(async () => {
    const data = await chrome.storage.local.get([STORAGE_KEY, SETTINGS_KEY]);
    const events = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
    if (!data[STORAGE_KEY]) {
      await chrome.storage.local.set({ [STORAGE_KEY]: [] });
    }
    if (!data[SETTINGS_KEY]) {
      await chrome.storage.local.set({ [SETTINGS_KEY]: { recording: true } });
    }
    await updateBadge(events.length);
  });
});

// Configure side panel behavior: open side panel directly when clicking the extension icon
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
}

async function updateBadge(count) {
  try {
    const text = count > 0 ? (count > 999 ? '999+' : String(count)) : '';
    await chrome.action.setBadgeText({ text: text });
    await chrome.action.setBadgeBackgroundColor({ color: '#ff6600' }); // Orange-inspired accent color
  } catch (e) {
    // Ignore error if context invalidated
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'RECORD_EVENT') {
    enqueueStorageTask(async () => {
      const { [SETTINGS_KEY]: settings = { recording: true }, [STORAGE_KEY]: events = [] } =
        await chrome.storage.local.get([SETTINGS_KEY, STORAGE_KEY]);

      if (!settings.recording) {
        sendResponse({ success: false, reason: 'paused' });
        return;
      }

      // Add tab info if available
      const enrichedEvent = {
        ...message.event,
        tabId: sender.tab?.id,
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 6)
      };

      events.push(enrichedEvent);

      // Keep maximum 2000 events to prevent memory overflow
      if (events.length > 2000) {
        events.splice(0, events.length - 2000);
      }

      await chrome.storage.local.set({ [STORAGE_KEY]: events });
      await updateBadge(events.length);
      sendResponse({ success: true, count: events.length });
    });
    return true; // async response
  }

  if (message.action === 'CLEAR_EVENTS') {
    enqueueStorageTask(async () => {
      await chrome.storage.local.set({ [STORAGE_KEY]: [] });
      await updateBadge(0);
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'TOGGLE_RECORDING') {
    enqueueStorageTask(async () => {
      const { [SETTINGS_KEY]: settings = { recording: true } } =
        await chrome.storage.local.get(SETTINGS_KEY);
      const newRecordingState = !settings.recording;
      await chrome.storage.local.set({ [SETTINGS_KEY]: { ...settings, recording: newRecordingState } });
      sendResponse({ recording: newRecordingState });
    });
    return true;
  }
});
