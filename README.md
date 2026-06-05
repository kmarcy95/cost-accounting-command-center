# Cost Accounting Command Center

An AI-assisted **cost accounting workspace for manufacturing** — everything a consultant needs when stepping into a cost accounting role at a manufacturer, in one browser app. No backend, no build step.

**Live:** https://kmarcy95.github.io/cost-accounting-command-center/

![Fluent / Dynamics 365 light enterprise UI](https://img.shields.io/badge/UI-Fluent%20light%20enterprise-0f6cbd) ![No build](https://img.shields.io/badge/build-none%20·%20static-107c41) ![Tests](https://img.shields.io/badge/engine%20tests-26%20passing-107c41)

## Modules

| Module | What it does |
|--------|--------------|
| **Dashboard** | Executive cockpit — total variance, gross margin, inventory value, capacity, cost-flow strip, health score, variance bridge. |
| **Standard Costing & Variance** | Editable standards/actuals → material, labor, variable- & fixed-overhead variances with a live standard→actual bridge. |
| **Product Costing** | Job-order cost build-up, weighted-average **process costing** (equivalent units + reconciliation), and **ABC vs. traditional** with cost-distortion analysis. |
| **Inventory & Cost Flows** | FIFO / LIFO / weighted-average valuation side-by-side, plus the RM → WIP → FG → COGS roll-forward and overhead absorption. |
| **CVP & Break-Even** | Contribution margin, break-even, margin of safety, operating leverage, target profit, multi-product sales-mix, and an interactive break-even chart. |
| **Day-1 Diagnostic** | A consultant's first-week read: a weighted cost-system health score across five dimensions with prioritized recommendations. |

Seeded with a fictional manufacturer, **Stratton Manufacturing Co.**, so every module demos instantly. Edit any input and the numbers recompute live; reset or export/import scenarios from **Settings**.

## AI integration (hybrid)

Every module has an **AI Insights** panel.

- **Offline by default** — a deterministic, data-driven analyst narrative is generated from the computed figures. No key, no network.
- **Live upgrade (optional)** — paste your own Anthropic API key in **Settings** and the panels call Claude directly from the browser for richer commentary. The key is stored only in `localStorage` and sent only to `api.anthropic.com`; it falls back gracefully to the deterministic narrative on any error.

## Architecture

Vanilla JS, no framework, no build. Pure calculation **engines** are isolated from the DOM and unit-tested with Node's built-in test runner.

```
engines/   pure, tested math (variance, product costing, inventory, CVP, diagnostic)
assets/    seed data, store (localStorage), derived model, Fluent CSS, app core
ai/        deterministic insights + optional Claude client
views/     one render module per screen
tests/     node --test
```

The variance engine is reused from the KM Consulting cost-accounting suite (`positive = Unfavorable` sign convention).

## Run / test locally

```bash
# open the app
start index.html        # Windows  (or: open index.html / xdg-open index.html)

# run the engine unit tests
node --test tests/*.test.js
```

> On Node 24 / Windows the bare `node --test tests/` directory form is broken — use the glob `tests/*.test.js`.

## Deploy

Pushing to `main` triggers the GitHub Pages workflow (`.github/workflows/pages.yml`). All asset paths are relative and `.nojekyll` is present, so it serves correctly from the `/cost-accounting-command-center/` subpath.
