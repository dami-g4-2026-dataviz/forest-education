# Plan: Silent Forest — Poppy Field Quality Improvements

## Context
The current visualization looks like lollipop charts (circles on sticks) and lacks the emotional narrative pacing that makes Poppy Field compelling. Four improvements requested: better tree visuals, narrative scrollytelling, country detail overhaul, and region zoom.

---

## Files to Modify
1. `client/src/components/Tree.tsx`
2. `client/src/components/Forest.tsx`
3. `client/src/components/CountryDetail.tsx`
4. `client/src/pages/Home.tsx`

---

## Change 1: Organic Tree Canopy (Tree.tsx)

**Problem:** Stacked ellipses look like cell biology diagrams, not trees. Dense mode renders only 1-2 ellipses, making it worse.

**Fix:** Replace stacked ellipses with a **cloud-cluster canopy** — 5-7 overlapping circles arranged organically (1 center + N at varied angles/distances using the seeded random `sr()`). This creates a natural foliage silhouette.

```
canopy = center circle (radius = canopyR * 0.75)
       + 4–6 satellite circles (radius = 0.4–0.6 * canopyR)
         at angles from sr() * 2π, distance = canopyR * 0.5–0.8
         shifted upward by trunkH
```

- Remove the `dense`/`!dense` branching — always render fully
- Increase trunk opacity: `0.65 + learningRatio * 0.35` (was `0.5 + learningRatio * 0.4`)
- Add glow filter on canopy (not just top layer): `drop-shadow(0 0 8px color)` always present at low opacity, stronger on hover
- Country code label: always show (not just on hover when scale > 0.7) at small opacity, bright on hover

---

## Change 2: Region Zoom (Forest.tsx)

**Problem:** Clicking a region just dims others but trees remain tiny.

**Fix:** CSS `transform: scale()` on the `<svg>` element, pivoting on the region's center X at groundY.

```jsx
// Compute region center X
const zoomOriginX = mean of x positions of activeRegion trees
const zoomScale = 2.8  // zoom factor

<svg
  style={{
    transformOrigin: `${zoomOriginX}px ${groundY}px`,
    transform: activeRegion ? `scale(${zoomScale})` : 'scale(1)',
    transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
  }}
>
```

- The container div already has `overflow-hidden`, so zoomed-out trees clip naturally
- Dimmed trees (opacity 0.06 when zoomed) effectively disappear, focusing attention
- Region label for active region becomes larger and fully opaque

---

## Change 3: CountryDetail Overhaul (CountryDetail.tsx)

**Problem:** Two CSS bars convey the data abstractly. The tree — the core visual metaphor — is absent.

**Fix:** Two-column editorial layout, exactly like Poppy Field:

**Left column (40%):** SVG rendering of the actual tree at ~180px tall
- Fixed `<svg width={200} height={240}>`
- Renders the tree centered in it, using Tree component props mapped to presentation scale
- `maxTrunkH = 160`, `scale = 3.5`, positioned at `x=100, y=230`
- Tree fills most of the panel height, visually connecting the detail to the forest

**Right column (60%):** Editorial data
- Hero stat: `"{country.lays} yrs"` in large type (like Poppy Field's fatality count)
- Sub-headline: `"of {country.yearsInSchool} years in school translate to learning"`
- Emotional sentence: computed from lostYears (e.g. "3.4 years of schooling lost to low quality education")
- Stats table below (existing StatRow components)
- Status badge (Thriving / Struggling / In Crisis)

Remove the two CSS bars entirely.

---

## Change 4: Narrative Scrollytelling (Home.tsx)

**Problem:** Jumps from intro to 100 countries with no guided story.

**Fix:** Insert a `narrativeChapter: 0 | 1 | 2 | 3` state between intro and free explore. When `introStep === 2 && narrativeChapter < 3`, show the narrative. When `narrativeChapter >= 3`, enter free explore (the old `introStep === 2`).

**Three story beats:**

| Chapter | Focused Country | Headline | Subtext |
|---------|----------------|----------|---------|
| 0 | NER (Niger) | "5 years in school. 2 years of learning." | "92% of 10-year-olds in Niger cannot read a simple sentence." |
| 1 | IND (India) | "10 years enrolled. Half of it lost." | "High enrollment hides a learning crisis affecting 250 million children." |
| 2 | SGP (Singapore) | "13 years in school. 12.8 years of learning." | "The gap between Niger and Singapore is 10 years of real learning — a full childhood." |

**UI per chapter:**
- Forest visible in background with `focusedCountryCode` prop
- In Forest: when `focusedCountryCode` set, zoom SVG to that tree (scale 4.5, pivot at tree x), dim all others to 0.05 opacity
- Overlay card positioned **left side** (not center): editorial style, Playfair Display headline
- "Next →" button + small chapter dots indicator
- "Skip to explore" text link

**Forest.tsx additions:**
- Accept `focusedCountryCode: string | null` prop
- When set, zoom to that tree's x position (overrides `activeRegion` zoom)
- Dimming logic: `opacity = focusedCountryCode && country.code !== focusedCountryCode ? 0.05 : (activeRegion && region !== activeRegion ? 0.12 : 1)`

---

## Verification
1. Run `npm run dev` in `client/` and verify:
   - Title screen → context screen still work
   - Chapter 0 loads: Niger tree zoomed in, overlay card visible
   - "Next" advances through all 3 chapters
   - Chapter 3 transitions to free explore with all trees visible
   - Clicking a region filter zooms into it smoothly (0.65s transition)
   - Clicking a tree opens detail panel with the tree SVG rendered on the left
   - CountryDetail shows tree + editorial layout (no CSS bars)
   - Trees look organic (cloud clusters, not stacked ellipses)
