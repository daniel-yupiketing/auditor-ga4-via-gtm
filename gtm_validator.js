// gtm_validator.js - Motor de validación de eventos GA4 según contenedor GTM
// Incluye las reglas extraídas de GTM-NK9G27ZB_workspace2.json por defecto y permite cargar cualquier JSON de GTM.

const DEFAULT_GTM_SPEC = {
  containerName: "tarifasfibramovil.es",
  publicId: "GTM-NK9G27ZB",
  exportTime: "2026-10-26 05:09:12",
  eventRules: {
    "services": {
      eventName: "services",
      tagName: "GA4 - Event - web_error o services",
      parameters: [
        { parameter: "content_type", gtmValue: "{{DL_GA4_eventModel.content_type}}", dlPath: "eventModel.content_type", isComputed: false, optional: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: true },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: true }
      ],
      userProperties: []
    },
    "funnel_step": {
      eventName: "funnel_step",
      tagName: "GA4 - Event - web_error o services",
      parameters: [
        { parameter: "content_type", gtmValue: "{{DL_GA4_eventModel.content_type}}", dlPath: "eventModel.content_type", isComputed: false, optional: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: true },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: true }
      ],
      userProperties: []
    },
    "web_error": {
      eventName: "web_error",
      tagName: "GA4 - Event - web_error o services",
      parameters: [
        { parameter: "content_type", gtmValue: "{{DL_GA4_eventModel.content_type}}", dlPath: "eventModel.content_type", isComputed: false, optional: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: true },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: true }
      ],
      userProperties: []
    },
    "impression": {
      eventName: "impression",
      tagName: "GA4 - Event - web_error o services",
      parameters: [
        { parameter: "content_type", gtmValue: "{{DL_GA4_eventModel.content_type}}", dlPath: "eventModel.content_type", isComputed: false, optional: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: true },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: true }
      ],
      userProperties: []
    },
    "login": {
      eventName: "login",
      tagName: "GA4 - Event - login",
      parameters: [
        { parameter: "method", gtmValue: "{{DL_GA4_eventModel.method}}", dlPath: "eventModel.method", isComputed: false, optional: false },
        { parameter: "crm_id", gtmValue: "{{DL_GA4_eventModel.crm_id}}", dlPath: "eventModel.crm_id", isComputed: false, optional: false },
        { parameter: "content_type", gtmValue: "{{DL_GA4_eventModel.content_type}}", dlPath: "eventModel.content_type", isComputed: false, optional: false }
      ],
      userProperties: [
        { name: "u_crm_id", gtmValue: "{{DL_GA4_eventModel.crm_id}}", dlPath: "eventModel.crm_id" }
      ]
    },
    "begin_checkout": {
      eventName: "begin_checkout",
      tagName: "GA4 - Event - begin_checkout",
      parameters: [
        { parameter: "currency", gtmValue: "{{DL_GA4_eventModel.currency}}", dlPath: "eventModel.currency", isComputed: false, optional: false },
        { parameter: "value", gtmValue: "{{DL_GA4_eventModel.value}}", dlPath: "eventModel.value", isComputed: false, optional: false },
        { parameter: "coupon", gtmValue: "{{DL_GA4_eventModel.coupon}}", dlPath: "eventModel.coupon", isComputed: false, optional: true },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: false }
      ],
      userProperties: []
    },
    "view_promotion": {
      eventName: "view_promotion",
      tagName: "GA4 - event - view_promotion o select_promotion",
      parameters: [
        { parameter: "creative_name", gtmValue: "{{DL_GA4_eventModel.creative_name}}", dlPath: "eventModel.creative_name", isComputed: false, optional: false },
        { parameter: "creative_slot", gtmValue: "{{DL_GA4_eventModel.creative_slot}}", dlPath: "eventModel.creative_slot", isComputed: false, optional: false },
        { parameter: "promotion_id", gtmValue: "{{DL_GA4_eventModel.promotion_id}}", dlPath: "eventModel.promotion_id", isComputed: false, optional: false },
        { parameter: "promotion_name", gtmValue: "{{DL_GA4_eventModel.promotion_name}}", dlPath: "eventModel.promotion_name", isComputed: false, optional: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: false }
      ],
      userProperties: []
    },
    "select_promotion": {
      eventName: "select_promotion",
      tagName: "GA4 - event - view_promotion o select_promotion",
      parameters: [
        { parameter: "creative_name", gtmValue: "{{DL_GA4_eventModel.creative_name}}", dlPath: "eventModel.creative_name", isComputed: false, optional: false },
        { parameter: "creative_slot", gtmValue: "{{DL_GA4_eventModel.creative_slot}}", dlPath: "eventModel.creative_slot", isComputed: false, optional: false },
        { parameter: "promotion_id", gtmValue: "{{DL_GA4_eventModel.promotion_id}}", dlPath: "eventModel.promotion_id", isComputed: false, optional: false },
        { parameter: "promotion_name", gtmValue: "{{DL_GA4_eventModel.promotion_name}}", dlPath: "eventModel.promotion_name", isComputed: false, optional: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: false }
      ],
      userProperties: []
    },
    "logout": {
      eventName: "logout",
      tagName: "GA4 - Event - logout o sign_up",
      parameters: [
        { parameter: "method", gtmValue: "{{DL_GA4_eventModel.method}}", dlPath: "eventModel.method", isComputed: false, optional: true },
        { parameter: "content_type", gtmValue: "{{DL_GA4_eventModel.content_type}}", dlPath: "eventModel.content_type", isComputed: false, optional: false }
      ],
      userProperties: []
    },
    "sign_up": {
      eventName: "sign_up",
      tagName: "GA4 - Event - logout o sign_up",
      parameters: [
        { parameter: "method", gtmValue: "{{DL_GA4_eventModel.method}}", dlPath: "eventModel.method", isComputed: false, optional: false },
        { parameter: "content_type", gtmValue: "{{DL_GA4_eventModel.content_type}}", dlPath: "eventModel.content_type", isComputed: false, optional: false }
      ],
      userProperties: []
    },
    "add_shipping_info": {
      eventName: "add_shipping_info",
      tagName: "GA4 - Event - add_shipping_info",
      parameters: [
        { parameter: "currency", gtmValue: "{{DL_GA4_eventModel.currency}}", dlPath: "eventModel.currency", isComputed: false, optional: false },
        { parameter: "value", gtmValue: "{{DL_GA4_eventModel.value}}", dlPath: "eventModel.value", isComputed: false, optional: false },
        { parameter: "coupon", gtmValue: "{{DL_GA4_eventModel.coupon}}", dlPath: "eventModel.coupon", isComputed: false, optional: true },
        { parameter: "shipping_tier", gtmValue: "{{DL_GA4_eventModel.shipping_tier}}", dlPath: "eventModel.shipping_tier", isComputed: false, optional: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: false }
      ],
      userProperties: []
    },
    "view_item_list": {
      eventName: "view_item_list",
      tagName: "GA4 - event - view_item_list o select_item",
      parameters: [
        { parameter: "item_list_id", gtmValue: "{{DL_GA4_eventModel.item_list_id}}", dlPath: "eventModel.item_list_id", isComputed: false, optional: false },
        { parameter: "item_list_name", gtmValue: "{{DL_GA4_eventModel.item_list_name}}", dlPath: "eventModel.item_list_name", isComputed: false, optional: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: false }
      ],
      userProperties: []
    },
    "select_item": {
      eventName: "select_item",
      tagName: "GA4 - event - view_item_list o select_item",
      parameters: [
        { parameter: "item_list_id", gtmValue: "{{DL_GA4_eventModel.item_list_id}}", dlPath: "eventModel.item_list_id", isComputed: false, optional: false },
        { parameter: "item_list_name", gtmValue: "{{DL_GA4_eventModel.item_list_name}}", dlPath: "eventModel.item_list_name", isComputed: false, optional: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: false }
      ],
      userProperties: []
    },
    "generate_lead": {
      eventName: "generate_lead",
      tagName: "GA4 - Event - generate_lead",
      parameters: [
        { parameter: "currency", gtmValue: "{{DL_GA4_eventModel.currency}}", dlPath: "eventModel.currency", isComputed: false, optional: false },
        { parameter: "value", gtmValue: "{{DL_GA4_eventModel.value}}", dlPath: "eventModel.value", isComputed: false, optional: false },
        { parameter: "content_type", gtmValue: "{{DL_GA4_eventModel.content_type}}", dlPath: "eventModel.content_type", isComputed: false, optional: false }
      ],
      userProperties: []
    },
    "purchase": {
      eventName: "purchase",
      tagName: "GA4 - Event - purchase",
      parameters: [
        { parameter: "currency", gtmValue: "{{DL_GA4_eventModel.currency}}", dlPath: "eventModel.currency", isComputed: false, optional: false },
        { parameter: "transaction_id", gtmValue: "{{DL_GA4_eventModel.transaction_id}}", dlPath: "eventModel.transaction_id", isComputed: false, optional: false },
        { parameter: "value", gtmValue: "{{DL_GA4_eventModel.value}}", dlPath: "eventModel.value", isComputed: false, optional: false },
        { parameter: "coupon", gtmValue: "{{DL_GA4_eventModel.coupon}}", dlPath: "eventModel.coupon", isComputed: false, optional: true },
        { parameter: "shipping", gtmValue: "{{DL_GA4_eventModel.shipping}}", dlPath: "eventModel.shipping", isComputed: false, optional: false },
        { parameter: "tax", gtmValue: "{{DL_GA4_eventModel.tax}}", dlPath: "eventModel.tax", isComputed: false, optional: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: false }
      ],
      userProperties: []
    },
    "add_payment_info": {
      eventName: "add_payment_info",
      tagName: "GA4 - Event - add_payment_info",
      parameters: [
        { parameter: "currency", gtmValue: "{{DL_GA4_eventModel.currency}}", dlPath: "eventModel.currency", isComputed: false, optional: false },
        { parameter: "value", gtmValue: "{{DL_GA4_eventModel.value}}", dlPath: "eventModel.value", isComputed: false, optional: false },
        { parameter: "coupon", gtmValue: "{{DL_GA4_eventModel.coupon}}", dlPath: "eventModel.coupon", isComputed: false, optional: true },
        { parameter: "payment_type", gtmValue: "{{DL_GA4_eventModel.payment_type}}", dlPath: "eventModel.payment_type", isComputed: false, optional: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false, optional: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true, optional: false }
      ],
      userProperties: []
    },
    "view_item": {
      eventName: "view_item",
      tagName: "GA4 - Event - view_item o add_to_cart",
      parameters: [
        { parameter: "currency", gtmValue: "{{DL_GA4_eventModel.currency}}", dlPath: "eventModel.currency", isComputed: false },
        { parameter: "value", gtmValue: "{{DL_GA4_eventModel.value}}", dlPath: "eventModel.value", isComputed: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true }
      ],
      userProperties: []
    },
    "add_to_cart": {
      eventName: "add_to_cart",
      tagName: "GA4 - Event - view_item o add_to_cart",
      parameters: [
        { parameter: "currency", gtmValue: "{{DL_GA4_eventModel.currency}}", dlPath: "eventModel.currency", isComputed: false },
        { parameter: "value", gtmValue: "{{DL_GA4_eventModel.value}}", dlPath: "eventModel.value", isComputed: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true }
      ],
      userProperties: []
    },
    "remove_from_cart": {
      eventName: "remove_from_cart",
      tagName: "GA4 - Event - view_item o add_to_cart",
      parameters: [
        { parameter: "currency", gtmValue: "{{DL_GA4_eventModel.currency}}", dlPath: "eventModel.currency", isComputed: false },
        { parameter: "value", gtmValue: "{{DL_GA4_eventModel.value}}", dlPath: "eventModel.value", isComputed: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true }
      ],
      userProperties: []
    },
    "view_cart": {
      eventName: "view_cart",
      tagName: "GA4 - Event - view_item o add_to_cart",
      parameters: [
        { parameter: "currency", gtmValue: "{{DL_GA4_eventModel.currency}}", dlPath: "eventModel.currency", isComputed: false },
        { parameter: "value", gtmValue: "{{DL_GA4_eventModel.value}}", dlPath: "eventModel.value", isComputed: false },
        { parameter: "items", gtmValue: "{{DL_GA4_eventModel.items}}", dlPath: "eventModel.items", isComputed: false },
        { parameter: "items_names", gtmValue: "{{DL_GA4_Items_Names_Concats}}", dlPath: null, isComputed: true }
      ],
      userProperties: []
    }
  }
};

