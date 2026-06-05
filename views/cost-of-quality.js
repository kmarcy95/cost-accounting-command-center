/* Cost of Quality — prevention / appraisal / internal & external failure. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.costOfQuality = {
    title: 'Cost of Quality',
    render: function (c) {
      var q = M.qualityByCategory();
      var failRatio = q.total ? q.failure / q.total : 0;
      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Total cost of quality', fmt.money0(q.total), q.events.length + ' events', 'warning'),
        ui.kpi('Conformance', fmt.money0(q.conformance), 'prevention + appraisal', 'gauge', 'fav'),
        ui.kpi('Failure', fmt.money0(q.failure), 'internal + external', 'variance', 'unfav'),
        ui.kpi('Failure ratio', fmt.pct(failRatio * 100), 'of total CoQ', 'margin', failRatio > 0.5 ? 'unfav' : 'fav')
      ]));
      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        ui.card('Cost by category', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'coqChart' })])]),
        ui.card('Categories', null, [el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Category' }), el('th', { class: 'num', text: 'Events' }), el('th', { class: 'num', text: 'Cost' })])),
          el('tbody', {}, q.categories.map(function (x) { return el('tr', {}, [el('td', {}, [el('span', { class: 'badge ' + catCls(x.category), text: x.category })]), el('td', { class: 'num tnum', text: String(x.count) }), el('td', { class: 'num tnum', text: fmt.money0(x.amount) })]); })
            .concat([el('tr', { class: 'total' }, [el('td', { text: 'Total' }), el('td', { class: 'num tnum', text: String(q.events.length) }), el('td', { class: 'num tnum', text: fmt.money0(q.total) })])]))])])
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Quality events (NCR / CAPA / inspection / warranty)' }));
      c.appendChild(CACC.grid('coq-events', [
        { key: 'id', label: 'Event' }, { key: 'date', label: 'Period' }, { key: 'plantId', label: 'Plant' }, { key: 'type', label: 'Type' },
        { key: 'category', label: 'Category', render: function (r) { return el('span', { class: 'badge ' + catCls(r.category), text: r.category }); } },
        { key: 'sku', label: 'SKU' }, { key: 'amount', label: 'Cost', fmt: 'money0', sum: true },
        { key: 'status', label: 'Status', render: function (r) { return el('span', { class: 'badge ' + (r.status === 'Closed' ? 'sb-good' : 'sb-warn'), text: r.status }); } }
      ], q.events, { title: 'Quality events' }));
      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('costOfQuality', M.ctx.costOfQuality()));

      var t = CACC.chartTheme();
      CACC.chart(document.getElementById('coqChart'), {
        type: 'bar', data: { labels: q.categories.map(function (x) { return x.category; }), datasets: [{ data: q.categories.map(function (x) { return x.amount; }), backgroundColor: [t.good, t.accent, t.palette[2], t.bad], borderRadius: 4 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return CACC.fmt.money0(ctx.raw); } } } },
          scales: { x: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } }, y: { grid: { display: false }, ticks: { color: t.text } } } }
      });
    }
  };
  function catCls(c) { return c === 'Prevention' ? 'sb-good' : c === 'Appraisal' ? 'sb-neutral' : c === 'Internal failure' ? 'sb-warn' : 'sb-bad'; }
})(typeof window !== 'undefined' ? window : this);
