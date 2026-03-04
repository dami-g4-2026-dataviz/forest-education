# External Integrations

**Analysis Date:** 2026-03-04

## APIs

### Google Maps API
- **Purpose:** Map display (component exists at `client/src/components/Map.tsx`)
- **Integration:** Loaded dynamically via script tag
- **Proxy:** API requests routed through `VITE_FRONTEND_FORGE_API_URL` (defaults to `https://forge.butterfly-effect.dev`)
- **Key:** `VITE_FRONTEND_FORGE_API_KEY` — API key for proxy authentication
- **Pattern:** Proxy-based to avoid exposing raw Google Maps key to browser

### OAuth Authentication
- **Purpose:** User authentication
- **Provider URL:** `VITE_OAUTH_PORTAL_URL`
- **App ID:** `VITE_APP_ID`
- **Pattern:** External OAuth portal; client redirects to portal with app ID
- **Status:** Environment variables present but OAuth flow depth unclear from static analysis

## Databases

None identified. Application uses static in-memory data:
- Education data: `client/src/lib/educationData.ts` — hardcoded country metrics
- No database connection, ORM, or migration tooling detected

## Authentication

- Custom OAuth via external portal (`VITE_OAUTH_PORTAL_URL`)
- No session storage, JWT, or cookie management detected in source
- May be handled entirely by the OAuth portal redirect flow

## Monitoring & Logging

### Manus Runtime Integration
- **Plugin:** `vite-plugin-manus-runtime 0.0.57` — development runtime integration
- **Custom plugin:** `vitePluginManusDebugCollector` in `vite.config.ts` — collects browser logs
- **Logs directory:** `.manus-logs/` at project root
- **Purpose:** Development/debugging platform integration (not production monitoring)

### Debug Logging
- `NODE_ENV` guards exist but not consistently applied
- No production error tracking service (Sentry, Datadog, etc.) detected

## Build & Deployment

### Static File Serving
- Express server (`server/index.ts`) serves built frontend from `dist/public/`
- SPA fallback: all non-API routes serve `index.html`
- Port: `PORT` env var, defaults to 3000

### Build Pipeline
- Frontend: Vite → `dist/public/`
- Backend: esbuild → `dist/index.js`
- No CI/CD configuration detected in repo

## Third-Party UI Services

None — all UI components are local (Radix UI + shadcn/ui patterns).

---

*Integrations analysis: 2026-03-04*
