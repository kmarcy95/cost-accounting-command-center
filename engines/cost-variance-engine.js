/* Standard Costing variance engine — pure functions, no DOM.
 * Reused from Business-Landing-Page (tested, 10 unit tests).
 * Sign convention: returned dollar amounts are signed so that
 *   POSITIVE  = Unfavorable (actual cost above standard)
 *   NEGATIVE  = Favorable   (actual cost below standard)
 * Overhead activity base = labor hours (actualHours / standardHours).
 */
(function (root) {
  'use strict';

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  function materialPriceVariance(actualPrice, standardPrice, actualQty) {
    return round2((actualPrice - standardPrice) * actualQty);
  }
  function materialQuantityVariance(actualQty, standardQty, standardPrice) {
    return round2((actualQty - standardQty) * standardPrice);
  }
  function laborRateVariance(actualRate, standardRate, actualHours) {
    return round2((actualRate - standardRate) * actualHours);
  }
  function laborEfficiencyVariance(actualHours, standardHours, standardRate) {
    return round2((actualHours - standardHours) * standardRate);
  }
  function variableOhSpendingVariance(actualVOH, standardVarRate, actualActivity) {
    return round2(actualVOH - standardVarRate * actualActivity);
  }
  function variableOhEfficiencyVariance(standardVarRate, actualActivity, standardActivity) {
    return round2(standardVarRate * (actualActivity - standardActivity));
  }
  function fixedOhBudgetVariance(actualFOH, budgetedFOH) {
    return round2(actualFOH - budgetedFOH);
  }
  function fixedOhVolumeVariance(budgetedFOH, standardFixedRate, standardActivity) {
    return round2(budgetedFOH - standardFixedRate * standardActivity);
  }

  function classify(amount) {
    if (Math.abs(amount) < 0.005) return { label: '—', favorable: null };
    return amount > 0 ? { label: 'U', favorable: false } : { label: 'F', favorable: true };
  }

  function computeAll(i) {
    var material = {
      price: materialPriceVariance(i.actualPrice, i.standardPrice, i.actualQty),
      quantity: materialQuantityVariance(i.actualQty, i.standardQty, i.standardPrice)
    };
    material.total = round2(material.price + material.quantity);

    var labor = {
      rate: laborRateVariance(i.actualRate, i.standardRate, i.actualHours),
      efficiency: laborEfficiencyVariance(i.actualHours, i.standardHours, i.standardRate)
    };
    labor.total = round2(labor.rate + labor.efficiency);

    var varOH = {
      spending: variableOhSpendingVariance(i.actualVOH, i.standardVarRate, i.actualHours),
      efficiency: variableOhEfficiencyVariance(i.standardVarRate, i.actualHours, i.standardHours)
    };
    varOH.total = round2(varOH.spending + varOH.efficiency);

    var fixedOH = {
      budget: fixedOhBudgetVariance(i.actualFOH, i.budgetedFOH),
      volume: fixedOhVolumeVariance(i.budgetedFOH, i.standardFixedRate, i.standardHours)
    };
    fixedOH.total = round2(fixedOH.budget + fixedOH.volume);

    var standardCost = round2(
      i.standardPrice * i.standardQty +
      i.standardRate * i.standardHours +
      i.standardVarRate * i.standardHours +
      i.standardFixedRate * i.standardHours
    );
    var actualCost = round2(
      i.actualPrice * i.actualQty +
      i.actualRate * i.actualHours +
      i.actualVOH +
      i.actualFOH
    );
    var totalVariance = round2(actualCost - standardCost);
    var sumOfVariances = round2(material.total + labor.total + varOH.total + fixedOH.total);

    return {
      material: material, labor: labor, varOH: varOH, fixedOH: fixedOH,
      totals: { standardCost: standardCost, actualCost: actualCost, totalVariance: totalVariance },
      reconciles: Math.abs(sumOfVariances - totalVariance) < 0.01
    };
  }

  var api = {
    materialPriceVariance: materialPriceVariance,
    materialQuantityVariance: materialQuantityVariance,
    laborRateVariance: laborRateVariance,
    laborEfficiencyVariance: laborEfficiencyVariance,
    variableOhSpendingVariance: variableOhSpendingVariance,
    variableOhEfficiencyVariance: variableOhEfficiencyVariance,
    fixedOhBudgetVariance: fixedOhBudgetVariance,
    fixedOhVolumeVariance: fixedOhVolumeVariance,
    classify: classify,
    computeAll: computeAll
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { (root.CACC = root.CACC || {}).VarianceEngine = api; }
})(typeof window !== 'undefined' ? window : this);
