import { CountryData, REGION_COLORS } from "@/lib/educationData";
import { useEffect, useState } from "react";

interface TooltipProps {
  country: CountryData;
  x: number;
  y: number;
}

function MetricBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${(value / max) * 100}%`,
          background: color,
        }}
      />
    </div>
  );
}

export default function Tooltip({ country, x, y }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const color = REGION_COLORS[country.region];
  const learningRatio = country.lays / country.yearsInSchool;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  // Position: try to keep on screen
  const tooltipWidth = 240;
  const left = Math.min(x - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16);
  const top = Math.max(y - 220, 16);

  return (
    <div
      className="fixed z-50 pointer-events-none tree-tooltip rounded-lg p-4 transition-all duration-200"
      style={{
        left,
        top,
        width: tooltipWidth,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <div>
          <div
            className="font-bold text-sm leading-tight"
            style={{ color: "var(--text-primary)", fontFamily: "Playfair Display, serif" }}
          >
            {country.name}
          </div>
          <div className="text-xs" style={{ color, fontFamily: "Space Mono, monospace" }}>
            {country.region}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
            <span>Years in School</span>
            <span style={{ color: "var(--text-primary)", fontFamily: "Space Mono, monospace" }}>
              {country.yearsInSchool}
            </span>
          </div>
          <MetricBar value={country.yearsInSchool} max={16} color="rgba(255,255,255,0.4)" />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
            <span>Learning-Adj. Years</span>
            <span style={{ color, fontFamily: "Space Mono, monospace" }}>
              {country.lays}
            </span>
          </div>
          <MetricBar value={country.lays} max={16} color={color} />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
            <span>Learning Poverty</span>
            <span
              style={{
                color: country.learningPoverty > 60 ? "#EF4444" : country.learningPoverty > 30 ? "#F97316" : "#4ADE80",
                fontFamily: "Space Mono, monospace",
              }}
            >
              {country.learningPoverty}%
            </span>
          </div>
          <MetricBar
            value={country.learningPoverty}
            max={100}
            color={country.learningPoverty > 60 ? "#EF4444" : country.learningPoverty > 30 ? "#F97316" : "#4ADE80"}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
            <span>Enrollment Rate</span>
            <span style={{ color: "var(--text-primary)", fontFamily: "Space Mono, monospace" }}>
              {country.enrollmentRate}%
            </span>
          </div>
          <MetricBar value={country.enrollmentRate} max={100} color="rgba(255,255,255,0.3)" />
        </div>
      </div>

      {/* Learning efficiency indicator */}
      <div
        className="mt-3 pt-3 text-xs"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          color: "var(--text-secondary)",
        }}
      >
        <span>Learning efficiency: </span>
        <span
          style={{
            color: learningRatio > 0.8 ? "#4ADE80" : learningRatio > 0.6 ? "#EAB308" : "#EF4444",
            fontFamily: "Space Mono, monospace",
            fontWeight: "bold",
          }}
        >
          {Math.round(learningRatio * 100)}%
        </span>
        <span className="ml-1">
          {learningRatio > 0.8 ? "— thriving" : learningRatio > 0.6 ? "— struggling" : "— in crisis"}
        </span>
      </div>
    </div>
  );
}
