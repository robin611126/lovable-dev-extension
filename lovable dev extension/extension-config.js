(function(){
  function _d(a, k) {
    var r = '';
    for (var i = 0; i < a.length; i++) {
      r += String.fromCharCode(a[i] ^ k.charCodeAt(i % k.length));
    }
    return r;
  }

  var _k = '4eF8aD2cB9';
  var _b = [0x5c,0x11,0x32,0x48,0x12,0x7e,0x1d,0x4c,0x2e,0x56,0x42,0x4b,0x36,0x57,0x16,0x21,0x40,0x8,0x2b,0x4d,0x47,0x4b,0x28,0x5d,0x15];
  var _k2 = [0x44,0xe,0x19,0x54,0xe,0x32,0x6d,0x6,0x3a,0x4d,0x6b,0x4,0x7e,0x5e,0x52,0x27,0x0,0x52,0x27,0x0,0x50,0x51,0x24,0xf,0x7,0x74,0x57,0x55,0x23,0xb,0x57,0x50,0x22,0x0,0x3,0x75,0x57,0x57,0x24,0xe,0x55,0x55,0x25];
  var _w = [0x5c,0x11,0x32,0x48,0x12,0x7e,0x1d,0x4c,0x35,0x51,0x55,0x11,0x35,0x59,0x11,0x34,0x1c,0x0,0x2d,0x54,0x1b,0x6,0x2e,0x59,0xf,0x2a,0x57,0xf,0x6d,0x9,0x4,0x57,0x7f,0x6e,0x0,0x2c,0x51,0x25,0x29,0x72,0x4,0x24,0x21,0x6f,0x53,0x30,0x7c,0x30,0x2e,0x60,0x52,0x56,0x32];

  var _e = {
    b: _d(_b, _k),
    k: _d(_k2, _k),
    w: _d(_w, _k)
  };

  var _c = {};
  function _f(n, v) {
    _c[n] = v;
    try {
      Object.defineProperty(window, n, { configurable: false, writable: false, value: v });
    } catch(e) {}
  }

  // 🌐 PRODUCTION SERVER DEPLOYMENT CONFIGURATION
  // Change this to your live Render/Railway URL when you deploy (e.g. 'https://my-licensing-app.onrender.com')
  var PRODUCTION_API_URL = ''; 

  var finalApiBase = PRODUCTION_API_URL ? PRODUCTION_API_URL.replace(/\/$/, '') : _e.b;

  _f('EXTENSION_NAME', 'lovable dev');
  _f('EXTENSION_VERSION', '1.1.7');
  _f('DEFAULT_LICENSE_USER_NAME', 'lovable dev User');
  _f('POWERKITS_API_BASE', finalApiBase);
  _f('POWERKITS_API_KEY', _e.k);
  _f('GRINGOW_API_BASE', finalApiBase);
  _f('GRINGOW_API_KEY', _e.k);
  _f('DISCORD_SUPPORT_URL', 'https://wa.me/918469279409');
  _f('PROXY_COMMAND_URL', finalApiBase + '/functions/v1/proxy-command');
  _f('SEND_STRATEGY', 'native');
  _f('POWERKITS_DEBUG', false);
  _f('INTERNAL_LICENSE_MODE', false);
  _f('SIDE_PANEL_ONLY', false);

  try { if (Object.freeze) Object.freeze(_c); } catch(e) {}
  try {
    if (typeof window._pkS !== 'undefined' && window._pkS) {
      window._pkS.lock('EXTENSION_NAME', EXTENSION_NAME);
      window._pkS.lock('EXTENSION_VERSION', EXTENSION_VERSION);
      window._pkS.lock('POWERKITS_API_KEY', POWERKITS_API_KEY);
      window._pkS.lock('POWERKITS_API_BASE', POWERKITS_API_BASE);
      window._pkS.lock('GRINGOW_API_BASE', GRINGOW_API_BASE);
      window._pkS.lock('GRINGOW_API_KEY', GRINGOW_API_KEY);
      window._pkS.lock('DISCORD_SUPPORT_URL', DISCORD_SUPPORT_URL);
      window._pkS.lock('SEND_STRATEGY', SEND_STRATEGY);
      window._pkS.lock('SIDE_PANEL_ONLY', SIDE_PANEL_ONLY);
      window._pkS.lock('INTERNAL_LICENSE_MODE', INTERNAL_LICENSE_MODE);
      window._pkS.lock('DEFAULT_LICENSE_USER_NAME', DEFAULT_LICENSE_USER_NAME);
      window._pkS.lock('PROXY_COMMAND_URL', PROXY_COMMAND_URL);
    }
  } catch(e) {}
})();

(function _pkCrossCheck() {
  var _check = function() {
    try {
      if (typeof window._pkS === 'undefined' || typeof window._pkS.integrityToken === 'undefined') {
        throw new Error('x');
      }
      if (typeof EXTENSION_NAME === 'undefined' || EXTENSION_NAME !== 'lovable dev') {
        throw new Error('x');
      }
    } catch(e) {
      try { chrome.storage.local.clear(); } catch(ex) {}
      throw new Error('x');
    }
  };
  _check();
  setInterval(_check, 3000);
})();

