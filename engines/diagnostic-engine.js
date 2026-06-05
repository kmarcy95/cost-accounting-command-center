/* Day-1 Cost-System Diagnostic engine — pure functions, no DOM.
 * Scores the cost system across five dimensions into a 0-100 health score
 * and emits prioritized recommendations. Deterministic and unit-tested.
 *
 * metrics = {
 *   totalVariancePct,     // |total variance| / standard cost      (lower better)
 *   overheadAbsorbedPct,  // |over/under applied| / applied OH      (lower better)
 *   grossMarginPct,       // gross margin %                         (higher better)
 *   costingDistortionPct, // max |unit distortion| / ABC unit cost  (lower better)
 *   inventoryAccuracyPct  // cycle-count accuracy                   (higher better)
 * }
 */
(function (root) {
  'use strict';

  function bandLowerBetter(v, t1, t2, t3) {
    if (v <= t1) return 95;
    if (v <= t2) return 80;
    if (v <= t3) return 60;
    return 38;
  }
  function bandHigherBetter(v, t1, t2, t3) {
    if (v >= t1) return 95;
    if (v >= t2) return 82;
    if (v >= t3) return 65;
    return 40;
  }

  var DIMS = [
    { key: 'variance', label: 'Variance magnitude', weight: 0.20,
      score: function (m) { return bandLowerBetter(m.totalVariancePct, 0.02, 0.05, 0.10); },
      weak: 'Period variances exceed 5% of standard cost — investigate price/usage drivers and refresh standards.' },
    { key: 'overhead', label: 'Overhead absorption', weight: 0.20,
      score: function (m) { return bandLowerBetter(m.overheadAbsorbedPct, 0.02, 0.05, 0.10); },
      weak: 'Overhead is materially over/under-absorbed — revisit the predetermined rate and capacity assumptions.' },
    { key: 'margin', label: 'Margin visibility', weight: 0.25,
      score: function (m) { return bandHigherBetter(m.grossMarginPct, 0.40, 0.30, 0.20); },
      weak: 'Gross margin is thin or opaque — build a product-level margin bridge and tighten cost capture.' },
    { key: 'costing', label: 'Costing-method fit', weight: 0.20,
      score: function (m) { return bandLowerBetter(m.costingDistortionPct, 0.05, 0.10, 0.20); },
      weak: 'Traditional allocation distorts unit costs vs. ABC — adopt activity drivers for high-overhead lines.' },
    { key: 'inventory', label: 'Inventory accuracy', weight: 0.15,
      score: function (m) { return bandHigherBetter(m.inventoryAccuracyPct, 0.98, 0.95, 0.90); },
      weak: 'Inventory accuracy is below 95% — stand up cycle counting before trusting valuation/COGS.' }
  ];

  function rating(score) {
    if (score >= 85) return 'Strong';
    if (score >= 70) return 'Healthy';
    if (score >= 55) return 'Needs attention';
    return 'At risk';
  }

  function assess(metrics) {
    var dimensions = DIMS.map(function (d) {
      return { key: d.key, label: d.label, weight: d.weight, score: d.score(metrics) };
    });
    var overall = Math.round(dimensions.reduce(function (s, d) { return s + d.score * d.weight; }, 0));

    var recommendations = [];
    DIMS.forEach(function (d, idx) {
      var sc = dimensions[idx].score;
      if (sc < 70) {
        recommendations.push({
          priority: sc < 50 ? 'High' : 'Medium',
          area: d.label,
          text: d.weak
        });
      }
    });
    // Highest-priority first
    recommendations.sort(function (a, b) {
      var order = { High: 0, Medium: 1, Low: 2 };
      return order[a.priority] - order[b.priority];
    });

    return {
      dimensions: dimensions,
      overall: overall,
      rating: rating(overall),
      recommendations: recommendations
    };
  }

  var api = { assess: assess, rating: rating };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { (root.CACC = root.CACC || {}).DiagnosticEngine = api; }
})(typeof window !== 'undefined' ? window : this);
