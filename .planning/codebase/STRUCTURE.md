# Directory Structure

**Analysis Date:** 2026-03-04

## Top-Level Layout

```
silent-forest/
├── client/              # React SPA frontend
│   └── src/
│       ├── App.tsx              # Root component, routing setup
│       ├── main.tsx             # Entry point, React DOM render
│       ├── index.css            # Global styles, CSS variables
│       ├── const.ts             # Frontend constants
│       ├── components/          # Feature components
│       │   ├── Forest.tsx       # Main SVG forest visualization
│       │   ├── Tree.tsx         # Individual tree SVG component
│       │   ├── CountryDetail.tsx # Country info modal
│       │   ├── Tooltip.tsx      # Hover tooltip
│       │   ├── Legend.tsx       # Color legend
│       │   ├── NarrativePanel.tsx # Intro/narrative overlay
│       │   ├── Map.tsx          # Google Maps embed
│       │   ├── ErrorBoundary.tsx # Error handling wrapper
│       │   ├── ManusDialog.tsx  # Dev dialog component
│       │   └── ui/              # shadcn/ui component library (50+ components)
│       ├── pages/               # Route-level components
│       │   ├── Home.tsx         # Main page (forest + UI controls)
│       │   └── NotFound.tsx     # 404 page
│       ├── contexts/            # React contexts
│       │   └── ThemeContext.tsx  # Dark/light theme management
│       ├── hooks/               # Custom React hooks
│       │   ├── useComposition.ts # Data composition/filtering logic
│       │   ├── useMobile.tsx     # Mobile breakpoint detection
│       │   └── usePersistFn.ts  # Function reference stability
│       └── lib/                 # Utilities and data
│           ├── educationData.ts  # Static country education metrics (hardcoded)
│           └── utils.ts          # Shared utility functions (cn, etc.)
├── server/
│   └── index.ts         # Express server — static file serving + SPA fallback
├── shared/
│   └── const.ts         # Shared constants (client + server)
├── patches/             # pnpm patches for dependencies
│   └── wouter@3.7.1.patch
├── docs/                # Project documentation
├── .manus-logs/         # Manus dev platform logs (gitignored)
├── .planning/           # GSD planning directory
├── package.json         # Root package.json (monorepo-like)
├── vite.config.ts       # Vite config with plugins
├── tsconfig.json        # Root TypeScript config
├── tsconfig.node.json   # Node-specific TS config
├── components.json      # shadcn/ui component registry config
├── .prettierrc          # Prettier formatting config
└── pnpm-lock.yaml       # Dependency lockfile
```

## Key Locations

| What | Where |
|------|-------|
| App entry point | `client/src/main.tsx` |
| Root component + routing | `client/src/App.tsx` |
| Main page | `client/src/pages/Home.tsx` |
| Forest visualization | `client/src/components/Forest.tsx` |
| Tree rendering | `client/src/components/Tree.tsx` |
| Country data | `client/src/lib/educationData.ts` |
| Data filtering/composition | `client/src/hooks/useComposition.ts` |
| Theme context | `client/src/contexts/ThemeContext.tsx` |
| Express server | `server/index.ts` |
| Shared constants | `shared/const.ts` |
| Vite config | `vite.config.ts` |
| Global CSS | `client/src/index.css` |

## Naming Conventions

- **Components:** PascalCase (`Forest.tsx`, `CountryDetail.tsx`)
- **Hooks:** camelCase with `use` prefix (`useComposition.ts`, `useMobile.tsx`)
- **Utilities/data:** camelCase (`educationData.ts`, `utils.ts`)
- **UI components:** shadcn/ui convention — lowercase kebab (`button.tsx`, `dialog.tsx`)
- **Contexts:** PascalCase with `Context` suffix (`ThemeContext.tsx`)
- **Constants:** `const.ts` at both frontend and shared level

## ui/ Directory Note

`client/src/components/ui/` contains 50+ shadcn/ui generated components. Most are unused by the actual application — they were scaffolded but only a subset is imported. This is a known concern (bundle bloat potential).

---

*Structure analysis: 2026-03-04*
