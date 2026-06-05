/* Capacity & Overhead view — utilization, idle-capacity cost, absorption. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.capacity = {
    title: 'Capacity & Overhead',
    render: function (c) {
      var x = M.capacity();

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Utilization', fmt.pct(x.utilization * 100), fmt.num(x.actualHours, 0) + ' / ' + fmt.num(x.availableHours, 0) + ' hrs', 'gauge', x.utilization < 0.85 ? 'unfav' : 'fav'),
        ui.kpi('Idle hours', fmt.num(x.idleHours, 0), 'unused machine capacity', 'gauge'),
        ui.kpi('Idle capacity cost', fmt.money0(x.idleCapacityCost), 'unabsorbed fixed OH', 'warning', 'unfav'),
        ui.kpi('Overhead ' + x.absorption.label, fmt.money0(Math.abs(x.overUnder)), fmt.pct(x.absorption.absorptionRatePct) + ' absorbed', 'variance', x.overUnder > 0 ? 'unfav' : 'fav')
      ]));

      // Utilization bar
      var pct = Math.max(0, Math.min(100, x.utilization * 100));
      c.appendChild(el('div', { class: 'card card-pad', style: 'margin-top:18px' }, [
        el('div', { style: 'display:flex;justify-content:space-between;margin-bottom:8px' }, [
          el('strong', { text: 'Machine-hour utilization' }), el('span', { class: 'muted', text: fmt.num(x.actualHours, 0) + ' used · ' + fmt.num(x.idleHours, 0) + ' idle' })
        ]),
        el('div', { class: 'dim-bar', style: 'height:14px' }, [el('span', { style: 'width:' + pct + '%;background:' + (pct < 85 ? 'var(--warn)' : 'var(--good)') })])
      ]));

      c.appendChild(el('div', { class: 'grid g2', style: 'margin-top:18px' }, [
        ui.card('Applied vs. actual overhead', null, [el('div', { class: 'chart-wrap sm' }, [el('canvas', { id: 'capChart' })])]),
        ui.card('Overhead variance breakdown', null, [
          el('table', { class: 'dt' }, [
            el('thead', {}, el('tr', {}, [el('th', { text: 'Component' }), el('th', { class: 'num', text: 'Variance' }), el('th', { text: 'Status' })])),
            el('tbody', {}, [
              vrow('Variable OH — spending', x.varOhSpending), vrow('Variable OH — efficiency', x.varOhEfficiency),
              vrow('Fixed OH — budget', x.fixedOhBudget), vrow('Fixed OH — volume (capacity)', x.fixedOhVolume)
            ])
          ]),
          el('div', { class: 'note', style: 'margin-top:12px' },
            'The fixed-overhead volume variance (' + fmt.variance(x.fixedOhVolume) + ') is the cost of operating above/below the denominator activity level — i.e., how idle or strained capacity shows up in absorbed cost.')
        ])
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('capacity', M.ctx.capacity()));

      drawCap(document.getElementById('capChart'), x);

      function vrow(label, v) { return el('tr', {}, [el('td', { text: label }), ui.vcell(v), el('td', {}, [ui.badgeFor(v)])]); }
    }
  };

  function drawCap(canvas, x) {
    if (!canvas) return;
    var t = CACC.chartTheme();
    CACC.chart(canvas, {
      type: 'bar',
      data: { labels: ['Applied OH', 'Actual OH'], datasets: [{ data: [x.appliedOH, x.actualOH], backgroundColor: [t.accent, t.palette[2]], borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return CACC.fmt.money0(ctx.raw); } } } },
        scales: { x: { grid: { display: false }, ticks: { color: t.text } }, y: { grid: { color: t.grid }, ticks: { color: t.text, callback: function (v) { return '$' + (v / 1000) + 'k'; } } } } }
    });
  }
})(typeof window !== 'undefined' ? window : this);
