/* Landed-cost engine — pure functions, no DOM.
 * Allocates freight/duty/handling/insurance charges across receipt lines by a
 * chosen basis (value, weight, or qty) and returns the landed unit cost.
 * receipts = [{ id, sku, qty, value, weight }]
 */
(function (root) {
  'use strict';
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function r4(n) { return Math.round((n + Number.EPSILON) * 10000) / 10000; }

  function allocate(chargeAmount, receipts, basis) {
    basis = basis || 'value';
    var total = receipts.reduce(function (s, r) { return s + (r[basis] || 0); }, 0);
    return receipts.map(function (r) {
      var share = total ? (r[basis] || 0) / total : 0;
      var alloc = r2(chargeAmount * share);
      var landedValue = r2((r.value || 0) + alloc);
      return {
        id: r.id, sku: r.sku, qty: r.qty, value: r2(r.value || 0), weight: r.weight,
        sharePct: r4(share), allocated: alloc, landedValue: landedValue,
        baseUnit: r.qty ? r4((r.value || 0) / r.qty) : 0, landedUnit: r.qty ? r4(landedValue / r.qty) : 0
      };
    });
  }

  /* Apply several charge buckets (freight, duty, handling, insurance) at once. */
  function applyCharges(charges, receipts) {
    var rows = receipts.map(function (r) { return { id: r.id, sku: r.sku, qty: r.qty, value: r2(r.value || 0), weight: r.weight, allocated: 0 }; });
    charges.forEach(function (ch) {
      var alloc = allocate(ch.amount, receipts, ch.basis);
      alloc.forEach(function (a, i) { rows[i].allocated = r2(rows[i].allocated + a.allocated); });
    });
    rows.forEach(function (r) { r.landedValue = r2(r.value + r.allocated); r.landedUnit = r.qty ? r4(r.landedValue / r.qty) : 0; r.baseUnit = r.qty ? r4(r.value / r.qty) : 0; });
    var totalCharges = r2(charges.reduce(function (s, c) { return s + c.amount; }, 0));
    var totalAllocated = r2(rows.reduce(function (s, r) { return s + r.allocated; }, 0));
    return { rows: rows, totalCharges: totalCharges, totalAllocated: totalAllocated, reconciles: Math.abs(totalCharges - totalAllocated) < 0.05 };
  }

  var api = { allocate: allocate, applyCharges: applyCharges };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.CACC = root.CACC || {}).LandedCostEngine = api;
})(typeof window !== 'undefined' ? window : this);
