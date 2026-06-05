const test = require('node:test');
const assert = require('node:assert/strict');
const RES = require('../engines/inventory-reserve-engine.js');

const policy = {
  coverageMonths: 12,
  buckets: [
    { maxDays: 90, pct: 0 },
    { maxDays: 180, pct: 0.25 },
    { maxDays: 365, pct: 0.50 },
    { maxDays: Infinity, pct: 1.0 }
  ]
};

test('aging bucket selection', () => {
  assert.equal(RES.agingBucketPct(40, policy), 0);
  assert.equal(RES.agingBucketPct(95, policy), 0.25);
  assert.equal(RES.agingBucketPct(200, policy), 0.50);
  assert.equal(RES.agingBucketPct(420, policy), 1.0);
});

test('healthy item — no reserve', () => {
  const r = RES.analyzeItem({
    sku: 'GX-200', category: 'Finished goods', type: 'fg', qtyOnHand: 800, unitCost: 145,
    sellingPrice: 210, costToComplete: 0, costToSell: 12, annualDemand: 6000, agingDays: 40
  }, policy);
  assert.equal(r.nrvReserve, 0);
  assert.equal(r.excessQty, 0);
  assert.equal(r.combinedReserve, 0);
  assert.equal(r.netValue, 116000);
});

test('excess slow-mover — E&O reserve only', () => {
  const r = RES.analyzeItem({
    sku: 'GX-450', category: 'Finished goods', type: 'fg', qtyOnHand: 1500, unitCost: 320,
    sellingPrice: 360, costToComplete: 5, costToSell: 20, annualDemand: 900, agingDays: 200
  }, policy);
  assert.equal(r.nrvReserve, 0);            // NRV 335 > cost 320
  assert.equal(r.demandCoverageQty, 900);
  assert.equal(r.excessQty, 600);
  assert.equal(r.eoPct, 0.50);
  assert.equal(r.eoReserve, 96000);          // 600 * 320 * 0.5
  assert.equal(r.combinedReserve, 96000);
});

test('price decline raw material — NRV write-down only', () => {
  const r = RES.analyzeItem({
    sku: 'RM-1140', category: 'Raw materials', type: 'raw', qtyOnHand: 4000, unitCost: 42,
    sellingPrice: 38, costToComplete: 0, costToSell: 2, annualDemand: 18000, agingDays: 60
  }, policy);
  assert.equal(r.nrv, 36);
  assert.equal(r.nrvWritedownUnit, 6);
  assert.equal(r.nrvReserve, 24000);
  assert.equal(r.excessQty, 0);
  assert.equal(r.combinedReserve, 24000);
});

test('obsolete item — NRV write-down AND E&O, fully reserved to zero net', () => {
  const r = RES.analyzeItem({
    sku: 'GX-110', category: 'Finished goods', type: 'fg', qtyOnHand: 300, unitCost: 180,
    sellingPrice: 120, costToComplete: 0, costToSell: 10, annualDemand: 0, agingDays: 420
  }, policy);
  assert.equal(r.nrvWritedownUnit, 70);
  assert.equal(r.nrvReserve, 21000);
  assert.equal(r.carryingUnitAfterNrv, 110);
  assert.equal(r.excessQty, 300);
  assert.equal(r.eoReserve, 33000);          // 300 * 110 * 1.0
  assert.equal(r.combinedReserve, 54000);
  assert.equal(r.netValue, 0);
});

test('portfolio totals reconcile across several items', () => {
  const items = [
    { sku: 'GX-200', category: 'Finished goods', type: 'fg', qtyOnHand: 800, unitCost: 145, sellingPrice: 210, costToComplete: 0, costToSell: 12, annualDemand: 6000, agingDays: 40 },
    { sku: 'GX-450', category: 'Finished goods', type: 'fg', qtyOnHand: 1500, unitCost: 320, sellingPrice: 360, costToComplete: 5, costToSell: 20, annualDemand: 900, agingDays: 200 },
    { sku: 'RM-1140', category: 'Raw materials', type: 'raw', qtyOnHand: 4000, unitCost: 42, sellingPrice: 38, costToComplete: 0, costToSell: 2, annualDemand: 18000, agingDays: 60 },
    { sku: 'RM-2210', category: 'Raw materials', type: 'raw', qtyOnHand: 9000, unitCost: 3.5, sellingPrice: 4.2, costToComplete: 0, costToSell: 0, annualDemand: 5000, agingDays: 95 },
    { sku: 'GX-110', category: 'Finished goods', type: 'fg', qtyOnHand: 300, unitCost: 180, sellingPrice: 120, costToComplete: 0, costToSell: 10, annualDemand: 0, agingDays: 420 },
    { sku: 'RM-3000', category: 'Raw materials', type: 'raw', qtyOnHand: 600, unitCost: 88, sellingPrice: 95, costToComplete: 0, costToSell: 0, annualDemand: 2400, agingDays: 25 }
  ];
  const r = RES.analyzePortfolio(items, policy);
  assert.equal(r.totals.grossValue, 902300);
  assert.equal(r.totals.combinedReserve, 177500);
  assert.equal(r.totals.netValue, 724800);
  assert.equal(r.totals.itemsReserved, 4);   // GX-450, RM-1140, RM-2210, GX-110
  assert.equal(r.totals.reservePct, 0.1967); // 177500/902300
  // RM-2210 E&O: 4000 * 3.5 * 0.25 = 3500
  assert.equal(r.items.find(x => x.sku === 'RM-2210').combinedReserve, 3500);
  // category subtotal check
  const fg = r.byCategory.find(c => c.category === 'Finished goods');
  assert.equal(fg.combinedReserve, 150000); // 0 + 96000 + 54000
});
