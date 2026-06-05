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

    // Procurement (Supply Chain) — suppliers + purchase orders
    var supplierNames = ['Texas Steel Co', 'Borderland Castings', 'Gulf Metals Supply', 'Apex Components', 'Precision Forgings', 'Rio Grande Alloys'];
    SEED.suppliers = supplierNames.map(function (n, i) { return { id: 'SUP-' + (i + 1), name: n, category: i % 2 ? 'Castings & forgings' : 'Raw metals' }; });
    var pos = [], pid = 8000;
    SEED.periods.forEach(function (period, pi) {
      SEED.plants.forEach(function (plant) {
        SEED.products.forEach(function (prod) {
          var seed = period + plant.id + prod.sku + 'po';
          var sup = SEED.suppliers[hash(seed) % SEED.suppliers.length];
          var qty = Math.round(prod.baseVol * (plant.factor / sumFactor) * jit(seed + 'q', 0.7, 1.1));
          if (qty < 1) return;
          var uc = r2(prod.stdUnitCost * 0.55 * jit(seed + 'c', 0.95, 1.08));
          var status = pi === SEED.periods.length - 1 ? (rand(seed + 's') > 0.5 ? 'Open' : 'Received') : (rand(seed + 's') > 0.3 ? 'Closed' : 'Received');
          pos.push({ id: 'PO-' + (pid++), date: period, plantId: plant.id, plantName: plant.name, supplierId: sup.id, supplier: sup.name, sku: prod.sku, productName: prod.name, qty: qty, unitCost: uc, amount: r2(qty * uc), status: status });
        });
      });
    });
    SEED.purchaseOrders = pos;

    // Project Operations — projects with budget / actual / billing / completion
    var projDefs = [
      ['Permian Pumping Upgrade', 'PERM', 'SA'], ['Gulf Marine Retrofit', 'GULF', 'RF'], ['Sooner Field Automation', 'SOON', 'OKC'],
      ['Rio Hydraulics Expansion', 'RIO', 'MTY'], ['Servo Line Tooling', 'SERV', 'MTY'], ['Permian Phase II', 'PERM', 'SA'],
      ['Gulf Coast Overhaul', 'GULF', 'RF'], ['OKC Plant Modernization', 'SOON', 'OKC']
    ];
    SEED.projects = projDefs.map(function (p, i) {
      var seed = 'proj' + i;
      var budget = r2(jit(seed + 'b', 180000, 1200000));
      var pct = Math.round(jit(seed + 'p', 0.2, 1.0) * 100) / 100;
      var actual = r2(budget * pct * jit(seed + 'a', 0.92, 1.18));
      var billed = r2(actual * jit(seed + 'bi', 0.85, 1.12));
      var status = pct >= 1 ? 'Complete' : pct < 0.35 ? 'Planning' : 'In progress';
      var cust = SEED.customers.filter(function (c) { return c.id === p[1]; })[0];
      var plant = SEED.plants.filter(function (pl) { return pl.id === p[2]; })[0];
      return { id: 'PRJ-' + (1001 + i), name: p[0], customerId: p[1], customer: cust ? cust.name : p[1], plantId: p[2], plantName: plant ? plant.name : p[2],
        budget: budget, actualCost: actual, billed: billed, pctComplete: pct, status: status, margin: r2(billed - actual) };
    });

    // Human Resources — workforce per plant x period
    var wf = [];
    SEED.periods.forEach(function (period) {
      SEED.plants.forEach(function (plant) {
        var seed = 'wf' + period + plant.id;
        var head = Math.round(plant.factor * 480 * jit(seed + 'h', 0.95, 1.06));
        var direct = Math.round(head * 0.68);
        var avgWage = r2(jit(seed + 'w', 26, 34));
        wf.push({ period: period, plantId: plant.id, plantName: plant.name, headcount: head, directLabor: direct, indirectLabor: head - direct,
          avgWage: avgWage, laborCost: r2(head * avgWage * 173 * jit(seed + 'c', 0.98, 1.05)),
          overtimePct: Math.round(jit(seed + 'o', 0.03, 0.14) * 10000) / 10000, turnoverPct: Math.round(jit(seed + 't', 0.01, 0.06) * 10000) / 10000 });
      });
    });
    SEED.workforce = wf;

    // Sales orders — one per fact row (period x plant x product x customer)
    var sos = [], sid = 9000;
    facts.forEach(function (fct) {
      var seed = 'so' + fct.period + fct.plantId + fct.sku + fct.customerId;
      var pi = SEED.periods.indexOf(fct.period);
      var status = pi === SEED.periods.length - 1 ? (rand(seed) > 0.5 ? 'Open' : 'Shipped') : 'Invoiced';
      sos.push({ id: 'SO-' + (sid++), date: fct.period, plantId: fct.plantId, plantName: fct.plantName, customerId: fct.customerId, customer: fct.customerName,
        sku: fct.sku, productName: fct.productName, qty: fct.units, price: r2(fct.revenue / (fct.units || 1)), amount: fct.revenue, margin: fct.grossProfit, status: status });
    });
    SEED.salesOrders = sos;

    // Project Operations — WBS tasks, time-phased estimates, resources per project
    SEED.projectStages = ['New', 'Quote', 'Plan', 'Deliver', 'Complete', 'Close'];
    var roleRates = { 'Project Manager': 95, 'Consulting Lead': 110, 'Engineer': 85, 'Technician': 60, 'Analyst': 70 };
    var roles = Object.keys(roleRates);
    var taskNames = ['Discovery & design', 'Build & configure', 'Integration', 'Testing & UAT', 'Deployment', 'Documentation'];
    SEED.projects.forEach(function (proj) {
      proj.stageIndex = proj.status === 'Complete' ? 4 : proj.status === 'Planning' ? 2 : 3;
      var nTasks = 3 + Math.round(jit('t' + proj.id, 0, 3));
      var tasks = [];
      for (var k = 0; k < nTasks; k++) {
        var seed = proj.id + 'task' + k, role = roles[hash(seed) % roles.length], rate = roleRates[role];
        var estHours = Math.round(jit(seed + 'h', 80, 600) / 8) * 8;
        var pct = Math.min(1, proj.pctComplete * jit(seed + 'p', 0.7, 1.2));
        var actualHours = Math.round(estHours * pct);
        var span = 1 + Math.round(jit(seed + 's', 0, SEED.periods.length - 1)), per = Math.round(estHours / span), ph = {};
        for (var pidx = 0; pidx < span; pidx++) ph[SEED.periods[pidx]] = per;
        tasks.push({ id: proj.id + '-T' + (k + 1), wbs: (k + 1) + '.0', name: taskNames[k % taskNames.length], role: role, rate: rate,
          estHours: estHours, actualHours: actualHours, estCost: r2(estHours * rate), actualCost: r2(actualHours * rate * jit(seed + 'c', 0.95, 1.1)),
          pctComplete: Math.round(pct * 100) / 100, periodHours: ph });
      }
      proj.tasks = tasks;
      var byRole = {};
      tasks.forEach(function (t) { if (!byRole[t.role]) byRole[t.role] = { role: t.role, rate: t.rate, hours: 0, cost: 0 }; byRole[t.role].hours += t.estHours; byRole[t.role].cost += t.estCost; });
      proj.resources = Object.keys(byRole).map(function (r) { return byRole[r]; });
    });

    // Resource pool + schedule-board bookings
    var resDefs = [['Ryan Brim', 'Engineer', 'SA'], ['Abraham McCoy', 'Technician', 'RF'], ['Allison Dickson', 'Analyst', 'MTY'], ['Ashley Chinn', 'Consulting Lead', 'SA'],
      ['Bob Kozak', 'Engineer', 'OKC'], ['Brady Hannon', 'Technician', 'RF'], ['Cheri Castaneda', 'Analyst', 'SA'], ['Christal Robles', 'Project Manager', 'MTY'],
      ['Van Amundson', 'Engineer', 'OKC'], ['Bernadette Foss', 'Consulting Lead', 'RF']];
    SEED.resources = resDefs.map(function (d, i) { return { id: 'R' + (100 + i), name: d[0], role: d[1], plantId: d[2], rate: roleRates[d[1]] || 80, capacity: 173 }; });
    var bookings = [];
    SEED.resources.forEach(function (res) {
      SEED.periods.forEach(function (period) {
        var alloc = Math.round(jit('bk' + res.id + period, 40, 215));
        bookings.push({ resourceId: res.id, name: res.name, role: res.role, plantId: res.plantId, period: period, allocated: alloc, capacity: res.capacity, utilization: Math.round(alloc / res.capacity * 100) / 100 });
      });
    });
    SEED.bookings = bookings;

    // Opportunities / Quotes pipeline
    SEED.oppStages = ['Lead', 'Opportunity', 'Quote', 'Won', 'Lost'];
    var owners = ['Alan Steiner', 'Maria Cruz', 'James Whitfield', 'Dana Lee'];
    var oppKinds = ['Upgrade', 'Retrofit', 'Expansion', 'New Line', 'Service Contract'];
    SEED.opportunities = [];
    for (var oi = 0; oi < 14; oi++) {
      var s = 'opp' + oi, cust = SEED.customers[hash(s) % SEED.customers.length], stageIdx = hash(s + 'st') % 5;
      var amount = r2(jit(s + 'a', 60000, 900000)), prob = [0.1, 0.35, 0.6, 1.0, 0][stageIdx];
      SEED.opportunities.push({ id: 'OPP-' + (2001 + oi), name: cust.name + ' — ' + oppKinds[hash(s + 'k') % oppKinds.length], customerId: cust.id, customer: cust.name,
        owner: owners[hash(s + 'o') % owners.length], stage: SEED.oppStages[stageIdx], stageIndex: stageIdx, amount: amount, probability: prob, weighted: r2(amount * prob),
        closeDate: SEED.periods[hash(s + 'd') % SEED.periods.length], plantId: SEED.plants[hash(s + 'pl') % SEED.plants.length].id });
    }
  })();

  /* ===================================================================
   * Manufacturing cost engine + governance master data (per the ERP feature doc)
   * =================================================================== */
  // Multilevel BOM / routing (cost component split)
  SEED.bomNodes = {
    'RM-CAST': { sku: 'RM-CAST', name: 'Cast steel blank', type: 'buy', purchaseCost: 30 },
    'SA-HOUSING': { sku: 'SA-HOUSING', name: 'Machined housing (sub-assembly)', type: 'make', labor: 12, overhead: 8, components: [{ sku: 'RM-CAST', qty: 1 }] },
    'RM-BUSH': { sku: 'RM-BUSH', name: 'Bronze bushing', type: 'buy', purchaseCost: 3.5 },
    'RM-CTRL': { sku: 'RM-CTRL', name: 'Electronic controller', type: 'buy', purchaseCost: 88 },
    'GX-200': { sku: 'GX-200', name: 'GX-200 Gearbox', type: 'make', labor: 30, overhead: 20, components: [{ sku: 'SA-HOUSING', qty: 1 }, { sku: 'RM-BUSH', qty: 4 }, { sku: 'RM-CTRL', qty: 1 }] },
    'GX-450': { sku: 'GX-450', name: 'GX-450 Heavy-Duty Gearbox', type: 'make', labor: 55, overhead: 38, subcontract: 20, components: [{ sku: 'SA-HOUSING', qty: 2 }, { sku: 'RM-BUSH', qty: 8 }, { sku: 'RM-CTRL', qty: 2 }] }
  };
  SEED.bomRoots = ['GX-200', 'GX-450'];

  // Work orders (production-order WIP + variances)
  SEED.workOrders = [
    { id: 'WO-1001', productSku: 'GX-200', plantId: 'SA', orderedQty: 100, completedQty: 100, status: 'Closed', stdUnit: { material: 132, labor: 42, overhead: 28 }, actual: { material: 13800, labor: 4400, overhead: 2900 } },
    { id: 'WO-1002', productSku: 'GX-200', plantId: 'RF', orderedQty: 120, completedQty: 48, status: 'In process', stdUnit: { material: 132, labor: 42, overhead: 28 }, actual: { material: 7100, labor: 2150, overhead: 1500 } },
    { id: 'WO-1003', productSku: 'GX-450', plantId: 'SA', orderedQty: 60, completedQty: 60, status: 'Closed', setupCost: 1200, plannedLot: 60, stdUnit: { material: 264, labor: 79, overhead: 74 }, actual: { material: 16500, labor: 5100, overhead: 4600 } },
    { id: 'WO-1004', productSku: 'GX-450', plantId: 'MTY', orderedQty: 40, completedQty: 22, status: 'In process', stdUnit: { material: 264, labor: 79, overhead: 74 }, actual: { material: 6200, labor: 1900, overhead: 1750 } },
    { id: 'WO-1005', productSku: 'GX-200', plantId: 'OKC', orderedQty: 80, completedQty: 80, status: 'Closed', stdUnit: { material: 132, labor: 42, overhead: 28 }, actual: { material: 10400, labor: 3500, overhead: 2300 } },
    { id: 'WO-1006', productSku: 'GX-450', plantId: 'RF', orderedQty: 50, completedQty: 0, status: 'Released', stdUnit: { material: 264, labor: 79, overhead: 74 }, actual: { material: 0, labor: 0, overhead: 0 } }
  ];

  // Standard cost versions + release (maker-checker)
  SEED.costVersions = [
    { id: 'CV-2025-FY', name: 'FY2025 Standard', status: 'Active', effectiveFrom: 'Jan 2025', preparedBy: 'A. Cole (Cost Accountant)', approvedBy: 'M. Reyes (Plant Controller)', items: [{ sku: 'GX-200', cost: 202 }, { sku: 'GX-450', cost: 417 }, { sku: 'SA-HOUSING', cost: 50 }] },
    { id: 'CV-2025-H2', name: 'H2 Mid-year refresh', status: 'Pending', effectiveFrom: 'Jul 2025', preparedBy: 'A. Cole (Cost Accountant)', approvedBy: null, items: [{ sku: 'GX-200', cost: 208 }, { sku: 'GX-450', cost: 431 }, { sku: 'SA-HOUSING', cost: 52 }] }
  ];

  // Cost of quality (prevention / appraisal / internal failure / external failure)
  SEED.qualityEvents = [
    { id: 'NCR-3001', date: 'May 2025', plantId: 'SA', type: 'Nonconformance', category: 'Internal failure', sku: 'GX-200', amount: 4200, status: 'Closed' },
    { id: 'CAPA-2105', date: 'May 2025', plantId: 'RF', type: 'CAPA', category: 'Prevention', sku: '—', amount: 1800, status: 'Open' },
    { id: 'INSP-7740', date: 'May 2025', plantId: 'MTY', type: 'Inspection', category: 'Appraisal', sku: 'GX-450', amount: 2600, status: 'Closed' },
    { id: 'WRR-4410', date: 'May 2025', plantId: 'SA', type: 'Warranty return', category: 'External failure', sku: 'GX-450', amount: 9300, status: 'Open' },
    { id: 'NCR-3002', date: 'Apr 2025', plantId: 'OKC', type: 'Nonconformance', category: 'Internal failure', sku: 'GX-200', amount: 1500, status: 'Closed' },
    { id: 'SUP-2201', date: 'Apr 2025', plantId: 'RF', type: 'Supplier chargeback', category: 'External failure', sku: 'RM-CTRL', amount: 3100, status: 'Closed' },
    { id: 'TRN-9100', date: 'Apr 2025', plantId: 'SA', type: 'Operator training', category: 'Prevention', sku: '—', amount: 2200, status: 'Closed' },
    { id: 'INSP-7741', date: 'May 2025', plantId: 'RF', type: 'Final inspection', category: 'Appraisal', sku: 'GX-200', amount: 1900, status: 'Closed' }
  ];

  // Landed cost shipments
  SEED.landedShipments = [
    { id: 'SHP-501', vessel: 'MV Borderland', origin: 'Monterrey → San Antonio', charges: [{ type: 'Freight', amount: 4200, basis: 'weight' }, { type: 'Duty', amount: 3100, basis: 'value' }, { type: 'Handling', amount: 900, basis: 'qty' }],
      receipts: [{ id: 'RC-9001', sku: 'RM-CAST', qty: 1200, value: 36000, weight: 9600 }, { id: 'RC-9002', sku: 'RM-CTRL', qty: 600, value: 52800, weight: 480 }] },
    { id: 'SHP-502', vessel: 'MV Gulf Star', origin: 'Houston port', charges: [{ type: 'Freight', amount: 2600, basis: 'weight' }, { type: 'Insurance', amount: 700, basis: 'value' }],
      receipts: [{ id: 'RC-9101', sku: 'RM-BUSH', qty: 9000, value: 31500, weight: 1800 }, { id: 'RC-9102', sku: 'RM-CAST', qty: 800, value: 24000, weight: 6400 }] }
  ];

  // Lot/serial traceability (genealogy)
  SEED.lots = [
    { lot: 'L-CAST-2205', sku: 'RM-CAST', plantId: 'SA', period: 'May 2025', qty: 1200, parents: [], status: 'Consumed' },
    { lot: 'L-HOUS-2218', sku: 'SA-HOUSING', plantId: 'SA', period: 'May 2025', qty: 600, parents: ['L-CAST-2205'], status: 'Consumed' },
    { lot: 'L-CTRL-2231', sku: 'RM-CTRL', plantId: 'SA', period: 'May 2025', qty: 600, parents: [], status: 'Consumed' },
    { lot: 'L-GX200-2240', sku: 'GX-200', plantId: 'SA', period: 'May 2025', qty: 100, parents: ['L-HOUS-2218', 'L-CTRL-2231'], status: 'Shipped' },
    { lot: 'L-GX450-2255', sku: 'GX-450', plantId: 'SA', period: 'May 2025', qty: 60, parents: ['L-HOUS-2218', 'L-CTRL-2231'], status: 'On hold' }
  ];

  // Subcontracting orders
  SEED.subcontractOrders = [
    { id: 'SC-701', supplier: 'Precision Forgings', operation: 'Heat treat & grind', sku: 'SA-HOUSING', qty: 600, serviceCost: 7200, componentsCost: 18000, status: 'Received' },
    { id: 'SC-702', supplier: 'Apex Components', operation: 'Surface coating', sku: 'GX-450', qty: 60, serviceCost: 4800, componentsCost: 26000, status: 'Open' },
    { id: 'SC-703', supplier: 'Rio Grande Alloys', operation: 'Casting', sku: 'RM-CAST', qty: 1200, serviceCost: 9600, componentsCost: 0, status: 'Received' }
  ];

  // RBAC / segregation-of-duties (from the ERP feature doc)
  SEED.rbacCapabilities = ['View', 'Create', 'Edit', 'Approve', 'Post', 'Simulate', 'Report', 'Configure'];
  SEED.rbacMatrix = [
    { role: 'Cost accountant', caps: ['Y', 'Y', 'Y', 'L', 'Y', 'Y', 'Y', 'L'] },
    { role: 'Production planner', caps: ['Y', 'Y', 'L', 'N', 'N', 'L', 'Y', 'N'] },
    { role: 'Plant controller', caps: ['Y', 'L', 'L', 'Y', 'Y', 'Y', 'Y', 'L'] },
    { role: 'Inventory manager', caps: ['Y', 'Y', 'Y', 'L', 'Y', 'N', 'Y', 'L'] },
    { role: 'Procurement lead', caps: ['Y', 'Y', 'Y', 'Y', 'L', 'L', 'Y', 'L'] },
    { role: 'Finance manager', caps: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'L'] },
    { role: 'CFO', caps: ['Y', 'N', 'N', 'Y', 'N', 'Y', 'Y', 'N'] },
    { role: 'Shop floor supervisor', caps: ['Y', 'Y', 'L', 'N', 'L', 'N', 'Y', 'N'] },
    { role: 'Quality manager', caps: ['Y', 'Y', 'Y', 'Y', 'L', 'N', 'Y', 'L'] },
    { role: 'IT/ERP admin', caps: ['Y', 'L', 'Y', 'N', 'N', 'N', 'L', 'Y'] },
    { role: 'Auditor', caps: ['Y', 'N', 'N', 'N', 'N', 'N', 'Y', 'N'] }
  ];
  SEED.sodControls = [
    { area: 'Maintain cost records vs activate standard costs', split: 'Cost accountant prepares; controller/finance approves', control: 'Pending/active status, blocked activation, maker-checker, change logs' },
    { area: 'Maintain overhead/allocation vs period close', split: 'Cost-accounting setup owner maintains; close owner posts', control: 'Effective dating, close freeze, audit trail, post-close rerun review' },
    { area: 'Maintain BOM/routing vs cost release', split: 'Engineering owns structure; costing owns valuation; controller approves', control: 'ECO governance, rollup exception review, independent sample recalc' },
    { area: 'Record scrap/NCR vs approve write-off', split: 'Shop floor/quality records; controller/finance approves', control: 'Reason codes, scrap accounts, NCR/CAPA workflow, variance review' },
    { area: 'Create subcontract/landed charges vs approve invoice', split: 'Procurement creates; AP/finance approves; receiving confirms', control: 'Three-way match, landed-cost variance review, vendor-specific posting' },
    { area: 'Configure roles vs assign roles vs review conflicts', split: 'Security admin configures; IAM assigns; internal audit reviews', control: 'Privileged access mgmt, quarterly recertification, emergency-access logging' }
  ];

  // Audit trail (change log for cost-relevant master data)
  SEED.auditLog = [
    { id: 'AUD-5001', ts: '2025-05-31 14:22', user: 'A. Cole', role: 'Cost accountant', area: 'Cost version', action: 'Create pending', field: 'GX-200 std cost', oldValue: '202.00', newValue: '208.00' },
    { id: 'AUD-5002', ts: '2025-05-31 16:05', user: 'M. Reyes', role: 'Plant controller', area: 'Cost version', action: 'Review', field: 'CV-2025-H2', oldValue: 'Draft', newValue: 'Pending' },
    { id: 'AUD-5003', ts: '2025-05-28 09:41', user: 'J. Whitfield', role: 'Engineering', area: 'BOM', action: 'Edit', field: 'GX-450 bushing qty', oldValue: '6', newValue: '8' },
    { id: 'AUD-5004', ts: '2025-05-27 11:10', user: 'D. Lee', role: 'Procurement lead', area: 'Overhead rule', action: 'Edit', field: 'Machine-hour rate', oldValue: '24.00', newValue: '25.00' },
    { id: 'AUD-5005', ts: '2025-05-25 17:33', user: 'S. Park', role: 'Finance manager', area: 'Posting profile', action: 'Edit', field: 'WIP account', oldValue: '1340', newValue: '1345' },
    { id: 'AUD-5006', ts: '2025-05-24 08:50', user: 'Quality bot', role: 'Quality manager', area: 'Disposition', action: 'Post', field: 'NCR-3001 scrap', oldValue: '—', newValue: '4,200.00' }
  ];

  // Fixed assets (depreciation-bearing production equipment)
  SEED.fixedAssets = [
    { id: 'FA-1001', name: 'CNC Machining Center #1', plantId: 'SA', category: 'Machinery', acqDate: '2021-03', cost: 480000, accumDep: 192000, life: 10, method: 'Straight-line', annualDep: 48000 },
    { id: 'FA-1002', name: 'Robotic Assembly Cell', plantId: 'SA', category: 'Machinery', acqDate: '2022-06', cost: 360000, accumDep: 108000, life: 8, method: 'Straight-line', annualDep: 45000 },
    { id: 'FA-1003', name: 'Heat-Treat Furnace', plantId: 'RF', category: 'Machinery', acqDate: '2020-01', cost: 290000, accumDep: 174000, life: 10, method: 'Straight-line', annualDep: 29000 },
    { id: 'FA-1004', name: 'Hydraulic Press 400T', plantId: 'MTY', category: 'Machinery', acqDate: '2023-02', cost: 215000, accumDep: 43000, life: 10, method: 'Straight-line', annualDep: 21500 },
    { id: 'FA-1005', name: 'Plant Building — OKC', plantId: 'OKC', category: 'Building', acqDate: '2018-09', cost: 1250000, accumDep: 312500, life: 40, method: 'Straight-line', annualDep: 31250 },
    { id: 'FA-1006', name: 'Forklift Fleet (6)', plantId: 'RF', category: 'Vehicles', acqDate: '2022-11', cost: 168000, accumDep: 50400, life: 7, method: 'Straight-line', annualDep: 24000 },
    { id: 'FA-1007', name: 'Inspection CMM', plantId: 'SA', category: 'Equipment', acqDate: '2023-08', cost: 96000, accumDep: 16000, life: 8, method: 'Straight-line', annualDep: 12000 }
  ];

  // Cash & bank
  SEED.bankAccounts = [
    { id: 'BANK-OP', name: 'Operating account', bank: 'Frost Bank', currency: 'USD', plantId: 'SA', balance: 2840000 },
    { id: 'BANK-PR', name: 'Payroll account', bank: 'Frost Bank', currency: 'USD', plantId: 'SA', balance: 615000 },
    { id: 'BANK-MX', name: 'Monterrey operating', bank: 'BBVA Mexico', currency: 'MXN', plantId: 'MTY', balance: 1180000 },
    { id: 'BANK-RES', name: 'Capex reserve', bank: 'Frost Bank', currency: 'USD', plantId: 'OKC', balance: 1450000 }
  ];

  if (typeof module !== 'undefined' && module.exports) { module.exports = SEED; }
  else { (root.CACC = root.CACC || {}).SEED = SEED; }
})(typeof window !== 'undefined' ? window : this);