const REQUIRED_ITEM_FIELDS = [
  "item_id",
  "item_name",
  "price",
  "quantity",
  "currency"
];

const WARNING_ITEM_FIELDS = new Set([
  "price",
  "quantity",
  "currency"
]);

const IGNORED_SYSTEM_EVENTS = new Set([
  "gtm.js",
  "gtm.dom",
  "gtm.load",
  "gtm.click",
  "gtm.linkClick",
  "gtm.scrollDepth",
  "gtm.formSubmit",
  "gtm.historyChange",
  "gtm.timer",
  "OneTrustLoaded",
  "OneTrustGroupsUpdated",
  "OptanonLoaded",
  "trackOptanonEvent",
  "queue_processed",
  "unnamed_push",
  "data_object",
  "array_push"
]);

// Mapa de parámetros opcionales aplicable ÚNICAMENTE a los eventos personalizados (no recomendados por Google)
// En todos los eventos recomendados por Google (login, sign_up, view_item_list, select_item, view_promotion,
// select_promotion, view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, add_shipping_info,
// add_payment_info, purchase, generate_lead) TODOS los parámetros configurados en la etiqueta GTM son obligatorios.
const OPTIONAL_PARAMS_BY_EVENT = {
  web_error: new Set(["items", "items_names"]),
  impression: new Set(["items", "items_names"]),
  funnel_step: new Set(["items", "items_names"]),
  services: new Set(["items", "items_names"]),
  logout: new Set(["method"]),
  begin_checkout: new Set(["coupon"]),
  add_shipping_info: new Set(["coupon"]),
  add_payment_info: new Set(["coupon"]),
  purchase: new Set(["coupon"])
};

