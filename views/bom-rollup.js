/* BOM & Cost Rollup — multilevel costed BOM with cost component split. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.bomRollup = {
    title: 'BOM & Cost Rollup',
    render: function (c) {
      var roots = CACC.store.data().bomRoots || [];
      var sku = roots[0];
      var pane = el('div', {});
      var sel = el('select', {}, roots.map(function (s) { return el('option', { value: s, text: (CACC.store.data().bomNodes[s] || {}).name || s }); }));
      sel.addEventListener('change', function () { sku = sel.value; render(); });
      c.appendChild(el('div', { class: 'card card-pad', style: 'display:flex;gap:12px;align-items:end' }, [
        el('div', { class: 'field', style: 'min-width:240px' }, [el('label', { text: 'Finished product' }), sel])
      ]));
      c.appendChild(pane);
      render();

      function render() {
        clear(pane);
        var r = M.bomRollupOf(sku), s = r.split, rows = M.bomExplodeOf(sku);
        pane.appendChild(el('div', { class: 'grid g4' }, [
          ui.kpi('Rolled unit cost', fmt.money(r.total), r.name, 'product'),
          ui.kpi('Material', fmt.money(s.material), fmt.pct(r.total ? s.material / r.total * 100 : 0), 'box'),
          ui.kpi('Labor', fmt.money(s.labor), fmt.pct(r.total ? s.labor / r.total * 100 : 0), 'users'),
          ui.kpi('Overhead + subcon', fmt.money(s.overhead + s.subcontract), fmt.pct(r.total ? (s.overhead + s.subcontract) / r.total * 100 : 0), 'gauge')
        ]));
        pane.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
          ui.card('Cost component split', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'bomSplit' })])]),
          ui.card('Costed BOM (indented)', 'multilevel explosion', [el('div', { style: 'overflow-x:auto' }, [bomTable(rows)])])
        ]));
        pane.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
        pane.appendChild(ui.aiPanel('bomRollup', { group: CACC.store.data().group, sku: sku, rollup: r }));
        var t = CACC.chartTheme();
        CACC.chart(document.getElementById('bomSplit'), {
          type: 'doughnut', data: { labels: ['Material', 'Labor', 'Overhead', 'Subcontract'], datasets: [{ data: [s.material, s.labor, s.overhead, s.subcontract], backgroundColor: t.palette.slice(0, 4), borderWidth: 0 }] },
          options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: t.text } }, tooltip: { callbacks: { label: function (ctx) { return ctx.label + ': ' + CACC.fmt.money(ctx.raw); } } } } }
        });
      }
      function bomTable(rows) {
        var tb = el('tbody');
        rows.forEach(function (r) {
          tb.appendChild(el('tr', {}, [
            el('td', { style: 'padding-left:' + (8 + r.level * 18) + 'px' }, [el('strong', { text: r.sku }), el('span', { class: 'muted', text: '  ' + r.name })]),
            el('td', {}, [el('span', { class: 'badge ' + (r.type === 'make' ? 'sb-good' : 'sb-neutral'), text: r.type })]),
            el('td', { class: 'num tnum', text: fmt.num(r.qtyPer, 2) }), el('td', { class: 'num tnum', text: fmt.money(r.unitCost) }), el('td', { class: 'num tnum', text: fmt.money(r.extended) })
          ]));
        });
        return el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Component' }), el('th', { text: 'Make/Buy' }), el('th', { class: 'num', text: 'Qty/parent' }), el('th', { class: 'num', text: 'Unit cost' }), el('th', { class: 'num', text: 'Extended' })])), tb]);
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
