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

export interface CountryYearData extends CountryData {
  year: number;
}

export const TIMELINE_YEARS = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] as const;
export type TimelineYear = typeof TIMELINE_YEARS[number];
