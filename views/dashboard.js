/* Dashboard view — executive cockpit aggregating every engine. */
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
      var cvp = M.cvpSingle(), dg = M.diagnostic();
      var ops = d.operations;
      var capacity = ops.availableMachineHours ? (ops.actualMachineHours / ops.availableMachineHours) * 100 : 0;
      var totalVarPct = v.totals.standardCost ? (v.totals.totalVariance / v.totals.standardCost) * 100 : 0;

      // KPI row
      var varClass = CACC.VarianceEngine.classify(v.totals.totalVariance);
      var kpis = el('div', { class: 'grid g4' }, [
        ui.kpi('Total variance', fmt.variance(v.totals.totalVariance),
          fmt.pct(Math.abs(totalVarPct)) + ' of standard cost', 'variance',
          varClass.favorable === false ? 'unfav' : varClass.favorable === true ? 'fav' : ''),
        ui.kpi('Gross margin', fmt.pct(d.diagnostic.grossMarginPct * 100), 'Period operating margin', 'margin'),
        ui.kpi('Inventory on hand', fmt.money0(val.fifo.endingInventory), 'FIFO ending value', 'box'),
        ui.kpi('Capacity utilization', fmt.pct(capacity), ops.actualMachineHours + ' / ' + ops.availableMachineHours + ' machine hrs', 'gauge')
      ]);

      // Variance-by-category card
      var rows = [
        ['Direct material', v.material.total], ['Direct labor', v.labor.total],
        ['Variable overhead', v.varOH.total], ['Fixed overhead', v.fixedOH.total]
      ];
      var tbody = el('tbody');
      rows.forEach(function (r) {
        tbody.appendChild(el('tr', {}, [
          el('td', { text: r[0] }), ui.vcell(r[1]),
          el('td', {}, [ui.badgeFor(r[1])])
        ]));
      });
      tbody.appendChild(el('tr', { class: 'total' }, [
        el('td', { text: 'Total manufacturing variance' }), ui.vcell(v.totals.totalVariance), el('td', {}, [ui.badgeFor(v.totals.totalVariance)])
      ]));
      var varTable = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'Cost element' }), el('th', { class: 'num', text: 'Variance' }), el('th', { text: 'Status' })])),
        tbody
      ]);

      // Cost-flow strip
      var flowStrip = el('div', { class: 'flow' }, [
        flowBox('Materials used', flow.directMaterialsUsed),
        arrow(), flowBox('Cost of goods mfd', flow.costOfGoodsManufactured),
        arrow(), flowBox('Adjusted COGS', flow.adjustedCOGS),
        arrow(), flowBox('Overhead ' + ab.label, ab.variance, true)
      ]);

      // Diagnostic mini
      var diagMini = el('div', { class: 'card kpi' }, [
        el('div', { class: 'kpi-label' }, [CACC.icon('diagnostic', 'kpi-ico'), 'Cost-system health']),
        el('div', { class: 'kpi-value', text: dg.overall + ' / 100' }),
        el('div', { class: 'kpi-foot' }, [el('span', { class: 'badge ' + ratingClass(dg.overall), text: dg.rating })])
      ]);
      var cvpMini = el('div', { class: 'card kpi' }, [
        el('div', { class: 'kpi-label' }, [CACC.icon('cvp', 'kpi-ico'), 'Margin of safety']),
        el('div', { class: 'kpi-value', text: fmt.pct(cvp.marginOfSafety.ratio * 100) }),
        el('div', { class: 'kpi-foot', text: 'Break-even ' + fmt.num(cvp.breakEvenUnits, 0) + ' units' })
      ]);

      c.appendChild(kpis);
      c.appendChild(el('div', { class: 'section-title', text: 'Manufacturing cost flow' }));
      c.appendChild(ui.card(null, null, [flowStrip]));
      c.appendChild(el('div', { class: 'section-title', text: 'Variance & advisory' }));
      var split = el('div', { class: 'grid', style: 'grid-template-columns: 1.4fr 1fr;' }, [
        ui.card('Variance by cost element', d.standardCosting.productName, [varTable]),
        el('div', { class: 'grid', style: 'grid-template-columns:1fr;align-content:start;' }, [diagMini, cvpMini])
      ]);
      c.appendChild(split);
      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('dashboard', M.ctx.dashboard()));

      // Waterfall chart
      c.appendChild(el('div', { class: 'section-title', text: 'Variance bridge' }));
      var canvasCard = ui.card('Standard → Actual cost bridge', 'Positive bars = unfavorable', [
        el('div', { class: 'chart-wrap' }, [el('canvas', { id: 'dashWaterfall' })])
      ]);
      c.appendChild(canvasCard);
      drawWaterfall(document.getElementById('dashWaterfall'), v);

      function flowBox(label, val, signed) {
        return el('div', { class: 'flow-box' }, [
          el('div', { class: 'lbl', text: label }),
          el('div', { class: 'val', text: signed ? fmt.money0(Math.abs(val)) : fmt.money0(val) })
        ]);
      }
      function arrow() { return el('div', { class: 'flow-arrow', text: '→' }); }
    }
  };

  function ratingClass(score) { return score >= 85 ? 'sb-good' : score >= 70 ? 'sb-good' : score >= 55 ? 'sb-warn' : 'sb-bad'; }

  function drawWaterfall(canvas, v) {
    if (!canvas) return;
    var t = CACC.chartTheme();
    var steps = [
      { label: 'Standard', val: v.totals.standardCost, type: 'anchor' },
      { label: 'Material', val: v.material.total },
      { label: 'Labor', val: v.labor.total },
      { label: 'Var OH', val: v.varOH.total },
      { label: 'Fixed OH', val: v.fixedOH.total },
      { label: 'Actual', val: v.totals.actualCost, type: 'anchor' }
    ];
    var labels = [], floats = [], colors = [];
    var running = 0;
    steps.forEach(function (s) {
      labels.push(s.label);
      if (s.type === 'anchor') {
        floats.push([0, s.val]); colors.push(t.accent); running = s.val;
      } else {
        var start = running, end = running + s.val;
        floats.push([start, end]); colors.push(s.val >= 0 ? t.bad : t.good); running = end;
      }
    });
    CACC.chart(canvas, {
      type: 'bar',
      data: { labels: labels, datasets: [{ data: floats, backgroundColor: colors, borderRadius: 4, barPercentage: 0.7 }] },
      options: {
        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false },
          tooltip: { callbacks: { label: function (ctx) { var a = ctx.raw; return CACC.fmt.money(Math.abs(a[1] - a[0])); } } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: t.text } },
          y: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (val) { return '$' + (val / 1000) + 'k'; } } }
        }
      }
    });
  }
})(typeof window !== 'undefined' ? window : this);
