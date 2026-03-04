# Testing Patterns

**Analysis Date:** 2026-03-04

## Test Framework

**Runner:**
- vitest 2.1.4 - installed as dev dependency
- Config: Not found in project (no vitest.config.ts, defaults used)

**Assertion Library:**
- Not detected - no test files present in codebase

**Run Commands:**
- No npm scripts defined for testing in `package.json`
- Available commands: `dev`, `build`, `start`, `preview`, `check`, `format`
- Type checking available: `npm run check` (runs `tsc --noEmit`)

## Test File Organization

**Status:** Not implemented

**Test Coverage:**
- Zero test files in `client/src`, `server`, or `shared` directories
- `.test.ts` and `.spec.ts` files found only in node_modules (from dependencies)
- tsconfig.json excludes `**/*.test.ts` from compilation but no test files exist

**Recommended Structure (not currently in use):**
- Co-located pattern likely intended: tests adjacent to source files
- Typical locations would be:
  - `client/src/components/*.test.tsx` for component tests
  - `client/src/hooks/*.test.ts` for hook tests
  - `client/src/lib/*.test.ts` for utility tests
  - `server/*.test.ts` for server tests

## Testing Strategy

**Current State:** Manual/exploratory testing only

**Implicit Testing Boundaries:**
- Error handling in components: `ErrorBoundary` catches render errors but not unit tested
- Hook behavior: `useComposition`, `useTheme`, `usePersistFn` have complex logic without tests
- Data layout calculations: `layoutTrees()` function has mathematical precision requirements (ground at 85%, trunk at 72%) without regression tests
- Server routing: Express static file serving and fallback routing (`app.get("*", ...)`) untested

## Test Patterns (Recommended Implementation)

**Component Testing Pattern (needed for `Forest.tsx`):**
```typescript
// Would test: Tree rendering, tooltip interactions, region filtering
// Would mock: educationData countries array, useCallback handlers
// Would verify: Correct tree count, click handlers called, hover states
```

**Hook Testing Pattern (needed for `useComposition.ts`):**
```typescript
// Would test: Composition event state tracking, timer cleanup
// Would mock: setTimeout/clearTimeout for timer refs
// Would verify: isComposing() returns correct state, events propagate correctly
```

**Data Layout Testing Pattern (needed for `Forest.tsx`):**
```typescript
// Would test: layoutTrees() calculation correctness
// Would verify: groundY = height * 0.85, maxTrunkH = groundY * 0.72
// Would verify: Correct spacing calculation (spacing = usableWidth / n)
// Would verify: Scale boundaries (0.3 min, 2.5 max)
```

**Context Testing Pattern (needed for `ThemeContext.tsx`):**
```typescript
// Would test: Theme provider initialization and toggle
// Would mock: localStorage
// Would verify: Theme applied to DOM, localStorage persistence when switchable=true
// Would verify: Hook throws when used outside provider
```

## Mocking Patterns (Not Currently Used)

**Framework:** Would need vitest mocking utilities
- `vi.mock()` for module mocking
- `vi.spyOn()` for spy/mock functions
- `vi.useFakeTimers()` for timer testing

**Patterns (recommended for future):**

**localStorage mocking (for ThemeContext):**
```typescript
// Mock localStorage for theme persistence testing
vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('dark')
```

**API mocking (not currently applicable - no API calls in codebase):**
```typescript
// Would mock axios calls if integration tests added
// Mock fetch/axios for server communication
```

**DOM mocking:**
- Component testing would require React Testing Library or jsdom
- Already available: React 19.2.1 in dependencies

## What NOT to Mock

**Current codebase guidance:**
- Don't mock `useRef` - ref behavior is critical to `usePersistFn` and `useComposition`
- Don't mock React hooks themselves - test with real hooks
- Don't mock `useState` in component tests - use RTL user interactions
- Don't mock type exports - test concrete behavior not type assertions

## Coverage

**Requirements:** Not enforced

**Current Coverage:** 0% (no tests written)

**High Priority Areas (by technical risk):**
1. `useComposition.ts` - Complex event composition handling with Safari workarounds (double setTimeout)
2. `Forest.tsx` - Tree layout calculations with precise mathematical ratios
3. `ThemeContext.tsx` - localStorage persistence and hook usage validation
4. `ErrorBoundary.tsx` - Error rendering and page reload functionality

**Medium Priority Areas:**
1. `CountryDetail.tsx` - Data calculations (efficiency ratio, color mapping)
2. `Home.tsx` - Multi-step intro sequence, keyboard/scroll event handling
3. Server routing - Static file serving and 404 fallback

**Lower Priority (mostly presentation):**
1. UI components from shadcn/ui - already tested by library
2. Tree.tsx - SVG rendering (visual regression testing more valuable than unit tests)

## View Coverage

**Setup (when tests are written):**
```bash
npm run test:coverage  # Would need script definition
# Coverage report: HTML in ./coverage/
```

## Test Types (Future Guidance)

**Unit Tests (needed for hooks/utils):**
- Test `useComposition` event handling and state
- Test `usePersistFn` callback persistence
- Test `useTheme` context provider and hook
- Test `cn()` utility class merging
- Test `layoutTrees()` layout calculations

**Integration Tests (needed for components):**
- Test Forest component with real country data
- Test Home page intro sequence and interactions
- Test CountryDetail modal opening/closing
- Test region filtering across Forest

**E2E Tests (would benefit from):**
- User flow: intro → click country → view details
- Keyboard navigation: Enter/Space to advance intro, Escape to close
- Responsive behavior: tree layout on different screen sizes

---

*Testing analysis: 2026-03-04*
