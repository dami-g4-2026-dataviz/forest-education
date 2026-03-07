"use client";

import type { CountryData } from "@/lib/types";
import { REGION_COLORS } from "@/lib/constants";
import { X } from "lucide-react";
import Tree from "./tree";

interface CountryDetailProps {
  country: CountryData;
  onClose: () => void;
}

const METRIC_SOURCES: Record<string, { label: string; url: string }> = {
  yearsInSchool: { label: "UNESCO UIS", url: "https://uis.unesco.org/en/topic/out-school-children-and-youth" },
  lays: { label: "World Bank HCI", url: "https://www.worldbank.org/en/publication/human-capital" },
  learningPoverty: { label: "WB Learning Poverty", url: "https://www.worldbank.org/en/topic/education/brief/learning-poverty" },
  enrollmentRate: { label: "UNESCO UIS", url: "https://uis.unesco.org/en/topic/out-school-children-and-youth" },
  gpiPrimary: { label: "UNESCO UIS", url: "https://uis.unesco.org/en/topic/gender-parity-education" },
  spendingPctGDP: { label: "World Bank EdStats", url: "https://datatopics.worldbank.org/education/" },
};

function StatRow({ label, value, unit, color, sourceKey }: { label: string; value: number | string; unit?: string; color?: string; sourceKey?: string }) {
  const source = sourceKey ? METRIC_SOURCES[sourceKey] : undefined;
  return (
    <div className="flex justify-between items-baseline py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
        {source && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-white/50 hover:text-white/80 transition-colors"
          >
            Source: {source.label}
          </a>
        )}
      </div>
      <span
        className="font-bold text-sm"
        style={{
          color: color || "var(--text-primary)",
          fontFamily: "Space Mono, monospace",
        }}
      >
        {value}{unit}
      </span>
    </div>
  );
}

export default function CountryDetail({ country, onClose }: CountryDetailProps) {
  const color = REGION_COLORS[country.region];
  const learningRatio = country.lays / country.yearsInSchool;
  const lostYears = country.yearsInSchool - country.lays;

  const efficiencyLabel =
    learningRatio > 0.85 ? "Thriving" :
    learningRatio > 0.7 ? "Adequate" :
    learningRatio > 0.5 ? "Struggling" :
    "In Crisis";

  const efficiencyColor =
    learningRatio > 0.85 ? "#4ADE80" :
    learningRatio > 0.7 ? "#EAB308" :
    learningRatio > 0.5 ? "#F97316" :
    "#EF4444";

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          background: "rgba(10, 15, 13, 0.98)",
          border: `1px solid ${color}40`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <X size={20} />
        </button>

        <div
          className="w-full md:w-[42%] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-transparent to-black/20"
          style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="relative">
            <svg width={240} height={280} className="overflow-visible">
              <Tree
                country={country}
                x={120}
                y={260}
                scale={2.2}
                maxTrunkH={160}
                showLabel={true}
              />
            </svg>
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ filter: "blur(2px)" }}
            />
          </div>
          <div className="mt-8 text-center">
            <span
              className="text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold"
              style={{
                background: `${efficiencyColor}15`,
                color: efficiencyColor,
                border: `1px solid ${efficiencyColor}30`,
                fontFamily: "Space Mono, monospace",
              }}
            >
              {efficiencyLabel}
            </span>

            {/* Classification scale legend */}
            <div className="mt-4 flex flex-col gap-1 text-left">
              {([
                { tier: "THRIVING",   label: ">85% efficiency",  color: "#4ADE80", active: learningRatio > 0.85 },
                { tier: "ADEQUATE",   label: "70–85%",           color: "#EAB308", active: learningRatio > 0.7 && learningRatio <= 0.85 },
                { tier: "STRUGGLING", label: "50–70%",           color: "#F97316", active: learningRatio > 0.5 && learningRatio <= 0.7 },
                { tier: "IN CRISIS",  label: "≤50%",             color: "#EF4444", active: learningRatio <= 0.5 },
              ] as const).map(({ tier, label, color: c, active }) => (
                <div
                  key={tier}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg"
                  style={{
                    opacity: active ? 1 : 0.28,
                    background: active ? `${c}10` : "transparent",
                    transition: "opacity 0.2s",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c, boxShadow: active ? `0 0 4px ${c}` : "none" }} />
                  <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: c, fontFamily: "Space Mono, monospace" }}>{tier}</span>
                  <span className="text-[9px] ml-auto" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Mono, monospace" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-10 overflow-y-auto">
          <header className="mb-8">
            <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color, fontFamily: "Space Mono, monospace" }}>
              {country.region}
            </div>
            <h2
              className="text-4xl font-bold leading-tight"
              style={{ color: "var(--text-primary)", fontFamily: "Playfair Display, serif" }}
            >
              {country.name}
            </h2>
          </header>

          <div className="mb-10">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-black" style={{ color: "var(--text-primary)", fontFamily: "Space Mono, monospace" }}>
                {country.lays}
              </span>
              <span className="text-xl opacity-40 font-light">years</span>
            </div>
            <p className="text-lg leading-snug font-light text-white/70">
              of <span className="text-white font-medium">{country.yearsInSchool} years</span> in school translate to actual learning (measured by test results).
            </p>
            {lostYears > 0.5 && (
              <p className="mt-4 text-sm text-white/60 italic">
                “{lostYears.toFixed(1)} years of schooling are lost to low education quality.”
              </p>
            )}
          </div>

          <div className="space-y-1 mt-auto">
            <StatRow label="Learning Poverty" value={country.learningPoverty} unit="%" color={country.learningPoverty > 60 ? "#EF4444" : country.learningPoverty > 30 ? "#F97316" : "#4ADE80"} sourceKey="learningPoverty" />
            <StatRow label="Primary Enrollment" value={country.enrollmentRate} unit="%" sourceKey="enrollmentRate" />
            <StatRow label="Gender Parity Index" value={country.gpiPrimary} color={country.gpiPrimary < 0.9 ? "#EF4444" : country.gpiPrimary > 1.1 ? "#06B6D4" : "#4ADE80"} sourceKey="gpiPrimary" />
            <StatRow label="Education Spending" value={country.spendingPctGDP} unit="% GDP" sourceKey="spendingPctGDP" />
          </div>

          <footer className="mt-8 pt-6 flex justify-between items-center opacity-40 text-[9px] uppercase tracking-tighter" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <a href="https://www.worldbank.org/en/publication/human-capital" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors">
              Source: World Bank HCI 2024
            </a>
            <span>Ref: SDG 4</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
