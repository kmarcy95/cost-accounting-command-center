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
    }
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = SEED; }
  else { (root.CACC = root.CACC || {}).SEED = SEED; }
})(typeof window !== 'undefined' ? window : this);
