/* Warehouse Visibility (Supply Chain) — on-hand by location with an interactive bin map. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.warehouse = {
    title: 'Warehouse Visibility',
    render: function (c) {
      var w = M.warehouse();

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('On-hand value', fmt.money0(w.totalValue), w.skus + ' SKU-locations', 'map'),
        ui.kpi('Locations', String(w.skus), 'active bins', 'inventory'),
        ui.kpi('Low / stockout', String(w.low), 'need replenishment', 'warning', w.low ? 'unfav' : 'fav'),
        ui.kpi('Avg bin value', fmt.money0(w.skus ? w.totalValue / w.skus : 0), null, 'box')
      ]));

      // Location map — clickable bin tiles
      c.appendChild(el('div', { class: 'section-title', text: 'Location map · click a bin to inspect' }));
      var map = el('div', { class: 'binmap' });
      w.rows.forEach(function (r) {
        var tone = r.status === 'Stockout' ? 'bin-bad' : r.status === 'Low' ? 'bin-warn' : 'bin-ok';
        map.appendChild(el('button', { class: 'bin ' + tone, title: r.productName + ' @ ' + r.bin, onclick: function () { binWindow(r); } }, [
          el('div', { class: 'bin-loc', text: r.bin }),
          el('div', { class: 'bin-sku', text: r.sku }),
          el('div', { class: 'bin-qty tnum', text: fmt.num(r.qty, 0) }),
          el('div', { class: 'bin-val tnum', text: fmt.money0(r.value) })
        ]));
      });
      c.appendChild(ui.card(null, M.filterLabel() + ' · green = in stock, amber = low, red = stockout', [map]));

      // On-hand register
      var tb = el('tbody');
      w.rows.forEach(function (r) {
        tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { binWindow(r); } }, [
          el('td', { text: r.plantName }), el('td', { text: r.bin }), el('td', {}, [el('strong', { text: r.sku })]), el('td', { text: r.productName }),
          el('td', { class: 'num tnum ' + (r.qty <= 0 ? 'unfav' : ''), text: fmt.num(r.qty, 0) }), el('td', { class: 'num tnum', text: fmt.money(r.lastCost) }), el('td', { class: 'num tnum', text: fmt.money0(r.value) }),
          el('td', {}, [el('span', { class: 'badge ' + (r.status === 'In stock' ? 'sb-good' : r.status === 'Low' ? 'sb-warn' : 'sb-bad'), text: r.status })])
        ]));
      });
      var table = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'Plant' }), el('th', { text: 'Bin' }), el('th', { text: 'SKU' }), el('th', { text: 'Product' }), el('th', { class: 'num', text: 'On hand' }), el('th', { class: 'num', text: 'Unit cost' }), el('th', { class: 'num', text: 'Value' }), el('th', { text: 'Status' })])), tb
      ]);
      c.appendChild(el('div', { class: 'section-title', text: 'On-hand register' }));
      c.appendChild(ui.card(null, M.filterLabel(), [el('div', { style: 'overflow-x:auto' }, [table])], CACC.tableTools.exportButton(table, 'warehouse-onhand.csv')));
      CACC.tableTools.makeSortable(table);

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('warehouse', M.ctx.warehouse()));

      function binWindow(r) {
        var txns = (CACC.store.data().transactions || []).filter(function (t) { return t.plantId === r.plantId && t.sku === r.sku; });
        var tb2 = el('tbody');
        txns.forEach(function (t) { tb2.appendChild(el('tr', {}, [el('td', { text: t.date }), el('td', {}, [el('span', { class: 'badge sb-neutral', text: t.type })]), el('td', { class: 'num tnum ' + (t.qty < 0 ? 'unfav' : 'fav'), text: fmt.num(t.qty, 0) }), el('td', { class: 'num tnum', text: fmt.money(t.unitCost) }), el('td', { class: 'num tnum', text: fmt.money0(t.value) })])); });
        ui.window(r.sku + ' @ ' + r.bin, [
          el('div', { class: 'grid g3' }, [
            ui.kpi('On hand', fmt.num(r.qty, 0), r.status, 'box', r.qty <= 0 ? 'unfav' : 'fav'),
            ui.kpi('Value', fmt.money0(r.value), null, 'dollar'), ui.kpi('Location', r.bin, r.plantName, 'map')
          ]),
          el('div', { class: 'section-title', text: 'Movement history' }),
          el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Period' }), el('th', { text: 'Type' }), el('th', { class: 'num', text: 'Qty' }), el('th', { class: 'num', text: 'Unit cost' }), el('th', { class: 'num', text: 'Value' })])), tb2])
        ], r.productName + ' · ' + r.plantName);
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
