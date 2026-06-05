/* Inventory valuation & manufacturing cost-flow engine — pure functions, no DOM.
 *  - Periodic FIFO / LIFO / Weighted-Average valuation over cost layers
 *  - RM -> WIP -> FG -> COGS roll-forward
 *  - Overhead absorption (applied vs. actual, over/under-applied)
 */
(function (root) {
  'use strict';

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function round4(n) { return Math.round((n + Number.EPSILON) * 10000) / 10000; }

  /* ---------------------------------------------------------------------------
   * VALUATION (periodic)
   * layers = [{ units, unitCost }] in chronological order (beginning first)
   * unitsSold = number of units sold during the period
   * Returns COGS and ending inventory under one method.
   * ------------------------------------------------------------------------- */
  function totalsFromLayers(layers) {
    var units = 0, cost = 0;
    layers.forEach(function (l) { units += l.units; cost += l.units * l.unitCost; });
    return { units: units, cost: round2(cost) };
  }

  function valueFifo(layers, unitsSold) {
    // COGS consumes oldest layers first
    var remaining = unitsSold, cogs = 0;
    for (var k = 0; k < layers.length && remaining > 0; k++) {
      var take = Math.min(remaining, layers[k].units);
      cogs += take * layers[k].unitCost;
      remaining -= take;
    }
    var avail = totalsFromLayers(layers);
    return { cogs: round2(cogs), endingInventory: round2(avail.cost - cogs), endingUnits: avail.units - unitsSold };
  }

  function valueLifo(layers, unitsSold) {
    // COGS consumes newest layers first
    var remaining = unitsSold, cogs = 0;
    for (var k = layers.length - 1; k >= 0 && remaining > 0; k--) {
      var take = Math.min(remaining, layers[k].units);
      cogs += take * layers[k].unitCost;
      remaining -= take;
    }
    var avail = totalsFromLayers(layers);
    return { cogs: round2(cogs), endingInventory: round2(avail.cost - cogs), endingUnits: avail.units - unitsSold };
  }

  function valueWeightedAverage(layers, unitsSold) {
    var avail = totalsFromLayers(layers);
    var avg = avail.units ? avail.cost / avail.units : 0;
    var cogs = round2(unitsSold * avg);
    return {
      cogs: cogs,
      endingInventory: round2(avail.cost - cogs),
      endingUnits: avail.units - unitsSold,
      avgUnitCost: round4(avg)
    };
  }

  /* Compare all three methods side-by-side */
  function valuationComparison(layers, unitsSold) {
    var avail = totalsFromLayers(layers);
    return {
      unitsAvailable: avail.units,
      costAvailable: avail.cost,
      unitsSold: unitsSold,
      fifo: valueFifo(layers, unitsSold),
      lifo: valueLifo(layers, unitsSold),
      weightedAverage: valueWeightedAverage(layers, unitsSold)
    };
  }

  /* ---------------------------------------------------------------------------
   * COST-FLOW ROLL-FORWARD  (RM -> WIP -> FG -> COGS)
   * input = {
   *   beginRM, purchasesRM, endRM,
   *   directLabor, appliedOverhead,
   *   beginWIP, endWIP,
   *   beginFG, endFG,
   *   actualOverhead   // for over/under-applied adjustment
   * }
   * ------------------------------------------------------------------------- */
  function costFlow(i) {
    var directMaterialsUsed = round2(i.beginRM + i.purchasesRM - i.endRM);
    var totalManufacturingCost = round2(directMaterialsUsed + i.directLabor + i.appliedOverhead);
    var costOfGoodsManufactured = round2(i.beginWIP + totalManufacturingCost - i.endWIP);
    var unadjustedCOGS = round2(i.beginFG + costOfGoodsManufactured - i.endFG);

    // over/under-applied overhead: positive = UNDER-applied (actual > applied) -> increases COGS
    var overUnderApplied = round2((i.actualOverhead || 0) - i.appliedOverhead);
    var adjustedCOGS = round2(unadjustedCOGS + overUnderApplied);

    return {
      directMaterialsUsed: directMaterialsUsed,
      totalManufacturingCost: totalManufacturingCost,
      costOfGoodsManufactured: costOfGoodsManufactured,
      unadjustedCOGS: unadjustedCOGS,
      overUnderApplied: overUnderApplied,
      overUnderLabel: overUnderApplied > 0.005 ? 'underapplied'
        : overUnderApplied < -0.005 ? 'overapplied' : 'balanced',
      adjustedCOGS: adjustedCOGS
    };
  }

  /* ---------------------------------------------------------------------------
   * OVERHEAD ABSORPTION
   * predeterminedRate * actualActivity = applied; compare to actual overhead.
   * ------------------------------------------------------------------------- */
  function overheadAbsorption(predeterminedRate, actualActivity, actualOverhead) {
    var applied = round2(predeterminedRate * actualActivity);
    var variance = round2(actualOverhead - applied); // positive = underapplied
    return {
      applied: applied,
      actual: round2(actualOverhead),
      variance: variance,
      label: variance > 0.005 ? 'underapplied' : variance < -0.005 ? 'overapplied' : 'balanced',
      absorptionRatePct: actualOverhead ? round4((applied / actualOverhead) * 100) : 0
    };
  }

  var api = {
    valueFifo: valueFifo,
    valueLifo: valueLifo,
    valueWeightedAverage: valueWeightedAverage,
    valuationComparison: valuationComparison,
    costFlow: costFlow,
    overheadAbsorption: overheadAbsorption
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { (root.CACC = root.CACC || {}).InventoryEngine = api; }
})(typeof window !== 'undefined' ? window : this);
