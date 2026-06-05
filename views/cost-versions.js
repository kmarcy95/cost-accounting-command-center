/* Standard Cost Versions & Release — maker-checker activation governance. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, fmt = CACC.fmt, ui = CACC.ui, M = CACC.model;

  CACC.views.costVersions = {
    title: 'Cost Versions & Release',
    render: function (c) {
      var versions = M.costVersions();
      c.appendChild(el('div', { class: 'note', style: 'margin-bottom:4px' }, [el('strong', { text: 'Maker-checker control' }), ' — a cost accountant prepares pending standard costs; a controller/finance manager approves and activates them. Activation is blocked until approved; all changes are logged.']));
      versions.forEach(function (v) {
        var head = el('div', { class: 'card-head' }, [
          el('div', {}, [el('h2', { text: v.id + ' · ' + v.name }), el('div', { class: 'sub', text: 'Effective ' + v.effectiveFrom + ' · prepared by ' + v.preparedBy + (v.approvedBy ? ' · approved by ' + v.approvedBy : ' · awaiting approval') })]),
          el('span', { class: 'badge ' + (v.status === 'Active' ? 'sb-good' : 'sb-warn'), text: v.status })
        ]);
        var tb = el('tbody');
        v.items.forEach(function (it) { tb.appendChild(el('tr', {}, [el('td', {}, [el('strong', { text: it.sku })]), el('td', { class: 'num tnum', text: fmt.money(it.cost) })])); });
        var actions = v.status === 'Pending'
          ? el('div', { style: 'margin-top:12px;display:flex;gap:8px' }, [
            el('button', { class: 'btn btn-primary btn-sm', onclick: function () { CACC.toast('Approved & activated ' + v.id + ' (demo). In production this requires a different role than the preparer.'); } }, [CACC.icon('star'), 'Approve & activate']),
            el('button', { class: 'btn btn-ghost btn-sm', onclick: function () { CACC.toast('Returned ' + v.id + ' to preparer.'); } }, 'Return to preparer')
          ])
          : el('div', { class: 'muted', style: 'margin-top:10px', text: 'Active standard — editing is blocked; create a new pending version to change costs.' });
        c.appendChild(el('div', { class: 'card', style: 'margin-bottom:16px' }, [head, el('div', { class: 'card-pad' }, [
          el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Item' }), el('th', { class: 'num', text: 'Standard cost' })])), tb]), actions
        ])]));
      });
      c.appendChild(el('div', { class: 'section-title', text: 'Cost-master change log' }));
      c.appendChild(CACC.grid('cost-version-log', [
        { key: 'ts', label: 'Timestamp' }, { key: 'user', label: 'User' }, { key: 'role', label: 'Role' }, { key: 'area', label: 'Area' }, { key: 'action', label: 'Action' }, { key: 'field', label: 'Field' }, { key: 'oldValue', label: 'Old' }, { key: 'newValue', label: 'New' }
      ], (CACC.store.data().auditLog || []).filter(function (a) { return a.area === 'Cost version'; }), { title: 'Change log' }));
      c.appendChild(ui.aiPanel('costVersions', M.ctx.costVersions()));
    }
  };
})(typeof window !== 'undefined' ? window : this);
