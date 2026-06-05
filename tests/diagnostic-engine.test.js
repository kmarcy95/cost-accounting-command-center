const test = require('node:test');
const assert = require('node:assert/strict');
const DX = require('../engines/diagnostic-engine.js');

const metrics = {
  totalVariancePct: 0.0615,    // -> 60
  overheadAbsorbedPct: 0.0833, // -> 60
  grossMarginPct: 0.32,        // -> 82
  costingDistortionPct: 0.0909,// -> 78
  inventoryAccuracyPct: 0.96   // -> 82
};

test('rating bands', () => {
  assert.equal(DX.rating(90), 'Strong');
  assert.equal(DX.rating(72), 'Healthy');
  assert.equal(DX.rating(60), 'Needs attention');
  assert.equal(DX.rating(40), 'At risk');
});

test('assess produces weighted overall and recommendations', () => {
  const r = DX.assess(metrics);
  const byKey = Object.fromEntries(r.dimensions.map(d => [d.key, d.score]));
  assert.equal(byKey.variance, 60);
  assert.equal(byKey.overhead, 60);
  assert.equal(byKey.margin, 82);
  assert.equal(byKey.costing, 80);
  assert.equal(byKey.inventory, 82);
  // 0.2*60 + 0.2*60 + 0.25*82 + 0.2*80 + 0.15*82 = 72.8 -> 73
  assert.equal(r.overall, 73);
  assert.equal(r.rating, 'Healthy');
  // two dimensions below 70 -> two recommendations
  assert.equal(r.recommendations.length, 2);
  assert.ok(r.recommendations.every(x => x.priority === 'Medium'));
});

test('a strong system scores high with no recommendations', () => {
  const r = DX.assess({
    totalVariancePct: 0.01, overheadAbsorbedPct: 0.01, grossMarginPct: 0.45,
    costingDistortionPct: 0.02, inventoryAccuracyPct: 0.99
  });
  assert.equal(r.overall, 95);
  assert.equal(r.rating, 'Strong');
  assert.equal(r.recommendations.length, 0);
});
