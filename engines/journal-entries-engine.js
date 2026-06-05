/* Standard-cost journal entries engine — pure functions, no DOM.
 * Builds the period's cost-accounting journal entries from the standard-costing
 * inputs (and the inventory reserve total). Each entry self-balances by
 * construction; variances post to dedicated variance accounts (Dr when
 * unfavorable / positive, Cr when favorable / negative).
 */
(function (root) {
  'use strict';
  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  // a variance line: debit when amount>0 (unfavorable), credit when <0 (favorable)
  function varLine(account, amount) {
    amount = round2(amount);
    return amount >= 0 ? { account: account, debit: amount, credit: 0 }
                       : { account: account, debit: 0, credit: -amount };
  }
  function dr(account, amt) { return { account: account, debit: round2(amt), credit: 0 }; }
  function cr(account, amt) { return { account: account, debit: 0, credit: round2(amt) }; }

  function entry(ref, memo, lines) {
    var debit = round2(lines.reduce(function (s, l) { return s + l.debit; }, 0));
    var credit = round2(lines.reduce(function (s, l) { return s + l.credit; }, 0));
    return { ref: ref, memo: memo, lines: lines, debit: debit, credit: credit, balanced: Math.abs(debit - credit) < 0.01 };
  }

  function build(i, reserveTotal) {
    var entries = [];

    // 1. Purchase raw materials at standard; isolate material price variance
    entries.push(entry('JE-01', 'Purchase raw materials (standard) + price variance', [
      dr('Raw Materials Inventory', i.standardPrice * i.actualQty),
      varLine('Material Price Variance', (i.actualPrice - i.standardPrice) * i.actualQty),
      cr('Accounts Payable', i.actualPrice * i.actualQty)
    ]));

    // 2. Issue materials to WIP at standard; isolate quantity variance
    entries.push(entry('JE-02', 'Issue direct materials to WIP + quantity variance', [
      dr('Work-in-Process — Materials', i.standardPrice * i.standardQty),
      varLine('Material Quantity Variance', (i.actualQty - i.standardQty) * i.standardPrice),
      cr('Raw Materials Inventory', i.standardPrice * i.actualQty)
    ]));

    // 3. Direct labor at standard; isolate rate & efficiency variances
    entries.push(entry('JE-03', 'Record direct labor + rate/efficiency variances', [
      dr('Work-in-Process — Labor', i.standardRate * i.standardHours),
      varLine('Labor Rate Variance', (i.actualRate - i.standardRate) * i.actualHours),
      varLine('Labor Efficiency Variance', (i.actualHours - i.standardHours) * i.standardRate),
      cr('Wages Payable', i.actualRate * i.actualHours)
    ]));

    // 4. Apply manufacturing overhead to WIP at standard
    var appliedOH = (i.standardVarRate + i.standardFixedRate) * i.standardHours;
    entries.push(entry('JE-04', 'Apply manufacturing overhead to WIP (standard)', [
      dr('Work-in-Process — Overhead', appliedOH),
      cr('Manufacturing Overhead Applied', appliedOH)
    ]));

    // 5. Record actual overhead incurred
    entries.push(entry('JE-05', 'Record actual manufacturing overhead incurred', [
      dr('Manufacturing Overhead Control', i.actualVOH + i.actualFOH),
      cr('Accounts Payable / Accum. Depreciation', i.actualVOH + i.actualFOH)
    ]));

    // 6. Inventory reserve (LCNRV + E&O)
    if (reserveTotal && reserveTotal > 0.005) {
      entries.push(entry('JE-06', 'Record inventory reserve (LCNRV + excess & obsolete)', [
        dr('Cost of Goods Sold — Inventory Reserve', reserveTotal),
        cr('Inventory Valuation Reserve (contra-asset)', reserveTotal)
      ]));
    }

    var allBalanced = entries.every(function (e) { return e.balanced; });
    var totalDebits = round2(entries.reduce(function (s, e) { return s + e.debit; }, 0));
    var totalCredits = round2(entries.reduce(function (s, e) { return s + e.credit; }, 0));
    return { entries: entries, allBalanced: allBalanced, totalDebits: totalDebits, totalCredits: totalCredits };
  }

  var api = { build: build };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { (root.CACC = root.CACC || {}).JournalEntriesEngine = api; }
})(typeof window !== 'undefined' ? window : this);
