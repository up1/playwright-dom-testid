const { chromium } = require('playwright');

const WAIT_UNTIL_VALUES = new Set([
  'commit',
  'domcontentloaded',
  'load',
  'networkidle',
]);

async function crawlDom(url, options = {}) {
  const {
    headed = false,
    timeout = 30000,
    waitUntil = 'domcontentloaded',
  } = options;

  if (!WAIT_UNTIL_VALUES.has(waitUntil)) {
    throw new Error(`Invalid wait state: ${waitUntil}`);
  }

  const browser = await chromium.launch({ headless: !headed });

  try {
    const page = await browser.newPage();
    await page.goto(url, { timeout, waitUntil });

    return await page.evaluate(() => {
      const attributesToKeep = [
        'data-testid',
        'id',
        'role',
        'name',
        'type',
        'href',
        'placeholder',
        'aria-label',
        'alt',
        'title',
      ];

      function quote(value) {
        return JSON.stringify(value);
      }

      function isHidden(element) {
        if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
          return true;
        }

        const style = window.getComputedStyle(element);
        return style.display === 'none' || style.visibility === 'hidden';
      }

      function render(element, depth) {
        if (isHidden(element)) {
          return [];
        }

        const indentation = '  '.repeat(depth);
        const attributes = attributesToKeep
          .filter((name) => element.hasAttribute(name))
          .map((name) => `${name}=${quote(element.getAttribute(name))}`)
          .join(' ');
        const line = `${indentation}${element.tagName.toLowerCase()}${attributes ? ` ${attributes}` : ''}`;
        const lines = [line];

        for (const child of element.childNodes) {
          if (child.nodeType === Node.ELEMENT_NODE) {
            lines.push(...render(child, depth + 1));
          } else if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent.replace(/\s+/g, ' ').trim();
            if (text) {
              lines.push(`${'  '.repeat(depth + 1)}#text ${quote(text)}`);
            }
          }
        }

        return lines;
      }

      return [
        `# document ${quote(document.title)}`,
        ...render(document.body, 0),
      ].join('\n');
    });
  } finally {
    await browser.close();
  }
}

module.exports = { crawlDom, WAIT_UNTIL_VALUES };