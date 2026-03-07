import type { CountryData, CountryYearData, TimelineYear } from "./types";
import { TIMELINE_YEARS } from "./types";

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function generateTimelineData(countries: CountryData[]): Record<TimelineYear, CountryData[]> {
  const startYear = 2000;
  const currentYear = 2024;
  const result: Record<TimelineYear, CountryData[]> = {} as Record<TimelineYear, CountryData[]>;

  for (const year of TIMELINE_YEARS) {
    const yearProgress = (year - startYear) / (currentYear - startYear);
    
    result[year] = countries.map((country) => {
      const improvementFactor = getRegionImprovementFactor(country.region);
      const volatility = getRegionVolatility(country.region);
      
      const noise = (Math.sin(country.code.charCodeAt(0) * year * 0.1) * 0.5 + 0.5) * volatility;
      
      const yearsInSchoolBase = lerp(
        country.yearsInSchool * (0.5 + improvementFactor * 0.1),
        country.yearsInSchool,
        yearProgress
      );
      
      const laysBase = lerp(
        country.lays * (0.4 + improvementFactor * 0.15),
        country.lays,
        yearProgress
      );
      
      const learningPovertyBase = lerp(
        Math.min(100, country.learningPoverty * (1.5 - improvementFactor * 0.1)),
        country.learningPoverty,
        yearProgress
      );
      
      const enrollmentBase = lerp(
        country.enrollmentRate * (0.7 + improvementFactor * 0.1),
        country.enrollmentRate,
        yearProgress
      );

      const gpiBase = lerp(
        country.gpiPrimary * (0.8 + improvementFactor * 0.1),
        country.gpiPrimary,
        yearProgress
      );

      if (year === 2020) {
        const covidImpact = country.region === "Sub-Saharan Africa" ? 0.92 : 
                           country.region === "South Asia" ? 0.9 :
                           country.region === "Latin America & Caribbean" ? 0.88 : 0.95;
        return {
          ...country,
          year,
          yearsInSchool: round(yearsInSchoolBase * covidImpact),
          lays: round(laysBase * covidImpact * 0.95),
          learningPoverty: round(clamp(learningPovertyBase * (2 - covidImpact), 0, 100)),
          enrollmentRate: round(clamp(enrollmentBase * covidImpact, 0, 100)),
          gpiPrimary: round(gpiBase, 2),
          spendingPctGDP: round(country.spendingPctGDP * (0.9 + Math.random() * 0.2), 1),
        };
      }

      return {
        ...country,
        year,
        yearsInSchool: round(yearsInSchoolBase + noise * 0.3),
        lays: round(laysBase + noise * 0.2),
        learningPoverty: round(clamp(learningPovertyBase - noise * 2, 0, 100)),
        enrollmentRate: round(clamp(enrollmentBase + noise * 1, 0, 100)),
        gpiPrimary: round(clamp(gpiBase + noise * 0.02, 0, 1.2), 2),
        spendingPctGDP: round(country.spendingPctGDP * (0.8 + yearProgress * 0.2 + noise * 0.1), 1),
      };
    });
  }

  return result;
}

function getRegionImprovementFactor(region: string): number {
  const factors: Record<string, number> = {
    "Sub-Saharan Africa": 0.3,
    "South Asia": 0.5,
    "Middle East & North Africa": 0.4,
    "Latin America & Caribbean": 0.45,
    "East Asia & Pacific": 0.6,
    "Europe & Central Asia": 0.7,
    "North America": 0.8,
  };
  return factors[region] ?? 0.5;
}

function getRegionVolatility(region: string): number {
  const volatility: Record<string, number> = {
    "Sub-Saharan Africa": 0.15,
    "South Asia": 0.12,
    "Middle East & North Africa": 0.18,
    "Latin America & Caribbean": 0.1,
    "East Asia & Pacific": 0.08,
    "Europe & Central Asia": 0.05,
    "North America": 0.03,
  };
  return volatility[region] ?? 0.1;
}

function round(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function getDataForYear(
  timelineData: Record<TimelineYear, CountryData[]>,
  year: TimelineYear
): CountryData[] {
  return timelineData[year] || [];
}
