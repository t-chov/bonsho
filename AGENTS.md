# Repository Guidelines

## Project Structure & Module Organization
- `entrypoints/` contains extension runtime entrypoints: `background.ts`, `content.ts`, and the popup UI in `entrypoints/popup/` (`App.tsx`, `main.tsx`, `style.css`).
- `utils/` holds shared domain logic and types (`constants.ts`, `storage.ts`, `export.ts`, `types.ts`).
- Tests are colocated with source files using `*.test.ts` (example: `utils/export.test.ts`).
- Static assets live in `public/` (icons under `public/icon/`).
- Build output is generated in `.output/`; treat it as generated artifacts.
- Project config lives in `wxt.config.ts`, `tsconfig.json`, and `biome.json`.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies.
- `pnpm dev` / `pnpm dev:firefox`: run extension in development mode.
- `pnpm build` / `pnpm build:firefox`: create production builds.
- `pnpm zip` / `pnpm zip:firefox`: generate distributable extension archives.
- `pnpm test`: run Vitest unit tests.
- `pnpm compile`: run TypeScript type checks (`tsc --noEmit`).
- `pnpm lint`, `pnpm lint:fix`, `pnpm format`: run/fix Biome lint and formatting.
- `pnpm check`: full quality gate (`lint + compile + test`); run before PRs.

## Coding Style & Naming Conventions
- Language stack: TypeScript + React (WXT).
- Biome-enforced style: 2-space indentation, single quotes, semicolons, trailing commas, 100-column line width.
- Use `import type` for type-only imports.
- Keep file names lowercase and descriptive (for example, `storage.ts`, `export.test.ts`).
- Preserve the repository convention of Japanese JSDoc for exported functions and non-trivial logic.

## Testing Guidelines
- Framework: Vitest.
- Place tests next to implementation files and name them `*.test.ts`.
- Cover normal flows and edge cases (empty values, multiple records, serialization behavior).
- Run `pnpm test` during development and `pnpm check` before submitting changes.

## Commit & Pull Request Guidelines
- Prefer conventional commit prefixes used in history: `feat:`, `fix:`, `test:`, `docs:`, `chore:`.
- Keep commits focused to one logical change.
- PRs should include:
  - A short problem/solution summary.
  - Validation performed (at minimum `pnpm check`).
  - Screenshots for popup/overlay UI changes.
  - Linked issues and explicit notes for permission or manifest changes.
