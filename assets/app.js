/* App core: icons, shared UI helpers, router, chart lifecycle, boot. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt;

  /* ---------- Icons (Lucide-style, 24px stroke) ---------- */
  var I = {
    dashboard: '<path d="M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z"/>',
    variance: '<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>',
    product: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    inventory: '<path d="M3 9h18M3 15h18"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
    cvp: '<path d="M3 3v18h18"/><path d="M19 9l-5 5-4-4-3 3"/>',
    diagnostic: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    spark: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    dollar: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    margin: '<path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>'
  };
  function icon(name, cls) {
    var span = el('span', { class: cls || '' });
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (I[name] || '') + '</svg>';
    return span;
  }
  CACC.icons = I; CACC.icon = icon;

  /* ---------- Shared UI builders ---------- */
  var ui = {
    kpi: function (label, value, foot, iconName, tone) {
      return el('div', { class: 'card kpi' }, [
        el('div', { class: 'kpi-label' }, [icon(iconName || 'dollar', 'kpi-ico'), label]),
        el('div', { class: 'kpi-value' + (tone ? ' ' + tone : '') }, value),
        foot ? el('div', { class: 'kpi-foot' }, foot) : null
      ]);
    },
    card: function (title, sub, bodyNodes, headRight) {
      var head = title ? el('div', { class: 'card-head' }, [
        el('div', {}, [el('h2', { text: title }), sub ? el('div', { class: 'sub', text: sub }) : null]),
        headRight || null
      ]) : null;
      var body = el('div', { class: 'card-pad' }, bodyNodes);
      return el('div', { class: 'card' }, [head, body]);
    },
    /* variance value cell with F/U coloring */
    vcell: function (n) {
      var c = CACC.VarianceEngine.classify(n);
      var td = el('td', { class: 'num tnum ' + (c.favorable === true ? 'fav' : c.favorable === false ? 'unfav' : '') });
      td.textContent = fmt.variance(n);
      return td;
    },
    badgeFor: function (n) {
      var c = CACC.VarianceEngine.classify(n);
      var cls = c.favorable === true ? 'sb-good' : c.favorable === false ? 'sb-bad' : 'sb-neutral';
      return el('span', { class: 'badge ' + cls, text: c.label === '—' ? 'On std' : (c.favorable ? 'Favorable' : 'Unfavorable') });
    },
    /* AI insight panel — deterministic immediately, live-upgraded if a key exists */
    aiPanel: function (moduleKey, ctx) {
      var base = CACC.insights.generate(moduleKey, ctx);
      var bodyP = el('div', {});
      base.paragraphs.forEach(function (p) { bodyP.appendChild(el('p', { text: p })); });
      var bullets = el('ul', { class: 'ai-bullets' });
      base.bullets.forEach(function (b) { bullets.appendChild(el('li', { text: b })); });
      var srcTag = el('span', { class: 'ai-src', text: CACC.claude.available() ? 'Generating…' : 'Deterministic analysis' });
      var panel = el('div', { class: 'ai-panel' }, [
        el('div', { class: 'ai-head' }, [
          icon('spark', 'ai-spark'),
          el('span', { class: 'ai-title', text: base.headline }),
          srcTag
        ]),
        el('div', { class: 'ai-body' }, [bodyP, bullets])
      ]);
      if (CACC.claude.available()) {
        CACC.claude.narrate(moduleKey, ctx).then(function (res) {
          if (res.source === 'claude') {
            clear(bodyP);
            res.text.split(/\n\n+/).forEach(function (p) { if (p.trim()) bodyP.appendChild(el('p', { text: p.trim() })); });
            srcTag.textContent = 'Claude · ' + CACC.store.getModel();
          } else {
            srcTag.textContent = res.error ? 'Live AI failed — showing baseline' : 'Deterministic analysis';
          }
        });
      }
      return panel;
    }
  };
  CACC.ui = ui;

  /* ---------- Chart lifecycle ---------- */
  CACC._charts = [];
  CACC.chart = function (canvas, config) {
    if (typeof Chart === 'undefined') return null;
    var c = new Chart(canvas.getContext('2d'), config);
    CACC._charts.push(c);
    return c;
  };
  function destroyCharts() { CACC._charts.forEach(function (c) { try { c.destroy(); } catch (e) {} }); CACC._charts = []; }

  /* Shared Chart.js defaults for the Fluent look */
  CACC.chartTheme = function () {
    return {
      grid: '#e2e8f0', text: '#64748b', accent: '#0f6cbd', accentSoft: 'rgba(15,108,189,.15)',
      good: '#107c41', bad: '#c43e3e', palette: ['#0f6cbd', '#107c41', '#9a6700', '#7c5cff', '#c43e3e', '#0891b2']
    };
  };

  /* ---------- Nav + router ---------- */
  var NAV = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', section: 'Overview' },
    { key: 'standardCosting', label: 'Standard Costing', icon: 'variance', section: 'Cost analysis' },
    { key: 'productCosting', label: 'Product Costing', icon: 'product', section: 'Cost analysis' },
    { key: 'inventory', label: 'Inventory & Cost Flows', icon: 'inventory', section: 'Cost analysis' },
    { key: 'cvp', label: 'CVP & Break-Even', icon: 'cvp', section: 'Cost analysis' },
    { key: 'diagnostic', label: 'Day-1 Diagnostic', icon: 'diagnostic', section: 'Advisory' },
    { key: 'settings', label: 'Settings', icon: 'settings', section: 'Advisory' }
  ];

  var current = 'dashboard';
  function navigate(key) {
    if (!CACC.views[key]) return;
    current = key;
    location.hash = '#' + key;
    destroyCharts();
    document.querySelectorAll('.nav-item').forEach(function (n) {
      n.classList.toggle('active', n.getAttribute('data-key') === key);
    });
    var view = CACC.views[key];
    document.getElementById('viewTitle').textContent = view.title;
    document.getElementById('viewCrumb').textContent = view.crumb || (CACC.store.data().company.name + ' · ' + CACC.store.data().company.period);
    var c = document.getElementById('view');
    clear(c); c.scrollTop = 0; window.scrollTo(0, 0);
    view.render(c);
  }
  CACC.navigate = navigate;

  function buildSidebar() {
    var nav = document.getElementById('nav');
    var lastSection = null;
    NAV.forEach(function (item) {
      if (item.section !== lastSection) {
        nav.appendChild(el('div', { class: 'nav-section', text: item.section }));
        lastSection = item.section;
      }
      var btn = el('button', { class: 'nav-item', 'data-key': item.key, onclick: function () { navigate(item.key); } },
        [icon(item.icon), el('span', { text: item.label })]);
      nav.appendChild(btn);
    });
  }

  function boot() {
    var d = CACC.store.data();
    document.getElementById('brandSub').textContent = d.company.name;
    buildSidebar();
    var start = (location.hash || '').replace('#', '');
    navigate(CACC.views[start] ? start : 'dashboard');
  }
  CACC.rerender = function () { navigate(current); };

  // Boot is called explicitly by index.html after all view modules are registered.
  CACC.boot = function () {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  };
})(typeof window !== 'undefined' ? window : this);
