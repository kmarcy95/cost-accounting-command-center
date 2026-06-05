/* Sales Orders — transaction register on the personalizable grid (group/columns/saved view). */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.salesOrders = {
    title: 'Sales Orders',
    render: function (c) {
      var t = M.salesTotals(), rows = M.filteredSalesOrders();

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Sales value', fmt.money0(t.amount), t.orders + ' orders', 'dollar'),
        ui.kpi('Units ordered', fmt.num(t.units, 0), null, 'box'),
        ui.kpi('Open orders', String(t.openCount), fmt.money0(t.openValue) + ' backlog', 'variance', t.openCount ? 'unfav' : ''),
        ui.kpi('Avg order', fmt.money0(t.avgOrder), null, 'margin')
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'Order register · search, group, choose columns, save your view' }));
      c.appendChild(CACC.grid('sales-orders', [
        { key: 'id', label: 'Order' }, { key: 'date', label: 'Period' }, { key: 'customer', label: 'Customer' }, { key: 'plantName', label: 'Plant' },
        { key: 'sku', label: 'SKU' }, { key: 'qty', label: 'Qty', fmt: 'num', sum: true }, { key: 'price', label: 'Price', fmt: 'money' },
        { key: 'amount', label: 'Amount', fmt: 'money0', sum: true },
        { key: 'margin', label: 'Margin', fmt: 'money0', sum: true, render: function (r) { return el('span', { class: r.margin < 0 ? 'unfav' : 'fav', text: fmt.money0(r.margin) }); } },
        { key: 'status', label: 'Status', render: function (r) { return el('span', { class: 'badge ' + (r.status === 'Open' ? 'sb-warn' : r.status === 'Shipped' ? 'sb-neutral' : 'sb-good'), text: r.status }); } }
      ], rows, { title: 'Sales orders', onRow: orderWindow }));

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('salesOrders', { group: CACC.store.data().group, filter: M.filterLabel(), totals: t, orders: rows }));

      function orderWindow(o) {
        var related = rows.filter(function (x) { return x.customerId === o.customerId && x.id !== o.id; }).slice(0, 8);
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
    }
  };
})(typeof window !== 'undefined' ? window : this);
