/* Inventory & Cost Flows view — FIFO/LIFO/WAC + RM->WIP->FG->COGS roll-forward. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.inventory = {
    title: 'Inventory & Cost Flows',
    render: function (c) {
      var inv = CACC.store.data().inventory;
      var val = M.valuation(), flow = M.costFlow(), ab = M.absorption();

      // Method KPIs
      c.appendChild(el('div', { class: 'grid g3' }, [
        methodCard('FIFO', val.fifo, 'First-in, first-out'),
        methodCard('LIFO', val.lifo, 'Last-in, first-out'),
        methodCard('Weighted average', val.weightedAverage, 'Avg cost ' + fmt.money(val.weightedAverage.avgUnitCost) + '/unit')
      ]));

      // Cost layers + valuation table
      var layerTb = el('tbody');
      inv.layers.forEach(function (l) {
        layerTb.appendChild(el('tr', {}, [
          el('td', { text: l.label }), el('td', { class: 'num tnum', text: fmt.num(l.units, 0) }),
          el('td', { class: 'num tnum', text: fmt.money(l.unitCost) }), el('td', { class: 'num tnum', text: fmt.money(l.units * l.unitCost) })
        ]));
      });
      layerTb.appendChild(el('tr', { class: 'total' }, [
        el('td', { text: 'Available for sale' }), el('td', { class: 'num tnum', text: fmt.num(val.unitsAvailable, 0) }),
        el('td', { text: '' }), el('td', { class: 'num tnum', text: fmt.money(val.costAvailable) })
      ]));
      layerTb.appendChild(el('tr', { class: 'sub' }, [
        el('td', { text: 'Units sold this period' }), el('td', { class: 'num tnum', text: fmt.num(val.unitsSold, 0) }), el('td', {}), el('td', {})
      ]));

      var cmpTb = el('tbody');
      [['FIFO', val.fifo], ['LIFO', val.lifo], ['Weighted average', val.weightedAverage]].forEach(function (m) {
        cmpTb.appendChild(el('tr', {}, [
          el('td', { text: m[0] }), el('td', { class: 'num tnum', text: fmt.money(m[1].cogs) }),
          el('td', { class: 'num tnum', text: fmt.money(m[1].endingInventory) })
        ]));
      });

      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        ui.card('Cost layers — ' + inv.itemName, null, [
          el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [
            el('th', { text: 'Layer' }), el('th', { class: 'num', text: 'Units' }), el('th', { class: 'num', text: 'Unit cost' }), el('th', { class: 'num', text: 'Total' })
          ])), layerTb])
        ]),
        ui.card('COGS & ending inventory by method', null, [
          el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [
            el('th', { text: 'Method' }), el('th', { class: 'num', text: 'COGS' }), el('th', { class: 'num', text: 'Ending inventory' })
          ])), cmpTb]),
          el('div', { class: 'chart-wrap sm', style: 'margin-top:14px' }, [el('canvas', { id: 'invChart' })])
        ])
      ]));
      drawInvChart(document.getElementById('invChart'), val);

      // Cost-flow roll-forward
      c.appendChild(el('div', { class: 'section-title', text: 'Manufacturing cost flow (RM → WIP → FG → COGS)' }));
      c.appendChild(ui.card(null, null, [
        el('div', { class: 'flow' }, [
          fb('Direct materials used', flow.directMaterialsUsed), arrow(),
          fb('Total mfg cost', flow.totalManufacturingCost), arrow(),
          fb('Cost of goods mfd', flow.costOfGoodsManufactured), arrow(),
          fb('Unadjusted COGS', flow.unadjustedCOGS), arrow(),
          fb('Adjusted COGS', flow.adjustedCOGS)
        ]),
        el('div', { class: 'note', style: 'margin-top:16px' },
          'Overhead is ' + ab.label + ' by ' + fmt.money(Math.abs(ab.variance)) + ' (' + fmt.pct(ab.absorptionRatePct) +
          ' of actual absorbed). The ' + flow.overUnderLabel + ' overhead of ' + fmt.money(Math.abs(flow.overUnderApplied)) +
          ' is ' + (flow.overUnderApplied >= 0 ? 'added to' : 'deducted from') + ' COGS.')
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('inventory', M.ctx.inventory()));

      function fb(label, v) { return el('div', { class: 'flow-box' }, [el('div', { class: 'lbl', text: label }), el('div', { class: 'val', text: fmt.money0(v) })]); }
      function arrow() { return el('div', { class: 'flow-arrow', text: '→' }); }
    }
  };

  function methodCard(name, m, sub) {
    return el('div', { class: 'card kpi' }, [
      el('div', { class: 'kpi-label' }, [CACC.icon('box', 'kpi-ico'), name + ' ending inventory']),
      el('div', { class: 'kpi-value', text: fmt.money0(m.endingInventory) }),
      el('div', { class: 'kpi-foot', text: 'COGS ' + fmt.money0(m.cogs) + ' · ' + sub })
    ]);
  }

  function drawInvChart(canvas, val) {
    if (!canvas) return;
    var t = CACC.chartTheme();
    CACC.chart(canvas, {
      type: 'bar',
      data: {
        labels: ['FIFO', 'LIFO', 'Weighted avg'],
        datasets: [
          { label: 'COGS', data: [val.fifo.cogs, val.lifo.cogs, val.weightedAverage.cogs], backgroundColor: t.palette[4], borderRadius: 4 },
          { label: 'Ending inventory', data: [val.fifo.endingInventory, val.lifo.endingInventory, val.weightedAverage.endingInventory], backgroundColor: t.accent, borderRadius: 4 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: t.text } } },
        scales: { x: { stacked: true, grid: { display: false }, ticks: { color: t.text } }, y: { stacked: true, grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } } }
      }
    });
  }
})(typeof window !== 'undefined' ? window : this);
