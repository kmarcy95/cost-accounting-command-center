/* Settings view — AI key/model, scenario reset, export/import. */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});
  CACC.views = CACC.views || {};
  var el = CACC.dom.el, ui = CACC.ui;

  CACC.views.settings = {
    title: 'Settings',
    render: function (c) {
      /* ---- AI ---- */
      var keyInput = el('input', { type: 'password', placeholder: 'sk-ant-...', value: CACC.store.getKey() });
      var modelSelect = el('select', {});
      [['claude-opus-4-8', 'Claude Opus 4.8 (most capable)'], ['claude-sonnet-4-6', 'Claude Sonnet 4.6 (balanced)'], ['claude-haiku-4-5-20251001', 'Claude Haiku 4.5 (fastest)']]
        .forEach(function (m) {
          var o = el('option', { value: m[0], text: m[1] });
          if (m[0] === CACC.store.getModel()) o.selected = true;
          modelSelect.appendChild(o);
        });
      var status = el('div', { class: 'muted', style: 'font-size:12.5px;margin-top:6px' });
      setStatus();

      function setStatus() {
        status.textContent = CACC.store.getKey()
          ? 'Live AI enabled — insight panels will call Claude directly from your browser.'
          : 'No key set — insight panels use the built-in deterministic analysis (fully offline).';
      }

      var saveBtn = el('button', { class: 'btn btn-primary', text: 'Save AI settings',
        onclick: function () {
          CACC.store.setKey(keyInput.value.trim());
          CACC.store.setModel(modelSelect.value);
          setStatus();
          toast('AI settings saved.');
        } });
      var clearBtn = el('button', { class: 'btn btn-ghost', text: 'Clear key',
        onclick: function () { keyInput.value = ''; CACC.store.setKey(''); setStatus(); toast('Key cleared.'); } });

      var aiCard = ui.card('AI integration', 'Bring your own Anthropic API key — it is stored only in this browser and sent only to api.anthropic.com', [
        el('div', { class: 'field', style: 'margin-bottom:14px' }, [el('label', { text: 'Anthropic API key' }), keyInput]),
        el('div', { class: 'field', style: 'max-width:340px;margin-bottom:14px' }, [el('label', { text: 'Model' }), modelSelect]),
        el('div', { style: 'display:flex;gap:10px' }, [saveBtn, clearBtn]),
        status,
        el('div', { class: 'note', style: 'margin-top:14px' },
          'Without a key the app is fully functional — every insight panel still produces data-driven analysis. A key simply upgrades those panels to live, richer Claude narratives.')
      ]);

      /* ---- Data ---- */
      var importArea = el('textarea', { class: 'input', rows: 6, style: 'font-family:var(--mono);font-size:12.5px', placeholder: 'Paste scenario JSON here to import…' });
      var dataCard = ui.card('Scenario data', 'Stratton Manufacturing Co. demo data is loaded by default', [
        el('div', { style: 'display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px' }, [
          el('button', { class: 'btn btn-ghost', text: 'Export scenario (copy JSON)',
            onclick: function () {
              navigator.clipboard && navigator.clipboard.writeText(CACC.store.exportJSON());
              importArea.value = CACC.store.exportJSON();
              toast('Scenario JSON exported to the box below (and clipboard).');
            } }),
          el('button', { class: 'btn btn-ghost', text: 'Import from box',
            onclick: function () {
              try { CACC.store.importJSON(importArea.value); toast('Scenario imported.'); CACC.rerender(); }
              catch (e) { toast('Import failed: invalid JSON.', true); }
            } }),
          el('button', { class: 'btn btn-ghost', text: 'Reset to demo data',
            onclick: function () { CACC.store.reset(); toast('Reset to Stratton demo data.'); CACC.rerender(); } })
        ]),
        importArea
      ]);

      var toastBox = el('div', { style: 'position:fixed;bottom:24px;right:24px;z-index:1000' });

      c.appendChild(el('div', { class: 'grid g2' }, [aiCard, dataCard]));
      c.appendChild(toastBox);

      function toast(msg, bad) {
        var t = el('div', { class: 'card card-pad', style: 'box-shadow:var(--shadow-lg);margin-top:10px;border-left:4px solid ' + (bad ? 'var(--bad)' : 'var(--good)'), text: msg });
        toastBox.appendChild(t);
        setTimeout(function () { t.remove(); }, 3500);
      }
    }
  };
})(typeof window !== 'undefined' ? window : this);
