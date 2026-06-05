/* Workforce (Human Resources) — headcount, labor cost, and working-hour efficiency. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;
  var HRS = 173; // monthly labor hours per head

  CACC.views.workforce = {
    title: 'Workforce',
    render: function (c) {
      var t = M.workforceTotals(), byPlant = M.workforceByPlant();
      var facts = M.filtered();
      var unitsByPlant = {}; facts.forEach(function (f) { unitsByPlant[f.plantId] = (unitsByPlant[f.plantId] || 0) + f.units; });
      var totalUnits = facts.reduce(function (s, f) { return s + f.units; }, 0);
      var wfRows = M.filteredWorkforce();
      var totalLaborHours = wfRows.reduce(function (s, w) { return s + w.headcount * HRS; }, 0);
      var unitsPerHour = totalLaborHours ? totalUnits / totalLaborHours : 0;
      var laborCostPerUnit = totalUnits ? t.laborCost / totalUnits : 0;
      var periodsCount = uniqCount(wfRows, 'period') || 1;

      c.appendChild(el('div', { class: 'note', style: 'margin-bottom:4px' }, [el('strong', { text: 'Workforce & labor efficiency' }), ' · ', M.filterLabel()]));

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Headcount', fmt.num(t.headcount, 0), fmt.pct(t.turnoverPct * 100) + ' turnover', 'users'),
        ui.kpi('Labor cost', fmt.money0(t.laborCost), fmt.money0(t.costPerHead) + ' / head', 'dollar'),
        ui.kpi('Overtime', fmt.pct(t.overtimePct * 100), 'of hours', 'gauge', t.overtimePct > 0.1 ? 'unfav' : ''),
        ui.kpi('Avg wage', fmt.money(t.avgWage) + '/hr', null, 'ledger')
      ]));

      // Efficiency band
      c.appendChild(el('div', { class: 'section-title', text: 'Working-hour efficiency' }));
      c.appendChild(el('div', { class: 'grid g3' }, [
        ui.kpi('Output / labor hour', fmt.num(unitsPerHour, 3) + ' u', fmt.num(totalLaborHours, 0) + ' labor hrs', 'gauge', 'fav'),
        ui.kpi('Labor cost / unit', fmt.money(laborCostPerUnit), fmt.num(totalUnits, 0) + ' units', 'variance'),
        ui.kpi('Units / head', fmt.num(t.headcount ? totalUnits / t.headcount / periodsCount : 0, 1), 'per period', 'product')
      ]));

      // By-plant table with efficiency
      var tb = el('tbody');
      byPlant.forEach(function (g) {
        var pn = uniqCount(wfRows.filter(function (w) { return w.plantId === g.plantId; }), 'period') || 1;
        var heads = g.headcount / pn;
        var hrs = heads * HRS * pn;
        var units = unitsByPlant[g.plantId] || 0;
        var uph = hrs ? units / hrs : 0;
        tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { plantWindow(g, units, uph); } }, [
          el('td', {}, [el('strong', { text: g.name })]),
          el('td', { class: 'num tnum', text: fmt.num(Math.round(heads), 0) }),
          el('td', { class: 'num tnum', text: fmt.num(Math.round(heads * 0.68), 0) }),
          el('td', { class: 'num tnum', text: fmt.money0(g.laborCost) }),
          el('td', { class: 'num tnum', text: fmt.pct(g.overtimePct * 100) }),
          el('td', { class: 'num tnum', text: fmt.pct(g.turnoverPct * 100) }),
          el('td', { class: 'num tnum ' + (uph >= 0.05 ? 'fav' : 'unfav'), text: fmt.num(uph, 3) })
        ]));
      });
      var table = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'Plant' }), el('th', { class: 'num', text: 'Headcount' }), el('th', { class: 'num', text: 'Direct' }), el('th', { class: 'num', text: 'Labor cost' }), el('th', { class: 'num', text: 'OT %' }), el('th', { class: 'num', text: 'Turnover' }), el('th', { class: 'num', text: 'Units/hr' })])), tb
      ]);
      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:6px' }, [
        ui.card('By plant · click for detail', M.filterLabel(), [el('div', { style: 'overflow-x:auto' }, [table])], CACC.tableTools.exportButton(table, 'workforce.csv')),
        ui.card('Labor cost by plant', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'wfChart' })])])
      ]));
      CACC.tableTools.makeSortable(table);

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('workforce', M.ctx.workforce()));

      var th = CACC.chartTheme();
      CACC.chart(document.getElementById('wfChart'), {
        type: 'bar', data: { labels: byPlant.map(function (g) { return g.name.replace(' Plant', ''); }), datasets: [{ data: byPlant.map(function (g) { return g.laborCost; }), backgroundColor: th.accent, borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return CACC.fmt.money0(ctx.raw); } } } },
          scales: { x: { grid: { display: false }, ticks: { color: th.text } }, y: { grid: { color: th.grid }, ticks: { color: th.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } } } }
      });

      function plantWindow(g, units, uph) {
        ui.window(g.name + ' — Workforce', [
          el('div', { class: 'grid g3' }, [
            ui.kpi('Labor cost', fmt.money0(g.laborCost), null, 'dollar'), ui.kpi('Output / hr', fmt.num(uph, 3), null, 'gauge'),
            ui.kpi('Labor cost / unit', fmt.money(units ? g.laborCost / units : 0), null, 'variance')
          ]),
          el('p', { class: 'muted', style: 'margin-top:12px', text: 'Overtime ' + fmt.pct(g.overtimePct * 100) + ' · turnover ' + fmt.pct(g.turnoverPct * 100) + ' · ' + fmt.num(units, 0) + ' units produced in ' + M.filterLabel() + '.' })
        ], M.filterLabel());
      }
    }
  };
  function uniqCount(rows, f) { var s = {}; rows.forEach(function (r) { s[r[f]] = 1; }); return Object.keys(s).length; }
})(typeof window !== 'undefined' ? window : this);
