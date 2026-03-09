import type { Region } from "./types";

export const REGION_ABBR: Record<Region, string> = {
  "Sub-Saharan Africa": "SSA",
  "South Asia": "SA",
  "East Asia & Pacific": "EAP",
  "Europe & Central Asia": "ECA",
  "Latin America & Caribbean": "LAC",
  "Middle East & North Africa": "MENA",
  "North America": "NA",
};

export const REGION_COLORS: Record<Region, string> = {
  "Sub-Saharan Africa": "#EF4444",
  "South Asia": "#F97316",
  "East Asia & Pacific": "#EAB308",
  "Europe & Central Asia": "#4ADE80",
  "Latin America & Caribbean": "#06B6D4",
  "Middle East & North Africa": "#A78BFA",
  "North America": "#34D399",
};

export const BRIGHT_REGION_COLORS: Record<Region, string> = {
  "Sub-Saharan Africa": "#FF6B6B",
  "South Asia": "#FFB347",
  "East Asia & Pacific": "#FFE066",
  "Europe & Central Asia": "#69DB7C",
  "Latin America & Caribbean": "#4ECDC4",
  "Middle East & North Africa": "#C5A3FF",
  "North America": "#51CF66",
};

export const NARRATIVE_CHAPTERS: {
  code: string | null;
  region: string | null;
  regionColor: string | null;
  headline: string;
  subtext: string;
}[] = [
  {
    code: "NER",
    region: "Sub-Saharan Africa",
    regionColor: "#EF4444",
    headline: "5 years in school. 2 years of learning.",
    subtext:
      "92% of 10-year-olds in Niger cannot read a simple sentence.",
  },
  {
    code: "IND",
    region: "South Asia",
    regionColor: "#F97316",
    headline: "High enrollment hides a learning crisis.",
    subtext:
      "Since 1970, enrollment has doubled. But in South Asia, children spend roughly half their school years without reaching basic learning benchmarks.",
  },
  {
    code: "VNM",
    region: "East Asia & Pacific",
    regionColor: "#EAB308",
    headline: "The Efficiency Exception.",
    subtext:
      "In Vietnam, 12.9 years of school result in 10.2 years of real learning. A dense canopy shows what quality looks like.",
  },
  {
    code: "SGP",
    region: "East Asia & Pacific",
    regionColor: "#EAB308",
    headline: "A childhood apart.",
    subtext:
      "The gap between the best and worst education systems is 10 years of real learning. That gap has barely narrowed in a decade.",
  },
  {
    code: null,
    region: null,
    regionColor: null,
    headline: "The 2030 deadline is close. The gap is not.",
    subtext:
      "SDG 4 targets quality education for every child by 2030. At current rates, children in Sub-Saharan Africa will wait decades.",
  },
];

export const chapters = [
  {
    id: 0,
    title: "The Silent Forest",
    subtitle: "SDG 4 — Quality Education",
    body: "Every tree in this forest represents a country. Each tree tells the story of a child's education — how long they stay in school, and how much they actually learn.",
    highlight: null,
    metric: null,
  },
  {
    id: 1,
    title: "Enrollment Has Soared",
    subtitle: "A century of progress",
    body: "Since 1970, primary school enrollment has risen from 52% to nearly 90% globally. The forest has grown. But look more carefully at the trees...",
    highlight: "enrollment",
    metric: "90% of children worldwide are now enrolled in primary school.",
  },
  {
    id: 2,
    title: "But Are They Learning?",
    subtitle: "The hidden crisis",
    body: "Many trees are tall — children are in school for years. But their canopies are bare. In Sub-Saharan Africa, 86% of children cannot read a simple text after 4 years of school.",
    highlight: "learningPoverty",
    metric: "86% learning poverty rate in Sub-Saharan Africa.",
  },
  {
    id: 3,
    title: "The Quality Gap",
    subtitle: "Quantity vs. quality",
    body: "A child in Finland accumulates 13 years of genuine learning. A child in Niger — despite attending school — gains only 2. The canopy tells the truth the trunk hides.",
    highlight: "lays",
    metric: "11-year gap between highest and lowest learning outcomes.",
  },
  {
    id: 4,
    title: "The Gender Dimension",
    subtitle: "Who is left behind?",
    body: "In Afghanistan, Chad, and Yemen, girls are significantly less likely to be in school. The gap is not biological — it's structural.",
    highlight: "gender",
    metric: "30 countries still have significant gender gaps in enrollment.",
  },
  {
    id: 5,
    title: "Are We On Track?",
    subtitle: "SDG 4 by 2030",
    body: "At current rates, universal quality education will not be achieved until 2099 — 70 years late. The forest shows where we are. Progress exists — but not at the pace the deadline requires.",
    highlight: null,
    metric: "We are 70 years behind schedule on SDG 4.",
  },
];

export const globalStats = {
  outOfSchool: 250,
  learningPoverty: 57,
  laysGap: 11,
  yearsLate: 70,
};
