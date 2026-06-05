/* Project Operations — lifecycle stage bar, budget/actual/margin, WBS + time-phased
 * estimates + resources + tracking in a tabbed drill-down window. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.projects = {
    title: 'Project Operations',
    render: function (c) {
      var d = CACC.store.data();
      var rows = M.projects(), t = M.projectTotals();
      var stages = d.projectStages || ['New', 'Quote', 'Plan', 'Deliver', 'Complete', 'Close'];

      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Project budget', fmt.money0(t.budget), t.count + ' projects', 'briefcase'),
        ui.kpi('Actual cost', fmt.money0(t.actualCost), fmt.pct(t.budget ? t.actualCost / t.budget * 100 : 0) + ' of budget', 'dollar'),
        ui.kpi('Billed', fmt.money0(t.billed), null, 'dollar'),
        ui.kpi('Project margin', fmt.pct(t.marginPct * 100), t.atRisk + ' at risk', 'margin', t.margin < 0 ? 'unfav' : 'fav')
      ]));

      // Lifecycle stage bar (counts per stage; click a stage to list those projects)
      var counts = stages.map(function (s, i) { return rows.filter(function (p) { return p.stageIndex === i; }).length; });
      c.appendChild(el('div', { class: 'section-title', text: 'Project lifecycle · click a stage' }));
      c.appendChild(ui.stageBar(stages.map(function (s, i) { return s + ' (' + counts[i] + ')'; }), -1, function (i) {
        var ps = rows.filter(function (p) { return p.stageIndex === i; });
        var tb = el('tbody'); ps.forEach(function (p) { tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { projectWindow(p); } }, [el('td', {}, [el('strong', { text: p.id })]), el('td', { text: p.name }), el('td', { class: 'num tnum', text: fmt.money0(p.budget) }), el('td', { class: 'num tnum ' + (p.margin < 0 ? 'unfav' : 'fav'), text: fmt.money0(p.margin) })])); });
        ui.window(stages[i] + ' stage — ' + ps.length + ' projects', [ps.length ? el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'ID' }), el('th', { text: 'Project' }), el('th', { class: 'num', text: 'Budget' }), el('th', { class: 'num', text: 'Margin' })])), tb]) : el('p', { class: 'muted', text: 'No projects at this stage.' })], M.filterLabel());
      }));

      // Register
      var tb = el('tbody');
      rows.forEach(function (p) {
        tb.appendChild(el('tr', { style: 'cursor:pointer', onclick: function () { projectWindow(p); } }, [
          el('td', {}, [el('strong', { text: p.id })]), el('td', { text: p.name }), el('td', { text: p.customer }), el('td', { text: p.plantName }),
          el('td', {}, [el('span', { class: 'badge sb-neutral', text: stages[p.stageIndex] })]),
          el('td', { class: 'num tnum', text: fmt.money0(p.budget) }), el('td', { class: 'num tnum', text: fmt.money0(p.actualCost) }), el('td', { class: 'num tnum', text: fmt.money0(p.billed) }),
          el('td', { class: 'num tnum ' + (p.margin < 0 ? 'unfav' : 'fav') }, fmt.money0(p.margin)),
          el('td', { style: 'min-width:120px' }, [pctBar(p.pctComplete)])
        ]));
      });
      tb.appendChild(el('tr', { class: 'total' }, [el('td', { colspan: 5, text: 'Total — ' + t.count + ' projects' }), el('td', { class: 'num tnum', text: fmt.money0(t.budget) }), el('td', { class: 'num tnum', text: fmt.money0(t.actualCost) }), el('td', { class: 'num tnum', text: fmt.money0(t.billed) }), el('td', { class: 'num tnum', text: fmt.money0(t.margin) }), el('td', {})]));
      var table = el('table', { class: 'dt' }, [
        el('thead', {}, el('tr', {}, [el('th', { text: 'ID' }), el('th', { text: 'Project' }), el('th', { text: 'Customer' }), el('th', { text: 'Plant' }), el('th', { text: 'Stage' }), el('th', { class: 'num', text: 'Budget' }), el('th', { class: 'num', text: 'Actual' }), el('th', { class: 'num', text: 'Billed' }), el('th', { class: 'num', text: 'Margin' }), el('th', { text: '% complete' })])), tb
      ]);
      c.appendChild(el('div', { class: 'section-title', text: 'Project register · click a row for the full project' }));
      c.appendChild(ui.card(null, M.filterLabel(), [el('div', { style: 'overflow-x:auto' }, [table])], CACC.tableTools.exportButton(table, 'projects.csv')));
      CACC.tableTools.makeSortable(table);

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('projects', M.ctx.projects()));

      // ---- Tabbed project detail window ----
      function projectWindow(p) {
        var periods = d.periods || [];
        var body = el('div', {});
        var tabs = ['Summary', 'Tasks (WBS)', 'Estimates', 'Resources', 'Tracking'];
        var bar = el('div', { class: 'subtabs' });
        var pane = el('div', {});
        tabs.forEach(function (name, i) {
          var b = el('button', { class: 'subtab' + (i === 0 ? ' active' : ''), text: name, onclick: function () { bar.querySelectorAll('.subtab').forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active'); show(i); } });
          bar.appendChild(b);
        });
        body.appendChild(ui.stageBar(stages, p.stageIndex));
        body.appendChild(el('div', { style: 'height:14px' }));
        body.appendChild(bar); body.appendChild(pane);
        ui.window(p.id + ' — ' + p.name, [body], p.customer + ' · ' + p.plantName + ' · ' + p.status);
        show(0);

        function show(i) {
          CACC.dom.clear(pane);
          if (i === 0) pane.appendChild(summary());
          else if (i === 1) pane.appendChild(tasksTable());
          else if (i === 2) pane.appendChild(estimatesGrid());
          else if (i === 3) pane.appendChild(resourcesTable());
          else pane.appendChild(tracking());
        }
        function summary() {
          return el('div', {}, [
            el('div', { class: 'grid g4' }, [
              ui.kpi('Budget', fmt.money0(p.budget), null, 'briefcase'), ui.kpi('Actual cost', fmt.money0(p.actualCost), fmt.pct(p.budget ? p.actualCost / p.budget * 100 : 0), 'dollar'),
              ui.kpi('Billed', fmt.money0(p.billed), null, 'dollar'), ui.kpi('Margin', fmt.money0(p.margin), fmt.pct(p.billed ? p.margin / p.billed * 100 : 0), 'margin', p.margin < 0 ? 'unfav' : 'fav')
            ]),
            el('div', { style: 'margin-top:14px' }, [el('div', { class: 'muted', style: 'margin-bottom:6px', text: 'Completion' }), pctBar(p.pctComplete)]),
            el('table', { class: 'dt', style: 'margin-top:14px' }, [el('tbody', {}, [
              kv('Customer', p.customer), kv('Plant', p.plantName), kv('Stage', stages[p.stageIndex]), kv('Status', p.status),
              kv('Tasks', String((p.tasks || []).length)), kv('Estimate at completion', fmt.money0(p.pctComplete ? p.actualCost / p.pctComplete : p.actualCost))
            ])])
          ]);
        }
        function tasksTable() {
          var tbb = el('tbody');
          (p.tasks || []).forEach(function (tk) {
            var cv = tk.actualCost - tk.estCost;
            tbb.appendChild(el('tr', {}, [el('td', { text: tk.wbs }), el('td', { text: tk.name }), el('td', { text: tk.role }), el('td', { class: 'num tnum', text: fmt.num(tk.estHours, 0) }), el('td', { class: 'num tnum', text: fmt.num(tk.actualHours, 0) }),
              el('td', { class: 'num tnum', text: fmt.money0(tk.estCost) }), el('td', { class: 'num tnum', text: fmt.money0(tk.actualCost) }), el('td', { class: 'num tnum ' + (cv > 0 ? 'unfav' : 'fav'), text: (cv > 0 ? '+' : '') + fmt.money0(cv) }), el('td', { style: 'min-width:90px' }, [pctBar(tk.pctComplete)])]));
          });
          return el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'WBS' }), el('th', { text: 'Task' }), el('th', { text: 'Role' }), el('th', { class: 'num', text: 'Est hrs' }), el('th', { class: 'num', text: 'Act hrs' }), el('th', { class: 'num', text: 'Est cost' }), el('th', { class: 'num', text: 'Act cost' }), el('th', { class: 'num', text: 'Cost var' }), el('th', { text: '%' })])), tbb]);
        }
        function estimatesGrid() {
          var head = el('tr', {}, [el('th', { text: 'Task' }), el('th', { text: 'Role' })].concat(periods.map(function (pr) { return el('th', { class: 'num', text: pr.replace(' 2025', '') }); })).concat([el('th', { class: 'num', text: 'Total hrs' })]));
          var bdy = el('tbody');
          (p.tasks || []).forEach(function (tk) {
            var cells = [el('td', { text: tk.name }), el('td', { text: tk.role })];
            var tot = 0; periods.forEach(function (pr) { var h = (tk.periodHours || {})[pr] || 0; tot += h; cells.push(el('td', { class: 'num tnum', text: h ? fmt.num(h, 0) : '—' })); });
            cells.push(el('td', { class: 'num tnum', style: 'font-weight:700', text: fmt.num(tot, 0) }));
            bdy.appendChild(el('tr', {}, cells));
          });
          var totals = [el('td', { text: 'Total hours' }), el('td', {})];
          var grand = 0;
          periods.forEach(function (pr) { var s = (p.tasks || []).reduce(function (a, tk) { return a + ((tk.periodHours || {})[pr] || 0); }, 0); grand += s; totals.push(el('td', { class: 'num tnum', text: fmt.num(s, 0) })); });
          totals.push(el('td', { class: 'num tnum', text: fmt.num(grand, 0) }));
          bdy.appendChild(el('tr', { class: 'total' }, totals));
          return el('div', {}, [el('p', { class: 'muted', text: 'Time-phased labor estimate (hours by period).' }), el('div', { style: 'overflow-x:auto' }, [el('table', { class: 'dt' }, [el('thead', {}, head), bdy])])]);
        }
        function resourcesTable() {
          var tbb = el('tbody');
          (p.resources || []).forEach(function (r) { tbb.appendChild(el('tr', {}, [el('td', { text: r.role }), el('td', { class: 'num tnum', text: fmt.money(r.rate) + '/hr' }), el('td', { class: 'num tnum', text: fmt.num(r.hours, 0) }), el('td', { class: 'num tnum', text: fmt.money0(r.cost) })])); });
          return el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Role' }), el('th', { class: 'num', text: 'Rate' }), el('th', { class: 'num', text: 'Est hours' }), el('th', { class: 'num', text: 'Est cost' })])), tbb]);
        }
        function tracking() {
          var eac = p.pctComplete ? p.actualCost / p.pctComplete : p.actualCost;
          var vac = p.budget - eac;
          return el('div', {}, [
            el('div', { class: 'grid g3' }, [
              ui.kpi('% complete', fmt.pct(p.pctComplete * 100), null, 'gauge'),
              ui.kpi('Estimate at completion', fmt.money0(eac), null, 'variance', eac > p.budget ? 'unfav' : 'fav'),
              ui.kpi('Variance at completion', fmt.money0(vac), vac < 0 ? 'over budget' : 'under budget', 'margin', vac < 0 ? 'unfav' : 'fav')
            ]),
            el('p', { class: 'muted', style: 'margin-top:12px', text: 'EAC = actual cost ÷ % complete. VAC = budget − EAC. Negative VAC signals the project will finish over budget.' })
          ]);
        }
        function kv(k, v) { return el('tr', {}, [el('td', { text: k }), el('td', { class: 'num', style: 'text-align:right', text: v })]); }
      }
    }
  };
  function pctBar(v) {
    return el('div', { style: 'display:flex;align-items:center;gap:8px' }, [
      el('div', { class: 'dim-bar', style: 'flex:1' }, [el('span', { style: 'width:' + Math.min(100, v * 100) + '%;background:' + (v >= 1 ? 'var(--good)' : 'var(--accent)') })]),
      el('span', { class: 'tnum', style: 'font-size:12px', text: CACC.fmt.pct(v * 100, 0) })
    ]);
  }
})(typeof window !== 'undefined' ? window : this);
