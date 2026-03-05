import { CountryData, Region, REGION_COLORS } from "@/lib/educationData";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ScatterViewProps {
  countries: CountryData[];
  activeRegion: Region | null;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: CountryData }[] }) {
  if (!active || !payload?.length) return null;
  const c = payload[0].payload;
  const efficiency = c.yearsInSchool > 0 ? ((c.lays / c.yearsInSchool) * 100).toFixed(0) : "–";
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        background: "rgba(8,16,12,0.95)",
        border: "1px solid rgba(74,222,128,0.15)",
        fontFamily: "Space Mono, monospace",
        color: "rgba(255,255,255,0.8)",
      }}
    >
      <div className="font-semibold mb-0.5">{c.name}</div>
      <div style={{ color: "rgba(255,255,255,0.5)" }}>{c.yearsInSchool} yrs enrolled · {c.lays} yrs learned</div>
      <div style={{ color: "var(--tree-healthy)" }}>Efficiency: {efficiency}%</div>
    </div>
  );
}

export default function ScatterView({ countries, activeRegion }: ScatterViewProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 16, right: 24, bottom: 32, left: 40 }}>
        <XAxis
          type="number"
          dataKey="yearsInSchool"
          domain={[0, 16]}
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "Space Mono, monospace" }}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          label={{ value: "Years enrolled", position: "insideBottom", offset: -16, fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "Space Mono, monospace" }}
        />
        <YAxis
          type="number"
          dataKey="lays"
          domain={[0, 16]}
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "Space Mono, monospace" }}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          label={{ value: "Years actually learned (LAYS)", angle: -90, position: "insideLeft", offset: 8, fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "Space Mono, monospace" }}
        />
        {/* Perfect efficiency diagonal */}
        <ReferenceLine
          segment={[{ x: 0, y: 0 }, { x: 16, y: 16 }]}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="4 4"
          label={{ value: "100% efficiency", position: "insideTopLeft", fill: "rgba(255,255,255,0.2)", fontSize: 8, fontFamily: "Space Mono, monospace" }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
        <Scatter data={countries}>
          {countries.map((c) => {
            const dimmed = activeRegion !== null && c.region !== activeRegion;
            const color = REGION_COLORS[c.region] ?? "#4ade80";
            return (
              <Cell
                key={c.code}
                fill={color}
                fillOpacity={dimmed ? 0.12 : 0.75}
                stroke={color}
                strokeOpacity={dimmed ? 0.08 : 0.4}
                strokeWidth={1}
              />
            );
          })}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
