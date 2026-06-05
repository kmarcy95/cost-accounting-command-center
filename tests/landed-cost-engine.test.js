const test = require('node:test');
const assert = require('node:assert/strict');
const LC = require('../engines/landed-cost-engine.js');

const receipts = [
  { id: 'R1', sku: 'RM-1140', qty: 100, value: 6000, weight: 800 },
  { id: 'R2', sku: 'RM-2210', qty: 200, value: 2000, weight: 200 }
];

test('allocate by value', () => {
  const a = LC.allocate(800, receipts, 'value'); // total value 8000
  assert.equal(a[0].allocated, 600); // 6000/8000 * 800
  assert.equal(a[1].allocated, 200);
  assert.equal(a[0].landedValue, 6600);
  assert.equal(a[0].landedUnit, 66);
});

test('allocate by weight', () => {
  const a = LC.allocate(1000, receipts, 'weight'); // total weight 1000
  assert.equal(a[0].allocated, 800); // 800/1000 * 1000
  assert.equal(a[1].allocated, 200);
});

test('applyCharges sums multiple buckets and reconciles', () => {
  const r = LC.applyCharges([
    { type: 'Freight', amount: 800, basis: 'weight' },
    { type: 'Duty', amount: 800, basis: 'value' }
  ], receipts);
  assert.equal(r.totalCharges, 1600);
  assert.equal(r.totalAllocated, 1600);
  assert.equal(r.reconciles, true);
  // R1: freight 800*(800/1000)=640 + duty 800*(6000/8000)=600 = 1240
  assert.equal(r.rows[0].allocated, 1240);
  assert.equal(r.rows[0].landedValue, 7240);
});