function isParamOptionalForEvent(evName, paramName) {
  if (paramName === "coupon") return true;
  const optSet = OPTIONAL_PARAMS_BY_EVENT[evName];
  return Boolean(optSet && optSet.has(paramName));
}

/**
 * Parsea dinámicamente un JSON exportado de Google Tag Manager y construye el objeto gtmSpec.
 */
function parseGtmContainerJson(gtmData) {
  const cv = gtmData.containerVersion || gtmData;
  const containerInfo = cv.container || {};
  const tags = cv.tag || [];
  const triggersMap = {};
  (cv.trigger || []).forEach((tr) => {
    if (tr.triggerId) triggersMap[tr.triggerId] = tr;
  });

  const varResolution = {};
  (cv.variable || []).forEach((v) => {
    if (!v.name) return;
    const params = {};
    (v.parameter || []).forEach((p) => {
      if (p.key) params[p.key] = p.value;
    });
    if (v.type === "v") {
      varResolution[v.name] = {
        type: "datalayer",
        dlPath: params.name || "",
        variableName: v.name
      };
    } else if (v.type === "jsm") {
      varResolution[v.name] = {
        type: "custom_js",
        javascript: params.javascript || "",
        variableName: v.name
      };
    } else {
      varResolution[v.name] = {
        type: v.type,
        variableName: v.name
      };
    }
  });

  const eventRules = {};

  tags.forEach((tag) => {
    if (tag.type !== "gaawe") return;
    const tagName = tag.name || "Unnamed GA4 Tag";
    const firingIds = tag.firingTriggerId || [];
    const eventParams = [];
    const userProps = [];

    (tag.parameter || []).forEach((p) => {
      if (p.key === "eventSettingsTable") {
        (p.list || []).forEach((item) => {
          const m = {};
          (item.map || []).forEach((x) => {
            if (x.key) m[x.key] = x.value || "";
          });
          const paramName = m.parameter || "";
          const paramValRef = (m.parameterValue || "").trim();
          const varMatch = paramValRef.match(/^\{\{([^}]+)\}\}$/);
          const resolved = varMatch ? varResolution[varMatch[1]] || {} : {};
          const isComputed = resolved.type === "custom_js";
          const dlPath = resolved.dlPath || (isComputed ? null : `eventModel.${paramName}`);
          eventParams.push({
            parameter: paramName,
            gtmValue: paramValRef,
            dlPath: dlPath,
            isComputed: isComputed
          });
        });
      } else if (p.key === "userProperties") {
        (p.list || []).forEach((item) => {
          const m = {};
          (item.map || []).forEach((x) => {
            if (x.key) m[x.key] = x.value || "";
          });
          const propName = m.name || "";
          const propValRef = (m.value || "").trim();
          const varMatch = propValRef.match(/^\{\{([^}]+)\}\}$/);
          const resolved = varMatch ? varResolution[varMatch[1]] || {} : {};
          userProps.push({
            name: propName,
            gtmValue: propValRef,
            dlPath: resolved.dlPath || `eventModel.${propName}`
          });
        });
      }
    });

    const triggeredEvents = [];
    firingIds.forEach((trId) => {
      const tr = triggersMap[trId] || {};
      if (tr.type === "CUSTOM_EVENT") {
        (tr.customEventFilter || []).forEach((f) => {
          const fp = {};
          (f.parameter || []).forEach((x) => {
            if (x.key) fp[x.key] = x.value || "";
          });
          if (fp.arg0 === "{{_event}}" && fp.arg1) {
            triggeredEvents.push(fp.arg1);
          }
        });
      }
    });

    triggeredEvents.forEach((evName) => {
      const tailoredParams = eventParams.map((ep) => ({
        ...ep,
        optional: isParamOptionalForEvent(evName, ep.parameter)
      }));
      eventRules[evName] = {
        eventName: evName,
        tagName: tagName,
        parameters: tailoredParams,
        userProperties: userProps
      };
    });
  });

  return {
    containerName: containerInfo.name || "Contenedor personalizado",
    publicId: containerInfo.publicId || "GTM-CUSTOM",
    exportTime: gtmData.exportTime || "",
    eventRules: eventRules
  };
}

