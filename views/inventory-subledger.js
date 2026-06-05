/* Inventory Subledger — transaction-level receipts/issues/adjustments with running balance. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.inventorySubledger = {
    title: 'Inventory Subledger',
    render: function (c) {
      var periods = CACC.store.data().periods || [];
      var typeFilter = 'All';
      var pane = el('div', {});

      var typeSel = el('select', {}, ['All', 'Receipt', 'Issue', 'Adjustment'].map(function (x) { return el('option', { value: x, text: x }); }));
      typeSel.addEventListener('change', function () { typeFilter = typeSel.value; renderTable(); });

      c.appendChild(el('div', { class: 'card card-pad', style: 'display:flex;gap:12px;align-items:end;flex-wrap:wrap' }, [
        el('div', { class: 'field', style: 'min-width:160px' }, [el('label', { text: 'Transaction type' }), typeSel]),
        el('div', { style: 'align-self:end' }, [el('span', { class: 'muted', text: M.filterLabel() })])
      ]));
      c.appendChild(el('div', { id: 'subKpis', style: 'margin-top:18px' }));
      c.appendChild(el('div', { class: 'section-title', text: 'Transactions' }));
      c.appendChild(pane);

      function renderTable() {
        var rows = M.filteredTxns().filter(function (t) { return typeFilter === 'All' || t.type === typeFilter; });
        // running balance per plant+sku in period order
        var order = {}; periods.forEach(function (p, i) { order[p] = i; });
        rows = rows.slice().sort(function (a, b) {
          if (a.plantId !== b.plantId) return a.plantId < b.plantId ? -1 : 1;
          if (a.sku !== b.sku) return a.sku < b.sku ? -1 : 1;
          return (order[a.date] - order[b.date]) || (a.id < b.id ? -1 : 1);
        });
        var bal = {};
        rows.forEach(function (r) { var key = r.plantId + r.sku; bal[key] = (bal[key] || 0) + r.qty; r._bal = bal[key]; });

        var receipts = sum(rows.filter(function (r) { return r.type === 'Receipt'; }), 'qty');
        var issues = sum(rows.filter(function (r) { return r.type === 'Issue'; }), 'qty');
        var adjustments = sum(rows.filter(function (r) { return r.type === 'Adjustment'; }), 'qty');
        var netValue = sum(rows, 'value');
        var kp = document.getElementById('subKpis'); clear(kp);
        kp.appendChild(el('div', { class: 'grid g4' }, [
          ui.kpi('Receipts (qty)', fmt.num(receipts, 0), null, 'box', 'fav'),
          ui.kpi('Issues (qty)', fmt.num(Math.abs(issues), 0), null, 'box'),
          ui.kpi('Adjustments (qty)', fmt.num(adjustments, 0), null, 'variance', adjustments < 0 ? 'unfav' : ''),
          ui.kpi('Net inventory movement', fmt.money0(netValue), rows.length + ' transactions', 'dollar')
        ]));

        var tb = el('tbody');
        rows.forEach(function (r) {
          tb.appendChild(el('tr', {}, [
            el('td', { text: r.id }), el('td', { text: r.date }), el('td', { text: r.plantName }),
            el('td', {}, [el('strong', { text: r.sku })]), el('td', { text: r.productName }),
            el('td', {}, [el('span', { class: 'badge ' + (r.type === 'Receipt' ? 'sb-good' : r.type === 'Issue' ? 'sb-neutral' : 'sb-warn'), text: r.type })]),
            el('td', { class: 'num tnum ' + (r.qty < 0 ? 'unfav' : 'fav') }, fmt.num(r.qty, 0)),
            el('td', { class: 'num tnum', text: fmt.money(r.unitCost) }),
            el('td', { class: 'num tnum', text: fmt.money0(r.value) }),
            el('td', { class: 'num tnum', text: fmt.num(r._bal, 0) })
          ]));
        });
        var table = el('table', { class: 'dt' }, [
          el('thead', {}, el('tr', {}, [
            el('th', { text: 'Txn ID' }), el('th', { text: 'Period' }), el('th', { text: 'Plant' }), el('th', { text: 'SKU' }), el('th', { text: 'Product' }),
            el('th', { text: 'Type' }), el('th', { class: 'num', text: 'Qty' }), el('th', { class: 'num', text: 'Unit cost' }), el('th', { class: 'num', text: 'Value' }), el('th', { class: 'num', text: 'Balance' })
          ])), tb
        ]);
        clear(pane);
        pane.appendChild(ui.card(null, rows.length + ' transactions · ' + M.filterLabel(), [el('div', { style: 'overflow-x:auto' }, [table])], CACC.tableTools.exportButton(table, 'inventory-subledger.csv')));
        CACC.tableTools.makeSortable(table);
      }
      renderTable();
    }
  };
  function sum(rows, f) { return Math.round(rows.reduce(function (s, r) { return s + (r[f] || 0); }, 0) * 100) / 100; }
})(typeof window !== 'undefined' ? window : this);
