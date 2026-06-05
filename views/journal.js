/* Journal Entries view — period standard-cost journal entries (debits = credits). */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.journal = {
    title: 'Journal Entries',
    render: function (c) {
      var j = M.journal();

      c.appendChild(el('div', { class: 'grid g3' }, [
        ui.kpi('Total debits', fmt.money0(j.totalDebits), j.entries.length + ' entries', 'ledger'),
        ui.kpi('Total credits', fmt.money0(j.totalCredits), null, 'ledger'),
        ui.kpi('Trial balance', j.allBalanced ? 'In balance' : 'Out of balance',
          j.allBalanced ? 'debits = credits ✓' : 'review entries', 'variance', j.allBalanced ? 'fav' : 'unfav')
      ]));

      c.appendChild(el('div', { class: 'section-title', text: 'Period entries' }));
      j.entries.forEach(function (e) {
        var tb = el('tbody');
        e.lines.forEach(function (l) {
          tb.appendChild(el('tr', l.debit === 0 ? { class: 'sub' } : {}, [
            el('td', { style: l.debit === 0 ? 'padding-left:34px' : '', text: l.account }),
            el('td', { class: 'num tnum', text: l.debit ? fmt.money(l.debit) : '' }),
            el('td', { class: 'num tnum', text: l.credit ? fmt.money(l.credit) : '' })
          ]));
        });
        tb.appendChild(el('tr', { class: 'total' }, [
          el('td', { text: 'Totals' }), el('td', { class: 'num tnum', text: fmt.money(e.debit) }), el('td', { class: 'num tnum', text: fmt.money(e.credit) })
        ]));
        var head = el('div', { class: 'card-head' }, [
          el('div', {}, [el('h2', { text: e.ref + ' · ' + e.memo })]),
          el('span', { class: 'badge ' + (e.balanced ? 'sb-good' : 'sb-bad'), text: e.balanced ? 'Balanced' : 'Unbalanced' })
        ]);
        c.appendChild(el('div', { class: 'card', style: 'margin-bottom:14px' }, [head,
          el('div', { class: 'card-pad' }, [el('table', { class: 'dt' }, [
            el('thead', {}, el('tr', {}, [el('th', { text: 'Account' }), el('th', { class: 'num', text: 'Debit' }), el('th', { class: 'num', text: 'Credit' })])), tb
          ])])
        ]));
      });

      c.appendChild(el('div', { class: 'note' },
        'Variances post to dedicated accounts at the point of incurrence — material price at purchase (JE-01), quantity at issue (JE-02), labor rate & efficiency at recording (JE-03). This is what makes standard costing actionable before month-end close.'));

      c.appendChild(el('div', { class: 'section-title', text: 'AI insights' }));
      c.appendChild(ui.aiPanel('journal', M.ctx.journal()));
    }
  };
})(typeof window !== 'undefined' ? window : this);
