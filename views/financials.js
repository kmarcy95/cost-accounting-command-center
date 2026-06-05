/* Financial Statements (Finance) — P&L from facts + SG&A, consolidated and by plant. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.financials = {
    title: 'Financial Statements',
    render: function (c) {
      var p = M.financials();

      c.appendChild(el('div', { class: 'note', style: 'margin-bottom:4px' }, [el('strong', { text: (CACC.store.data().group || 'Group') + ' — Income Statement' }), ' · ', M.filterLabel()]));

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Revenue', fmt.money0(p.revenue), null, 'dollar'),
        ui.kpi('Gross profit', fmt.money0(p.grossProfit), fmt.pct(p.grossMarginPct * 100) + ' margin', 'margin', 'fav'),
        ui.kpi('Operating income', fmt.money0(p.operating), fmt.pct(p.opMarginPct * 100) + ' op margin', 'variance', p.operating < 0 ? 'unfav' : 'fav'),
        ui.kpi('SG&A', fmt.money0(p.sga), fmt.pct(p.revenue ? p.sga / p.revenue * 100 : 0) + ' of revenue', 'ledger')
      ]));

      // Consolidated P&L
      var plTable = el('table', { class: 'dt' }, [
        el('tbody', {}, [
          plRow('Revenue', p.revenue, p.revenue, false),
          plRow('Cost of goods sold', -p.cogs, p.revenue, true),
          plRow('Gross profit', p.grossProfit, p.revenue, false, true),
          plRow('SG&A', -p.sga, p.revenue, true),
          plRow('Operating income', p.operating, p.revenue, false, true)
        ])
      ]);

      // By-plant P&L (sortable, exportable, clickable)
      var tb = el('tbody');
      p.byPlant.forEach(function (g) {
        tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { plantWindow(g); } }, [
          el('td', {}, [el('strong', { text: g.name })]),
          el('td', { class: 'num tnum', text: fmt.money0(g.revenue) }),
          el('td', { class: 'num tnum', text: fmt.money0(g.cogs) }),
          el('td', { class: 'num tnum', text: fmt.money0(g.grossProfit) }),
          el('td', { class: 'num tnum', text: fmt.money0(g.sga) }),
          el('td', { class: 'num tnum ' + (g.operating < 0 ? 'unfav' : 'fav') }, fmt.money0(g.operating)),
          el('td', { class: 'num tnum', text: fmt.pct(g.opMarginPct * 100) })
        ]));
      });
      tb.appendChild(el('tr', { class: 'total' }, [
        el('td', { text: 'Consolidated' }), el('td', { class: 'num tnum', text: fmt.money0(p.revenue) }), el('td', { class: 'num tnum', text: fmt.money0(p.cogs) }),
        el('td', { class: 'num tnum', text: fmt.money0(p.grossProfit) }), el('td', { class: 'num tnum', text: fmt.money0(p.sga) }), el('td', { class: 'num tnum', text: fmt.money0(p.operating) }), el('td', { class: 'num tnum', text: fmt.pct(p.opMarginPct * 100) })
      ]));
      var byPlantTable = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'Plant' }), el('th', { class: 'num', text: 'Revenue' }), el('th', { class: 'num', text: 'COGS' }), el('th', { class: 'num', text: 'Gross profit' }), el('th', { class: 'num', text: 'SG&A' }), el('th', { class: 'num', text: 'Operating' }), el('th', { class: 'num', text: 'Op %' })])), tb
      ]);

      c.appendChild(el('div', { class: 'grid', style: 'grid-template-columns: 1fr 1.4fr;margin-top:18px' }, [
        ui.card('Income statement', M.filterLabel(), [plTable]),
        ui.card('By plant · click a row for detail', null, [el('div', { style: 'overflow-x:auto' }, [byPlantTable]), el('div', { class: 'chart-wrap sm', style: 'margin-top:12px' }, [el('canvas', { id: 'finChart' })])], CACC.tableTools.exportButton(byPlantTable, 'pnl-by-plant.csv'))
      ]));
      CACC.tableTools.makeSortable(byPlantTable);

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('financials', M.ctx.financials()));

      var t = CACC.chartTheme();
      CACC.chart(document.getElementById('finChart'), {
        type: 'bar', data: { labels: p.byPlant.map(function (g) { return g.name.replace(' Plant', ''); }), datasets: [
          { label: 'Gross profit', data: p.byPlant.map(function (g) { return g.grossProfit; }), backgroundColor: t.accent, borderRadius: 3 },
          { label: 'Operating income', data: p.byPlant.map(function (g) { return g.operating; }), backgroundColor: t.good, borderRadius: 3 }
        ] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: t.text } } },
          scales: { x: { grid: { display: false }, ticks: { color: t.text } }, y: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } } } }
      });

      function plantWindow(g) {
        ui.window(g.name + ' — Income Statement', [
          el('table', { class: 'dt' }, [el('tbody', {}, [
            plRow('Revenue', g.revenue, g.revenue, false), plRow('Cost of goods sold', -g.cogs, g.revenue, true),
            plRow('Gross profit', g.grossProfit, g.revenue, false, true), plRow('SG&A', -g.sga, g.revenue, true),
            plRow('Operating income', g.operating, g.revenue, false, true)
          ])])
        ], M.filterLabel());
      }
    }
  };

  function plRow(label, amount, base, expense, bold) {
    var pctStr = base ? CACC.fmt.pct(Math.abs(amount) / base * 100) : '';
    var amtStr = (amount < 0 ? '(' + CACC.fmt.money0(Math.abs(amount)) + ')' : CACC.fmt.money0(amount));
    return el('tr', bold ? { class: 'total' } : (expense ? { class: 'sub' } : {}), [
      el('td', { text: label }), el('td', { class: 'num tnum', text: amtStr }), el('td', { class: 'num tnum muted', text: pctStr })
    ]);
  }
})(typeof window !== 'undefined' ? window : this);
