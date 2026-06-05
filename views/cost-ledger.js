/* Cost Ledger — GL-style entries on the personalizable grid. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.costLedger = {
    title: 'Cost Ledger',
    render: function (c) {
      var rows = M.filteredLedger();
      var dr = sum(rows, 'debit'), cr = sum(rows, 'credit');

      c.appendChild(el('div', { class: 'grid g3' }, [
        ui.kpi('Total debits', fmt.money0(dr), rows.length + ' entries', 'ledger'),
        ui.kpi('Total credits', fmt.money0(cr), null, 'ledger'),
        ui.kpi('Net (Dr − Cr)', fmt.money0(dr - cr), Math.abs(dr - cr) < 1 ? 'in balance' : 'open balance', 'variance', Math.abs(dr - cr) < 1 ? 'fav' : 'unfav')
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'Ledger entries · group by account or plant, hide columns, save the view' }));
      c.appendChild(CACC.grid('cost-ledger', [
        { key: 'id', label: 'Entry' }, { key: 'date', label: 'Period' }, { key: 'plantName', label: 'Plant' }, { key: 'account', label: 'Account' },
        { key: 'ref', label: 'Ref', render: function (r) { return el('span', { class: 'badge sb-neutral', text: r.ref }); } },
        { key: 'debit', label: 'Debit', fmt: 'money', sum: true }, { key: 'credit', label: 'Credit', fmt: 'money', sum: true }
      ], rows, { title: 'Cost ledger' }));
    }
  };
  function sum(rows, f) { return Math.round(rows.reduce(function (s, r) { return s + (r[f] || 0); }, 0) * 100) / 100; }
})(typeof window !== 'undefined' ? window : this);