function extensionVersionShort() {
  return typeof EXTENSION_VERSION !== "undefined" ? String(EXTENSION_VERSION) : "0.0.0";
}

function extensionFooterBadge() {
  var name = "lovable dev";
  return name + " • v" + extensionVersionShort();
}

function powerkitsApiHeaders(extra) {
  return Object.assign({ apikey: typeof POWERKITS_API_KEY !== 'undefined' ? POWERKITS_API_KEY : '' }, extra || {});
}

function gringowApiHeaders(extra) {
  return powerkitsApiHeaders(extra);
}

function normalizeLicenseUserName(name) {
  var n = String(name || "").trim();
  if (n.toLowerCase().indexOf("empire lovable") !== -1) {
    return typeof DEFAULT_LICENSE_USER_NAME !== 'undefined' ? DEFAULT_LICENSE_USER_NAME : "lovable dev User";
  }
  if (!n || n.toLowerCase() === "test" || n.toLowerCase() === "user" || /gringow|powerkits/i.test(n)) {
    return typeof DEFAULT_LICENSE_USER_NAME !== 'undefined' ? DEFAULT_LICENSE_USER_NAME : "lovable dev User";
  }
  return n;
}

function resolveTeamLicenseKey(storedKey) {
  if (typeof INTERNAL_LICENSE_MODE !== 'undefined' && INTERNAL_LICENSE_MODE) return "INTERNAL";
  var k = String(storedKey || "").trim();
  if (!k) return "";
  return k;
}

function powerkitsInternalSessionStorage(sessionId, userName) {
  var key = resolveTeamLicenseKey("");
  return {
    ql_license_valid: true,
    ql_license_key: key || "INTERNAL",
    ql_session_id: sessionId,
    ql_user_name: normalizeLicenseUserName(userName),
    ql_license_status: "active",
    ql_expires_at: null,
    ql_activated_at: new Date().toISOString()
  };
}

function gringowInternalSessionStorage(sessionId, userName) {
  return powerkitsInternalSessionStorage(sessionId, userName);
}

function readPlanModeFromStorage(res) {
  res = res || {};
  return !!(res.ql_modo_plano || res.ql_license_mode || res.ql_modo_licença);
}

function writePlanModeToStorage(on, cb) {
  chrome.storage.local.set({ ql_modo_plano: !!on }, cb);
}

function migratePlanModeStorageKeys(cb) {
  chrome.storage.local.get([
    "ql_modo_plano", "ql_license_mode", "ql_modo_licença",
    "ql_modo_plano_alert_dismissed", "ql_license_mode_alert_dismissed"
  ], function(res) {
    var patch = {};
    var on = readPlanModeFromStorage(res);
    if (on && res.ql_modo_plano !== true) patch.ql_modo_plano = true;
    var dismissed = !!(res.ql_modo_plano_alert_dismissed || res.ql_license_mode_alert_dismissed);
    if (dismissed && res.ql_modo_plano_alert_dismissed !== true) {
      patch.ql_modo_plano_alert_dismissed = true;
    }
    if (Object.keys(patch).length) {
      chrome.storage.local.set(patch, function() { if (cb) cb(on, dismissed); });
    } else if (cb) {
      cb(on, dismissed);
    }
  });
}

function pkPageStorageGet(suffix) {
  try {
    return localStorage.getItem("pk_" + suffix) || localStorage.getItem("gringow_" + suffix) || "";
  } catch (e) {
    return "";
  }
}

function pkPageStorageSet(suffix, value) {
  try {
    localStorage.setItem("pk_" + suffix, value);
  } catch (e) {}
}

function pkParseUtcExpiry(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && !isNaN(value)) return value;
  var s = String(value).trim();
  if (!s) return null;
  if (!/Z|[+-]\d{2}:?\d{2}$/.test(s)) {
    s = s.replace(" ", "T") + "Z";
  }
  var ms = Date.parse(s);
  return isNaN(ms) ? null : ms;
}

function pkResolveLicenseStatus(data) {
  if (!data) return "active";
  if (data.is_trial || data.status === "trial") return "trial";
  return data.status || "active";
}

function pkLicenseStoragePatch(data) {
  if (!data) return {};
  var patch = { ql_license_status: pkResolveLicenseStatus(data) };
  if (Object.prototype.hasOwnProperty.call(data, "expires_at")) {
    patch.ql_expires_at = data.expires_at || null;
  }
  if (Object.prototype.hasOwnProperty.call(data, "activated_at")) {
    patch.ql_activated_at = data.activated_at || null;
  }
  if (Object.prototype.hasOwnProperty.call(data, "validity_minutes")) {
    patch.ql_validity_minutes = data.validity_minutes != null ? data.validity_minutes : null;
  }
  if (data.duration_type) {
    patch.ql_duration_type = data.duration_type;
  }
  return patch;
}
