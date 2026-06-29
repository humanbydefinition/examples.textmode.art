# examples.textmode.art

Shared examples gallery for the [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem.

This site aggregates example sketches from all textmode.js add-on libraries into a single
browsable gallery. Each library's `examples/` folder is hosted at its own URL path:

- `textmode.js/` — the core library (379 examples)
- `textmode.filters.js/` — GPU-accelerated image filters (14 examples)
- `textmode.synth.js/` — live synthesis engine (107 examples)
- `textmode.export.js/` — image/video export plugin (2 examples)
- `textmode.figlet.js/` — FIGlet font rendering (23 examples)

## Project structure

```
├── public/                   # static site root (served as-is, no build step)
│   ├── index.html            # landing page
│   ├── styles/               # landing page @layer CSS
│   ├── scripts/landing/      # landing page JavaScript
│   ├── vendor/               # library ESM bundles (synced from sibling repos)
│   ├── textmode.js/          # synced examples (whole examples/ folder)
│   ├── textmode.filters.js/
│   ├── textmode.synth.js/
│   ├── textmode.export.js/
│   └── textmode.figlet.js/
├── libraries.json            # library registry (drives sync + landing page)
├── scripts/sync.mjs          # sync examples + vendor bundles from sibling repos
└── CNAME                     # custom domain
```

## How it works

Each library's gallery page and sketch runner are copied
verbatim from the source repo. The galleries work unchanged — they are 100% relative-import
based. The sketch runners use browser-native [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)
to resolve bare specifiers (`textmode.js`, `textmode.filters.js`, etc.) to pre-built
ESM bundles in `public/vendor/`.

No Vite build step, no module bundling — the entire site is pure static files.

## Setup

The sibling textmode repositories must exist at `../textmode.js-dev/`,
`../textmode.filters.js/`, etc. and their `dist/` bundles must be built.

```bash
npm install    # install dev tooling (Prettier, markdownlint, serve)
npm run sync   # copy examples + vendor bundles from all sibling repos
npm run dev    # start static server at http://localhost:5180
```

To sync a single library:

```bash
npm run sync -- textmode.filters.js
```

## Development

- `npm run dev` — start the static server
- `npm run sync` — sync all libraries
- `npm run format` — format with Prettier
- `npm run check` — format check + Markdown lint

After making changes to a sibling library's `examples/` folder (new sketches, manifest
updates, etc.), re-run `npm run sync` to update the gallery.

## Deployment

Push to `main`. GitHub Actions deploys `public/` to GitHub Pages at
[examples.textmode.art](https://examples.textmode.art).

## Adding a new library

- Add an entry to `libraries.json`
- Run `npm run sync -- <library-name>`
- Commit the synced `public/<folder>/` and `public/vendor/<name>/` directories
