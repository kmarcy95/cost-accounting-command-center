/* General Ledger — trial balance from the cost ledger. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.generalLedger = {
    title: 'General Ledger',
    render: function (c) {
      var tb = M.trialBalance();
      c.appendChild(el('div', { class: 'grid g3' }, [
        ui.kpi('Total debits', fmt.money0(tb.debits), tb.accounts.length + ' accounts', 'ledger'),
        ui.kpi('Total credits', fmt.money0(tb.credits), null, 'ledger'),
        ui.kpi('Trial balance', tb.balanced ? 'In balance' : 'Out of balance', tb.balanced ? 'debits = credits ✓' : 'review', 'variance', tb.balanced ? 'fav' : 'unfav')
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Trial balance · ' + M.filterLabel() }));
      var rows = tb.accounts.map(function (a) { return { account: a.account, debit: a.debit, credit: a.credit, net: a.net, side: a.net >= 0 ? 'Dr' : 'Cr' }; });
      c.appendChild(CACC.grid('trial-balance', [
        { key: 'account', label: 'Account' }, { key: 'debit', label: 'Debit', fmt: 'money0', sum: true }, { key: 'credit', label: 'Credit', fmt: 'money0', sum: true },
        { key: 'net', label: 'Net', fmt: 'money0', sum: true, render: function (r) { return el('span', { class: r.net < 0 ? 'unfav' : 'fav', text: fmt.money0(r.net) }); } },
        { key: 'side', label: 'Balance', render: function (r) { return el('span', { class: 'badge ' + (r.side === 'Dr' ? 'sb-neutral' : 'sb-warn'), text: r.side }); } }
      ], rows, { title: 'Trial balance' }));
      c.appendChild(el('div', { class: 'note', style: 'margin-top:14px' }, 'The trial balance is built from the cost ledger for the selected plant and period. Manufacturing subledgers (WIP, inventory, variances) should reconcile to these GL balances at close.'));
    }
  };
})(typeof window !== 'undefined' ? window : this);
