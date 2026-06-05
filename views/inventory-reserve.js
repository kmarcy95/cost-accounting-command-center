/* Inventory Reserve view — multi-item LCNRV + Excess & Obsolete reserve with drill-down. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.inventoryReserve = {
    title: 'Inventory Reserve Analysis',
    render: function (c) {
      var data = CACC.store.data();
      var res = M.reserve();
      var rawBySku = {}; data.items.forEach(function (it) { rawBySku[it.sku] = it; });
      var t = res.totals;

      // KPIs
      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Gross inventory', fmt.money0(t.grossValue), data.items.length + ' SKUs', 'box'),
        ui.kpi('Combined reserve', fmt.money0(t.combinedReserve), fmt.pct(t.reservePct * 100) + ' of gross', 'warning', 'unfav'),
        ui.kpi('Net realizable value', fmt.money0(t.netValue), 'carried on the books', 'margin'),
        ui.kpi('Items reserved', t.itemsReserved + ' / ' + res.items.length, 'require a write-down', 'variance', t.itemsReserved ? 'unfav' : 'fav')
      ]));

      // Reserve composition + by category chart
      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        ui.card('Reserve composition', 'Lower-of-cost-or-NRV vs. excess & obsolete', [
          el('table', { class: 'dt' }, [el('tbody', {}, [
            row('Lower-of-cost-or-NRV write-downs', t.nrvReserve),
            row('Excess & obsolete provision', t.eoReserve),
            el('tr', { class: 'total' }, [el('td', { text: 'Total reserve' }), el('td', { class: 'num tnum', text: fmt.money0(t.combinedReserve) })])
          ])]),
          el('div', { class: 'chart-wrap sm', style: 'margin-top:12px' }, [el('canvas', { id: 'resChart' })])
        ]),
        ui.card('Reserve by category', null, [
          el('table', { class: 'dt' }, [
            el('thead', {}, el('tr', {}, [el('th', { text: 'Category' }), el('th', { class: 'num', text: 'Gross' }), el('th', { class: 'num', text: 'Reserve' }), el('th', { class: 'num', text: 'Net' })])),
            el('tbody', {}, res.byCategory.map(function (g) {
              return el('tr', {}, [el('td', { text: g.category }), el('td', { class: 'num tnum', text: fmt.money0(g.grossValue) }),
                el('td', { class: 'num tnum', text: fmt.money0(g.combinedReserve) }), el('td', { class: 'num tnum', text: fmt.money0(g.netValue) })]);
            }))
          ]),
          el('div', { class: 'note', style: 'margin-top:12px' },
            'Policy: keep ' + data.reservePolicy.coverageMonths + ' months of demand; excess beyond that is reserved by age — ' +
            data.reservePolicy.buckets.map(function (b) { return b.label + ' @ ' + Math.round(b.pct * 100) + '%'; }).join(', ') + '.')
        ])
      ]));

      // Item-level reserve table (drill-down)
      c.appendChild(el('div', { class: 'section-title', text: 'Item-level reserve detail — click a row to drill down' }));
      var tb = el('tbody');
      res.items.slice().sort(function (a, b) { return b.combinedReserve - a.combinedReserve; }).forEach(function (r) {
        var tr = el('tr', { style: 'cursor:pointer', title: 'Click for full computation',
          onclick: function () { ui.modal(r.sku + ' — ' + r.description, ui.itemDetail(r, rawBySku[r.sku]), r.category); } }, [
          el('td', {}, [el('strong', { text: r.sku })]),
          el('td', { text: r.description }),
          el('td', { class: 'num tnum', text: fmt.num(r.qtyOnHand, 0) }),
          el('td', { class: 'num tnum', text: fmt.money0(r.grossValue) }),
          el('td', { class: 'num tnum', text: fmt.money0(r.nrvReserve) }),
          el('td', { class: 'num tnum', text: fmt.money0(r.eoReserve) }),
          el('td', { class: 'num tnum', text: fmt.money0(r.combinedReserve) }),
          el('td', {}, [statusBadge(r)])
        ]);
        tb.appendChild(tr);
      });
      tb.appendChild(el('tr', { class: 'total' }, [
        el('td', { colspan: 3, text: 'Total — ' + res.items.length + ' items' }),
        el('td', { class: 'num tnum', text: fmt.money0(t.grossValue) }),
        el('td', { class: 'num tnum', text: fmt.money0(t.nrvReserve) }),
        el('td', { class: 'num tnum', text: fmt.money0(t.eoReserve) }),
        el('td', { class: 'num tnum', text: fmt.money0(t.combinedReserve) }), el('td', {})
      ]));
      c.appendChild(ui.card(null, null, [el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [
          el('th', { text: 'SKU' }), el('th', { text: 'Description' }), el('th', { class: 'num', text: 'On hand' }),
          el('th', { class: 'num', text: 'Gross' }), el('th', { class: 'num', text: 'NRV resv' }), el('th', { class: 'num', text: 'E&O resv' }),
          el('th', { class: 'num', text: 'Total reserve' }), el('th', { text: 'Status' })
        ])), tb
      ])]));

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('inventoryReserve', M.ctx.inventoryReserve()));

      drawResChart(document.getElementById('resChart'), t);

      function row(label, val) { return el('tr', {}, [el('td', { text: label }), el('td', { class: 'num tnum', text: fmt.money0(val) })]); }
    }
  };

  function statusBadge(r) {
    if (r.combinedReserve <= 0.005) return el('span', { class: 'badge sb-good', text: 'Clean' });
    var both = r.nrvReserve > 0 && r.eoReserve > 0;
    if (both) return el('span', { class: 'badge sb-bad', text: 'NRV + E&O' });
    if (r.nrvReserve > 0) return el('span', { class: 'badge sb-warn', text: 'NRV write-down' });
    return el('span', { class: 'badge sb-warn', text: 'Excess / obsolete' });
  }

  function drawResChart(canvas, t) {
    if (!canvas) return;
    var th = CACC.chartTheme();
    CACC.chart(canvas, {
      type: 'doughnut',
      data: { labels: ['LCNRV write-down', 'Excess & obsolete'], datasets: [{ data: [t.nrvReserve, t.eoReserve], backgroundColor: [th.bad, th.palette[2]], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '62%',
        plugins: { legend: { position: 'bottom', labels: { color: th.text } }, tooltip: { callbacks: { label: function (ctx) { return ctx.label + ': ' + CACC.fmt.money0(ctx.raw); } } } } }
    });
  }
})(typeof window !== 'undefined' ? window : this);
