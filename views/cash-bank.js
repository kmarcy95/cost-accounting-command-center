/* Cash & Bank Management — bank account balances. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.cashBank = {
    title: 'Cash & Bank Management',
    render: function (c) {
      var cb = M.bankAccounts();
      var usd = cb.rows.filter(function (b) { return b.currency === 'USD'; }).reduce(function (a, b) { return a + b.balance; }, 0);
      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Total cash', fmt.money0(cb.total), cb.rows.length + ' accounts', 'dollar'),
        ui.kpi('USD balances', fmt.money0(usd), null, 'dollar'),
        ui.kpi('Accounts', String(cb.rows.length), 'across plants', 'ledger'),
        ui.kpi('Banks', String(uniq(cb.rows.map(function (b) { return b.bank; })).length), null, 'box')
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Bank accounts' }));
      c.appendChild(ui.card(null, M.filterLabel(), [el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'Account' }), el('th', { text: 'Name' }), el('th', { text: 'Bank' }), el('th', { text: 'Plant' }), el('th', { text: 'Currency' }), el('th', { class: 'num', text: 'Balance' })])),
        el('tbody', {}, cb.rows.map(function (b) { return el('tr', {}, [el('td', {}, [el('strong', { text: b.id })]), el('td', { text: b.name }), el('td', { text: b.bank }), el('td', { text: b.plantId }), el('td', {}, [el('span', { class: 'badge sb-neutral', text: b.currency })]), el('td', { class: 'num tnum', text: fmt.money0(b.balance) })]); })
          .concat([el('tr', { class: 'total' }, [el('td', { colspan: 5, text: 'Total (mixed currency)' }), el('td', { class: 'num tnum', text: fmt.money0(cb.total) })])]))
      ])]));
      c.appendChild(el('div', { class: 'note', style: 'margin-top:14px' }, 'Cash positioning across operating, payroll, and reserve accounts. In a full deployment this links to bank reconciliation, electronic payments, and the 13-week cash-flow forecast.'));
    }
  };
  function uniq(a) { var s = {}; a.forEach(function (x) { s[x] = 1; }); return Object.keys(s); }
})(typeof window !== 'undefined' ? window : this);
