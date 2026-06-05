const test = require('node:test');
const assert = require('node:assert/strict');
const CVP = require('../engines/cvp-engine.js');

test('single-product CVP: CM, break-even, MOS, DOL', () => {
  const r = CVP.singleProduct({
    price: 100, variableCost: 60, fixedCost: 200000, actualUnits: 8000, targetProfit: 50000
  });
  assert.equal(r.cmUnit, 40);
  assert.equal(r.cmRatio, 0.4);
  assert.equal(r.breakEvenUnits, 5000);
  assert.equal(r.breakEvenDollars, 500000);
  assert.equal(r.targetProfitUnits, 6250);
  assert.equal(r.actualSales, 800000);
  assert.equal(r.contributionMarginTotal, 320000);
  assert.equal(r.netOperatingIncome, 120000);
  assert.equal(r.marginOfSafety.dollars, 300000);
  assert.equal(r.marginOfSafety.ratio, 0.375);
  assert.equal(r.degreeOperatingLeverage, 2.6667);
});

test('multi-product weighted break-even', () => {
  const r = CVP.multiProductBreakEven(
    [{ name: 'A', cmUnit: 40, mix: 0.6 }, { name: 'B', cmUnit: 20, mix: 0.4 }],
    160000
  );
  assert.equal(r.weightedAvgCm, 32);
  assert.equal(r.breakEvenPackages, 5000);
  assert.equal(r.perProduct.find(p => p.name === 'A').units, 3000);
  assert.equal(r.perProduct.find(p => p.name === 'B').units, 2000);
});

test('break-even helpers handle zero CM safely', () => {
  assert.equal(CVP.breakEvenUnits(100000, 0), 0);
  assert.equal(CVP.breakEvenDollars(100000, 0), 0);
});
