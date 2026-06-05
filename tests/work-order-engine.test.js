const test = require('node:test');
const assert = require('node:assert/strict');
const WO = require('../engines/work-order-engine.js');

const order = {
  id: 'WO-1001', productSku: 'GX-200', plantId: 'SA', orderedQty: 100, completedQty: 100, status: 'Closed',
  stdUnit: { material: 132, labor: 42, overhead: 28 },
  actual: { material: 13800, labor: 4400, overhead: 2900 }
};

test('WIP, COGM and component variances', () => {
  const r = WO.compute(order);
  assert.equal(r.stdUnitCost, 202);
  assert.equal(r.stdCogm, 20200);     // 100 * 202
  assert.equal(r.wipIssued, 21100);   // 13800 + 4400 + 2900
  assert.equal(r.wipBalance, 900);
  assert.equal(r.variances.material, 600);  // 13800 - 13200
  assert.equal(r.variances.labor, 200);
  assert.equal(r.variances.overhead, 100);
  assert.equal(r.variances.total, 900);     // ties to WIP balance for a fully-issued order
  assert.equal(r.percentComplete, 1);
});

test('open order leaves WIP balance', () => {
  const r = WO.compute({
    id: 'WO-1002', productSku: 'GX-200', plantId: 'RF', orderedQty: 100, completedQty: 40, status: 'In process',
    stdUnit: { material: 132, labor: 42, overhead: 28 }, actual: { material: 6000, labor: 1900, overhead: 1300 }
  });
  assert.equal(r.stdCogm, 8080);      // 40 * 202
  assert.equal(r.wipIssued, 9200);
  assert.equal(r.wipBalance, 1120);
  assert.equal(r.percentComplete, 0.4);
});

test('lot-size variance from setup spread', () => {
  const r = WO.compute({
    id: 'WO-1003', productSku: 'GX-200', plantId: 'SA', orderedQty: 100, completedQty: 50, status: 'Closed',
    setupCost: 1000, plannedLot: 100,
    stdUnit: { material: 100, labor: 0, overhead: 0 }, actual: { material: 5000, labor: 0, overhead: 0 }
  });
  assert.equal(r.lotSizeVariance, 500); // 1000 * (1 - 50/100)
});

test('summary aggregates WIP and variances', () => {
  const s = WO.summary([order]);
  assert.equal(s.totals.wipBalance, 900);
  assert.equal(s.totals.total, 900);
  assert.equal(s.totals.open, 0);
});
