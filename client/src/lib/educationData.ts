// Education data for the Silent Forest visualization
// Sources: World Bank Human Capital Index, UNESCO UIS, World Bank Learning Poverty
// Note: LAYS = Learning-Adjusted Years of Schooling (World Bank Human Capital Index)
// Learning Poverty = % of 10-year-olds who cannot read a simple text

export type Region =
  | "Sub-Saharan Africa"
  | "South Asia"
  | "East Asia & Pacific"
  | "Europe & Central Asia"
  | "Latin America & Caribbean"
  | "Middle East & North Africa"
  | "North America";

export interface CountryData {
  code: string;
  name: string;
  region: Region;
  yearsInSchool: number;       // Expected years of schooling (trunk height)
  lays: number;                // Learning-Adjusted Years of Schooling (canopy density)
  learningPoverty: number;     // % of children who cannot read by age 10 (0-100)
  enrollmentRate: number;      // Primary school net enrollment rate (%)
  gpiPrimary: number;          // Gender Parity Index (primary)
  spendingPctGDP: number;      // Government education spending (% of GDP)
}

export const REGION_COLORS: Record<Region, string> = {
  "Sub-Saharan Africa": "#EF4444",       // Red — crisis
  "South Asia": "#F97316",               // Orange
  "East Asia & Pacific": "#EAB308",      // Yellow
  "Europe & Central Asia": "#4ADE80",    // Green — healthy
  "Latin America & Caribbean": "#06B6D4", // Cyan
  "Middle East & North Africa": "#A78BFA", // Purple
  "North America": "#34D399",            // Teal-green
};

export const countries: CountryData[] = [
  // Sub-Saharan Africa
  { code: "NER", name: "Niger", region: "Sub-Saharan Africa", yearsInSchool: 5.3, lays: 2.1, learningPoverty: 92, enrollmentRate: 67, gpiPrimary: 0.86, spendingPctGDP: 3.5 },
  { code: "MLI", name: "Mali", region: "Sub-Saharan Africa", yearsInSchool: 5.8, lays: 2.4, learningPoverty: 90, enrollmentRate: 62, gpiPrimary: 0.82, spendingPctGDP: 3.8 },
  { code: "TCD", name: "Chad", region: "Sub-Saharan Africa", yearsInSchool: 5.1, lays: 2.2, learningPoverty: 89, enrollmentRate: 71, gpiPrimary: 0.62, spendingPctGDP: 2.5 },
  { code: "BFA", name: "Burkina Faso", region: "Sub-Saharan Africa", yearsInSchool: 6.2, lays: 2.8, learningPoverty: 88, enrollmentRate: 74, gpiPrimary: 0.88, spendingPctGDP: 4.1 },
  { code: "MOZ", name: "Mozambique", region: "Sub-Saharan Africa", yearsInSchool: 7.1, lays: 3.2, learningPoverty: 87, enrollmentRate: 81, gpiPrimary: 0.94, spendingPctGDP: 5.2 },
  { code: "NGA", name: "Nigeria", region: "Sub-Saharan Africa", yearsInSchool: 8.2, lays: 4.3, learningPoverty: 85, enrollmentRate: 76, gpiPrimary: 0.91, spendingPctGDP: 4.5 },
  { code: "ETH", name: "Ethiopia", region: "Sub-Saharan Africa", yearsInSchool: 7.8, lays: 3.8, learningPoverty: 84, enrollmentRate: 88, gpiPrimary: 0.89, spendingPctGDP: 4.7 },
  { code: "TZA", name: "Tanzania", region: "Sub-Saharan Africa", yearsInSchool: 8.5, lays: 4.1, learningPoverty: 82, enrollmentRate: 91, gpiPrimary: 0.98, spendingPctGDP: 3.4 },
  { code: "UGA", name: "Uganda", region: "Sub-Saharan Africa", yearsInSchool: 8.9, lays: 4.5, learningPoverty: 80, enrollmentRate: 93, gpiPrimary: 0.97, spendingPctGDP: 2.8 },
  { code: "KEN", name: "Kenya", region: "Sub-Saharan Africa", yearsInSchool: 9.5, lays: 5.2, learningPoverty: 74, enrollmentRate: 96, gpiPrimary: 1.01, spendingPctGDP: 5.1 },
  { code: "GHA", name: "Ghana", region: "Sub-Saharan Africa", yearsInSchool: 9.8, lays: 5.5, learningPoverty: 71, enrollmentRate: 94, gpiPrimary: 0.99, spendingPctGDP: 4.2 },
  { code: "ZAF", name: "South Africa", region: "Sub-Saharan Africa", yearsInSchool: 11.2, lays: 6.8, learningPoverty: 58, enrollmentRate: 98, gpiPrimary: 1.04, spendingPctGDP: 6.2 },
  { code: "RWA", name: "Rwanda", region: "Sub-Saharan Africa", yearsInSchool: 9.2, lays: 5.8, learningPoverty: 67, enrollmentRate: 97, gpiPrimary: 1.02, spendingPctGDP: 3.1 },
  { code: "SEN", name: "Senegal", region: "Sub-Saharan Africa", yearsInSchool: 8.1, lays: 3.9, learningPoverty: 79, enrollmentRate: 82, gpiPrimary: 0.93, spendingPctGDP: 5.5 },
  { code: "CMR", name: "Cameroon", region: "Sub-Saharan Africa", yearsInSchool: 8.4, lays: 4.2, learningPoverty: 76, enrollmentRate: 85, gpiPrimary: 0.90, spendingPctGDP: 3.2 },

  // South Asia
  { code: "AFG", name: "Afghanistan", region: "South Asia", yearsInSchool: 7.2, lays: 3.5, learningPoverty: 80, enrollmentRate: 68, gpiPrimary: 0.55, spendingPctGDP: 3.2 },
  { code: "PAK", name: "Pakistan", region: "South Asia", yearsInSchool: 8.5, lays: 4.2, learningPoverty: 72, enrollmentRate: 75, gpiPrimary: 0.84, spendingPctGDP: 2.8 },
  { code: "BGD", name: "Bangladesh", region: "South Asia", yearsInSchool: 10.2, lays: 5.8, learningPoverty: 55, enrollmentRate: 95, gpiPrimary: 1.08, spendingPctGDP: 2.1 },
  { code: "IND", name: "India", region: "South Asia", yearsInSchool: 10.8, lays: 5.8, learningPoverty: 55, enrollmentRate: 96, gpiPrimary: 1.01, spendingPctGDP: 4.5 },
  { code: "NPL", name: "Nepal", region: "South Asia", yearsInSchool: 10.5, lays: 5.5, learningPoverty: 58, enrollmentRate: 94, gpiPrimary: 1.03, spendingPctGDP: 5.1 },
  { code: "LKA", name: "Sri Lanka", region: "South Asia", yearsInSchool: 12.8, lays: 9.2, learningPoverty: 18, enrollmentRate: 99, gpiPrimary: 1.05, spendingPctGDP: 2.1 },

  // East Asia & Pacific
  { code: "PNG", name: "Papua New Guinea", region: "East Asia & Pacific", yearsInSchool: 7.5, lays: 4.1, learningPoverty: 68, enrollmentRate: 78, gpiPrimary: 0.88, spendingPctGDP: 1.9 },
  { code: "PHL", name: "Philippines", region: "East Asia & Pacific", yearsInSchool: 12.2, lays: 7.8, learningPoverty: 32, enrollmentRate: 97, gpiPrimary: 1.15, spendingPctGDP: 3.6 },
  { code: "IDN", name: "Indonesia", region: "East Asia & Pacific", yearsInSchool: 12.5, lays: 8.2, learningPoverty: 28, enrollmentRate: 98, gpiPrimary: 1.01, spendingPctGDP: 3.5 },
  { code: "VNM", name: "Vietnam", region: "East Asia & Pacific", yearsInSchool: 12.9, lays: 10.2, learningPoverty: 12, enrollmentRate: 99, gpiPrimary: 1.02, spendingPctGDP: 4.2 },
  { code: "CHN", name: "China", region: "East Asia & Pacific", yearsInSchool: 13.8, lays: 11.2, learningPoverty: 8, enrollmentRate: 99, gpiPrimary: 1.01, spendingPctGDP: 4.1 },
  { code: "KOR", name: "South Korea", region: "East Asia & Pacific", yearsInSchool: 14.2, lays: 12.5, learningPoverty: 4, enrollmentRate: 99, gpiPrimary: 1.0, spendingPctGDP: 5.1 },
  { code: "SGP", name: "Singapore", region: "East Asia & Pacific", yearsInSchool: 13.6, lays: 12.8, learningPoverty: 2, enrollmentRate: 99, gpiPrimary: 1.0, spendingPctGDP: 2.9 },
  { code: "JPN", name: "Japan", region: "East Asia & Pacific", yearsInSchool: 13.9, lays: 12.4, learningPoverty: 3, enrollmentRate: 99, gpiPrimary: 1.0, spendingPctGDP: 3.2 },
  { code: "AUS", name: "Australia", region: "East Asia & Pacific", yearsInSchool: 13.5, lays: 12.1, learningPoverty: 5, enrollmentRate: 99, gpiPrimary: 1.02, spendingPctGDP: 5.5 },

  // Europe & Central Asia
  { code: "TJK", name: "Tajikistan", region: "Europe & Central Asia", yearsInSchool: 11.2, lays: 7.5, learningPoverty: 38, enrollmentRate: 95, gpiPrimary: 0.96, spendingPctGDP: 5.4 },
  { code: "UZB", name: "Uzbekistan", region: "Europe & Central Asia", yearsInSchool: 11.8, lays: 8.2, learningPoverty: 28, enrollmentRate: 97, gpiPrimary: 0.99, spendingPctGDP: 6.1 },
  { code: "TUR", name: "Turkey", region: "Europe & Central Asia", yearsInSchool: 12.5, lays: 9.1, learningPoverty: 22, enrollmentRate: 98, gpiPrimary: 1.01, spendingPctGDP: 4.2 },
  { code: "POL", name: "Poland", region: "Europe & Central Asia", yearsInSchool: 13.8, lays: 12.2, learningPoverty: 5, enrollmentRate: 99, gpiPrimary: 1.01, spendingPctGDP: 4.9 },
  { code: "DEU", name: "Germany", region: "Europe & Central Asia", yearsInSchool: 13.9, lays: 12.3, learningPoverty: 4, enrollmentRate: 99, gpiPrimary: 1.0, spendingPctGDP: 4.9 },
  { code: "FRA", name: "France", region: "Europe & Central Asia", yearsInSchool: 13.7, lays: 12.1, learningPoverty: 5, enrollmentRate: 99, gpiPrimary: 1.01, spendingPctGDP: 5.5 },
  { code: "FIN", name: "Finland", region: "Europe & Central Asia", yearsInSchool: 13.9, lays: 12.9, learningPoverty: 2, enrollmentRate: 99, gpiPrimary: 1.01, spendingPctGDP: 5.8 },
  { code: "NOR", name: "Norway", region: "Europe & Central Asia", yearsInSchool: 13.8, lays: 12.7, learningPoverty: 2, enrollmentRate: 99, gpiPrimary: 1.01, spendingPctGDP: 7.2 },
  { code: "SWE", name: "Sweden", region: "Europe & Central Asia", yearsInSchool: 13.7, lays: 12.5, learningPoverty: 3, enrollmentRate: 99, gpiPrimary: 1.01, spendingPctGDP: 6.5 },

  // Latin America & Caribbean
  { code: "HTI", name: "Haiti", region: "Latin America & Caribbean", yearsInSchool: 7.2, lays: 3.8, learningPoverty: 78, enrollmentRate: 72, gpiPrimary: 1.01, spendingPctGDP: 2.1 },
  { code: "NIC", name: "Nicaragua", region: "Latin America & Caribbean", yearsInSchool: 9.5, lays: 5.8, learningPoverty: 52, enrollmentRate: 89, gpiPrimary: 1.05, spendingPctGDP: 4.5 },
  { code: "HND", name: "Honduras", region: "Latin America & Caribbean", yearsInSchool: 10.2, lays: 6.2, learningPoverty: 48, enrollmentRate: 91, gpiPrimary: 1.22, spendingPctGDP: 5.9 },
  { code: "GTM", name: "Guatemala", region: "Latin America & Caribbean", yearsInSchool: 9.8, lays: 5.9, learningPoverty: 51, enrollmentRate: 87, gpiPrimary: 0.98, spendingPctGDP: 3.1 },
  { code: "BOL", name: "Bolivia", region: "Latin America & Caribbean", yearsInSchool: 11.5, lays: 7.2, learningPoverty: 40, enrollmentRate: 94, gpiPrimary: 1.01, spendingPctGDP: 7.3 },
  { code: "PER", name: "Peru", region: "Latin America & Caribbean", yearsInSchool: 11.8, lays: 7.5, learningPoverty: 38, enrollmentRate: 95, gpiPrimary: 1.0, spendingPctGDP: 3.9 },
  { code: "COL", name: "Colombia", region: "Latin America & Caribbean", yearsInSchool: 12.2, lays: 7.9, learningPoverty: 35, enrollmentRate: 96, gpiPrimary: 1.02, spendingPctGDP: 4.5 },
  { code: "BRA", name: "Brazil", region: "Latin America & Caribbean", yearsInSchool: 11.7, lays: 7.6, learningPoverty: 48, enrollmentRate: 97, gpiPrimary: 1.18, spendingPctGDP: 6.2 },
  { code: "MEX", name: "Mexico", region: "Latin America & Caribbean", yearsInSchool: 12.5, lays: 8.1, learningPoverty: 33, enrollmentRate: 97, gpiPrimary: 1.02, spendingPctGDP: 4.3 },
  { code: "ARG", name: "Argentina", region: "Latin America & Caribbean", yearsInSchool: 13.1, lays: 9.2, learningPoverty: 22, enrollmentRate: 98, gpiPrimary: 1.04, spendingPctGDP: 5.5 },
  { code: "CHL", name: "Chile", region: "Latin America & Caribbean", yearsInSchool: 13.2, lays: 9.8, learningPoverty: 18, enrollmentRate: 99, gpiPrimary: 1.01, spendingPctGDP: 5.4 },

  // Middle East & North Africa
  { code: "YEM", name: "Yemen", region: "Middle East & North Africa", yearsInSchool: 7.8, lays: 3.9, learningPoverty: 74, enrollmentRate: 71, gpiPrimary: 0.71, spendingPctGDP: 4.6 },
  { code: "IRQ", name: "Iraq", region: "Middle East & North Africa", yearsInSchool: 9.2, lays: 5.1, learningPoverty: 60, enrollmentRate: 84, gpiPrimary: 0.88, spendingPctGDP: 5.8 },
  { code: "MAR", name: "Morocco", region: "Middle East & North Africa", yearsInSchool: 10.5, lays: 5.8, learningPoverty: 52, enrollmentRate: 91, gpiPrimary: 0.94, spendingPctGDP: 6.8 },
  { code: "DZA", name: "Algeria", region: "Middle East & North Africa", yearsInSchool: 11.2, lays: 6.5, learningPoverty: 44, enrollmentRate: 95, gpiPrimary: 1.01, spendingPctGDP: 6.2 },
  { code: "EGY", name: "Egypt", region: "Middle East & North Africa", yearsInSchool: 11.5, lays: 6.8, learningPoverty: 42, enrollmentRate: 95, gpiPrimary: 0.97, spendingPctGDP: 3.8 },
  { code: "TUN", name: "Tunisia", region: "Middle East & North Africa", yearsInSchool: 12.1, lays: 7.8, learningPoverty: 34, enrollmentRate: 97, gpiPrimary: 1.02, spendingPctGDP: 6.6 },
  { code: "JOR", name: "Jordan", region: "Middle East & North Africa", yearsInSchool: 12.8, lays: 8.5, learningPoverty: 28, enrollmentRate: 98, gpiPrimary: 1.01, spendingPctGDP: 3.2 },
  { code: "SAU", name: "Saudi Arabia", region: "Middle East & North Africa", yearsInSchool: 13.2, lays: 9.1, learningPoverty: 20, enrollmentRate: 98, gpiPrimary: 0.99, spendingPctGDP: 7.8 },

  // North America
  { code: "USA", name: "United States", region: "North America", yearsInSchool: 13.3, lays: 11.4, learningPoverty: 7, enrollmentRate: 99, gpiPrimary: 1.0, spendingPctGDP: 5.0 },
  { code: "CAN", name: "Canada", region: "North America", yearsInSchool: 13.6, lays: 12.2, learningPoverty: 4, enrollmentRate: 99, gpiPrimary: 1.01, spendingPctGDP: 5.3 },
];

// Narrative chapters for the story
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
    body: "In Afghanistan, Chad, and Yemen, girls are far less likely to be in school at all. The forest has empty spaces where girls' trees should stand.",
    highlight: "gender",
    metric: "30 countries still have significant gender gaps in enrollment.",
  },
  {
    id: 5,
    title: "Are We On Track?",
    subtitle: "SDG 4 by 2030",
    body: "At current rates, universal quality education will not be achieved until 2099 — 70 years late. The forest needs tending. The question is: who will do it?",
    highlight: null,
    metric: "We are 70 years behind schedule on SDG 4.",
  },
];

export const globalStats = {
  outOfSchool: 250,       // millions
  learningPoverty: 57,    // % in low/middle income countries
  laysGap: 11,            // years between best and worst
  yearsLate: 70,          // years behind SDG 4 target
};
