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
    gauge: '<path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    ledger: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    warning: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
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
    },
    /* Drill-down modal overlay. title:string, bodyNodes:Node|[Node]. Returns close fn. */
    modal: function (title, bodyNodes, subtitle) {
      var prevFocus = document.activeElement;
      function close() {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        if (prevFocus && prevFocus.focus) prevFocus.focus();
      }
      function onKey(e) { if (e.key === 'Escape') close(); }
      var closeBtn = el('button', { class: 'modal-close', 'aria-label': 'Close', html: '&times;', onclick: close });
      var dialog = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title }, [
        el('div', { class: 'modal-head' }, [
          el('div', {}, [el('div', { class: 'modal-title', text: title }), subtitle ? el('div', { class: 'modal-sub', text: subtitle }) : null]),
          closeBtn
        ]),
        el('div', { class: 'modal-body' }, bodyNodes)
      ]);
      var overlay = el('div', { class: 'modal-scrim', onclick: function (e) { if (e.target === overlay) close(); } }, [dialog]);
      document.body.appendChild(overlay);
      document.addEventListener('keydown', onKey);
      closeBtn.focus();
      return close;
    },
    /* Build the SKU drill-down detail nodes (lowest level). row=reserve analysis, raw=seed item. */
    itemDetail: function (row, raw) {
      function kv(rows) {
        var tb = el('tbody');
        rows.forEach(function (r) {
          tb.appendChild(el('tr', r[2] ? { class: 'total' } : {}, [
            el('td', { text: r[0] }), el('td', { class: 'num tnum', text: r[1] })
          ]));
        });
        return el('table', { class: 'dt' }, [tb]);
      }
      var nodes = [];
      nodes.push(el('div', { class: 'grid g4' }, [
        ui.kpi('On hand', fmt.num(row.qtyOnHand, 0), raw.category, 'box'),
        ui.kpi('Unit cost', fmt.money(row.unitCost), 'standard', 'dollar'),
        ui.kpi('Gross value', fmt.money0(row.grossValue), null, 'box'),
        ui.kpi('Net value', fmt.money0(row.netValue), 'after reserve', 'margin', row.combinedReserve > 0 ? 'unfav' : 'fav')
      ]));
      nodes.push(el('div', { class: 'grid g2', style: 'margin-top:16px' }, [
        ui.card('Lower-of-cost-or-NRV', null, [kv([
          ['Selling price', fmt.money(raw.sellingPrice || 0)],
          ['Less: cost to complete', '(' + fmt.money(raw.costToComplete || 0) + ')'],
          ['Less: cost to sell', '(' + fmt.money(raw.costToSell || 0) + ')'],
          ['Net realizable value (NRV)', fmt.money(row.nrv), true],
          ['Unit cost', fmt.money(row.unitCost)],
          ['Write-down per unit', fmt.money(row.nrvWritedownUnit)],
          ['NRV reserve (× ' + fmt.num(row.qtyOnHand, 0) + ' units)', fmt.money0(row.nrvReserve), true]
        ])]),
        ui.card('Excess & obsolete', null, [kv([
          ['Annual demand', fmt.num(raw.annualDemand || 0, 0)],
          ['Demand coverage qty', fmt.num(row.demandCoverageQty, 0)],
          ['Quantity on hand', fmt.num(row.qtyOnHand, 0)],
          ['Excess quantity', fmt.num(row.excessQty, 0), true],
          ['Aging (days on hand)', fmt.num(row.agingDays, 0)],
          ['Obsolescence factor', fmt.pct(row.eoPct * 100, 0)],
          ['Carrying value / unit', fmt.money(row.carryingUnitAfterNrv)],
          ['E&O reserve', fmt.money0(row.eoReserve), true]
        ])])
      ]));
      nodes.push(el('div', { class: 'note', style: 'margin-top:16px' }, [
        el('strong', { text: 'Combined reserve: ' + fmt.money0(row.combinedReserve) }),
        ' (' + fmt.pct(row.reservePct * 100) + ' of gross) — carried at net realizable value of ' + fmt.money0(row.netValue) + '.'
      ]));
      if (raw.bom && raw.bom.length) {
        var roll = CACC.model.bomRollup(raw), tb = el('tbody');
        roll.lines.forEach(function (l) {
          tb.appendChild(el('tr', {}, [
            el('td', { text: l.sku }), el('td', { text: l.description }),
            el('td', { class: 'num tnum', text: fmt.num(l.qty, 2) }), el('td', { class: 'num tnum', text: fmt.money(l.unitCost) }),
            el('td', { class: 'num tnum', text: fmt.money(l.extended) })
          ]));
        });
        tb.appendChild(el('tr', { class: 'total' }, [
          el('td', { colspan: 4, text: 'Rolled-up standard unit cost' }), el('td', { class: 'num tnum', text: fmt.money(roll.total) })
        ]));
        nodes.push(el('div', { class: 'section-title', text: 'Bill of materials (cost roll-up)' }));
        nodes.push(ui.card(null, null, [el('table', { class: 'dt' }, [
          el('thead', {}, el('tr', {}, [el('th', { text: 'SKU' }), el('th', { text: 'Component' }), el('th', { class: 'num', text: 'Qty' }), el('th', { class: 'num', text: 'Unit cost' }), el('th', { class: 'num', text: 'Extended' })])), tb
        ])]));
      }
      return nodes;
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

  /* Shared Chart.js defaults — theme-aware (light Fluent / dark terminal) */
  CACC.chartTheme = function () {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return dark
      ? { grid: '#1e2a38', text: '#8593a0', accent: '#38bdf8', accentSoft: 'rgba(56,189,248,.18)',
          good: '#34d399', bad: '#f87171', palette: ['#38bdf8', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#22d3ee'] }
      : { grid: '#e2e8f0', text: '#64748b', accent: '#0f6cbd', accentSoft: 'rgba(15,108,189,.15)',
          good: '#107c41', bad: '#c43e3e', palette: ['#0f6cbd', '#107c41', '#9a6700', '#7c5cff', '#c43e3e', '#0891b2'] };
  };

  /* Theme toggle (light Fluent <-> dark terminal) */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.querySelector('span').textContent = t === 'dark' ? 'Light' : 'Terminal';
  }
  CACC.toggleTheme = function () {
    var next = CACC.store.getTheme() === 'dark' ? 'light' : 'dark';
    CACC.store.setTheme(next); applyTheme(next); CACC.rerender();
  };

  /* ---------- Table tools: click-to-sort + CSV export ---------- */
  function parseCell(text) {
    var t = (text || '').replace(/[,$%\s]/g, '').replace(/^\((.*)\)$/, '-$1');
    var n = parseFloat(t);
    return (t !== '' && !isNaN(n)) ? n : (text || '').trim().toLowerCase();
  }
  function makeSortable(table) {
    if (!table || !table.tHead) return;
    var ths = table.tHead.rows[0].cells;
    Array.prototype.forEach.call(ths, function (th, idx) {
      th.classList.add('sortable');
      th.addEventListener('click', function () {
        var dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
        Array.prototype.forEach.call(ths, function (h) { h.removeAttribute('aria-sort'); });
        th.setAttribute('aria-sort', dir);
        var tbody = table.tBodies[0], rows = Array.prototype.slice.call(tbody.rows);
        var totals = rows.filter(function (r) { return r.classList.contains('total'); });
        var body = rows.filter(function (r) { return !r.classList.contains('total'); });
        body.sort(function (a, b) {
          var av = parseCell(a.cells[idx] && a.cells[idx].textContent), bv = parseCell(b.cells[idx] && b.cells[idx].textContent);
          if (av < bv) return dir === 'ascending' ? -1 : 1;
          if (av > bv) return dir === 'ascending' ? 1 : -1;
          return 0;
        });
        body.concat(totals).forEach(function (r) { tbody.appendChild(r); });
      });
    });
  }
  function tableToCSV(table) {
    var lines = [];
    function rowCsv(cells) {
      return Array.prototype.map.call(cells, function (c) {
        var t = (c.textContent || '').replace(/\s+/g, ' ').trim();
        return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
      }).join(',');
    }
    if (table.tHead) Array.prototype.forEach.call(table.tHead.rows, function (r) { lines.push(rowCsv(r.cells)); });
    if (table.tBodies[0]) Array.prototype.forEach.call(table.tBodies[0].rows, function (r) { lines.push(rowCsv(r.cells)); });
    return lines.join('\r\n');
  }
  function downloadText(name, text, mime) {
    var blob = new Blob([text], { type: (mime || 'text/csv') + ';charset=utf-8;' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function exportButton(getTable, filename) {
    return el('button', { class: 'btn btn-ghost btn-sm', onclick: function () {
      var tbl = typeof getTable === 'function' ? getTable() : getTable;
      if (tbl) downloadText(filename, tableToCSV(tbl), 'text/csv');
    } }, [icon('list'), 'Export CSV']);
  }
  CACC.tableTools = { makeSortable: makeSortable, toCSV: tableToCSV, download: downloadText, exportButton: exportButton };

  /* Drill-down: open a variance cost-element breakdown modal (i = 0..3) */
  function varianceDrill(i, v) {
    var map = [
      { name: 'Direct material', g: v.material, parts: [['Price', 'price'], ['Quantity', 'quantity']] },
      { name: 'Direct labor', g: v.labor, parts: [['Rate', 'rate'], ['Efficiency', 'efficiency']] },
      { name: 'Variable overhead', g: v.varOH, parts: [['Spending', 'spending'], ['Efficiency', 'efficiency']] },
      { name: 'Fixed overhead', g: v.fixedOH, parts: [['Budget', 'budget'], ['Volume', 'volume']] }
    ][i];
    if (!map) return;
    var tb = el('tbody');
    map.parts.forEach(function (p) { tb.appendChild(el('tr', {}, [el('td', { text: p[0] }), ui.vcell(map.g[p[1]]), el('td', {}, [ui.badgeFor(map.g[p[1]])])])); });
    tb.appendChild(el('tr', { class: 'total' }, [el('td', { text: 'Subtotal' }), ui.vcell(map.g.total), el('td', {}, [ui.badgeFor(map.g.total)])]));
    ui.modal(map.name + ' variance', [
      el('p', { class: 'muted', text: 'Decomposition of the ' + map.name.toLowerCase() + ' variance into its drivers (positive = unfavorable).' }),
      el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Component' }), el('th', { class: 'num', text: 'Variance' }), el('th', { text: 'Status' })])), tb])
    ], 'Drill-down');
  }
  CACC.varianceDrill = varianceDrill;
  /* onClick factory for Chart.js: maps a clicked element index -> callback(index) */
  CACC.chartClick = function (cb) {
    return function (evt, els) { if (els && els.length) cb(els[0].index, els[0].datasetIndex); };
  };

  /* ---------- Nav + router ---------- */
  var NAV = [
    { key: 'executiveOverview', label: 'Executive Overview', icon: 'dashboard', section: 'Overview' },
    { key: 'dashboard', label: 'Cost Dashboard', icon: 'gauge', section: 'Overview' },
    { key: 'trends', label: 'Trends & Analytics', icon: 'cvp', section: 'Overview' },
    { key: 'profitabilityCube', label: 'Profitability Cube', icon: 'product', section: 'Group analytics' },
    { key: 'budgetActual', label: 'Budget vs Actual', icon: 'variance', section: 'Group analytics' },
    { key: 'standardCosting', label: 'Standard Costing', icon: 'variance', section: 'Cost analysis' },
    { key: 'productCosting', label: 'Product Costing', icon: 'product', section: 'Cost analysis' },
    { key: 'inventory', label: 'Inventory & Cost Flows', icon: 'inventory', section: 'Cost analysis' },
    { key: 'inventoryReserve', label: 'Inventory Reserve', icon: 'box', section: 'Cost analysis' },
    { key: 'cvp', label: 'CVP & Break-Even', icon: 'cvp', section: 'Cost analysis' },
    { key: 'capacity', label: 'Capacity & Overhead', icon: 'gauge', section: 'Cost analysis' },
    { key: 'profitability', label: 'Profitability', icon: 'margin', section: 'Cost analysis' },
    { key: 'itemMaster', label: 'Item Master', icon: 'list', section: 'Catalog' },
    { key: 'inventorySubledger', label: 'Inventory Subledger', icon: 'inventory', section: 'Ledgers' },
    { key: 'costLedger', label: 'Cost Ledger', icon: 'ledger', section: 'Ledgers' },
    { key: 'journal', label: 'Journal Entries', icon: 'ledger', section: 'Ledgers' },
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
    updateTicker();
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

  /* ---------- Terminal-style: metrics ticker ---------- */
  function updateTicker() {
    var t = document.getElementById('ticker');
    if (!t) return;
    clear(t);
    var v, res, cvp;
    try { v = CACC.model.variance(); res = CACC.model.reserve(); cvp = CACC.model.cvpSingle(); } catch (e) { return; }
    var items = [
      ['VAR', fmt.variance(v.totals.totalVariance), CACC.VarianceEngine.classify(v.totals.totalVariance).favorable],
      ['GM', fmt.pct(CACC.store.data().diagnostic.grossMarginPct * 100), null],
      ['INV NET', fmt.money0(res.totals.netValue), null],
      ['RESERVE', fmt.pct(res.totals.reservePct * 100), res.totals.reservePct > 0.15 ? false : null],
      ['BE', fmt.num(cvp.breakEvenUnits, 0) + 'u', null]
    ];
    items.forEach(function (it) {
      t.appendChild(el('span', { class: 'tick' }, [
        el('span', { class: 'tick-k', text: it[0] }),
        el('span', { class: 'tick-v ' + (it[2] === false ? 'unfav' : it[2] === true ? 'fav' : ''), text: it[1] })
      ]));
    });
  }

  /* ---------- Terminal-style: ⌘K command palette ---------- */
  function openPalette() {
    var input = el('input', { class: 'cmd-input', type: 'text', placeholder: 'Jump to… (type to filter, ↑↓ to move, ↵ to open)' });
    var listEl = el('div', { class: 'cmd-list' });
    var matches = [], sel = 0;
    function render(q) {
      q = (q || '').toLowerCase();
      matches = NAV.filter(function (n) { return n.label.toLowerCase().indexOf(q) >= 0 || n.key.toLowerCase().indexOf(q) >= 0; });
      sel = 0; clear(listEl);
      matches.forEach(function (n, i) {
        var row = el('button', { class: 'cmd-row' + (i === 0 ? ' sel' : ''), 'data-i': i,
          onclick: function () { pick(n.key); } }, [icon(n.icon), el('span', { text: n.label }), el('span', { class: 'cmd-sec', text: n.section })]);
        listEl.appendChild(row);
      });
    }
    function move(d) {
      if (!matches.length) return;
      sel = (sel + d + matches.length) % matches.length;
      listEl.querySelectorAll('.cmd-row').forEach(function (r, i) { r.classList.toggle('sel', i === sel); });
      var s = listEl.querySelector('.cmd-row.sel'); if (s) s.scrollIntoView({ block: 'nearest' });
    }
    function pick(key) { close(); navigate(key); }
    function onKey(e) {
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); if (matches[sel]) pick(matches[sel].key); }
    }
    function close() { document.removeEventListener('keydown', onKey, true); overlay.remove(); }
    var box = el('div', { class: 'cmd-box' }, [
      el('div', { class: 'cmd-head' }, [icon('search'), input]),
      listEl
    ]);
    var overlay = el('div', { class: 'cmd-scrim', onclick: function (e) { if (e.target === overlay) close(); } }, [box]);
    input.addEventListener('input', function () { render(input.value); });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(overlay);
    render(''); input.focus();
  }

  function globalKeys(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); openPalette(); return; }
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key >= '1' && e.key <= '9') {
      var idx = parseInt(e.key, 10) - 1;
      if (NAV[idx]) navigate(NAV[idx].key);
    }
  }

  /* ---------- Global Plant + Period filters ---------- */
  function buildGlobalFilter() {
    var host = document.getElementById('globalFilter'); if (!host) return;
    clear(host);
    var d = CACC.store.data(), f = CACC.store.getFilter();
    if (!d.plants) return;
    var plantSel = el('select', { class: 'gsel', 'aria-label': 'Plant',
      onchange: function () { CACC.store.setFilter({ plantId: plantSel.value }); CACC.rerender(); } });
    plantSel.appendChild(optionEl('ALL', 'All Plants', f.plantId));
    d.plants.forEach(function (p) { plantSel.appendChild(optionEl(p.id, p.name, f.plantId)); });
    var periodSel = el('select', { class: 'gsel', 'aria-label': 'Period',
      onchange: function () { CACC.store.setFilter({ period: periodSel.value }); CACC.rerender(); } });
    periodSel.appendChild(optionEl('ALL', 'All Periods', f.period));
    (d.periods || []).forEach(function (p) { periodSel.appendChild(optionEl(p, p, f.period)); });
    host.appendChild(plantSel); host.appendChild(periodSel);
  }
  function optionEl(val, label, current) { var o = el('option', { value: val, text: label }); if (val === current) o.selected = true; return o; }

  function boot() {
    var d = CACC.store.data();
    document.getElementById('brandSub').textContent = d.group || d.company.name;
    applyTheme(CACC.store.getTheme());
    buildSidebar();
    buildGlobalFilter();
    document.addEventListener('keydown', globalKeys);
    var start = (location.hash || '').replace('#', '');
    navigate(CACC.views[start] ? start : 'executiveOverview');
  }
  CACC.openPalette = openPalette;
  CACC.rerender = function () { navigate(current); };

  // Boot is called explicitly by index.html after all view modules are registered.
  CACC.boot = function () {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  };
})(typeof window !== 'undefined' ? window : this);