function getNestedValue(data, path) {
  if (!path || !data || typeof data !== "object") return { exists: false, value: undefined };
  const parts = path.split(".");
  let curr = data;
  for (const p of parts) {
    if (curr && typeof curr === "object" && p in curr) {
      curr = curr[p];
    } else {
      return { exists: false, value: undefined };
    }
  }
  return { exists: true, value: curr };
}

function checkInvalidValue(val) {
  if (val === null || val === undefined) {
    return { invalid: true, reason: "Valor nulo o undefined" };
  }
  if (typeof val === "string") {
    const s = val.trim();
    if (s === "") return { invalid: true, reason: 'Cadena vacía ("")' };
    if (["undefined", "null", "nan"].includes(s.toLowerCase())) {
      return { invalid: true, reason: `Valor literal inválido ('${s}')` };
    }
  }
  if (Array.isArray(val) && val.length === 0) {
    return { invalid: true, reason: "Array vacío ([])" };
  }
  if (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0) {
    return { invalid: true, reason: "Objeto vacío ({})" };
  }
  return { invalid: false, reason: "" };
}

function validateItemsArray(items) {
  const issues = [];
  if (!Array.isArray(items)) {
    issues.push({
      severity: "error",
      field: "eventModel.items",
      message: `'items' debe ser un array, pero se recibió ${typeof items}.`
    });
    return issues;
  }
  if (items.length === 0) {
    issues.push({
      severity: "error",
      field: "eventModel.items",
      message: "El array 'items' está vacío ([]). Debe contener al menos 1 elemento."
    });
    return issues;
  }

  items.forEach((item, idx) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      issues.push({
        severity: "error",
        field: `eventModel.items[${idx}]`,
        message: `El elemento items[${idx}] no es un objeto válido.`
      });
      return;
    }

    REQUIRED_ITEM_FIELDS.forEach((reqField) => {
      const isOptionalWarn = WARNING_ITEM_FIELDS.has(reqField);
      if (!(reqField in item)) {
        issues.push({
          severity: isOptionalWarn ? "warning" : "error",
          field: `eventModel.items[${idx}].${reqField}`,
          message: `Falta '${reqField}' en items[${idx}].`
        });
      } else {
        const val = item[reqField];
        const inv = checkInvalidValue(val);
        if (inv.invalid) {
          issues.push({
            severity: isOptionalWarn ? "warning" : "error",
            field: `eventModel.items[${idx}].${reqField}`,
            message: `'${reqField}' en items[${idx}] inválido: ${inv.reason}.`
          });
        } else if (reqField === "price" && typeof val === "string") {
          const num = Number(val.replace(",", "."));
          if (Number.isNaN(num)) {
            issues.push({
              severity: "warning",
              field: `eventModel.items[${idx}].price`,
              message: `'price' en items[${idx}] no es un número válido ('${val}').`
            });
          } else {
            issues.push({
              severity: "warning",
              field: `eventModel.items[${idx}].price`,
              message: `'price' en items[${idx}] se envía como string ('${val}') en lugar de número.`
            });
          }
        }
      }
    });
  });

  return issues;
}

