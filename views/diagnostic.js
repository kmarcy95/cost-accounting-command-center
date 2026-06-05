/* Day-1 Diagnostic view — cost-system health score, dimension breakdown, recommendations. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.diagnostic = {
    title: 'Day-1 Cost System Diagnostic',
    render: function (c) {
      var dg = M.diagnostic(), metrics = M.diagnosticMetrics();

      // Hero score
      var scoreCard = el('div', { class: 'card card-pad', style: 'display:flex;align-items:center;gap:28px;flex-wrap:wrap' }, [
        scoreRing(dg.overall),
        el('div', { style: 'flex:1;min-width:240px' }, [
          el('div', { style: 'font-size:13px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em' }, 'Overall cost-system health'),
          el('div', { style: 'font-size:34px;font-weight:700;margin:4px 0' }, [el('span', { text: dg.overall + ' ' }), el('span', { class: 'badge ' + ratingClass(dg.overall), text: dg.rating })]),
          el('div', { class: 'muted', text: 'A consultant\'s first-week read on whether this cost system can be trusted for decisions — scored across five dimensions, weighted by impact.' })
        ])
      ]);
      c.appendChild(scoreCard);

      // Dimensions
      c.appendChild(el('div', { class: 'section-title', text: 'Scorecard' }));
      var dimCard = el('div', { class: 'card card-pad' });
      dg.dimensions.forEach(function (d) {
        var row = el('div', { style: 'display:grid;grid-template-columns:180px 1fr 120px;align-items:center;gap:16px;padding:11px 0;border-bottom:1px solid var(--border)' }, [
          el('div', {}, [el('div', { style: 'font-weight:600', text: d.label }), el('div', { class: 'muted', style: 'font-size:12px', text: 'Weight ' + Math.round(d.weight * 100) + '%' })]),
          el('div', { class: 'dim-bar' }, [el('span', { style: 'width:' + d.score + '%;background:' + barColor(d.score) })]),
          el('div', { style: 'text-align:right;font-weight:700;font-variant-numeric:tabular-nums', text: d.score + ' / 100' })
        ]);
        dimCard.appendChild(row);
      });
      c.appendChild(dimCard);

      // Underlying metrics
      c.appendChild(el('div', { class: 'section-title', text: 'Underlying metrics' }));
      c.appendChild(el('div', { class: 'grid g4' }, [
        ui.kpi('Variance / std cost', fmt.pct(metrics.totalVariancePct * 100), 'Lower is better', 'variance'),
        ui.kpi('OH over/under', fmt.pct(metrics.overheadAbsorbedPct * 100), 'of applied overhead', 'gauge'),
        ui.kpi('Gross margin', fmt.pct(metrics.grossMarginPct * 100), 'Higher is better', 'margin'),
        ui.kpi('Inventory accuracy', fmt.pct(metrics.inventoryAccuracyPct * 100), 'Cycle-count accuracy', 'box')
      ]));

      // Recommendations
      c.appendChild(el('div', { class: 'section-title', text: 'Prioritized recommendations' }));
      if (dg.recommendations.length) {
        var recCard = el('div', { class: 'card card-pad' });
        dg.recommendations.forEach(function (r) {
          recCard.appendChild(el('div', { style: 'display:flex;gap:14px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--border)' }, [
            el('span', { class: 'badge ' + (r.priority === 'High' ? 'sb-bad' : r.priority === 'Medium' ? 'sb-warn' : 'sb-neutral'), text: r.priority, style: 'flex:none;margin-top:2px' }),
            el('div', {}, [el('div', { style: 'font-weight:600', text: r.area }), el('div', { class: 'muted', text: r.text })])
          ]));
        });
        c.appendChild(recCard);
      } else {
        c.appendChild(el('div', { class: 'note', text: 'No critical gaps detected. Shift focus from remediation to optimization and close automation.' }));
      }

      c.appendChild(el('div', { class: 'section-title', text: 'AI executive summary' }));
      c.appendChild(ui.aiPanel('diagnostic', M.ctx.diagnostic()));
    }
  };

  function scoreRing(score) {
    var color = barColor(score), circ = 2 * Math.PI * 52;
    var off = circ * (1 - score / 100);
    var wrap = el('div', { class: 'score-ring', style: 'width:130px;height:130px;flex:none' });
    wrap.innerHTML = '<svg width="130" height="130" viewBox="0 0 130 130">' +
      '<circle cx="65" cy="65" r="52" fill="none" stroke="#e2e8f0" stroke-width="12"/>' +
      '<circle cx="65" cy="65" r="52" fill="none" stroke="' + color + '" stroke-width="12" stroke-linecap="round" ' +
      'stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 65 65)"/>' +
      '<text x="65" y="62" text-anchor="middle" font-size="30" font-weight="700" fill="#1e293b">' + score + '</text>' +
      '<text x="65" y="82" text-anchor="middle" font-size="12" fill="#64748b">/ 100</text></svg>';
    return wrap;
  }
  function barColor(s) { return s >= 80 ? '#107c41' : s >= 60 ? '#9a6700' : '#c43e3e'; }
  function ratingClass(s) { return s >= 70 ? 'sb-good' : s >= 55 ? 'sb-warn' : 'sb-bad'; }
})(typeof window !== 'undefined' ? window : this);
