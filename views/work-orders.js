/* Work Orders & WIP — production-order WIP, COGM and production variances. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.workOrders = {
    title: 'Work Orders & WIP',
    render: function (c) {
      var wo = M.workOrders(), t = wo.totals;
      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('WIP balance', fmt.money0(t.wipBalance), t.open + ' open orders', 'inventory', t.wipBalance > 0 ? 'unfav' : ''),
        ui.kpi('Cost of goods mfd', fmt.money0(t.stdCogm), 'at standard', 'box'),
        ui.kpi('Issued to production', fmt.money0(t.wipIssued), null, 'dollar'),
        ui.kpi('Net production variance', fmt.variance(t.total), 'material ' + fmt.money0(t.material) + ' · labor ' + fmt.money0(t.labor), 'variance', t.total > 0 ? 'unfav' : 'fav')
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Production orders · click for variance detail' }));
      c.appendChild(CACC.grid('work-orders', [
        { key: 'id', label: 'Order' }, { key: 'productSku', label: 'Product' }, { key: 'plantId', label: 'Plant' },
        { key: 'status', label: 'Status', render: function (r) { return el('span', { class: 'badge ' + (r.status === 'Closed' ? 'sb-good' : r.status === 'Released' ? 'sb-neutral' : 'sb-warn'), text: r.status }); } },
        { key: 'orderedQty', label: 'Ordered', fmt: 'num' }, { key: 'completedQty', label: 'Done', fmt: 'num' },
        { key: 'pc', label: '% done', value: function (r) { return r.percentComplete; }, render: function (r) { return fmt.pct(r.percentComplete * 100, 0); } },
        { key: 'stdCogm', label: 'Std COGM', fmt: 'money0', sum: true }, { key: 'wipBalance', label: 'WIP', fmt: 'money0', sum: true },
        { key: 'tv', label: 'Variance', value: function (r) { return r.variances.total; }, sum: true, render: function (r) { return el('span', { class: r.variances.total > 0 ? 'unfav' : 'fav', text: fmt.money0(r.variances.total) }); } }
      ], wo.rows, { title: 'Work orders', onRow: function (r) { woWindow(r); } }));
      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('workOrders', M.ctx.workOrders()));

      function woWindow(r) {
        ui.window(r.id + ' — ' + r.productSku, [
          el('div', { class: 'grid g4' }, [
            ui.kpi('Std unit cost', fmt.money(r.stdUnitCost), null, 'product'), ui.kpi('Std COGM', fmt.money0(r.stdCogm), r.completedQty + ' units', 'box'),
            ui.kpi('WIP balance', fmt.money0(r.wipBalance), null, 'inventory', r.wipBalance > 0 ? 'unfav' : ''), ui.kpi('Total variance', fmt.variance(r.variances.total), null, 'variance', r.variances.total > 0 ? 'unfav' : 'fav')
          ]),
          el('div', { class: 'section-title', text: 'Production variances' }),
          el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Component' }), el('th', { class: 'num', text: 'Variance' }), el('th', { text: '' })])),
            el('tbody', {}, [vrow('Direct material', r.variances.material), vrow('Direct labor', r.variances.labor), vrow('Overhead', r.variances.overhead),
              r.lotSizeVariance ? vrow('Lot-size (setup spread)', r.lotSizeVariance) : null,
              el('tr', { class: 'total' }, [el('td', { text: 'Total' }), ui.vcell(r.variances.total), el('td', {}, [ui.badgeFor(r.variances.total)])])])])
        ], r.plantId + ' · ' + r.status);
      }
      function vrow(label, v) { return el('tr', {}, [el('td', { text: label }), ui.vcell(v), el('td', {}, [ui.badgeFor(v)])]); }
    }
  };
})(typeof window !== 'undefined' ? window : this);
