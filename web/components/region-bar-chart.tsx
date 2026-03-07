"use client";

import { useMemo } from "react";
import type { CountryData, Region } from "@/lib/types";
import { REGION_COLORS } from "@/lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface RegionBarChartProps {
  countries: CountryData[];
  activeRegion: Region | null;
}

interface RegionStats {
  region: Region;
  meanLays: number;
  meanYearsInSchool: number;
  meanLearningPoverty: number;
  countryCount: number;
  efficiency: number;
}

const BRIGHT_REGION_COLORS: Record<Region, string> = {
  "Sub-Saharan Africa": "#FF6B6B",
  "South Asia": "#FFB347",
  "East Asia & Pacific": "#FFE066",
  "Europe & Central Asia": "#69DB7C",
  "Latin America & Caribbean": "#4ECDC4",
  "Middle East & North Africa": "#C5A3FF",
  "North America": "#51CF66",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: RegionStats }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = BRIGHT_REGION_COLORS[d.region];

  return (
    <div
      className="px-4 py-3 rounded-xl text-xs"
      style={{
        background: "rgba(8,16,12,0.95)",
        border: `1px solid ${color}40`,
        fontFamily: "Space Mono, monospace",
        color: "rgba(255,255,255,0.8)",
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 30px ${color}20`,
      }}
    >
      <div className="font-semibold mb-2" style={{ color }}>
        {d.region}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Mean LAYS</span>
        <span className="font-semibold" style={{ color }}>
          {d.meanLays.toFixed(1)} yrs
        </span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Mean Enrolled</span>
        <span>{d.meanYearsInSchool.toFixed(1)} yrs</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Efficiency</span>
        <span>{d.efficiency.toFixed(0)}%</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Learning Poverty</span>
        <span
          style={{ color: d.meanLearningPoverty > 50 ? "#FF6B6B" : "#69DB7C" }}
        >
          {d.meanLearningPoverty.toFixed(0)}%
        </span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Countries</span>
        <span>{d.countryCount}</span>
      </div>
    </div>
  );
}

export default function RegionBarChart({
  countries,
  activeRegion,
}: RegionBarChartProps) {
  const regionStats = useMemo(() => {
    const grouped = new Map<Region, CountryData[]>();

    countries.forEach((c) => {
      const arr = grouped.get(c.region) || [];
      arr.push(c);
      grouped.set(c.region, arr);
    });

    const stats: RegionStats[] = [];
    grouped.forEach((arr, region) => {
      const meanLays = arr.reduce((s, c) => s + c.lays, 0) / arr.length;
      const meanYearsInSchool =
        arr.reduce((s, c) => s + c.yearsInSchool, 0) / arr.length;
      const meanLearningPoverty =
        arr.reduce((s, c) => s + c.learningPoverty, 0) / arr.length;
      stats.push({
        region,
        meanLays,
        meanYearsInSchool,
        meanLearningPoverty,
        countryCount: arr.length,
        efficiency: (meanLays / meanYearsInSchool) * 100,
      });
    });

    return stats.sort((a, b) => a.meanLays - b.meanLays);
  }, [countries]);

  const globalMean = useMemo(() => {
    const total = countries.reduce((s, c) => s + c.lays, 0);
    return total / countries.length;
  }, [countries]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h3
            className="text-lg font-semibold text-white"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Mean Years of Learning by Region
          </h3>
          <p
            className="text-xs mt-1"
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "Space Mono, monospace",
            }}
          >
            Learning-Adjusted Years of Schooling (LAYS) averaged across
            countries
          </p>
        </div>
        <div
          className="text-right px-3 py-2 rounded-lg"
          style={{ background: "rgba(74, 222, 128, 0.08)" }}
        >
          <div
            className="text-[10px] uppercase tracking-wider"
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "Space Mono, monospace",
            }}
          >
            Global Mean
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: "var(--tree-healthy)", fontFamily: "Space Mono" }}
          >
            {globalMean.toFixed(1)} yrs
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={regionStats}
            layout="vertical"
            margin={{ top: 8, right: 32, bottom: 8, left: 8 }}
          >
            <XAxis
              type="number"
              domain={[0, 14]}
              tick={{
                fill: "rgba(255,255,255,0.35)",
                fontSize: 10,
                fontFamily: "Space Mono, monospace",
              }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              label={{
                value: "Mean LAYS (years)",
                position: "insideBottom",
                offset: -4,
                fill: "rgba(255,255,255,0.3)",
                fontSize: 10,
                fontFamily: "Space Mono, monospace",
              }}
            />
            <YAxis
              type="category"
              dataKey="region"
              tick={{
                fill: "rgba(255,255,255,0.6)",
                fontSize: 11,
                fontFamily: "Space Mono, monospace",
              }}
              tickLine={false}
              axisLine={false}
              width={180}
              tickFormatter={(v: string) =>
                v.length > 22 ? v.slice(0, 20) + "…" : v
              }
            />
            <ReferenceLine
              x={globalMean}
              stroke="rgba(74, 222, 128, 0.5)"
              strokeDasharray="4 4"
              label={{
                value: "Global avg",
                position: "top",
                fill: "rgba(74, 222, 128, 0.6)",
                fontSize: 9,
                fontFamily: "Space Mono, monospace",
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="meanLays" radius={[0, 6, 6, 0]} barSize={28}>
              {regionStats.map((d) => {
                const dimmed = activeRegion !== null && d.region !== activeRegion;
                const color = BRIGHT_REGION_COLORS[d.region];
                return (
                  <Cell
                    key={d.region}
                    fill={color}
                    fillOpacity={dimmed ? 0.2 : 0.85}
                    stroke={color}
                    strokeWidth={dimmed ? 0 : 1}
                    strokeOpacity={0.4}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="mt-4 pt-3 text-[10px] text-center"
        style={{
          color: "rgba(255,255,255,0.25)",
          fontFamily: "Space Mono, monospace",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        LAYS = Learning-Adjusted Years of Schooling · Source: World Bank HCI
        2024
      </div>
    </div>
  );
}
