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
    warning: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    truck: '<rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h2v5H8zM12 11h2v7h-2zM16 15h2v3h-2z"/>',
    map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    refresh: '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    expand: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
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
    /* Drill-downs open as NON-BLOCKING floating windows (draggable, multiple at once). */
    modal: function (title, bodyNodes, subtitle) { return floatingWindow(title, bodyNodes, subtitle); },
    window: function (title, bodyNodes, subtitle) { return floatingWindow(title, bodyNodes, subtitle); },
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

  /* Density (comfortable <-> compact) */
  function applyDensity(d) {
    document.documentElement.setAttribute('data-density', d);
    var btn = document.getElementById('densityToggle');
    if (btn) btn.querySelector('span').textContent = d === 'compact' ? 'Comfortable' : 'Compact';
  }
  CACC.toggleDensity = function () {
    var next = CACC.store.getDensity() === 'compact' ? 'comfortable' : 'compact';
    CACC.store.setDensity(next); applyDensity(next);
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

  /* ---------- Non-blocking floating windows ---------- */
  var winCascade = 0, winZ = 1050, openWindows = [];
  function floatingWindow(title, bodyNodes, subtitle) {
    var layer = document.getElementById('winlayer');
    if (!layer) { layer = el('div', { id: 'winlayer' }); document.body.appendChild(layer); }
    var off = 56 + (winCascade % 6) * 28; winCascade++;
    var body = el('div', { class: 'win-body' }, bodyNodes);
    var win = el('div', { class: 'win', role: 'dialog', 'aria-label': title,
      style: 'top:' + off + 'px; left:' + Math.min(off + 90, Math.max(20, window.innerWidth - 620)) + 'px; z-index:' + (++winZ) });

    function bringToFront() { win.style.zIndex = (++winZ); }
    var onMove, onUp;
    function close() {
      document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp);
      win.remove(); openWindows = openWindows.filter(function (w) { return w !== close; });
    }
    var minBtn = el('button', { class: 'win-btn', title: 'Minimize', html: '&#8211;', onclick: function (e) { e.stopPropagation(); win.classList.toggle('min'); } });
    var closeBtn = el('button', { class: 'win-btn win-x', title: 'Close', html: '&times;', onclick: function (e) { e.stopPropagation(); close(); } });
    var head = el('div', { class: 'win-head' }, [
      el('div', { class: 'win-titles' }, [el('div', { class: 'win-title', text: title }), subtitle ? el('div', { class: 'win-sub', text: subtitle }) : null]),
      el('div', { class: 'win-btns' }, [minBtn, closeBtn])
    ]);
    win.appendChild(head); win.appendChild(body);
    win.addEventListener('mousedown', bringToFront);

    var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    head.addEventListener('mousedown', function (e) {
      if (e.target.closest('.win-btn')) return;
      dragging = true; sx = e.clientX; sy = e.clientY;
      var r = win.getBoundingClientRect(); ox = r.left; oy = r.top;
      document.body.style.userSelect = 'none'; e.preventDefault();
    });
    onMove = function (e) {
      if (!dragging) return;
      var nx = Math.max(0, Math.min(window.innerWidth - 80, ox + (e.clientX - sx)));
      var ny = Math.max(0, Math.min(window.innerHeight - 36, oy + (e.clientY - sy)));
      win.style.left = nx + 'px'; win.style.top = ny + 'px';
    };
    onUp = function () { dragging = false; document.body.style.userSelect = ''; };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);

    layer.appendChild(win); bringToFront(); openWindows.push(close);
    return close;
  }
  CACC.closeAllWindows = function () { openWindows.slice().forEach(function (close) { close(); }); };

  /* ---------- Business-process-flow stage bar ---------- */
  ui.stageBar = function (stages, activeIndex, onClick) {
    var bar = el('div', { class: 'stagebar' });
    stages.forEach(function (s, i) {
      var cls = i < activeIndex ? 'stage done' : i === activeIndex ? 'stage active' : 'stage';
      bar.appendChild(el('button', { class: cls, onclick: onClick ? function () { onClick(i, s); } : null }, [
        el('span', { class: 'stage-dot', text: i < activeIndex ? '✓' : String(i + 1) }),
        el('span', { class: 'stage-label', text: s })
      ]));
    });
    return bar;
  };

  /* ---------- Nav + router ---------- */
  var NAV = [
    { key: 'executiveOverview', label: 'Executive Overview', icon: 'dashboard', section: 'Overview' },
    { key: 'dashboard', label: 'Cost Dashboard', icon: 'gauge', section: 'Overview' },
    { key: 'trends', label: 'Trends & Analytics', icon: 'cvp', section: 'Overview' },
    { key: 'profitabilityCube', label: 'Profitability Cube', icon: 'product', section: 'Group analytics' },
    { key: 'budgetActual', label: 'Budget vs Actual', icon: 'variance', section: 'Group analytics' },
    { key: 'salesOrders', label: 'Sales Orders', icon: 'dollar', section: 'Group analytics' },
    { key: 'quotes', label: 'Quotes & Opportunities', icon: 'briefcase', section: 'Sales & projects' },
    { key: 'resourceScheduling', label: 'Resource Scheduling', icon: 'users', section: 'Sales & projects' },
    { key: 'reportBuilder', label: 'Report Builder', icon: 'report', section: 'Reports' },
    { key: 'financials', label: 'Financial Statements', icon: 'dollar', section: 'Finance' },
    { key: 'generalLedger', label: 'General Ledger', icon: 'ledger', section: 'Finance' },
    { key: 'accountsPayable', label: 'Accounts Payable', icon: 'truck', section: 'Finance' },
    { key: 'accountsReceivable', label: 'Accounts Receivable', icon: 'dollar', section: 'Finance' },
    { key: 'fixedAssets', label: 'Fixed Assets', icon: 'gauge', section: 'Finance' },
    { key: 'cashBank', label: 'Cash & Bank', icon: 'dollar', section: 'Finance' },
    { key: 'standardCosting', label: 'Standard Costing', icon: 'variance', section: 'Cost analysis' },
    { key: 'productCosting', label: 'Product Costing', icon: 'product', section: 'Cost analysis' },
    { key: 'inventory', label: 'Inventory & Cost Flows', icon: 'inventory', section: 'Cost analysis' },
    { key: 'inventoryReserve', label: 'Inventory Reserve', icon: 'box', section: 'Cost analysis' },
    { key: 'itemRevaluation', label: 'Cost Revaluation', icon: 'variance', section: 'Cost analysis' },
    { key: 'cvp', label: 'CVP & Break-Even', icon: 'cvp', section: 'Cost analysis' },
    { key: 'capacity', label: 'Capacity & Overhead', icon: 'gauge', section: 'Cost analysis' },
    { key: 'profitability', label: 'Profitability', icon: 'margin', section: 'Cost analysis' },
    { key: 'bomRollup', label: 'BOM & Cost Rollup', icon: 'product', section: 'Manufacturing' },
    { key: 'workOrders', label: 'Work Orders & WIP', icon: 'inventory', section: 'Manufacturing' },
    { key: 'subcontracting', label: 'Subcontracting', icon: 'truck', section: 'Manufacturing' },
    { key: 'traceability', label: 'Lot Traceability', icon: 'map', section: 'Manufacturing' },
    { key: 'costOfQuality', label: 'Cost of Quality', icon: 'warning', section: 'Manufacturing' },
    { key: 'procurement', label: 'Procurement', icon: 'truck', section: 'Supply chain' },
    { key: 'warehouse', label: 'Warehouse Visibility', icon: 'map', section: 'Supply chain' },
    { key: 'landedCost', label: 'Landed Cost', icon: 'truck', section: 'Supply chain' },
    { key: 'projects', label: 'Project Operations', icon: 'briefcase', section: 'Supply chain' },
    { key: 'workforce', label: 'Workforce', icon: 'users', section: 'People' },
    { key: 'itemMaster', label: 'Item Master', icon: 'list', section: 'Catalog' },
    { key: 'inventorySubledger', label: 'Inventory Subledger', icon: 'inventory', section: 'Ledgers' },
    { key: 'costLedger', label: 'Cost Ledger', icon: 'ledger', section: 'Ledgers' },
    { key: 'journal', label: 'Journal Entries', icon: 'ledger', section: 'Ledgers' },
    { key: 'costVersions', label: 'Cost Versions & Release', icon: 'variance', section: 'Governance' },
    { key: 'rbac', label: 'Security & SOD', icon: 'users', section: 'Governance' },
    { key: 'auditTrail', label: 'Audit Trail', icon: 'info', section: 'Governance' },
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
    c.appendChild(buildPageBar(key, view));
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

  /* ---------- Toast ---------- */
  CACC.toast = function (msg, bad) {
    var box = document.getElementById('toastbox');
    if (!box) { box = el('div', { id: 'toastbox' }); document.body.appendChild(box); }
    var t = el('div', { class: 'toast' + (bad ? ' bad' : ''), text: msg }); box.appendChild(t);
    setTimeout(function () { t.remove(); }, 3000);
  };

  /* ---------- Per-page command bar (D365-style ribbon) ---------- */
  function buildPageBar(viewKey, view) {
    function vroot() { return document.getElementById('view'); }
    function btn(ic, label, fn) { return el('button', { class: 'pbtn', title: label, onclick: fn }, [icon(ic), el('span', { text: label })]); }
    return el('div', { class: 'pagebar' }, [
      el('div', { class: 'pagebar-title' }, [el('strong', { text: view.title }), el('span', { class: 'muted', text: '  ·  ' + (CACC.model ? CACC.model.filterLabel() : '') })]),
      el('div', { class: 'pagebar-actions' }, [
        btn('refresh', 'Refresh', function () { CACC.rerender(); CACC.toast('Refreshed.'); }),
        btn('list', 'Export', function () { var t = vroot().querySelector('table.dt'); if (t) { CACC.tableTools.download(viewKey + '.csv', CACC.tableTools.toCSV(t), 'text/csv'); CACC.toast('Exported CSV.'); } else CACC.toast('No table to export here.', true); }),
        btn('print', 'Print', function () { window.print(); }),
        btn('settings', 'Columns', function () { var b = Array.prototype.find.call(vroot().querySelectorAll('.gridbar button'), function (x) { return /Columns/.test(x.textContent); }); if (b) b.click(); else openPageSettings(); }),
        btn('gauge', 'Density', function () { CACC.toggleDensity(); }),
        btn('filter', 'Filters', function () { openFilters(); }),
        btn('product', 'Drill-down', function () { drillExplorer(); }),
        btn('spark', 'AI insights', function () { var p = vroot().querySelector('.ai-panel'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'center' }); else CACC.toast('No AI panel on this page.'); }),
        btn('expand', 'Fullscreen', function () { document.body.classList.toggle('fullscreen'); }),
        btn('link', 'Copy link', function () { try { navigator.clipboard.writeText(location.href); CACC.toast('Page link copied.'); } catch (e) { CACC.toast('Copy failed.', true); } }),
        btn('info', 'About', function () { openAbout(viewKey, view); })
      ])
    ]);
  }
  function openPageSettings() {
    ui.window('Display settings', [
      el('div', { style: 'display:flex;gap:10px;flex-wrap:wrap' }, [
        el('button', { class: 'btn btn-ghost btn-sm', onclick: CACC.toggleTheme }, 'Toggle theme'),
        el('button', { class: 'btn btn-ghost btn-sm', onclick: CACC.toggleDensity }, 'Toggle density')
      ])
    ], 'Personalize');
  }
  function openFilters() {
    var d = CACC.store.data(), f = CACC.store.getFilter();
    var ps = el('select', {}, [el('option', { value: 'ALL', text: 'All Plants' })].concat((d.plants || []).map(function (p) { var o = el('option', { value: p.id, text: p.name }); if (p.id === f.plantId) o.selected = true; return o; })));
    var pe = el('select', {}, [el('option', { value: 'ALL', text: 'All Periods' })].concat((d.periods || []).map(function (p) { var o = el('option', { value: p, text: p }); if (p === f.period) o.selected = true; return o; })));
    ui.window('Filters', [
      el('p', { class: 'muted', text: 'Slice every page by plant and period.' }),
      el('div', { class: 'field', style: 'margin-bottom:12px' }, [el('label', { text: 'Plant' }), ps]),
      el('div', { class: 'field', style: 'margin-bottom:14px' }, [el('label', { text: 'Period' }), pe]),
      el('button', { class: 'btn btn-primary btn-sm', onclick: function () { CACC.store.setFilter({ plantId: ps.value, period: pe.value }); buildGlobalFilter(); CACC.rerender(); CACC.toast('Filters applied.'); } }, 'Apply')
    ], 'Global filter');
  }
  function openAbout(viewKey, view) {
    var desc = (CACC.help && CACC.help[viewKey]) || 'Part of the Cost Accounting Command Center — a multi-plant manufacturing cost & ERP terminal.';
    var v = document.getElementById('view');
    var kpis = Array.prototype.map.call(v.querySelectorAll('.kpi'), function (k) { var l = k.querySelector('.kpi-label'), val = k.querySelector('.kpi-value'); return (l ? l.textContent.trim() : '') + ' — ' + (val ? val.textContent.trim() : ''); }).filter(function (x) { return x.length > 3; });
    ui.window('About — ' + (view.title || viewKey), [
      el('p', { text: desc }),
      kpis.length ? el('div', { class: 'section-title', text: 'Metrics on this page' }) : null,
      kpis.length ? el('ul', { class: 'ai-bullets' }, kpis.slice(0, 10).map(function (x) { return el('li', { text: x }); })) : null,
      el('div', { class: 'note', style: 'margin-top:12px' }, 'Toolbar: Refresh · Export · Print · Columns · Density · Filters · Drill-down (5 levels) · AI insights · Fullscreen · Copy link.')
    ], 'Page help');
  }

  /* ---------- 5-level drill-down explorer ---------- */
  function drillExplorer() {
    var LEVELS = [
      { field: 'plantId', name: 'plantName', label: 'Plant' },
      { field: 'sku', name: 'productName', label: 'Product' },
      { field: 'customerId', name: 'customerName', label: 'Customer' },
      { field: 'period', name: null, label: 'Period' }
    ];
    var path = [], crumbHost = el('div', { class: 'drillcrumb' }), bodyHost = el('div', {});
    function scopeRows() { var rows = CACC.model.filtered(); path.forEach(function (p) { rows = rows.filter(function (r) { return r[LEVELS[p.level].field] === p.key; }); }); return rows; }
    function render() {
      CACC.dom.clear(crumbHost); CACC.dom.clear(bodyHost);
      var crumbs = [{ label: 'Group', idx: -1 }].concat(path.map(function (p, i) { return { label: LEVELS[p.level].label + ': ' + p.name, idx: i }; }));
      crumbs.forEach(function (cr, i) {
        crumbHost.appendChild(el('button', { class: 'crumb', text: cr.label, onclick: function () { path = path.slice(0, cr.idx + 1); render(); } }));
        if (i < crumbs.length - 1) crumbHost.appendChild(el('span', { class: 'crumb-sep', text: '▸' }));
      });
      var rows = scopeRows(), depth = path.length, k = CACC.CubeEngine.kpis(rows);
      bodyHost.appendChild(el('div', { class: 'note', style: 'margin-bottom:10px' }, 'Scope: ' + CACC.fmt.money0(k.revenue) + ' revenue · ' + CACC.fmt.money0(k.grossProfit) + ' GP (' + CACC.fmt.pct(k.marginPct * 100) + ') · ' + CACC.fmt.num(k.units, 0) + ' units · ' + rows.length + ' fact rows.'));
      if (depth >= LEVELS.length) {
        var tbl = el('tbody');
        rows.forEach(function (r) { tbl.appendChild(el('tr', {}, [el('td', { text: r.period }), el('td', { text: r.plantName }), el('td', { text: r.productName }), el('td', { text: r.customerName }), el('td', { class: 'num tnum', text: CACC.fmt.num(r.units, 0) }), el('td', { class: 'num tnum', text: CACC.fmt.money0(r.revenue) }), el('td', { class: 'num tnum', text: CACC.fmt.money0(r.grossProfit) }), CACC.ui.vcell(r.netVariance)])); });
        bodyHost.appendChild(el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Period' }), el('th', { text: 'Plant' }), el('th', { text: 'Product' }), el('th', { text: 'Customer' }), el('th', { class: 'num', text: 'Units' }), el('th', { class: 'num', text: 'Revenue' }), el('th', { class: 'num', text: 'Gross profit' }), el('th', { class: 'num', text: 'Variance' })])), tbl]));
        return;
      }
      var lvl = LEVELS[depth], groups = CACC.CubeEngine.groupBy(rows, lvl.field, lvl.name).sort(function (a, b) { return b.revenue - a.revenue; });
      var tb = el('tbody');
      groups.forEach(function (g) {
        tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { path.push({ level: depth, key: g.key, name: g.name }); render(); } }, [
          el('td', {}, [el('strong', { text: g.name })]), el('td', { class: 'num tnum', text: CACC.fmt.money0(g.revenue) }), el('td', { class: 'num tnum', text: CACC.fmt.money0(g.grossProfit) }),
          el('td', { class: 'num tnum', text: CACC.fmt.pct(g.marginPct * 100) }), el('td', { class: 'num tnum', text: CACC.fmt.num(g.units, 0) }), el('td', { class: 'muted', text: 'Drill ▸' })
        ]));
      });
      bodyHost.appendChild(el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: lvl.label }), el('th', { class: 'num', text: 'Revenue' }), el('th', { class: 'num', text: 'Gross profit' }), el('th', { class: 'num', text: 'Margin %' }), el('th', { class: 'num', text: 'Units' }), el('th', { text: '' })])), tb]));
    }
    render();
    ui.window('Drill-down explorer', [el('div', { class: 'note', style: 'margin-bottom:10px' }, '5 levels: Group ▸ Plant ▸ Product ▸ Customer ▸ Period. Click a row to drill in; use the breadcrumb to climb back.'), crumbHost, el('div', { style: 'height:10px' }), bodyHost], 'Group ▸ Plant ▸ Product ▸ Customer ▸ Period');
  }
  CACC.drillExplorer = drillExplorer;

  CACC.help = {
    executiveOverview: 'Group-level cockpit: revenue, gross margin, net manufacturing variance and capacity across all plants, with a plant scorecard and top customers by gross profit.',
    dashboard: 'Cost-accounting cockpit for the selected scope: variance by element, inventory reserve, COGS, margin of safety, cost-system health, alerts and the variance bridge.',
    trends: 'Six-month time series of total variance, gross margin, inventory reserve and capacity — click a point to open that period.',
    profitabilityCube: 'Interactive pivot of any measure by product, plant, customer or period. Click a cell to see the contributing fact rows.',
    budgetActual: 'Budget-to-actual by cost category and plant with variance %; click a category for its plant breakdown.',
    salesOrders: 'Order-to-cash register. Group, filter and personalize columns; click an order for the customer’s full book.',
    quotes: 'Sales pipeline: Lead → Opportunity → Quote → Won/Lost with weighted value and win rate; click a deal for its flow.',
    resourceScheduling: 'Schedule board: resource utilization by period with overbooking heat; click a resource for allocation detail.',
    reportBuilder: 'Build custom pivot or flat reports across any data source and save them as reusable templates.',
    financials: 'Income statement (revenue → COGS → gross profit → SG&A → operating income) consolidated and by plant.',
    standardCosting: 'Standard vs actual variance analysis: material, labor and overhead price/quantity variances with a live bridge.',
    productCosting: 'Job-order, weighted-average process, and activity-based costing with cost-distortion analysis.',
    inventory: 'FIFO/LIFO/weighted-average valuation and the RM → WIP → FG → COGS cost flow with overhead absorption.',
    inventoryReserve: 'Multi-item lower-of-cost-or-NRV write-downs and excess & obsolete reserves; click a SKU for the full computation.',
    itemRevaluation: 'Model a revised standard cost and see the inventory and P&L impact plus the balanced revaluation journal entry.',
    cvp: 'Cost-volume-profit: contribution margin, break-even, margin of safety and operating leverage with what-if sliders.',
    capacity: 'Capacity utilization, idle-capacity cost and overhead absorption (applied vs actual) with the variance breakdown.',
    profitability: 'Unit and annualized contribution margin by product; click a product for detail.',
    itemMaster: 'SKU catalog with cost, on-hand and reserve status; personalize columns and click a SKU to drill down.',
    procurement: 'Purchase-order spend, supplier ranking and open commitments; click a supplier for its orders.',
    warehouse: 'On-hand inventory by location with an interactive bin map; click a bin for movement history.',
    projects: 'Project lifecycle (New → … → Close) with WBS tasks, time-phased estimates, resources and EAC/VAC tracking.',
    workforce: 'Headcount, labor cost, overtime/turnover and working-hour efficiency by plant.',
    inventorySubledger: 'Transaction-level inventory receipts, issues and adjustments; group, filter and personalize.',
    costLedger: 'GL-style cost entries (COGS, variances, sales) with grouping and saved views.',
    journal: 'Period standard-cost journal entries; every entry self-balances (debits = credits).',
    diagnostic: 'A consultant’s Day-1 read on the cost system: a weighted health score across five dimensions with recommendations.',
    settings: 'Bring-your-own Anthropic key for live AI, model choice, and scenario export/import/reset.'
  };

  function boot() {
    var d = CACC.store.data();
    document.getElementById('brandSub').textContent = d.group || d.company.name;
    applyTheme(CACC.store.getTheme());
    applyDensity(CACC.store.getDensity());
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
