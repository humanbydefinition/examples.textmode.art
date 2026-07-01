# examples.textmode.art (✿◠‿◠)

<!-- markdownlint-disable MD044 -->
<div align="center">

<img alt="textmodejs_banner" src="https://github.com/user-attachments/assets/f03c2d74-7dc3-45cf-a0a5-043f9438231e" />

| [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/) [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) | [![Discord](https://img.shields.io/discord/1357070706181017691?color=5865F2&label=Discord&logo=discord&logoColor=white)](https://discord.gg/sjrw8QXNks) [![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-00447d?logo=gnu)](https://www.gnu.org/licenses/agpl-3.0) | [![ko-fi](https://shields.io/badge/ko--fi-donate-ff5f5f?logo=ko-fi)](https://ko-fi.com/V7V8JG2FY) [![GitHub Sponsors](https://img.shields.io/badge/sponsor-30363D?logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/humanbydefinition) |
|:-------------|:-------------|:-------------|

</div>
<!-- markdownlint-restore -->

`examples.textmode.art` is a browser-based gallery for the [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem. It aggregates the `examples/` folders from every library in the textmode.js ecosystem into one browsable site with live previews, search, and keyboard-friendly navigation.

## How it works

Each upstream library's `examples/` folder, ESM bundle, and sketch runner are synced into gitignored `public/` via `npm run sync`. The React SPA reads each library's `manifest.json` at runtime and presents the grouped example tree. A `postbuild` step fans the compiled shell out to each `dist/<library>/index.html` route so direct GitHub Pages URLs resolve.

## Local development

```bash
npm install        # installs deps + auto-syncs public/ (best-effort)
npm run sync       # re-sync manually (refresh, or if auto-sync was skipped/failed)
npm run dev        # http://localhost:5180
npm run build      # typecheck + vite build + postbuild route fan-out
```

To sync a single library: `npm run sync -- textmode.filters.js`.

## License

Distributed under the **AGPL-3.0** License. See [LICENSE](./LICENSE) for more information.

## Links

- [code.textmode.art](https://code.textmode.art) — documentation and guides
- [editor.textmode.art](https://editor.textmode.art) — browser-based code editor
- [synth.textmode.art](https://synth.textmode.art) — live coding environment
- [Discord community](https://discord.gg/sjrw8QXNks)
