# Contributing to examples.textmode.art

First off, thank you for considering contributing to `examples.textmode.art`!

This project aggregates the `examples/` folders from every library in the textmode.js ecosystem into a single browsable gallery. App and infrastructure contributions are welcome. Example sketches are curated in their upstream library repositories.

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [How sync and build work](#how-sync-and-build-work)
- [Testing](#testing)
- [Code style](#code-style)
- [Adding a new library](#adding-a-new-library)
- [Deployment](#deployment)
- [Pull request process](#pull-request-process)
- [Reporting bugs](#reporting-bugs)
- [Suggesting features](#suggesting-features)

## Code of conduct

This project and everyone participating in it is governed by the [Contributor Covenant 3.0 Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [hello@textmode.art](mailto:hello@textmode.art).

## Getting started

1. **Fork the repository** on GitHub at [humanbydefinition/examples.textmode.art](https://github.com/humanbydefinition/examples.textmode.art).
1. **Clone your fork** locally:

    ```bash
    git clone https://github.com/YOUR_USERNAME/examples.textmode.art.git
    cd examples.textmode.art
    ```

1. **Add the upstream remote**:

    ```bash
    git remote add upstream https://github.com/humanbydefinition/examples.textmode.art.git
    ```

## Development setup

### Prerequisites

- Node.js v20.8.1 or newer
- npm

### Installation

```bash
npm install
```

### Available scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server at `http://localhost:5180` |
| `npm run sync` | Fetch, build, and sync all upstream sources into `public/` (accepts `-- <library>` to target one) |
| `npm run build` | TypeScript check, Vite production build, then postbuild route fan-out |
| `npm run preview` | Serve the built `dist/` at `http://localhost:4180` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint across the project |
| `npm run test` | Vitest unit and integration tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run validate:static` | Validate manifests, sketch runners, vendor bundles, import maps, source metadata, and dist routes |
| `npm run format` | Apply Prettier formatting to all non-excluded files |
| `npm run check:format` | Prettier formatting check |
| `npm run lint:md` | markdownlint check for all Markdown files |
| `npm run check` | **Full pre-merge gate** — format check, markdown lint, ESLint, typecheck, tests, build, and static validation |

### Environment variables

| Variable | Description |
|---|---|
| `TEXTMODE_EXAMPLES_SOURCE_ROOT` | Overrides the temporary workspace directory for upstream clone-build steps (default: OS temp) |
| `TEXTMODE_SYNC_STRICT` | When `1`, synchronization collects all problems and exits non-zero instead of warning (set automatically by `sync-latest.mjs`) |

## Project structure

```text
.
├── .github/
│   ├── FUNDING.yml                       # GitHub Sponsors / ko-fi / custom funding link
│   └── workflows/
│       └── deploy.yml                    # CI: sync:ci → check → build → deploy Pages
├── .markdownlint.jsonc                   # markdownlint rule configuration
├── .markdownlint-cli2.jsonc              # markdownlint globs and ignores
├── .prettierrc                           # Prettier: tabs, single quotes, trailing commas
├── .prettierignore                       # Prettier exclusion paths
├── CODE_OF_CONDUCT.md                    # Contributor Covenant 3.0
├── CONTRIBUTING.md                       # This file
├── LICENSE                               # GNU AGPL-3.0-or-later
├── README.md                             # Project overview and quickstart
├── eslint.config.js                      # ESLint 9 flat config
├── index.html                            # Vite SPA shell
├── libraries.json                        # Library registry — single source of truth
├── package.json                          # Dependencies, scripts, metadata
├── tsconfig.json                         # TypeScript strict config, ES2022 target
├── vite.config.ts                        # Vite + React plugin + Vitest config
│
├── public/                               # [gitignored] Synced examples and vendor bundles
│   ├── source-metadata.json              # Provenance: commit SHAs, sketch counts per library
│   ├── vendor/                           # Upstream ESM bundles (one subdirectory per library)
│   │   ├── textmode.js/
│   │   ├── textmode.filters.js/
│   │   ├── textmode.synth.js/
│   │   ├── textmode.export.js/
│   │   └── textmode.figlet.js/
│   └── <library>/                        # Per-library synced examples/ folders
│       ├── manifest.json                 # Group → subgroup → example index
│       ├── sketch.html                   # Standalone sketch runner with shared import map
│       ├── sketch.js                     # Per-example sketch source files
│       └── ...
│
├── src/
│   ├── main.tsx                          # Entry point — renders <App /> under StrictMode
│   ├── domain/                           # Framework-free business logic
│   │   ├── types.ts                      # Shared TypeScript interfaces
│   │   ├── registry.ts                   # Normalizes libraries.json at build time
│   │   ├── manifest.ts                   # Normalizes per-library manifest.json at runtime
│   │   ├── routes.ts                     # Client-side path-based routing
│   │   ├── search.ts                     # Case-insensitive group/subgroup filtering
│   │   └── urls.ts                       # Link builders and hash-based state helpers
│   ├── styles/
│   │   └── index.css                     # All CSS via @layer (tokens, layout, landing, etc.)
│   └── ui/
│       ├── App.tsx                       # Root router — landing, library, or 404
│       ├── LandingPage.tsx               # Library card grid with async example count
│       ├── LibraryPage.tsx               # Example browser with filter, preview, and deep links
│       ├── NotFoundPage.tsx              # 404 page for unknown library paths
│       └── PageFooter.tsx                # Shared footer with ecosystem links
│
├── scripts/
│   ├── lib/                              # Shared script utilities
│   │   ├── files.mjs                     # readJson / writeJson helpers
│   │   ├── import-map.mjs                # Builds the shared import map injected into sketch.html
│   │   ├── paths.mjs                     # Root, public, vendor, dist, and source path constants
│   │   └── registry.mjs                  # Script-side registry loader and validator
│   ├── prepare-sources.mjs               # Clone + npm ci/build upstream repositories
│   ├── sync.mjs                          # Copy examples + vendor bundles + inject import maps
│   ├── sync-latest.mjs                   # Orchestrator: temp workspace → prepare → sync → cleanup
│   ├── postbuild.mjs                     # Fan out dist/index.html to each dist/<library>/index.html
│   └── validate-static.mjs               # Post-build validation of all synced artifacts
│
└── tests/
    ├── setup.ts                          # jest-dom matchers + cleanup afterEach
    ├── domain/
    │   ├── manifest.test.ts              # normalizeManifest, getExamplePath, isValidExamplePath
    │   ├── registry.test.ts              # normalizeRegistry, validateLibraryConfig
    │   ├── search.test.ts                # filterExampleGroups matching behavior
    │   └── urls.test.ts                  # getLibraryHref, getExampleHref, getExampleSourceHref
    └── ui/
        └── App.test.tsx                  # Full SPA integration test (landing, library, 404)
```

## How sync and build work

### Single source of truth

All metadata about upstream libraries lives in `libraries.json`. Each entry declares:

- `name`, `repo`, `folder`, `bundle` — identity and paths
- `description`, `tagline`, `license`, `github` — display and footer data
- `source.repository`, `source.ref`, `source.prepare` — how to fetch and build (`build` runs `npm ci && npm run build`; `prebuilt` uses the committed dist)

This file drives the sync pipeline, the React app's routing, the import maps injected into sketch runners, CI's source list, and static validation.

### Sync pipeline

`npm run sync` → `scripts/sync-latest.mjs` orchestrates three steps:

1. **Create a temporary workspace** in the OS temp directory.
1. **`scripts/prepare-sources.mjs`** — for each library (or a single targeted one via `npm run sync -- <name>`), `git clone --depth 1 --branch <ref>` the upstream repository, optionally run `npm ci && npm run build`, and record provenance (commit SHA, sketch count) into `public/source-metadata.json`.
1. **`scripts/sync.mjs`** — clears app-owned legacy static assets from `public/`, copies the upstream `examples/` folder into `public/<folder>/`, removes the source-local gallery runtime, copies the built ESM bundle to `public/vendor/<name>/index.js`, and injects the shared import map (mapping every library name to `../vendor/<name>/index.js`) into each `sketch.html`.
1. **Cleanup** — the temp workspace is removed.

The `public/` directory is gitignored; everything is regenerated from upstream source at sync time.

### Build pipeline

`npm run build` runs three steps:

1. `tsc --noEmit` — TypeScript type check.
1. `vite build` — bundles the React SPA into `dist/` and copies `public/` alongside it.
1. `scripts/postbuild.mjs` — copies `dist/index.html` to `dist/<library>/index.html` for every registered library. This ensures direct hits to `https://examples.textmode.art/<library>/` return the SPA shell instead of a GitHub Pages 404.

### Sketch runner

Each library's `sketch.html` is a standalone page that:

- Loads the shared import map (all five `textmode.*` libraries mapped to vendor bundles).
- Reads `?path=` from the URL query, validates path segments with `^[A-Za-z0-9_.-]+$`, and rejects traversal attempts.
- Sets `<base href="./<path>/">` and dynamically injects `<script src="./sketch.js">`.
- Exposes `window.textmode`, `window.TextmodeErrorLevel`, and `window.__TEXTMODE_EXAMPLE_PATH__`.

## Testing

This project uses **Vitest 4** with a **jsdom** environment and **@testing-library/react**.

### Test structure

- **Domain unit tests** (`tests/domain/`) — pure-function tests for `registry.ts`, `manifest.ts`, `search.ts`, and `urls.ts`. No DOM or React rendering.
- **UI integration test** (`tests/ui/App.test.tsx`) — renders the full `<App />` with a mocked `fetch`, covering the landing page, library browsing, search filtering, example preview, hash-based deep linking, and the 404 page. Also tests error states (e.g., a 500 manifest response).

### Running tests

```bash
npm test              # single run
npm run test:watch    # watch mode
```

Always run `npm run check` before opening a pull request — it includes the full test suite plus format, lint, typecheck, build, and static validation.

## Code style

### Prettier

This project uses Prettier (configured in `.prettierrc`):

- Tabs for indentation, tab width 4
- Single quotes
- Semicolons
- Trailing commas where valid (ES5 style)
- Print width 120
- LF line endings

Run `npm run format` before committing.

### ESLint

ESLint 9 flat config enforces `@eslint/js` recommended rules, `typescript-eslint` recommended rules, and `eslint-plugin-jsx-a11y` recommended rules. Use `npm run lint` to check.

### TypeScript

Strict mode is enabled. Prefer `const` over `let`, prefix unused variables with `_`, and keep the `src/domain/` layer framework-free.

### Markdown

Markdown is linted with `markdownlint-cli2` (see `.markdownlint.jsonc`):

- Use ATX-style headings (`##`), not closed (`## foo ##`).
- Use `-` for unordered lists and `1.` for ordered lists (all items must use `1.`; Markdown auto-numbers them).
- Nest list items with 4-space indent.
- Fenced code blocks with backticks.
- Italic with `_underscore_`, bold with `**asterisks**`.
- Tables require leading and trailing pipes on every row.

Proper nouns must use their ecosystem-cased form: `textmode.js`, `Prettier`, `ESLint`, `TypeScript`, `Vite`, `GitHub`, `Node.js`, `HTML`, `CSS`, `JavaScript`, `WebGL`, `GLSL`, `FIGlet`, `PETSCII`.

Run `npm run lint:md` to check, or `npm run lint:md:fix` to auto-fix.

## Adding a new library

1. **Add an entry to `libraries.json`** with all required fields (`name`, `repo`, `folder`, `bundle`, `github`, `license`, `source.repository`, `source.ref`, `source.prepare`). Set `source.prepare` to `"build"` (run `npm ci && npm run build` after cloning) or `"prebuilt"` (use the committed dist as-is). Add optional `docsUrl`, `tagline`, and `description`.
1. **Sync the new library**:

    ```bash
    npm run sync -- <library-name>
    ```

1. **Run the full check**:

    ```bash
    npm run check
    ```

    The postbuild step automatically fans the app shell into `dist/<folder>/index.html` for the new library route. Static validation verifies the manifest, sketch runner, import map, vendor bundle, source metadata, and dist route.

Because the import map is shared across all sketch runners and lists every library, adding a library automatically makes it importable from every other library's `sketch.html` after the next sync.

## Deployment

Pushing to `main` triggers the [GitHub Actions deploy workflow](.github/workflows/deploy.yml):

1. `npm ci`
1. `npm run sync:ci` — clones each upstream library at its configured `main` ref, builds as needed, syncs examples and vendor bundles, strict mode.
1. `npm run check` — the full pre-merge gate.
1. `actions/configure-pages` + `actions/upload-pages-artifact` (upload `dist/`) + `actions/deploy-pages`.

Everything in `public/` and `dist/` is gitignored and fully regenerated at deploy time — no checked-in build artifacts.

## Pull request process

1. **Create a feature branch** from `main`:

    ```bash
    git checkout -b feat/your-change
    ```

1. **Make your changes** following the guidelines above.
1. **Run `npm run check`** — the full gate must pass locally.
1. **Commit your changes** with a clear message:

    ```bash
    git commit -m "feat: add support for ..."
    ```

    This project uses [Conventional Commits](https://www.conventionalcommits.org/):

    | Type | Usage |
    |---|---|
    | `feat` | New feature for the user |
    | `fix` | Bug fix |
    | `docs` | Documentation changes |
    | `style` | Code style (formatting, etc.) |
    | `refactor` | Code refactoring |
    | `perf` | Performance improvement |
    | `test` | Adding or updating tests |
    | `build` | Build system or dependency changes |
    | `ci` | CI configuration or scripts |
    | `chore` | Maintenance tasks |
    | `revert` | Revert a previous change |

    Keep commit headers under 100 characters.
1. **Push to your fork** and open a Pull Request on GitHub with a clear title and description. Reference any related issues.
1. **Wait for review** — maintainers will review your PR and may suggest changes.

## Reporting bugs

Found a bug? Please open an issue with:

1. A clear title describing the problem.
1. Steps to reproduce the issue.
1. Expected behavior vs. actual behavior.
1. Environment info (browser, OS).
1. Screenshots or screen recordings if applicable.

## Suggesting features

Have an idea? We'd love to hear it!

1. Check existing issues to avoid duplicates.
1. Open a new issue with a clear description.
1. Explain how the feature would be used and why it would benefit the gallery.
