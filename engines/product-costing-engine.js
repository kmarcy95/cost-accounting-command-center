/* Product costing engine — pure functions, no DOM.
 * Three methods: Job-Order, Process (weighted-average), and Activity-Based Costing.
 * All dollar outputs rounded to cents.
 */
(function (root) {
  'use strict';

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function round4(n) { return Math.round((n + Number.EPSILON) * 10000) / 10000; }

  /* ---------------------------------------------------------------------------
   * JOB-ORDER COSTING
   * job = { directMaterials, directLabor, driverQty, pohr, units }
   * pohr = predetermined overhead rate; appliedOverhead = pohr * driverQty
   * ------------------------------------------------------------------------- */
  function jobOrderCost(job) {
    var appliedOverhead = round2(job.pohr * job.driverQty);
    var totalCost = round2(job.directMaterials + job.directLabor + appliedOverhead);
    var unitCost = job.units ? round2(totalCost / job.units) : 0;
    return {
      directMaterials: round2(job.directMaterials),
      directLabor: round2(job.directLabor),
      appliedOverhead: appliedOverhead,
      totalCost: totalCost,
      units: job.units || 0,
      unitCost: unitCost
    };
  }

  /* predeterminedOverheadRate(estimatedOverhead, estimatedDriver) */
  function predeterminedOverheadRate(estimatedOverhead, estimatedDriver) {
    return estimatedDriver ? round4(estimatedOverhead / estimatedDriver) : 0;
  }

  /* ---------------------------------------------------------------------------
   * PROCESS COSTING — weighted-average method
   * input = {
   *   beginningUnits, unitsStarted, completedUnits, endingUnits,
   *   endingPctMaterials, endingPctConversion,
   *   beginningCostMaterials, beginningCostConversion,
   *   addedCostMaterials, addedCostConversion
   * }
   * ------------------------------------------------------------------------- */
  function processCosting(i) {
    var euMaterials = i.completedUnits + i.endingUnits * i.endingPctMaterials;
    var euConversion = i.completedUnits + i.endingUnits * i.endingPctConversion;

    var totalMaterials = i.beginningCostMaterials + i.addedCostMaterials;
    var totalConversion = i.beginningCostConversion + i.addedCostConversion;

    var costPerEuMaterials = euMaterials ? totalMaterials / euMaterials : 0;
    var costPerEuConversion = euConversion ? totalConversion / euConversion : 0;
    var costPerUnit = round4(costPerEuMaterials + costPerEuConversion);

    var costCompleted = round2(i.completedUnits * (costPerEuMaterials + costPerEuConversion));
    var costEndingMaterials = i.endingUnits * i.endingPctMaterials * costPerEuMaterials;
    var costEndingConversion = i.endingUnits * i.endingPctConversion * costPerEuConversion;
    var costEnding = round2(costEndingMaterials + costEndingConversion);

    var totalCostToAccount = round2(totalMaterials + totalConversion);
    var totalCostAssigned = round2(costCompleted + costEnding);

    return {
      equivalentUnits: { materials: round4(euMaterials), conversion: round4(euConversion) },
      costPerEu: {
        materials: round4(costPerEuMaterials),
        conversion: round4(costPerEuConversion),
        total: costPerUnit
      },
      costCompleted: costCompleted,
      costEndingWip: costEnding,
      totalCostToAccount: totalCostToAccount,
      totalCostAssigned: totalCostAssigned,
      reconciles: Math.abs(totalCostToAccount - totalCostAssigned) < 0.05,
      unitsReconcile:
        Math.abs((i.beginningUnits + i.unitsStarted) - (i.completedUnits + i.endingUnits)) < 0.0001
    };
  }

  /* ---------------------------------------------------------------------------
   * ACTIVITY-BASED COSTING
   * pools    = [{ name, cost, driverTotal }]
   * products = [{ name, units, drivers: { poolName: qty }, traditionalDriverQty }]
   * traditionalBase = total driver qty used for the single plant-wide rate
   * ------------------------------------------------------------------------- */
  function activityBasedCosting(pools, products, traditionalBase) {
    var totalOverhead = pools.reduce(function (s, p) { return s + p.cost; }, 0);
    var rates = {};
    pools.forEach(function (p) {
      rates[p.name] = p.driverTotal ? round4(p.cost / p.driverTotal) : 0;
    });

    var traditionalRate = traditionalBase ? round4(totalOverhead / traditionalBase) : 0;

    var lines = products.map(function (prod) {
      var abcCost = 0;
      var breakdown = {};
      pools.forEach(function (p) {
        var qty = (prod.drivers && prod.drivers[p.name]) || 0;
        var c = rates[p.name] * qty;
        breakdown[p.name] = round2(c);
        abcCost += c;
      });
      abcCost = round2(abcCost);
      var traditionalCost = round2(traditionalRate * (prod.traditionalDriverQty || 0));
      var abcUnit = prod.units ? round2(abcCost / prod.units) : 0;
      var tradUnit = prod.units ? round2(traditionalCost / prod.units) : 0;
      return {
        name: prod.name,
        units: prod.units,
        breakdown: breakdown,
        abcCost: abcCost,
        traditionalCost: traditionalCost,
        abcUnitCost: abcUnit,
        traditionalUnitCost: tradUnit,
        // positive distortion => traditional OVER-costs this product vs ABC
        unitDistortion: round2(tradUnit - abcUnit)
      };
    });

    return {
      totalOverhead: round2(totalOverhead),
      activityRates: rates,
      traditionalRate: traditionalRate,
      products: lines
    };
  }

  var api = {
    predeterminedOverheadRate: predeterminedOverheadRate,
    jobOrderCost: jobOrderCost,
    processCosting: processCosting,
    activityBasedCosting: activityBasedCosting
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { (root.CACC = root.CACC || {}).ProductCostingEngine = api; }
})(typeof window !== 'undefined' ? window : this);
