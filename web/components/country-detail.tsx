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
        <span className="text-[10px] uppercase tracking-wider md:text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
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
        className="font-bold text-xs md:text-sm"
        style={{
          color: color || "var(--text-primary)",
          fontFamily: "Space Mono, monospace",
        }}
      >
        {typeof value === "number" ? parseFloat(value.toFixed(2)) : value}{unit}
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
      className="fixed inset-0 z-40 flex items-end justify-center overflow-y-auto overscroll-contain p-0 touch-pan-y md:items-center md:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[100dvh] w-full flex-col overflow-y-auto rounded-t-3xl shadow-2xl md:max-h-[92vh] md:flex-row md:overflow-hidden md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          background: "rgba(10, 15, 13, 0.98)",
          border: `1px solid ${color}40`,
        }}
      >
        {/* Drag handle for mobile */}
        <div className="flex justify-center pt-2 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors md:top-4 md:right-4 md:p-2"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <X size={18} />
        </button>

        <div
          className="w-full flex flex-col items-center justify-center px-4 py-4 bg-gradient-to-b from-transparent to-black/20 md:w-[42%] md:p-8"
          style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="relative">
            <svg
              width={160}
              height={190}
              className="overflow-visible md:hidden"
            >
              <Tree
                country={country}
                x={80}
                y={175}
                scale={1.5}
                maxTrunkH={110}
                showLabel={true}
              />
            </svg>
            <svg
              width={240}
              height={280}
              className="overflow-visible hidden md:block"
            >
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
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 md:w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ filter: "blur(2px)" }}
            />
          </div>
          <div className="mt-4 text-center md:mt-8">
            <span
              className="text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-widest font-bold md:text-[10px] md:px-3 md:py-1"
              style={{
                background: `${efficiencyColor}15`,
                color: efficiencyColor,
                border: `1px solid ${efficiencyColor}30`,
                fontFamily: "Space Mono, monospace",
              }}
            >
              {efficiencyLabel}
            </span>

            <div className="mt-3 flex flex-col gap-0.5 text-left md:mt-4 md:gap-1">
              {([
                { tier: "THRIVING",   label: ">85% efficiency",  color: "#4ADE80", active: learningRatio > 0.85 },
                { tier: "ADEQUATE",   label: "70–85%",           color: "#EAB308", active: learningRatio > 0.7 && learningRatio <= 0.85 },
                { tier: "STRUGGLING", label: "50–70%",           color: "#F97316", active: learningRatio > 0.5 && learningRatio <= 0.7 },
                { tier: "IN CRISIS",  label: "≤50%",             color: "#EF4444", active: learningRatio <= 0.5 },
              ] as const).map(({ tier, label, color: c, active }) => (
                <div
                  key={tier}
                  className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg md:gap-2 md:px-2 md:py-1"
                  style={{
                    opacity: active ? 1 : 0.28,
                    background: active ? `${c}10` : "transparent",
                    transition: "opacity 0.2s",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c, boxShadow: active ? `0 0 4px ${c}` : "none" }} />
                  <span className="text-[8px] font-bold tracking-widest uppercase md:text-[9px]" style={{ color: c, fontFamily: "Space Mono, monospace" }}>{tier}</span>
                  <span className="text-[8px] ml-auto md:text-[9px]" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Mono, monospace" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto px-5 py-4 md:p-10">
          <header className="mb-4 md:mb-8">
            <div className="text-[9px] uppercase tracking-[0.2em] mb-1 md:text-[10px] md:mb-2" style={{ color, fontFamily: "Space Mono, monospace" }}>
              {country.region}
            </div>
            <h2
              className="text-2xl font-bold leading-tight md:text-4xl"
              style={{ color: "var(--text-primary)", fontFamily: "Playfair Display, serif" }}
            >
              {country.name}
            </h2>
          </header>

          <div className="mb-6 md:mb-10">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black md:text-5xl" style={{ color: "var(--text-primary)", fontFamily: "Space Mono, monospace" }}>
                {typeof country.lays === "number" ? country.lays.toFixed(2) : country.lays}
              </span>
              <span className="text-base opacity-40 font-light md:text-xl">years</span>
            </div>
            <p className="text-sm leading-snug font-light text-white/70 md:text-lg">
              of <span className="text-white font-medium">{typeof country.yearsInSchool === "number" ? country.yearsInSchool.toFixed(1) : country.yearsInSchool} years</span> in school translate to actual learning (measured by test results).
            </p>
            {lostYears > 0.5 && (
              <p className="mt-3 text-xs text-white/60 italic md:mt-4 md:text-sm">
                &ldquo;{lostYears.toFixed(1)} years of schooling are lost to low education quality.&rdquo;
              </p>
            )}
          </div>

          <div className="space-y-1 mt-auto">
            <StatRow label="Learning Poverty" value={country.learningPoverty} unit="%" color={country.learningPoverty > 60 ? "#EF4444" : country.learningPoverty > 30 ? "#F97316" : "#4ADE80"} sourceKey="learningPoverty" />
            <StatRow label="Primary Enrollment" value={country.enrollmentRate} unit="%" sourceKey="enrollmentRate" />
            <StatRow label="Gender Parity Index" value={country.gpiPrimary} color={country.gpiPrimary < 0.9 ? "#EF4444" : country.gpiPrimary > 1.1 ? "#06B6D4" : "#4ADE80"} sourceKey="gpiPrimary" />
            <StatRow label="Education Spending" value={country.spendingPctGDP} unit="% GDP" sourceKey="spendingPctGDP" />
          </div>

          <footer className="mt-5 pt-4 flex justify-between items-center opacity-40 text-[8px] uppercase tracking-tighter md:mt-8 md:pt-6 md:text-[9px]" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
