/* Project Operations — project cost/billing/margin tracking with drill-down windows. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.projects = {
    title: 'Project Operations',
    render: function (c) {
      var rows = M.projects(), t = M.projectTotals();

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Project budget', fmt.money0(t.budget), t.count + ' projects', 'briefcase'),
        ui.kpi('Actual cost', fmt.money0(t.actualCost), fmt.pct(t.budget ? t.actualCost / t.budget * 100 : 0) + ' of budget', 'dollar'),
        ui.kpi('Billed', fmt.money0(t.billed), null, 'dollar'),
        ui.kpi('Project margin', fmt.pct(t.marginPct * 100), t.atRisk + ' at risk', 'margin', t.margin < 0 ? 'unfav' : 'fav')
      ]));

      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        ui.card('Budget vs actual cost by project', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'projBA' })])]),
        ui.card('Project margin', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'projMargin' })])])
      ]));

      var tb = el('tbody');
      rows.forEach(function (p) {
        tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { projectWindow(p); } }, [
          el('td', {}, [el('strong', { text: p.id })]), el('td', { text: p.name }), el('td', { text: p.customer }), el('td', { text: p.plantName }),
          el('td', { class: 'num tnum', text: fmt.money0(p.budget) }), el('td', { class: 'num tnum', text: fmt.money0(p.actualCost) }), el('td', { class: 'num tnum', text: fmt.money0(p.billed) }),
          el('td', { class: 'num tnum ' + (p.margin < 0 ? 'unfav' : 'fav') }, fmt.money0(p.margin)),
          el('td', { style: 'min-width:130px' }, [pctBar(p.pctComplete)]),
          el('td', {}, [el('span', { class: 'badge ' + statusCls(p.status), text: p.status })])
        ]));
      });
      tb.appendChild(el('tr', { class: 'total' }, [
        el('td', { colspan: 4, text: 'Total — ' + t.count + ' projects' }), el('td', { class: 'num tnum', text: fmt.money0(t.budget) }), el('td', { class: 'num tnum', text: fmt.money0(t.actualCost) }),
        el('td', { class: 'num tnum', text: fmt.money0(t.billed) }), el('td', { class: 'num tnum', text: fmt.money0(t.margin) }), el('td', {}), el('td', {})
      ]));
      var table = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'ID' }), el('th', { text: 'Project' }), el('th', { text: 'Customer' }), el('th', { text: 'Plant' }),
          el('th', { class: 'num', text: 'Budget' }), el('th', { class: 'num', text: 'Actual' }), el('th', { class: 'num', text: 'Billed' }), el('th', { class: 'num', text: 'Margin' }), el('th', { text: '% complete' }), el('th', { text: 'Status' })])), tb
      ]);
      c.appendChild(el('div', { class: 'section-title', text: 'Project register · click a row for detail' }));
      c.appendChild(ui.card(null, M.filterLabel(), [el('div', { style: 'overflow-x:auto' }, [table])], CACC.tableTools.exportButton(table, 'projects.csv')));
      CACC.tableTools.makeSortable(table);

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('projects', M.ctx.projects()));

      var th = CACC.chartTheme();
      CACC.chart(document.getElementById('projBA'), {
        type: 'bar', data: { labels: rows.map(function (p) { return p.id; }), datasets: [
          { label: 'Budget', data: rows.map(function (p) { return p.budget; }), backgroundColor: th.palette[3], borderRadius: 3 },
          { label: 'Actual', data: rows.map(function (p) { return p.actualCost; }), backgroundColor: th.accent, borderRadius: 3 }
        ] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: th.text } } },
          scales: { x: { grid: { display: false }, ticks: { color: th.text } }, y: { grid: { color: th.grid }, ticks: { color: th.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } } } }
      });
      CACC.chart(document.getElementById('projMargin'), {
        type: 'bar', data: { labels: rows.map(function (p) { return p.id; }), datasets: [{ data: rows.map(function (p) { return p.margin; }), backgroundColor: rows.map(function (p) { return p.margin < 0 ? th.bad : th.good; }), borderRadius: 3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return CACC.fmt.money0(ctx.raw); } } } },
          scales: { x: { grid: { display: false }, ticks: { color: th.text } }, y: { grid: { color: th.grid }, ticks: { color: th.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } } } }
      });

      function projectWindow(p) {
        ui.window(p.id + ' — ' + p.name, [
          el('div', { class: 'grid g4' }, [
            ui.kpi('Budget', fmt.money0(p.budget), null, 'briefcase'), ui.kpi('Actual cost', fmt.money0(p.actualCost), null, 'dollar'),
            ui.kpi('Billed', fmt.money0(p.billed), null, 'dollar'), ui.kpi('Margin', fmt.money0(p.margin), fmt.pct(p.billed ? p.margin / p.billed * 100 : 0), 'margin', p.margin < 0 ? 'unfav' : 'fav')
          ]),
          el('div', { style: 'margin-top:14px' }, [el('div', { class: 'muted', style: 'margin-bottom:6px', text: 'Completion' }), pctBar(p.pctComplete)]),
          el('table', { class: 'dt', style: 'margin-top:14px' }, [el('tbody', {}, [
            kv('Customer', p.customer), kv('Plant', p.plantName), kv('Status', p.status),
            kv('Cost-to-budget', fmt.pct(p.budget ? p.actualCost / p.budget * 100 : 0)),
            kv('Estimate at completion', fmt.money0(p.pctComplete ? p.actualCost / p.pctComplete : p.actualCost))
          ])])
        ], p.customer + ' · ' + p.plantName);
      }
      function kv(k, v) { return el('tr', {}, [el('td', { text: k }), el('td', { class: 'num', style: 'text-align:right', text: v })]); }
    }
  };

  function pctBar(v) {
    return el('div', { style: 'display:flex;align-items:center;gap:8px' }, [
      el('div', { class: 'dim-bar', style: 'flex:1' }, [el('span', { style: 'width:' + Math.min(100, v * 100) + '%;background:' + (v >= 1 ? 'var(--good)' : 'var(--accent)') })]),
      el('span', { class: 'tnum', style: 'font-size:12px', text: CACC.fmt.pct(v * 100, 0) })
    ]);
  }
  function statusCls(s) { return s === 'Complete' ? 'sb-good' : s === 'Planning' ? 'sb-neutral' : 'sb-warn'; }
})(typeof window !== 'undefined' ? window : this);
