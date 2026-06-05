/* Budget vs Actual — by cost category and plant, with variance % and drill-down. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.budgetActual = {
    title: 'Budget vs Actual',
    render: function (c) {
      var cats = M.budgetByCategory();
      var totBud = sum(cats, 'budget'), totAct = sum(cats, 'actual'), totVar = totAct - totBud;

      c.appendChild(el('div', { class: 'note', style: 'margin-bottom:4px' }, [el('strong', { text: 'Budget vs Actual' }), ' — ', M.filterLabel(), '. For expense categories, actual above budget is unfavorable.']));

      c.appendChild(el('div', { class: 'grid g3' }, [
        ui.kpi('Total budget', fmt.money0(totBud), cats.length + ' categories', 'dollar'),
        ui.kpi('Total actual', fmt.money0(totAct), null, 'dollar'),
        ui.kpi('Variance', fmt.money0(Math.abs(totVar)) + (totVar > 0 ? ' over' : ' under'), fmt.pct(totBud ? Math.abs(totVar / totBud) * 100 : 0) + ' of budget', 'variance', totVar > 0 ? 'unfav' : 'fav')
      ]));

      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        ui.card('Budget vs actual by category', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'baChart' })])]),
        ui.card('Variance % by category', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'baPct' })])])
      ]));

      // Table (click category to drill by plant)
      var tb = el('tbody');
      cats.forEach(function (r) {
        var over = r.variance > 0;
        tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { drill(r.category); } }, [
          el('td', {}, [el('strong', { text: r.category })]),
          el('td', { class: 'num tnum', text: fmt.money0(r.budget) }),
          el('td', { class: 'num tnum', text: fmt.money0(r.actual) }),
          el('td', { class: 'num tnum ' + (over ? 'unfav' : 'fav') }, (over ? '+' : '') + fmt.money0(r.variance)),
          el('td', { class: 'num tnum ' + (over ? 'unfav' : 'fav') }, fmt.pct(r.variancePct * 100)),
          el('td', {}, [el('span', { class: 'badge ' + (Math.abs(r.variancePct) < 0.03 ? 'sb-good' : over ? 'sb-bad' : 'sb-warn'), text: Math.abs(r.variancePct) < 0.03 ? 'On budget' : over ? 'Over' : 'Under' })])
        ]));
      });
      tb.appendChild(el('tr', { class: 'total' }, [
        el('td', { text: 'Total' }), el('td', { class: 'num tnum', text: fmt.money0(totBud) }), el('td', { class: 'num tnum', text: fmt.money0(totAct) }),
        el('td', { class: 'num tnum', text: (totVar > 0 ? '+' : '') + fmt.money0(totVar) }), el('td', { class: 'num tnum', text: fmt.pct(totBud ? totVar / totBud * 100 : 0) }), el('td', {})
      ]));
      var table = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'Category' }), el('th', { class: 'num', text: 'Budget' }), el('th', { class: 'num', text: 'Actual' }), el('th', { class: 'num', text: 'Variance' }), el('th', { class: 'num', text: 'Var %' }), el('th', { text: 'Status' })])), tb
      ]);
      c.appendChild(el('div', { class: 'section-title', text: 'By category · click a row for the plant breakdown' }));
      c.appendChild(ui.card(null, M.filterLabel(), [table], CACC.tableTools.exportButton(table, 'budget-vs-actual.csv')));
      CACC.tableTools.makeSortable(table);

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('budget', M.ctx.budget()));

      var t = CACC.chartTheme();
      CACC.chart(document.getElementById('baChart'), {
        type: 'bar', data: { labels: cats.map(function (r) { return r.category; }), datasets: [
          { label: 'Budget', data: cats.map(function (r) { return r.budget; }), backgroundColor: t.palette[3], borderRadius: 4 },
          { label: 'Actual', data: cats.map(function (r) { return r.actual; }), backgroundColor: t.accent, borderRadius: 4 }
        ] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: t.text } } },
          scales: { x: { grid: { display: false }, ticks: { color: t.text } }, y: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } } } }
      });
      CACC.chart(document.getElementById('baPct'), {
        type: 'bar', data: { labels: cats.map(function (r) { return r.category; }), datasets: [{ data: cats.map(function (r) { return +(r.variancePct * 100).toFixed(1); }),
          backgroundColor: cats.map(function (r) { return r.variance > 0 ? t.bad : t.good; }), borderRadius: 4 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return ctx.raw + '%'; } } } },
          scales: { x: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return v + '%'; } } }, y: { grid: { display: false }, ticks: { color: t.text } } } }
      });

      function drill(category) {
        var rows = M.filteredBudget().filter(function (r) { return r.category === category; });
        var byPlant = {};
        rows.forEach(function (r) { if (!byPlant[r.plantId]) byPlant[r.plantId] = { name: r.plantName, budget: 0, actual: 0 }; byPlant[r.plantId].budget += r.budget; byPlant[r.plantId].actual += r.actual; });
        var tbb = el('tbody');
        Object.keys(byPlant).forEach(function (k) {
          var x = byPlant[k], v = x.actual - x.budget, over = v > 0;
          tbb.appendChild(el('tr', {}, [el('td', { text: x.name }), el('td', { class: 'num tnum', text: fmt.money0(x.budget) }), el('td', { class: 'num tnum', text: fmt.money0(x.actual) }),
            el('td', { class: 'num tnum ' + (over ? 'unfav' : 'fav') }, (over ? '+' : '') + fmt.money0(v))]));
        });
        ui.modal(category + ' — plant breakdown', [el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Plant' }), el('th', { class: 'num', text: 'Budget' }), el('th', { class: 'num', text: 'Actual' }), el('th', { class: 'num', text: 'Variance' })])), tbb])], 'Budget drill-down');
      }
    }
  };
  function sum(rows, f) { return Math.round(rows.reduce(function (s, r) { return s + (r[f] || 0); }, 0) * 100) / 100; }
})(typeof window !== 'undefined' ? window : this);
