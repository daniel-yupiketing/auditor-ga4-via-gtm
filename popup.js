// popup.js - Interactive interface for DataLayer Auditor & GA4 GTM Analyzer

const STORAGE_KEY = 'dla_events';
const SETTINGS_KEY = 'dla_settings';
const CUSTOM_GTM_KEY = 'dla_custom_gtm_spec';
const UI_PREFS_KEY = 'dla_ui_prefs';

let liveEvents = [];
let importedEvents = null; // null means we are using liveEvents
let importedFileName = '';
let activeGtmSpec = DEFAULT_GTM_SPEC;
let activeTabName = 'live';

let isRecording = true;
let searchTerm = '';
let selectedEventsSet = new Set();
let unselectedEventsSet = new Set();
let initializedEventTypes = false;
let onlyExplicitEvents = false;
let onlyGtmEvents = false;
let onlyPii = false;
let onlyGa4Errors = false;
let consentFilter = 'ALL'; // 'ALL', 'PRE', 'POST'
let searchMode = 'contains'; // 'contains', 'not_contains'

// DOM Elements - Header & Tabs
const gtmBadgeSubtitle = document.getElementById('gtmBadgeSubtitle');
const openSidePanelBtn = document.getElementById('openSidePanelBtn');
const openAnalyzerTabBtn = document.getElementById('openAnalyzerTabBtn');
const tabLiveBtn = document.getElementById('tabLiveBtn');
const tabAuditBtn = document.getElementById('tabAuditBtn');
const auditErrorCounterBadge = document.getElementById('auditErrorCounterBadge');
const viewLiveContainer = document.getElementById('viewLiveContainer');
const viewAuditContainer = document.getElementById('viewAuditContainer');

// DOM Elements - Live / Events View
const eventsContainer = document.getElementById('eventsContainer');
const emptyState = document.getElementById('emptyState');
const totalCountEl = document.getElementById('totalCount');
const filteredCountEl = document.getElementById('filteredCount');
const filterCountWrapper = document.getElementById('filterCountWrapper');
const sourceIndicator = document.getElementById('sourceIndicator');
const searchModeSelect = document.getElementById('searchModeSelect');
const searchInput = document.getElementById('searchInput');

// Multiselect DOM
const multiselectWrapper = document.getElementById('multiselectWrapper');
const multiselectTrigger = document.getElementById('multiselectTrigger');
const multiselectLabel = document.getElementById('multiselectLabel');
const multiselectDropdown = document.getElementById('multiselectDropdown');
const multiselectList = document.getElementById('multiselectList');
const selectAllEventsBtn = document.getElementById('selectAllEventsBtn');
const deselectAllEventsBtn = document.getElementById('deselectAllEventsBtn');
const selectOnlyGtmEventsBtn = document.getElementById('selectOnlyGtmEventsBtn');
const excludeGtmEventsBtn = document.getElementById('excludeGtmEventsBtn');

// Options & Export DOM
const onlyGtmEventsCheck = document.getElementById('onlyGtmEventsCheck');
const onlyExplicitEventCheck = document.getElementById('onlyExplicitEventCheck');
const onlyPiiCheck = document.getElementById('onlyPiiCheck');
const onlyGa4ErrorsCheck = document.getElementById('onlyGa4ErrorsCheck');
const consentFilterSelect = document.getElementById('consentFilterSelect');
const importEventsInput = document.getElementById('importEventsInput');
const importEventsBtn = document.getElementById('importEventsBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const clearBtn = document.getElementById('clearBtn');
const toggleRecordBtn = document.getElementById('toggleRecordBtn');
const recordIcon = document.getElementById('recordIcon');
const recordStatusText = document.getElementById('recordStatusText');
const autoScrollCheck = document.getElementById('autoScrollCheck');

// DOM Elements - GA4 Audit View
const auditUploadEventsBtn = document.getElementById('auditUploadEventsBtn');
const auditUseLiveBtn = document.getElementById('auditUseLiveBtn');
const importGtmInput = document.getElementById('importGtmInput');
const importGtmBtn = document.getElementById('importGtmBtn');
const resetGtmBtn = document.getElementById('resetGtmBtn');
const kpiTotalGa4 = document.getElementById('kpiTotalGa4');
const kpiOkCount = document.getElementById('kpiOkCount');
const kpiWarnCount = document.getElementById('kpiWarnCount');
const kpiErrCount = document.getElementById('kpiErrCount');
const auditStatusFilter = document.getElementById('auditStatusFilter');
const auditTypeFilter = document.getElementById('auditTypeFilter');
const auditDeduplicateCheck = document.getElementById('auditDeduplicateCheck');
const exportAuditHtmlBtn = document.getElementById('exportAuditHtmlBtn');
const exportAuditReportBtn = document.getElementById('exportAuditReportBtn');
const exportAuditCsvBtn = document.getElementById('exportAuditCsvBtn');
const auditContentContainer = document.getElementById('auditContentContainer');

// Check if opened in side panel mode or full browser tab
const isSidePanel = window.location.pathname.includes('sidepanel') || window.innerWidth < 450;
if (window.location.search.includes('fulltab=1')) {
  document.body.classList.add('full-tab-mode');
  if (openAnalyzerTabBtn) openAnalyzerTabBtn.classList.add('hidden');
}
if (chrome.sidePanel && openSidePanelBtn) {
  // Hide side panel button if already inside a side panel
  chrome.tabs.getCurrent((tab) => {
    if (!tab) {
      // Typically inside side panel context
      openSidePanelBtn.classList.add('hidden');
    }
  });
}

// Pattern to alert on potential PII (emails, phone numbers with prefix, Spanish DNI/NIE)
const PII_REGEX = /([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)|(\b\d{8}[A-HJ-NP-TV-Z]\b)|(\b[XYZ]\d{7}[A-HJ-NP-TV-Z]\b)|(\b(\+34|0034)?[6789]\d{8}\b)/i;

function getActiveEventsList() {
  return importedEvents !== null ? importedEvents : liveEvents;
}

function hasPotentialPII(data) {
  const jsonStr = JSON.stringify(data);
  return PII_REGEX.test(jsonStr);
}

function hasExplicitEventProp(ev) {
  if (!ev) return false;
  if (ev.hasEventKey !== undefined && ev.hasEventKey !== null) {
    return Boolean(ev.hasEventKey);
  }
  if (ev.explicitEvent) return true;
  if (ev.data && typeof ev.data === 'object' && !Array.isArray(ev.data)) {
    return 'event' in ev.data;
  }
  if (ev.eventName && ev.eventName !== 'unnamed_push' && ev.eventName !== 'data_object' && ev.eventName !== 'array_push') {
    return true;
  }
  return false;
}

function getExplicitEventName(ev) {
  if (!ev) return null;
  if (ev.explicitEvent !== undefined && ev.explicitEvent !== null) {
    return String(ev.explicitEvent);
  }
  if (ev.data && typeof ev.data === 'object' && 'event' in ev.data) {
    return String(ev.data.event);
  }
  if (ev.eventName && ev.eventName !== 'unnamed_push' && ev.eventName !== 'data_object' && ev.eventName !== 'array_push') {
    return String(ev.eventName);
  }
  return null;
}

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  } catch (e) {
    return isoString || '-';
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function updateGtmSubtitleUI() {
  gtmBadgeSubtitle.textContent = `Reglas de GTM: ${activeGtmSpec.publicId} (${activeGtmSpec.containerName})`;
  if (activeGtmSpec.publicId !== DEFAULT_GTM_SPEC.publicId || activeGtmSpec !== DEFAULT_GTM_SPEC) {
    resetGtmBtn.classList.remove('hidden');
  } else {
    resetGtmBtn.classList.add('hidden');
  }
}

function updateSourceIndicatorUI() {
  if (importedEvents !== null) {
    sourceIndicator.textContent = `📂 Archivo: ${importedFileName}`;
    sourceIndicator.classList.add('imported');
    auditUseLiveBtn.classList.remove('hidden');
  } else {
    sourceIndicator.textContent = '📡 En vivo';
    sourceIndicator.classList.remove('imported');
    auditUseLiveBtn.classList.add('hidden');
  }
}

// Extract all unique event names and their counts
function getUniqueEventStats() {
  const stats = {};
  const currentList = getActiveEventsList();
  const gtmRules = (activeGtmSpec && activeGtmSpec.eventRules) || {};
  currentList.forEach((ev) => {
    const hasEvent = hasExplicitEventProp(ev);
    if (!hasEvent && onlyExplicitEvents) return;
    const name = getExplicitEventName(ev) || ev.eventName || 'unnamed_push';
    if (onlyGtmEvents && !(name in gtmRules)) return;
    stats[name] = (stats[name] || 0) + 1;
  });
  return stats;
}

// Update the checkbox multiselect dropdown
function updateMultiselectUI() {
  const stats = getUniqueEventStats();
  const names = Object.keys(stats).sort((a, b) => a.localeCompare(b));

  if (!initializedEventTypes && names.length > 0) {
    names.forEach((n) => selectedEventsSet.add(n));
    initializedEventTypes = true;
  } else {
    names.forEach((n) => {
      if (!unselectedEventsSet.has(n)) {
        selectedEventsSet.add(n);
      }
    });
  }

  multiselectList.innerHTML = '';

  if (names.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.padding = '8px 12px';
    emptyMsg.style.color = 'var(--text-secondary)';
    emptyMsg.style.fontSize = '11px';
    emptyMsg.textContent = 'No hay eventos detectados';
    multiselectList.appendChild(emptyMsg);
    multiselectLabel.textContent = 'Ningún evento detectado';
    return;
  }

  names.forEach((name) => {
    const label = document.createElement('label');
    label.className = 'multiselect-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = name;
    checkbox.checked = selectedEventsSet.has(name);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedEventsSet.add(name);
        unselectedEventsSet.delete(name);
      } else {
        selectedEventsSet.delete(name);
        unselectedEventsSet.add(name);
      }
      updateTriggerLabel(names.length);
      saveUiPrefs();
      renderEvents();
    });

    const nameSpan = document.createElement('span');
    nameSpan.className = 'multiselect-item-name';
    nameSpan.textContent = `event: "${name}"`;

    const countSpan = document.createElement('span');
    countSpan.className = 'multiselect-item-count';
    countSpan.textContent = stats[name];

    label.appendChild(checkbox);
    label.appendChild(nameSpan);
    label.appendChild(countSpan);
    multiselectList.appendChild(label);
  });

  updateTriggerLabel(names.length);
}

