import { REGION_COLORS, Region } from "@/lib/educationData";

interface LegendProps {
  activeRegion: Region | null;
  onRegionClick: (region: Region | null) => void;
  highlightMetric: string | null;
}

const METRIC_LEGEND = [
  { label: "High learning poverty (>70%)", color: "#EF4444" },
  { label: "Moderate (40–70%)", color: "#F97316" },
  { label: "Low (20–40%)", color: "#EAB308" },
  { label: "Minimal (<20%)", color: "#4ADE80" },
];

export default function Legend({ activeRegion, onRegionClick, highlightMetric }: LegendProps) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: "rgba(10, 15, 13, 0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
        minWidth: 200,
      }}
    >
      {/* Tree anatomy guide */}
      <div>
        <div
          className="text-xs uppercase tracking-widest mb-2"
          style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Mono, monospace" }}
        >
          How to read a tree
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            <div className="w-1.5 h-8 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
            <span>Trunk height = years in school</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            <div
              className="w-5 h-5 rounded-full"
              style={{ background: "rgba(74, 222, 128, 0.6)", boxShadow: "0 0 8px rgba(74,222,128,0.4)" }}
            />
            <span>Canopy = learning quality</span>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            <div
              className="w-5 h-5 rounded-full"
              style={{ background: "rgba(212, 197, 169, 0.4)" }}
            />
            <span>Bare branches = low learning</span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
        {highlightMetric ? (
          <>
            <div
              className="text-xs uppercase tracking-widest mb-2"
              style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Mono, monospace" }}
            >
              Learning Poverty
            </div>
            {METRIC_LEGEND.map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2 mb-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div
              className="text-xs uppercase tracking-widest mb-2"
              style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Mono, monospace" }}
            >
              Regions
            </div>
            {(Object.entries(REGION_COLORS) as [Region, string][]).map(([region, color]) => (
              <button
                key={region}
                onClick={() => onRegionClick(activeRegion === region ? null : region)}
                className="flex items-center gap-2 mb-1.5 w-full text-left rounded transition-all"
                style={{
                  opacity: activeRegion ? (activeRegion === region ? 1 : 0.4) : 1,
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {region}
                </span>
              </button>
            ))}
            {activeRegion && (
              <button
                onClick={() => onRegionClick(null)}
                className="text-xs mt-1 underline"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Clear filter
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
