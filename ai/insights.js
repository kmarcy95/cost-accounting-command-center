/* Deterministic "AI" insight generator — always available, no network.
 * Produces data-driven analyst narratives from computed engine output.
 * If a Claude key is configured, claude-client.js upgrades these to live calls,
 * but this module is the always-on baseline and the structured prompt source.
 */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  var fmt = CACC.fmt;

  function fu(n) { return n > 0 ? 'unfavorable' : n < 0 ? 'favorable' : 'neutral'; }
  function dollars(n) { return (CACC.fmt ? CACC.fmt.money(Math.abs(n)) : '$' + Math.abs(n)); }

  /* Each generator returns { headline, paragraphs:[], bullets:[] } */
  var GEN = {
    dashboard: function (c) {
      var v = c.variance.totals;
      return {
        headline: 'Period cost performance summary',
        paragraphs: [
          c.company.name + ' closed ' + c.company.period + ' with a total manufacturing variance of ' +
          dollars(v.totalVariance) + ' ' + fu(v.totalVariance).toUpperCase() + ' against a standard cost of ' +
          fmt.money(v.standardCost) + '. Gross margin held at ' + fmt.pct(c.grossMarginPct * 100) +
          ' and capacity ran at ' + fmt.pct(c.capacityPct) + ' of available machine hours.',
          'The cost system scores ' + c.diagnostic.overall + '/100 (' + c.diagnostic.rating +
          '). The largest single driver this period is the ' + c.topDriver.label + ' variance at ' +
          dollars(c.topDriver.amount) + ' ' + fu(c.topDriver.amount).toUpperCase() + '.'
        ],
        bullets: [
          'Inventory on hand valued at ' + fmt.money(c.inventoryValue) + ' (FIFO).',
          'Overhead is ' + c.absorption.label + ' by ' + dollars(c.absorption.variance) + ' this period.',
          c.diagnostic.recommendations.length
            ? c.diagnostic.recommendations.length + ' priority recommendation(s) flagged — see Diagnostic.'
            : 'No critical issues flagged by the Day-1 diagnostic.'
        ]
      };
    },

    standardCosting: function (c) {
      var r = c.result, groups = [
        ['Material', r.material.total], ['Labor', r.labor.total],
        ['Variable OH', r.varOH.total], ['Fixed OH', r.fixedOH.total]
      ].sort(function (a, b) { return Math.abs(b[1]) - Math.abs(a[1]); });
      var biggest = groups[0];
      return {
        headline: 'Variance analysis — ' + c.productName,
        paragraphs: [
          'Total variance is ' + dollars(r.totals.totalVariance) + ' ' + fu(r.totals.totalVariance).toUpperCase() +
          ' (' + fmt.pct(Math.abs(r.totals.totalVariance) / r.totals.standardCost * 100) +
          ' of standard cost). The dominant driver is ' + biggest[0] + ' at ' + dollars(biggest[1]) + ' ' +
          fu(biggest[1]).toUpperCase() + '.',
          'Material price was ' + dollars(r.material.price) + ' ' + fu(r.material.price).toUpperCase() +
          ' while material quantity was ' + dollars(r.material.quantity) + ' ' + fu(r.material.quantity).toUpperCase() +
          '; labor rate ran ' + fu(r.labor.rate) + ' and labor efficiency ' + fu(r.labor.efficiency) + '.'
        ],
        bullets: groups.map(function (g) {
          return g[0] + ': ' + dollars(g[1]) + ' ' + (g[1] === 0 ? '' : fu(g[1]).toUpperCase());
        }).concat([
          r.reconciles ? 'Variances reconcile to the total — math integrity confirmed.'
            : 'WARNING: variances do not reconcile to the total.'
        ])
      };
    },

    productCosting: function (c) {
      var a = c.abc.products[0], b = c.abc.products[1];
      var worst = Math.abs(a.unitDistortion) >= Math.abs(b.unitDistortion) ? a : b;
      return {
        headline: 'Product costing & allocation insight',
        paragraphs: [
          'Job-order cost for ' + c.jobName + ' totals ' + fmt.money(c.job.totalCost) + ' (' +
          fmt.money(c.job.unitCost) + '/unit). Process costing in ' + c.deptName +
          ' yields ' + fmt.money(c.process.costPerEu.total) + ' per equivalent unit and reconciles ' +
          (c.process.reconciles ? 'cleanly.' : 'with a discrepancy — review inputs.'),
          'Switching from a plant-wide rate to activity-based costing shifts ' + worst.name +
          ' by ' + fmt.money(Math.abs(worst.unitDistortion)) + '/unit — traditional costing ' +
          (worst.unitDistortion > 0 ? 'over-costs' : 'under-costs') + ' it. Low-volume, setup-heavy lines are typically under-costed by simple allocation.'
        ],
        bullets: c.abc.products.map(function (p) {
          return p.name + ': ABC ' + fmt.money(p.abcUnitCost) + '/u vs traditional ' +
            fmt.money(p.traditionalUnitCost) + '/u (' +
            (p.unitDistortion > 0 ? 'over' : 'under') + '-costed ' + fmt.money(Math.abs(p.unitDistortion)) + '/u).';
        })
      };
    },

    inventory: function (c) {
      var v = c.valuation, f = c.flow;
      return {
        headline: 'Inventory valuation & cost-flow insight',
        paragraphs: [
          'On ' + v.unitsSold + ' units sold from ' + fmt.money(v.costAvailable) + ' of available cost, ending inventory ranges from ' +
          fmt.money(v.lifo.endingInventory) + ' (LIFO) to ' + fmt.money(v.fifo.endingInventory) +
          ' (FIFO) — a ' + fmt.money(v.fifo.endingInventory - v.lifo.endingInventory) +
          ' spread that flows straight to COGS and reported margin. In rising-cost periods FIFO reports lower COGS and higher profit.',
          'Cost of goods manufactured is ' + fmt.money(f.costOfGoodsManufactured) + '; adjusted COGS is ' +
          fmt.money(f.adjustedCOGS) + ' after a ' + fmt.money(Math.abs(f.overUnderApplied)) + ' ' +
          f.overUnderLabel + ' overhead adjustment.'
        ],
        bullets: [
          'FIFO COGS ' + fmt.money(v.fifo.cogs) + ' · LIFO COGS ' + fmt.money(v.lifo.cogs) +
          ' · Weighted-avg COGS ' + fmt.money(v.weightedAverage.cogs) + '.',
          'Direct materials used: ' + fmt.money(f.directMaterialsUsed) + '.',
          'Overhead absorption is ' + c.absorption.label + ' at ' + fmt.pct(c.absorption.absorptionRatePct) + ' of actual.'
        ]
      };
    },

    cvp: function (c) {
      var s = c.single;
      return {
        headline: 'CVP & break-even insight',
        paragraphs: [
          c.productName + ' carries a ' + fmt.money(s.cmUnit) + ' unit contribution margin (' +
          fmt.pct(s.cmRatio * 100) + ' ratio). Break-even is ' + fmt.num(s.breakEvenUnits, 0) + ' units / ' +
          fmt.money(s.breakEvenDollars) + '. At ' + fmt.num(c.actualUnits, 0) + ' units the margin of safety is ' +
          fmt.pct(s.marginOfSafety.ratio * 100) + ' (' + fmt.money(s.marginOfSafety.dollars) + ').',
          'Degree of operating leverage is ' + fmt.num(s.degreeOperatingLeverage, 2) + 'x — a 10% sales change moves operating income roughly ' +
          fmt.pct(s.degreeOperatingLeverage * 10) + '. High leverage amplifies both upside and downside, so watch the safety cushion.'
        ],
        bullets: [
          'Net operating income at current volume: ' + fmt.money(s.netOperatingIncome) + '.',
          'Units for ' + fmt.money(c.targetProfit) + ' target profit: ' + fmt.num(s.targetProfitUnits, 0) + '.',
          'Multi-product weighted CM: ' + fmt.money(c.multiWeightedCm) + ' / break-even ' + fmt.num(c.multiBreakEven, 0) + ' packages.'
        ]
      };
    },

    diagnostic: function (c) {
      var d = c.diagnostic;
      var weak = d.dimensions.slice().sort(function (a, b) { return a.score - b.score; })[0];
      return {
        headline: 'Day-1 diagnostic — executive summary',
        paragraphs: [
          'Overall cost-system health scores ' + d.overall + '/100 (' + d.rating +
          '). The strongest area is margin visibility; the weakest is ' + weak.label.toLowerCase() +
          ' at ' + weak.score + '/100.',
          d.recommendations.length
            ? 'There are ' + d.recommendations.length + ' prioritized recommendation(s). Sequence the high-priority items first; they unblock reliable costing and reporting before deeper optimization.'
            : 'No critical gaps detected. Focus shifts from remediation to optimization and automation of the monthly close.'
        ],
        bullets: d.recommendations.length
          ? d.recommendations.map(function (r) { return '[' + r.priority + '] ' + r.area + ': ' + r.text; })
          : d.dimensions.map(function (x) { return x.label + ': ' + x.score + '/100.'; })
      };
    },

    inventoryReserve: function (c) {
      var t = c.reserve.totals, top = c.topReserveItem;
      return {
        headline: 'Inventory reserve analysis',
        paragraphs: [
          'Across ' + c.reserve.items.length + ' items, gross inventory of ' + fmt.money0(t.grossValue) +
          ' carries a combined reserve of ' + fmt.money0(t.combinedReserve) + ' (' + fmt.pct(t.reservePct * 100) +
          '), leaving a net realizable value of ' + fmt.money0(t.netValue) + '. The reserve splits into ' +
          fmt.money0(t.nrvReserve) + ' of lower-of-cost-or-NRV write-downs and ' + fmt.money0(t.eoReserve) +
          ' of excess & obsolete provision.',
          top ? 'The single largest exposure is ' + top.sku + ' (' + top.description + ') at ' +
            fmt.money0(top.combinedReserve) + ' — ' + (top.nrvWritedownUnit > 0 ? 'its cost exceeds NRV' : 'it is slow-moving/excess') +
            '. ' + t.itemsReserved + ' of ' + c.reserve.items.length + ' items require a reserve.'
            : 'No items currently require a reserve — inventory is carried at or below NRV with healthy turns.'
        ],
        bullets: c.reserve.items.slice().sort(function (a, b) { return b.combinedReserve - a.combinedReserve; })
          .slice(0, 4).map(function (r) {
            return r.sku + ': reserve ' + fmt.money0(r.combinedReserve) + ' (' + fmt.pct(r.reservePct * 100) + ' of ' + fmt.money0(r.grossValue) + ')';
          })
      };
    },

    itemMaster: function (c) {
      var t = c.reserve.totals;
      return {
        headline: 'Item master overview',
        paragraphs: [
          c.itemCount + ' SKUs are tracked with a gross carrying value of ' + fmt.money0(t.grossValue) +
          ' and a net value of ' + fmt.money0(t.netValue) + ' after reserves. Drill into any SKU for its cost build-up, BOM roll-up, aging and reserve detail.',
          t.itemsReserved + ' SKU(s) carry a valuation reserve. Watch finished goods with low demand coverage and raw materials whose NRV has fallen below cost.'
        ],
        bullets: c.reserve.byCategory.map(function (g) {
          return g.category + ': gross ' + fmt.money0(g.grossValue) + ' · net ' + fmt.money0(g.netValue) +
            ' · reserve ' + fmt.money0(g.combinedReserve);
        })
      };
    },

    journal: function (c) {
      var j = c.journal;
      return {
        headline: 'Period journal entries',
        paragraphs: [
          j.entries.length + ' standard-cost journal entries post a total of ' + fmt.money0(j.totalDebits) +
          ' in debits against equal credits — the books ' + (j.allBalanced ? 'are in balance.' : 'do NOT balance; review.'),
          'Variances are isolated to dedicated accounts at the point of incurrence (price at purchase, quantity at issue, rate & efficiency at labor recording), which is what lets management act on them before month-end.'
        ],
        bullets: j.entries.map(function (e) { return e.ref + ' — ' + e.memo + ': ' + fmt.money0(e.debit); })
      };
    },

    trends: function (c) {
      var h = c.history, last = h[h.length - 1] || {}, first = h[0] || {};
      return {
        headline: 'Six-month cost trend',
        paragraphs: [
          'Over the trailing six periods, the unfavorable total variance has ' + (c.varianceDelta < 0 ? 'improved' : 'worsened') +
          ' from ' + fmt.money0(first.totalVariance) + ' to ' + fmt.money0(last.totalVariance) + ', while gross margin moved from ' +
          fmt.pct(first.grossMarginPct * 100) + ' to ' + fmt.pct(last.grossMarginPct * 100) + ' — a ' + (c.marginDelta >= 0 ? '+' : '') +
          fmt.pct(c.marginDelta * 100) + ' shift.',
          'Inventory reserve as a share of gross fell from ' + fmt.pct(first.reservePct * 100) + ' to ' + fmt.pct(last.reservePct * 100) +
          ', and capacity utilization climbed to ' + fmt.pct(last.capacityPct * 100) + '. The trend is consistent with tightening cost control; sustain it by holding standards current and clearing slow-moving stock.'
        ],
        bullets: [
          'Variance: ' + fmt.money0(first.totalVariance) + ' → ' + fmt.money0(last.totalVariance) + ' (' + (c.varianceDelta < 0 ? 'favorable' : 'adverse') + ' ' + fmt.money0(Math.abs(c.varianceDelta)) + ').',
          'Gross margin: ' + fmt.pct(first.grossMarginPct * 100) + ' → ' + fmt.pct(last.grossMarginPct * 100) + '.',
          'Reserve ratio: ' + fmt.pct(first.reservePct * 100) + ' → ' + fmt.pct(last.reservePct * 100) + '.',
          'Capacity: ' + fmt.pct(first.capacityPct * 100) + ' → ' + fmt.pct(last.capacityPct * 100) + '.'
        ]
      };
    },

    capacity: function (c) {
      var x = c.capacity;
      return {
        headline: 'Capacity & overhead absorption',
        paragraphs: [
          'The plant ran ' + fmt.num(x.actualHours, 0) + ' of ' + fmt.num(x.availableHours, 0) + ' available machine hours (' +
          fmt.pct(x.utilization * 100) + ' utilization), leaving ' + fmt.num(x.idleHours, 0) + ' idle hours. At a ' +
          fmt.money(x.fixedRate) + '/hr fixed rate, idle capacity carries roughly ' + fmt.money0(x.idleCapacityCost) +
          ' of unabsorbed fixed cost.',
          'Applied overhead of ' + fmt.money0(x.appliedOH) + ' vs. actual ' + fmt.money0(x.actualOH) + ' leaves overhead ' +
          x.absorption.label + ' by ' + fmt.money0(Math.abs(x.overUnder)) + '. The fixed-overhead volume variance is ' +
          dollars(x.fixedOhVolume) + ' ' + fu(x.fixedOhVolume).toUpperCase() + ' — driven by producing at a different level than the denominator.'
        ],
        bullets: [
          'Utilization: ' + fmt.pct(x.utilization * 100) + ' (' + fmt.num(x.idleHours, 0) + ' idle hrs).',
          'Idle capacity cost: ' + fmt.money0(x.idleCapacityCost) + '.',
          'Variable OH spending ' + fu(x.varOhSpending) + ', efficiency ' + fu(x.varOhEfficiency) + '.',
          'Fixed OH budget ' + dollars(x.fixedOhBudget) + ' ' + fu(x.fixedOhBudget).toUpperCase() + ', volume ' + dollars(x.fixedOhVolume) + ' ' + fu(x.fixedOhVolume).toUpperCase() + '.'
        ]
      };
    },

    profitability: function (c) {
      var p = c.profitability, top = p.products[0], bottom = p.products[p.products.length - 1];
      return {
        headline: 'Profitability by product',
        paragraphs: [
          'Annualized, the finished-goods portfolio generates ' + fmt.money0(p.totals.annualRevenue) + ' of revenue and ' +
          fmt.money0(p.totals.annualMargin) + ' of contribution (' + fmt.pct(p.totals.marginPct * 100) + ' blended margin). ' +
          (top ? top.sku + ' is the margin leader at ' + fmt.money0(top.annualMargin) + ' (' + fmt.pct(top.marginPct * 100) + ' unit margin).' : ''),
          bottom && bottom !== top ? bottom.sku + ' is the weakest contributor at ' + fmt.money0(bottom.annualMargin) +
            (bottom.unitMargin < 0 ? ' — it sells below cost and should be repriced or discontinued.' : ' — review pricing and volume.') : 'Margins are concentrated; protect the leaders and grow volume where capacity allows.'
        ],
        bullets: p.products.map(function (x) {
          return x.sku + ': ' + fmt.money(x.unitMargin) + '/u (' + fmt.pct(x.marginPct * 100) + ') · annual ' + fmt.money0(x.annualMargin);
        })
      };
    },

    executive: function (c) {
      var k = c.kpis, topPlant = c.plants[0], topCust = c.topCustomers[0];
      return {
        headline: c.group + ' — executive summary',
        paragraphs: [
          'For ' + c.filter + ', the group posted ' + fmt.money0(k.revenue) + ' of revenue at a ' + fmt.pct(k.marginPct * 100) +
          ' gross margin (' + fmt.money0(k.grossProfit) + '), with a net manufacturing variance of ' + fmt.money0(Math.abs(k.netVariance)) +
          ' ' + (k.netVariance > 0 ? 'unfavorable' : 'favorable') + '. ' + (topPlant ? topPlant.name + ' is the revenue leader at ' + fmt.money0(topPlant.revenue) + '.' : ''),
          (topCust ? topCust.name + ' is the most profitable customer (' + fmt.money0(topCust.grossProfit) + ' gross profit). ' : '') +
          'Use the Profitability Cube to see where margin concentrates and the Plant Scorecard to target the weakest plant.'
        ],
        bullets: c.plants.map(function (p) { return p.name + ': ' + fmt.money0(p.revenue) + ' rev · ' + fmt.pct(p.marginPct * 100) + ' GM · variance ' + fmt.money0(Math.abs(p.netVariance)) + (p.netVariance > 0 ? ' U' : ' F'); })
      };
    },

    budget: function (c) {
      var over = c.categories.filter(function (x) { return x.variance > 0; }).sort(function (a, b) { return b.variance - a.variance; })[0];
      var tb = c.categories.reduce(function (s, x) { return s + x.budget; }, 0), ta = c.categories.reduce(function (s, x) { return s + x.actual; }, 0);
      return {
        headline: 'Budget vs actual',
        paragraphs: [
          'For ' + c.filter + ', actual spend of ' + fmt.money0(ta) + ' is ' + (ta > tb ? 'over' : 'under') + ' the ' + fmt.money0(tb) +
          ' budget by ' + fmt.money0(Math.abs(ta - tb)) + ' (' + fmt.pct(tb ? Math.abs((ta - tb) / tb) * 100 : 0) + '). ' +
          (over ? over.category + ' is the biggest overrun at ' + fmt.money0(over.variance) + ' (' + fmt.pct(over.variancePct * 100) + ').' : 'No category is materially over budget.'),
          'Drill any category into its plant breakdown to find where the overrun originates before the next forecast cycle.'
        ],
        bullets: c.categories.map(function (x) { return x.category + ': budget ' + fmt.money0(x.budget) + ' vs actual ' + fmt.money0(x.actual) + ' (' + (x.variance > 0 ? '+' : '') + fmt.pct(x.variancePct * 100) + ')'; })
      };
    },

    profitabilityCube: function (c) {
      var k = c.kpis, top = c.byProduct[0], bottom = c.byProduct[c.byProduct.length - 1];
      return {
        headline: 'Profitability cube',
        paragraphs: [
          'Sliced to ' + c.filter + ', gross profit totals ' + fmt.money0(k.grossProfit) + ' on ' + fmt.money0(k.revenue) +
          ' revenue (' + fmt.pct(k.marginPct * 100) + ' margin). ' + (top ? top.name + ' leads product margin at ' + fmt.money0(top.grossProfit) + '.' : ''),
          'Pivot rows/columns across product, plant, customer and period to find the most and least profitable intersections; click any cell to see the underlying fact rows.'
        ],
        bullets: c.byProduct.map(function (x) { return x.name + ': ' + fmt.money0(x.grossProfit) + ' GP (' + fmt.pct(x.marginPct * 100) + ')'; })
          .concat(c.topCustomers.slice(0, 3).map(function (x) { return 'Customer ' + x.name + ': ' + fmt.money0(x.grossProfit) + ' GP'; }))
      };
    }
  };

  function generate(moduleKey, ctx) {
    var g = GEN[moduleKey];
    return g ? g(ctx) : { headline: 'Insight', paragraphs: [], bullets: [] };
  }

  /* Build a compact structured prompt for the live Claude path. */
  function buildPrompt(moduleKey, ctx) {
    var base = generate(moduleKey, ctx);
    return 'You are a senior cost accounting consultant briefing a manufacturing controller. ' +
      'Using ONLY the figures below, write 2 short paragraphs of sharp, specific analysis (no preamble, no markdown headers). ' +
      'Module: ' + moduleKey + '. Company: ' + (ctx.company ? ctx.company.name : 'the company') + '.\n\n' +
      'Key figures (already computed, do not recompute):\n- ' + base.bullets.join('\n- ') +
      '\n\nDeterministic baseline for reference:\n' + base.paragraphs.join('\n');
  }

  CACC.insights = { generate: generate, buildPrompt: buildPrompt };
})(typeof window !== 'undefined' ? window : this);
