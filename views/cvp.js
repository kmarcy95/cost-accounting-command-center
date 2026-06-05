/* CVP & Break-Even view — interactive sliders + break-even chart + multi-product mix. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.cvp = {
    title: 'CVP & Break-Even Analysis',
    render: function (c) {
      var s = CACC.store.data().cvp.single;
      var kpiReg = el('div', {}), chartCard, localChart = null, aiReg = el('div', {});

      function slider(key, label, min, max, step, fmtFn) {
        var rv = el('span', { class: 'rv', text: fmtFn(s[key]) });
        var input = el('input', { type: 'range', min: min, max: max, step: step, value: s[key],
          oninput: function () { s[key] = parseFloat(input.value); rv.textContent = fmtFn(s[key]); CACC.store.save(); recompute(); } });
        return el('div', { class: 'range-row' }, [el('label', { text: label }), input, rv]);
      }

      var controls = ui.card('Assumptions — ' + s.productName, 'Drag to model price, cost & volume', [
        slider('price', 'Selling price', 60, 200, 1, function (v) { return fmt.money0(v); }),
        slider('variableCost', 'Variable cost/unit', 20, 150, 1, function (v) { return fmt.money0(v); }),
        slider('fixedCost', 'Fixed costs', 50000, 400000, 5000, function (v) { return fmt.money0(v); }),
        slider('actualUnits', 'Current volume (units)', 0, 16000, 100, function (v) { return fmt.num(v, 0); }),
        slider('targetProfit', 'Target profit', 0, 200000, 5000, function (v) { return fmt.money0(v); })
      ]);

      c.appendChild(controls);
      c.appendChild(el('div', { class: 'section-title', text: 'Results' }));
      c.appendChild(kpiReg);
      chartCard = ui.card('Break-even chart', 'Revenue vs. total cost', [el('div', { class: 'chart-wrap' }, [el('canvas', { id: 'cvpChart' })])]);
      c.appendChild(el('div', { style: 'margin-top:18px' }, [chartCard]));

      // Multi-product mix (static seed display)
      var mp = M.cvpMulti(), mm = CACC.store.data().cvp.multi;
      var mpTb = el('tbody');
      mp.perProduct.forEach(function (p, i) {
        mpTb.appendChild(el('tr', {}, [
          el('td', { text: p.name }), el('td', { class: 'num tnum', text: fmt.money(mm.products[i].cmUnit) }),
          el('td', { class: 'num tnum', text: fmt.pct(mm.products[i].mix * 100, 0) }), el('td', { class: 'num tnum', text: fmt.num(p.units, 0) })
        ]));
      });
      mpTb.appendChild(el('tr', { class: 'total' }, [
        el('td', { text: 'Weighted-avg CM / break-even' }), el('td', { class: 'num tnum', text: fmt.money(mp.weightedAvgCm) }),
        el('td', {}), el('td', { class: 'num tnum', text: fmt.num(mp.breakEvenPackages, 0) })
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Multi-product break-even (sales mix)' }));
      c.appendChild(ui.card(null, 'Fixed costs ' + fmt.money0(mm.fixedCost), [
        el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [
          el('th', { text: 'Product' }), el('th', { class: 'num', text: 'Unit CM' }), el('th', { class: 'num', text: 'Sales mix' }), el('th', { class: 'num', text: 'Break-even units' })
        ])), mpTb])
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(aiReg);

      var refreshAi = CACC.util.debounce(function () {
        clear(aiReg);
        aiReg.appendChild(ui.aiPanel('cvp', M.ctx.cvp()));
      }, 600);

      function recompute() {
        var r = M.cvpSingle();
        clear(kpiReg);
        kpiReg.appendChild(el('div', { class: 'grid g4' }, [
          ui.kpi('Unit contribution margin', fmt.money(r.cmUnit), fmt.pct(r.cmRatio * 100) + ' ratio', 'margin'),
          ui.kpi('Break-even', fmt.num(r.breakEvenUnits, 0) + ' u', fmt.money0(r.breakEvenDollars), 'cvp'),
          ui.kpi('Margin of safety', fmt.pct(r.marginOfSafety.ratio * 100), fmt.money0(r.marginOfSafety.dollars), 'gauge',
            r.marginOfSafety.ratio < 0 ? 'unfav' : ''),
          ui.kpi('Operating income', fmt.money0(r.netOperatingIncome), 'DOL ' + fmt.num(r.degreeOperatingLeverage, 2) + 'x', 'dollar',
            r.netOperatingIncome < 0 ? 'unfav' : 'fav')
        ]));
        var tp = el('div', { class: 'note', style: 'margin-top:14px' },
          'To earn a ' + fmt.money0(s.targetProfit) + ' target profit requires ' + fmt.num(r.targetProfitUnits, 0) + ' units (' +
          fmt.money0(r.targetProfitUnits * s.price) + ' in sales).');
        kpiReg.appendChild(tp);

        if (localChart) { try { localChart.destroy(); } catch (e) {} }
        localChart = drawBreakEven(document.getElementById('cvpChart'), s, r);

        refreshAi();
      }
      recompute();
    }
  };

  function drawBreakEven(canvas, s, r) {
    if (!canvas) return null;
    var t = CACC.chartTheme();
    var maxUnits = Math.max(s.actualUnits, r.breakEvenUnits) * 1.4 || 10000;
    var steps = 8, labels = [], rev = [], cost = [];
    for (var i = 0; i <= steps; i++) {
      var u = Math.round(maxUnits / steps * i);
      labels.push(fmt.num(u, 0));
      rev.push(u * s.price);
      cost.push(s.fixedCost + u * s.variableCost);
    }
    return CACC.chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Revenue', data: rev, borderColor: t.accent, backgroundColor: t.accentSoft, fill: false, tension: 0 },
          { label: 'Total cost', data: cost, borderColor: t.bad, fill: false, tension: 0 },
          { label: 'Fixed cost', data: labels.map(function () { return s.fixedCost; }), borderColor: t.text, borderDash: [5, 5], pointRadius: 0, fill: false }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: t.text } }, tooltip: { callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + CACC.fmt.money0(ctx.raw); } } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: t.text }, title: { display: true, text: 'Units', color: t.text } },
          y: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } }
        }
      }
    });
  }
})(typeof window !== 'undefined' ? window : this);
