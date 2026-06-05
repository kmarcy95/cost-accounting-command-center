/* Report Builder — pick a data source, choose rows/columns/measure (pivot) or
 * columns (table), filter via the global Plant/Period, save/load named templates,
 * and export. Reuses cube-engine for pivots. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, clear = CACC.dom.clear, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  function SOURCES() {
    return {
      facts: { label: 'Sales & cost facts', rows: function () { return M.filtered(); },
        dims: [{ f: 'period', label: 'Period' }, { f: 'plantId', label: 'Plant', name: 'plantName' }, { f: 'sku', label: 'Product', name: 'productName' }, { f: 'customerId', label: 'Customer', name: 'customerName' }],
        measures: [{ f: 'revenue', label: 'Revenue', money: true }, { f: 'grossProfit', label: 'Gross profit', money: true }, { f: 'actualCost', label: 'Actual cost', money: true }, { f: 'netVariance', label: 'Net variance', money: true }, { f: 'units', label: 'Units' }] },
      sales: { label: 'Sales orders', rows: function () { return M.filteredSalesOrders(); },
        dims: [{ f: 'date', label: 'Period' }, { f: 'plantId', label: 'Plant', name: 'plantName' }, { f: 'sku', label: 'Product', name: 'productName' }, { f: 'customerId', label: 'Customer', name: 'customer' }, { f: 'status', label: 'Status' }],
        measures: [{ f: 'amount', label: 'Amount', money: true }, { f: 'margin', label: 'Margin', money: true }, { f: 'qty', label: 'Quantity' }] },
      purchasing: { label: 'Purchase orders', rows: function () { return M.filteredPOs(); },
        dims: [{ f: 'date', label: 'Period' }, { f: 'plantId', label: 'Plant', name: 'plantName' }, { f: 'supplierId', label: 'Supplier', name: 'supplier' }, { f: 'sku', label: 'Product', name: 'productName' }, { f: 'status', label: 'Status' }],
        measures: [{ f: 'amount', label: 'Amount', money: true }, { f: 'qty', label: 'Quantity' }] },
      inventory: { label: 'Inventory subledger', rows: function () { return M.filteredTxns(); },
        dims: [{ f: 'date', label: 'Period' }, { f: 'plantId', label: 'Plant', name: 'plantName' }, { f: 'sku', label: 'Product', name: 'productName' }, { f: 'type', label: 'Type' }],
        measures: [{ f: 'qty', label: 'Quantity' }, { f: 'value', label: 'Value', money: true }] }
    };
  }

  CACC.views.reportBuilder = {
    title: 'Report Builder',
    render: function (c) {
      var SRC = SOURCES();
      var state = defaults('facts');
      var controls = el('div', {}), result = el('div', {});

      function defaults(srcKey) {
        var s = SRC[srcKey];
        return { source: srcKey, mode: 'pivot', rowF: s.dims[1].f, colF: s.dims[0].f, measure: s.measures[0].f, columns: s.dims.map(function (d) { return d.f; }).concat([s.measures[0].f]) };
      }
      function dimDef(srcKey, f) { return SRC[srcKey].dims.filter(function (d) { return d.f === f; })[0]; }
      function measDef(srcKey, f) { return SRC[srcKey].measures.filter(function (m) { return m.f === f; })[0]; }

      // ---- Top bar: source + mode + template controls ----
      var sourceSel = sel(Object.keys(SRC).map(function (k) { return [k, SRC[k].label]; }), state.source, function (v) { state = defaults(v); buildControls(); renderResult(); });
      var modeSel = sel([['pivot', 'Pivot table'], ['table', 'Flat table']], state.mode, function (v) { state.mode = v; buildControls(); renderResult(); });

      var nameInput = el('input', { type: 'text', placeholder: 'Template name…', style: 'max-width:180px' });
      var loadSel = el('select', {});
      function refreshTemplates() {
        clear(loadSel); loadSel.appendChild(el('option', { value: '', text: 'Load saved…' }));
        CACC.store.getReports().forEach(function (r) { loadSel.appendChild(el('option', { value: r.name, text: r.name })); });
      }
      refreshTemplates();
      loadSel.addEventListener('change', function () {
        var r = CACC.store.getReports().filter(function (x) { return x.name === loadSel.value; })[0];
        if (r) { state = Object.assign({}, r.config); nameInput.value = r.name; sourceSel.value = state.source; modeSel.value = state.mode; buildControls(); renderResult(); }
      });
      var saveBtn = el('button', { class: 'btn btn-primary btn-sm', onclick: function () {
        var n = (nameInput.value || '').trim(); if (!n) { nameInput.focus(); return; }
        CACC.store.saveReport(n, state); refreshTemplates(); loadSel.value = n; toast('Saved template “' + n + '”.');
      } }, [CACC.icon('report'), 'Save template']);
      var delBtn = el('button', { class: 'btn btn-ghost btn-sm', onclick: function () {
        var n = (nameInput.value || loadSel.value || '').trim(); if (!n) return; CACC.store.deleteReport(n); refreshTemplates(); toast('Deleted “' + n + '”.');
      } }, 'Delete');

      c.appendChild(el('div', { class: 'card card-pad', style: 'display:flex;gap:12px;flex-wrap:wrap;align-items:end' }, [
        field('Data source', sourceSel), field('Layout', modeSel),
        el('div', { style: 'flex:1' }), field('Template', nameInput), el('div', { style: 'align-self:end' }, [saveBtn]),
        el('div', { style: 'align-self:end' }, [delBtn]), field('Saved', loadSel)
      ]));
      c.appendChild(el('div', { class: 'note', style: 'margin-top:10px', text: 'Reports respect the global Plant / Period filter in the top bar. Build a pivot or pick columns, then save it as a reusable template.' }));
      c.appendChild(controls);
      c.appendChild(el('div', { class: 'section-title', text: 'Result' }));
      c.appendChild(result);
      var toastBox = el('div', { style: 'position:fixed;bottom:24px;right:24px;z-index:1200' });
      c.appendChild(toastBox);

      buildControls(); renderResult();

      function buildControls() {
        clear(controls);
        var s = SRC[state.source];
        if (state.mode === 'pivot') {
          var rowSel = sel(s.dims.map(function (d) { return [d.f, d.label]; }), state.rowF, function (v) { state.rowF = v; renderResult(); });
          var colSel = sel(s.dims.map(function (d) { return [d.f, d.label]; }), state.colF, function (v) { state.colF = v; renderResult(); });
          var measSel = sel(s.measures.map(function (m) { return [m.f, m.label]; }), state.measure, function (v) { state.measure = v; renderResult(); });
          controls.appendChild(el('div', { class: 'card card-pad dim-pickers' }, [field('Rows', rowSel), field('Columns', colSel), field('Measure', measSel)]));
        } else {
          var all = s.dims.map(function (d) { return { f: d.f, label: d.label }; }).concat(s.measures.map(function (m) { return { f: m.f, label: m.label }; }));
          var boxes = el('div', { style: 'display:flex;gap:14px;flex-wrap:wrap' });
          all.forEach(function (col) {
            var cb = el('input', { type: 'checkbox' }); cb.checked = state.columns.indexOf(col.f) >= 0;
            cb.addEventListener('change', function () { if (cb.checked) { if (state.columns.indexOf(col.f) < 0) state.columns.push(col.f); } else { state.columns = state.columns.filter(function (x) { return x !== col.f; }); } renderResult(); });
            boxes.appendChild(el('label', { style: 'display:flex;gap:6px;align-items:center;font-size:13.5px' }, [cb, col.label]));
          });
          controls.appendChild(el('div', { class: 'card card-pad' }, [el('div', { class: 'muted', style: 'margin-bottom:8px', text: 'Columns to show' }), boxes]));
        }
      }

      function renderResult() {
        clear(result);
        var s = SRC[state.source], rows = s.rows();
        if (!rows.length) { result.appendChild(el('div', { class: 'note', text: 'No data for the current filter.' })); return; }
        var table = state.mode === 'pivot' ? pivotTable(s, rows) : flatTable(s, rows);
        result.appendChild(ui.card(null, rows.length + ' source rows · ' + M.filterLabel(), [el('div', { style: 'overflow-x:auto' }, [table])], CACC.tableTools.exportButton(table, 'report.csv')));
        CACC.tableTools.makeSortable(table);
      }

      function pivotTable(s, rows) {
        var rd = dimDef(state.source, state.rowF), cd = dimDef(state.source, state.colF), md = measDef(state.source, state.measure);
        var piv = CACC.CubeEngine.pivot(rows, rd.f, rd.name || null, cd.f, cd.name || null, md.f);
        function fv(v) { return md.money ? fmt.money0(v) : fmt.num(v, 0); }
        var head = el('tr', {}, [el('th', { text: rd.label })].concat(piv.colKeys.map(function (ck) { return el('th', { class: 'num', text: ck.name }); })).concat([el('th', { class: 'num', text: 'Total' })]));
        var body = el('tbody');
        piv.rowKeys.forEach(function (rk) {
          var cells = [el('td', { class: 'rowhead', text: rk.name })];
          piv.colKeys.forEach(function (ck) { var v = piv.cells[rk.key + '||' + ck.key] || 0; cells.push(el('td', { class: 'cell', text: v ? fv(v) : '—', onclick: function () { cellDrill(s, rows, rd, rk, cd, ck, md); } })); });
          cells.push(el('td', { class: 'num tnum', style: 'font-weight:700', text: fv(piv.rowTotals[rk.key] || 0) }));
          body.appendChild(el('tr', {}, cells));
        });
        body.appendChild(el('tr', { class: 'total' }, [el('td', { text: 'Total' })].concat(piv.colKeys.map(function (ck) { return el('td', { class: 'num tnum', text: fv(piv.colTotals[ck.key] || 0) }); })).concat([el('td', { class: 'num tnum', text: fv(piv.grand) })])));
        return el('table', { class: 'dt pivot' }, [el('thead', {}, head), body]);
      }

      function flatTable(s, rows) {
        var cols = state.columns.length ? state.columns : s.dims.map(function (d) { return d.f; });
        var defs = cols.map(function (f) { var d = dimDef(state.source, f) || measDef(state.source, f); return { f: f, label: d ? d.label : f, money: d && d.money, name: d && d.name }; });
        var head = el('tr', {}, defs.map(function (d) { return el('th', { class: d.money || d.f === 'qty' || d.f === 'units' ? 'num' : '', text: d.label }); }));
        var body = el('tbody');
        rows.forEach(function (r) {
          body.appendChild(el('tr', {}, defs.map(function (d) {
            var raw = d.name ? r[d.name] : r[d.f];
            if (typeof r[d.f] === 'number') { var num = r[d.f]; return el('td', { class: 'num tnum', text: d.money ? fmt.money0(num) : fmt.num(num, 0) }); }
            return el('td', { text: raw != null ? raw : (r[d.f] != null ? r[d.f] : '') });
          })));
        });
        return el('table', { class: 'dt' }, [el('thead', {}, head), body]);
      }

      function cellDrill(s, rows, rd, rk, cd, ck, md) {
        var sub = rows.filter(function (r) { return r[rd.f] === rk.key && r[cd.f] === ck.key; });
        var allCols = s.dims.concat(s.measures);
        var head = el('tr', {}, allCols.map(function (d) { return el('th', { class: d.money ? 'num' : '', text: d.label }); }));
        var tb = el('tbody');
        sub.forEach(function (r) { tb.appendChild(el('tr', {}, allCols.map(function (d) { var v = d.name ? r[d.name] : r[d.f]; return typeof r[d.f] === 'number' ? el('td', { class: 'num tnum', text: d.money ? fmt.money0(r[d.f]) : fmt.num(r[d.f], 0) }) : el('td', { text: v != null ? v : '' }); }))); });
        ui.window(rk.name + ' × ' + ck.name, [el('p', { class: 'muted', text: sub.length + ' source rows.' }), el('div', { style: 'overflow-x:auto' }, [el('table', { class: 'dt' }, [el('thead', {}, head), tb])])], 'Report drill-down');
      }

      function toast(msg) { var t = el('div', { class: 'card card-pad', style: 'box-shadow:var(--shadow-lg);margin-top:10px;border-left:4px solid var(--good)', text: msg }); toastBox.appendChild(t); setTimeout(function () { t.remove(); }, 3000); }
      function field(label, node) { return el('div', { class: 'field', style: 'min-width:150px' }, [el('label', { text: label }), node]); }
      function sel(opts, current, onChange) {
        var s = el('select', {}, opts.map(function (o) { var v = o[0], l = o[1]; var op = el('option', { value: v, text: l }); if (v === current) op.selected = true; return op; }));
        s.addEventListener('change', function () { onChange(s.value); });
        return s;
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
