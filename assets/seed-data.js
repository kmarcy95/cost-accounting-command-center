/* Seed dataset — "Stratton Manufacturing Co." (fictional discrete manufacturer of
 * industrial gearboxes). Feeds every module so the app demos instantly.
 * Numbers are chosen to reconcile cleanly through the pure engines.
 */
(function (root) {
  'use strict';

  var SEED = {
    company: {
      name: 'Stratton Manufacturing Co.',
      industry: 'Industrial gearboxes & drivetrain components',
      period: 'June 2026',
      currency: 'USD'
    },

    /* ---- Standard Costing & Variance (flagship product line: GX-200 Gearbox) ---- */
    standardCosting: {
      productName: 'GX-200 Gearbox — monthly production',
      standardPrice: 5.00, standardQty: 3000, actualPrice: 5.20, actualQty: 3200,
      standardRate: 20.00, standardHours: 2000, actualRate: 19.50, actualHours: 2100,
      standardVarRate: 4.00, actualVOH: 8600,
      budgetedFOH: 11000, standardFixedRate: 5.00, actualFOH: 11300
    },

    /* ---- Product Costing ---- */
    jobOrder: {
      jobName: 'Job #GX-4417 — custom drive assembly',
      directMaterials: 12000, directLabor: 8000, driverQty: 200, pohr: 25, units: 100,
      driverLabel: 'machine hours'
    },
    process: {
      departmentName: 'Machining Department',
      beginningUnits: 1000, unitsStarted: 9000, completedUnits: 8000, endingUnits: 2000,
      endingPctMaterials: 1.0, endingPctConversion: 0.5,
      beginningCostMaterials: 4000, beginningCostConversion: 1500,
      addedCostMaterials: 46000, addedCostConversion: 34500
    },
    abc: {
      traditionalBase: 8000,
      traditionalLabel: 'machine hours',
      pools: [
        { name: 'Machine setups', cost: 60000, driverTotal: 300, driverLabel: 'setups' },
        { name: 'Machine hours', cost: 80000, driverTotal: 8000, driverLabel: 'machine hours' },
        { name: 'Inspections', cost: 20000, driverTotal: 400, driverLabel: 'inspections' }
      ],
      products: [
        { name: 'GX-200 (high volume)', units: 1000,
          drivers: { 'Machine setups': 100, 'Machine hours': 3000, 'Inspections': 100 },
          traditionalDriverQty: 3000 },
        { name: 'GX-450 (low volume)', units: 4000,
          drivers: { 'Machine setups': 200, 'Machine hours': 5000, 'Inspections': 300 },
          traditionalDriverQty: 5000 }
      ]
    },

    /* ---- Inventory & Cost Flows ---- */
    inventory: {
      itemName: 'Cast steel housing (RM-1140)',
      layers: [
        { label: 'Beginning inventory', units: 100, unitCost: 10 },
        { label: 'Purchase — Jun 8', units: 200, unitCost: 12 },
        { label: 'Purchase — Jun 22', units: 100, unitCost: 15 }
      ],
      unitsSold: 300,
      costFlow: {
        beginRM: 20000, purchasesRM: 100000, endRM: 15000,
        directLabor: 80000, appliedOverhead: 60000,
        beginWIP: 30000, endWIP: 25000,
        beginFG: 40000, endFG: 35000,
        actualOverhead: 65000
      },
      absorption: { predeterminedRate: 25, actualActivity: 2000, actualOverhead: 54000 }
    },

    /* ---- Item master (drill-down catalog) + multi-item reserve inputs ---- */
    reservePolicy: {
      coverageMonths: 12,
      buckets: [
        { maxDays: 90, pct: 0, label: '0–90 days (current)' },
        { maxDays: 180, pct: 0.25, label: '91–180 days' },
        { maxDays: 365, pct: 0.50, label: '181–365 days' },
        { maxDays: 100000, pct: 1.0, label: 'Over 365 days' }
      ]
    },
    items: [
      { sku: 'GX-200', description: 'GX-200 Industrial Gearbox', category: 'Finished goods', type: 'fg',
        qtyOnHand: 800, unitCost: 145, sellingPrice: 210, costToComplete: 0, costToSell: 12,
        annualDemand: 6000, agingDays: 40,
        bom: [
          { sku: 'RM-1140', description: 'Cast steel housing', qty: 1, unitCost: 42 },
          { sku: 'RM-2210', description: 'Bronze bushing', qty: 4, unitCost: 3.5 },
          { sku: 'RM-3000', description: 'Electronic controller', qty: 1, unitCost: 88 },
          { sku: 'LBR-01', description: 'Assembly labor', qty: 1.5, unitCost: 20 }
        ] },
      { sku: 'GX-450', description: 'GX-450 Heavy-Duty Gearbox', category: 'Finished goods', type: 'fg',
        qtyOnHand: 1500, unitCost: 320, sellingPrice: 360, costToComplete: 5, costToSell: 20,
        annualDemand: 900, agingDays: 200,
        bom: [
          { sku: 'RM-1140', description: 'Cast steel housing', qty: 2, unitCost: 42 },
          { sku: 'RM-2210', description: 'Bronze bushing', qty: 8, unitCost: 3.5 },
          { sku: 'RM-3000', description: 'Electronic controller', qty: 2, unitCost: 88 },
          { sku: 'LBR-01', description: 'Assembly labor', qty: 3, unitCost: 20 }
        ] },
      { sku: 'GX-110', description: 'GX-110 Legacy Gearbox (discontinued)', category: 'Finished goods', type: 'fg',
        qtyOnHand: 300, unitCost: 180, sellingPrice: 120, costToComplete: 0, costToSell: 10,
        annualDemand: 0, agingDays: 420, bom: [] },
      { sku: 'RM-1140', description: 'Cast steel housing', category: 'Raw materials', type: 'raw',
        qtyOnHand: 4000, unitCost: 42, sellingPrice: 38, costToComplete: 0, costToSell: 2,
        annualDemand: 18000, agingDays: 60, bom: [] },
      { sku: 'RM-2210', description: 'Bronze bushing', category: 'Raw materials', type: 'raw',
        qtyOnHand: 9000, unitCost: 3.5, sellingPrice: 4.2, costToComplete: 0, costToSell: 0,
        annualDemand: 5000, agingDays: 95, bom: [] },
      { sku: 'RM-3000', description: 'Electronic controller', category: 'Raw materials', type: 'raw',
        qtyOnHand: 600, unitCost: 88, sellingPrice: 95, costToComplete: 0, costToSell: 0,
        annualDemand: 2400, agingDays: 25, bom: [] }
    ],

    /* ---- CVP & Break-Even ---- */
    cvp: {
      single: { productName: 'GX-200 Gearbox', price: 100, variableCost: 60, fixedCost: 200000, actualUnits: 8000, targetProfit: 50000 },
      multi: {
        fixedCost: 160000,
        products: [
          { name: 'GX-200', cmUnit: 40, mix: 0.6 },
          { name: 'GX-450', cmUnit: 20, mix: 0.4 }
        ]
      }
    },

    /* ---- Diagnostic inputs that aren't derivable from the engines above ---- */
    diagnostic: {
      grossMarginPct: 0.32,
      inventoryAccuracyPct: 0.96
    },

    /* ---- Operations context for dashboard KPIs ---- */
    operations: {
      availableMachineHours: 2400,
      actualMachineHours: 2100
    },

    /* ---- 6-month history for trend/time-series analytics ---- */
    history: [
      { period: 'Jan', totalVariance: 6120, grossMarginPct: 0.291, inventoryNet: 705000, reservePct: 0.224, capacityPct: 0.78, cogs: 271000, unitsSold: 7400 },
      { period: 'Feb', totalVariance: 5780, grossMarginPct: 0.298, inventoryNet: 712000, reservePct: 0.216, capacityPct: 0.80, cogs: 266000, unitsSold: 7550 },
      { period: 'Mar', totalVariance: 5230, grossMarginPct: 0.305, inventoryNet: 718500, reservePct: 0.209, capacityPct: 0.82, cogs: 262000, unitsSold: 7680 },
      { period: 'Apr', totalVariance: 5010, grossMarginPct: 0.311, inventoryNet: 720000, reservePct: 0.205, capacityPct: 0.84, cogs: 259000, unitsSold: 7820 },
      { period: 'May', totalVariance: 4760, grossMarginPct: 0.316, inventoryNet: 722500, reservePct: 0.201, capacityPct: 0.86, cogs: 257000, unitsSold: 7910 },
      { period: 'Jun', totalVariance: 4490, grossMarginPct: 0.320, inventoryNet: 724800, reservePct: 0.197, capacityPct: 0.875, cogs: 255000, unitsSold: 8000 }
    ]
  };

  /* ===================================================================
   * Multi-plant group dimensions + generated fact/transaction/ledger/budget
   * "Keystone Industrial Group" — merged from the Cost Terminal concept.
   * Deterministic (hash-based) so the demo + any tests are stable.
   * =================================================================== */
  SEED.group = 'Keystone Industrial Group';
  SEED.plants = [
    { id: 'SA', name: 'San Antonio Plant', location: 'San Antonio, TX', factor: 1.00, capacity: 0.88 },
    { id: 'RF', name: 'Rockford Plant', location: 'Rockford, IL', factor: 0.85, capacity: 0.82 },
    { id: 'MTY', name: 'Monterrey Plant', location: 'Monterrey, MX', factor: 0.72, capacity: 0.91 },
    { id: 'OKC', name: 'Oklahoma City Plant', location: 'Oklahoma City, OK', factor: 0.58, capacity: 0.76 }
  ];
  SEED.products = [
    { sku: 'VB-100', name: 'Valve Body', price: 420, stdUnitCost: 265, baseVol: 900 },
    { sku: 'PH-200', name: 'Pump Housing', price: 680, stdUnitCost: 430, baseVol: 520 },
    { sku: 'HM-300', name: 'Hydraulic Manifold', price: 1250, stdUnitCost: 835, baseVol: 240 },
    { sku: 'CB-400', name: 'Coupling Block', price: 185, stdUnitCost: 121, baseVol: 1400 }
  ];
  SEED.customers = [
    { id: 'PERM', name: 'Permian Energy', weight: 0.30 },
    { id: 'GULF', name: 'Gulf Coast Marine', weight: 0.22 },
    { id: 'SOON', name: 'Sooner Oilfield', weight: 0.20 },
    { id: 'RIO', name: 'Rio Hydraulics', weight: 0.16 },
    { id: 'SERV', name: 'Servo Mexicana', weight: 0.12 }
  ];
  SEED.periods = ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025'];
  SEED.defaultFilter = { plantId: 'ALL', period: 'May 2025' };

  (function generate() {
    function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function rand(str) { return (hash(str) % 100000) / 100000; }
    function jit(str, lo, hi) { return lo + rand(str) * (hi - lo); }
    function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
    var sumFactor = SEED.plants.reduce(function (s, p) { return s + p.factor; }, 0);

    var facts = [];
    SEED.periods.forEach(function (period, pi) {
      var growth = 1 + pi * 0.025;
      SEED.plants.forEach(function (plant) {
        SEED.products.forEach(function (prod) {
          SEED.customers.forEach(function (cust) {
            var seed = period + plant.id + prod.sku + cust.id;
            var units = Math.round(prod.baseVol * (plant.factor / sumFactor) * cust.weight * growth * jit(seed + 'u', 0.85, 1.15));
            if (units < 1) return;
            var price = r2(prod.price * jit(seed + 'p', 0.97, 1.02));
            var revenue = r2(units * price);
            var stdCost = r2(units * prod.stdUnitCost);
            var varFactor = jit(seed + 'v', -0.03, 0.07) - (plant.factor - 0.75) * 0.04; // efficient plants run favorable
            var actualCost = r2(stdCost * (1 + varFactor));
            var netVariance = r2(actualCost - stdCost);
            facts.push({
              period: period, plantId: plant.id, plantName: plant.name,
              sku: prod.sku, productName: prod.name, customerId: cust.id, customerName: cust.name,
              units: units, revenue: revenue, stdCost: stdCost, actualCost: actualCost,
              grossProfit: r2(revenue - actualCost),
              materialVar: r2(netVariance * 0.55), laborVar: r2(netVariance * 0.25), ohVar: r2(netVariance * 0.20),
              netVariance: netVariance, invValue: r2(stdCost * jit(seed + 'i', 0.25, 0.5))
            });
          });
        });
      });
    });
    SEED.facts = facts;

    // Inventory subledger — receipts/issues/adjustments per plant x product x period
    var txns = [], tid = 1000;
    SEED.periods.forEach(function (period, pi) {
      SEED.plants.forEach(function (plant) {
        SEED.products.forEach(function (prod) {
          var seed = period + plant.id + prod.sku;
          var recQty = Math.round(prod.baseVol * (plant.factor / sumFactor) * jit(seed + 'r', 0.9, 1.2));
          var issQty = Math.round(recQty * jit(seed + 'x', 0.8, 1.05));
          var uc = r2(prod.stdUnitCost * jit(seed + 'c', 0.97, 1.04));
          txns.push({ id: 'TX-' + (tid++), date: period, plantId: plant.id, plantName: plant.name, sku: prod.sku, productName: prod.name, type: 'Receipt', qty: recQty, unitCost: uc, value: r2(recQty * uc) });
          txns.push({ id: 'TX-' + (tid++), date: period, plantId: plant.id, plantName: plant.name, sku: prod.sku, productName: prod.name, type: 'Issue', qty: -issQty, unitCost: uc, value: r2(-issQty * uc) });
          if (rand(seed + 'a') > 0.7) {
            var adj = (rand(seed + 'aq') > 0.5 ? 1 : -1) * Math.round(jit(seed + 'aq2', 2, 18));
            txns.push({ id: 'TX-' + (tid++), date: period, plantId: plant.id, plantName: plant.name, sku: prod.sku, productName: prod.name, type: 'Adjustment', qty: adj, unitCost: uc, value: r2(adj * uc) });
          }
        });
      });
    });
    SEED.transactions = txns;

    // Cost ledger — GL-style entries per plant x period (aggregated from facts)
    var ledger = [], jid = 5000;
    SEED.periods.forEach(function (period) {
      SEED.plants.forEach(function (plant) {
        var rows = facts.filter(function (f) { return f.period === period && f.plantId === plant.id; });
        if (!rows.length) return;
        var rev = r2(rows.reduce(function (s, r) { return s + r.revenue; }, 0));
        var std = r2(rows.reduce(function (s, r) { return s + r.stdCost; }, 0));
        var mvar = r2(rows.reduce(function (s, r) { return s + r.materialVar; }, 0));
        var lvar = r2(rows.reduce(function (s, r) { return s + r.laborVar; }, 0));
        var ovar = r2(rows.reduce(function (s, r) { return s + r.ohVar; }, 0));
        function L(account, debit, credit, ref) { ledger.push({ id: 'GL-' + (jid++), date: period, plantId: plant.id, plantName: plant.name, account: account, debit: r2(debit), credit: r2(credit), ref: ref }); }
        L('Cost of Goods Sold', std, 0, 'COGS');
        L('Finished Goods Inventory', 0, std, 'COGS');
        L('Material Price/Usage Variance', mvar > 0 ? mvar : 0, mvar < 0 ? -mvar : 0, 'VAR-M');
        L('Labor Rate/Efficiency Variance', lvar > 0 ? lvar : 0, lvar < 0 ? -lvar : 0, 'VAR-L');
        L('Overhead Variance', ovar > 0 ? ovar : 0, ovar < 0 ? -ovar : 0, 'VAR-O');
        L('Accounts Receivable', rev, 0, 'SALE');
        L('Sales Revenue', 0, rev, 'SALE');
      });
    });
    SEED.ledger = ledger;

    // Budget vs actual — per plant x period x category
    var cats = ['Direct Material', 'Direct Labor', 'Manufacturing Overhead', 'SG&A'];
    var budget = [];
    SEED.periods.forEach(function (period) {
      SEED.plants.forEach(function (plant) {
        var rows = facts.filter(function (f) { return f.period === period && f.plantId === plant.id; });
        var actualCost = rows.reduce(function (s, r) { return s + r.actualCost; }, 0);
        var rev = rows.reduce(function (s, r) { return s + r.revenue; }, 0);
        var split = { 'Direct Material': 0.50, 'Direct Labor': 0.22, 'Manufacturing Overhead': 0.28 };
        cats.forEach(function (cat) {
          var actual, bud, seed = period + plant.id + cat;
          if (cat === 'SG&A') { actual = r2(rev * jit(seed, 0.08, 0.12)); bud = r2(actual * jit(seed + 'b', 0.94, 1.04)); }
          else { actual = r2(actualCost * split[cat]); bud = r2(actual * jit(seed + 'b', 0.95, 1.05)); }
          budget.push({ period: period, plantId: plant.id, plantName: plant.name, category: cat, budget: bud, actual: actual });
        });
      });
    });
    SEED.budget = budget;
  })();

  if (typeof module !== 'undefined' && module.exports) { module.exports = SEED; }
  else { (root.CACC = root.CACC || {}).SEED = SEED; }
})(typeof window !== 'undefined' ? window : this);
