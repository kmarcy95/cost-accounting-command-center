/* Item Master view — searchable SKU catalog with lowest-level drill-down. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.itemMaster = {
    title: 'Item Master',
    render: function (c) {
      var data = CACC.store.data();
      var res = M.reserve(), t = res.totals;
      var rawBySku = {}; data.items.forEach(function (it) { rawBySku[it.sku] = it; });
      var query = '', cat = 'All';

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('SKUs tracked', String(data.items.length), 'materials + finished goods', 'list'),
        ui.kpi('Gross value', fmt.money0(t.grossValue), null, 'box'),
        ui.kpi('Net value', fmt.money0(t.netValue), 'after reserves', 'margin'),
        ui.kpi('Reserved SKUs', String(t.itemsReserved), fmt.pct(t.reservePct * 100) + ' of gross', 'warning', t.itemsReserved ? 'unfav' : 'fav')
      ]));

      // Controls
      var search = el('input', { type: 'text', placeholder: 'Search SKU or description…', class: 'input',
        oninput: function () { query = search.value.toLowerCase(); renderRows(); } });
      var cats = ['All'].concat(res.byCategory.map(function (g) { return g.category; }));
      var catSel = el('select', {}, cats.map(function (x) { return el('option', { value: x, text: x }); }));
      catSel.addEventListener('change', function () { cat = catSel.value; renderRows(); });

      var tbody = el('tbody');
      var table = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [
          el('th', { text: 'SKU' }), el('th', { text: 'Description' }), el('th', { text: 'Category' }), el('th', { text: 'Type' }),
          el('th', { class: 'num', text: 'On hand' }), el('th', { class: 'num', text: 'Unit cost' }), el('th', { class: 'num', text: 'Gross' }),
          el('th', { class: 'num', text: 'Reserve' }), el('th', { class: 'num', text: 'Net' }), el('th', { text: 'Status' })
        ])), tbody
      ]);

      c.appendChild(el('div', { class: 'card', style: 'margin-top:18px' }, [
        el('div', { class: 'card-pad', style: 'display:flex;gap:12px;flex-wrap:wrap;align-items:end' }, [
          el('div', { class: 'field', style: 'flex:1;min-width:220px' }, [el('label', { text: 'Search' }), search]),
          el('div', { class: 'field', style: 'min-width:180px' }, [el('label', { text: 'Category' }), catSel])
        ]),
        el('div', { style: 'overflow-x:auto' }, [table])
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('itemMaster', M.ctx.itemMaster()));

      function renderRows() {
        clear(tbody);
        var shown = res.items.filter(function (r) {
          var q = !query || (r.sku.toLowerCase().indexOf(query) >= 0 || r.description.toLowerCase().indexOf(query) >= 0);
          var cc = cat === 'All' || r.category === cat;
          return q && cc;
        });
        if (!shown.length) {
          tbody.appendChild(el('tr', {}, [el('td', { colspan: 10, class: 'muted', style: 'text-align:center;padding:24px', text: 'No SKUs match.' })]));
          return;
        }
        shown.forEach(function (r) {
          tbody.appendChild(el('tr', { style: 'cursor:pointer', title: 'Drill down',
            onclick: function () { ui.modal(r.sku + ' — ' + r.description, ui.itemDetail(r, rawBySku[r.sku]), r.category + ' · drill-down'); } }, [
            el('td', {}, [el('strong', { text: r.sku })]),
            el('td', { text: r.description }), el('td', { text: r.category }),
            el('td', {}, [el('span', { class: 'badge sb-neutral', text: (r.type || '').toUpperCase() })]),
            el('td', { class: 'num tnum', text: fmt.num(r.qtyOnHand, 0) }),
            el('td', { class: 'num tnum', text: fmt.money(r.unitCost) }),
            el('td', { class: 'num tnum', text: fmt.money0(r.grossValue) }),
            el('td', { class: 'num tnum' + (r.combinedReserve > 0 ? ' unfav' : '') }, fmt.money0(r.combinedReserve)),
            el('td', { class: 'num tnum', text: fmt.money0(r.netValue) }),
            el('td', {}, [r.combinedReserve > 0 ? el('span', { class: 'badge sb-warn', text: 'Reserved' }) : el('span', { class: 'badge sb-good', text: 'Clean' })])
          ]));
        });
      }
      renderRows();
    }
  };
})(typeof window !== 'undefined' ? window : this);
