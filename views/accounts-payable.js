/* Accounts Payable — open vendor liabilities, aging, by supplier. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.accountsPayable = {
    title: 'Accounts Payable',
    render: function (c) {
      var ap = M.accountsPayable();
      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Open payables', fmt.money0(ap.total), ap.openCount + ' orders', 'truck'),
        ui.kpi('Current', fmt.money0(ap.aging.current), '0–30 days', 'dollar', 'fav'),
        ui.kpi('31–90 days', fmt.money0(ap.aging.b30 + ap.aging.b60), null, 'variance', 'unfav'),
        ui.kpi('90+ days', fmt.money0(ap.aging.b90), 'overdue', 'warning', ap.aging.b90 ? 'unfav' : 'fav')
      ]));
      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        ui.card('Aging', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'apAging' })])]),
        ui.card('By supplier', null, [el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Supplier' }), el('th', { class: 'num', text: 'Orders' }), el('th', { class: 'num', text: 'Balance' })])),
          el('tbody', {}, ap.bySupplier.map(function (s) { return el('tr', {}, [el('td', { text: s.supplier }), el('td', { class: 'num tnum', text: String(s.count) }), el('td', { class: 'num tnum', text: fmt.money0(s.amount) })]); }))])])
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Open payables (from purchase orders)' }));
      c.appendChild(CACC.grid('ap', [
        { key: 'id', label: 'PO' }, { key: 'date', label: 'Period' }, { key: 'plantName', label: 'Plant' }, { key: 'supplier', label: 'Supplier' }, { key: 'sku', label: 'Item' },
        { key: 'amount', label: 'Amount', fmt: 'money0', sum: true }, { key: 'status', label: 'Status', render: function (r) { return el('span', { class: 'badge ' + (r.status === 'Open' ? 'sb-warn' : 'sb-neutral'), text: r.status }); } }
      ], ap.rows, { title: 'Accounts payable' }));
      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('accountsPayable', M.ctx.accountsPayable()));
      var t = CACC.chartTheme();
      CACC.chart(document.getElementById('apAging'), {
        type: 'bar', data: { labels: ['Current', '31–60', '61–90', '90+'], datasets: [{ data: [ap.aging.current, ap.aging.b30, ap.aging.b60, ap.aging.b90], backgroundColor: [t.good, t.palette[2], t.palette[2], t.bad], borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (x) { return CACC.fmt.money0(x.raw); } } } },
          scales: { x: { grid: { display: false }, ticks: { color: t.text } }, y: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } } } }
      });
    }
  };
})(typeof window !== 'undefined' ? window : this);
