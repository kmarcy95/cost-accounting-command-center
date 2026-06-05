const test = require('node:test');
const assert = require('node:assert/strict');
const VE = require('../engines/cost-variance-engine.js');

const example = {
  standardPrice: 5.00, standardQty: 3000, actualPrice: 5.20, actualQty: 3200,
  standardRate: 20.00, standardHours: 2000, actualRate: 19.50, actualHours: 2100,
  standardVarRate: 4.00, actualVOH: 8600,
  budgetedFOH: 11000, standardFixedRate: 5.00, actualFOH: 11300
};

test('material price variance', () => {
  assert.equal(VE.materialPriceVariance(5.20, 5.00, 3200), 640);
});
test('material quantity variance', () => {
  assert.equal(VE.materialQuantityVariance(3200, 3000, 5.00), 1000);
});
test('labor rate variance is favorable (negative)', () => {
  assert.equal(VE.laborRateVariance(19.50, 20.00, 2100), -1050);
});
test('labor efficiency variance', () => {
  assert.equal(VE.laborEfficiencyVariance(2100, 2000, 20.00), 2000);
});
test('variable OH spending variance', () => {
  assert.equal(VE.variableOhSpendingVariance(8600, 4.00, 2100), 200);
});
test('variable OH efficiency variance', () => {
  assert.equal(VE.variableOhEfficiencyVariance(4.00, 2100, 2000), 400);
});
test('fixed OH budget variance', () => {
  assert.equal(VE.fixedOhBudgetVariance(11300, 11000), 300);
});
test('fixed OH volume variance', () => {
  assert.equal(VE.fixedOhVolumeVariance(11000, 5.00, 2000), 1000);
});
test('classify maps sign to F/U', () => {
  assert.equal(VE.classify(640).label, 'U');
  assert.equal(VE.classify(640).favorable, false);
  assert.equal(VE.classify(-1050).label, 'F');
  assert.equal(VE.classify(-1050).favorable, true);
  assert.equal(VE.classify(0).label, '—');
});
test('computeAll totals and reconciliation', () => {
  const r = VE.computeAll(example);
  assert.equal(r.material.total, 1640);
  assert.equal(r.labor.total, 950);
  assert.equal(r.varOH.total, 600);
  assert.equal(r.fixedOH.total, 1300);
  assert.equal(r.totals.standardCost, 73000);
  assert.equal(r.totals.actualCost, 77490);
  assert.equal(r.totals.totalVariance, 4490);
  assert.equal(r.reconciles, true);
});
