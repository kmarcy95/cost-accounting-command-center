/* Work-order / WIP engine — pure functions, no DOM.
 * Captures production-order actual vs standard cost, WIP balance, cost of goods
 * manufactured, and component production variances (positive = unfavorable).
 * order = { id, productSku, plantId, orderedQty, completedQty, status, setupCost?, plannedLot?,
 *   stdUnit:{ material, labor, overhead }, actual:{ material, labor, overhead } }
 */
(function (root) {
  'use strict';
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function r4(n) { return Math.round((n + Number.EPSILON) * 10000) / 10000; }

  function compute(o) {
    var stdUnit = o.stdUnit.material + o.stdUnit.labor + o.stdUnit.overhead;
    var stdCogm = r2(o.completedQty * stdUnit);
    var wipIssued = r2(o.actual.material + o.actual.labor + o.actual.overhead);
    var wipBalance = r2(wipIssued - stdCogm);
    var v = {
      material: r2(o.actual.material - o.completedQty * o.stdUnit.material),
      labor: r2(o.actual.labor - o.completedQty * o.stdUnit.labor),
      overhead: r2(o.actual.overhead - o.completedQty * o.stdUnit.overhead)
    };
    v.total = r2(v.material + v.labor + v.overhead);
    var lotSize = (o.setupCost && o.plannedLot) ? r2(o.setupCost * (1 - o.completedQty / o.plannedLot)) : 0;
    return {
      id: o.id, productSku: o.productSku, plantId: o.plantId, status: o.status,
      orderedQty: o.orderedQty, completedQty: o.completedQty,
      stdUnitCost: r2(stdUnit), stdCogm: stdCogm, wipIssued: wipIssued, wipBalance: wipBalance,
      variances: v, lotSizeVariance: lotSize, percentComplete: o.orderedQty ? r4(o.completedQty / o.orderedQty) : 0
    };
  }

  function summary(orders) {
    var rows = orders.map(compute);
    var t = rows.reduce(function (a, r) {
      a.wipBalance += r.wipBalance; a.stdCogm += r.stdCogm; a.wipIssued += r.wipIssued;
      a.material += r.variances.material; a.labor += r.variances.labor; a.overhead += r.variances.overhead; a.total += r.variances.total;
      return a;
    }, { wipBalance: 0, stdCogm: 0, wipIssued: 0, material: 0, labor: 0, overhead: 0, total: 0 });
    Object.keys(t).forEach(function (k) { t[k] = r2(t[k]); });
    t.open = rows.filter(function (r) { return r.status !== 'Closed'; }).length;
    return { rows: rows, totals: t };
  }

  var api = { compute: compute, summary: summary };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.CACC = root.CACC || {}).WorkOrderEngine = api;
})(typeof window !== 'undefined' ? window : this);
