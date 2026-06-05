/* Item Master — searchable SKU catalog on the personalizable grid + drill-down window. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.itemMaster = {
    title: 'Item Master',
    render: function (c) {
      var data = CACC.store.data();
      var res = M.reserve(), t = res.totals;
      var rawBySku = {}; data.items.forEach(function (it) { rawBySku[it.sku] = it; });

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('SKUs tracked', String(data.items.length), 'materials + finished goods', 'list'),
        ui.kpi('Gross value', fmt.money0(t.grossValue), null, 'box'),
        ui.kpi('Net value', fmt.money0(t.netValue), 'after reserves', 'margin'),
        ui.kpi('Reserved SKUs', String(t.itemsReserved), fmt.pct(t.reservePct * 100) + ' of gross', 'warning', t.itemsReserved ? 'unfav' : 'fav')
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'Catalog · search, group by category/type, choose columns, save your view · click a row to drill down' }));
      c.appendChild(CACC.grid('item-master', [
        { key: 'sku', label: 'SKU' }, { key: 'description', label: 'Description' }, { key: 'category', label: 'Category' },
        { key: 'type', label: 'Type', render: function (r) { return el('span', { class: 'badge sb-neutral', text: (r.type || '').toUpperCase() }); } },
        { key: 'qtyOnHand', label: 'On hand', fmt: 'num' }, { key: 'unitCost', label: 'Unit cost', fmt: 'money' },
        { key: 'grossValue', label: 'Gross', fmt: 'money0', sum: true },
        { key: 'combinedReserve', label: 'Reserve', fmt: 'money0', sum: true, render: function (r) { return el('span', { class: r.combinedReserve > 0 ? 'unfav' : '', text: fmt.money0(r.combinedReserve) }); } },
        { key: 'netValue', label: 'Net', fmt: 'money0', sum: true },
        { key: 'status', label: 'Status', value: function (r) { return r.combinedReserve > 0 ? 'Reserved' : 'Clean'; }, render: function (r) { return el('span', { class: 'badge ' + (r.combinedReserve > 0 ? 'sb-warn' : 'sb-good'), text: r.combinedReserve > 0 ? 'Reserved' : 'Clean' }); } }
      ], res.items, { title: 'Item master', onRow: function (r) { ui.window(r.sku + ' — ' + r.description, ui.itemDetail(r, rawBySku[r.sku]), r.category + ' · drill-down'); } }));

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('itemMaster', M.ctx.itemMaster()));
    }
  };
})(typeof window !== 'undefined' ? window : this);
