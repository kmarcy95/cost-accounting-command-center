/* Cost Ledger — GL-style cost entries, filterable / sortable / exportable. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.costLedger = {
    title: 'Cost Ledger',
    render: function (c) {
      var acctFilter = 'All';
      var pane = el('div', {});
      var accounts = uniq(M.filteredLedger().map(function (r) { return r.account; }));

      var sel = el('select', {}, ['All'].concat(accounts).map(function (x) { return el('option', { value: x, text: x }); }));
      sel.addEventListener('change', function () { acctFilter = sel.value; renderTable(); });

      c.appendChild(el('div', { class: 'card card-pad', style: 'display:flex;gap:12px;align-items:end;flex-wrap:wrap' }, [
        el('div', { class: 'field', style: 'min-width:220px' }, [el('label', { text: 'Account' }), sel]),
        el('div', { style: 'align-self:end' }, [el('span', { class: 'muted', text: M.filterLabel() })])
      ]));
      c.appendChild(el('div', { id: 'glKpis', style: 'margin-top:18px' }));
      c.appendChild(el('div', { class: 'section-title', text: 'Ledger entries' }));
      c.appendChild(pane);

      function renderTable() {
        var rows = M.filteredLedger().filter(function (r) { return acctFilter === 'All' || r.account === acctFilter; });
        var dr = sum(rows, 'debit'), cr = sum(rows, 'credit');
        var kp = document.getElementById('glKpis'); clear(kp);
        kp.appendChild(el('div', { class: 'grid g3' }, [
          ui.kpi('Total debits', fmt.money0(dr), rows.length + ' entries', 'ledger'),
          ui.kpi('Total credits', fmt.money0(cr), null, 'ledger'),
          ui.kpi('Net (Dr − Cr)', fmt.money0(dr - cr), Math.abs(dr - cr) < 1 ? 'in balance' : 'open balance', 'variance', Math.abs(dr - cr) < 1 ? 'fav' : 'unfav')
        ]));

        var tb = el('tbody');
        rows.forEach(function (r) {
          tb.appendChild(el('tr', {}, [
            el('td', { text: r.id }), el('td', { text: r.date }), el('td', { text: r.plantName }),
            el('td', { text: r.account }), el('td', {}, [el('span', { class: 'badge sb-neutral', text: r.ref })]),
            el('td', { class: 'num tnum', text: r.debit ? fmt.money(r.debit) : '' }),
            el('td', { class: 'num tnum', text: r.credit ? fmt.money(r.credit) : '' })
          ]));
        });
        tb.appendChild(el('tr', { class: 'total' }, [
          el('td', { colspan: 5, text: 'Totals' }), el('td', { class: 'num tnum', text: fmt.money0(dr) }), el('td', { class: 'num tnum', text: fmt.money0(cr) })
        ]));
        var table = el('table', { class: 'dt' }, [
          el('thead', {}, el('tr', {}, [el('th', { text: 'Entry' }), el('th', { text: 'Period' }), el('th', { text: 'Plant' }), el('th', { text: 'Account' }), el('th', { text: 'Ref' }), el('th', { class: 'num', text: 'Debit' }), el('th', { class: 'num', text: 'Credit' })])), tb
        ]);
        clear(pane);
        pane.appendChild(ui.card(null, rows.length + ' entries · ' + M.filterLabel(), [el('div', { style: 'overflow-x:auto' }, [table])], CACC.tableTools.exportButton(table, 'cost-ledger.csv')));
        CACC.tableTools.makeSortable(table);
      }
      renderTable();
    }
  };
  function sum(rows, f) { return Math.round(rows.reduce(function (s, r) { return s + (r[f] || 0); }, 0) * 100) / 100; }
  function uniq(a) { var seen = {}, out = []; a.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } }); return out.sort(); }
})(typeof window !== 'undefined' ? window : this);
