/* Derived model — runs the pure engines over the current scenario data.
 * Single place that maps stored data -> engine inputs, reused by every view
 * and by the AI insight context.
 */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});

  function d() { return CACC.store.data(); }
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function r4(n) { return Math.round((n + Number.EPSILON) * 10000) / 10000; }

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
    reserve: function () { return CACC.InventoryReserveEngine.analyzePortfolio(d().items, d().reservePolicy); },
    bomRollup: function (item) {
      var lines = (item.bom || []).map(function (c) {
        return { sku: c.sku, description: c.description, qty: c.qty, unitCost: c.unitCost, extended: Math.round(c.qty * c.unitCost * 100) / 100 };
      });
      var total = Math.round(lines.reduce(function (s, l) { return s + l.extended; }, 0) * 100) / 100;
      return { lines: lines, total: total };
    },
    journal: function () { return CACC.JournalEntriesEngine.build(d().standardCosting, model.reserve().totals.combinedReserve); },
    history: function () { return d().history || []; },

    /* Capacity & overhead absorption analysis */
    capacity: function () {
      var sc = d().standardCosting, ops = d().operations, v = model.variance(), ab = model.absorption();
      var util = ops.availableMachineHours ? ops.actualMachineHours / ops.availableMachineHours : 0;
      var idleHours = Math.max(0, ops.availableMachineHours - ops.actualMachineHours);
      var appliedOH = r2((sc.standardVarRate + sc.standardFixedRate) * sc.standardHours);
      var actualOH = r2(sc.actualVOH + sc.actualFOH);
      return {
        availableHours: ops.availableMachineHours, actualHours: ops.actualMachineHours, idleHours: idleHours,
        utilization: r4(util), fixedRate: sc.standardFixedRate, idleCapacityCost: r2(idleHours * sc.standardFixedRate),
        appliedOH: appliedOH, actualOH: actualOH, overUnder: r2(actualOH - appliedOH),
        varOhSpending: v.varOH.spending, varOhEfficiency: v.varOH.efficiency,
        fixedOhBudget: v.fixedOH.budget, fixedOhVolume: v.fixedOH.volume, absorption: ab
      };
    },

    /* Profitability by finished-goods product */
    profitability: function () {
      var fg = d().items.filter(function (it) { return it.type === 'fg'; });
      var rows = fg.map(function (it) {
        var unitMargin = r2(it.sellingPrice - (it.costToSell || 0) - it.unitCost);
        return {
          sku: it.sku, description: it.description, price: it.sellingPrice, unitCost: it.unitCost, costToSell: it.costToSell || 0,
          unitMargin: unitMargin, marginPct: it.sellingPrice ? r4(unitMargin / it.sellingPrice) : 0,
          annualDemand: it.annualDemand, annualRevenue: r2(it.sellingPrice * it.annualDemand), annualMargin: r2(unitMargin * it.annualDemand)
        };
      }).sort(function (a, b) { return b.annualMargin - a.annualMargin; });
      var totals = rows.reduce(function (a, p) { a.annualRevenue += p.annualRevenue; a.annualMargin += p.annualMargin; return a; }, { annualRevenue: 0, annualMargin: 0 });
      totals.annualRevenue = r2(totals.annualRevenue); totals.annualMargin = r2(totals.annualMargin);
      totals.marginPct = totals.annualRevenue ? r4(totals.annualMargin / totals.annualRevenue) : 0;
      return { products: rows, totals: totals };
    },

    /* Cross-module alerts derived from the engines (drives dashboard alert panel) */
    alerts: function () {
      var out = [];
      var v = model.variance(), res = model.reserve(), cvp = model.cvpSingle(), ab = model.absorption(), dg = model.diagnostic();
      var ops = d().operations;
      var varPct = v.totals.standardCost ? Math.abs(v.totals.totalVariance) / v.totals.standardCost : 0;
      if (v.totals.totalVariance > 0 && varPct > 0.03)
        out.push({ level: varPct > 0.06 ? 'High' : 'Medium', area: 'Standard Costing', key: 'standardCosting',
          text: 'Unfavorable total variance of ' + CACC.fmt.money0(v.totals.totalVariance) + ' (' + CACC.fmt.pct(varPct * 100) + ' of standard).' });
      if (res.totals.reservePct > 0.15)
        out.push({ level: res.totals.reservePct > 0.20 ? 'High' : 'Medium', area: 'Inventory Reserve', key: 'inventoryReserve',
          text: CACC.fmt.money0(res.totals.combinedReserve) + ' reserve on ' + res.totals.itemsReserved + ' SKUs (' + CACC.fmt.pct(res.totals.reservePct * 100) + ' of gross).' });
      if (cvp.marginOfSafety.ratio < 0.25)
        out.push({ level: cvp.marginOfSafety.ratio < 0.1 ? 'High' : 'Medium', area: 'CVP', key: 'cvp',
          text: 'Margin of safety is only ' + CACC.fmt.pct(cvp.marginOfSafety.ratio * 100) + ' above break-even.' });
      if (Math.abs(ab.variance) / (ab.applied || 1) > 0.05)
        out.push({ level: 'Medium', area: 'Overhead', key: 'inventory',
          text: 'Overhead ' + ab.label + ' by ' + CACC.fmt.money0(Math.abs(ab.variance)) + ' (' + CACC.fmt.pct(Math.abs(ab.variance) / ab.applied * 100) + ').' });
      var cap = ops.availableMachineHours ? ops.actualMachineHours / ops.availableMachineHours : 0;
      if (cap < 0.85)
        out.push({ level: 'Info', area: 'Capacity', key: 'productCosting', text: 'Capacity utilization at ' + CACC.fmt.pct(cap * 100) + ' — idle capacity absorbs fixed overhead.' });
      var weak = dg.dimensions.slice().sort(function (a, b) { return a.score - b.score; })[0];
      if (weak && weak.score < 70)
        out.push({ level: weak.score < 50 ? 'High' : 'Medium', area: 'Diagnostic', key: 'diagnostic', text: weak.label + ' scores ' + weak.score + '/100 — see Day-1 Diagnostic.' });
      var order = { High: 0, Medium: 1, Info: 2 };
      out.sort(function (a, b) { return order[a.level] - order[b.level]; });
      return out;
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
      diagnostic: function () { return { company: d().company, diagnostic: model.diagnostic() }; },
      inventoryReserve: function () {
        var r = model.reserve();
        var top = r.items.slice().filter(function (x) { return x.combinedReserve > 0; })
          .sort(function (a, b) { return b.combinedReserve - a.combinedReserve; })[0] || null;
        return { company: d().company, reserve: r, topReserveItem: top };
      },
      itemMaster: function () {
        var r = model.reserve();
        return { company: d().company, itemCount: d().items.length,
          totalGross: r.totals.grossValue, totalNet: r.totals.netValue, reserve: r };
      },
      journal: function () { return { company: d().company, journal: model.journal() }; },
      capacity: function () { return { company: d().company, capacity: model.capacity() }; },
      profitability: function () { return { company: d().company, profitability: model.profitability() }; },
      trends: function () {
        var h = model.history();
        var first = h[0] || {}, last = h[h.length - 1] || {};
        return {
          company: d().company, history: h,
          varianceDelta: (last.totalVariance || 0) - (first.totalVariance || 0),
          marginDelta: (last.grossMarginPct || 0) - (first.grossMarginPct || 0),
          reserveDelta: (last.reservePct || 0) - (first.reservePct || 0)
        };
      }
    }
  };

  CACC.model = model;
})(typeof window !== 'undefined' ? window : this);
