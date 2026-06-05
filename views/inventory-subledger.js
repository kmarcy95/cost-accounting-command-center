/* Inventory Subledger — transactions on the personalizable grid. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.inventorySubledger = {
    title: 'Inventory Subledger',
    render: function (c) {
      var rows = M.filteredTxns();
      var receipts = sum(rows.filter(function (r) { return r.type === 'Receipt'; }), 'qty');
      var issues = sum(rows.filter(function (r) { return r.type === 'Issue'; }), 'qty');
      var adjustments = sum(rows.filter(function (r) { return r.type === 'Adjustment'; }), 'qty');
      var netValue = sum(rows, 'value');

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Receipts (qty)', fmt.num(receipts, 0), null, 'box', 'fav'),
        ui.kpi('Issues (qty)', fmt.num(Math.abs(issues), 0), null, 'box'),
        ui.kpi('Adjustments (qty)', fmt.num(adjustments, 0), null, 'variance', adjustments < 0 ? 'unfav' : ''),
        ui.kpi('Net inventory movement', fmt.money0(netValue), rows.length + ' transactions', 'dollar')
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'Transactions · group by type/SKU/plant, choose columns, save your view' }));
      c.appendChild(CACC.grid('inv-subledger', [
        { key: 'id', label: 'Txn ID' }, { key: 'date', label: 'Period' }, { key: 'plantName', label: 'Plant' }, { key: 'sku', label: 'SKU' }, { key: 'productName', label: 'Product' },
        { key: 'type', label: 'Type', render: function (r) { return el('span', { class: 'badge ' + (r.type === 'Receipt' ? 'sb-good' : r.type === 'Issue' ? 'sb-neutral' : 'sb-warn'), text: r.type }); } },
        { key: 'qty', label: 'Qty', fmt: 'num', sum: true, render: function (r) { return el('span', { class: r.qty < 0 ? 'unfav' : 'fav', text: fmt.num(r.qty, 0) }); } },
        { key: 'unitCost', label: 'Unit cost', fmt: 'money' }, { key: 'value', label: 'Value', fmt: 'money0', sum: true }
      ], rows, { title: 'Inventory subledger' }));
    }
  };
  function sum(rows, f) { return Math.round(rows.reduce(function (s, r) { return s + (r[f] || 0); }, 0) * 100) / 100; }
})(typeof window !== 'undefined' ? window : this);
