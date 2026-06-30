# examples.textmode.art

Shared examples gallery for the [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem.

This site aggregates example sketches from all textmode.js add-on libraries into a single
browsable gallery. Each library's `examples/` folder is hosted at its own URL path:

- `textmode.js/` — the core library (373 examples)
- `textmode.filters.js/` — GPU-accelerated image filters (14 examples)
- `textmode.synth.js/` — live synthesis engine (107 examples)
- `textmode.export.js/` — image/video export plugin (2 examples)
- `textmode.figlet.js/` — FIGlet font rendering (23 examples)

## Project structure

```
├── public/                   # static site root (served as-is, no build step)
│   ├── index.html            # generated landing page
│   ├── styles/               # landing page @layer CSS
│   ├── scripts/library-gallery/ # shared generated library gallery runtime
│   ├── vendor/               # library ESM bundles (synced from source repos)
│   ├── textmode.js/          # synced examples (whole examples/ folder)
│   ├── textmode.filters.js/
│   ├── textmode.synth.js/
│   ├── textmode.export.js/
│   └── textmode.figlet.js/
├── libraries.json            # library registry (drives sync, CI sources, and landing page)
├── scripts/prepare-sources.mjs # clone/build upstream sources for CI deployment
├── scripts/sync.mjs          # sync examples + vendor bundles from source repos
└── CNAME                     # custom domain
```

## How it works

Each library's `examples/` folder provides its manifest, sketch runner, sketch files, and
supporting assets. During sync, this project generates the landing page and each library
index page from the root `libraries.json` registry, while keeping sketch pages runnable with
browser-native [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)
that resolve bare specifiers (`textmode.js`, `textmode.filters.js`, etc.) to pre-built ESM
bundles in `public/vendor/`.

No Vite build step, no module bundling — the entire site is pure static files.

## Setup

By default, syncing fetches each configured source repository from its latest `main`
commit, builds the library, and copies its `examples/` folder and ESM bundle into
`public/`. Source repositories are cloned into the ignored `.sources/` workspace, which is
safe to delete locally and will be recreated by the next sync.

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

- `npm run dev` — start the static server
- `npm run sync` — fetch latest upstream `main`, build, and sync all libraries
- `npm run format` — format with Prettier
- `npm run check` — format check + Markdown lint

After publishing changes to a library's `main` branch, re-run `npm run sync` to update the
gallery from that latest public source.

## Deployment

Push to `main`. GitHub Actions runs `npm run sync:ci`, which clones each library source
repository from its configured `main` ref, runs `npm ci` and `npm run build`, syncs the latest
`examples/` folders and built ESM bundles into `public/`, commits generated `public/`
changes back with `[skip ci]`, and deploys `public/` to GitHub Pages at
[examples.textmode.art](https://examples.textmode.art).

## Adding a new library

- Add an entry to `libraries.json`
- Run `npm run sync -- <library-name>`
- Commit the synced `public/<folder>/` and `public/vendor/<name>/` directories