function updateTriggerLabel(totalTypes) {
  const selectedCount = selectedEventsSet.size;
  if (selectedCount === 0) {
    multiselectLabel.textContent = 'Ningún evento seleccionado';
  } else if (selectedCount === totalTypes) {
    multiselectLabel.textContent = `Todos los eventos ("event: *") [${totalTypes} tipos]`;
  } else {
    multiselectLabel.textContent = `Filtrando: ${selectedCount} de ${totalTypes} tipos`;
  }
}

// Filter logic
function getFilteredEvents() {
  const currentList = getActiveEventsList();
  const gtmRules = (activeGtmSpec && activeGtmSpec.eventRules) || {};
  return currentList.filter((ev) => {
    const hasEvent = hasExplicitEventProp(ev);
    const eventName = getExplicitEventName(ev) || ev.eventName || 'unnamed_push';

    if (onlyGtmEvents && !(eventName in gtmRules)) {
      return false;
    }

    if (onlyExplicitEvents && !hasEvent) {
      return false;
    }

    if (selectedEventsSet.size > 0 && !selectedEventsSet.has(eventName)) {
      return false;
    } else if (selectedEventsSet.size === 0) {
      return false;
    }

    if (onlyPii && !hasPotentialPII(ev.data)) {
      return false;
    }

    if (onlyGa4Errors) {
      const auditRes = auditSingleEventPayload(eventName, ev.data, activeGtmSpec);
      if (!auditRes.isGa4Tracked || auditRes.status === 'OK') {
        return false;
      }
    }

    if (consentFilter === 'PRE') {
      if (ev.consentState === 'post_consent') return false;
    } else if (consentFilter === 'POST') {
      if (ev.consentState !== 'post_consent') return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const jsonString = JSON.stringify(ev.data || '').toLowerCase();
      const matchName = eventName.toLowerCase().includes(term);
      const matchJson = jsonString.includes(term);
      const matches = matchName || matchJson;

      if (searchMode === 'not_contains') {
        if (matches) return false;
      } else {
        if (!matches) return false;
      }
    }

    return true;
  });
}

function buildInlineAuditHtml(auditRes) {
  if (!auditRes.isGa4Tracked) {
    if (auditRes.isSystemEvent) return '';
    return `
      <div class="inline-audit-box">
        <div class="issue-item issue-info">ℹ️ Evento no asociado a ninguna etiqueta GA4 en ${escapeHtml(activeGtmSpec.publicId)}.</div>
      </div>
    `;
  }

  const pillsHtml = auditRes.paramResults
    .map((pr) => {
      if (pr.status === 'OPTIONAL_OMITTED') {
        return `<span class="param-pill pill-opt" title="Parámetro opcional en este evento (${escapeHtml(pr.dlPath || '')})">◌ ${escapeHtml(pr.parameter)} (opc.)</span>`;
      }
      const cls = pr.status === 'OK' ? 'pill-ok' : 'pill-err';
      const icon = pr.status === 'OK' ? '✓' : '✗';
      return `<span class="param-pill ${cls}" title="Ruta: ${escapeHtml(pr.dlPath || '')}">${icon} ${escapeHtml(pr.parameter)}</span>`;
    })
    .join('');

  const issuesHtml = auditRes.issues
    .map((iss) => {
      const icon = iss.severity === 'error' ? '❌' : iss.severity === 'warning' ? '⚠️' : 'ℹ️';
      return `<div class="issue-item issue-${iss.severity}"><span>${icon}</span> <span><strong>${escapeHtml(iss.field)}:</strong> ${escapeHtml(iss.message)}</span></div>`;
    })
    .join('');

  return `
    <div class="inline-audit-box">
      <div class="inline-audit-title">
        <span>🏷️ Etiqueta de GTM: ${escapeHtml(auditRes.tagName)}</span>
        <span>Estado en GA4: ${auditRes.status}</span>
      </div>
      <div class="param-pills">${pillsHtml}</div>
      ${issuesHtml ? `<div style="margin-top:6px;">${issuesHtml}</div>` : ''}
    </div>
  `;
}

