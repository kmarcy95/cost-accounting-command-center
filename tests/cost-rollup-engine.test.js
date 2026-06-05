const test = require('node:test');
const assert = require('node:assert/strict');
const RU = require('../engines/cost-rollup-engine.js');

const nodes = {
  'CASTING': { sku: 'CASTING', name: 'Cast steel blank', type: 'buy', purchaseCost: 30 },
  'HOUSING': { sku: 'HOUSING', name: 'Machined housing', type: 'make', labor: 12, overhead: 8, components: [{ sku: 'CASTING', qty: 1 }] },
  'BUSHING': { sku: 'BUSHING', name: 'Bronze bushing', type: 'buy', purchaseCost: 3.5 },
  'CONTROLLER': { sku: 'CONTROLLER', name: 'Electronic controller', type: 'buy', purchaseCost: 88 },
  'GX-200': { sku: 'GX-200', name: 'GX-200 Gearbox', type: 'make', labor: 30, overhead: 20, components: [{ sku: 'HOUSING', qty: 1 }, { sku: 'BUSHING', qty: 4 }, { sku: 'CONTROLLER', qty: 1 }] }
};

test('subassembly rolls up', () => {
  const h = RU.rollup('HOUSING', nodes);
  assert.equal(h.total, 50);            // 30 material + 12 labor + 8 oh
  assert.equal(h.split.material, 30);
});

test('multilevel rollup with cost component split', () => {
  const r = RU.rollup('GX-200', nodes);
  assert.equal(r.split.material, 132);  // 30 + 4*3.5 + 88
  assert.equal(r.split.labor, 42);      // 12 + 30
  assert.equal(r.split.overhead, 28);   // 8 + 20
  assert.equal(r.split.subcontract, 0);
  assert.equal(r.total, 202);
  assert.equal(r.split.material + r.split.labor + r.split.overhead, r.total);
});

test('explode produces an indented costed BOM', () => {
  const rows = RU.explode('GX-200', nodes);
  assert.equal(rows[0].sku, 'GX-200');
  assert.equal(rows[0].level, 0);
  const casting = rows.find(x => x.sku === 'CASTING');
  assert.equal(casting.level, 2);
  const bushing = rows.find(x => x.sku === 'BUSHING');
  assert.equal(bushing.qtyPer, 4);
  assert.equal(bushing.extended, 14);
});
