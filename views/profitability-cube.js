/* Profitability Cube — interactive pivot (rows × cols × measure) with clickable cells. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  var DIMS = [{ f: 'sku', label: 'Product' }, { f: 'plantId', label: 'Plant' }, { f: 'customerId', label: 'Customer' }, { f: 'period', label: 'Period' }];
  var MEAS = [
    { f: 'grossProfit', label: 'Gross profit', money: true }, { f: 'revenue', label: 'Revenue', money: true },
    { f: 'actualCost', label: 'Actual cost', money: true }, { f: 'netVariance', label: 'Net variance', money: true },
    { f: 'units', label: 'Units', money: false }
  ];

  CACC.views.profitabilityCube = {
    title: 'Profitability Cube',
    render: function (c) {
      var rowF = 'sku', colF = 'plantId', meas = 'grossProfit';
      var pane = el('div', {});

      function dimSel(label, current, onChange, exclude) {
        var sel = el('select', {}, DIMS.filter(function (x) { return x.f !== exclude; }).map(function (x) {
          var o = el('option', { value: x.f, text: x.label }); if (x.f === current) o.selected = true; return o;
        }));
        sel.addEventListener('change', function () { onChange(sel.value); });
        return el('div', { class: 'field', style: 'min-width:150px' }, [el('label', { text: label }), sel]);
      }
      function measSel() {
        var sel = el('select', {}, MEAS.map(function (x) { var o = el('option', { value: x.f, text: x.label }); if (x.f === meas) o.selected = true; return o; }));
        sel.addEventListener('change', function () { meas = sel.value; renderPivot(); });
        return el('div', { class: 'field', style: 'min-width:150px' }, [el('label', { text: 'Measure' }), sel]);
      }

      var controlsHost = el('div', {});
      function renderControls() { clear(controlsHost); controlsHost.appendChild(rebuildControls()); }
      function rebuildControls() {
        return el('div', { class: 'card card-pad dim-pickers' }, [
          dimSel('Rows', rowF, function (v) { rowF = v; if (colF === v) colF = other(v); renderControls(); renderPivot(); }, colF),
          dimSel('Columns', colF, function (v) { colF = v; if (rowF === v) rowF = other(v); renderControls(); renderPivot(); }, rowF),
          measSel(),
          el('div', { style: 'margin-left:auto;align-self:end' }, [el('span', { class: 'muted', text: M.filterLabel() })])
        ]);
      }
      function other(v) { return DIMS.filter(function (x) { return x.f !== v; })[0].f; }

      c.appendChild(controlsHost);
      c.appendChild(el('div', { class: 'section-title', text: 'Pivot' }));
      c.appendChild(pane);
      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('profitabilityCube', M.ctx.profitabilityCube()));

      renderControls();

      function fmtMeas(v) { var m = MEAS.filter(function (x) { return x.f === meas; })[0]; return m.money ? fmt.money0(v) : fmt.num(v, 0); }
      function renderPivot() {
        clear(pane);
        var piv = M.cube(rowF, colF, meas);
        var head = el('tr', {}, [el('th', { text: DIMS.filter(function (x) { return x.f === rowF; })[0].label })]
          .concat(piv.colKeys.map(function (ck) { return el('th', { class: 'num', text: ck.name }); }))
          .concat([el('th', { class: 'num', text: 'Total' })]));
        var body = el('tbody');
        piv.rowKeys.forEach(function (rk) {
          var cells = [el('td', { class: 'rowhead', text: rk.name })];
          piv.colKeys.forEach(function (ck) {
            var v = piv.cells[rk.key + '||' + ck.key] || 0;
            cells.push(el('td', { class: 'cell', text: v ? fmtMeas(v) : '—', title: rk.name + ' × ' + ck.name,
              onclick: function () { drill(rk, ck); } }));
          });
          cells.push(el('td', { class: 'num tnum', style: 'font-weight:700', text: fmtMeas(piv.rowTotals[rk.key] || 0) }));
          body.appendChild(el('tr', {}, cells));
        });
        var foot = el('tr', { class: 'total' }, [el('td', { text: 'Total' })]
          .concat(piv.colKeys.map(function (ck) { return el('td', { class: 'num tnum', text: fmtMeas(piv.colTotals[ck.key] || 0) }); }))
          .concat([el('td', { class: 'num tnum', text: fmtMeas(piv.grand) })]));
        body.appendChild(foot);
        var table = el('table', { class: 'dt pivot' }, [el('thead', {}, head), body]);
        pane.appendChild(ui.card(null, MEAS.filter(function (x) { return x.f === meas; })[0].label + ' · click a cell to drill down', [
          el('div', { style: 'overflow-x:auto' }, [table])
        ], CACC.tableTools.exportButton(table, 'profitability-cube.csv')));
      }

      function drill(rk, ck) {
        var extra = {}; extra[rowF] = rk.key; extra[colF] = ck.key;
        var rows = M.filtered(extra);
        var tb = el('tbody');
        rows.forEach(function (r) {
          tb.appendChild(el('tr', {}, [
            el('td', { text: r.period }), el('td', { text: r.plantName }), el('td', { text: r.productName }), el('td', { text: r.customerName }),
            el('td', { class: 'num tnum', text: fmt.num(r.units, 0) }), el('td', { class: 'num tnum', text: fmt.money0(r.revenue) }),
            el('td', { class: 'num tnum', text: fmt.money0(r.grossProfit) }), ui.vcell(r.netVariance)
          ]));
        });
        ui.modal(rk.name + ' × ' + ck.name, [
          el('p', { class: 'muted', text: rows.length + ' fact rows contributing to this cell.' }),
          el('div', { style: 'overflow-x:auto' }, [el('table', { class: 'dt' }, [
            el('thead', {}, el('tr', {}, [el('th', { text: 'Period' }), el('th', { text: 'Plant' }), el('th', { text: 'Product' }), el('th', { text: 'Customer' }),
              el('th', { class: 'num', text: 'Units' }), el('th', { class: 'num', text: 'Revenue' }), el('th', { class: 'num', text: 'Gross profit' }), el('th', { class: 'num', text: 'Variance' })])), tb
          ])])
        ], 'Cube drill-down');
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
