/* Cost-Volume-Profit engine — pure functions, no DOM.
 * Contribution margin, break-even, margin of safety, target profit,
 * degree of operating leverage, and multi-product (sales-mix) break-even.
 */
(function (root) {
  'use strict';

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function round4(n) { return Math.round((n + Number.EPSILON) * 10000) / 10000; }

  function contributionMargin(price, variableCost) {
    return round2(price - variableCost);
  }
  function cmRatio(price, variableCost) {
    return price ? round4((price - variableCost) / price) : 0;
  }
  function breakEvenUnits(fixedCost, cmUnit) {
    return cmUnit ? round2(fixedCost / cmUnit) : 0;
  }
  function breakEvenDollars(fixedCost, ratio) {
    return ratio ? round2(fixedCost / ratio) : 0;
  }
  function targetProfitUnits(fixedCost, targetProfit, cmUnit) {
    return cmUnit ? round2((fixedCost + targetProfit) / cmUnit) : 0;
  }
  function marginOfSafety(actualSales, breakEvenSales) {
    var dollars = round2(actualSales - breakEvenSales);
    return { dollars: dollars, ratio: actualSales ? round4(dollars / actualSales) : 0 };
  }
  function degreeOperatingLeverage(contributionMarginTotal, netOperatingIncome) {
    return netOperatingIncome ? round4(contributionMarginTotal / netOperatingIncome) : 0;
  }

  /* Single-product CVP summary
   * input = { price, variableCost, fixedCost, actualUnits, targetProfit }
   */
  function singleProduct(i) {
    var cmUnit = contributionMargin(i.price, i.variableCost);
    var ratio = cmRatio(i.price, i.variableCost);
    var beUnits = breakEvenUnits(i.fixedCost, cmUnit);
    var beDollars = breakEvenDollars(i.fixedCost, ratio);
    var actualSales = round2((i.actualUnits || 0) * i.price);
    var cmTotal = round2((i.actualUnits || 0) * cmUnit);
    var netIncome = round2(cmTotal - i.fixedCost);
    var mos = marginOfSafety(actualSales, beDollars);
    return {
      cmUnit: cmUnit,
      cmRatio: ratio,
      breakEvenUnits: beUnits,
      breakEvenDollars: beDollars,
      targetProfitUnits: i.targetProfit != null ? targetProfitUnits(i.fixedCost, i.targetProfit, cmUnit) : null,
      actualSales: actualSales,
      contributionMarginTotal: cmTotal,
      netOperatingIncome: netIncome,
      marginOfSafety: mos,
      degreeOperatingLeverage: degreeOperatingLeverage(cmTotal, netIncome)
    };
  }

  /* Multi-product (sales-mix) break-even
   * products = [{ name, cmUnit, mix }]  mix fractions should sum to 1
   * Returns break-even in "packages" and per-product units.
   */
  function multiProductBreakEven(products, fixedCost) {
    var weightedCm = products.reduce(function (s, p) { return s + p.cmUnit * p.mix; }, 0);
    var bePackages = weightedCm ? round2(fixedCost / weightedCm) : 0;
    return {
      weightedAvgCm: round4(weightedCm),
      breakEvenPackages: bePackages,
      perProduct: products.map(function (p) {
        return { name: p.name, units: round2(bePackages * p.mix) };
      })
    };
  }

  var api = {
    contributionMargin: contributionMargin,
    cmRatio: cmRatio,
    breakEvenUnits: breakEvenUnits,
    breakEvenDollars: breakEvenDollars,
    targetProfitUnits: targetProfitUnits,
    marginOfSafety: marginOfSafety,
    degreeOperatingLeverage: degreeOperatingLeverage,
    singleProduct: singleProduct,
    multiProductBreakEven: multiProductBreakEven
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  else { (root.CACC = root.CACC || {}).CvpEngine = api; }
})(typeof window !== 'undefined' ? window : this);
