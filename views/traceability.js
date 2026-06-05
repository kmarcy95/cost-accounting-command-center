/* Lot & Serial Traceability — genealogy (backward/forward) with cost linkage. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.traceability = {
    title: 'Lot & Serial Traceability',
    render: function (c) {
      var lots = M.lots();
      c.appendChild(el('div', { class: 'grid g3' }, [
        ui.kpi('Tracked lots', String(lots.length), 'with genealogy', 'map'),
        ui.kpi('Finished lots', String(lots.filter(function (l) { return l.sku.indexOf('GX') === 0; }).length), null, 'product'),
        ui.kpi('On hold', String(lots.filter(function (l) { return l.status === 'On hold'; }).length), 'quarantine', 'warning', 'unfav')
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Lots · click for backward & forward genealogy' }));
      c.appendChild(CACC.grid('lots', [
        { key: 'lot', label: 'Lot' }, { key: 'sku', label: 'SKU' }, { key: 'plantId', label: 'Plant' }, { key: 'period', label: 'Period' }, { key: 'qty', label: 'Qty', fmt: 'num' },
        { key: 'status', label: 'Status', render: function (r) { return el('span', { class: 'badge ' + (r.status === 'Shipped' ? 'sb-good' : r.status === 'On hold' ? 'sb-bad' : 'sb-neutral'), text: r.status }); } }
      ], lots, { title: 'Lots', onRow: function (r) { genealogy(r.lot); } }));

      function genealogy(lot) {
        var g = M.lotGenealogy(lot);
        function list(title, arr) {
          return el('div', {}, [el('div', { class: 'section-title', text: title }), arr.length ? el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Lot' }), el('th', { text: 'SKU' }), el('th', { class: 'num', text: 'Qty' }), el('th', { text: 'Status' })])),
            el('tbody', {}, arr.map(function (l) { return el('tr', {}, [el('td', {}, [el('strong', { text: l.lot })]), el('td', { text: l.sku }), el('td', { class: 'num tnum', text: fmt.num(l.qty, 0) }), el('td', {}, [el('span', { class: 'badge sb-neutral', text: l.status })])]); }))]) : el('p', { class: 'muted', text: 'None.' })]);
        }
        ui.window('Genealogy — ' + lot, [
          el('div', { class: 'note' }, g.lot ? (g.lot.sku + ' · ' + g.lot.qty + ' units · ' + g.lot.plantId + ' · ' + g.lot.period + ' · ' + g.lot.status) : lot),
          list('⬆ Backward trace (consumed into this lot)', g.ancestors),
          list('⬇ Forward trace (this lot consumed into)', g.descendants)
        ], 'Recall / containment readiness');
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
