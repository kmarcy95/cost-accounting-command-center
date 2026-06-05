/* Audit Trail — change log of cost-relevant master data / configuration. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, ui = CACC.ui;

  CACC.views.auditTrail = {
    title: 'Audit Trail',
    render: function (c) {
      var rows = CACC.store.data().auditLog || [];
      var areas = {}; rows.forEach(function (r) { areas[r.area] = 1; });
      c.appendChild(el('div', { class: 'grid g3' }, [
        ui.kpi('Logged changes', String(rows.length), 'cost-relevant', 'ledger'),
        ui.kpi('Areas covered', String(Object.keys(areas).length), 'cost / BOM / OH / posting', 'settings'),
        ui.kpi('Retention', 'Protected', 'restricted purge rights', 'info', 'fav')
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Change log · group by area or user, choose columns, export' }));
      c.appendChild(CACC.grid('audit-log', [
        { key: 'id', label: 'ID' }, { key: 'ts', label: 'Timestamp' }, { key: 'user', label: 'User' }, { key: 'role', label: 'Role' }, { key: 'area', label: 'Area' },
        { key: 'action', label: 'Action', render: function (r) { return el('span', { class: 'badge sb-neutral', text: r.action }); } },
        { key: 'field', label: 'Field' }, { key: 'oldValue', label: 'Old value' }, { key: 'newValue', label: 'New value' }
      ], rows, { title: 'Audit trail' }));
      c.appendChild(el('div', { class: 'note', style: 'margin-top:14px' }, 'Auditing should cover cost records, overhead/allocation rules, BOM/routing changes affecting costing, posting-profile changes, and role assignments. Logs are independently reviewed and protected from purge.'));
    }
  };
})(typeof window !== 'undefined' ? window : this);
