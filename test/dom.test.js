const assert = require('node:assert/strict');
const test = require('node:test');

const { crawlDom } = require('../lib/dom');
const { parseArguments } = require('../bin/dom-testid');

test('prints visible body elements and data-testid values', async () => {
  const html = `<!doctype html>
    <html>
      <head><title>Checkout</title></head>
      <body>
        <main data-testid="checkout-panel">
          <button data-testid='submit-&quot;order&quot;' type="submit">Buy now</button>
          <span data-testid="hidden-message" style="display: none">Nope</span>
          <div aria-hidden="true"><span data-testid="aria-hidden-child">Nope</span></div>
          <div hidden data-testid="hidden-attribute">Nope</div>
        </main>
      </body>
    </html>`;
  const output = await crawlDom(`data:text/html,${encodeURIComponent(html)}`);

  assert.match(output, /^# document "Checkout"/);
  assert.match(output, /main data-testid="checkout-panel"/);
  assert.ok(output.includes('button data-testid="submit-\\"order\\"" type="submit"'));
  assert.match(output, /#text "Buy now"/);
  assert.doesNotMatch(output, /hidden-message|aria-hidden-child|hidden-attribute|Nope/);
  assert.doesNotMatch(output, /html|head|title/);
});

test('parses supported CLI options', () => {
  assert.deepEqual(
    parseArguments(['https://example.com', '--timeout', '5000', '--wait-until', 'load', '--headed']),
    {
      options: { timeout: 5000, waitUntil: 'load', headed: true },
      url: 'https://example.com/',
    },
  );
});

test('rejects a missing URL', () => {
  assert.throws(() => parseArguments([]), /A URL is required/);
});