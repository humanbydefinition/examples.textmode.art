# examples.textmode.art

Shared examples gallery for the [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem.

This React/Vite app aggregates example sketches from all textmode.js add-on libraries into
a single browsable gallery. Each library's synced `examples/` folder is still hosted at
its own URL path:

- `textmode.js/` — the core library (373 examples)
- `textmode.filters.js/` — GPU-accelerated image filters (14 examples)
- `textmode.synth.js/` — live synthesis engine (107 examples)
- `textmode.export.js/` — image/video export plugin (2 examples)
- `textmode.figlet.js/` — FIGlet font rendering (23 examples)

## Project structure

```
├── public/                   # ignored sync output served by Vite and copied into dist/
│   ├── vendor/               # library ESM bundles (synced from source repos)
│   ├── textmode.js/          # synced examples (whole examples/ folder)
│   ├── textmode.filters.js/
│   ├── textmode.synth.js/
│   ├── textmode.export.js/
│   └── textmode.figlet.js/
├── src/                      # React app, domain models, and CSS
├── scripts/                  # source sync, build fanout, and validation scripts
├── libraries.json            # library registry (drives sync, app routing, and CI sources)
├── index.html                # Vite app shell
├── vite.config.ts
├── tsconfig.json
├── scripts/prepare-sources.mjs # clone/build upstream sources in a temporary workspace
├── scripts/sync.mjs          # sync examples, sketch runners, import maps, and vendor bundles
├── scripts/postbuild.mjs     # copy the app shell to each library route in dist/
├── scripts/validate-static.mjs # validate manifests, sketch runners, vendor bundles, and dist routes
└── CNAME                     # custom domain
```

## How it works

Each library's `examples/` folder provides its manifest, sketch runner, sketch files, and
supporting assets. During sync, this project copies upstream examples and vendor bundles
into `public/`, removes obsolete source-local gallery runtimes, and injects a shared
browser-native [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)
into each sketch runner. The React app owns the landing page, library gallery, filtering,
preview state, and accessibility behavior.

`npm run sync` uses a temporary upstream clone/build workspace outside the project and
removes it when syncing finishes. The only generated folder normally left in the project
is ignored `public/`, because Vite serves it directly during local development.

Vite builds the app into `dist/` and copies the static `public/` payload with it. After
the Vite build, `scripts/postbuild.mjs` copies the app shell to each `dist/<library>/index.html`
route so direct GitHub Pages visits keep working.

## Setup

By default, syncing fetches each configured source repository from its latest `main`
commit, builds the library, and copies its `examples/` folder and ESM bundle into
ignored `public/`. Source repositories are cloned into a temporary workspace outside the
project and removed after the sync completes.

```bash
npm install    # install dev tooling (Prettier, markdownlint, serve)
npm run sync   # fetch latest main examples + vendor bundles from source repos
npm run dev    # start static server at http://localhost:5180
```

To sync a single library:

```bash
npm run sync -- textmode.filters.js
```

## Development

- `npm run dev` — start the Vite dev server
- `npm run sync` — fetch latest upstream `main`, build, and sync all libraries
- `npm run build` — build the Vite app into `dist/`
- `npm run format` — format with Prettier
- `npm run check` — format check + Markdown lint + ESLint + typecheck + tests + build + static validation

After publishing changes to a library's `main` branch, re-run `npm run sync` to update the
gallery from that latest public source.

## Deployment

Push to `main`. GitHub Actions runs `npm run sync:ci`, which clones each library source
repository from its configured `main` ref, runs `npm ci` and `npm run build`, syncs the latest
`examples/` folders and built ESM bundles into ignored `public/`, builds the React app into
ignored `dist/`, and deploys `dist/` to GitHub Pages at
[examples.textmode.art](https://examples.textmode.art).

## Adding a new library

- Add an entry to `libraries.json`
- Run `npm run sync -- <library-name>`
- Run `npm run check`
