/* Procurement & Suppliers (Supply Chain) — PO spend, supplier analysis, open orders. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.procurement = {
    title: 'Procurement & Suppliers',
    render: function (c) {
      var t = M.procurementTotals(), suppliers = M.supplierSpend();
      var statusFilter = 'All', pane = el('div', {});

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('PO spend', fmt.money0(t.total), t.orders + ' orders · ' + t.suppliers + ' suppliers', 'truck'),
        ui.kpi('Open POs', String(t.openCount), fmt.money0(t.openValue) + ' committed', 'truck', t.openCount ? 'unfav' : ''),
        ui.kpi('Suppliers', String(t.suppliers), 'active in ' + M.filterLabel(), 'list'),
        ui.kpi('Avg order', fmt.money0(t.orders ? t.total / t.orders : 0), null, 'dollar')
      ]));

      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        ui.card('Spend by supplier', 'click a bar to see orders', [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'supChart' })])]),
        ui.card('PO status', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'poStatus' })])])
      ]));

      // Supplier table (click row -> window with that supplier's POs)
      var sb = el('tbody');
      suppliers.forEach(function (s) {
        sb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { supplierWindow(s); } }, [
          el('td', {}, [el('strong', { text: s.name })]),
          el('td', { class: 'num tnum', text: String(s.orders) }),
          el('td', { class: 'num tnum', text: fmt.money0(s.amount) }),
          el('td', { class: 'num tnum' + (s.openAmount > 0 ? ' unfav' : ''), text: fmt.money0(s.openAmount) }),
          el('td', { class: 'num tnum', text: fmt.pct(t.total ? s.amount / t.total * 100 : 0) })
        ]));
      });
      var supTable = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'Supplier' }), el('th', { class: 'num', text: 'Orders' }), el('th', { class: 'num', text: 'Spend' }), el('th', { class: 'num', text: 'Open' }), el('th', { class: 'num', text: '% of spend' })])), sb
      ]);
      c.appendChild(el('div', { class: 'section-title', text: 'Suppliers · click a row to drill into orders' }));
      c.appendChild(ui.card(null, M.filterLabel(), [supTable], CACC.tableTools.exportButton(supTable, 'supplier-spend.csv')));
      CACC.tableTools.makeSortable(supTable);

      // PO register with status filter
      var sel = el('select', {}, ['All', 'Open', 'Received', 'Closed'].map(function (x) { return el('option', { value: x, text: x }); }));
      sel.addEventListener('change', function () { statusFilter = sel.value; renderPOs(); });
      c.appendChild(el('div', { class: 'card card-pad', style: 'margin-top:18px;display:flex;gap:12px;align-items:end' }, [
        el('div', { class: 'field', style: 'min-width:160px' }, [el('label', { text: 'PO status' }), sel])
      ]));
      c.appendChild(pane);

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('procurement', M.ctx.procurement()));

      var th = CACC.chartTheme();
      CACC.chart(document.getElementById('supChart'), {
        type: 'bar', data: { labels: suppliers.map(function (s) { return s.name; }), datasets: [{ data: suppliers.map(function (s) { return s.amount; }), backgroundColor: th.accent, borderRadius: 4 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          onClick: CACC.chartClick(function (i) { if (suppliers[i]) supplierWindow(suppliers[i]); }),
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return CACC.fmt.money0(ctx.raw); } } } },
          scales: { x: { grid: { color: th.grid }, ticks: { color: th.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } }, y: { grid: { display: false }, ticks: { color: th.text } } } }
      });
      var byStatus = { Open: 0, Received: 0, Closed: 0 };
      M.filteredPOs().forEach(function (p) { byStatus[p.status] = (byStatus[p.status] || 0) + p.amount; });
      CACC.chart(document.getElementById('poStatus'), {
        type: 'doughnut', data: { labels: Object.keys(byStatus), datasets: [{ data: Object.keys(byStatus).map(function (k) { return Math.round(byStatus[k]); }), backgroundColor: [th.palette[2], th.accent, th.good], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: th.text } }, tooltip: { callbacks: { label: function (ctx) { return ctx.label + ': ' + CACC.fmt.money0(ctx.raw); } } } } }
      });

      renderPOs();

      function renderPOs() {
        var rows = M.filteredPOs().filter(function (p) { return statusFilter === 'All' || p.status === statusFilter; });
        var tb = el('tbody');
        rows.forEach(function (p) { tb.appendChild(poRow(p)); });
        var table = el('table', { class: 'dt' }, [
          el('thead', {}, el('tr', {}, [el('th', { text: 'PO' }), el('th', { text: 'Period' }), el('th', { text: 'Plant' }), el('th', { text: 'Supplier' }), el('th', { text: 'Item' }), el('th', { class: 'num', text: 'Qty' }), el('th', { class: 'num', text: 'Unit cost' }), el('th', { class: 'num', text: 'Amount' }), el('th', { text: 'Status' })])), tb
        ]);
        clear(pane);
        pane.appendChild(ui.card(null, rows.length + ' purchase orders · ' + M.filterLabel(), [el('div', { style: 'overflow-x:auto' }, [table])], CACC.tableTools.exportButton(table, 'purchase-orders.csv')));
        CACC.tableTools.makeSortable(table);
      }
      function poRow(p) {
        return el('tr', {}, [
          el('td', { text: p.id }), el('td', { text: p.date }), el('td', { text: p.plantName }), el('td', { text: p.supplier }),
          el('td', {}, [el('strong', { text: p.sku })]), el('td', { class: 'num tnum', text: fmt.num(p.qty, 0) }), el('td', { class: 'num tnum', text: fmt.money(p.unitCost) }),
          el('td', { class: 'num tnum', text: fmt.money0(p.amount) }),
          el('td', {}, [el('span', { class: 'badge ' + (p.status === 'Open' ? 'sb-warn' : p.status === 'Received' ? 'sb-neutral' : 'sb-good'), text: p.status })])
        ]);
      }
      function supplierWindow(s) {
        var rows = M.filteredPOs().filter(function (p) { return p.supplierId === s.id; });
        var tb = el('tbody'); rows.forEach(function (p) { tb.appendChild(poRow(p)); });
        ui.window(s.name, [
          el('div', { class: 'grid g3' }, [ui.kpi('Total spend', fmt.money0(s.amount), null, 'dollar'), ui.kpi('Orders', String(s.orders), null, 'truck'), ui.kpi('Open value', fmt.money0(s.openAmount), null, 'warning', s.openAmount ? 'unfav' : '')]),
          el('div', { style: 'overflow-x:auto;margin-top:14px' }, [el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'PO' }), el('th', { text: 'Period' }), el('th', { text: 'Plant' }), el('th', { text: 'Supplier' }), el('th', { text: 'Item' }), el('th', { class: 'num', text: 'Qty' }), el('th', { class: 'num', text: 'Unit cost' }), el('th', { class: 'num', text: 'Amount' }), el('th', { text: 'Status' })])), tb])])
        ], rows.length + ' orders · ' + M.filterLabel());
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
