/* Subcontracting — cost of outsourced operations/assemblies. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.subcontracting = {
    title: 'Subcontracting',
    render: function (c) {
      var rows = M.subcontract().map(function (s) { return Object.assign({ total: Math.round((s.serviceCost + s.componentsCost) * 100) / 100 }, s); });
      var totalSvc = rows.reduce(function (a, r) { return a + r.serviceCost; }, 0);
      var open = rows.filter(function (r) { return r.status !== 'Received'; });
      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Subcontract spend', fmt.money0(rows.reduce(function (a, r) { return a + r.total; }, 0)), rows.length + ' orders', 'truck'),
        ui.kpi('Service charges', fmt.money0(totalSvc), 'outsourced operations', 'dollar'),
        ui.kpi('Supplied components', fmt.money0(rows.reduce(function (a, r) { return a + r.componentsCost; }, 0)), null, 'box'),
        ui.kpi('Open orders', String(open.length), fmt.money0(open.reduce(function (a, r) { return a + r.total; }, 0)), 'variance', open.length ? 'unfav' : 'fav')
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Subcontract orders' }));
      c.appendChild(CACC.grid('subcontract', [
        { key: 'id', label: 'Order' }, { key: 'supplier', label: 'Supplier' }, { key: 'operation', label: 'Operation' }, { key: 'sku', label: 'Item' }, { key: 'qty', label: 'Qty', fmt: 'num' },
        { key: 'serviceCost', label: 'Service cost', fmt: 'money0', sum: true }, { key: 'componentsCost', label: 'Components', fmt: 'money0', sum: true }, { key: 'total', label: 'Total', fmt: 'money0', sum: true },
        { key: 'status', label: 'Status', render: function (r) { return el('span', { class: 'badge ' + (r.status === 'Received' ? 'sb-good' : 'sb-warn'), text: r.status }); } }
      ], rows, { title: 'Subcontracting' }));
      c.appendChild(el('div', { class: 'note', style: 'margin-top:14px' }, 'Subcontracting captures outsourced operation/assembly cost (service charge + supplied components) and the procurement→production handoff. Validate one end-to-end outsourced step from PO through receipt, invoice, and close.'));
    }
  };
})(typeof window !== 'undefined' ? window : this);
