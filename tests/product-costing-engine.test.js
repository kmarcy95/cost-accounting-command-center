const test = require('node:test');
const assert = require('node:assert/strict');
const PC = require('../engines/product-costing-engine.js');

test('predetermined overhead rate', () => {
  assert.equal(PC.predeterminedOverheadRate(500000, 20000), 25);
});

test('job-order cost build-up and unit cost', () => {
  const r = PC.jobOrderCost({
    directMaterials: 12000, directLabor: 8000, driverQty: 200, pohr: 25, units: 100
  });
  assert.equal(r.appliedOverhead, 5000);
  assert.equal(r.totalCost, 25000);
  assert.equal(r.unitCost, 250);
});

test('process costing (weighted-average) reconciles to the cent', () => {
  const r = PC.processCosting({
    beginningUnits: 1000, unitsStarted: 9000, completedUnits: 8000, endingUnits: 2000,
    endingPctMaterials: 1.0, endingPctConversion: 0.5,
    beginningCostMaterials: 4000, beginningCostConversion: 1500,
    addedCostMaterials: 46000, addedCostConversion: 34500
  });
  assert.equal(r.equivalentUnits.materials, 10000);
  assert.equal(r.equivalentUnits.conversion, 9000);
  assert.equal(r.costPerEu.materials, 5);
  assert.equal(r.costPerEu.conversion, 4);
  assert.equal(r.costPerEu.total, 9);
  assert.equal(r.costCompleted, 72000);
  assert.equal(r.costEndingWip, 14000);
  assert.equal(r.totalCostToAccount, 86000);
  assert.equal(r.totalCostAssigned, 86000);
  assert.equal(r.reconciles, true);
  assert.equal(r.unitsReconcile, true);
});

test('ABC vs traditional reveals cost distortion', () => {
  const pools = [
    { name: 'setups', cost: 60000, driverTotal: 300 },
    { name: 'machineHours', cost: 80000, driverTotal: 8000 },
    { name: 'inspections', cost: 20000, driverTotal: 400 }
  ];
  const products = [
    { name: 'A', units: 1000, drivers: { setups: 100, machineHours: 3000, inspections: 100 }, traditionalDriverQty: 3000 },
    { name: 'B', units: 4000, drivers: { setups: 200, machineHours: 5000, inspections: 300 }, traditionalDriverQty: 5000 }
  ];
  const r = PC.activityBasedCosting(pools, products, 8000);
  assert.equal(r.totalOverhead, 160000);
  assert.equal(r.activityRates.setups, 200);
  assert.equal(r.activityRates.machineHours, 10);
  assert.equal(r.activityRates.inspections, 50);
  assert.equal(r.traditionalRate, 20);

  const a = r.products.find(p => p.name === 'A');
  const b = r.products.find(p => p.name === 'B');
  assert.equal(a.abcCost, 55000);
  assert.equal(a.abcUnitCost, 55);
  assert.equal(a.traditionalUnitCost, 60);
  assert.equal(a.unitDistortion, 5);   // traditional over-costs A by $5/unit
  assert.equal(b.abcCost, 105000);
  assert.equal(b.abcUnitCost, 26.25);
  assert.equal(b.traditionalUnitCost, 25);
  assert.equal(b.unitDistortion, -1.25); // traditional under-costs B by $1.25/unit
  // ABC allocates 100% of overhead
  assert.equal(a.abcCost + b.abcCost, 160000);
});
