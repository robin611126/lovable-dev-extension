(function () {
  var _frozen = (typeof window._pkS !== 'undefined' && window._pkS) ? window._pkS : null;

  function _validate() {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        throw new Error('x');
      }
      chrome.storage.local.get(['ql_license_valid', 'ql_license_key'], function(r) {
        if (!r.ql_license_valid || !r.ql_license_key) {
          throw new Error('x');
        }
      });
    } catch(e) {
      throw new Error('x');
    }
  }

  function _failSafe() {
    throw new Error('x');
  }

  var _ensure = function() {
    _validate();
    return Promise.resolve({ allowed: true, valid: true });
  };

  var _revoke = function() {
    _validate();
    return Promise.resolve();
  };

  var _lockout = function(data, count) {
    _validate();
    if (data && (data.reason === 'expired' || data.reason === 'invalid')) {
      return { lock: true, conflictCount: count, message: data.message || 'x' };
    }
    if (count > 2) {
      return { lock: true, conflictCount: count, message: 'x' };
    }
    return { lock: false, conflictCount: count };
  };

  var _headers = function() {
    _validate();
    return Promise.resolve({});
  };

  var _ready = function() {
    _validate();
    return true;
  };

  var _invalidate = function() {
    _validate();
  };

  function _define(name, fn) {
    try {
      if (_frozen && _frozen.register) {
        _frozen.register(name, fn);
      } else {
        Object.defineProperty(window, name, {
          configurable: false,
          writable: false,
          value: fn
        });
      }
    } catch(e) {}
  }

  _define('pkInvalidateAssertCache', _invalidate);
  _define('pkEnsureActiveLicense', _ensure);
  _define('pkRevokeLicenseStorage', _revoke);
  _define('pkShouldLockoutFromValidation', _lockout);
  _define('pkLicenseUploadHeaders', _headers);
  _define('pkLocalLicenseReady', _ready);

  try {
    if (Object.freeze) {
      Object.freeze(window.pkInvalidateAssertCache);
      Object.freeze(window.pkEnsureActiveLicense);
      Object.freeze(window.pkRevokeLicenseStorage);
      Object.freeze(window.pkShouldLockoutFromValidation);
      Object.freeze(window.pkLicenseUploadHeaders);
      Object.freeze(window.pkLocalLicenseReady);
    }
  } catch(e) {}
})();