function renderEvents() {
  const currentList = getActiveEventsList();
  const filtered = getFilteredEvents();
  const stats = getUniqueEventStats();
  const totalTypes = Object.keys(stats).length;

  updateSourceIndicatorUI();
  totalCountEl.textContent = currentList.length;

  const isFilteringActive =
    (selectedEventsSet.size > 0 && selectedEventsSet.size < totalTypes) ||
    selectedEventsSet.size === 0 ||
    searchTerm ||
    onlyGtmEvents ||
    onlyExplicitEvents ||
    onlyPii ||
    onlyGa4Errors;

  if (isFilteringActive) {
    filterCountWrapper.classList.remove('hidden');
    filteredCountEl.textContent = filtered.length;
  } else {
    filterCountWrapper.classList.add('hidden');
  }

  exportJsonBtn.innerHTML = `<span>📥 JSON (${filtered.length})</span>`;
  exportCsvBtn.innerHTML = `<span>📊 CSV (${filtered.length})</span>`;

  // Also refresh the audit view badge & content
  renderAuditView();

  if (filtered.length === 0) {
    eventsContainer.innerHTML = '';
    eventsContainer.appendChild(emptyState);
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';
  eventsContainer.innerHTML = '';

  const fragment = document.createDocumentFragment();

  filtered.forEach((ev, index) => {
    const isPII = hasPotentialPII(ev.data);
    const displayName = getExplicitEventName(ev) || ev.eventName || 'unnamed_push';
    const auditRes = auditSingleEventPayload(displayName, ev.data, activeGtmSpec);

    const card = document.createElement('div');
    let cardBorderClass = '';
    let ga4Badge = '';

    if (auditRes.isGa4Tracked) {
      if (auditRes.status === 'OK') {
        cardBorderClass = 'card-ok';
        ga4Badge = '<span class="event-badge badge-ga4-ok" title="Todos los parámetros GA4 requeridos en GTM están presentes">✓ GA4 OK</span>';
      } else if (auditRes.status === 'WARNING') {
        cardBorderClass = 'card-warn';
        ga4Badge = `<span class="event-badge badge-ga4-warn" title="Evento GA4 con advertencias">⚠️ GA4 (${auditRes.issues.length})</span>`;
      } else {
        cardBorderClass = 'card-error';
        ga4Badge = `<span class="event-badge badge-ga4-err" title="Faltan parámetros requeridos en GTM">❌ GA4 ERR (${auditRes.issues.length})</span>`;
      }
    }

    card.className = `event-card ${cardBorderClass}`;

    let originBadge = '';
    if (ev.origin === 'initial_state') {
      originBadge = '<span class="event-badge badge-init">Init</span>';
    } else if (ev.origin && ev.origin.startsWith('adobe')) {
      originBadge = '<span class="event-badge badge-adobe">Adobe</span>';
    }

    const piiBadge = isPII
      ? '<span class="event-badge badge-pii" title="Contiene datos personales como teléfono o email">⚠️ PII</span>'
      : '';

    const consentBadge = ev.consentState === 'post_consent'
      ? '<span class="event-badge badge-consent-post" title="Evento enviado tras aceptar cookies (post-consentimiento)">🟢 Post-consent</span>'
      : '<span class="event-badge badge-consent-pre" title="Evento enviado antes de otorgar consentimiento (pre-consentimiento)">🔴 Pre-consent</span>';

    const inlineAuditHtml = buildInlineAuditHtml(auditRes);

    card.innerHTML = `
      <div class="event-header">
        <div class="event-title-group">
          <span class="chevron">▸</span>
          <span class="event-index">#${index + 1}</span>
          <span class="event-name" title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</span>
          ${consentBadge}
          ${ga4Badge}
          ${originBadge}
          ${piiBadge}
        </div>
        <span class="event-time">${formatTime(ev.timestamp)}</span>
      </div>
      <div class="event-body">
        ${inlineAuditHtml}
        <div class="event-meta">
          <span class="meta-url" title="${escapeHtml(ev.url || '')}">URL: ${escapeHtml(ev.url || '-')}</span>
          <button class="copy-json-btn">📋 Copiar JSON</button>
        </div>
        <pre class="event-json">${escapeHtml(JSON.stringify(ev.data, null, 2))}</pre>
      </div>
    `;

    const header = card.querySelector('.event-header');
    const body = card.querySelector('.event-body');
    const chevron = card.querySelector('.chevron');
    const copyBtn = card.querySelector('.copy-json-btn');

    header.addEventListener('click', () => {
      const isOpen = body.classList.toggle('open');
      chevron.textContent = isOpen ? '▾' : '▸';
    });

    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(JSON.stringify(ev.data, null, 2)).then(() => {
        copyBtn.textContent = '✅ Copiado!';
        setTimeout(() => (copyBtn.textContent = '📋 Copiar JSON'), 1500);
      });
    });

    fragment.appendChild(card);
  });

  eventsContainer.appendChild(fragment);

  if (autoScrollCheck.checked && importedEvents === null) {
    eventsContainer.scrollTop = eventsContainer.scrollHeight;
  }
}

// =========================================================
// VIEW 2: GA4 / GTM AUDITOR RENDERING & DEDUPLICATION
// =========================================================
function getIssueFingerprint(auditItem) {
  const issuesSig = (auditItem.issues || [])
    .map((iss) => `${iss.severity}:${iss.field}:${iss.message}`)
    .sort()
    .join('||');
  return `${auditItem.eventName}__${auditItem.status}__${issuesSig}`;
}

function deduplicateAuditedList(auditedList) {
  const groupsMap = new Map();
  const result = [];

  auditedList.forEach((item) => {
    const rawUrl = item.url || item.origin || 'URL no especificada';
    // Deduplicamos los eventos que tienen incidencias (ERROR o WARNING) o los eventos sin tag
    // Si está OK, también podemos agrupar por (eventName + OK + URL) si se desea, o deduplicar por huella completa:
    const fp =
      item.status === 'OK'
        ? `${item.eventName}__OK__${rawUrl}`
        : getIssueFingerprint(item);

    if (!groupsMap.has(fp)) {
      const clone = {
        ...item,
        occurrences: 1,
        occurrenceIndices: [item.index],
        detectedUrlsMap: { [rawUrl]: 1 }
      };
      groupsMap.set(fp, clone);
      result.push(clone);
    } else {
      const existing = groupsMap.get(fp);
      existing.occurrences += 1;
      existing.occurrenceIndices.push(item.index);
      existing.detectedUrlsMap[rawUrl] = (existing.detectedUrlsMap[rawUrl] || 0) + 1;
    }
  });

  return result;
}

function computeFullAuditReport() {
  const currentList = getActiveEventsList();
  const auditedList = currentList.map((ev, idx) => {
    const evName = getExplicitEventName(ev) || ev.eventName || 'unnamed_push';
    const res = auditSingleEventPayload(evName, ev.data, activeGtmSpec);
    const resolvedUrl = ev.url || (ev.data && (ev.data.page_location || ev.data.url)) || ev.origin || 'URL desconocida';
    return {
      index: idx + 1,
      timestamp: ev.timestamp,
      url: resolvedUrl,
      origin: ev.origin,
      payload: ev.data,
      ...res
    };
  });

  const deduplicatedList = deduplicateAuditedList(auditedList);

  const ga4Events = auditedList.filter((a) => a.isGa4Tracked);
  const dedupGa4Events = deduplicatedList.filter((a) => a.isGa4Tracked);

  const okCount = ga4Events.filter((a) => a.status === 'OK').length;
  const warnCount = ga4Events.filter((a) => a.status === 'WARNING').length;
  const errCount = ga4Events.filter((a) => a.status === 'ERROR').length;

  const uniqueWarnCount = dedupGa4Events.filter((a) => a.status === 'WARNING').length;
  const uniqueErrCount = dedupGa4Events.filter((a) => a.status === 'ERROR').length;

  const byEventType = {};
  Object.keys(activeGtmSpec.eventRules).forEach((evName) => {
    const rule = activeGtmSpec.eventRules[evName];
    const matching = ga4Events.filter((a) => a.eventName === evName);
    const matchingDedup = dedupGa4Events.filter((a) => a.eventName === evName);
    byEventType[evName] = {
      eventName: evName,
      tagName: rule.tagName,
      expectedParams: rule.parameters.map((p) =>
        isParamOptionalForEvent(evName, p.parameter) ? `${p.parameter} (opc.)` : p.parameter
      ),
      total: matching.length,
      ok: matching.filter((m) => m.status === 'OK').length,
      warn: matching.filter((m) => m.status === 'WARNING').length,
      err: matching.filter((m) => m.status === 'ERROR').length,
      uniqueWarn: matchingDedup.filter((m) => m.status === 'WARNING').length,
      uniqueErr: matchingDedup.filter((m) => m.status === 'ERROR').length
    };
  });

  return {
    containerName: activeGtmSpec.containerName,
    publicId: activeGtmSpec.publicId,
    source: importedEvents !== null ? importedFileName : 'live_capture',
    totalPushes: currentList.length,
    totalGa4Events: ga4Events.length,
    okCount,
    warnCount,
    errCount,
    uniqueWarnCount,
    uniqueErrCount,
    byEventType,
    auditedEvents: auditedList,
    deduplicatedEvents: deduplicatedList
  };
}

