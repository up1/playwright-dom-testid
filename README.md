# DOM Test ID CLI

Render a URL with Chromium and print visible elements under its `<body>` as a compact text tree. Hidden subtrees are omitted, while useful attributes such as every visible `data-testid` and its value are retained.

Install dependencies:

```sh
npm install

npm install -g
```

How to use:
```
npx dom-testid https://seleniumbase.io/coffee/
npx dom-testid https://seleniumbase.io/coffee/ --wait-until load
```

Example output:

```text
# document "Example"
body
  main data-testid="content"
    button data-testid="submit" type="button"
      #text "Submit"
```

Run `npx dom-testid --help` for navigation and headed-browser options.

## Development

```sh
npm test
npm run lint
npm run lint:fix
```

ESLint checks code quality, while Prettier checks formatting. `eslint-config-prettier` disables ESLint rules that would conflict with Prettier.
