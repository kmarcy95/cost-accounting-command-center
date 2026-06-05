/* Store + shared utilities. Browser-only (uses localStorage + DOM helpers). */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});

  /* ---- localStorage helper (pattern from creator-dashboard) ---- */
  var LS = {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }
      catch (e) { return d; }
    },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    remove: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  var KEYS = { scenario: 'cacc.scenario', apiKey: 'cacc.apiKey', model: 'cacc.model' };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var data = LS.get(KEYS.scenario, null) || clone(CACC.SEED);
  var filter = LS.get('cacc.filter', null) || clone(CACC.SEED.defaultFilter || { plantId: 'ALL', period: 'ALL' });

  var store = {
    data: function () { return data; },
    save: function () { LS.set(KEYS.scenario, data); },
    reset: function () { data = clone(CACC.SEED); filter = clone(CACC.SEED.defaultFilter || { plantId: 'ALL', period: 'ALL' }); LS.remove(KEYS.scenario); LS.remove('cacc.filter'); },
    getFilter: function () { return filter; },
    setFilter: function (patch) { Object.keys(patch).forEach(function (k) { filter[k] = patch[k]; }); LS.set('cacc.filter', filter); },
    exportJSON: function () { return JSON.stringify(data, null, 2); },
    importJSON: function (str) {
      var parsed = JSON.parse(str); // throws on bad input — caller handles
      data = parsed; store.save(); return data;
    },
    // AI key/model (never leaves the browser)
    getKey: function () { return LS.get(KEYS.apiKey, ''); },
    setKey: function (k) { k ? LS.set(KEYS.apiKey, k) : LS.remove(KEYS.apiKey); },
    getModel: function () { return LS.get(KEYS.model, 'claude-opus-4-8'); },
    setModel: function (m) { LS.set(KEYS.model, m); },
    getTheme: function () { return LS.get('cacc.theme', 'light'); },
    setTheme: function (t) { LS.set('cacc.theme', t); }
  };

  /* ---- formatting ---- */
  var fmt = {
    money: function (n) {
      var v = Math.abs(Number(n) || 0);
      return (n < 0 ? '-$' : '$') + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    money0: function (n) {
      var v = Math.abs(Number(n) || 0);
      return (n < 0 ? '-$' : '$') + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
    },
    num: function (n, d) {
      return (Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: d == null ? 2 : d });
    },
    pct: function (n, d) { return (Number(n) || 0).toFixed(d == null ? 1 : d) + '%'; },
    // signed variance string with F/U suffix using the positive=Unfavorable convention
    variance: function (n) {
      var c = CACC.VarianceEngine.classify(n);
      var v = Math.abs(Number(n) || 0);
      var s = '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return c.label === '—' ? s : s + ' ' + c.label;
    }
  };

  /* ---- tiny DOM helper ---- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') node.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
    });
    if (children != null) (Array.isArray(children) ? children : [children]).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  /* debounce: defer fn until `wait` ms after the last call (for live-edit AI panels) */
  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait == null ? 500 : wait);
    };
  }

  CACC.LS = LS;
  CACC.util = { debounce: debounce };
  CACC.store = store;
  CACC.fmt = fmt;
  CACC.dom = { el: el, clear: clear };
})(typeof window !== 'undefined' ? window : this);
