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

    /* ---- Multi-plant group (Keystone Industrial Group) ---- */
    nameField: function (field) { return { sku: 'productName', plantId: 'plantName', customerId: 'customerName' }[field] || null; },
    facts: function () { return d().facts || []; },
    filtered: function (extra) {
      var f = Object.assign({}, CACC.store.getFilter(), extra || {});
      return CACC.CubeEngine.filterFacts(d().facts || [], f);
    },
    execKpis: function () { return CACC.CubeEngine.kpis(model.filtered()); },
    plantScorecard: function () {
      var f = CACC.store.getFilter();
      var rows = CACC.CubeEngine.filterFacts(d().facts || [], { period: f.period, plantId: 'ALL' });
      var groups = CACC.CubeEngine.groupBy(rows, 'plantId', 'plantName');
      var plantMap = {}; (d().plants || []).forEach(function (p) { plantMap[p.id] = p; });
      groups.forEach(function (g) { g.capacity = plantMap[g.key] ? plantMap[g.key].capacity : null; g.location = plantMap[g.key] ? plantMap[g.key].location : ''; });
      return groups.sort(function (a, b) { return b.revenue - a.revenue; });
    },
    revenueSeries: function () {
      var f = CACC.store.getFilter();
      var rows = CACC.CubeEngine.filterFacts(d().facts || [], { plantId: f.plantId });
      return { revenue: CACC.CubeEngine.series(rows, d().periods, 'revenue'), grossProfit: CACC.CubeEngine.series(rows, d().periods, 'grossProfit') };
    },
    topCustomers: function (n) { return CACC.CubeEngine.topN(model.filtered(), 'customerId', 'customerName', 'grossProfit', n || 6); },
    cube: function (rowField, colField, measure) {
      return CACC.CubeEngine.pivot(model.filtered(), rowField, model.nameField(rowField), colField, model.nameField(colField), measure);
    },
    filteredTxns: function () {
      var f = CACC.store.getFilter();
      return (d().transactions || []).filter(function (t) { return (f.plantId === 'ALL' || t.plantId === f.plantId) && (f.period === 'ALL' || t.date === f.period); });
    },
    filteredLedger: function () {
      var f = CACC.store.getFilter();
      return (d().ledger || []).filter(function (t) { return (f.plantId === 'ALL' || t.plantId === f.plantId) && (f.period === 'ALL' || t.date === f.period); });
    },
    filteredBudget: function () {
      var f = CACC.store.getFilter();
      return (d().budget || []).filter(function (t) { return (f.plantId === 'ALL' || t.plantId === f.plantId) && (f.period === 'ALL' || t.period === f.period); });
    },
    budgetByCategory: function () {
      var rows = model.filteredBudget(), map = {};
      rows.forEach(function (r) {
        if (!map[r.category]) map[r.category] = { category: r.category, budget: 0, actual: 0 };
        map[r.category].budget += r.budget; map[r.category].actual += r.actual;
      });
      return Object.keys(map).map(function (k) {
        var x = map[k]; x.budget = r2(x.budget); x.actual = r2(x.actual);
        x.variance = r2(x.actual - x.budget); x.variancePct = x.budget ? r4(x.variance / x.budget) : 0;
        return x;
      });
    },
    /* ---- Procurement (Supply Chain) ---- */
    filteredPOs: function () {
      var f = CACC.store.getFilter();
      return (d().purchaseOrders || []).filter(function (p) { return (f.plantId === 'ALL' || p.plantId === f.plantId) && (f.period === 'ALL' || p.date === f.period); });
    },
    supplierSpend: function () {
      var rows = model.filteredPOs(), map = {};
      rows.forEach(function (p) { if (!map[p.supplierId]) map[p.supplierId] = { id: p.supplierId, name: p.supplier, amount: 0, orders: 0, openAmount: 0 }; map[p.supplierId].amount += p.amount; map[p.supplierId].orders += 1; if (p.status === 'Open') map[p.supplierId].openAmount += p.amount; });
      return Object.keys(map).map(function (k) { var s = map[k]; s.amount = r2(s.amount); s.openAmount = r2(s.openAmount); return s; }).sort(function (a, b) { return b.amount - a.amount; });
    },
    procurementTotals: function () {
      var rows = model.filteredPOs();
      var total = rows.reduce(function (s, p) { return s + p.amount; }, 0);
      var open = rows.filter(function (p) { return p.status === 'Open'; });
      return { total: r2(total), orders: rows.length, openCount: open.length, openValue: r2(open.reduce(function (s, p) { return s + p.amount; }, 0)), suppliers: model.supplierSpend().length };
    },

    /* ---- Project Operations ---- */
    projects: function () {
      var f = CACC.store.getFilter();
      return (d().projects || []).filter(function (p) { return f.plantId === 'ALL' || p.plantId === f.plantId; });
    },
    projectTotals: function () {
      var rows = model.projects();
      var t = rows.reduce(function (a, p) { a.budget += p.budget; a.actualCost += p.actualCost; a.billed += p.billed; a.margin += p.margin; return a; }, { budget: 0, actualCost: 0, billed: 0, margin: 0 });
      Object.keys(t).forEach(function (k) { t[k] = r2(t[k]); });
      t.count = rows.length; t.marginPct = t.billed ? r4(t.margin / t.billed) : 0;
      t.atRisk = rows.filter(function (p) { return p.margin < 0 || p.actualCost > p.budget; }).length;
      return t;
    },

    /* ---- Finance: P&L from facts + SG&A from budget ---- */
    financials: function () {
      var facts = model.filtered();
      var k = CACC.CubeEngine.kpis(facts);
      var sgaRows = model.filteredBudget().filter(function (b) { return b.category === 'SG&A'; });
      var sga = r2(sgaRows.reduce(function (s, b) { return s + b.actual; }, 0));
      var sgaByPlant = {}; sgaRows.forEach(function (b) { sgaByPlant[b.plantId] = (sgaByPlant[b.plantId] || 0) + b.actual; });
      var byPlant = CACC.CubeEngine.groupBy(facts, 'plantId', 'plantName').map(function (g) {
        var s = r2(sgaByPlant[g.key] || 0), op = r2(g.grossProfit - s);
        return { plantId: g.key, name: g.name, revenue: g.revenue, cogs: g.actualCost, grossProfit: g.grossProfit, sga: s, operating: op, opMarginPct: g.revenue ? r4(op / g.revenue) : 0 };
      }).sort(function (a, b) { return b.revenue - a.revenue; });
      var operating = r2(k.grossProfit - sga);
      return { revenue: k.revenue, cogs: k.actualCost, grossProfit: k.grossProfit, grossMarginPct: k.marginPct,
        sga: sga, operating: operating, opMarginPct: k.revenue ? r4(operating / k.revenue) : 0, netVariance: k.netVariance, byPlant: byPlant };
    },

    /* ---- HR: workforce ---- */
    filteredWorkforce: function () {
      var f = CACC.store.getFilter();
      return (d().workforce || []).filter(function (w) { return (f.plantId === 'ALL' || w.plantId === f.plantId) && (f.period === 'ALL' || w.period === f.period); });
    },
    workforceByPlant: function () {
      var rows = model.filteredWorkforce(), map = {};
      rows.forEach(function (w) {
        if (!map[w.plantId]) map[w.plantId] = { plantId: w.plantId, name: w.plantName, headcount: 0, directLabor: 0, indirectLabor: 0, laborCost: 0, _ot: 0, _to: 0, _n: 0 };
        var m = map[w.plantId]; m.headcount += w.headcount; m.directLabor += w.directLabor; m.indirectLabor += w.indirectLabor; m.laborCost += w.laborCost; m._ot += w.overtimePct; m._to += w.turnoverPct; m._n += 1;
      });
      return Object.keys(map).map(function (k) {
        var m = map[k]; m.laborCost = r2(m.laborCost); m.overtimePct = m._n ? r4(m._ot / m._n) : 0; m.turnoverPct = m._n ? r4(m._to / m._n) : 0;
        m.costPerHead = m.headcount ? r2(m.laborCost / (m.headcount / (m._n || 1))) : 0; delete m._ot; delete m._to; return m;
      }).sort(function (a, b) { return b.laborCost - a.laborCost; });
    },
    workforceTotals: function () {
      var rows = model.filteredWorkforce(), n = rows.length || 1;
      var head = rows.reduce(function (s, w) { return s + w.headcount; }, 0);
      var cost = rows.reduce(function (s, w) { return s + w.laborCost; }, 0);
      var periods = {}; rows.forEach(function (w) { periods[w.period] = 1; }); var np = Object.keys(periods).length || 1;
      return { headcount: Math.round(head / np), laborCost: r2(cost), avgWage: r2(rows.reduce(function (s, w) { return s + w.avgWage; }, 0) / n),
        overtimePct: r4(rows.reduce(function (s, w) { return s + w.overtimePct; }, 0) / n), turnoverPct: r4(rows.reduce(function (s, w) { return s + w.turnoverPct; }, 0) / n),
        costPerHead: head ? r2(cost / head) : 0 };
    },

    /* ---- Supply Chain: warehouse on-hand from the subledger ---- */
    warehouse: function () {
      var f = CACC.store.getFilter();
      var txns = (d().transactions || []).filter(function (t) { return f.plantId === 'ALL' || t.plantId === f.plantId; });
      var map = {};
      txns.forEach(function (t) {
        var key = t.plantId + t.sku;
        if (!map[key]) map[key] = { plantId: t.plantId, plantName: t.plantName, sku: t.sku, productName: t.productName, qty: 0, lastCost: t.unitCost };
        map[key].qty += t.qty; map[key].lastCost = t.unitCost;
      });
      var rows = Object.keys(map).map(function (k) {
        var x = map[k]; x.qty = Math.round(x.qty); x.value = r2(Math.max(0, x.qty) * x.lastCost);
        x.bin = 'A' + (x.sku.charCodeAt(0) % 9 + 1) + '-' + (x.sku.charCodeAt(3) % 20 + 1);
        x.status = x.qty <= 0 ? 'Stockout' : x.qty < 200 ? 'Low' : 'In stock';
        return x;
      }).sort(function (a, b) { return b.value - a.value; });
      return { rows: rows, totalValue: r2(rows.reduce(function (s, r) { return s + r.value; }, 0)), skus: rows.length,
        low: rows.filter(function (r) { return r.status !== 'In stock'; }).length };
    },

    filterLabel: function () {
      var f = CACC.store.getFilter();
      var p = (d().plants || []).filter(function (x) { return x.id === f.plantId; })[0];
      return (p ? p.name : 'All Plants') + ' · ' + (f.period === 'ALL' ? 'All Periods' : f.period);
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
      executive: function () {
        return { group: d().group, filter: model.filterLabel(), kpis: model.execKpis(),
          plants: model.plantScorecard(), topCustomers: model.topCustomers(5) };
      },
      budget: function () { return { group: d().group, filter: model.filterLabel(), categories: model.budgetByCategory() }; },
      procurement: function () { return { group: d().group, filter: model.filterLabel(), totals: model.procurementTotals(), suppliers: model.supplierSpend() }; },
      projects: function () { return { group: d().group, filter: model.filterLabel(), totals: model.projectTotals(), projects: model.projects() }; },
      financials: function () { return { group: d().group, filter: model.filterLabel(), pl: model.financials() }; },
      workforce: function () { return { group: d().group, filter: model.filterLabel(), totals: model.workforceTotals(), byPlant: model.workforceByPlant() }; },
      warehouse: function () { return { group: d().group, filter: model.filterLabel(), warehouse: model.warehouse() }; },
      profitabilityCube: function () {
        return { group: d().group, filter: model.filterLabel(), kpis: model.execKpis(), topCustomers: model.topCustomers(5),
          byProduct: CACC.CubeEngine.groupBy(model.filtered(), 'sku', 'productName').sort(function (a, b) { return b.grossProfit - a.grossProfit; }) };
      },
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
