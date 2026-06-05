/* Dashboard view — executive cockpit aggregating every engine (dense, full-width). */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.dashboard = {
    title: 'Cost Accounting Dashboard',
    render: function (c) {
      var d = CACC.store.data();
      var v = M.variance(), val = M.valuation(), flow = M.costFlow(), ab = M.absorption();
      var cvp = M.cvpSingle(), dg = M.diagnostic(), res = M.reserve(), je = M.journal(), alerts = M.alerts();
      var ops = d.operations;
      var capacity = ops.availableMachineHours ? (ops.actualMachineHours / ops.availableMachineHours) * 100 : 0;
      var totalVarPct = v.totals.standardCost ? (v.totals.totalVariance / v.totals.standardCost) * 100 : 0;
      var varClass = CACC.VarianceEngine.classify(v.totals.totalVariance);

      // --- KPI row 1 ---
      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Total variance', fmt.variance(v.totals.totalVariance), fmt.pct(Math.abs(totalVarPct)) + ' of standard cost', 'variance',
          varClass.favorable === false ? 'unfav' : varClass.favorable === true ? 'fav' : ''),
        ui.kpi('Gross margin', fmt.pct(d.diagnostic.grossMarginPct * 100), 'Period operating margin', 'margin'),
        ui.kpi('Inventory (net)', fmt.money0(res.totals.netValue), fmt.money0(res.totals.grossValue) + ' gross', 'box'),
        ui.kpi('Capacity utilization', fmt.pct(capacity), ops.actualMachineHours + ' / ' + ops.availableMachineHours + ' machine hrs', 'gauge')
      ]));
      // --- KPI row 2 ---
      c.appendChild(el('div', { class: 'grid g4', style: 'margin-top:18px' }, [
        ui.kpi('Inventory reserve', fmt.money0(res.totals.combinedReserve), fmt.pct(res.totals.reservePct * 100) + ' of gross · ' + res.totals.itemsReserved + ' SKUs', 'warning', 'unfav'),
        ui.kpi('Adjusted COGS', fmt.money0(flow.adjustedCOGS), 'COGM ' + fmt.money0(flow.costOfGoodsManufactured), 'dollar'),
        ui.kpi('Margin of safety', fmt.pct(cvp.marginOfSafety.ratio * 100), 'Break-even ' + fmt.num(cvp.breakEvenUnits, 0) + ' units', 'cvp'),
        ui.kpi('Cost-system health', dg.overall + ' / 100', dg.rating, 'diagnostic', dg.overall >= 70 ? 'fav' : 'unfav')
      ]));

      // --- Trend + alerts ---
      c.appendChild(el('div', { class: 'section-title', text: 'Performance trend & alerts' }));
      c.appendChild(el('div', { class: 'grid', style: 'grid-template-columns: 1.5fr 1fr' }, [
        ui.card('6-month variance & margin', 'Click “Trends” for the full time series', [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'dashTrend' })])]),
        alertsCard(alerts)
      ]));

      // --- Cost flow strip ---
      c.appendChild(el('div', { class: 'section-title', text: 'Manufacturing cost flow' }));
      c.appendChild(ui.card(null, null, [el('div', { class: 'flow' }, [
        fb('Materials used', flow.directMaterialsUsed), arrow(), fb('Cost of goods mfd', flow.costOfGoodsManufactured),
        arrow(), fb('Adjusted COGS', flow.adjustedCOGS), arrow(), fb('Overhead ' + ab.label, Math.abs(ab.variance))
      ])]));

      // --- Variance table | donut | top reserved ---
      c.appendChild(el('div', { class: 'section-title', text: 'Variance & inventory exposure' }));
      var rows = [['Direct material', v.material.total], ['Direct labor', v.labor.total], ['Variable overhead', v.varOH.total], ['Fixed overhead', v.fixedOH.total]];
      var tbody = el('tbody');
      rows.forEach(function (r) { tbody.appendChild(el('tr', {}, [el('td', { text: r[0] }), ui.vcell(r[1]), el('td', {}, [ui.badgeFor(r[1])])])); });
      tbody.appendChild(el('tr', { class: 'total' }, [el('td', { text: 'Total' }), ui.vcell(v.totals.totalVariance), el('td', {}, [ui.badgeFor(v.totals.totalVariance)])]));
      var varTable = ui.card('Variance by cost element', d.standardCosting.productName, [
        el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Cost element' }), el('th', { class: 'num', text: 'Variance' }), el('th', { text: 'Status' })])), tbody])
      ]);
      var donut = ui.card('Variance composition', 'absolute $ by element', [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'dashDonut' })])]);
      var topItems = res.items.slice().filter(function (x) { return x.combinedReserve > 0; }).sort(function (a, b) { return b.combinedReserve - a.combinedReserve; }).slice(0, 5);
      var resBody = el('tbody');
      topItems.forEach(function (it) {
        resBody.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { CACC.navigate('inventoryReserve'); } }, [
          el('td', {}, [el('strong', { text: it.sku })]), el('td', { class: 'num tnum unfav', text: fmt.money0(it.combinedReserve) }), el('td', { class: 'num tnum', text: fmt.pct(it.reservePct * 100) })
        ]));
      });
      if (!topItems.length) resBody.appendChild(el('tr', {}, [el('td', { colspan: 3, class: 'muted', text: 'No reserves required.' })]));
      var topReserve = ui.card('Top inventory reserves', 'click to open Inventory Reserve', [
        el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'SKU' }), el('th', { class: 'num', text: 'Reserve' }), el('th', { class: 'num', text: '% gross' })])), resBody])
      ]);
      c.appendChild(el('div', { class: 'grid g3' }, [varTable, donut, topReserve]));

      // --- AI ---
      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('dashboard', M.ctx.dashboard()));

      // --- Variance bridge ---
      c.appendChild(el('div', { class: 'section-title', text: 'Variance bridge' }));
      c.appendChild(ui.card('Standard → Actual cost bridge', 'Positive bars = unfavorable', [el('div', { class: 'chart-wrap' }, [el('canvas', { id: 'dashWaterfall' })])]));

      // --- Recent journal entries ---
      c.appendChild(el('div', { class: 'section-title', text: 'Recent journal entries' }));
      var jeBody = el('tbody');
      je.entries.forEach(function (e) {
        jeBody.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { CACC.navigate('journal'); } }, [
          el('td', {}, [el('strong', { text: e.ref })]), el('td', { text: e.memo }),
          el('td', { class: 'num tnum', text: fmt.money0(e.debit) }), el('td', {}, [el('span', { class: 'badge ' + (e.balanced ? 'sb-good' : 'sb-bad'), text: e.balanced ? '✓' : '!' })])
        ]));
      });
      c.appendChild(ui.card(null, 'Trial balance: ' + (je.allBalanced ? 'in balance' : 'review') + ' · ' + fmt.money0(je.totalDebits) + ' total', [
        el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Ref' }), el('th', { text: 'Memo' }), el('th', { class: 'num', text: 'Amount' }), el('th', { text: 'Bal' })])), jeBody])
      ]));

      // charts
      drawTrend(document.getElementById('dashTrend'), M.history());
      drawDonut(document.getElementById('dashDonut'), v);
      drawWaterfall(document.getElementById('dashWaterfall'), v);

      function fb(label, val) { return el('div', { class: 'flow-box' }, [el('div', { class: 'lbl', text: label }), el('div', { class: 'val', text: fmt.money0(val) })]); }
      function arrow() { return el('div', { class: 'flow-arrow', text: '→' }); }
    }
  };

  function alertsCard(alerts) {
    var body = el('div', { class: 'card-pad', style: 'padding-top:6px' });
    if (!alerts.length) body.appendChild(el('div', { class: 'note', style: 'margin-top:10px', text: 'No active alerts — all monitored thresholds are within tolerance.' }));
    alerts.forEach(function (a) {
      var cls = a.level === 'High' ? 'sb-bad' : a.level === 'Medium' ? 'sb-warn' : 'sb-neutral';
      body.appendChild(el('div', { style: 'display:flex;gap:11px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer',
        onclick: function () { CACC.navigate(a.key); } }, [
        el('span', { class: 'badge ' + cls, text: a.level, style: 'flex:none;margin-top:1px' }),
        el('div', {}, [el('div', { style: 'font-weight:600;font-size:13.5px', text: a.area }), el('div', { class: 'muted', style: 'font-size:13px', text: a.text })])
      ]));
    });
    return el('div', { class: 'card' }, [el('div', { class: 'card-head' }, [el('h2', { text: 'Alerts' }), el('span', { class: 'badge sb-neutral', text: alerts.length + ' active' })]), body]);
  }

  function drawTrend(canvas, h) {
    if (!canvas) return;
    var t = CACC.chartTheme();
    CACC.chart(canvas, {
      data: { labels: h.map(function (p) { return p.period; }), datasets: [
        { type: 'bar', label: 'Total variance', data: h.map(function (p) { return p.totalVariance; }), backgroundColor: t.bad, borderRadius: 4, yAxisID: 'y' },
        { type: 'line', label: 'Gross margin %', data: h.map(function (p) { return +(p.grossMarginPct * 100).toFixed(1); }), borderColor: t.good, tension: 0.3, yAxisID: 'y1' }
      ] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: t.text } } },
        scales: { x: { grid: { display: false }, ticks: { color: t.text } },
          y: { position: 'left', grid: { color: t.grid }, ticks: { color: t.text, callback: function (val) { return '$' + (val / 1000) + 'k'; } } },
          y1: { position: 'right', grid: { display: false }, ticks: { color: t.text, callback: function (v) { return v + '%'; } } } } }
    });
  }
  function drawDonut(canvas, v) {
    if (!canvas) return;
    var t = CACC.chartTheme();
    CACC.chart(canvas, {
      type: 'doughnut',
      data: { labels: ['Material', 'Labor', 'Var OH', 'Fixed OH'], datasets: [{
        data: [Math.abs(v.material.total), Math.abs(v.labor.total), Math.abs(v.varOH.total), Math.abs(v.fixedOH.total)],
        backgroundColor: t.palette.slice(0, 4), borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: { legend: { position: 'bottom', labels: { color: t.text } }, tooltip: { callbacks: { label: function (ctx) { return ctx.label + ': ' + CACC.fmt.money0(ctx.raw); } } } } }
    });
  }
  function drawWaterfall(canvas, v) {
    if (!canvas) return;
    var t = CACC.chartTheme();
    var steps = [{ label: 'Standard', val: v.totals.standardCost, anchor: true }, { label: 'Material', val: v.material.total },
      { label: 'Labor', val: v.labor.total }, { label: 'Var OH', val: v.varOH.total }, { label: 'Fixed OH', val: v.fixedOH.total },
      { label: 'Actual', val: v.totals.actualCost, anchor: true }];
    var labels = [], floats = [], colors = [], running = 0;
    steps.forEach(function (s) {
      labels.push(s.label);
      if (s.anchor) { floats.push([0, s.val]); colors.push(t.accent); running = s.val; }
      else { floats.push([running, running + s.val]); colors.push(s.val >= 0 ? t.bad : t.good); running += s.val; }
    });
    CACC.chart(canvas, {
      type: 'bar', data: { labels: labels, datasets: [{ data: floats, backgroundColor: colors, borderRadius: 4, barPercentage: 0.7 }] },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { var a = ctx.raw; return CACC.fmt.money(Math.abs(a[1] - a[0])); } } } },
        scales: { x: { grid: { display: false }, ticks: { color: t.text } }, y: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (val) { return '$' + (val / 1000) + 'k'; } } } } }
    });
  }
})(typeof window !== 'undefined' ? window : this);
