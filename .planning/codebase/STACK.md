# Technology Stack

**Analysis Date:** 2026-03-04

## Languages

**Primary:**
- TypeScript 5.6.3 - All source code (client, server, shared)
- CSS 4 - Styling with Tailwind utilities

**Secondary:**
- JavaScript - Build and dev tooling configuration

## Runtime

**Environment:**
- Node.js (LTS expected; no version file specified)

**Package Manager:**
- pnpm 10.4.1 (enforced via packageManager field in `package.json`)
- Lockfile: pnpm-lock.yaml (expected but not reviewed)

## Frameworks

**Core:**
- React 19.2.1 - Frontend UI library (`client/src`)
- Express 4.21.2 - Backend server (`server/index.ts`)

**Routing:**
- wouter 3.3.5 - Lightweight client-side router (patched at `patches/wouter@3.7.1.patch`)

**UI Components:**
- Radix UI (multiple packages @1.x, @2.x) - Headless component library foundation
  - Includes: accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toggle, toggle-group, tooltip

**Form & Validation:**
- React Hook Form 7.64.0 - Form state management
- Zod 4.1.12 - TypeScript-first schema validation
- @hookform/resolvers 5.2.2 - Bridge between Hook Form and validation schemas

**Styling:**
- Tailwind CSS 4.1.14 - Utility-first CSS framework
- PostCSS 8.4.47 - CSS processing
- Autoprefixer 10.4.20 - Vendor prefixes
- class-variance-authority 0.7.1 - Component class variant generation
- clsx 2.1.1 - Conditional classname utility
- tailwind-merge 3.3.1 - Smart Tailwind class merging
- tailwindcss-animate 1.0.7 - Animation utilities

**Data Visualization:**
- recharts 2.15.2 - React charting library (chart rendering in `client/src/components/ui/chart.tsx`)

**Animation & Transitions:**
- Framer Motion 12.23.22 - Animation library
- embla-carousel-react 8.6.0 - Carousel component

**UI Utilities:**
- lucide-react 0.453.0 - Icon library
- next-themes 0.4.6 - Theme management
- sonner 2.0.7 - Toast notifications
- input-otp 1.4.2 - OTP input components
- react-day-picker 9.11.1 - Date picker
- react-resizable-panels 3.0.6 - Resizable panel layout
- vaul 1.1.2 - Drawer component
- cmdk 1.1.1 - Command menu component

**HTTP Client:**
- axios 1.12.0 - HTTP client library

**Utilities:**
- nanoid 5.1.5 - Unique ID generator
- streamdown 1.4.0 - Utility library (purpose unclear)

## Testing

**Framework:**
- vitest 2.1.4 - Unit test runner (with `tsx` support)

**Dev Tooling:**
- tsx 4.19.1 - TypeScript executor for Node.js

## Build & Dev Tools

**Bundler:**
- Vite 7.1.7 - Frontend build tool and dev server
  - Config: `vite.config.ts` with custom Manus debug collector plugin
- esbuild 0.25.0 - JavaScript bundler (backend build in npm scripts)

**Plugins:**
- @vitejs/plugin-react 5.0.4 - React Fast Refresh
- @tailwindcss/vite 4.1.3 - Tailwind CSS Vite plugin
- @builder.io/vite-plugin-jsx-loc 0.1.1 - JSX location tracking
- vite-plugin-manus-runtime 0.0.57 - Manus runtime integration
- Custom vitePluginManusDebugCollector - Browser log collection

**Formatting & Linting:**
- Prettier 3.6.2 - Code formatter (config: `package.json` scripts reference)
- TypeScript compiler - Static type checking (tsc --noEmit)

## Key Dependencies

**Critical:**
- React 19.2.1 - UI rendering foundation
- TypeScript 5.6.3 - Type safety for entire codebase
- Tailwind CSS 4.1.14 - Styling system
- Vite 7.1.7 - Fast dev server and bundling

**Infrastructure:**
- Express 4.21.2 - Web server for serving static files and client routing
- Radix UI (full suite) - Accessible component primitives
- React Hook Form 7.64.0 - Form handling without bloat

**External API Integrations:**
- axios 1.12.0 - HTTP requests to external APIs
- Google Maps API (loaded dynamically via script tag; see `client/src/components/Map.tsx`)

## Configuration

**Environment:**
- Vite env config directory: root project directory (`.planning/codebase/.`)
- Environment variables prefixed with `VITE_` are exposed to frontend
- Environment variables for critical configs:
  - `VITE_OAUTH_PORTAL_URL` - OAuth provider URL
  - `VITE_APP_ID` - Application ID for OAuth
  - `VITE_FRONTEND_FORGE_API_KEY` - Google Maps API proxy key
  - `VITE_FRONTEND_FORGE_API_URL` - Base URL for Maps API proxy (defaults to `https://forge.butterfly-effect.dev`)
  - `NODE_ENV` - Environment mode (development/production)
  - `PORT` - Server port (defaults to 3000)

**TypeScript Configuration:**
- `tsconfig.json` at root with:
  - Module: ESNext (ES modules)
  - Lib: esnext, dom, dom.iterable
  - Strict mode enabled
  - Path aliases: `@/*` → `client/src/*`, `@shared/*` → `shared/*`

**Build Output:**
- Frontend: Vite builds to `dist/public/`
- Backend: esbuild bundles to `dist/index.js`
- Server in production serves static files from `dist/public/` with fallback to `index.html` for SPA routing

## Platform Requirements

**Development:**
- Node.js LTS
- pnpm 10.4.1
- Git (for patch management)

**Production:**
- Node.js runtime
- Deployment target: Any Node.js host (static files + Express server)
- Port 3000 (configurable via PORT env var)

---

*Stack analysis: 2026-03-04*