function renderAuditView() {
  const report = computeFullAuditReport();
  const isDedup = auditDeduplicateCheck ? auditDeduplicateCheck.checked : true;

  kpiTotalGa4.textContent = report.totalGa4Events;
  kpiOkCount.textContent = report.okCount;
  kpiWarnCount.textContent = isDedup ? report.uniqueWarnCount : report.warnCount;
  kpiErrCount.textContent = isDedup ? report.uniqueErrCount : report.errCount;

  const problemTotal = isDedup
    ? report.uniqueErrCount + report.uniqueWarnCount
    : report.errCount + report.warnCount;
  if (problemTotal > 0) {
    auditErrorCounterBadge.textContent = problemTotal;
    auditErrorCounterBadge.classList.remove('hidden');
  } else {
    auditErrorCounterBadge.classList.add('hidden');
  }

  // Update event type filter options preserving selection
  const prevType = auditTypeFilter.value;
  const capturedTypes = Object.values(report.byEventType)
    .filter((t) => t.total > 0)
    .map((t) => t.eventName);

  auditTypeFilter.innerHTML = '<option value="ALL">Todos los tipos de evento</option>';
  capturedTypes.forEach((tName) => {
    const opt = document.createElement('option');
    opt.value = tName;
    opt.textContent = `${tName} (${report.byEventType[tName].total})`;
    auditTypeFilter.appendChild(opt);
  });
  if (capturedTypes.includes(prevType)) {
    auditTypeFilter.value = prevType;
  }

  auditContentContainer.innerHTML = '';

  if (report.totalPushes === 0) {
    auditContentContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📂</div>
        <p>No hay eventos para auditar.</p>
        <small>Pulsa <strong>«📂 Subir JSON de eventos»</strong> arriba para cargar un archivo exportado o navega por la web con la grabación activa.</small>
      </div>
    `;
    return;
  }

  // 1. Summary Table by Event Type (only types with at least 1 event captured)
  const activeTypeRows = Object.values(report.byEventType).filter((t) => t.total > 0);
  if (activeTypeRows.length > 0) {
    const tableWrapper = document.createElement('div');
    const rowsHtml = activeTypeRows
      .map(
        (t) => `
        <tr>
          <td><strong style="color:#38bdf8;font-family:var(--mono-family);">${escapeHtml(t.eventName)}</strong></td>
          <td>${t.total}</td>
          <td style="color:#34d399;font-weight:700;">${t.ok}</td>
          <td style="color:#fbbf24;font-weight:700;">${isDedup ? t.uniqueWarn : t.warn}</td>
          <td style="color:#f87171;font-weight:700;">${isDedup ? t.uniqueErr : t.err}</td>
          <td style="color:var(--text-secondary);font-size:10px;">${escapeHtml(t.expectedParams.join(', '))}</td>
        </tr>
      `
      )
      .join('');

    tableWrapper.innerHTML = `
      <table class="audit-summary-table">
        <thead>
          <tr>
            <th>Evento de GA4</th>
            <th>Total</th>
            <th>✅ Correctos</th>
            <th>⚠️ Avisos</th>
            <th>❌ Errores</th>
            <th>Parámetros requeridos en GTM</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
    auditContentContainer.appendChild(tableWrapper);
  }

  // 2. Filtered Event Cards (using deduplicated or raw list)
  const statusMode = auditStatusFilter.value;
  const selectedType = auditTypeFilter.value;
  const sourceAuditList = isDedup ? report.deduplicatedEvents : report.auditedEvents;

  const filteredAudit = sourceAuditList.filter((a) => {
    if (selectedType !== 'ALL' && a.eventName !== selectedType) return false;
    if (statusMode === 'ALL_GA4') return a.isGa4Tracked;
    if (statusMode === 'PROBLEMS') return a.isGa4Tracked && (a.status === 'ERROR' || a.status === 'WARNING');
    if (statusMode === 'ERROR') return a.isGa4Tracked && a.status === 'ERROR';
    if (statusMode === 'OK') return a.isGa4Tracked && a.status === 'OK';
    if (statusMode === 'UNTRACKED') return !a.isGa4Tracked && !a.isSystemEvent;
    return true;
  });

  if (filteredAudit.length === 0) {
    const noMatch = document.createElement('div');
    noMatch.style.padding = '18px';
    noMatch.style.textAlign = 'center';
    noMatch.style.color = 'var(--text-secondary)';
    noMatch.textContent = 'No hay eventos que coincidan con el filtro seleccionado.';
    auditContentContainer.appendChild(noMatch);
    return;
  }

  filteredAudit.forEach((a) => {
    const card = document.createElement('div');
    const borderCls =
      a.status === 'ERROR' ? 'card-error' : a.status === 'WARNING' ? 'card-warn' : a.status === 'OK' ? 'card-ok' : '';
    card.className = `event-card ${borderCls}`;

    let statusBadge = '';
    if (a.status === 'OK') {
      statusBadge = '<span class="event-badge badge-ga4-ok">✓ Correcto</span>';
    } else if (a.status === 'WARNING') {
      statusBadge = `<span class="event-badge badge-ga4-warn">⚠️ Aviso (${a.issues.length})</span>`;
    } else if (a.status === 'ERROR') {
      statusBadge = `<span class="event-badge badge-ga4-err">❌ Error (${a.issues.length})</span>`;
    } else {
      statusBadge = '<span class="event-badge badge-init">Sin etiqueta de GA4</span>';
    }

    const urlsMap = a.detectedUrlsMap || { [a.url || 'URL desconocida']: 1 };
    const urlList = Object.keys(urlsMap);
    const primaryUrl = urlList[0] || a.url || '-';

    const urlsBoxHtml = `
      <div class="inline-audit-box" style="margin-bottom:8px; background-color:#1e222d; border-color:#334155;">
        <div class="inline-audit-title" style="color:#93c5fd;">
          <span>🌐 URL donde se ha detectado:</span>
        </div>
        ${urlList
          .map(
            (u) =>
              `<div class="issue-item" style="color:#e2e8f0; word-break:break-all;"><span>🔗</span> <span><code>${escapeHtml(u)}</code></span></div>`
          )
          .join('')}
      </div>
    `;

    const isAutoExpanded = a.status === 'ERROR' || a.status === 'WARNING';

    card.innerHTML = `
      <div class="event-header">
        <div class="event-title-group">
          <span class="chevron">${isAutoExpanded ? '▾' : '▸'}</span>
          <span class="event-index">#${a.index}</span>
          <span class="event-name">${escapeHtml(a.eventName)}</span>
          ${statusBadge}
          <span style="font-size:10px; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:210px;" title="${escapeHtml(primaryUrl)}">📍 ${escapeHtml(primaryUrl)}</span>
        </div>
        <span class="event-time">${formatTime(a.timestamp)}</span>
      </div>
      <div class="event-body ${isAutoExpanded ? 'open' : ''}">
        ${urlsBoxHtml}
        ${buildInlineAuditHtml(a)}
        <div class="event-meta">
          <span class="meta-url" title="${escapeHtml(primaryUrl)}">Muestra del payload (#${a.index}) — URL: ${escapeHtml(primaryUrl)}</span>
          <button class="copy-json-btn">📋 Copiar JSON</button>
        </div>
        <pre class="event-json">${escapeHtml(JSON.stringify(a.payload, null, 2))}</pre>
      </div>
    `;

    const header = card.querySelector('.event-header');
    const body = card.querySelector('.event-body');
    const chevron = card.querySelector('.chevron');
    const copyBtn = card.querySelector('.copy-json-btn');

    header.addEventListener('click', () => {
      const isOpen = body.classList.toggle('open');
      chevron.textContent = isOpen ? '▾' : '▸';
    });

    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(JSON.stringify(a.payload, null, 2)).then(() => {
        copyBtn.textContent = '✅ Copiado!';
        setTimeout(() => (copyBtn.textContent = '📋 Copiar JSON'), 1500);
      });
    });

    auditContentContainer.appendChild(card);
  });
}

function updateRecordingUI() {
  if (isRecording) {
    toggleRecordBtn.className = 'btn btn-icon btn-record';
    recordIcon.textContent = '⏺';
    recordStatusText.textContent = 'Grabando';
  } else {
    toggleRecordBtn.className = 'btn btn-icon btn-record paused';
    recordIcon.textContent = '⏸';
    recordStatusText.textContent = 'Pausado';
  }
}

// Helper to extract nested property from data
function extractProp(obj, prop) {
  if (!obj || typeof obj !== 'object') return '';
  if (obj[prop] !== undefined && obj[prop] !== null) return String(obj[prop]);
  if (obj.eventModel && typeof obj.eventModel === 'object') {
    if (obj.eventModel[prop] !== undefined && obj.eventModel[prop] !== null) {
      return String(obj.eventModel[prop]);
    }
  }
  return '';
}

