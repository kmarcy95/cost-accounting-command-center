/* Standard Costing & Variance view — editable standards/actuals, live variance bridge. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.standardCosting = {
    title: 'Standard Costing & Variance',
    render: function (c) {
      var sc = CACC.store.data().standardCosting;
      var localChart = null;

      var resultsRegion = el('div', {});
      var aiRegion = el('div', {});

      function numField(key, label, step) {
        var input = el('input', {
          type: 'number', step: step || 'any', value: sc[key], class: 'num',
          oninput: function () { sc[key] = parseFloat(input.value) || 0; CACC.store.save(); recompute(); }
        });
        return el('div', { class: 'field' }, [el('label', { text: label }), input]);
      }

      var inputsCard = ui.card('Inputs — ' + sc.productName, 'Edit any value to recompute live', [
        el('div', { class: 'section-title', text: 'Direct material', style: 'margin-top:0' }),
        el('div', { class: 'form-grid' }, [
          numField('standardPrice', 'Std price ($/unit)'), numField('standardQty', 'Std quantity'),
          numField('actualPrice', 'Actual price ($/unit)'), numField('actualQty', 'Actual quantity')
        ]),
        el('div', { class: 'section-title', text: 'Direct labor' }),
        el('div', { class: 'form-grid' }, [
          numField('standardRate', 'Std rate ($/hr)'), numField('standardHours', 'Std hours'),
          numField('actualRate', 'Actual rate ($/hr)'), numField('actualHours', 'Actual hours')
        ]),
        el('div', { class: 'section-title', text: 'Overhead' }),
        el('div', { class: 'form-grid' }, [
          numField('standardVarRate', 'Std var OH rate ($/hr)'), numField('actualVOH', 'Actual variable OH ($)'),
          numField('budgetedFOH', 'Budgeted fixed OH ($)'), numField('standardFixedRate', 'Std fixed rate ($/hr)'),
          numField('actualFOH', 'Actual fixed OH ($)')
        ])
      ]);

      c.appendChild(el('div', { class: 'grid', style: 'grid-template-columns: 1fr;' }, [inputsCard]));
      c.appendChild(el('div', { class: 'section-title', text: 'Results' }));
      c.appendChild(resultsRegion);
      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(aiRegion);

      var refreshAi = CACC.util.debounce(function () {
        clear(aiRegion);
        aiRegion.appendChild(ui.aiPanel('standardCosting', M.ctx.standardCosting()));
      }, 600);

      function recompute() {
        var v = M.variance();
        clear(resultsRegion);

        // KPI strip
        resultsRegion.appendChild(el('div', { class: 'grid g3' }, [
          ui.kpi('Standard cost', fmt.money(v.totals.standardCost), null, 'dollar'),
          ui.kpi('Actual cost', fmt.money(v.totals.actualCost), null, 'dollar'),
          ui.kpi('Total variance', fmt.variance(v.totals.totalVariance),
            v.reconciles ? 'Reconciles ✓' : 'Does not reconcile', 'variance',
            CACC.VarianceEngine.classify(v.totals.totalVariance).favorable === false ? 'unfav' : 'fav')
        ]));

        // Detail table
        var tb = el('tbody');
        addGroup(tb, 'Direct material', [['Price', v.material.price], ['Quantity', v.material.quantity]], v.material.total);
        addGroup(tb, 'Direct labor', [['Rate', v.labor.rate], ['Efficiency', v.labor.efficiency]], v.labor.total);
        addGroup(tb, 'Variable overhead', [['Spending', v.varOH.spending], ['Efficiency', v.varOH.efficiency]], v.varOH.total);
        addGroup(tb, 'Fixed overhead', [['Budget', v.fixedOH.budget], ['Volume', v.fixedOH.volume]], v.fixedOH.total);
        tb.appendChild(el('tr', { class: 'total' }, [
          el('td', { colspan: 2, text: 'Total variance' }), ui.vcell(v.totals.totalVariance), el('td', {}, [ui.badgeFor(v.totals.totalVariance)])
        ]));
        var table = el('table', { class: 'dt' }, [
          el('thead', {}, el('tr', {}, [
            el('th', { text: 'Cost element' }), el('th', { text: 'Component' }),
            el('th', { class: 'num', text: 'Variance' }), el('th', { text: 'Status' })
          ])),
          tb
        ]);
        resultsRegion.appendChild(el('div', { style: 'margin-top:18px' }, [ui.card('Variance breakdown', null, [table])]));

        // Chart
        var chartCard = ui.card('Variance bridge', 'Standard → Actual (positive = unfavorable)', [
          el('div', { class: 'chart-wrap' }, [el('canvas', { id: 'scWaterfall' })])
        ]);
        resultsRegion.appendChild(el('div', { style: 'margin-top:18px' }, [chartCard]));
        if (localChart) { try { localChart.destroy(); } catch (e) {} }
        localChart = drawWaterfall(document.getElementById('scWaterfall'), v);

        refreshAi();
      }

      function addGroup(tb, name, comps, total) {
        comps.forEach(function (comp, i) {
          tb.appendChild(el('tr', { class: 'sub' }, [
            el('td', { text: i === 0 ? name : '' }), el('td', { text: comp[0] }),
            ui.vcell(comp[1]), el('td', {}, [ui.badgeFor(comp[1])])
          ]));
        });
        tb.appendChild(el('tr', {}, [
          el('td', { text: '' }), el('td', { text: name + ' subtotal', style: 'font-weight:600' }),
          ui.vcell(total), el('td', {}, [ui.badgeFor(total)])
        ]));
      }

      recompute();
    }
  };

  function drawWaterfall(canvas, v) {
    if (!canvas) return null;
    var t = CACC.chartTheme();
    var steps = [
      { label: 'Standard', val: v.totals.standardCost, anchor: true },
      { label: 'Material', val: v.material.total }, { label: 'Labor', val: v.labor.total },
      { label: 'Var OH', val: v.varOH.total }, { label: 'Fixed OH', val: v.fixedOH.total },
      { label: 'Actual', val: v.totals.actualCost, anchor: true }
    ];
    var labels = [], floats = [], colors = [], running = 0;
    steps.forEach(function (s) {
      labels.push(s.label);
      if (s.anchor) { floats.push([0, s.val]); colors.push(t.accent); running = s.val; }
      else { floats.push([running, running + s.val]); colors.push(s.val >= 0 ? t.bad : t.good); running += s.val; }
    });
    return CACC.chart(canvas, {
      type: 'bar',
      data: { labels: labels, datasets: [{ data: floats, backgroundColor: colors, borderRadius: 4, barPercentage: 0.7 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { var a = ctx.raw; return CACC.fmt.money(Math.abs(a[1] - a[0])); } } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: t.text } },
          y: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (val) { return '$' + (val / 1000) + 'k'; } } }
        }
      }
    });
  }
})(typeof window !== 'undefined' ? window : this);
