"use client";

import type { GuidedTourStep } from "./guided-tour";

export type ViewMode = "map" | "forest" | "scatter";
export type CompletedTours = Partial<Record<ViewMode, boolean>>;
export type TourMode = "full" | "page-only";

export const TOUR_STORAGE_KEY = "silent-forest-tour-state-v2";

const SHARED_FOREST_SCATTER_STEPS: GuidedTourStep[] = [
  {
    id: "view-switcher",
    title: "Start with the main views",
    description:
      "Use these three views to read the same story in different ways: Forest for metaphor and pattern, Scatter for precise comparison, and Map for geographic context.",
  },
  {
    id: "region-filter",
    title: "Filter by region",
    description:
      "Focus on one region at a time or return to All Regions for a global comparison. In the forest view, this changes the chart from regional averages to individual countries inside the selected region.",
  },
  {
    id: "year-filter",
    title: "Pick a year directly",
    description:
      "Use the year menu to jump to a specific moment in time. Every view updates to show the selected year so comparisons stay consistent.",
  },
  {
    id: "timeline-slider",
    title: "Use the timeline to see change",
    description:
      "The timeline lets you scrub across years or press play to animate how outcomes change over time. It is the quickest way to spot long-term movement.",
  },
  {
    id: "guide-button",
    title: "Replay the guide anytime",
    description:
      "Open this button whenever you want to revisit the walkthrough for the current view.",
  },
];

const SHARED_MAP_STEPS: GuidedTourStep[] = [
  {
    id: "view-switcher",
    title: "Switch views at any time",
    description:
      "Use these controls to move between the forest, scatterplot, and map while keeping the same year and selection context.",
  },
  {
    id: "year-filter",
    title: "Pick a year directly",
    description:
      "Use the year menu to jump to a specific moment in time. The map updates immediately so comparisons stay consistent.",
  },
  {
    id: "timeline-slider",
    title: "Use the timeline to see change",
    description:
      "Scrub across years or press play to animate how education outcomes shift over time.",
  },
  {
    id: "guide-button",
    title: "Replay the guide anytime",
    description:
      "Open this button whenever you want to revisit the walkthrough for the current view.",
  },
];

export const FOREST_ONLY_STEPS: GuidedTourStep[] = [
  {
    id: "forest-y-axis",
    title: "Start with the trunk scale",
    description:
      "The y-axis tells you how many years children spend in school. Taller trunks mean more time enrolled.",
    targetStyle: {
      left: "18px",
      top: "21%",
      width: "30px",
      height: "45%",
    },
    cardStyle: {
      left: "56px",
      top: "20%",
    },
  },
  {
    id: "forest-x-axis",
    title: "Read left to right",
    description:
      "The x-axis orders each region, or each country inside a selected region, from lower learning outcomes to higher ones.",
    targetStyle: {
      left: "18%",
      bottom: "108px",
      width: "64%",
      height: "38px",
      borderRadius: "18px",
    },
    cardStyle: {
      right: "max(12px, 4vw)",
      bottom: "148px",
    },
  },
  {
    id: "forest-legend",
    title: "Use the canopy to read learning",
    description:
      "Keep this guide pinned in view while you explore. It shows the trunk-versus-canopy reading rule directly on the chart.",
    targetStyle: {
      left: "12px",
      top: "18px",
      width: "210px",
      height: "112px",
      borderRadius: "18px",
    },
    cardStyle: {
      left: "max(12px, 4vw)",
      top: "142px",
    },
  },
  {
    id: "forest-read",
    title: "Read the bright center against the y-axis",
    description:
      "Follow the dashed line from the bright center inside the canopy to the y-axis. That glowing point sits at the same level as the top of the trunk, so it shows how many years children spend in school.",
    targetStyle: {
      left: "38%",
      top: "26%",
      width: "24%",
      height: "34%",
    },
    cardStyle: {
      width: "min(420px, calc(100vw - 24px))",
      left: "50%",
      top: "24%",
    },
  },
  {
    id: "forest-lays-label",
    title: "The number above the tree",
    description:
      "This value is Learning-Adjusted Years of Schooling (LAYS). It combines enrollment with test scores to estimate how many years of quality learning children actually receive. The number above the tree gives the learning value, which can be lower than the bright center and trunk level.",
  },
];

export const SCATTER_ONLY_STEPS: GuidedTourStep[] = [
  {
    id: "scatter-chart",
    title: "Each dot is a country",
    description:
      "The scatter plot compares years enrolled on the x-axis with years learned on the y-axis. Dots closer to the diagonal are more efficient. Click any country dot to open its details.",
    targetStyle: {
      left: "10%",
      top: "16%",
      width: "78%",
      height: "62%",
    },
    cardStyle: {
      right: "max(12px, 4vw)",
      top: "88px",
    },
  },
  {
    id: "scatter-legend",
    title: "Colors still mean region",
    description:
      "The legend at the bottom keeps the same regional color language, so you can compare this view with the forest and map quickly.",
    targetStyle: {
      left: "14%",
      bottom: "68px",
      width: "72%",
      height: "42px",
      borderRadius: "18px",
    },
    cardStyle: {
      left: "max(12px, 4vw)",
      bottom: "128px",
    },
  },
];

export const MAP_ONLY_STEPS: GuidedTourStep[] = [
  {
    id: "map-search",
    title: "Search or browse the map",
    description:
      "Use search to jump to a country quickly, or click countries directly on the map to inspect them in detail.",
    targetStyle: {
      right: "12px",
      top: "72px",
      width: "min(288px, calc(100vw - 24px))",
      height: "46px",
      borderRadius: "16px",
    },
    cardStyle: {
      right: "max(12px, 4vw)",
      top: "132px",
    },
  },
  {
    id: "map-pan",
    title: "Move around freely",
    description:
      "Drag to pan and use the zoom controls to explore dense areas. After locating a country, click it to open the detail view.",
    targetStyle: {
      left: "15%",
      top: "20%",
      width: "70%",
      height: "52%",
    },
    cardStyle: {
      left: "max(12px, 4vw)",
      bottom: "138px",
    },
  },
];

const FULL_TOUR_STEPS: Record<ViewMode, GuidedTourStep[]> = {
  forest: [...SHARED_FOREST_SCATTER_STEPS, ...FOREST_ONLY_STEPS],
  scatter: [...SHARED_FOREST_SCATTER_STEPS, ...SCATTER_ONLY_STEPS],
  map: [...SHARED_MAP_STEPS, ...MAP_ONLY_STEPS],
};

export function getPageOnlyLabel(view: ViewMode) {
  if (view === "forest") return "Forest only";
  if (view === "scatter") return "Scatterplot only";
  return "Map only";
}

export function getTourSteps(view: ViewMode, mode: TourMode): GuidedTourStep[] {
  if (mode === "page-only") {
    if (view === "forest") return FOREST_ONLY_STEPS;
    if (view === "scatter") return SCATTER_ONLY_STEPS;
    return MAP_ONLY_STEPS;
  }

  return FULL_TOUR_STEPS[view];
}
