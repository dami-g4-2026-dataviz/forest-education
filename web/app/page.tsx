import { promises as fs } from "fs";
import path from "path";
import type { CountryData } from "@/lib/types";
import HomeClient from "@/components/home-client";

async function getCountries(): Promise<CountryData[]> {
  const jsonPath = path.join(process.cwd(), "..", "data", "output", "education.json");
  const raw = await fs.readFile(jsonPath, "utf-8");
  return JSON.parse(raw) as CountryData[];
}

export default async function HomePage() {
  const countries = await getCountries();

  return <HomeClient countries={countries} />;
}
