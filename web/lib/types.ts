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
  yearsInSchool: number;
  lays: number;
  learningPoverty: number;
  enrollmentRate: number;
  gpiPrimary: number;
  spendingPctGDP: number;
}
