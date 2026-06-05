/* CACC.grid — D365-style personalizable data grid.
 * Features: quick search, click-to-sort, group-by with subtotals, column chooser
 * (show/hide), CSV export, and per-grid SAVED VIEWS persisted to localStorage.
 *
 * CACC.grid(id, columns, rows, opts) -> card node
 *   columns: [{ key, label, fmt?:'money'|'money0'|'num'|'num2'|'pct'|'text',
 *               align?, value?(row), render?(row,val)->node|string, group?:bool, sum?:bool }]
 *   opts: { title, onRow(row) }
 */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  function el() { return CACC.dom.el.apply(null, arguments); }

  function numericFmt(f) { return f === 'money' || f === 'money0' || f === 'num' || f === 'num2' || f === 'pct'; }
  function fmtVal(type, v) {
    var F = CACC.fmt; if (v == null || v === '') return '';
    switch (type) {
      case 'money': return F.money(v); case 'money0': return F.money0(v);
      case 'num': return F.num(v, 0); case 'num2': return F.num(v, 2); case 'pct': return F.pct(v * 100);
      default: return String(v);
    }
  }
  function csv(t) { t = (t == null ? '' : String(t)); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; }

  CACC.grid = function (id, columns, rows, opts) {
    opts = opts || {};
    var key = 'cacc.grid.' + id;
    var saved = CACC.LS.get(key, {}) || {};
    var state = { hidden: saved.hidden || {}, groupBy: saved.groupBy || '', sortKey: saved.sortKey || '', sortDir: saved.sortDir || 'asc', search: saved.search || '', colFilters: saved.colFilters || {}, showFilters: saved.showFilters || false };
    function persist() { CACC.LS.set(key, { hidden: state.hidden, groupBy: state.groupBy, sortKey: state.sortKey, sortDir: state.sortDir, search: state.search, colFilters: state.colFilters, showFilters: state.showFilters }); }
    function valOf(row, c) { return c.value ? c.value(row) : row[c.key]; }
    function visibleCols() { return columns.filter(function (c) { return !state.hidden[c.key]; }); }
    function cls(c) { return numericFmt(c.fmt) || c.align === 'num' ? 'num tnum' : ''; }

    var tableWrap = el('div', { style: 'overflow-x:auto' });
    var search = el('input', { type: 'text', placeholder: 'Search…', class: 'input', style: 'max-width:220px', value: state.search,
      oninput: function () { state.search = search.value.toLowerCase(); render(); persist(); } });
    var groupSel = el('select', {}, [el('option', { value: '', text: 'No grouping' })].concat(
      columns.filter(function (c) { return c.group !== false; }).map(function (c) { var o = el('option', { value: c.key, text: 'Group by ' + c.label }); if (c.key === state.groupBy) o.selected = true; return o; })));
    groupSel.addEventListener('change', function () { state.groupBy = groupSel.value; render(); persist(); });
    var count = el('span', { class: 'muted', style: 'margin-left:auto;font-size:12.5px' });
    var bar = el('div', { class: 'gridbar' }, [
      search, groupSel,
      el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { state.showFilters = !state.showFilters; render(); persist(); } }, [CACC.icon('filter'), 'Filters']),
      el('button', { class: 'btn btn-ghost btn-sm', onclick: openColumns }, [CACC.icon('settings'), 'Columns']),
      el('button', { class: 'btn btn-ghost btn-sm', onclick: exportCSV }, [CACC.icon('list'), 'Export']),
      el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { CACC.LS.remove(key); state.hidden = {}; state.groupBy = ''; state.sortKey = ''; state.search = ''; search.value = ''; groupSel.value = ''; render(); } }, 'Reset view'),
      count
    ]);
    var host = el('div', { class: 'card' }, [bar, tableWrap]);

    function filtered() {
      var q = state.search, cf = state.colFilters || {}, cfKeys = Object.keys(cf).filter(function (k) { return cf[k]; });
      return rows.filter(function (r) {
        if (q && !visibleCols().some(function (c) { var v = valOf(r, c); return v != null && String(v).toLowerCase().indexOf(q) >= 0; })) return false;
        for (var i = 0; i < cfKeys.length; i++) {
          var c = columns.filter(function (x) { return x.key === cfKeys[i]; })[0]; if (!c) continue;
          var v = valOf(r, c); if (v == null || String(v).toLowerCase().indexOf(cf[cfKeys[i]]) < 0) return false;
        }
        return true;
      });
    }
    function sorted(rs) {
      if (!state.sortKey) return rs;
      var c = columns.filter(function (x) { return x.key === state.sortKey; })[0]; if (!c) return rs;
      var dir = state.sortDir === 'asc' ? 1 : -1;
      return rs.slice().sort(function (a, b) {
        var av = valOf(a, c), bv = valOf(b, c);
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        av = (av == null ? '' : String(av)).toLowerCase(); bv = (bv == null ? '' : String(bv)).toLowerCase();
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }
    function cellNode(row, c) {
      if (c.render) { var out = c.render(row, valOf(row, c)); if (typeof out === 'string') return el('td', { class: cls(c), text: out }); var td = el('td', { class: cls(c) }); td.appendChild(out); return td; }
      return el('td', { class: cls(c), text: fmtVal(c.fmt, valOf(row, c)) });
    }
    function rowNode(r, cols) {
      var tr = el('tr', opts.onRow ? { style: 'cursor:pointer', onclick: function () { opts.onRow(r); } } : {});
      cols.forEach(function (c) { tr.appendChild(cellNode(r, c)); });
      return tr;
    }
    function subtotal(cols, rs, label) {
      var tr = el('tr', { class: 'total' });
      cols.forEach(function (c, i) {
        if (i === 0) { tr.appendChild(el('td', { text: label || 'Subtotal' })); return; }
        if (c.sum) { var s = rs.reduce(function (a, r) { return a + (Number(valOf(r, c)) || 0); }, 0); tr.appendChild(el('td', { class: 'num tnum', text: fmtVal(c.fmt, s) })); }
        else tr.appendChild(el('td', {}));
      });
      return tr;
    }
    function buildBody(cols) {
      var rs = sorted(filtered());
      count.textContent = rs.length + ' rows';
      var tbody = el('tbody');
      if (state.groupBy) {
        var gc = columns.filter(function (x) { return x.key === state.groupBy; })[0];
        var groups = {}, order = [];
        rs.forEach(function (r) { var k = valOf(r, gc); if (!groups[k]) { groups[k] = []; order.push(k); } groups[k].push(r); });
        order.forEach(function (k) {
          var gr = el('tr', { class: 'grp' }); var td = el('td', { colspan: cols.length });
          td.appendChild(el('strong', { text: gc.label + ': ' + k })); td.appendChild(document.createTextNode('  (' + groups[k].length + ')')); gr.appendChild(td); tbody.appendChild(gr);
          groups[k].forEach(function (r) { tbody.appendChild(rowNode(r, cols)); });
          if (cols.some(function (c) { return c.sum; })) tbody.appendChild(subtotal(cols, groups[k], 'Subtotal'));
        });
      } else {
        rs.forEach(function (r) { tbody.appendChild(rowNode(r, cols)); });
      }
      if (!state.groupBy && cols.some(function (c) { return c.sum; })) tbody.appendChild(subtotal(cols, rs, 'Total'));
      return tbody;
    }
    function render() {
      CACC.dom.clear(tableWrap);
      var cols = visibleCols();
      var hr = el('tr');
      cols.forEach(function (c) {
        var th = el('th', { class: (numericFmt(c.fmt) ? 'num ' : '') + 'sortable', text: c.label });
        if (state.sortKey === c.key) th.setAttribute('aria-sort', state.sortDir === 'asc' ? 'ascending' : 'descending');
        th.addEventListener('click', function () { if (state.sortKey === c.key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc'; else { state.sortKey = c.key; state.sortDir = 'asc'; } render(); persist(); });
        hr.appendChild(th);
      });
      var thead = el('thead', {}, hr);
      var table = el('table', { class: 'dt' });
      if (state.showFilters) {
        var fr = el('tr', { class: 'filterrow' });
        cols.forEach(function (c) {
          var inp = el('input', { type: 'text', value: state.colFilters[c.key] || '', placeholder: '⌕',
            oninput: function () { state.colFilters[c.key] = inp.value.toLowerCase(); persist(); var nb = buildBody(cols); table.replaceChild(nb, table.tBodies[0]); } });
          var th = el('th', {}); th.appendChild(inp); fr.appendChild(th);
        });
        thead.appendChild(fr);
      }
      table.appendChild(thead); table.appendChild(buildBody(cols));
      tableWrap.appendChild(table);
    }
    function exportCSV() {
      var cols = visibleCols(), rs = sorted(filtered());
      var lines = [cols.map(function (c) { return csv(c.label); }).join(',')];
      rs.forEach(function (r) { lines.push(cols.map(function (c) { return csv(fmtVal(c.fmt, valOf(r, c)).replace(/[$,]/g, '')); }).join(',')); });
      CACC.tableTools.download((id || 'report') + '.csv', lines.join('\r\n'), 'text/csv');
    }
    function openColumns() {
      var list = el('div', {});
      columns.forEach(function (c) {
        var cb = el('input', { type: 'checkbox' }); cb.checked = !state.hidden[c.key];
        cb.addEventListener('change', function () { if (cb.checked) delete state.hidden[c.key]; else state.hidden[c.key] = true; render(); });
        list.appendChild(el('label', { style: 'display:flex;gap:8px;align-items:center;padding:5px 0' }, [cb, c.label]));
      });
      CACC.ui.window('Choose columns — ' + (opts.title || id), [
        el('p', { class: 'muted', text: 'Show or hide columns, then save the view. Personalization is kept on this browser.' }), list,
        el('div', { style: 'margin-top:12px;display:flex;gap:8px' }, [
          el('button', { class: 'btn btn-primary btn-sm', onclick: function () { persist(); } }, 'Save view'),
          el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { CACC.LS.remove(key); state.hidden = {}; render(); } }, 'Reset')
        ])
      ], 'Personalize');
    }
    render();
    return host;
  };
})(typeof window !== 'undefined' ? window : this);
