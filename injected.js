// injected.js - Runs in the page's MAIN execution context
(function () {
  const SENDER_ID = 'DATALAYER_AUDITOR';

  function safeClone(data) {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (e) {
      return { _error: 'Unserializable payload', rawString: String(data) };
    }
  }

  function emitEvent(payload, origin = 'push') {
    try {
      let eventName = 'unnamed_push';
      let hasEventKey = false;
      let explicitEvent = null;

      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        if ('event' in payload) {
          hasEventKey = true;
          explicitEvent = payload.event;
          eventName = String(payload.event);
        } else if (payload['gtm.element']) {
          eventName = String(payload['gtm.element']);
        } else {
          eventName = 'data_object';
        }
      } else if (Array.isArray(payload)) {
        eventName = 'array_push';
      } else if (typeof payload === 'string') {
        eventName = payload;
      }

      window.postMessage({
        source: SENDER_ID,
        type: 'DATALAYER_EVENT',
        payload: {
          timestamp: new Date().toISOString(),
          eventName: String(eventName),
          explicitEvent: explicitEvent,
          hasEventKey: hasEventKey,
          url: window.location.href,
          origin: origin,
          data: safeClone(payload)
        }
      }, '*');
    } catch (err) {
      console.warn('[DataLayer Auditor] Error emitting event:', err);
    }
  }

  function hookDataLayer(dl) {
    if (!dl || dl.__dla_hooked) return;

    // Capture existing items in dataLayer
    for (let i = 0; i < dl.length; i++) {
      emitEvent(dl[i], 'initial_state');
    }

    const originalPush = dl.push;
    dl.push = function (...args) {
      for (let i = 0; i < args.length; i++) {
        emitEvent(args[i], 'push');
      }
      return originalPush.apply(this, args);
    };

    Object.defineProperty(dl, '__dla_hooked', {
      value: true,
      enumerable: false,
      configurable: false
    });
  }

  // Check if dataLayer already exists
  if (window.dataLayer && Array.isArray(window.dataLayer)) {
    hookDataLayer(window.dataLayer);
  }

  // Intercept when dataLayer is defined or reassigned
  let currentDL = window.dataLayer;
  Object.defineProperty(window, 'dataLayer', {
    configurable: true,
    enumerable: true,
    get: function () {
      return currentDL;
    },
    set: function (newVal) {
      currentDL = newVal;
      if (Array.isArray(newVal)) {
        hookDataLayer(newVal);
      }
    }
  });

  // Also catch Adobe Data Layer if present (common in enterprise portals)
  function hookAdobeDataLayer(adl) {
    if (!adl || adl.__dla_hooked) return;
    for (let i = 0; i < adl.length; i++) {
      emitEvent(adl[i], 'adobe_initial');
    }
    const origPush = adl.push;
    adl.push = function (...args) {
      for (let i = 0; i < args.length; i++) {
        emitEvent(args[i], 'adobe_push');
      }
      return origPush.apply(this, args);
    };
    adl.__dla_hooked = true;
  }

  if (window.adobeDataLayer && Array.isArray(window.adobeDataLayer)) {
    hookAdobeDataLayer(window.adobeDataLayer);
  }
})();
