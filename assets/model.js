/* Derived model — runs the pure engines over the current scenario data.
 * Single place that maps stored data -> engine inputs, reused by every view
 * and by the AI insight context.
 */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});

  function d() { return CACC.store.data(); }

  var model = {
    variance: function () { return CACC.VarianceEngine.computeAll(d().standardCosting); },
    job: function () { return CACC.ProductCostingEngine.jobOrderCost(d().jobOrder); },
    process: function () { return CACC.ProductCostingEngine.processCosting(d().process); },
    abc: function () {
      var a = d().abc;
      return CACC.ProductCostingEngine.activityBasedCosting(a.pools, a.products, a.traditionalBase);
    },
    valuation: function () {
      var inv = d().inventory;
      return CACC.InventoryEngine.valuationComparison(inv.layers, inv.unitsSold);
    },
    costFlow: function () { return CACC.InventoryEngine.costFlow(d().inventory.costFlow); },
    absorption: function () {
      var ab = d().inventory.absorption;
      return CACC.InventoryEngine.overheadAbsorption(ab.predeterminedRate, ab.actualActivity, ab.actualOverhead);
    },
    cvpSingle: function () { return CACC.CvpEngine.singleProduct(d().cvp.single); },
    cvpMulti: function () {
      var m = d().cvp.multi;
      return CACC.CvpEngine.multiProductBreakEven(m.products, m.fixedCost);
    },

    /* Diagnostic metrics derived from the engines + a couple of seed inputs */
    diagnosticMetrics: function () {
      var v = model.variance();
      var abc = model.abc();
      var ab = model.absorption();
      var maxDistortion = Math.max.apply(null, abc.products.map(function (p) {
        return p.abcUnitCost ? Math.abs(p.unitDistortion) / p.abcUnitCost : 0;
      }));
      return {
        totalVariancePct: v.totals.standardCost ? Math.abs(v.totals.totalVariance) / v.totals.standardCost : 0,
        overheadAbsorbedPct: ab.applied ? Math.abs(ab.variance) / ab.applied : 0,
        grossMarginPct: d().diagnostic.grossMarginPct,
        costingDistortionPct: maxDistortion,
        inventoryAccuracyPct: d().diagnostic.inventoryAccuracyPct
      };
    },
    diagnostic: function () { return CACC.DiagnosticEngine.assess(model.diagnosticMetrics()); },

    /* Context bundles for the AI insight generator */
    ctx: {
      dashboard: function () {
        var v = model.variance(), val = model.valuation(), ab = model.absorption(), dg = model.diagnostic();
        var ops = d().operations;
        var groups = [
          { label: 'material', amount: v.material.total }, { label: 'labor', amount: v.labor.total },
          { label: 'variable overhead', amount: v.varOH.total }, { label: 'fixed overhead', amount: v.fixedOH.total }
        ].sort(function (a, b) { return Math.abs(b.amount) - Math.abs(a.amount); });
        return {
          company: d().company, variance: v, grossMarginPct: d().diagnostic.grossMarginPct,
          capacityPct: ops.availableMachineHours ? (ops.actualMachineHours / ops.availableMachineHours) * 100 : 0,
          inventoryValue: val.fifo.endingInventory, absorption: ab, diagnostic: dg, topDriver: groups[0]
        };
      },
      standardCosting: function () {
        return { company: d().company, productName: d().standardCosting.productName, result: model.variance() };
      },
      productCosting: function () {
        return {
          company: d().company, jobName: d().jobOrder.jobName, deptName: d().process.departmentName,
          job: model.job(), process: model.process(), abc: model.abc()
        };
      },
      inventory: function () {
        return { company: d().company, valuation: model.valuation(), flow: model.costFlow(), absorption: model.absorption() };
      },
      cvp: function () {
        return {
          company: d().company, productName: d().cvp.single.productName, single: model.cvpSingle(),
          actualUnits: d().cvp.single.actualUnits, targetProfit: d().cvp.single.targetProfit,
          multiWeightedCm: model.cvpMulti().weightedAvgCm, multiBreakEven: model.cvpMulti().breakEvenPackages
        };
      },
      diagnostic: function () { return { company: d().company, diagnostic: model.diagnostic() }; }
    }
  };

  CACC.model = model;
})(typeof window !== 'undefined' ? window : this);
