# Fix Build Errors

Purpose: ensure the app builds cleanly before deployment, with no unintended UI or behavior changes.

## How to verify
- Run linters and type checks:
  - `pnpm lint`
  - `pnpm exec tsc --noEmit` (or your project’s `pnpm typecheck` script if available)
- Run a production build:
  - `pnpm build`

## If errors or warnings appear
- Fix them in the simplest, smallest way possible.
- Do not change UI, layout, or functionality.
- Keep edits localized; avoid broad refactors.
- Maintain TypeScript correctness; avoid `any` unless absolutely necessary and justified.
- Preserve APIs and data contracts; do not change shapes or names.
- Keep copy and i18n strings intact.

## Safe, common fixes
- Remove unused imports/variables.
- Tighten null/undefined checks and add explicit return types where needed.
- Replace deprecated API usage with current equivalents.
- Adjust types to reflect actual usage (narrow types rather than loosening).
- Use the narrowest possible eslint-disable, scoped to the smallest block, and include a reason.

## What not to do
- Don’t introduce features or modify UX.
- Don’t silence errors by catching and ignoring them.
- Don’t disable lint rules globally.
- Don’t reformat unrelated code or make sweeping stylistic changes.

## Escalation
- If a fix would alter behavior, UI, or data contracts, pause and document the trade‑offs. Propose the minimal behavior‑preserving alternative first.

## Definition of done
- Lint passes with 0 errors: `pnpm lint`.
- Type check passes with 0 errors: `pnpm exec tsc --noEmit` (or `pnpm typecheck`).
- Production build succeeds with no errors: `pnpm build`.
- No new warnings introduced; if a warning is unavoidable, add a brief comment explaining why and a follow‑up task if needed. 