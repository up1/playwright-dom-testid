#!/usr/bin/env node

const { crawlDom, WAIT_UNTIL_VALUES } = require("../lib/dom");

const HELP = `Usage: dom-testid <url> [options]

Render a web page and print its visible DOM, including data-testid values.

Options:
  --headed                 Show the browser window
  --timeout <milliseconds> Navigation timeout (default: 30000)
  --wait-until <state>     commit, domcontentloaded, load, or networkidle
  -h, --help               Show this help`;

function parseArguments(arguments_) {
  const options = {};
  let url;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];

    if (argument === "-h" || argument === "--help") {
      return { help: true };
    }
    if (argument === "--headed") {
      options.headed = true;
      continue;
    }
    if (argument === "--timeout") {
      const timeout = Number(arguments_[index + 1]);
      if (!Number.isInteger(timeout) || timeout <= 0) {
        throw new Error("--timeout must be a positive integer");
      }
      options.timeout = timeout;
      index += 1;
      continue;
    }
    if (argument === "--wait-until") {
      const waitUntil = arguments_[index + 1];
      if (!WAIT_UNTIL_VALUES.has(waitUntil)) {
        throw new Error(
          "--wait-until must be commit, domcontentloaded, load, or networkidle",
        );
      }
      options.waitUntil = waitUntil;
      index += 1;
      continue;
    }
    if (argument.startsWith("-")) {
      throw new Error(`Unknown option: ${argument}`);
    }
    if (url) {
      throw new Error("Only one URL can be crawled at a time");
    }
    url = argument;
  }

  if (!url) {
    throw new Error("A URL is required");
  }

  const parsedUrl = new URL(url);
  if (!["http:", "https:", "file:", "data:"].includes(parsedUrl.protocol)) {
    throw new Error(`Unsupported URL protocol: ${parsedUrl.protocol}`);
  }

  return { options, url: parsedUrl.href };
}

async function main() {
  try {
    const parsed = parseArguments(process.argv.slice(2));
    if (parsed.help) {
      console.log(HELP);
      return;
    }

    console.log(await crawlDom(parsed.url, parsed.options));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error("Run dom-testid --help for usage.");
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseArguments };
