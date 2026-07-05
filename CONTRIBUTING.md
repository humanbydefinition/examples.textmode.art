# Contributing to examples.textmode.art

Thanks for your interest in improving `examples.textmode.art`.

This project is the shared examples gallery for the textmode.js ecosystem. Contributions to the app, build pipeline, documentation, tests, and library integration are welcome. Example sketches themselves usually belong in their upstream library repositories.

## Code of conduct

Participation in this project is covered by the [Contributor Covenant 3.0 Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to [hello@textmode.art](mailto:hello@textmode.art).

## Before you start

- Check existing issues and pull requests before opening duplicate work.
- Keep changes focused. Small, reviewable pull requests are preferred.
- Open an issue first for large features, architectural changes, or changes that affect the sync/deploy pipeline.
- Do not commit generated output from `public/`, `dist/`, `node_modules/`, or temporary source checkouts.

## Development setup

Requirements:

- Node.js v20.8.1 or newer
- npm

Install dependencies:

```bash
npm install
```

`npm install` runs a best-effort sync of upstream examples into `public/`. If that sync fails because you are offline or an upstream repository is temporarily unavailable, the install still succeeds. Run `npm run sync` when the issue is resolved.

Start the local app:

```bash
npm run dev
```

The dev server runs at `http://localhost:5180`.

## Common commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run sync` | Refresh upstream examples and vendor bundles |
| `npm run sync -- <library>` | Refresh one library |
| `npm run test` | Run Vitest |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run build` | Build the production site |
| `npm run validate:static` | Validate synced static assets and routes |
| `npm run check` | Run the full pre-merge gate |

## Deployments

The GitHub Pages workflow lives at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

- Pushes to `main` deploy automatically.
- Maintainers can manually redeploy from **Actions** -> `deploy` -> **Run workflow**.
- Manual deploys are intentionally limited to the `main` branch so production deploy behavior stays consistent.

## Project conventions

- `libraries.json` is the source of truth for registered libraries.
- Synced upstream assets live in gitignored `public/` and are regenerated with `npm run sync`.
- App-owned source lives in `src/`.
- Framework-free domain logic belongs in `src/domain/`.
- React UI belongs in `src/ui/`.
- Tests live under `tests/domain/` and `tests/ui/`.
- Example-specific docs link mapping lives in `src/domain/docs.ts`.

Style is enforced by Prettier, ESLint, TypeScript, and markdownlint. Run `npm run check` before opening a pull request.

## Adding or updating a library

1. Update `libraries.json` with the library metadata.
1. Add or update docs mappings in `src/domain/docs.ts` when examples need specific API targets.
1. Sync the library:

    ```bash
    npm run sync -- <library-name>
    ```

1. Run the full check:

    ```bash
    npm run check
    ```

## Pull requests

1. Fork the repository and create a branch from `main`.
1. Make a focused change with tests or documentation updates where appropriate.
1. Run `npm run check`.
1. Open a pull request with a clear title and description.
1. Link related issues and call out any follow-up work.

Use clear commit messages. Conventional Commit prefixes such as `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `build:`, and `chore:` are encouraged.

## Reporting bugs

Please include:

- A short description of the issue.
- Steps to reproduce it.
- Expected and actual behavior.
- Browser and operating system details when relevant.
- Screenshots, recordings, or console output when they help explain the problem.

## Suggesting features

Feature requests are welcome. Please describe the user need, the proposed behavior, and any tradeoffs or alternatives you have considered.

## License

By contributing, you agree that your contributions will be licensed under this project's [AGPL-3.0 license](LICENSE).
