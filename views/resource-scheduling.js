/* Resource Scheduling — schedule board (resources x periods) with utilization heat. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.resourceScheduling = {
    title: 'Resource Scheduling',
    render: function (c) {
      var t = M.resourceTotals(), board = M.scheduleBoard();

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Resources', String(t.resources), 'on the bench', 'users'),
        ui.kpi('Utilization', fmt.pct(t.utilization * 100), fmt.num(t.allocated, 0) + ' / ' + fmt.num(t.capacity, 0) + ' hrs', 'gauge', t.utilization > 1 ? 'unfav' : t.utilization < 0.6 ? 'unfav' : 'fav'),
        ui.kpi('Allocated hours', fmt.num(t.allocated, 0), null, 'briefcase'),
        ui.kpi('Overbooked', String(t.over), 'resource-periods > 100%', 'warning', t.over ? 'unfav' : 'fav')
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'Schedule board · click a resource · cells show allocated hours (red = overbooked)' }));
      var head = el('tr', {}, [el('th', { class: 'res', text: 'Resource' })].concat(board.periods.map(function (p) { return el('th', { text: p.replace(' 2025', '') }); })).concat([el('th', { text: 'Util' })]));
      var bdy = el('tbody');
      board.rows.forEach(function (r) {
        var cells = [el('td', { class: 'res' }, [el('div', { style: 'cursor:pointer', onclick: function () { resWindow(r); } }, [el('strong', { text: r.resource.name }), el('div', { class: 'muted', style: 'font-size:11px', text: r.resource.role + ' · ' + r.resource.plantId })])])];
        r.cells.forEach(function (cell) {
          var u = cell.utilization, bg = u > 1 ? 'rgba(248,113,113,.28)' : u >= 0.85 ? 'rgba(251,191,36,.22)' : u > 0 ? 'rgba(52,211,153,.18)' : 'transparent';
          cells.push(el('td', { class: 'alloc', style: 'background:' + bg, title: fmt.pct(u * 100) + ' utilized' }, fmt.num(cell.allocated, 0)));
        });
        cells.push(el('td', { class: 'alloc ' + (r.util > 1 ? 'unfav' : 'fav'), text: fmt.pct(r.util * 100) }));
        bdy.appendChild(el('tr', {}, cells));
      });
      c.appendChild(ui.card(null, M.filterLabel(), [el('div', { style: 'overflow-x:auto' }, [el('table', { class: 'sboard' }, [el('thead', {}, head), bdy])])]));

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('resourceScheduling', M.ctx.resourceScheduling()));

      function resWindow(r) {
        var tb = el('tbody');
        board.periods.forEach(function (p, i) { var cell = r.cells[i]; tb.appendChild(el('tr', {}, [el('td', { text: p }), el('td', { class: 'num tnum', text: fmt.num(cell.allocated, 0) }), el('td', { class: 'num tnum', text: fmt.num(cell.capacity, 0) }), el('td', { class: 'num tnum ' + (cell.utilization > 1 ? 'unfav' : 'fav'), text: fmt.pct(cell.utilization * 100) })])); });
        ui.window(r.resource.name, [
          el('div', { class: 'grid g3' }, [
            ui.kpi('Role', r.resource.role, r.resource.plantId, 'users'), ui.kpi('Rate', fmt.money(r.resource.rate) + '/hr', null, 'dollar'),
            ui.kpi('Overall util', fmt.pct(r.util * 100), null, 'gauge', r.util > 1 ? 'unfav' : 'fav')
          ]),
          el('div', { class: 'section-title', text: 'Allocation by period' }),
          el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Period' }), el('th', { class: 'num', text: 'Allocated' }), el('th', { class: 'num', text: 'Capacity' }), el('th', { class: 'num', text: 'Utilization' })])), tb])
        ], r.resource.role + ' · ' + r.resource.plantId);
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
