const test = require('node:test');
const assert = require('node:assert/strict');
const INV = require('../engines/inventory-engine.js');

const layers = [
  { units: 100, unitCost: 10 },  // beginning
  { units: 200, unitCost: 12 },  // purchase 1
  { units: 100, unitCost: 15 }   // purchase 2
]; // 400 units available, $4,900 total
const unitsSold = 300; // 100 units ending

test('FIFO valuation', () => {
  const r = INV.valueFifo(layers, unitsSold);
  assert.equal(r.endingInventory, 1500); // last 100 @ 15
  assert.equal(r.cogs, 3400);
  assert.equal(r.endingUnits, 100);
});

test('LIFO valuation', () => {
  const r = INV.valueLifo(layers, unitsSold);
  assert.equal(r.endingInventory, 1000); // first 100 @ 10
  assert.equal(r.cogs, 3900);
});

test('Weighted-average valuation', () => {
  const r = INV.valueWeightedAverage(layers, unitsSold);
  assert.equal(r.avgUnitCost, 12.25);
  assert.equal(r.cogs, 3675);
  assert.equal(r.endingInventory, 1225);
});

test('valuation comparison ties to cost available', () => {
  const r = INV.valuationComparison(layers, unitsSold);
  assert.equal(r.costAvailable, 4900);
  assert.equal(r.fifo.cogs + r.fifo.endingInventory, 4900);
  assert.equal(r.lifo.cogs + r.lifo.endingInventory, 4900);
  assert.equal(r.weightedAverage.cogs + r.weightedAverage.endingInventory, 4900);
});

test('cost-flow roll-forward RM->WIP->FG->COGS with overhead adjustment', () => {
  const r = INV.costFlow({
    beginRM: 20000, purchasesRM: 100000, endRM: 15000,
    directLabor: 80000, appliedOverhead: 60000,
    beginWIP: 30000, endWIP: 25000,
    beginFG: 40000, endFG: 35000,
    actualOverhead: 65000
  });
  assert.equal(r.directMaterialsUsed, 105000);
  assert.equal(r.totalManufacturingCost, 245000);
  assert.equal(r.costOfGoodsManufactured, 250000);
  assert.equal(r.unadjustedCOGS, 255000);
  assert.equal(r.overUnderApplied, 5000);
  assert.equal(r.overUnderLabel, 'underapplied');
  assert.equal(r.adjustedCOGS, 260000);
});

test('overhead absorption flags over-applied', () => {
  const r = INV.overheadAbsorption(25, 2000, 48000);
  assert.equal(r.applied, 50000);
  assert.equal(r.variance, -2000);
  assert.equal(r.label, 'overapplied');
});
