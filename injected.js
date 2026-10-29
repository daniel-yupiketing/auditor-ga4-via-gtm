// injected.js - Runs in the page's MAIN execution context
(function () {
  if (window.__dla_main_installed) return;
  window.__dla_main_installed = true;
  const SENDER_ID = 'DATALAYER_AUDITOR';

  function safeClone(data) {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (e) {
      return { _error: 'Unserializable payload', rawString: String(data) };
    }
  }

  const emittedItems = new WeakSet();
  let consentGranted = false;

  function checkConsentUpdate(payload) {
    if (!payload) return;
    try {
      // 1. Google Consent Mode v2 vía gtag / dataLayer push [ 'consent', 'update', { analytics_storage: 'granted', ... } ]
      if (Array.isArray(payload) || (typeof payload === 'object' && payload !== null && ('0' in payload || '1' in payload))) {
        const p0 = payload[0] || payload['0'];
        const p1 = payload[1] || payload['1'];
        const p2 = payload[2] || payload['2'];
        if (p0 === 'consent' && p1 === 'update' && p2 && typeof p2 === 'object') {
          if (p2.analytics_storage === 'granted' || p2.ad_storage === 'granted') {
            consentGranted = true;
          }
        }
      }

      // 2. Eventos OneTrust / Optanon / CMP
      const ev = payload.event;
      if (ev === 'OneTrustGroupsUpdated' || ev === 'consent_updated' || ev === 'queue_processed') {
        const groups = String(payload.OnetrustActiveGroups || payload.OptanonActiveGroups || '');
        if (groups.includes('C0002') || groups.includes('ANALY') || groups.includes('ADVER') || ev === 'queue_processed' || ev === 'consent_updated') {
          consentGranted = true;
        }
      }
    } catch (e) {}
  }

  function emitEvent(payload, origin = 'push') {
    try {
      if (payload && typeof payload === 'object') {
        if (emittedItems.has(payload)) return;
        emittedItems.add(payload);
      }

      // Detectar si este push actualiza el estado de consentimiento
      checkConsentUpdate(payload);

      let eventName = 'unnamed_push';
      let hasEventKey = false;
      let explicitEvent = null;

      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        if ('event' in payload && payload.event !== undefined && payload.event !== null) {
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
          consentState: consentGranted ? 'post_consent' : 'pre_consent',
          url: window.location.href,
          origin: origin,
          data: safeClone(payload)
        }
      }, '*');

      // Si el evento es un contenedor de cola (como 'encolar_evento' en llamaya.com con 'events_queue'),
      // sólo desglosamos si no se ha emitido ya el evento directamente.
    } catch (err) {
      console.warn('[DataLayer Auditor] Error emitting event:', err);
    }
  }

  function hookDataLayer(dl) {
    if (!dl) return;

    // Emitir elementos que estuvieran en el dataLayer antes de enganchar y que aún no hayamos emitido
    const startIdx = typeof dl.__dla_emitted_len === 'number' ? dl.__dla_emitted_len : 0;
    for (let i = startIdx; i < dl.length; i++) {
      emitEvent(dl[i], 'initial_state');
    }
    Object.defineProperty(dl, '__dla_emitted_len', {
      value: dl.length,
      writable: true,
      enumerable: false,
      configurable: true
    });

    // Si GTM u otro script ha sobrescrito dl.push después de nuestro primer hook, volvemos a envolverlo
    if (dl.push && !dl.push.__dla_wrapped) {
      const originalPush = dl.push;
      const wrappedPush = function (...args) {
        const res = originalPush.apply(this, args);
        dl.__dla_emitted_len = dl.length;
        for (let i = 0; i < args.length; i++) {
          emitEvent(args[i], 'push');
        }
        return res;
      };
      Object.defineProperty(wrappedPush, '__dla_wrapped', {
        value: true,
        enumerable: false,
        configurable: false
      });
      dl.push = wrappedPush;
    }

    Object.defineProperty(dl, '__dla_hooked', {
      value: true,
      writable: true,
      enumerable: false,
      configurable: true
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
