/* Product Costing view — Job-Order / Process / ABC sub-tabs. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.productCosting = {
    title: 'Product Costing',
    render: function (c) {
      var active = 'job';
      var tabsBar = el('div', { class: 'tabs' });
      var pane = el('div', {});
      [['job', 'Job-Order'], ['process', 'Process'], ['abc', 'Activity-Based']].forEach(function (t) {
        var b = el('button', { class: 'tab' + (t[0] === active ? ' active' : ''), text: t[1],
          onclick: function () {
            active = t[0];
            tabsBar.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); });
            b.classList.add('active'); renderPane();
          } });
        tabsBar.appendChild(b);
      });
      c.appendChild(tabsBar);
      c.appendChild(pane);
      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('productCosting', M.ctx.productCosting()));

      function renderPane() {
        clear(pane);
        if (active === 'job') renderJob(pane);
        else if (active === 'process') renderProcess(pane);
        else renderAbc(pane);
      }
      renderPane();
    }
  };

  function renderJob(pane) {
    var jo = CACC.store.data().jobOrder;
    var resReg = el('div', {});
    function numField(key, label) {
      var input = el('input', { type: 'number', step: 'any', value: jo[key], class: 'num',
        oninput: function () { jo[key] = parseFloat(input.value) || 0; CACC.store.save(); recompute(); } });
      return el('div', { class: 'field' }, [el('label', { text: label }), input]);
    }
    pane.appendChild(CACC.ui.card('Inputs — ' + jo.jobName, 'Job-order cost accumulation', [
      el('div', { class: 'form-grid' }, [
        numField('directMaterials', 'Direct materials ($)'), numField('directLabor', 'Direct labor ($)'),
        numField('pohr', 'POHR ($/' + jo.driverLabel + ')'), numField('driverQty', jo.driverLabel + ' used'),
        numField('units', 'Units in job')
      ])
    ]));
    pane.appendChild(el('div', { style: 'margin-top:18px' }, [resReg]));
    function recompute() {
      var r = CACC.model.job();
      clear(resReg);
      resReg.appendChild(el('div', { class: 'grid g4' }, [
        CACC.ui.kpi('Direct materials', fmt.money(r.directMaterials), null, 'box'),
        CACC.ui.kpi('Direct labor', fmt.money(r.directLabor), null, 'dollar'),
        CACC.ui.kpi('Applied overhead', fmt.money(r.appliedOverhead), jo.pohr + ' × ' + jo.driverQty, 'gauge'),
        CACC.ui.kpi('Unit cost', fmt.money(r.unitCost), r.units + ' units', 'product')
      ]));
      var tb = el('tbody', {}, [
        row('Direct materials', r.directMaterials), row('Direct labor', r.directLabor),
        row('Applied manufacturing overhead', r.appliedOverhead),
        el('tr', { class: 'total' }, [el('td', { text: 'Total job cost' }), el('td', { class: 'num tnum', text: fmt.money(r.totalCost) })])
      ]);
      resReg.appendChild(el('div', { style: 'margin-top:18px' }, [CACC.ui.card('Cost build-up', null, [
        el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Component' }), el('th', { class: 'num', text: 'Amount' })])), tb])
      ])]));
    }
    function row(label, val) { return el('tr', {}, [el('td', { text: label }), el('td', { class: 'num tnum', text: fmt.money(val) })]); }
    recompute();
  }

  function renderProcess(pane) {
    var p = CACC.store.data().process, r = CACC.model.process();
    pane.appendChild(el('div', { class: 'grid g3' }, [
      CACC.ui.kpi('Cost / equiv. unit', fmt.money(r.costPerEu.total), 'Materials + conversion', 'product'),
      CACC.ui.kpi('Cost completed', fmt.money(r.costCompleted), p.completedUnits + ' units', 'dollar'),
      CACC.ui.kpi('Ending WIP cost', fmt.money(r.costEndingWip), p.endingUnits + ' units', 'box')
    ]));
    // Equivalent units
    var euTb = el('tbody', {}, [
      el('tr', {}, [el('td', { text: 'Completed & transferred out' }), el('td', { class: 'num tnum', text: fmt.num(p.completedUnits, 0) }), el('td', { class: 'num tnum', text: fmt.num(p.completedUnits, 0) })]),
      el('tr', {}, [el('td', { text: 'Ending WIP (' + (p.endingPctMaterials * 100) + '% mat / ' + (p.endingPctConversion * 100) + '% conv)' }),
        el('td', { class: 'num tnum', text: fmt.num(p.endingUnits * p.endingPctMaterials, 0) }), el('td', { class: 'num tnum', text: fmt.num(p.endingUnits * p.endingPctConversion, 0) })]),
      el('tr', { class: 'total' }, [el('td', { text: 'Equivalent units' }), el('td', { class: 'num tnum', text: fmt.num(r.equivalentUnits.materials, 0) }), el('td', { class: 'num tnum', text: fmt.num(r.equivalentUnits.conversion, 0) })]),
      el('tr', {}, [el('td', { text: 'Cost per equivalent unit' }), el('td', { class: 'num tnum', text: fmt.money(r.costPerEu.materials) }), el('td', { class: 'num tnum', text: fmt.money(r.costPerEu.conversion) })])
    ]);
    pane.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
      CACC.ui.card('Equivalent units (weighted-average) — ' + p.departmentName, null, [
        el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Flow' }), el('th', { class: 'num', text: 'Materials' }), el('th', { class: 'num', text: 'Conversion' })])), euTb])
      ]),
      CACC.ui.card('Cost reconciliation', r.reconciles ? 'Costs reconcile ✓' : 'Discrepancy — review', [
        el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Assignment' }), el('th', { class: 'num', text: 'Cost' })])),
          el('tbody', {}, [
            el('tr', {}, [el('td', { text: 'To completed units' }), el('td', { class: 'num tnum', text: fmt.money(r.costCompleted) })]),
            el('tr', {}, [el('td', { text: 'To ending WIP' }), el('td', { class: 'num tnum', text: fmt.money(r.costEndingWip) })]),
            el('tr', { class: 'total' }, [el('td', { text: 'Total cost accounted for' }), el('td', { class: 'num tnum', text: fmt.money(r.totalCostAssigned) })]),
            el('tr', { class: 'sub' }, [el('td', { text: 'Total cost to account for' }), el('td', { class: 'num tnum', text: fmt.money(r.totalCostToAccount) })])
          ])])
      ])
    ]));
  }

  function renderAbc(pane) {
    var a = CACC.store.data().abc, r = CACC.model.abc();
    // Activity rates
    var ratesTb = el('tbody');
    a.pools.forEach(function (pool) {
      ratesTb.appendChild(el('tr', {}, [
        el('td', { text: pool.name }), el('td', { class: 'num tnum', text: fmt.money0(pool.cost) }),
        el('td', { class: 'num tnum', text: fmt.num(pool.driverTotal, 0) + ' ' + pool.driverLabel }),
        el('td', { class: 'num tnum', text: fmt.money(r.activityRates[pool.name]) })
      ]));
    });
    ratesTb.appendChild(el('tr', { class: 'total' }, [
      el('td', { text: 'Total overhead' }), el('td', { class: 'num tnum', text: fmt.money0(r.totalOverhead) }),
      el('td', { text: 'Plant-wide rate' }), el('td', { class: 'num tnum', text: fmt.money(r.traditionalRate) + ' / ' + a.traditionalLabel })
    ]));
    pane.appendChild(CACC.ui.card('Activity cost pools & driver rates', null, [
      el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [
        el('th', { text: 'Activity pool' }), el('th', { class: 'num', text: 'Pool cost' }),
        el('th', { class: 'num', text: 'Driver volume' }), el('th', { class: 'num', text: 'Rate' })
      ])), ratesTb])
    ]));

    // Comparison table + chart
    var cmpTb = el('tbody');
    r.products.forEach(function (prod) {
      var over = prod.unitDistortion > 0;
      cmpTb.appendChild(el('tr', {}, [
        el('td', { text: prod.name }),
        el('td', { class: 'num tnum', text: fmt.money(prod.abcUnitCost) }),
        el('td', { class: 'num tnum', text: fmt.money(prod.traditionalUnitCost) }),
        el('td', { class: 'num tnum ' + (over ? 'unfav' : 'fav') }, (over ? '+' : '') + fmt.money(prod.unitDistortion)),
        el('td', {}, [el('span', { class: 'badge ' + (over ? 'sb-bad' : 'sb-good'), text: over ? 'Over-costed' : 'Under-costed' })])
      ]));
    });
    pane.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
      CACC.ui.card('ABC vs. traditional — per-unit cost', 'Distortion = traditional − ABC', [
        el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [
          el('th', { text: 'Product' }), el('th', { class: 'num', text: 'ABC /u' }), el('th', { class: 'num', text: 'Traditional /u' }),
          el('th', { class: 'num', text: 'Distortion' }), el('th', { text: 'Effect' })
        ])), cmpTb])
      ]),
      CACC.ui.card('Allocation comparison', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'abcChart' })])])
    ]));
    drawAbc(document.getElementById('abcChart'), r);
  }

  function drawAbc(canvas, r) {
    if (!canvas) return;
    var t = CACC.chartTheme();
    CACC.chart(canvas, {
      type: 'bar',
      data: {
        labels: r.products.map(function (p) { return p.name; }),
        datasets: [
          { label: 'ABC unit cost', data: r.products.map(function (p) { return p.abcUnitCost; }), backgroundColor: t.accent, borderRadius: 4 },
          { label: 'Traditional unit cost', data: r.products.map(function (p) { return p.traditionalUnitCost; }), backgroundColor: t.palette[2], borderRadius: 4 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: t.text } }, tooltip: { callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + CACC.fmt.money(ctx.raw); } } } },
        scales: { x: { grid: { display: false }, ticks: { color: t.text } }, y: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + v; } } } }
      }
    });
  }
})(typeof window !== 'undefined' ? window : this);
