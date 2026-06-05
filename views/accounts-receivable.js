/* Accounts Receivable — open customer balances, aging, by customer. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.accountsReceivable = {
    title: 'Accounts Receivable',
    render: function (c) {
      var ar = M.accountsReceivable();
      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Receivables', fmt.money0(ar.total), ar.openCount + ' orders', 'dollar'),
        ui.kpi('Current', fmt.money0(ar.aging.current), '0–30 days', 'margin', 'fav'),
        ui.kpi('31–90 days', fmt.money0(ar.aging.b30 + ar.aging.b60), null, 'variance'),
        ui.kpi('90+ days', fmt.money0(ar.aging.b90), 'overdue', 'warning', ar.aging.b90 ? 'unfav' : 'fav')
      ]));
      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        ui.card('Aging', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'arAging' })])]),
        ui.card('By customer', null, [el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Customer' }), el('th', { class: 'num', text: 'Orders' }), el('th', { class: 'num', text: 'Balance' })])),
          el('tbody', {}, ar.byCustomer.map(function (s) { return el('tr', {}, [el('td', { text: s.customer }), el('td', { class: 'num tnum', text: String(s.count) }), el('td', { class: 'num tnum', text: fmt.money0(s.amount) })]); }))])])
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Open receivables (from sales orders)' }));
      c.appendChild(CACC.grid('ar', [
        { key: 'id', label: 'SO' }, { key: 'date', label: 'Period' }, { key: 'customer', label: 'Customer' }, { key: 'plantName', label: 'Plant' }, { key: 'sku', label: 'Item' },
        { key: 'amount', label: 'Amount', fmt: 'money0', sum: true }, { key: 'status', label: 'Status', render: function (r) { return el('span', { class: 'badge ' + (r.status === 'Invoiced' ? 'sb-good' : 'sb-warn'), text: r.status }); } }
      ], ar.rows, { title: 'Accounts receivable' }));
      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('accountsReceivable', M.ctx.accountsReceivable()));
      var t = CACC.chartTheme();
      CACC.chart(document.getElementById('arAging'), {
        type: 'bar', data: { labels: ['Current', '31–60', '61–90', '90+'], datasets: [{ data: [ar.aging.current, ar.aging.b30, ar.aging.b60, ar.aging.b90], backgroundColor: [t.good, t.palette[2], t.palette[2], t.bad], borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (x) { return CACC.fmt.money0(x.raw); } } } },
          scales: { x: { grid: { display: false }, ticks: { color: t.text } }, y: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } } } }
      });
    }
  };
})(typeof window !== 'undefined' ? window : this);
