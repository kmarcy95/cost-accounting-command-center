const test = require('node:test');
const assert = require('node:assert/strict');
const CUBE = require('../engines/cube-engine.js');

const facts = [
  { period: 'Jan', plantId: 'SA', plantName: 'San Antonio', sku: 'VB', productName: 'Valve Body', customerId: 'PERM', customerName: 'Permian', units: 100, revenue: 10000, stdCost: 6000, actualCost: 6500, grossProfit: 3500, materialVar: 300, laborVar: 100, ohVar: 100, netVariance: 500, invValue: 2000 },
  { period: 'Jan', plantId: 'RF', plantName: 'Rockford', sku: 'VB', productName: 'Valve Body', customerId: 'GULF', customerName: 'Gulf', units: 50, revenue: 6000, stdCost: 3000, actualCost: 2800, grossProfit: 3200, materialVar: -100, laborVar: -50, ohVar: -50, netVariance: -200, invValue: 1000 },
  { period: 'Feb', plantId: 'SA', plantName: 'San Antonio', sku: 'PH', productName: 'Pump Housing', customerId: 'PERM', customerName: 'Permian', units: 80, revenue: 9000, stdCost: 5000, actualCost: 5200, grossProfit: 3800, materialVar: 150, laborVar: 50, ohVar: 0, netVariance: 200, invValue: 1500 },
  { period: 'Feb', plantId: 'RF', plantName: 'Rockford', sku: 'PH', productName: 'Pump Housing', customerId: 'GULF', customerName: 'Gulf', units: 40, revenue: 5000, stdCost: 2500, actualCost: 2600, grossProfit: 2400, materialVar: 50, laborVar: 50, ohVar: 0, netVariance: 100, invValue: 800 }
];

test('filter by plant and period', () => {
  assert.equal(CUBE.filterFacts(facts, { plantId: 'SA' }).length, 2);
  assert.equal(CUBE.filterFacts(facts, { period: 'Jan' }).length, 2);
  assert.equal(CUBE.filterFacts(facts, { plantId: 'SA', period: 'Feb' }).length, 1);
  assert.equal(CUBE.filterFacts(facts, { plantId: 'ALL', period: 'ALL' }).length, 4);
});

test('kpis aggregate and compute margin', () => {
  const k = CUBE.kpis(facts);
  assert.equal(k.revenue, 30000);
  assert.equal(k.grossProfit, 12900);
  assert.equal(k.netVariance, 600);
  assert.equal(k.units, 270);
  assert.equal(k.marginPct, 0.43); // 12900/30000
});

test('groupBy plant sums and margin', () => {
  const g = CUBE.groupBy(facts, 'plantId', 'plantName');
  const sa = g.find(x => x.key === 'SA');
  assert.equal(sa.revenue, 19000);
  assert.equal(sa.grossProfit, 7300);
  assert.equal(sa.netVariance, 700);
});

test('topN customers by gross profit', () => {
  const t = CUBE.topN(facts, 'customerId', 'customerName', 'grossProfit', 1);
  assert.equal(t.length, 1);
  assert.equal(t[0].key, 'PERM');     // 3500 + 3800 = 7300
  assert.equal(t[0].grossProfit, 7300);
});

test('pivot product x plant on revenue reconciles to grand total', () => {
  const p = CUBE.pivot(facts, 'sku', 'productName', 'plantId', 'plantName', 'revenue');
  assert.equal(p.grand, 30000);
  assert.equal(p.cells['VB||SA'], 10000);
  assert.equal(p.cells['PH||RF'], 5000);
  assert.equal(p.rowTotals['VB'], 16000);
  assert.equal(p.colTotals['SA'], 19000);
});

test('series orders periods', () => {
  const s = CUBE.series(facts, ['Jan', 'Feb'], 'revenue');
  assert.deepEqual(s.map(x => x.value), [16000, 14000]);
});
