# Make Components Responsive

Purpose: adapt the component in the prompt to common viewports using safe, minimal edits that preserve the original design intent and functionality.

## How to verify
- Use browser dev tools device toolbar to test at least these widths:
  - 375px, 414px (small phones), 768px (tablet), 1024px (small laptop), 1280px, 1440px.
- Check for:
  - No horizontal scrollbars (except intentional scroll areas like wide tables).
  - No clipped/overlapping content; readable line lengths and touch-friendly controls.
  - Images/media scale cleanly; correct aspect ratio; no distortion.
- Build should still pass: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`.

## Workflow (mobile-first)
1. Start from the smallest viewport and scale up.
2. Replace rigid dimensions with fluid ones:
   - Prefer `w-full`, `max-w-screen-*`, and `flex-1` over fixed `w-...`.
   - Use `min-w-0`/`min-h-0` inside flex/grid to prevent overflow.
3. Reflow layout at breakpoints with Tailwind prefixes:
   - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
   - `flex-col md:flex-row`, `gap-4 md:gap-6`
4. Ensure text remains readable:
   - `text-sm md:text-base lg:text-lg` where needed; avoid shrinking below usability.
   - Control line length with `max-w-prose`/`max-w-[XXch]` where helpful.
5. Manage media and images:
   - Use Next Image with proper `sizes` and container classes.
   - Preserve aspect with `object-cover` and `aspect-[16/9]` or `aspect-square`.
6. Prevent overflow and awkward wraps:
   - `break-words` / `whitespace-normal` for long strings; `truncate` for single-line.
   - Add scroll only where necessary: `overflow-x-auto` for wide tables/lists.
7. Space and alignment:
   - Use responsive `p-*`, `m-*`, `gap-*`, `space-y-*`/`space-x-*`.
   - Switch stack vs row with `flex-col md:flex-row` and adjust gaps accordingly.
8. Visibility and density:
   - Use `hidden md:block` or `md:hidden` sparingly; do not hide critical actions.
   - Prefer reflow over duplicating content; if duplication is necessary, keep one source of truth.

## Safe, common fixes
- Replace fixed widths/heights with fluid/responsive utilities (`w-full`, `max-w-*`, `h-auto`).
- Add `min-w-0` to children of flex/grid containers to avoid text/image overflow.
- Convert rigid grids to responsive grids: `grid-cols-1 md:grid-cols-2`.
- Switch vertical stack on mobile to horizontal on larger screens: `flex-col md:flex-row`.
- Introduce `overflow-x-auto` on containers of wide tables or code blocks.
- Apply `aspect-*` + `object-cover` for media cards to avoid stretching.
- Wrap or truncate long labels: `whitespace-normal`, `break-words`, `truncate`.

## What not to do
- Don’t change colors, typography scale/tokens, copy, or visual hierarchy.
- Don’t move primary actions away from their established positions.
- Don’t introduce absolute positioning hacks that break reflow.
- Don’t add new components or redesign layouts; reflow existing structure only.
- Don’t disable Tailwind or global styles; keep changes localized and utility-based.

## Accessibility and touch
- Maintain adequate tap targets (~44px) and spacing on mobile.
- Ensure focus states remain visible after reflow; test keyboard navigation.
- Avoid hover-only interactions on mobile; provide click/tap alternatives.
- Keep contrast ratios intact and headings hierarchy unchanged.

## Escalation
- If responsiveness requires altering layout hierarchy, removing content, or moving key actions, pause and document trade-offs. Propose the smallest, behavior-preserving alternative first.

## Definition of done
- No unintended horizontal scrollbars; no clipped or overlapping UI.
- Text is readable across breakpoints; images/media scale without distortion.
- Critical actions remain discoverable and usable on mobile.
- Only minimal, utility-class edits made; original look-and-feel preserved.