/**
 * Audita un único evento contra el gtmSpec activo.
 */
function auditSingleEventPayload(evName, payload, gtmSpec = DEFAULT_GTM_SPEC) {
  const rules = (gtmSpec && gtmSpec.eventRules) || DEFAULT_GTM_SPEC.eventRules;
  const cleanName = String(evName || (payload && payload.event) || "unnamed_push");

  if (!(cleanName in rules)) {
    const isSystem = IGNORED_SYSTEM_EVENTS.has(cleanName) || cleanName.startsWith("gtm.");
    return {
      eventName: cleanName,
      isGa4Tracked: false,
      isSystemEvent: isSystem,
      tagName: null,
      status: isSystem ? "IGNORED" : "UNTRACKED",
      issues: isSystem
        ? []
        : [
            {
              severity: "info",
              field: "event",
              message: `El evento '${cleanName}' no dispara ninguna etiqueta GA4 en ${gtmSpec.publicId}.`
            }
          ],
      paramResults: []
    };
  }

  const rule = rules[cleanName];
  const issues = [];
  const paramResults = [];

  const usesEventModel = rule.parameters.some((p) => !p.isComputed && p.dlPath && p.dlPath.startsWith("eventModel."));
  if (usesEventModel && (!payload || typeof payload !== "object" || !("eventModel" in payload))) {
    if (payload && typeof payload === "object" && "ecommerce" in payload) {
      issues.push({
        severity: "error",
        field: "eventModel",
        message: "Falta 'eventModel' (se encontró 'ecommerce', pero GTM lee de 'eventModel.*')."
      });
    } else {
      issues.push({
        severity: "error",
        field: "eventModel",
        message: "Falta el objeto 'eventModel' requerido por las variables de GTM."
      });
    }
  }

  rule.parameters.forEach((p) => {
    const pName = p.parameter;
    const isOptional = isParamOptionalForEvent(cleanName, pName);

    if (p.isComputed) {
      if ((p.gtmValue || "").includes("DL_GA4_Items_Names_Concats")) {
        const itemsRes = getNestedValue(payload, "eventModel.items");
        if (itemsRes.exists && Array.isArray(itemsRes.value)) {
          const names = itemsRes.value
            .filter((it) => it && typeof it === "object" && it.item_name !== undefined && String(it.item_name).trim() !== "")
            .map((it) => String(it.item_name));
          const concatStr = names.join(" + ");
          if (!concatStr) {
            issues.push({
              severity: "error",
              field: pName,
              message: `El parámetro calculado '${pName}' quedará vacío porque ningún item tiene 'item_name'.`
            });
            paramResults.push({
              parameter: pName,
              dlPath: "JS: items[*].item_name",
              status: "ERROR",
              value: "",
              optional: isOptional
            });
          } else {
            paramResults.push({
              parameter: pName,
              dlPath: "JS: items[*].item_name",
              status: "OK",
              value: concatStr,
              optional: isOptional
            });
          }
        } else if (isOptional) {
          paramResults.push({
            parameter: pName,
            dlPath: "JS: items[*].item_name",
            status: "OPTIONAL_OMITTED",
            value: null,
            optional: true
          });
        } else {
          issues.push({
            severity: "error",
            field: pName,
            message: `No se puede calcular '${pName}' porque falta 'eventModel.items'.`
          });
          paramResults.push({
            parameter: pName,
            dlPath: "JS: items[*].item_name",
            status: "MISSING",
            value: null,
            optional: false
          });
        }
      }
      return;
    }

    const res = getNestedValue(payload, p.dlPath);
    if (!res.exists) {
      if (isOptional) {
        paramResults.push({
          parameter: pName,
          dlPath: p.dlPath,
          status: "OPTIONAL_OMITTED",
          value: null,
          optional: true
        });
        return;
      }

      const altKey = (p.dlPath || "").split(".").pop();
      let hint = "";
      if (payload && typeof payload === "object" && altKey in payload) {
        hint = ` (Está en la raíz del evento, pero GTM busca en '${p.dlPath}')`;
      } else if (payload && payload.ecommerce && typeof payload.ecommerce === "object" && altKey in payload.ecommerce) {
        hint = ` (Está en 'ecommerce.${altKey}', pero GTM busca en '${p.dlPath}')`;
      }
      issues.push({
        severity: "error",
        field: p.dlPath,
        message: `Falta el parámetro '${pName}' (esperado en '${p.dlPath}')${hint}.`
      });
      paramResults.push({
        parameter: pName,
        dlPath: p.dlPath,
        status: "MISSING",
        value: null,
        optional: false
      });
    } else {
      const inv = checkInvalidValue(res.value);
      if (inv.invalid) {
        // Si es un parámetro opcional como coupon: "" (cadena vacía), lo tratamos como aviso leve o lo permitimos si no es "undefined"
        const isLiteralUndefined = typeof res.value === "string" && ["undefined", "null", "nan"].includes(res.value.trim().toLowerCase());
        if (isOptional && !isLiteralUndefined) {
          paramResults.push({
            parameter: pName,
            dlPath: p.dlPath,
            status: "OPTIONAL_OMITTED",
            value: res.value,
            optional: true
          });
        } else {
          issues.push({
            severity: "error",
            field: p.dlPath,
            message: `Parámetro '${pName}' ('${p.dlPath}') inválido: ${inv.reason}.`
          });
          paramResults.push({
            parameter: pName,
            dlPath: p.dlPath,
            status: "INVALID",
            value: res.value,
            optional: isOptional
          });
        }
      } else {
        paramResults.push({
          parameter: pName,
          dlPath: p.dlPath,
          status: "OK",
          value: res.value,
          optional: isOptional
        });
        if (pName === "items") {
          const itemIssues = validateItemsArray(res.value);
          issues.push(...itemIssues);
        }
      }
    }
  });

  // Avisar de propiedades en eventModel que no están mapeadas en la etiqueta GTM
  const expectedPaths = new Set(
    rule.parameters.filter((p) => !p.isComputed && p.dlPath).map((p) => p.dlPath)
  );
  if (payload && payload.eventModel && typeof payload.eventModel === "object" && !Array.isArray(payload.eventModel)) {
    Object.keys(payload.eventModel).forEach((k) => {
      const fullPath = `eventModel.${k}`;
      if (!expectedPaths.has(fullPath)) {
        issues.push({
          severity: "warning",
          field: fullPath,
          message: `Se envía '${fullPath}' en el dataLayer, pero la etiqueta '${rule.tagName}' no lo recoge.`
        });
      }
    });
  }

  const hasErrors = issues.some((i) => i.severity === "error");
  const hasWarnings = issues.some((i) => i.severity === "warning");

  return {
    eventName: cleanName,
    isGa4Tracked: true,
    isSystemEvent: false,
    tagName: rule.tagName,
    status: hasErrors ? "ERROR" : hasWarnings ? "WARNING" : "OK",
    issues: issues,
    paramResults: paramResults
  };
}

