# Coding Conventions

**Analysis Date:** 2026-03-04

## Naming Patterns

**Files:**
- PascalCase for React components: `ErrorBoundary.tsx`, `Forest.tsx`, `CountryDetail.tsx`
- camelCase for hooks and utilities: `useComposition.ts`, `usePersistFn.ts`, `educationData.ts`
- camelCase for configuration/data files: `const.ts`, `index.ts`
- Barrel/index files use `index.ts` or `ui/component.tsx` pattern for shadcn/ui exports

**Functions:**
- Exported React components use PascalCase: `function Forest({...}) { }`
- Exported utility functions use camelCase: `export function cn(...)`, `export function useComposition(...)`
- Optional chaining abbreviation common in hooks (e.g., `originalOnKeyDown?.()`)

**Variables:**
- camelCase for local variables and parameters: `introStep`, `activeRegion`, `selectedCountry`
- PascalCase for type instances: `Theme`, `Region`, `CountryData`
- Single-letter refs for performance-critical state: `c.current` for composition flag, `timer.current` for timeouts
- Underscore prefix for unused parameters: `_req`, `_next` in Express handlers

**Types:**
- PascalCase for interfaces and type aliases: `ThemeContextType`, `CountryDetailProps`, `UseCompositionOptions`
- Generic types follow React conventions: `<T extends noop>`, `<T extends HTMLInputElement | HTMLTextAreaElement>`
- Suffix `Props` for component prop interfaces: `CountryDetailProps`, `ForestProps`
- Suffix `Options` for hook configuration interfaces: `UseCompositionOptions`
- Suffix `Return` for hook return type interfaces: `UseCompositionReturn`

## Code Style

**Formatting:**
- Prettier configured with:
  - 2-space indentation (`tabWidth: 2`)
  - Double quotes for strings (`singleQuote: false`, `jsxSingleQuote: false`)
  - Trailing commas: ES5 style (`trailingComma: "es5"`)
  - Line width: 80 characters (`printWidth: 80`)
  - Arrow function parens: avoided when possible (`arrowParens: "avoid"`)
  - Bracket same line: false (closing bracket on new line)
  - Semicolons: required (`semi: true`)

**Linting:**
- TypeScript strict mode enforced via `tsconfig.json`:
  - `strict: true` - enables all strict checks
  - `noUnusedLocals: true` - flags unused variables
  - `noUnusedParameters: true` - flags unused function parameters
  - `noFallthroughCasesInSwitch: true` - prevents case fall-through

## Import Organization

**Order:**
1. React/third-party libraries: `import { useState, useRef, useCallback } from "react"`
2. Local lib/utils: `import { cn } from "@/lib/utils"`
3. Local components/hooks: `import Tree from "./Tree"`
4. Types and constants: No explicit grouping, imported inline with usage

**Path Aliases:**
- `@/*` - resolves to `client/src/*` - used for client component imports
- `@shared/*` - resolves to `shared/*` - used for shared types/constants
- `@assets/*` - resolves to `attached_assets/*` - for asset imports

Example usage pattern:
```typescript
import { cn } from "@/lib/utils";          // lib utilities
import Forest from "@/components/Forest";  // components
import { CountryData } from "@/lib/educationData";  // data/types
```

## Error Handling

**Patterns:**
- React Error Boundary for component-level errors: `ErrorBoundary` class component catches render errors
- Explicit error context validation in hooks: throws `Error` with message when hook is misused
  ```typescript
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  ```
- Try-catch in async server handlers: `startServer().catch(console.error)`
- Silent error swallowing in non-critical paths: `} catch { /* ignore trim errors */ }`
- Optional chaining for defensive null handling: `originalOnKeyDown?.(e)`

## Logging

**Framework:** Native `console` object

**Patterns:**
- Server startup confirmation: `console.log(\`Server running on http://localhost:${port}/\`)`
- Error propagation to console on unhandled promise rejection: `startServer().catch(console.error)`
- Browser console logging captured via Vite plugin to `.manus-logs/browserConsole.log` files
- No structured logging library in use

## Comments

**When to Comment:**
- Complex algorithms or non-obvious behavior: "Ground at 85% of height — trees grow upward into the sky"
- Business logic and data mappings: Inline comments explaining theming system
- Note annotations for future consideration: "// NOTE: About Theme"
- Implementation details of hooks with side effects: Comments explaining Safari compositionEnd timing issue

**JSDoc/TSDoc:**
- Minimal usage - only on public hook functions with complex options
- Example from `usePersistFn`:
  ```typescript
  /**
   * usePersistFn instead of useCallback to reduce cognitive load
   */
  export function usePersistFn<T extends noop>(fn: T) { ... }
  ```
- No formal parameter or return documentation observed

## Function Design

**Size:** Generally concise, 20-80 lines
- Utility functions: 1-10 lines (`cn()` is 5 lines)
- Custom hooks: 30-80 lines with internal state and effects
- React components: 50-200+ lines for full features (Home.tsx is 265 lines with inline JSX)

**Parameters:**
- Destructured object parameters for components: `function CountryDetail({ country, onClose }: CountryDetailProps)`
- Options objects for flexibility: `function useComposition(options: UseCompositionOptions<T> = {})`
- Simple parameters for utilities: `export function cn(...inputs: ClassValue[])`

**Return Values:**
- React components return JSX.Element implicitly
- Utility functions return specific types: `string` for `cn()`, objects for hooks
- Hooks return object/function return types that match their purpose: `UseCompositionReturn<T>`

## Module Design

**Exports:**
- Default exports for components: `export default function Forest({ ... }) { }`
- Named exports for hooks and utilities: `export function useTheme() { }`
- Type exports for interfaces: `export type Region = "..." | "..."` (used alongside exported objects)
- Mixed default and named in same file: `export default CountryDetail` + `function StatRow({ ... })`

**Barrel Files:**
- Shadcn/ui components use barrel pattern in `components/ui/` with re-exports
- All UI components export default component only: `export default { ... }`
- No barrel index in main `components/` directory - components imported directly

---

*Convention analysis: 2026-03-04*
