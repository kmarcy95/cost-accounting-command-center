const test = require('node:test');
const assert = require('node:assert/strict');
const JE = require('../engines/journal-entries-engine.js');

const sc = {
  standardPrice: 5.00, standardQty: 3000, actualPrice: 5.20, actualQty: 3200,
  standardRate: 20.00, standardHours: 2000, actualRate: 19.50, actualHours: 2100,
  standardVarRate: 4.00, actualVOH: 8600,
  budgetedFOH: 11000, standardFixedRate: 5.00, actualFOH: 11300
};

test('every entry balances and totals tie out', () => {
  const r = JE.build(sc, 177500);
  assert.equal(r.allBalanced, true);
  assert.equal(r.entries.length, 6);
  assert.equal(r.totalDebits, r.totalCredits);
  r.entries.forEach(e => assert.equal(e.debit, e.credit));
});

test('purchase entry isolates price variance and ties to AP', () => {
  const r = JE.build(sc, 0);
  const je1 = r.entries.find(e => e.ref === 'JE-01');
  const ap = je1.lines.find(l => l.account === 'Accounts Payable');
  const mpv = je1.lines.find(l => l.account === 'Material Price Variance');
  assert.equal(ap.credit, 16640);   // 5.20 * 3200
  assert.equal(mpv.debit, 640);      // unfavorable -> debit
  assert.equal(je1.balanced, true);
});

test('labor entry handles favorable rate variance as a credit', () => {
  const r = JE.build(sc, 0);
  const je3 = r.entries.find(e => e.ref === 'JE-03');
  const rate = je3.lines.find(l => l.account === 'Labor Rate Variance');
  assert.equal(rate.credit, 1050);   // favorable -> credit
  assert.equal(je3.balanced, true);
});

test('reserve entry omitted when reserve is zero', () => {
  const r = JE.build(sc, 0);
  assert.equal(r.entries.length, 5);
  assert.equal(r.entries.find(e => e.ref === 'JE-06'), undefined);
});