/**
 * Extrae una lista normalizada de eventos desde cualquier JSON subido:
 * - Exportación de DataLayer Auditor ({ auditedEvents, dataLayerPushes })
 * - Array directo de objetos dataLayer ([ { event, eventModel } ])
 * - Diccionarios de capturas de QA
 */
function normalizeUploadedEventsJson(rawJson) {
  const normalized = [];
  if (!rawJson) return normalized;

  if (Array.isArray(rawJson)) {
    rawJson.forEach((item) => {
      if (!item || typeof item !== "object") return;
      if ("data" in item && typeof item.data === "object" && ("timestamp" in item || "eventName" in item)) {
        const payload = item.data;
        const evName = item.explicitEvent || (payload && payload.event) || item.eventName || "unnamed_push";
        normalized.push({
          timestamp: item.timestamp || new Date().toISOString(),
          url: item.url || "Archivo importado",
          origin: item.origin || "imported_json",
          eventName: String(evName),
          explicitEvent: payload && payload.event ? String(payload.event) : null,
          hasEventKey: Boolean(payload && typeof payload === "object" && "event" in payload),
          data: payload
        });
      } else if ("events" in item && Array.isArray(item.events) && !("event" in item)) {
        item.events.forEach((subEv) => {
          if (subEv && typeof subEv === "object") {
            normalized.push({
              timestamp: new Date().toISOString(),
              url: item.element || "Archivo importado",
              origin: "imported_json",
              eventName: String(subEv.event || "unnamed_push"),
              explicitEvent: subEv.event ? String(subEv.event) : null,
              hasEventKey: "event" in subEv,
              data: subEv
            });
          }
        });
      } else {
        normalized.push({
          timestamp: new Date().toISOString(),
          url: "Archivo importado",
          origin: "imported_json",
          eventName: String(item.event || "unnamed_push"),
          explicitEvent: item.event ? String(item.event) : null,
          hasEventKey: "event" in item,
          data: item
        });
      }
    });
    return normalized;
  }

  if (typeof rawJson === "object") {
    if (Array.isArray(rawJson.auditedEvents)) {
      return normalizeUploadedEventsJson(rawJson.auditedEvents);
    }
    if (Array.isArray(rawJson.dataLayerPushes)) {
      return normalizeUploadedEventsJson(rawJson.dataLayerPushes);
    }
    if (Array.isArray(rawJson.events)) {
      return normalizeUploadedEventsJson(rawJson.events);
    }
    if ("event" in rawJson || "eventModel" in rawJson) {
      return normalizeUploadedEventsJson([rawJson]);
    }
    // Diccionario con múltiples arrays (ej. clicks_verification_clean.json)
    Object.keys(rawJson).forEach((key) => {
      if (Array.isArray(rawJson[key])) {
        const subItems = normalizeUploadedEventsJson(rawJson[key]);
        subItems.forEach((si) => {
          if (si.url === "Archivo importado") si.url = `Sección: ${key}`;
          normalized.push(si);
        });
      }
    });
  }

  return normalized;
}
