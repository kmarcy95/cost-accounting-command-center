/* Security & SOD — role-capability matrix and segregation-of-duties controls. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, ui = CACC.ui;

  CACC.views.rbac = {
    title: 'Security & Segregation of Duties',
    render: function (c) {
      var d = CACC.store.data(), caps = d.rbacCapabilities || [], matrix = d.rbacMatrix || [], sod = d.sodControls || [];
      c.appendChild(el('div', { class: 'grid g3' }, [
        ui.kpi('Roles', String(matrix.length), 'capability-bundled', 'users'),
        ui.kpi('Capabilities', String(caps.length), 'per cost-accounting area', 'settings'),
        ui.kpi('SOD controls', String(sod.length), 'maker-checker splits', 'variance')
      ]));
      c.appendChild(el('div', { class: 'section-title', text: 'Role-capability matrix · Y = full · L = limited/conditional · N = none' }));
      var head = el('tr', {}, [el('th', { text: 'Role' })].concat(caps.map(function (x) { return el('th', { class: 'num', text: x }); })));
      var body = el('tbody');
      matrix.forEach(function (r) {
        body.appendChild(el('tr', {}, [el('td', {}, [el('strong', { text: r.role })])].concat(r.caps.map(function (cp) {
          return el('td', { style: 'text-align:center' }, [el('span', { class: 'badge ' + (cp === 'Y' ? 'sb-good' : cp === 'L' ? 'sb-warn' : 'sb-neutral'), text: cp })]);
        }))));
      });
      c.appendChild(ui.card(null, 'Conservative pattern: cost maintenance and cost release separated; entry and posting separated; security admin separated from approval; auditors read-only.', [el('div', { style: 'overflow-x:auto' }, [el('table', { class: 'dt' }, [el('thead', {}, head), body])])]));
      c.appendChild(el('div', { class: 'section-title', text: 'Segregation-of-duties controls' }));
      var sb = el('tbody');
      sod.forEach(function (s) { sb.appendChild(el('tr', {}, [el('td', {}, [el('strong', { text: s.area })]), el('td', { text: s.split }), el('td', { class: 'muted', text: s.control })])); });
      c.appendChild(ui.card(null, null, [el('table', { class: 'dt' }, [el('thead', {}, el('tr', {}, [el('th', { text: 'Sensitive area' }), el('th', { text: 'Recommended split' }), el('th', { text: 'Control pattern' })])), sb])]));
    }
  };
})(typeof window !== 'undefined' ? window : this);
