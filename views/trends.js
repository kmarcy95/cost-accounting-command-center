/* Trends & Analytics view — 6-month time series (macro-terminal style). */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.trends = {
    title: 'Trends & Analytics',
    render: function (c) {
      var h = M.history();
      var labels = h.map(function (p) { return p.period; });
      var first = h[0], last = h[h.length - 1];

      // KPI deltas
      c.appendChild(el('div', { class: 'grid g4' }, [
        deltaKpi('Total variance', fmt.money0(last.totalVariance), last.totalVariance - first.totalVariance, 'variance', true),
        deltaKpi('Gross margin', fmt.pct(last.grossMarginPct * 100), (last.grossMarginPct - first.grossMarginPct) * 100, 'margin', false, '%'),
        deltaKpi('Reserve ratio', fmt.pct(last.reservePct * 100), (last.reservePct - first.reservePct) * 100, 'warning', true, '%'),
        deltaKpi('Capacity', fmt.pct(last.capacityPct * 100), (last.capacityPct - first.capacityPct) * 100, 'gauge', false, '%')
      ]));

      // Chart grid
      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        chartCard('Total variance ($, unfavorable)', 'trVar'),
        chartCard('Gross margin %', 'trMargin'),
        chartCard('Inventory net value & reserve %', 'trInv'),
        chartCard('Units sold vs. COGS', 'trUnits')
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('trends', M.ctx.trends()));

      var t = CACC.chartTheme();
      // Variance bar
      lineOrBar('trVar', 'bar', [{ label: 'Total variance', data: h.map(function (p) { return p.totalVariance; }), backgroundColor: t.bad, borderRadius: 4 }], labels, money, periodModal);
      // Margin line
      lineOrBar('trMargin', 'line', [{ label: 'Gross margin', data: h.map(function (p) { return +(p.grossMarginPct * 100).toFixed(1); }), borderColor: t.good, backgroundColor: 'rgba(16,124,65,.12)', fill: true, tension: 0.3 }], labels, pct, periodModal);
      // Inventory + reserve (dual axis)
      dualAxis('trInv', labels,
        { label: 'Inventory net', data: h.map(function (p) { return p.inventoryNet; }), type: 'bar', backgroundColor: t.accent, borderRadius: 4, yAxisID: 'y' },
        { label: 'Reserve %', data: h.map(function (p) { return +(p.reservePct * 100).toFixed(1); }), type: 'line', borderColor: t.palette[2], yAxisID: 'y1', tension: 0.3 }, periodModal);
      // Units vs COGS
      dualAxis('trUnits', labels,
        { label: 'Units sold', data: h.map(function (p) { return p.unitsSold; }), type: 'bar', backgroundColor: t.palette[5], borderRadius: 4, yAxisID: 'y' },
        { label: 'COGS', data: h.map(function (p) { return p.cogs; }), type: 'line', borderColor: t.accent, yAxisID: 'y1', tension: 0.3 }, periodModal);

      function money(v) { return CACC.fmt.money0(v); }
      function pct(v) { return v + '%'; }
      function periodModal(i) {
        var p = h[i]; if (!p) return;
        var rows = [['Total variance', fmt.money0(p.totalVariance) + ' U'], ['Gross margin', fmt.pct(p.grossMarginPct * 100)],
          ['Inventory (net)', fmt.money0(p.inventoryNet)], ['Reserve ratio', fmt.pct(p.reservePct * 100)],
          ['Capacity', fmt.pct(p.capacityPct * 100)], ['Units sold', fmt.num(p.unitsSold, 0)], ['COGS', fmt.money0(p.cogs)]];
        var tb = el('tbody');
        rows.forEach(function (r) { tb.appendChild(el('tr', {}, [el('td', { text: r[0] }), el('td', { class: 'num tnum', text: r[1] })])); });
        ui.modal(p.period + ' — period snapshot', [el('table', { class: 'dt' }, [tb])], 'Trends drill-down');
      }
    }
  };

  function deltaKpi(label, value, delta, iconName, lowerBetter, suffix) {
    var improved = lowerBetter ? delta < 0 : delta > 0;
    var arrow = delta === 0 ? '→' : (delta > 0 ? '▲' : '▼');
    var dtxt = arrow + ' ' + (suffix === '%' ? Math.abs(delta).toFixed(1) + ' pts' : CACC.fmt.money0(Math.abs(delta))) + ' vs. 6 mo ago';
    return el('div', { class: 'card kpi' }, [
      el('div', { class: 'kpi-label' }, [CACC.icon(iconName, 'kpi-ico'), label]),
      el('div', { class: 'kpi-value', text: value }),
      el('div', { class: 'kpi-foot ' + (improved ? 'fav' : 'unfav'), text: dtxt })
    ]);
  }
  function chartCard(title, id) {
    return CACC.ui.card(title, null, [el('div', { class: 'chart-wrap' }, [el('canvas', { id: id })])]);
  }
  function lineOrBar(id, type, datasets, labels, fmtFn, onIdx) {
    var canvas = document.getElementById(id); if (!canvas) return;
    var t = CACC.chartTheme();
    CACC.chart(canvas, {
      type: type, data: { labels: labels, datasets: datasets },
      options: { responsive: true, maintainAspectRatio: false,
        onClick: onIdx ? CACC.chartClick(onIdx) : undefined,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return fmtFn(ctx.raw); } } } },
        scales: { x: { grid: { display: false }, ticks: { color: t.text } }, y: { grid: { color: t.grid }, ticks: { color: t.text, callback: fmtFn } } } }
    });
  }
  function dualAxis(id, labels, dsLeft, dsRight, onIdx) {
    var canvas = document.getElementById(id); if (!canvas) return;
    var t = CACC.chartTheme();
    CACC.chart(canvas, {
      data: { labels: labels, datasets: [dsLeft, dsRight] },
      options: { responsive: true, maintainAspectRatio: false,
        onClick: onIdx ? CACC.chartClick(onIdx) : undefined,
        plugins: { legend: { position: 'bottom', labels: { color: t.text } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: t.text } },
          y: { position: 'left', grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } },
          y1: { position: 'right', grid: { display: false }, ticks: { color: t.text } }
        } }
    });
  }
})(typeof window !== 'undefined' ? window : this);
