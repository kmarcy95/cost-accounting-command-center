/* Sales Orders — transaction-level order register with drill-down windows. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.salesOrders = {
    title: 'Sales Orders',
    render: function (c) {
      var t = M.salesTotals();
      var statusFilter = 'All', custFilter = 'All', pane = el('div', {});
      var customers = (CACC.store.data().customers || []).map(function (x) { return x.name; });

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Sales value', fmt.money0(t.amount), t.orders + ' orders', 'dollar'),
        ui.kpi('Units ordered', fmt.num(t.units, 0), null, 'box'),
        ui.kpi('Open orders', String(t.openCount), fmt.money0(t.openValue) + ' backlog', 'variance', t.openCount ? 'unfav' : ''),
        ui.kpi('Avg order', fmt.money0(t.avgOrder), null, 'margin')
      ]));

      var statusSel = el('select', {}, ['All', 'Open', 'Shipped', 'Invoiced'].map(function (x) { return el('option', { value: x, text: x }); }));
      statusSel.addEventListener('change', function () { statusFilter = statusSel.value; renderTable(); });
      var custSel = el('select', {}, ['All'].concat(customers).map(function (x) { return el('option', { value: x, text: x }); }));
      custSel.addEventListener('change', function () { custFilter = custSel.value; renderTable(); });

      c.appendChild(el('div', { class: 'card card-pad', style: 'margin-top:18px;display:flex;gap:12px;align-items:end;flex-wrap:wrap' }, [
        el('div', { class: 'field', style: 'min-width:150px' }, [el('label', { text: 'Status' }), statusSel]),
        el('div', { class: 'field', style: 'min-width:190px' }, [el('label', { text: 'Customer' }), custSel]),
        el('div', { style: 'align-self:end' }, [el('span', { class: 'muted', text: M.filterLabel() })])
      ]));
      c.appendChild(pane);
      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('salesOrders', { group: CACC.store.data().group, filter: M.filterLabel(), totals: t, orders: M.filteredSalesOrders() }));

      function renderTable() {
        var rows = M.filteredSalesOrders().filter(function (o) { return (statusFilter === 'All' || o.status === statusFilter) && (custFilter === 'All' || o.customer === custFilter); });
        var tb = el('tbody');
        rows.forEach(function (o) {
          tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { orderWindow(o); } }, [
            el('td', {}, [el('strong', { text: o.id })]), el('td', { text: o.date }), el('td', { text: o.customer }), el('td', { text: o.plantName }),
            el('td', {}, [el('strong', { text: o.sku })]), el('td', { class: 'num tnum', text: fmt.num(o.qty, 0) }), el('td', { class: 'num tnum', text: fmt.money(o.price) }),
            el('td', { class: 'num tnum', text: fmt.money0(o.amount) }), el('td', { class: 'num tnum ' + (o.margin < 0 ? 'unfav' : 'fav'), text: fmt.money0(o.margin) }),
            el('td', {}, [el('span', { class: 'badge ' + (o.status === 'Open' ? 'sb-warn' : o.status === 'Shipped' ? 'sb-neutral' : 'sb-good'), text: o.status })])
          ]));
        });
        var table = el('table', { class: 'dt' }, [
          el('thead', {}, el('tr', {}, [el('th', { text: 'Order' }), el('th', { text: 'Period' }), el('th', { text: 'Customer' }), el('th', { text: 'Plant' }), el('th', { text: 'SKU' }), el('th', { class: 'num', text: 'Qty' }), el('th', { class: 'num', text: 'Price' }), el('th', { class: 'num', text: 'Amount' }), el('th', { class: 'num', text: 'Margin' }), el('th', { text: 'Status' })])), tb
        ]);
        clear(pane);
        pane.appendChild(ui.card(null, rows.length + ' orders · ' + M.filterLabel(), [el('div', { style: 'overflow-x:auto' }, [table])], CACC.tableTools.exportButton(table, 'sales-orders.csv')));
        CACC.tableTools.makeSortable(table);
      }
      function orderWindow(o) {
        var related = M.filteredSalesOrders().filter(function (x) { return x.customerId === o.customerId && x.id !== o.id; }).slice(0, 8);
        var tb = el('tbody'); related.forEach(function (x) { tb.appendChild(el('tr', {}, [el('td', { text: x.id }), el('td', { text: x.sku }), el('td', { class: 'num tnum', text: fmt.num(x.qty, 0) }), el('td', { class: 'num tnum', text: fmt.money0(x.amount) }), el('td', {}, [el('span', { class: 'badge sb-neutral', text: x.status })])])); });
        ui.window(o.id + ' — ' + o.productName, [
          el('div', { class: 'grid g4' }, [
            ui.kpi('Quantity', fmt.num(o.qty, 0), null, 'box'), ui.kpi('Unit price', fmt.money(o.price), null, 'dollar'),
            ui.kpi('Amount', fmt.money0(o.amount), null, 'margin'), ui.kpi('Margin', fmt.money0(o.margin), fmt.pct(o.amount ? o.margin / o.amount * 100 : 0), 'variance', o.margin < 0 ? 'unfav' : 'fav')
          ]),
          el('p', { class: 'muted', style: 'margin-top:10px', text: o.customer + ' · ' + o.plantName + ' · ' + o.date + ' · status ' + o.status }),
          related.length ? el('div', { class: 'section-title', text: 'Other orders from ' + o.customer }) : null,
          related.length ? el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Order' }), el('th', { text: 'SKU' }), el('th', { class: 'num', text: 'Qty' }), el('th', { class: 'num', text: 'Amount' }), el('th', { text: 'Status' })])), tb]) : null
        ], 'Sales order drill-down');
      }
      renderTable();
    }
  };
})(typeof window !== 'undefined' ? window : this);
