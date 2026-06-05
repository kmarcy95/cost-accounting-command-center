/* Landed Cost — allocate freight/duty/handling/insurance into inventory value. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.landedCost = {
    title: 'Landed Cost',
    render: function (c) {
      var shipments = M.landedShipments();
      var idx = 0, pane = el('div', {});
      var sel = el('select', {}, shipments.map(function (s, i) { return el('option', { value: i, text: s.id + ' — ' + s.vessel }); }));
      sel.addEventListener('change', function () { idx = +sel.value; render(); });
      c.appendChild(el('div', { class: 'card card-pad', style: 'display:flex;gap:12px;align-items:end' }, [el('div', { class: 'field', style: 'min-width:280px' }, [el('label', { text: 'Shipment' }), sel])]));
      c.appendChild(pane);
      render();
      c.appendChild(ui.aiPanel('landedCost', M.ctx.landedCost()));

      function render() {
        clear(pane);
        var s = shipments[idx], r = s.result;
        pane.appendChild(el('div', { class: 'grid g3' }, [
          ui.kpi('Charges to allocate', fmt.money0(r.totalCharges), s.charges.length + ' buckets', 'truck'),
          ui.kpi('Allocated', fmt.money0(r.totalAllocated), r.reconciles ? 'reconciles ✓' : 'check allocation', 'dollar', r.reconciles ? 'fav' : 'unfav'),
          ui.kpi('Receipts', String(r.rows.length), s.origin, 'box')
        ]));
        pane.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
          ui.card('Charge buckets', null, [el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Charge' }), el('th', { text: 'Basis' }), el('th', { class: 'num', text: 'Amount' })])),
            el('tbody', {}, s.charges.map(function (ch) { return el('tr', {}, [el('td', { text: ch.type }), el('td', {}, [el('span', { class: 'badge sb-neutral', text: ch.basis })]), el('td', { class: 'num tnum', text: fmt.money0(ch.amount) })]); }))])]),
          ui.card('Landed cost by receipt', 'invoice value + allocated charge = landed value', [el('div', { style: 'overflow-x:auto' }, [el('table', { class: 'dt' }, [
            el('thead', {}, el('tr', {}, [el('th', { text: 'Receipt' }), el('th', { text: 'SKU' }), el('th', { class: 'num', text: 'Qty' }), el('th', { class: 'num', text: 'Invoice value' }), el('th', { class: 'num', text: 'Allocated' }), el('th', { class: 'num', text: 'Landed value' }), el('th', { class: 'num', text: 'Base /u' }), el('th', { class: 'num', text: 'Landed /u' })])),
            el('tbody', {}, r.rows.map(function (x) { return el('tr', {}, [el('td', { text: x.id }), el('td', {}, [el('strong', { text: x.sku })]), el('td', { class: 'num tnum', text: fmt.num(x.qty, 0) }), el('td', { class: 'num tnum', text: fmt.money0(x.value) }), el('td', { class: 'num tnum unfav', text: fmt.money0(x.allocated) }), el('td', { class: 'num tnum', text: fmt.money0(x.landedValue) }), el('td', { class: 'num tnum', text: fmt.money(x.baseUnit) }), el('td', { class: 'num tnum', text: fmt.money(x.landedUnit) })]); }))
          ])])])
        ]));
        pane.appendChild(el('div', { class: 'note', style: 'margin-top:14px' }, 'Landed cost capitalizes inbound freight, duty, handling and insurance into inventory value (IAS 2 “costs to bring inventory to its present location and condition”). Validate estimate-to-actual variance and clear accruals at invoice.'));
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
