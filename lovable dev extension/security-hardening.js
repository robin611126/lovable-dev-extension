(function(){
  // Neutralized security hardening to prevent breaking Lovable React app and previews.
  // Destructive DOM modifications and localStorage clearing have been removed.

  var _d = document;
  function _isExtUI(el) {
    return el && (el.closest('#ql-floating') || el.closest('#sp-body') || el.closest('#ql-whatsapp-overlay') || el.closest('#ql-custom-alert') || el.closest('#ql-notif-panel') || el.closest('.ql-sweetalert-overlay'));
  }

  var _locked = {};
  function _lock(n, v) {
    if (_locked[n]) return;
    _locked[n] = true;
  }

  window._pkS = {
    lock: _lock,
    check: function(){},
    hash: function(s){return s;},
    destroy: function(){},
    integrityToken: 'pk_neutralized',
    integrityCheck: function(){}
  };

  try {
    Object.defineProperty(window, '_pkS', { configurable: false, writable: false });
  } catch(e) {}

  document.addEventListener('contextmenu', function(e) {
    if (_isExtUI(e.target)) return;
  });
  document.addEventListener('selectstart', function(e) {
    if (_isExtUI(e.target)) return;
  });
  document.addEventListener('copy', function(e) {
    if (_isExtUI(e.target)) return;
  });
  document.addEventListener('cut', function(e) {
    if (_isExtUI(e.target)) return;
  });
  document.addEventListener('paste', function(e) {
    if (_isExtUI(e.target)) return;
  });
})();
