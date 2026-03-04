# Architecture

**Analysis Date:** 2026-03-04

## Pattern Overview

**Overall:** Client-Server SPA with Isomorphic Build Pipeline

**Key Characteristics:**
- React 19 frontend with client-side routing (Wouter)
- Express server serving static assets with fallback to SPA index.html
- Monorepo structure: client, server, shared code
- SVG-based data visualization (forest metaphor for education data)
- Vite + esbuild for development and production builds
- Real-time debug logging to filesystem (Manus integration)

## Layers

**Presentation Layer:**
- Purpose: React components rendering interactive UI and SVG visualization
- Location: `client/src/components/`, `client/src/pages/`
- Contains: React functional components, UI primitives from shadcn/ui, custom visualizations
- Depends on: React, Radix UI, Lucide icons, Tailwind CSS, data from contexts
- Used by: App router, direct user interactions

**State Management Layer:**
- Purpose: Application state and context management
- Location: `client/src/contexts/` (ThemeContext), `client/src/hooks/`
- Contains: React Context API for theme, custom hooks for composition and mobile detection
- Depends on: React hooks API
- Used by: Components throughout the app for state and theme access

**Data & Utilities Layer:**
- Purpose: Shared data, type definitions, and helper functions
- Location: `client/src/lib/`, `shared/`
- Contains: `educationData.ts` (country data, regions, types), `utils.ts` (cn utility), `const.ts` (constants)
- Depends on: TypeScript types only
- Used by: Components, Forest visualization, Country detail panels

**Routing Layer:**
- Purpose: Client-side route handling and navigation
- Location: `client/src/App.tsx`
- Contains: Wouter Switch/Route definitions
- Depends on: Wouter router, page components
- Used by: App entry point

**Server Layer:**
- Purpose: Static asset serving and SPA fallback routing
- Location: `server/index.ts`
- Contains: Express app configuration, static middleware, wildcard route handler
- Depends on: Express, Node.js path resolution
- Used by: Production deployment

**Entry Points:**
- Client: `client/src/main.tsx` → renders App to #root
- Server: `server/index.ts` → starts HTTP server on port 3000

## Data Flow

**Home Page Initialization:**

1. User loads app → `main.tsx` mounts React to DOM
2. `App.tsx` wraps tree with providers (Theme, Tooltip, Error boundary)
3. Router renders `Home` page
4. `Home` initializes state: `introStep`, `activeRegion`, `selectedCountry`
5. Forest component receives props and renders SVG visualization

**User Interaction Flow (Forest → Detail Modal):**

1. User hovers over tree in Forest SVG
2. Tree component calls `onHover` callback with country data
3. Tooltip appears at hover position
4. User clicks tree
5. `onCountryClick` callback sets `selectedCountry` in Home state
6. `CountryDetail` modal renders with country data
7. User closes modal → state cleared, modal unmounts

**Region Filtering Flow:**

1. User clicks region pill in header
2. `handleRegionClick` toggles `activeRegion` state
3. Forest receives `activeRegion` prop
4. Trees check if their region matches → apply `dimmed` class
5. Region labels fade opacity based on filter state

**State Management:**

Home page manages:
- `introStep` (0=title, 1=context, 2=main UI)
- `activeRegion` (currently selected region or null)
- `selectedCountry` (country for detail modal or null)

Forest component manages:
- `dims` (viewport dimensions, synced on resize)
- `tooltip` (hovered country for display)

Tree component manages:
- `isHovered` (visual hover state)
- `mounted` (animation trigger)

## Key Abstractions

**Forest System:**
- Purpose: Renders a collection of trees as a data visualization, handles layout and interaction
- Examples: `Forest.tsx`
- Pattern: Container component that manages positioning (`layoutTrees` function), handles events, and renders Tree children
- Layout algorithm: Sorts countries by region + years in school, distributes evenly across width, scales based on viewport

**Tree Visual:**
- Purpose: Renders individual tree SVG element with data-driven styling
- Examples: `Tree.tsx`
- Pattern: Presentational component with computed properties (trunk height from yearsInSchool, canopy layers from learningRatio)
- Color mapping: Region color by default, override by `highlightMetric` (learningPoverty, lays, enrollment, gender)

**CountryDetail Modal:**
- Purpose: Displays detailed statistics for a selected country with visual tree representation
- Examples: `CountryDetail.tsx`
- Pattern: Overlay modal with close on backdrop click, displays stats in rows with color-coded values
- Data visualization: Mini tree visual showing trunk vs canopy ratio, efficiency label

**Theme Context:**
- Purpose: Manages light/dark theme state globally
- Examples: `ThemeContext.tsx`
- Pattern: React Context with optional toggle function, persists to localStorage if switchable
- Currently: Dark theme only (switchable disabled in App.tsx)

**Education Data Model:**
- Purpose: Type definitions and constants for country data
- Examples: `educationData.ts`
- Pattern: Static data export with types, region color mapping
- Data fields: yearsInSchool (trunk), lays/learning-adjusted years (canopy), learningPoverty, enrollment, gender parity, spending

## Entry Points

**Client Entry Point:**
- Location: `client/src/main.tsx`
- Triggers: Browser loads HTML, script executes
- Responsibilities: Create React root, render App component

**Server Entry Point:**
- Location: `server/index.ts`
- Triggers: `npm start` or deployment
- Responsibilities: Initialize Express app, configure static file serving, listen for HTTP requests

**Router Entry Point:**
- Location: `client/src/App.tsx` → Router function
- Triggers: App renders
- Responsibilities: Define routes (/, /404, fallback), wrap with providers (Theme, Tooltip, ErrorBoundary)

**Home Page Entry Point:**
- Location: `client/src/pages/Home.tsx`
- Triggers: Route to `/` matches
- Responsibilities: Initialize intro state machine, manage region/country selection, render Forest + UI overlays

## Error Handling

**Strategy:** Error Boundary component wraps entire application

**Patterns:**
- `ErrorBoundary.tsx`: Class component using getDerivedStateFromError lifecycle
- Catches render errors, displays error stack and reload button
- Prevents white-screen-of-death, keeps app recoverable

**Other considerations:**
- No try-catch blocks in visualization code (SVG rendering is resilient)
- Keyboard and mouse event handlers don't throw
- Tree layout calculation is pure and safe

## Cross-Cutting Concerns

**Logging:** Browser console + file system (Manus debug collector)
- Vite plugin `vitePluginManusDebugCollector` in `vite.config.ts`
- POST /__manus__/logs endpoint writes to `.manus-logs/` directory
- Collects browserConsole.log, networkRequests.log, sessionReplay.log

**Validation:** Zod (imported but not used extensively yet)
- Type safety via TypeScript interfaces on component props
- Country data validated at compile time via interfaces

**Authentication:** Not applicable (public data visualization)

**Theming:** CSS custom properties + Tailwind
- Variables: `--forest-deep`, `--tree-healthy`, `--text-primary`, `--text-secondary`
- Defined in `client/src/index.css`
- Applied via inline styles in Home and component overlays

**Responsive Design:** Viewport-aware layout
- Forest uses `useLayoutEffect`/`useRef` to measure container
- Trees scale based on available width
- Mobile detection via `useMobile` hook

---

*Architecture analysis: 2026-03-04*
