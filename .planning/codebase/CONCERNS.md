# Concerns & Technical Debt

**Analysis Date:** 2026-03-04

## Technical Debt

### Hardcoded Static Data
- **File:** `client/src/lib/educationData.ts`
- **Issue:** All country education metrics are hardcoded — no dynamic data loading, no API, no version tracking
- **Impact:** Any data update requires code change and redeploy; no data attribution system
- **Fix Phase:** Add data source metadata, consider moving to a JSON file or API endpoint

### Duplicated Color Threshold Logic
- **Files:** Duplicated across `Forest.tsx`, `Tree.tsx`, and potentially `Legend.tsx`
- **Issue:** Color-coding thresholds for education metrics appear in multiple places
- **Impact:** Any threshold change must be updated in 3+ locations; inconsistency risk
- **Fix Phase:** Extract to `lib/` or `const.ts` as shared constants

### Unused shadcn/ui Components
- **File:** `client/src/components/ui/` (50+ components)
- **Issue:** Full shadcn/ui suite was scaffolded; majority of components are unused
- **Impact:** Bundle bloat (tree-shaking may mitigate, but worth auditing)
- **Fix Phase:** Audit imports and remove truly unused components

### Unused Hook with Unsafe Types
- **File:** `client/src/hooks/usePersistFn.ts`
- **Issue:** Hook appears unused in current codebase; contains `any` types
- **Impact:** Dead code, type safety gap
- **Fix Phase:** Remove or properly type

## Known Bugs

### Potential Division-by-Zero
- **Location:** Learning ratio calculations in `useComposition.ts` or data layer
- **Issue:** Ratio computations may not guard against zero denominators
- **Impact:** NaN values could propagate to UI rendering
- **Fix:** Add guards before division operations

### Tooltip Off-Screen on Narrow Viewports
- **Component:** `client/src/components/Tooltip.tsx`
- **Issue:** Tooltip positioning does not account for viewport edges; goes off-screen on mobile/narrow
- **Impact:** Poor mobile UX, content hidden
- **Fix:** Add viewport-aware positioning (flip/clamp logic)

### Window Resize Without Debouncing
- **Component:** `client/src/components/Forest.tsx` (likely)
- **Issue:** Resize event handler triggers layout recalculation on every event without debounce
- **Impact:** Jank/performance degradation during resize
- **Fix:** Add debounce (100-200ms) to resize handler

## Security Issues

### No Content Security Policy
- **File:** `server/index.ts`
- **Issue:** Express server sets no CSP headers
- **Impact:** XSS attack surface; any injected script runs freely
- **Priority:** Medium — app uses static data, low injection surface, but should be addressed

### Debug Logging Without Strict Guards
- **Issue:** Manus debug collector writes logs to disk; `NODE_ENV` guards may not be consistent
- **Impact:** Potential verbose logging in production environments
- **Fix:** Ensure all debug logging is gated on `NODE_ENV === 'development'`

### No Data Validation on Education Metrics
- **Issue:** Education data is consumed without validation (it's hardcoded, but patterns would carry forward if source changes)
- **Fix:** Add Zod schema validation for data shape when loaded

## Performance

### All Trees Render Regardless of Visibility
- **Component:** `client/src/components/Forest.tsx` + `Tree.tsx`
- **Issue:** All country trees are rendered in the DOM even when filtered/dimmed; no virtualization or culling
- **Impact:** With 150+ countries, significant DOM overhead
- **Fix:** Implement visibility culling or React virtualization for off-screen trees

### SVG Rendering Overhead (Dimmed Trees)
- **Issue:** Dimmed trees still render full SVG paths, just with opacity
- **Impact:** Unnecessary GPU compositing layers
- **Fix:** Consider `display: none` or reduced-fidelity rendering for filtered-out trees

## Fragile Areas

### Animation Timing via setTimeout
- **Issue:** Animation sequences use `setTimeout` with magic delay values
- **Impact:** Race conditions on slow devices; hard to maintain
- **Fix:** Use Framer Motion's sequencing or CSS transitions instead

### Intro Step Progression
- **Issue:** Intro/narrative step uses magic numbers (0, 1, 2) without enum or validation
- **File:** `client/src/components/NarrativePanel.tsx` or `Home.tsx`
- **Impact:** Easy to introduce off-by-one errors; unclear state transitions
- **Fix:** Use typed enum for step states

### Modal Click Event Handling
- **Component:** `client/src/components/CountryDetail.tsx`
- **Issue:** Click-outside-to-close logic is fragile if parent DOM structure changes
- **Fix:** Use Radix UI Dialog (already available) which handles this robustly

### SVG Gradients with Hardcoded Values
- **Issue:** SVG gradient definitions use hardcoded color values tied to theme
- **Impact:** Dark/light mode changes may not update gradients correctly
- **Fix:** Use CSS custom properties for gradient colors

## Test Coverage Gaps

- **Zero unit tests** for core `Forest.tsx` and `Tree.tsx` components
- **No integration tests** for user flows (intro sequence, country filtering, modal selection)
- **No E2E tests** for critical paths
- **No data validation tests** for `educationData.ts` shape
- vitest is configured but test suite is essentially empty

## Missing Infrastructure

- No data version tracking or attribution (who provided the education data, when)
- No nested error boundaries — only root-level `ErrorBoundary.tsx` (single point of recovery)
- No keyboard navigation beyond intro steps
- No mobile responsiveness audit/tests

---

*Concerns analysis: 2026-03-04*
