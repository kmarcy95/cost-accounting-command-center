/* Item Cost Revaluation — restate item standard cost and see inventory + P&L impact. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui;

  CACC.views.itemRevaluation = {
    title: 'Item Cost Revaluation',
    render: function (c) {
      var items = CACC.store.data().items;
      var newCost = {}; items.forEach(function (it) { newCost[it.sku + '|' + it.type] = it.unitCost; });
      var kpiHost = el('div', {}), tableHost = el('div', {});

      c.appendChild(el('div', { class: 'note', style: 'margin-bottom:4px' }, [el('strong', { text: 'Inventory cost revaluation' }), ' — enter a revised standard cost per item to model the on-hand inventory and P&L impact. This is a what-if; nothing is posted to the live scenario.']));
      c.appendChild(kpiHost);
      c.appendChild(el('div', { class: 'section-title', text: 'Revaluation worksheet · edit “New cost”' }));
      c.appendChild(tableHost);

      render();

      function totals() {
        var curVal = 0, newVal = 0;
        items.forEach(function (it) { var nc = newCost[it.sku + '|' + it.type]; curVal += it.qtyOnHand * it.unitCost; newVal += it.qtyOnHand * nc; });
        return { curVal: Math.round(curVal * 100) / 100, newVal: Math.round(newVal * 100) / 100, impact: Math.round((newVal - curVal) * 100) / 100 };
      }
      function render() {
        var t = totals();
        clear(kpiHost);
        kpiHost.appendChild(el('div', { class: 'grid g3' }, [
          ui.kpi('Current inventory value', fmt.money0(t.curVal), items.length + ' items', 'box'),
          ui.kpi('Revalued inventory', fmt.money0(t.newVal), null, 'box'),
          ui.kpi('Revaluation impact', (t.impact >= 0 ? '+' : '') + fmt.money0(t.impact), t.impact >= 0 ? 'write-up (gain)' : 'write-down (loss)', 'variance', t.impact < 0 ? 'unfav' : 'fav')
        ]));

        var tb = el('tbody');
        items.forEach(function (it) {
          var key = it.sku + '|' + it.type, nc = newCost[key];
          var impact = Math.round(it.qtyOnHand * (nc - it.unitCost) * 100) / 100;
          var input = el('input', { type: 'number', step: '0.01', value: nc, class: 'num', style: 'max-width:110px',
            oninput: function () { newCost[key] = parseFloat(input.value) || 0; render(); } });
          var impactCell = el('td', { class: 'num tnum ' + (impact < 0 ? 'unfav' : impact > 0 ? 'fav' : '') }, (impact >= 0 ? '+' : '') + fmt.money0(impact));
          tb.appendChild(el('tr', {}, [
            el('td', {}, [el('strong', { text: it.sku })]), el('td', { text: it.description }), el('td', {}, [el('span', { class: 'badge sb-neutral', text: (it.type || '').toUpperCase() })]),
            el('td', { class: 'num tnum', text: fmt.num(it.qtyOnHand, 0) }), el('td', { class: 'num tnum', text: fmt.money(it.unitCost) }),
            el('td', {}, [input]), el('td', { class: 'num tnum', text: fmt.money0(it.qtyOnHand * it.unitCost) }), el('td', { class: 'num tnum', text: fmt.money0(it.qtyOnHand * nc) }), impactCell
          ]));
        });
        tb.appendChild(el('tr', { class: 'total' }, [
          el('td', { colspan: 6, text: 'Total' }), el('td', { class: 'num tnum', text: fmt.money0(t.curVal) }), el('td', { class: 'num tnum', text: fmt.money0(t.newVal) }),
          el('td', { class: 'num tnum', text: (t.impact >= 0 ? '+' : '') + fmt.money0(t.impact) })
        ]));
        var table = el('table', { class: 'dt' }, [
          el('thead', {}, el('tr', {}, [el('th', { text: 'SKU' }), el('th', { text: 'Description' }), el('th', { text: 'Type' }), el('th', { class: 'num', text: 'On hand' }), el('th', { class: 'num', text: 'Current cost' }), el('th', { class: 'num', text: 'New cost' }), el('th', { class: 'num', text: 'Current value' }), el('th', { class: 'num', text: 'New value' }), el('th', { class: 'num', text: 'Impact' })])), tb
        ]);
        clear(tableHost);
        tableHost.appendChild(ui.card(null, null, [el('div', { style: 'overflow-x:auto' }, [table])],
          el('button', { class: 'btn btn-primary btn-sm', onclick: function () { journalWindow(t); } }, [CACC.icon('ledger'), 'View revaluation entry'])));
      }
      function journalWindow(t) {
        var up = t.impact >= 0;
        var lines = up
          ? [['Inventory', t.impact, 0], ['Inventory revaluation gain (COGS credit)', 0, t.impact]]
          : [['Inventory revaluation loss (COGS)', -t.impact, 0], ['Inventory', 0, -t.impact]];
        var tb = el('tbody');
        lines.forEach(function (l) { tb.appendChild(el('tr', l[1] === 0 ? { class: 'sub' } : {}, [el('td', { text: l[0] }), el('td', { class: 'num tnum', text: l[1] ? fmt.money(l[1]) : '' }), el('td', { class: 'num tnum', text: l[2] ? fmt.money(l[2]) : '' })])); });
        tb.appendChild(el('tr', { class: 'total' }, [el('td', { text: 'Totals' }), el('td', { class: 'num tnum', text: fmt.money(Math.abs(t.impact)) }), el('td', { class: 'num tnum', text: fmt.money(Math.abs(t.impact)) })]));
        ui.window('Inventory revaluation — journal entry', [
          el('p', { class: 'muted', text: 'Net ' + (up ? 'write-up' : 'write-down') + ' of ' + fmt.money0(Math.abs(t.impact)) + ' to restate on-hand inventory to the revised standard cost.' }),
          el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Account' }), el('th', { class: 'num', text: 'Debit' }), el('th', { class: 'num', text: 'Credit' })])), tb])
        ], 'Balanced · Dr = Cr');
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
