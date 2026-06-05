/* Profitability by Product view — unit & annualized margin, sortable + exportable. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.profitability = {
    title: 'Profitability by Product',
    render: function (c) {
      var p = M.profitability(), t = p.totals;
      var leader = p.products[0], laggard = p.products[p.products.length - 1];

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Annual revenue', fmt.money0(t.annualRevenue), p.products.length + ' finished goods', 'dollar'),
        ui.kpi('Annual contribution', fmt.money0(t.annualMargin), fmt.pct(t.marginPct * 100) + ' blended margin', 'margin', 'fav'),
        ui.kpi('Margin leader', leader ? leader.sku : '—', leader ? fmt.money0(leader.annualMargin) + ' / yr' : '', 'product', 'fav'),
        ui.kpi('Weakest line', laggard ? laggard.sku : '—', laggard ? fmt.money(laggard.unitMargin) + '/u margin' : '', 'variance', laggard && laggard.unitMargin < 0 ? 'unfav' : '')
      ]));

      // Table (sortable + export)
      var tb = el('tbody');
      p.products.forEach(function (x) {
        tb.appendChild(el('tr', {}, [
          el('td', {}, [el('strong', { text: x.sku })]), el('td', { text: x.description }),
          el('td', { class: 'num tnum', text: fmt.money(x.price) }), el('td', { class: 'num tnum', text: fmt.money(x.unitCost) }),
          el('td', { class: 'num tnum ' + (x.unitMargin < 0 ? 'unfav' : 'fav') }, fmt.money(x.unitMargin)),
          el('td', { class: 'num tnum', text: fmt.pct(x.marginPct * 100) }),
          el('td', { class: 'num tnum', text: fmt.num(x.annualDemand, 0) }),
          el('td', { class: 'num tnum', text: fmt.money0(x.annualRevenue) }),
          el('td', { class: 'num tnum', text: fmt.money0(x.annualMargin) })
        ]));
      });
      tb.appendChild(el('tr', { class: 'total' }, [
        el('td', { colspan: 7, text: 'Total' }), el('td', { class: 'num tnum', text: fmt.money0(t.annualRevenue) }), el('td', { class: 'num tnum', text: fmt.money0(t.annualMargin) })
      ]));
      var table = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [
          el('th', { text: 'SKU' }), el('th', { text: 'Product' }), el('th', { class: 'num', text: 'Price' }), el('th', { class: 'num', text: 'Unit cost' }),
          el('th', { class: 'num', text: 'Unit margin' }), el('th', { class: 'num', text: 'Margin %' }), el('th', { class: 'num', text: 'Annual demand' }),
          el('th', { class: 'num', text: 'Annual revenue' }), el('th', { class: 'num', text: 'Annual margin' })
        ])), tb
      ]);

      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        ui.card('Annual contribution by product', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'profChart' })])]),
        ui.card('Unit margin %', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'profPctChart' })])])
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'Product margin detail' }));
      c.appendChild(ui.card('Profitability register', 'click a header to sort', [table], CACC.tableTools.exportButton(table, 'profitability.csv')));
      CACC.tableTools.makeSortable(table);

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('profitability', M.ctx.profitability()));

      var th = CACC.chartTheme();
      var labels = p.products.map(function (x) { return x.sku; });
      CACC.chart(document.getElementById('profChart'), {
        type: 'bar', data: { labels: labels, datasets: [{ data: p.products.map(function (x) { return x.annualMargin; }),
          backgroundColor: p.products.map(function (x) { return x.unitMargin < 0 ? th.bad : th.accent; }), borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return CACC.fmt.money0(ctx.raw); } } } },
          scales: { x: { grid: { display: false }, ticks: { color: th.text } }, y: { grid: { color: th.grid }, ticks: { color: th.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } } } }
      });
      CACC.chart(document.getElementById('profPctChart'), {
        type: 'bar', data: { labels: labels, datasets: [{ data: p.products.map(function (x) { return +(x.marginPct * 100).toFixed(1); }),
          backgroundColor: th.good, borderRadius: 4 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return ctx.raw + '%'; } } } },
          scales: { x: { grid: { color: th.grid }, ticks: { color: th.text, callback: function (v) { return v + '%'; } } }, y: { grid: { display: false }, ticks: { color: th.text } } } }
      });
    }
  };
})(typeof window !== 'undefined' ? window : this);
