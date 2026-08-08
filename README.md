# OmniUnit — Universal Unit Converter

OmniUnit is a universal conversion tool with a unit-aware calculator. It supports lots of units — everything you want, and a bunch of stuff you've never heard of. It is SI-focused; all values are stored internally as SI base unit expressions. You can do a simple conversion or paste in a full expression: copy "127.2342 J⋅s⁻¹" from a paper and paste it into the calculator — it will work. Type "7yd" and it parses that too. Units are organized into SI areas to reduce confusion. Power has power-related units: Watts, BTU, etc. No scrolling through thousands of units to find the one you want. Archaic and local units are also supported, but separately. You want tatami to m²? It's got you covered.

It's localized for about a dozen languages and supports the most common number formats worldwide. You don't need to understand English to use it. It defaults to English number formats and the en locale. So you need to get at least that far into the app; otherwise, it's not readable.

The app has four main panes, only two of which are visible at the same time. The default top is the unit conversion. The bottom pane is an RPN unit-aware calculator. You can paste or type in just about anything, and it will work. The conversions for the output of the calculators are limited to SI base and derived units. To convert further, bring the result back to the conversion pane.

There are two additional panes. You can swap out the conversion pane for a build-your-own unit. You can paste in just about anything (like the calculator), and it will reduce that to a base SI expression. You can take it from there. There's also a very simple calculator that will handle most unit arithmetic if you don't like RPN calculators.

The app is a single, standalone .html file. It references no other files and has no links. You can bring it anywhere you have a browser, and it will work. No network or packaging needed. I've also provided a GitHub repository with the project. It's a bog-standard TypeScript/React project. I built it on Replit, but that's not required. You're free to use the .html file or the source code any way you want.

> This is the only hyperlink or external reference in the .html distribution. You can click on it or not. It's not part of the app.

GitHub: <https://github.com/tyohDeveloper/OmniUnitConverter-Calculator>

> Note: I used an AI assistant to build most of this. It has been tested and includes unit tests. To the best of my knowledge the conversions are correct, but your mileage may vary.

---

## License

Copyright © 2025 David Hoyt. MIT License — Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

---

## For Developers

### Tech Stack

- **Framework**: React 19 + TypeScript, built with Vite
- **UI**: shadcn/ui (Radix UI) + Tailwind CSS v4
- **Routing**: Wouter
- **Output**: `vite-plugin-singlefile` produces a single self-contained `index.html`

### Build

```bash
npm install
npm run build
# Output: dist/public/index.html
```

### Development

```bash
npm run dev
```

### Testing

```bash
npm test        # Vitest unit tests
npm run e2e     # Playwright end-to-end tests
```

## Coding & architecture standards

All code in this repository follows **[`docs/CODING-STANDARDS.md`](docs/CODING-STANDARDS.md)** — the binding rules for layer boundaries, purity, function and file size limits, naming, data externalization, testing, and dependency budgets. Read it before making changes.

Key hard limits: exported function bodies ≤ 20 lines; one export per pure-logic file; pure-core files ≤ 100 lines, other pure/state/controller files ≤ 150, view files ≤ 250 with ≤ 80 lines of markup in the return. §0 of that file maps those layer roles to this repository's actual directories.

The canonical source of truth is the `programming` project knowledge wiki page `concepts/coding-architecture-standards`; the in-repo file is a derived copy. Amend the wiki first, then propagate here.