// Export logic based on currently selected & filtered events
function exportToJson() {
  const eventsToExport = getFilteredEvents();
  if (eventsToExport.length === 0) {
    alert('No hay eventos filtrados para exportar.');
    return;
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    filterApplied: {
      selectedEventTypes: Array.from(selectedEventsSet),
      searchTerm: searchTerm || null,
      onlyExplicitEvent: onlyExplicitEvents,
      onlyPii: onlyPii,
      onlyGa4Errors: onlyGa4Errors
    },
    totalEventsExported: eventsToExport.length,
    dataLayerPushes: eventsToExport.map((e) => e.data),
    auditedEvents: eventsToExport
  };

  const nameTag = selectedEventsSet.size === 1 ? `_${Array.from(selectedEventsSet)[0]}` : '';
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dataLayer_audit${nameTag}_(${eventsToExport.length}_eventos).json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToCsv() {
  const eventsToExport = getFilteredEvents();
  if (eventsToExport.length === 0) {
    alert('No hay eventos filtrados para exportar.');
    return;
  }

  const headers = [
    'Index',
    'Timestamp',
    'EventName',
    'GA4_Status',
    'GA4_Issues',
    'Origin',
    'URL',
    'Phone',
    'Email',
    'ContentType',
    'Value',
    'Currency',
    'HasPotentialPII',
    'RawPayloadJSON'
  ];

  const rows = eventsToExport.map((ev, i) => {
    const isPII = hasPotentialPII(ev.data);
    const eventName = getExplicitEventName(ev) || ev.eventName || 'unnamed_push';
    const auditRes = auditSingleEventPayload(eventName, ev.data, activeGtmSpec);
    const issuesSummary = auditRes.issues.map((iss) => `${iss.field}: ${iss.message}`).join(' | ');
    const phone = extractProp(ev.data, 'phone');
    const email = extractProp(ev.data, 'email');
    const contentType = extractProp(ev.data, 'content_type');
    const value = extractProp(ev.data, 'value');
    const currency = extractProp(ev.data, 'currency');
    const jsonClean = JSON.stringify(ev.data).replace(/"/g, '""');

    return [
      i + 1,
      `"${ev.timestamp || ''}"`,
      `"${eventName.replace(/"/g, '""')}"`,
      `"${auditRes.status}"`,
      `"${issuesSummary.replace(/"/g, '""')}"`,
      `"${(ev.origin || '').replace(/"/g, '""')}"`,
      `"${(ev.url || '').replace(/"/g, '""')}"`,
      `"${phone.replace(/"/g, '""')}"`,
      `"${email.replace(/"/g, '""')}"`,
      `"${contentType.replace(/"/g, '""')}"`,
      `"${value.replace(/"/g, '""')}"`,
      `"${currency.replace(/"/g, '""')}"`,
      isPII ? 'SI' : 'NO',
      `"${jsonClean}"`
    ].join(',');
  });

  const nameTag = selectedEventsSet.size === 1 ? `_${Array.from(selectedEventsSet)[0]}` : '';
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dataLayer_audit${nameTag}_(${eventsToExport.length}_eventos).csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Handle uploading a JSON file of events
function handleEventsFileUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const normalized = normalizeUploadedEventsJson(parsed);
      if (normalized.length === 0) {
        alert('No se encontraron eventos válidos en el archivo JSON subido.');
        return;
      }
      importedEvents = normalized;
      importedFileName = file.name;
      selectedEventsSet.clear();
      initializedEventTypes = false;
      updateMultiselectUI();
      renderEvents();
      // Switch automatically to the GA4 Audit view so the user immediately sees the analysis
      switchTab('audit');
    } catch (err) {
      alert('Error al parsear el archivo JSON: ' + err.message);
    }
  };
  reader.readAsText(file, 'utf-8');
}

// Handle uploading a custom GTM Container JSON
function handleGtmFileUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const newSpec = parseGtmContainerJson(parsed);
      const ruleCount = Object.keys(newSpec.eventRules || {}).length;
      if (ruleCount === 0) {
        alert('El archivo JSON no parece contener etiquetas de evento GA4 (gaawe) válidas.');
        return;
      }
      activeGtmSpec = newSpec;
      await chrome.storage.local.set({ [CUSTOM_GTM_KEY]: newSpec });
      updateGtmSubtitleUI();
      renderEvents();
    } catch (err) {
      alert('Error leyendo el contenedor GTM: ' + err.message);
    }
  };
  reader.readAsText(file, 'utf-8');
}

function saveUiPrefs() {
  const prefs = {
    activeTabName,
    onlyGtmEvents,
    onlyExplicitEvents,
    onlyPii,
    onlyGa4Errors,
    consentFilter,
    searchMode,
    searchTerm,
    autoScroll: autoScrollCheck ? autoScrollCheck.checked : true,
    selectedEvents: Array.from(selectedEventsSet),
    unselectedEvents: Array.from(unselectedEventsSet),
    initializedEventTypes,
    auditStatus: auditStatusFilter ? auditStatusFilter.value : 'ALL_GA4',
    auditType: auditTypeFilter ? auditTypeFilter.value : 'ALL',
    auditDeduplicate: auditDeduplicateCheck ? auditDeduplicateCheck.checked : true
  };
  chrome.storage.local.set({ [UI_PREFS_KEY]: prefs });
}

function switchTab(tabName) {
  activeTabName = tabName;
  if (tabName === 'audit') {
    tabAuditBtn.classList.add('active');
    tabLiveBtn.classList.remove('active');
    viewAuditContainer.classList.remove('hidden');
    viewLiveContainer.classList.add('hidden');
    renderAuditView();
  } else {
    tabLiveBtn.classList.add('active');
    tabAuditBtn.classList.remove('active');
    viewLiveContainer.classList.remove('hidden');
    viewAuditContainer.classList.add('hidden');
  }
  saveUiPrefs();
}

// Event Listeners - Navigation & Full Tab
tabLiveBtn.addEventListener('click', () => switchTab('live'));
tabAuditBtn.addEventListener('click', () => switchTab('audit'));

if (openSidePanelBtn) {
  openSidePanelBtn.addEventListener('click', async () => {
    try {
      if (chrome.sidePanel && chrome.sidePanel.open) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
          await chrome.sidePanel.open({ tabId: tab.id });
          window.close(); // Close the floating popup once the side panel is opened
          return;
        }
      }
    } catch (err) {
      console.warn('Could not open side panel programmatically, opening in tab as fallback:', err);
    }
    // Fallback if browser version doesn't support programmatic open
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html?fulltab=1') });
  });
}

if (openAnalyzerTabBtn) {
  openAnalyzerTabBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html?fulltab=1') });
  });
}

// Event Listeners - File Uploads
importEventsBtn.addEventListener('click', () => importEventsInput.click());
auditUploadEventsBtn.addEventListener('click', () => importEventsInput.click());

importEventsInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    handleEventsFileUpload(e.target.files[0]);
    e.target.value = '';
  }
});

auditUseLiveBtn.addEventListener('click', () => {
  importedEvents = null;
  importedFileName = '';
  selectedEventsSet.clear();
  initializedEventTypes = false;
  updateMultiselectUI();
  renderEvents();
});

importGtmBtn.addEventListener('click', () => importGtmInput.click());
importGtmInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    handleGtmFileUpload(e.target.files[0]);
    e.target.value = '';
  }
});

resetGtmBtn.addEventListener('click', async () => {
  activeGtmSpec = DEFAULT_GTM_SPEC;
  await chrome.storage.local.remove(CUSTOM_GTM_KEY);
  updateGtmSubtitleUI();
  renderEvents();
});

auditStatusFilter.addEventListener('change', () => {
  saveUiPrefs();
  renderAuditView();
});
auditTypeFilter.addEventListener('change', () => {
  saveUiPrefs();
  renderAuditView();
});
if (auditDeduplicateCheck) {
  auditDeduplicateCheck.addEventListener('change', () => {
    saveUiPrefs();
    renderAuditView();
  });
}

