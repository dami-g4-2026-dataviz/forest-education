import { CountryData, REGION_COLORS } from "@/lib/educationData";
import { X } from "lucide-react";

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
    <div className="flex justify-between items-baseline py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</span>
        {source && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-opacity"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Mono, monospace", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
          >
            ↗ {source.label}
          </a>
        )}
      </div>
      <span
        className="font-bold text-base"
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
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
    <div
      className="relative flex flex-col rounded-2xl"
      onClick={(e) => e.stopPropagation()}
      style={{
        width: 380,
        maxHeight: "85vh",
        background: "rgba(10, 15, 13, 0.97)",
        border: `1px solid ${color}30`,
        backdropFilter: "blur(16px)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between p-6"
        style={{ borderBottom: `1px solid ${color}20` }}
      >
        <div>
          <div
            className="text-2xl font-bold leading-tight"
            style={{ color: "var(--text-primary)", fontFamily: "Playfair Display, serif" }}
          >
            {country.name}
          </div>
          <div className="text-xs mt-1" style={{ color, fontFamily: "Space Mono, monospace" }}>
            {country.code} · {country.region}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Tree visual summary */}
      <div className="p-6" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div className="flex items-end gap-4 justify-center mb-4">
          {/* Trunk = years in school */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-6 rounded-t-sm"
              style={{
                height: `${(country.yearsInSchool / 16) * 100}px`,
                background: "rgba(255,255,255,0.15)",
              }}
            />
            <span className="text-xs" style={{ color: "var(--text-secondary)", fontFamily: "Space Mono, monospace" }}>
              {country.yearsInSchool}y
            </span>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>enrolled</span>
          </div>

          {/* Canopy = LAYS */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-6 rounded-t-sm"
              style={{
                height: `${(country.lays / 16) * 100}px`,
                background: color,
                boxShadow: `0 0 12px ${color}40`,
              }}
            />
            <span className="text-xs font-bold" style={{ color, fontFamily: "Space Mono, monospace" }}>
              {country.lays}y
            </span>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>learning</span>
          </div>
        </div>

        <div className="text-center">
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{
              background: `${efficiencyColor}20`,
              color: efficiencyColor,
              fontFamily: "Space Mono, monospace",
            }}
          >
            {efficiencyLabel} · {Math.round(learningRatio * 100)}% efficiency
          </span>
        </div>

        {lostYears > 1 && (
          <p className="text-xs text-center mt-3" style={{ color: "var(--text-secondary)" }}>
            <span style={{ color: "#EF4444", fontFamily: "Space Mono, monospace" }}>
              {lostYears.toFixed(1)} years
            </span>{" "}
            of schooling lost to low quality
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex-1 overflow-y-auto p-6">
        <StatRow label="Years in School" value={country.yearsInSchool} unit=" yrs" sourceKey="yearsInSchool" />
        <StatRow
          label="Learning-Adj. Years (LAYS)"
          value={country.lays}
          unit=" yrs"
          color={color}
          sourceKey="lays"
        />
        <StatRow
          label="Learning Poverty"
          value={country.learningPoverty}
          unit="%"
          color={country.learningPoverty > 60 ? "#EF4444" : country.learningPoverty > 30 ? "#F97316" : "#4ADE80"}
          sourceKey="learningPoverty"
        />
        <StatRow label="Primary Enrollment" value={country.enrollmentRate} unit="%" sourceKey="enrollmentRate" />
        <StatRow
          label="Gender Parity Index"
          value={country.gpiPrimary}
          color={country.gpiPrimary < 0.9 ? "#EF4444" : country.gpiPrimary > 1.1 ? "#06B6D4" : "#4ADE80"}
          sourceKey="gpiPrimary"
        />
        <StatRow label="Education Spending" value={country.spendingPctGDP} unit="% GDP" sourceKey="spendingPctGDP" />
      </div>

      {/* Footer */}
      <div
        className="p-4 flex items-center justify-between text-xs"
        style={{ color: "var(--text-secondary)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span>World Bank HCI · UNESCO UIS · WB Learning Poverty</span>
        <a
          href={`https://data.worldbank.org/country/${country.code.toLowerCase()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors"
          style={{ color: color, textDecoration: "none", whiteSpace: "nowrap", marginLeft: 12 }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          View source →
        </a>
      </div>
    </div>
    </div>
  );
}
