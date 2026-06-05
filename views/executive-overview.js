/* Executive Overview — group cockpit (revenue, margin, variance, top customers, plant scorecard). */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.executiveOverview = {
    title: 'Executive Overview',
    render: function (c) {
      var d = CACC.store.data();
      var k = M.execKpis(), scorecard = M.plantScorecard(), series = M.revenueSeries(), topCust = M.topCustomers(6);
      var avgCap = scorecard.length ? scorecard.reduce(function (s, p) { return s + (p.capacity || 0); }, 0) / scorecard.length : 0;

      c.appendChild(filterBanner(d.group));

      // KPI row
      var nv = k.netVariance, nvCls = CACC.VarianceEngine.classify(nv);
      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Total revenue', fmt.money0(k.revenue), fmt.num(k.units, 0) + ' units', 'dollar'),
        ui.kpi('Gross margin', fmt.pct(k.marginPct * 100), fmt.money0(k.grossProfit) + ' gross profit', 'margin', 'fav'),
        ui.kpi('Net variance', fmt.variance(nv), nvCls.favorable === false ? 'unfavorable' : 'favorable', 'variance', nvCls.favorable === false ? 'unfav' : 'fav'),
        ui.kpi('Avg capacity', fmt.pct(avgCap * 100), scorecard.length + ' plants', 'gauge', avgCap < 0.85 ? 'unfav' : 'fav')
      ]));

      // Charts
      c.appendChild(el('div', { class: 'grid', style: 'grid-template-columns: 1.5fr 1fr;margin-top:18px' }, [
        ui.card('Group revenue & gross margin %', 'by period · ' + (CACC.store.getFilter().plantId === 'ALL' ? 'all plants' : CACC.store.getFilter().plantId), [el('div', { class: 'chart-wrap' }, [el('canvas', { id: 'exRev' })])]),
        ui.card('Top customers by gross profit', null, [el('div', { class: 'chart-wrap' }, [el('canvas', { id: 'exCust' })])])
      ]));

      // Plant scorecard + variance summary
      c.appendChild(el('div', { class: 'section-title', text: 'Plant scorecard · click a plant to filter' }));
      var sb = el('tbody');
      scorecard.forEach(function (p) {
        var cls = CACC.VarianceEngine.classify(p.netVariance);
        sb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { CACC.store.setFilter({ plantId: p.key }); CACC.rerender(); } }, [
          el('td', {}, [el('strong', { text: p.name })]),
          el('td', { class: 'num tnum', text: fmt.money0(p.revenue) }),
          el('td', { class: 'num tnum', text: fmt.pct(p.marginPct * 100) }),
          el('td', { class: 'num tnum ' + (cls.favorable === false ? 'unfav' : 'fav') }, fmt.variance(p.netVariance)),
          el('td', { style: 'min-width:120px' }, [capBar(p.capacity)]),
          el('td', {}, [el('span', { class: 'badge ' + (p.marginPct >= 0.28 ? 'sb-good' : p.marginPct >= 0.2 ? 'sb-warn' : 'sb-bad'), text: p.marginPct >= 0.28 ? 'On track' : p.marginPct >= 0.2 ? 'Watch' : 'Below plan' })])
        ]));
      });
      sb.appendChild(el('tr', { class: 'total' }, [
        el('td', { text: 'Consolidated' }), el('td', { class: 'num tnum', text: fmt.money0(k.revenue) }),
        el('td', { class: 'num tnum', text: fmt.pct(k.marginPct * 100) }), el('td', { class: 'num tnum', text: fmt.variance(k.netVariance) }), el('td', {}), el('td', {})
      ]));
      var scoreTable = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'Plant' }), el('th', { class: 'num', text: 'Revenue' }), el('th', { class: 'num', text: 'GM %' }), el('th', { class: 'num', text: 'Net variance' }), el('th', { text: 'Capacity' }), el('th', { text: 'Status' })])), sb
      ]);

      var vs = M.filtered();
      var mv = sum(vs, 'materialVar'), lv = sum(vs, 'laborVar'), ov = sum(vs, 'ohVar');
      var varTable = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'Cost element' }), el('th', { class: 'num', text: 'Variance' }), el('th', { text: '' })])),
        el('tbody', {}, [
          vrow('Direct material', mv), vrow('Direct labor', lv), vrow('Manufacturing overhead', ov),
          el('tr', { class: 'total' }, [el('td', { text: 'Net variance' }), ui.vcell(k.netVariance), el('td', {}, [ui.badgeFor(k.netVariance)])])
        ])
      ]);

      c.appendChild(el('div', { class: 'grid', style: 'grid-template-columns: 1.6fr 1fr' }, [
        ui.card('Plant scorecard', M.filterLabel(), [scoreTable], CACC.tableTools.exportButton(scoreTable, 'plant-scorecard.csv')),
        ui.card('Variance summary', null, [varTable])
      ]));
      CACC.tableTools.makeSortable(scoreTable);

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('executive', M.ctx.executive()));

      // charts
      var t = CACC.chartTheme();
      CACC.chart(document.getElementById('exRev'), {
        data: { labels: series.revenue.map(function (x) { return x.period; }), datasets: [
          { type: 'bar', label: 'Revenue', data: series.revenue.map(function (x) { return x.value; }), backgroundColor: t.accent, borderRadius: 4, yAxisID: 'y' },
          { type: 'line', label: 'Gross margin %', data: series.revenue.map(function (x, i) { var gp = series.grossProfit[i].value; return x.value ? +(gp / x.value * 100).toFixed(1) : 0; }), borderColor: t.good, tension: 0.3, yAxisID: 'y1' }
        ] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: t.text } } },
          scales: { x: { grid: { display: false }, ticks: { color: t.text } },
            y: { position: 'left', grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + (v / 1000000).toFixed(1) + 'M'; } } },
            y1: { position: 'right', grid: { display: false }, ticks: { color: t.text, callback: function (v) { return v + '%'; } } } } }
      });
      CACC.chart(document.getElementById('exCust'), {
        type: 'bar',
        data: { labels: topCust.map(function (x) { return x.name; }), datasets: [{ data: topCust.map(function (x) { return x.grossProfit; }), backgroundColor: t.palette[1], borderRadius: 4 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          onClick: CACC.chartClick(function (i) { var cu = topCust[i]; if (cu) ui.modal(cu.name, customerDetail(cu), 'Customer drill-down'); }),
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return CACC.fmt.money0(ctx.raw); } } } },
          scales: { x: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } }, y: { grid: { display: false }, ticks: { color: t.text } } } }
      });

      function vrow(label, v) { return el('tr', {}, [el('td', { text: label }), ui.vcell(v), el('td', {}, [ui.badgeFor(v)])]); }
      function customerDetail(cu) {
        return [
          el('div', { class: 'grid g3' }, [
            ui.kpi('Revenue', fmt.money0(cu.revenue), null, 'dollar'),
            ui.kpi('Gross profit', fmt.money0(cu.grossProfit), fmt.pct(cu.marginPct * 100) + ' margin', 'margin'),
            ui.kpi('Units', fmt.num(cu.units, 0), null, 'box')
          ]),
          el('p', { class: 'muted', style: 'margin-top:14px', text: 'Aggregated for ' + M.filterLabel() + '. Use the Profitability Cube to pivot this customer by product and plant.' })
        ];
      }
    }
  };

  function filterBanner(group) {
    return el('div', { class: 'note', style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:4px' }, [
      el('span', {}, [el('strong', { text: group || 'Group' }), ' — ', CACC.model.filterLabel()]),
      el('span', { class: 'muted', text: 'Use the Plant / Period filters in the top bar to slice every screen.' })
    ]);
  }
  function capBar(v) {
    if (v == null) return el('span', { class: 'muted', text: '—' });
    return el('div', { style: 'display:flex;align-items:center;gap:8px' }, [
      el('div', { class: 'dim-bar', style: 'flex:1' }, [el('span', { style: 'width:' + (v * 100) + '%;background:' + (v < 0.85 ? 'var(--warn)' : 'var(--good)') })]),
      el('span', { class: 'tnum', style: 'font-size:12px', text: CACC.fmt.pct(v * 100, 0) })
    ]);
  }
  function sum(rows, f) { return Math.round(rows.reduce(function (s, r) { return s + (r[f] || 0); }, 0) * 100) / 100; }
})(typeof window !== 'undefined' ? window : this);