exportAuditReportBtn.addEventListener('click', () => {
  const report = computeFullAuditReport();
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `informe_auditoria_ga4_${report.publicId}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

if (exportAuditHtmlBtn) {
  exportAuditHtmlBtn.addEventListener('click', () => {
    const report = computeFullAuditReport();
    const isDedup = auditDeduplicateCheck ? auditDeduplicateCheck.checked : true;
    const statusMode = auditStatusFilter.value;
    const selectedType = auditTypeFilter.value;
    const sourceAuditList = isDedup ? report.deduplicatedEvents : report.auditedEvents;

    const filteredAudit = sourceAuditList.filter((a) => {
      if (selectedType !== 'ALL' && a.eventName !== selectedType) return false;
      if (statusMode === 'ALL_GA4') return a.isGa4Tracked;
      if (statusMode === 'PROBLEMS') return a.isGa4Tracked && (a.status === 'ERROR' || a.status === 'WARNING');
      if (statusMode === 'ERROR') return a.isGa4Tracked && a.status === 'ERROR';
      if (statusMode === 'OK') return a.isGa4Tracked && a.status === 'OK';
      if (statusMode === 'UNTRACKED') return !a.isGa4Tracked && !a.isSystemEvent;
      return true;
    });

    if (filteredAudit.length === 0) {
      alert('No hay eventos en el análisis actual para generar el informe.');
      return;
    }

    const genDate = new Date().toLocaleString('es-ES');
    const activeTypes = Object.values(report.byEventType).filter((t) => t.total > 0);

    const summaryRowsHtml = activeTypes
      .map((t) => {
        const rowBadge =
          t.err > 0
            ? '<span class="badge badge-err">Con errores</span>'
            : t.warn > 0
            ? '<span class="badge badge-warn">Con avisos</span>'
            : '<span class="badge badge-ok">Correcto</span>';
        return `
          <tr>
            <td><code class="ev-code">${escapeHtml(t.eventName)}</code></td>
            <td>${escapeHtml(t.tagName)}</td>
            <td class="num">${t.total}</td>
            <td class="num ok-txt">${t.ok}</td>
            <td class="num warn-txt">${isDedup ? t.uniqueWarn : t.warn}</td>
            <td class="num err-txt">${isDedup ? t.uniqueErr : t.err}</td>
            <td>${rowBadge}</td>
            <td class="params-cell">${escapeHtml(t.expectedParams.join(', '))}</td>
          </tr>
        `;
      })
      .join('');

    const cardsHtml = filteredAudit
      .map((a) => {
        const stClass = a.status === 'ERROR' ? 'card-err' : a.status === 'WARNING' ? 'card-warn' : 'card-ok';
        const stBadge =
          a.status === 'ERROR'
            ? `<span class="badge badge-err">❌ Error (${a.issues.length})</span>`
            : a.status === 'WARNING'
            ? `<span class="badge badge-warn">⚠️ Aviso (${a.issues.length})</span>`
            : a.status === 'OK'
            ? '<span class="badge badge-ok">✅ Correcto</span>'
            : '<span class="badge badge-neutral">⚪ Sin etiqueta de GA4</span>';

        const urlsMap = a.detectedUrlsMap || { [a.url || a.origin || 'URL desconocida']: 1 };
        const urlsHtml = Object.keys(urlsMap)
          .map(
            (u) =>
              `<li><a href="${escapeHtml(u)}" target="_blank" rel="noopener">${escapeHtml(u)}</a></li>`
          )
          .join('');

        const issuesHtml =
          a.issues && a.issues.length > 0
            ? `<div class="issues-section">
                <h4>⚠️ Problemas detectados (${a.issues.length})</h4>
                <ul class="issues-list">
                  ${a.issues
                    .map(
                      (iss) =>
                        `<li class="iss-${iss.severity}"><strong>${escapeHtml(iss.field)}:</strong> ${escapeHtml(iss.message)}</li>`
                    )
                    .join('')}
                </ul>
              </div>`
            : '<div class="ok-banner">✓ Todos los parámetros requeridos por la etiqueta de GTM se han enviado correctamente.</div>';

        const paramRowsHtml = (a.paramResults || [])
          .map((p) => {
            const stIcon =
              p.status === 'OK'
                ? '<span class="badge badge-ok">✓ Correcto</span>'
                : p.status === 'OPTIONAL_OMITTED'
                ? '<span class="badge badge-neutral">◌ Opcional (no enviado)</span>'
                : `<span class="badge badge-err">✗ ${escapeHtml(p.status)}</span>`;
            const valStr =
              typeof p.value === 'object' && p.value !== null
                ? JSON.stringify(p.value, null, 2)
                : p.value !== null && p.value !== undefined
                ? String(p.value)
                : '—';
            return `
              <tr>
                <td><strong>${escapeHtml(p.parameter)}</strong></td>
                <td><code>${escapeHtml(p.dlPath || '')}</code></td>
                <td>${stIcon}</td>
                <td><pre class="val-pre">${escapeHtml(valStr)}</pre></td>
              </tr>
            `;
          })
          .join('');

        return `
          <div class="event-card ${stClass}" data-status="${escapeHtml(a.status)}" data-event="${escapeHtml(a.eventName)}">
            <div class="event-card-header">
              <div class="ev-title">
                <span class="ev-idx">#${a.index}</span>
                <span class="ev-name">${escapeHtml(a.eventName)}</span>
                ${stBadge}
              </div>
              <div class="ev-tag">🏷️ Etiqueta de GTM: <strong>${escapeHtml(a.tagName || 'Sin etiqueta')}</strong></div>
            </div>

            <div class="event-card-body">
              <div class="urls-box">
                <strong>🌐 URL donde se ha detectado:</strong>
                <ul class="urls-list">${urlsHtml}</ul>
              </div>

              ${issuesHtml}

              ${
                paramRowsHtml
                  ? `<details class="details-block" ${a.status !== 'OK' ? 'open' : ''}>
                      <summary>📋 Ver tabla de parámetros evaluados (${(a.paramResults || []).length})</summary>
                      <table class="params-table">
                        <thead>
                          <tr>
                            <th>Parámetro de GA4</th>
                            <th>Variable / ruta de dataLayer</th>
                            <th>Estado</th>
                            <th>Valor recibido</th>
                          </tr>
                        </thead>
                        <tbody>${paramRowsHtml}</tbody>
                      </table>
                    </details>`
                  : ''
              }

              <details class="details-block">
                <summary>💻 Ver payload JSON original del dataLayer</summary>
                <pre class="json-pre">${escapeHtml(JSON.stringify(a.payload, null, 2))}</pre>
              </details>
            </div>
          </div>
        `;
      })
      .join('');

    const htmlDoc = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe de auditoría de GA4 — ${escapeHtml(report.containerName)} (${escapeHtml(report.publicId)})</title>
  <style>
    :root {
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --ok: #10b981;
      --ok-bg: #ecfdf5;
      --warn: #f59e0b;
      --warn-bg: #fffbeb;
      --err: #ef4444;
      --err-bg: #fef2f2;
      --blue: #2563eb;
      --orange: #ff6600;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 28px 20px;
    }
    .container { max-width: 1140px; margin: 0 auto; }
    .report-header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #fff;
      padding: 24px 28px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 22px;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
    }
    .report-header h1 { font-size: 21px; font-weight: 700; margin-bottom: 4px; }
    .report-header p { font-size: 13px; color: #cbd5e1; }
    .print-btn {
      background: var(--orange);
      color: #fff;
      border: none;
      padding: 9px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .print-btn:hover { opacity: 0.92; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 14px;
      margin-bottom: 24px;
    }
    .kpi-box {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .kpi-box .val { font-size: 26px; font-weight: 800; display: block; }
    .kpi-box .lbl { font-size: 12px; color: var(--muted); font-weight: 600; text-transform: uppercase; }
    .kpi-ok .val { color: var(--ok); }
    .kpi-warn .val { color: var(--warn); }
    .kpi-err .val { color: var(--err); }
    .section-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .section-title { font-size: 16px; font-weight: 700; margin-bottom: 14px; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); vertical-align: top; }
    th { background: #f1f5f9; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; }
    .num { font-weight: 700; text-align: center; }
    .ok-txt { color: var(--ok); }
    .warn-txt { color: var(--warn); }
    .err-txt { color: var(--err); }
    .ev-code { background: #eff6ff; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-weight: 700; }
    .params-cell { font-size: 12px; color: var(--muted); }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }
    .badge-ok { background: var(--ok-bg); color: #047857; border: 1px solid #a7f3d0; }
    .badge-warn { background: var(--warn-bg); color: #b45309; border: 1px solid #fde68a; }
    .badge-err { background: var(--err-bg); color: #b91c1c; border: 1px solid #fecaca; }
    .badge-neutral { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .filter-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      align-items: center;
    }
    .filter-bar input, .filter-bar select {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      background: #fff;
    }
    .filter-bar input { flex: 1; min-width: 220px; }
    .event-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-left: 5px solid #cbd5e1;
      border-radius: 10px;
      margin-bottom: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .event-card.card-err { border-left-color: var(--err); }
    .event-card.card-warn { border-left-color: var(--warn); }
    .event-card.card-ok { border-left-color: var(--ok); }
    .event-card-header {
      padding: 14px 18px;
      background: #f8fafc;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .ev-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .ev-idx { background: #e2e8f0; color: #334155; font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 5px; }
    .ev-name { font-family: Consolas, monospace; font-size: 15px; font-weight: 700; color: #0f172a; }
    .occ-badge { background: #e0e7ff; color: #3730a3; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
    .ev-tag { font-size: 12px; color: var(--muted); }
    .event-card-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
    .urls-box {
      background: #f1f5f9;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
    }
    .urls-list { margin-top: 4px; padding-left: 18px; }
    .urls-list a { color: var(--blue); text-decoration: none; word-break: break-all; }
    .urls-list a:hover { text-decoration: underline; }
    .occ-pill { background: #fef3c7; color: #92400e; font-weight: 700; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin-left: 4px; }
    .issues-section {
      background: var(--err-bg);
      border: 1px solid #fecaca;
      padding: 12px 16px;
      border-radius: 8px;
    }
    .issues-section h4 { font-size: 13px; color: #991b1b; margin-bottom: 6px; }
    .issues-list { padding-left: 18px; font-size: 13px; color: #7f1d1d; }
    .issues-list li { margin-bottom: 4px; }
    .issues-list li.iss-warning { color: #92400e; }
    .ok-banner {
      background: var(--ok-bg);
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
    }
    .details-block { border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; background: #fafafa; }
    .details-block summary { cursor: pointer; font-weight: 600; font-size: 12px; color: #334155; }
    .params-table { margin-top: 10px; background: #fff; }
    .val-pre, .json-pre {
      font-family: Consolas, monospace;
      font-size: 11px;
      white-space: pre-wrap;
      word-break: break-all;
      background: #0f172a;
      color: #e2e8f0;
      padding: 8px 10px;
      border-radius: 6px;
      margin-top: 6px;
      max-height: 240px;
      overflow-y: auto;
    }
    .val-pre { background: #f8fafc; color: #0f172a; padding: 4px 6px; margin-top: 0; border: 1px solid #e2e8f0; }
    @media print {
      body { background: #fff; padding: 0; }
      .print-btn, .filter-bar { display: none !important; }
      .event-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="report-header">
      <div>
        <h1>📊 Informe de auditoría de eventos de GA4 frente a GTM</h1>
        <p>Contenedor de GTM: <strong>${escapeHtml(report.containerName)} (${escapeHtml(report.publicId)})</strong> &bull; Generado: ${escapeHtml(genDate)} &bull; Modo: ${isDedup ? 'Deduplicado por error' : 'Listado completo'}</p>
      </div>
      <button class="print-btn" onclick="window.print()">🖨️ Imprimir / guardar en PDF</button>
    </header>

    <section class="kpi-grid">
      <div class="kpi-box">
        <span class="val">${report.totalGa4Events}</span>
        <span class="lbl">Eventos de GA4 analizados</span>
      </div>
      <div class="kpi-box kpi-ok">
        <span class="val">${report.okCount}</span>
        <span class="lbl">✅ Eventos correctos</span>
      </div>
      <div class="kpi-box kpi-warn">
        <span class="val">${isDedup ? report.uniqueWarnCount : report.warnCount}</span>
        <span class="lbl">⚠️ Avisos</span>
      </div>
      <div class="kpi-box kpi-err">
        <span class="val">${isDedup ? report.uniqueErrCount : report.errCount}</span>
        <span class="lbl">❌ Errores</span>
      </div>
    </section>

    <section class="section-card">
      <h2 class="section-title">📌 Resumen por tipo de evento (según etiquetas de GTM)</h2>
      <table>
        <thead>
          <tr>
            <th>Evento</th>
            <th>Etiqueta de GTM</th>
            <th style="text-align:center;">Capturados</th>
            <th style="text-align:center;">✅ Correctos</th>
            <th style="text-align:center;">⚠️ Avisos</th>
            <th style="text-align:center;">❌ Errores</th>
            <th>Estado</th>
            <th>Parámetros esperados en GTM</th>
          </tr>
        </thead>
        <tbody>${summaryRowsHtml}</tbody>
      </table>
    </section>

    <section class="section-card">
      <h2 class="section-title">🔎 Detalle de eventos e incidencias (${filteredAudit.length})</h2>
      <div class="filter-bar">
        <input type="text" id="searchBox" placeholder="Filtrar por evento, URL, parámetro o mensaje de error..." oninput="filterCards()">
        <select id="statusSelect" onchange="filterCards()">
          <option value="ALL">Todos los estados</option>
          <option value="ERROR">Solo errores (❌)</option>
          <option value="WARNING">Solo avisos (⚠️)</option>
          <option value="OK">Solo correctos (✅)</option>
        </select>
      </div>
      <div id="cardsWrapper">
        ${cardsHtml}
      </div>
    </section>
  </div>

  <script>
    function filterCards() {
      const q = document.getElementById('searchBox').value.toLowerCase();
      const st = document.getElementById('statusSelect').value;
      document.querySelectorAll('.event-card').forEach((card) => {
        const matchSt = st === 'ALL' || card.dataset.status === st;
        const matchTxt = !q || card.innerText.toLowerCase().includes(q);
        card.style.display = matchSt && matchTxt ? 'block' : 'none';
      });
    }
  </script>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe_auditoria_ga4_${report.publicId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

if (exportAuditCsvBtn) {
  exportAuditCsvBtn.addEventListener('click', () => {
    const report = computeFullAuditReport();
    const isDedup = auditDeduplicateCheck ? auditDeduplicateCheck.checked : true;
    const statusMode = auditStatusFilter.value;
    const selectedType = auditTypeFilter.value;
    const sourceAuditList = isDedup ? report.deduplicatedEvents : report.auditedEvents;

    const filteredAudit = sourceAuditList.filter((a) => {
      if (selectedType !== 'ALL' && a.eventName !== selectedType) return false;
      if (statusMode === 'ALL_GA4') return a.isGa4Tracked;
      if (statusMode === 'PROBLEMS') return a.isGa4Tracked && (a.status === 'ERROR' || a.status === 'WARNING');
      if (statusMode === 'ERROR') return a.isGa4Tracked && a.status === 'ERROR';
      if (statusMode === 'OK') return a.isGa4Tracked && a.status === 'OK';
      if (statusMode === 'UNTRACKED') return !a.isGa4Tracked && !a.isSystemEvent;
      return true;
    });

    if (filteredAudit.length === 0) {
      alert('No hay eventos en el análisis actual para exportar a CSV.');
      return;
    }

    const csvEscape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const headers = [
      'Índice',
      'Fecha y hora',
      'Evento',
      'Etiqueta de GTM',
      'Estado en GA4',
      'URL detectadas',
      'Total de incidencias',
      'Parámetros correctos',
      'Parámetros faltantes o inválidos',
      'Detalle de incidencias',
      'Valores de parámetros de GTM',
      'Payload JSON de muestra'
    ];

    const rows = filteredAudit.map((a) => {
      const okParams = (a.paramResults || [])
        .filter((p) => p.status === 'OK')
        .map((p) => p.parameter)
        .join(', ');

      const failParams = (a.paramResults || [])
        .filter((p) => p.status !== 'OK' && p.status !== 'OPTIONAL_OMITTED')
        .map((p) => `${p.parameter} (${p.status})`)
        .join(', ');

      const issuesDetail = (a.issues || [])
        .map((iss) => `[${iss.severity.toUpperCase()}] ${iss.field}: ${iss.message}`)
        .join(' | ');

      const paramValuesStr = (a.paramResults || [])
        .map((p) => {
          const v =
            typeof p.value === 'object' && p.value !== null
              ? JSON.stringify(p.value)
              : p.value ?? 'NULL';
          return `${p.parameter}=${v}`;
        })
        .join(' ; ');

      const urlsMap = a.detectedUrlsMap || { [a.url || a.origin || 'URL desconocida']: 1 };
      const urlsFormatted = Object.keys(urlsMap).join(' | ');

      return [
        a.index,
        csvEscape(a.timestamp || ''),
        csvEscape(a.eventName),
        csvEscape(a.tagName || 'Sin etiqueta de GA4'),
        csvEscape(a.status),
        csvEscape(urlsFormatted),
        (a.issues || []).length,
        csvEscape(okParams),
        csvEscape(failParams),
        csvEscape(issuesDetail),
        csvEscape(paramValuesStr),
        csvEscape(JSON.stringify(a.payload || {}))
      ].join(',');
    });

    const modeSuffix = isDedup ? '_deduplicado' : '_completo';
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe_auditoria_ga4_${report.publicId}${modeSuffix}_(${filteredAudit.length}_registros).csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Multiselect dropdown toggle & click outside
multiselectTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  multiselectDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!multiselectWrapper.contains(e.target)) {
    multiselectDropdown.classList.add('hidden');
  }
});

selectAllEventsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const stats = getUniqueEventStats();
  unselectedEventsSet.clear();
  Object.keys(stats).forEach((n) => selectedEventsSet.add(n));
  updateMultiselectUI();
  saveUiPrefs();
  renderEvents();
});

deselectAllEventsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const stats = getUniqueEventStats();
  selectedEventsSet.clear();
  Object.keys(stats).forEach((n) => unselectedEventsSet.add(n));
  updateMultiselectUI();
  saveUiPrefs();
  renderEvents();
});

if (selectOnlyGtmEventsBtn) {
  selectOnlyGtmEventsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const stats = getUniqueEventStats();
    const gtmRules = (activeGtmSpec && activeGtmSpec.eventRules) || {};
    selectedEventsSet.clear();
    unselectedEventsSet.clear();
    Object.keys(stats).forEach((n) => {
      if (n in gtmRules) {
        selectedEventsSet.add(n);
      } else {
        unselectedEventsSet.add(n);
      }
    });
    updateMultiselectUI();
    saveUiPrefs();
    renderEvents();
  });
}

excludeGtmEventsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const stats = getUniqueEventStats();
  selectedEventsSet.clear();
  unselectedEventsSet.clear();
  Object.keys(stats).forEach((n) => {
    if (!n.startsWith('gtm.')) {
      selectedEventsSet.add(n);
    } else {
      unselectedEventsSet.add(n);
    }
  });
  updateMultiselectUI();
  saveUiPrefs();
  renderEvents();
});

// Other Filter Listeners
if (onlyGtmEventsCheck) {
  onlyGtmEventsCheck.addEventListener('change', (e) => {
    onlyGtmEvents = e.target.checked;
    selectedEventsSet.clear();
    initializedEventTypes = false;
    updateMultiselectUI();
    saveUiPrefs();
    renderEvents();
  });
}

onlyExplicitEventCheck.addEventListener('change', (e) => {
  onlyExplicitEvents = e.target.checked;
  updateMultiselectUI();
  saveUiPrefs();
  renderEvents();
});

onlyPiiCheck.addEventListener('change', (e) => {
  onlyPii = e.target.checked;
  saveUiPrefs();
  renderEvents();
});

onlyGa4ErrorsCheck.addEventListener('change', (e) => {
  onlyGa4Errors = e.target.checked;
  saveUiPrefs();
  renderEvents();
});

if (consentFilterSelect) {
  consentFilterSelect.addEventListener('change', (e) => {
    consentFilter = e.target.value;
    saveUiPrefs();
    renderEvents();
  });
}

if (autoScrollCheck) {
  autoScrollCheck.addEventListener('change', () => {
    saveUiPrefs();
  });
}

if (searchModeSelect) {
  searchModeSelect.addEventListener('change', (e) => {
    searchMode = e.target.value;
    saveUiPrefs();
    renderEvents();
  });
}

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value.trim();
  saveUiPrefs();
  renderEvents();
});

exportJsonBtn.addEventListener('click', exportToJson);
exportCsvBtn.addEventListener('click', exportToCsv);

clearBtn.addEventListener('click', () => {
  if (importedEvents !== null) {
    if (confirm('¿Deseas cerrar el archivo JSON importado y volver a la captura en vivo?')) {
      importedEvents = null;
      importedFileName = '';
      selectedEventsSet.clear();
      initializedEventTypes = false;
      updateMultiselectUI();
      renderEvents();
    }
    return;
  }

  if (confirm('¿Deseas limpiar todos los eventos capturados en vivo?')) {
    chrome.runtime.sendMessage({ action: 'CLEAR_EVENTS' }, () => {
      liveEvents = [];
      selectedEventsSet.clear();
      unselectedEventsSet.clear();
      initializedEventTypes = false;
      updateMultiselectUI();
      saveUiPrefs();
      renderEvents();
    });
  }
});

toggleRecordBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'TOGGLE_RECORDING' }, (res) => {
    if (res) {
      isRecording = res.recording;
      updateRecordingUI();
    }
  });
});

// React to live changes in chrome.storage
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes[STORAGE_KEY]) {
      liveEvents = changes[STORAGE_KEY].newValue || [];
      if (importedEvents === null) {
        updateMultiselectUI();
        renderEvents();
      }
    }
    if (changes[SETTINGS_KEY]) {
      const settings = changes[SETTINGS_KEY].newValue || { recording: true };
      isRecording = settings.recording;
      updateRecordingUI();
    }
  }
});

// Initial load
async function init() {
  try {
    const data = await chrome.storage.local.get([STORAGE_KEY, SETTINGS_KEY, CUSTOM_GTM_KEY, UI_PREFS_KEY]);
    liveEvents = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
    const settings = data[SETTINGS_KEY] || { recording: true };
    isRecording = settings.recording !== false;

    if (data[CUSTOM_GTM_KEY] && data[CUSTOM_GTM_KEY].eventRules) {
      activeGtmSpec = data[CUSTOM_GTM_KEY];
    }

    const savedPrefs = data[UI_PREFS_KEY];
    if (savedPrefs && typeof savedPrefs === 'object') {
      onlyGtmEvents = Boolean(savedPrefs.onlyGtmEvents);
      onlyExplicitEvents = Boolean(savedPrefs.onlyExplicitEvents);
      onlyPii = Boolean(savedPrefs.onlyPii);
      onlyGa4Errors = Boolean(savedPrefs.onlyGa4Errors);
      consentFilter = savedPrefs.consentFilter || 'ALL';
      searchMode = savedPrefs.searchMode || 'contains';
      searchTerm = savedPrefs.searchTerm || '';

      if (onlyGtmEventsCheck) onlyGtmEventsCheck.checked = onlyGtmEvents;
      if (onlyExplicitEventCheck) onlyExplicitEventCheck.checked = onlyExplicitEvents;
      if (onlyPiiCheck) onlyPiiCheck.checked = onlyPii;
      if (onlyGa4ErrorsCheck) onlyGa4ErrorsCheck.checked = onlyGa4Errors;
      if (consentFilterSelect) consentFilterSelect.value = consentFilter;
      if (searchModeSelect) searchModeSelect.value = searchMode;
      if (searchInput) searchInput.value = searchTerm;
      if (autoScrollCheck && savedPrefs.autoScroll !== undefined) {
        autoScrollCheck.checked = Boolean(savedPrefs.autoScroll);
      }

      if (Array.isArray(savedPrefs.unselectedEvents)) {
        unselectedEventsSet = new Set(savedPrefs.unselectedEvents);
      }
      if (Array.isArray(savedPrefs.selectedEvents) && savedPrefs.selectedEvents.length > 0) {
        selectedEventsSet = new Set(savedPrefs.selectedEvents);
        initializedEventTypes = Boolean(savedPrefs.initializedEventTypes);
      }

      if (auditStatusFilter && savedPrefs.auditStatus) {
        auditStatusFilter.value = savedPrefs.auditStatus;
      }
      if (auditDeduplicateCheck && savedPrefs.auditDeduplicate !== undefined) {
        auditDeduplicateCheck.checked = Boolean(savedPrefs.auditDeduplicate);
      }
      if (savedPrefs.activeTabName === 'audit') {
        activeTabName = 'audit';
      }
    } else {
      if (onlyGtmEventsCheck) onlyGtmEvents = onlyGtmEventsCheck.checked;
      if (onlyExplicitEventCheck) onlyExplicitEvents = onlyExplicitEventCheck.checked;
      if (onlyPiiCheck) onlyPii = onlyPiiCheck.checked;
      if (onlyGa4ErrorsCheck) onlyGa4Errors = onlyGa4ErrorsCheck.checked;
    }

    updateGtmSubtitleUI();
    updateRecordingUI();
    updateMultiselectUI();
    renderEvents();

    if (savedPrefs && auditTypeFilter && savedPrefs.auditType) {
      const hasOpt = Array.from(auditTypeFilter.options).some((o) => o.value === savedPrefs.auditType);
      if (hasOpt) {
        auditTypeFilter.value = savedPrefs.auditType;
        renderAuditView();
      }
    }

    if (activeTabName === 'audit') {
      switchTab('audit');
    }
  } catch (err) {
    console.error('[DataLayer Auditor Popup] Init error:', err);
  }
}

init();
