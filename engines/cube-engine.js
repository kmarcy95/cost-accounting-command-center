/* Cube engine — pure functions for slicing/aggregating the multi-plant fact table.
 * Powers Executive Overview, Plant Scorecard, Profitability Cube, Budget vs Actual.
 * A "fact" row: { period, plantId, plantName, sku, productName, customerId, customerName,
 *   units, revenue, stdCost, actualCost, grossProfit, materialVar, laborVar, ohVar, netVariance, invValue }
 */
(function (root) {
  'use strict';
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function r4(n) { return Math.round((n + Number.EPSILON) * 10000) / 10000; }

  function filterFacts(facts, f) {
    f = f || {};
    return facts.filter(function (row) {
      return (!f.plantId || f.plantId === 'ALL' || row.plantId === f.plantId) &&
        (!f.period || f.period === 'ALL' || row.period === f.period) &&
        (!f.customerId || f.customerId === 'ALL' || row.customerId === f.customerId) &&
        (!f.sku || f.sku === 'ALL' || row.sku === f.sku);
    });
  }

  var MEASURES = ['units', 'revenue', 'stdCost', 'actualCost', 'grossProfit', 'materialVar', 'laborVar', 'ohVar', 'netVariance', 'invValue'];

  function kpis(rows) {
    var t = MEASURES.reduce(function (a, m) { a[m] = 0; return a; }, {});
    rows.forEach(function (row) { MEASURES.forEach(function (m) { t[m] += (row[m] || 0); }); });
    MEASURES.forEach(function (m) { t[m] = r2(t[m]); });
    t.marginPct = t.revenue ? r4(t.grossProfit / t.revenue) : 0;
    return t;
  }

  function groupBy(rows, keyField, nameField) {
    var map = {};
    rows.forEach(function (row) {
      var k = row[keyField];
      if (!map[k]) { map[k] = { key: k, name: nameField ? row[nameField] : k }; MEASURES.forEach(function (m) { map[k][m] = 0; }); }
      MEASURES.forEach(function (m) { map[k][m] += (row[m] || 0); });
    });
    return Object.keys(map).map(function (k) {
      var g = map[k]; MEASURES.forEach(function (m) { g[m] = r2(g[m]); });
      g.marginPct = g.revenue ? r4(g.grossProfit / g.revenue) : 0;
      return g;
    });
  }

  function topN(rows, keyField, nameField, measure, n) {
    return groupBy(rows, keyField, nameField).sort(function (a, b) { return (b[measure] || 0) - (a[measure] || 0); }).slice(0, n || 5);
  }

  /* Pivot: rows x cols on a single measure. Returns { rowKeys, colKeys, cells, rowTotals, colTotals, grand } */
  function pivot(rows, rowField, rowName, colField, colName, measure) {
    var cells = {}, rowKeys = {}, colKeys = {};
    rows.forEach(function (row) {
      var rk = row[rowField], ck = row[colField];
      rowKeys[rk] = rowName ? row[rowName] : rk; colKeys[ck] = colName ? row[colName] : ck;
      var key = rk + '||' + ck;
      cells[key] = (cells[key] || 0) + (row[measure] || 0);
    });
    var rKeys = Object.keys(rowKeys), cKeys = Object.keys(colKeys);
    var rowTotals = {}, colTotals = {}, grand = 0;
    rKeys.forEach(function (rk) {
      var sum = 0; cKeys.forEach(function (ck) { var v = cells[rk + '||' + ck] || 0; sum += v; colTotals[ck] = (colTotals[ck] || 0) + v; });
      rowTotals[rk] = r2(sum); grand += sum;
    });
    Object.keys(cells).forEach(function (k) { cells[k] = r2(cells[k]); });
    Object.keys(colTotals).forEach(function (k) { colTotals[k] = r2(colTotals[k]); });
    return {
      rowKeys: rKeys.map(function (k) { return { key: k, name: rowKeys[k] }; }),
      colKeys: cKeys.map(function (k) { return { key: k, name: colKeys[k] }; }),
      cells: cells, rowTotals: rowTotals, colTotals: colTotals, grand: r2(grand)
    };
  }

  /* Time series of a measure across periods (ordered by the provided period list) */
  function series(rows, periodOrder, measure) {
    var byP = {};
    rows.forEach(function (row) { byP[row.period] = (byP[row.period] || 0) + (row[measure] || 0); });
    return periodOrder.map(function (p) { return { period: p, value: r2(byP[p] || 0) }; });
  }

  var api = { filterFacts: filterFacts, kpis: kpis, groupBy: groupBy, topN: topN, pivot: pivot, series: series, measures: MEASURES };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { (root.CACC = root.CACC || {}).CubeEngine = api; }
})(typeof window !== 'undefined' ? window : this);
