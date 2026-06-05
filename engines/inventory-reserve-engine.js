/* Inventory reserve engine — pure functions, no DOM.
 * Computes a multi-item inventory reserve across material/finished-goods items:
 *   1. Lower-of-cost-or-NRV (LCNRV) write-down  — ASC 330 measurement
 *   2. Excess & Obsolete (E&O) reserve          — aging + demand-coverage driven
 * Combined reserve = NRV write-down (all units to NRV) + E&O on the excess units
 * at their post-write-down carrying value. Fully transparent + reconcilable.
 *
 * item = {
 *   sku, description, category, type ('raw'|'wip'|'fg'),
 *   qtyOnHand, unitCost,
 *   sellingPrice, costToComplete, costToSell,  // NRV = selling - complete - sell
 *   annualDemand, agingDays
 * }
 * policy = { coverageMonths, buckets: [{ maxDays, pct }] }  // last bucket maxDays huge
 */
(function (root) {
  'use strict';

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function round4(n) { return Math.round((n + Number.EPSILON) * 10000) / 10000; }

  function agingBucketPct(days, policy) {
    var buckets = policy.buckets || [];
    for (var i = 0; i < buckets.length; i++) {
      if (days <= buckets[i].maxDays) return buckets[i].pct;
    }
    return buckets.length ? buckets[buckets.length - 1].pct : 0;
  }

  function analyzeItem(item, policy) {
    var grossValue = round2(item.qtyOnHand * item.unitCost);

    // --- 1. NRV write-down (applied to ALL units) ---
    var nrv = round2((item.sellingPrice || 0) - (item.costToComplete || 0) - (item.costToSell || 0));
    var nrvWritedownUnit = Math.max(0, round2(item.unitCost - nrv));
    var nrvReserve = round2(item.qtyOnHand * nrvWritedownUnit);
    var carryingUnitAfterNrv = round2(item.unitCost - nrvWritedownUnit); // = min(cost, nrv)

    // --- 2. Excess & Obsolete on units beyond demand coverage ---
    var demandCoverageQty = round2((item.annualDemand || 0) * (policy.coverageMonths || 12) / 12);
    var excessQty = Math.max(0, round2(item.qtyOnHand - demandCoverageQty));
    var eoPct = agingBucketPct(item.agingDays || 0, policy);
    var eoReserve = round2(excessQty * carryingUnitAfterNrv * eoPct);

    var combinedReserve = round2(nrvReserve + eoReserve);
    var netValue = round2(grossValue - combinedReserve);

    return {
      sku: item.sku, description: item.description, category: item.category, type: item.type,
      qtyOnHand: item.qtyOnHand, unitCost: round2(item.unitCost), grossValue: grossValue,
      nrv: nrv, nrvWritedownUnit: nrvWritedownUnit, nrvReserve: nrvReserve,
      carryingUnitAfterNrv: carryingUnitAfterNrv,
      demandCoverageQty: demandCoverageQty, excessQty: excessQty,
      agingDays: item.agingDays || 0, eoPct: eoPct, eoReserve: eoReserve,
      combinedReserve: combinedReserve, netValue: netValue,
      reservePct: grossValue ? round4(combinedReserve / grossValue) : 0
    };
  }

  function analyzePortfolio(items, policy) {
    var rows = items.map(function (it) { return analyzeItem(it, policy); });
    var totals = rows.reduce(function (a, r) {
      a.grossValue += r.grossValue; a.nrvReserve += r.nrvReserve;
      a.eoReserve += r.eoReserve; a.combinedReserve += r.combinedReserve; a.netValue += r.netValue;
      return a;
    }, { grossValue: 0, nrvReserve: 0, eoReserve: 0, combinedReserve: 0, netValue: 0 });
    Object.keys(totals).forEach(function (k) { totals[k] = round2(totals[k]); });
    totals.reservePct = totals.grossValue ? round4(totals.combinedReserve / totals.grossValue) : 0;
    totals.itemsReserved = rows.filter(function (r) { return r.combinedReserve > 0.005; }).length;

    var byCategory = {};
    rows.forEach(function (r) {
      var c = r.category || 'Uncategorized';
      if (!byCategory[c]) byCategory[c] = { category: c, grossValue: 0, combinedReserve: 0, netValue: 0 };
      byCategory[c].grossValue = round2(byCategory[c].grossValue + r.grossValue);
      byCategory[c].combinedReserve = round2(byCategory[c].combinedReserve + r.combinedReserve);
      byCategory[c].netValue = round2(byCategory[c].netValue + r.netValue);
    });

    return { items: rows, totals: totals, byCategory: Object.keys(byCategory).map(function (k) { return byCategory[k]; }) };
  }

  var api = { agingBucketPct: agingBucketPct, analyzeItem: analyzeItem, analyzePortfolio: analyzePortfolio };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { (root.CACC = root.CACC || {}).InventoryReserveEngine = api; }
})(typeof window !== 'undefined' ? window : this);
