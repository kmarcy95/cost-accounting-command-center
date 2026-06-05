/* Optional live-AI path. If the user has stored an Anthropic API key in Settings,
 * sends the structured prompt from insights.js to the Claude Messages API directly
 * from the browser. Falls back to the deterministic narrative on any error or no key.
 * The key is read from localStorage and never sent anywhere except api.anthropic.com.
 */
(function (root) {
  'use strict';
  var CACC = (root.CACC = root.CACC || {});

  var ENDPOINT = 'https://api.anthropic.com/v1/messages';

  function available() { return !!CACC.store.getKey(); }

  /* Returns a Promise<string> of the narrative text.
   * On no-key or failure, resolves with the deterministic paragraphs joined. */
  function narrate(moduleKey, ctx) {
    var baseline = CACC.insights.generate(moduleKey, ctx);
    var fallback = baseline.paragraphs.join('\n\n');
    var key = CACC.store.getKey();
    if (!key) return Promise.resolve({ text: fallback, source: 'deterministic' });

    var prompt = CACC.insights.buildPrompt(moduleKey, ctx);
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CACC.store.getModel(),
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    })
      .then(function (res) {
        if (!res.ok) return res.text().then(function (t) { throw new Error('HTTP ' + res.status + ': ' + t.slice(0, 160)); });
        return res.json();
      })
      .then(function (data) {
        var text = (data && data.content && data.content[0] && data.content[0].text) || fallback;
        return { text: text, source: 'claude' };
      })
      .catch(function (err) {
        return { text: fallback, source: 'fallback', error: String(err.message || err) };
      });
  }

  CACC.claude = { available: available, narrate: narrate };
})(typeof window !== 'undefined' ? window : this);
