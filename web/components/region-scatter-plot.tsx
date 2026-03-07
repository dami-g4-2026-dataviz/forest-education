"use client";

import { useMemo } from "react";
import type { CountryData, Region } from "@/lib/types";
import { REGION_COLORS } from "@/lib/constants";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Legend,
} from "recharts";

interface RegionScatterPlotProps {
  countries: CountryData[];
  activeRegion: Region | null;
  onCountryClick?: (country: CountryData) => void;
}

interface RegionMean {
  region: Region;
  meanLays: number;
  meanYearsInSchool: number;
  countryCount: number;
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
  payload?: { payload: CountryData | RegionMean }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  if ("name" in d) {
    const c = d as CountryData;
    const efficiency =
      c.yearsInSchool > 0 ? ((c.lays / c.yearsInSchool) * 100).toFixed(0) : "–";
    const color = BRIGHT_REGION_COLORS[c.region];

    return (
      <div
        className="px-4 py-3 rounded-xl text-xs"
        style={{
          background: "rgba(8,16,12,0.95)",
          border: `1px solid ${color}40`,
          fontFamily: "Space Mono, monospace",
          color: "rgba(255,255,255,0.8)",
          boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
        }}
      >
        <div className="font-semibold mb-1" style={{ color }}>
          {c.name}
        </div>
        <div className="text-[10px] mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          {c.region}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Enrolled</span>
          <span>{c.yearsInSchool.toFixed(1)} yrs</span>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Learning</span>
          <span style={{ color }}>{c.lays.toFixed(1)} yrs</span>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Efficiency</span>
          <span style={{ color: "var(--tree-healthy)" }}>{efficiency}%</span>
        </div>
      </div>
    );
  }

  const r = d as RegionMean;
  const color = BRIGHT_REGION_COLORS[r.region];
  const efficiency =
    r.meanYearsInSchool > 0
      ? ((r.meanLays / r.meanYearsInSchool) * 100).toFixed(0)
      : "–";

  return (
    <div
      className="px-4 py-3 rounded-xl text-xs"
      style={{
        background: "rgba(8,16,12,0.95)",
        border: `2px solid ${color}`,
        fontFamily: "Space Mono, monospace",
        color: "rgba(255,255,255,0.8)",
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 30px ${color}40`,
      }}
    >
      <div
        className="text-[10px] uppercase tracking-wider mb-1"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Region Mean
      </div>
      <div className="font-semibold mb-2" style={{ color }}>
        {r.region}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Avg Enrolled</span>
        <span>{r.meanYearsInSchool.toFixed(1)} yrs</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Avg Learning</span>
        <span style={{ color }}>{r.meanLays.toFixed(1)} yrs</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Efficiency</span>
        <span style={{ color: "var(--tree-healthy)" }}>{efficiency}%</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Countries</span>
        <span>{r.countryCount}</span>
      </div>
    </div>
  );
}

export default function RegionScatterPlot({
  countries,
  activeRegion,
  onCountryClick,
}: RegionScatterPlotProps) {
  const regionMeans = useMemo(() => {
    const grouped = new Map<Region, CountryData[]>();

    countries.forEach((c) => {
      const arr = grouped.get(c.region) || [];
      arr.push(c);
      grouped.set(c.region, arr);
    });

    const means: RegionMean[] = [];
    grouped.forEach((arr, region) => {
      const meanLays = arr.reduce((s, c) => s + c.lays, 0) / arr.length;
      const meanYearsInSchool =
        arr.reduce((s, c) => s + c.yearsInSchool, 0) / arr.length;
      means.push({
        region,
        meanLays,
        meanYearsInSchool,
        countryCount: arr.length,
      });
    });

    return means;
  }, [countries]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h3
            className="text-lg font-semibold text-white"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Countries & Region Means
          </h3>
          <p
            className="text-xs mt-1"
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "Space Mono, monospace",
            }}
          >
            Small dots = countries · Large diamonds = regional averages
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 32, bottom: 40, left: 48 }}>
            <XAxis
              type="number"
              dataKey="yearsInSchool"
              domain={[4, 16]}
              tick={{
                fill: "rgba(255,255,255,0.35)",
                fontSize: 10,
                fontFamily: "Space Mono, monospace",
              }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              label={{
                value: "Years enrolled in school",
                position: "insideBottom",
                offset: -20,
                fill: "rgba(255,255,255,0.3)",
                fontSize: 10,
                fontFamily: "Space Mono, monospace",
              }}
            />
            <YAxis
              type="number"
              dataKey="lays"
              domain={[0, 14]}
              tick={{
                fill: "rgba(255,255,255,0.35)",
                fontSize: 10,
                fontFamily: "Space Mono, monospace",
              }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              label={{
                value: "Years of actual learning (LAYS)",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                fill: "rgba(255,255,255,0.3)",
                fontSize: 10,
                fontFamily: "Space Mono, monospace",
              }}
            />
            <ReferenceLine
              segment={[
                { x: 4, y: 4 },
                { x: 14, y: 14 },
              ]}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="4 4"
              label={{
                value: "100% efficiency",
                position: "insideTopLeft",
                fill: "rgba(255,255,255,0.2)",
                fontSize: 9,
                fontFamily: "Space Mono, monospace",
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.08)" }}
            />

            {/* Individual countries */}
            <Scatter
              name="Countries"
              data={countries}
              onClick={(data) => onCountryClick?.(data as unknown as CountryData)}
            >
              {countries.map((c) => {
                const dimmed =
                  activeRegion !== null && c.region !== activeRegion;
                const color = BRIGHT_REGION_COLORS[c.region];
                return (
                  <Cell
                    key={c.code}
                    fill={color}
                    fillOpacity={dimmed ? 0.1 : 0.5}
                    stroke={color}
                    strokeOpacity={dimmed ? 0.05 : 0.3}
                    strokeWidth={1}
                    r={5}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </Scatter>

            {/* Region means - larger diamonds */}
            <Scatter
              name="Region Means"
              data={regionMeans.map((r) => ({
                ...r,
                yearsInSchool: r.meanYearsInSchool,
                lays: r.meanLays,
              }))}
              shape="diamond"
            >
              {regionMeans.map((r) => {
                const dimmed =
                  activeRegion !== null && r.region !== activeRegion;
                const color = BRIGHT_REGION_COLORS[r.region];
                return (
                  <Cell
                    key={r.region}
                    fill={color}
                    fillOpacity={dimmed ? 0.2 : 1}
                    stroke="#fff"
                    strokeOpacity={dimmed ? 0.1 : 0.8}
                    strokeWidth={2}
                    r={12}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div
        className="mt-4 pt-3 flex flex-wrap items-center justify-center gap-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {(Object.entries(BRIGHT_REGION_COLORS) as [Region, string][]).map(
          ([region, color]) => {
            const dimmed = activeRegion !== null && region !== activeRegion;
            return (
              <div
                key={region}
                className="flex items-center gap-2"
                style={{ opacity: dimmed ? 0.3 : 1 }}
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ background: color }}
                />
                <span
                  className="text-[10px]"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  {region.length > 16 ? region.slice(0, 14) + "…" : region}
                </span>
              </div>
            );
          }
        )}
      </div>

      <div
        className="mt-2 text-[10px] text-center"
        style={{
          color: "rgba(255,255,255,0.25)",
          fontFamily: "Space Mono, monospace",
        }}
      >
        Click on a country dot for details · Diamond markers show regional
        averages
      </div>
    </div>
  );
}
