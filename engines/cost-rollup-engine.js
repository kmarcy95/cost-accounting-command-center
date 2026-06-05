/* Multilevel BOM/routing cost-rollup engine — pure functions, no DOM.
 * Rolls material/labor/overhead/subcontract up a multilevel product structure
 * (cost component split, per IAS 2 conversion costs). nodes = map keyed by sku:
 *   { sku, name, type:'make'|'buy', purchaseCost?, labor?, overhead?, subcontract?,
 *     components?: [{ sku, qty }] }
 */
(function (root) {
  'use strict';
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  var KEYS = ['material', 'labor', 'overhead', 'subcontract'];

  function rollup(sku, nodes) {
    var n = nodes[sku];
    if (!n) return { sku: sku, name: sku, split: { material: 0, labor: 0, overhead: 0, subcontract: 0 }, total: 0, lines: [] };
    var split = { material: 0, labor: 0, overhead: 0, subcontract: 0 }, lines = [];
    (n.components || []).forEach(function (c) {
      var child = rollup(c.sku, nodes);
      KEYS.forEach(function (k) { split[k] += c.qty * child.split[k]; });
      lines.push({ sku: c.sku, name: child.name, qty: c.qty, unitCost: child.total, extended: r2(c.qty * child.total) });
    });
    if (n.type === 'buy') split.material += (n.purchaseCost || 0);
    split.labor += (n.labor || 0); split.overhead += (n.overhead || 0); split.subcontract += (n.subcontract || 0);
    KEYS.forEach(function (k) { split[k] = r2(split[k]); });
    var total = r2(split.material + split.labor + split.overhead + split.subcontract);
    return { sku: sku, name: n.name, type: n.type, split: split, total: total, lines: lines };
  }

  /* Flatten the indented costed BOM (for a grid) with level depth. */
  function explode(sku, nodes, qty, level, out) {
    out = out || []; qty = qty == null ? 1 : qty; level = level || 0;
    var n = nodes[sku]; if (!n) return out;
    var rolled = rollup(sku, nodes);
    out.push({ level: level, sku: sku, name: n.name, type: n.type, qtyPer: qty, unitCost: rolled.total, extended: r2(qty * rolled.total) });
    (n.components || []).forEach(function (c) { explode(c.sku, nodes, qty * c.qty, level + 1, out); });
    return out;
  }

  var api = { rollup: rollup, explode: explode };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.CACC = root.CACC || {}).CostRollupEngine = api;
})(typeof window !== 'undefined' ? window : this);
