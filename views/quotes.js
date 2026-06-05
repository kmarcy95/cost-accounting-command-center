/* Quotes & Opportunities — sales pipeline (Lead -> Opportunity -> Quote -> Won/Lost). */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;
  var FLOW = ['Lead', 'Opportunity', 'Quote', 'Won'];

  CACC.views.quotes = {
    title: 'Quotes & Opportunities',
    render: function (c) {
      var p = M.pipeline();

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Pipeline value', fmt.money0(p.totalAmount), p.opportunities.length + ' opportunities', 'dollar'),
        ui.kpi('Weighted pipeline', fmt.money0(p.weighted), 'probability-adjusted', 'margin', 'fav'),
        ui.kpi('Open value', fmt.money0(p.openValue), 'not yet won/lost', 'variance'),
        ui.kpi('Win rate', fmt.pct(p.winRate * 100), 'won / (won+lost)', 'gauge', p.winRate >= 0.5 ? 'fav' : 'unfav')
      ]));

      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        ui.card('Pipeline by stage', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'pipeChart' })])]),
        ui.card('Stage summary', null, [
          el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Stage' }), el('th', { class: 'num', text: 'Count' }), el('th', { class: 'num', text: 'Amount' }), el('th', { class: 'num', text: 'Weighted' })])),
            el('tbody', {}, p.stages.map(function (s) { return el('tr', {}, [el('td', {}, [el('span', { class: 'badge ' + stageCls(s.stage), text: s.stage })]), el('td', { class: 'num tnum', text: String(s.count) }), el('td', { class: 'num tnum', text: fmt.money0(s.amount) }), el('td', { class: 'num tnum', text: fmt.money0(s.weighted) })]); }))])
        ])
      ]));

      var tb = el('tbody');
      p.opportunities.slice().sort(function (a, b) { return b.amount - a.amount; }).forEach(function (o) {
        tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { oppWindow(o); } }, [
          el('td', {}, [el('strong', { text: o.id })]), el('td', { text: o.name }), el('td', { text: o.customer }), el('td', { text: o.owner }),
          el('td', {}, [el('span', { class: 'badge ' + stageCls(o.stage), text: o.stage })]),
          el('td', { class: 'num tnum', text: fmt.money0(o.amount) }), el('td', { class: 'num tnum', text: fmt.pct(o.probability * 100, 0) }), el('td', { class: 'num tnum', text: fmt.money0(o.weighted) }), el('td', { text: o.closeDate })
        ]));
      });
      var table = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'ID' }), el('th', { text: 'Opportunity' }), el('th', { text: 'Customer' }), el('th', { text: 'Owner' }), el('th', { text: 'Stage' }), el('th', { class: 'num', text: 'Amount' }), el('th', { class: 'num', text: 'Prob' }), el('th', { class: 'num', text: 'Weighted' }), el('th', { text: 'Close' })])), tb
      ]);
      c.appendChild(el('div', { class: 'section-title', text: 'Opportunities · click a row for the deal flow' }));
      c.appendChild(ui.card(null, M.filterLabel(), [el('div', { style: 'overflow-x:auto' }, [table])], CACC.tableTools.exportButton(table, 'opportunities.csv')));
      CACC.tableTools.makeSortable(table);

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('quotes', M.ctx.quotes()));

      var th = CACC.chartTheme();
      CACC.chart(document.getElementById('pipeChart'), {
        type: 'bar', data: { labels: p.stages.map(function (s) { return s.stage; }), datasets: [{ data: p.stages.map(function (s) { return s.amount; }), backgroundColor: p.stages.map(function (s) { return s.stage === 'Won' ? th.good : s.stage === 'Lost' ? th.bad : th.accent; }), borderRadius: 4 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return CACC.fmt.money0(ctx.raw); } } } },
          scales: { x: { grid: { color: th.grid }, ticks: { color: th.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } }, y: { grid: { display: false }, ticks: { color: th.text } } } }
      });

      function oppWindow(o) {
        var lost = o.stage === 'Lost';
        var active = lost ? 2 : Math.min(o.stageIndex, 3);
        ui.window(o.id + ' — ' + o.name, [
          ui.stageBar(FLOW, active),
          el('div', { style: 'height:14px' }),
          el('div', { class: 'grid g4' }, [
            ui.kpi('Amount', fmt.money0(o.amount), null, 'dollar'), ui.kpi('Probability', fmt.pct(o.probability * 100, 0), null, 'gauge'),
            ui.kpi('Weighted', fmt.money0(o.weighted), null, 'margin'), ui.kpi('Stage', o.stage, lost ? 'closed lost' : '', 'variance', lost ? 'unfav' : o.stage === 'Won' ? 'fav' : '')
          ]),
          el('table', { class: 'dt', style: 'margin-top:14px' }, [el('tbody', {}, [
            kv('Customer', o.customer), kv('Owner', o.owner), kv('Expected close', o.closeDate), kv('Plant', o.plantId)
          ])])
        ], o.customer + ' · owner ' + o.owner);
      }
      function kv(k, v) { return el('tr', {}, [el('td', { text: k }), el('td', { class: 'num', style: 'text-align:right', text: v })]); }
    }
  };
  function stageCls(s) { return s === 'Won' ? 'sb-good' : s === 'Lost' ? 'sb-bad' : s === 'Quote' ? 'sb-warn' : 'sb-neutral'; }
})(typeof window !== 'undefined' ? window : this);
