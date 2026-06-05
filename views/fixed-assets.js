/* Fixed Assets — production equipment cost, depreciation and net book value. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.fixedAssets = {
    title: 'Fixed Assets',
    render: function (c) {
      var fa = M.fixedAssets(), t = fa.totals;
      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Asset cost', fmt.money0(t.cost), fa.count + ' assets', 'gauge'),
        ui.kpi('Accum. depreciation', fmt.money0(t.accumDep), null, 'variance'),
        ui.kpi('Net book value', fmt.money0(t.nbv), fmt.pct(t.cost ? t.nbv / t.cost * 100 : 0) + ' of cost', 'box'),
        ui.kpi('Annual depreciation', fmt.money0(t.annualDep), 'feeds overhead rates', 'dollar')
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Asset register · group by category or plant' }));
      c.appendChild(CACC.grid('fixed-assets', [
        { key: 'id', label: 'Asset' }, { key: 'name', label: 'Description' }, { key: 'plantId', label: 'Plant' }, { key: 'category', label: 'Category' }, { key: 'acqDate', label: 'Acquired' },
        { key: 'cost', label: 'Cost', fmt: 'money0', sum: true }, { key: 'accumDep', label: 'Accum dep', fmt: 'money0', sum: true }, { key: 'nbv', label: 'NBV', fmt: 'money0', sum: true },
        { key: 'annualDep', label: 'Annual dep', fmt: 'money0', sum: true }, { key: 'method', label: 'Method' }
      ], fa.rows, { title: 'Fixed assets' }));
      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('fixedAssets', M.ctx.fixedAssets()));
    }
  };
})(typeof window !== 'undefined' ? window : this);
