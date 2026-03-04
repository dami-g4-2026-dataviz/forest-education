import { useState, useCallback, useEffect } from "react";
import { CountryData, Region, REGION_COLORS } from "@/lib/educationData";
import Forest from "@/components/Forest";
import CountryDetail from "@/components/CountryDetail";

export default function Home() {
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showIntro) {
        if (e.key === "Enter" || e.key === " ") setShowIntro(false);
        return;
      }
      if (e.key === "Escape") {
        setSelectedCountry(null);
        setActiveRegion(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showIntro]);

  const handleCountryClick = useCallback((country: CountryData) => {
    setSelectedCountry(country);
  }, []);

  const handleRegionClick = useCallback((region: Region) => {
    setActiveRegion((r) => (r === region ? null : region));
  }, []);

  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "var(--forest-deep)" }}
    >
      {/* Forest canvas — always rendered, even during intro */}
      <div className="absolute inset-0">
        <Forest
          highlightMetric={null}
          activeRegion={activeRegion}
          onCountryClick={showIntro ? () => {} : handleCountryClick}
          chapterId={0}
        />
      </div>

      {/* ─── Intro overlay ──────────────────────────────────────────────────── */}
      {showIntro && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(4,10,7,0.82)", backdropFilter: "blur(2px)" }}
        >
          <div className="relative text-center max-w-xl px-8 z-10">
            {/* SDG badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-8"
              style={{
                background: "rgba(74, 222, 128, 0.08)",
                border: "1px solid rgba(74, 222, 128, 0.22)",
                color: "var(--tree-healthy)",
                fontFamily: "Space Mono, monospace",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--tree-healthy)", boxShadow: "0 0 6px var(--tree-healthy)" }}
              />
              SDG 4 · Quality Education · Data Story
            </div>

            {/* Title */}
            <h1
              className="font-black leading-none mb-8"
              style={{
                fontSize: "clamp(48px, 7vw, 80px)",
                color: "var(--text-primary)",
                fontFamily: "Playfair Display, serif",
              }}
            >
              The Silent
              <br />
              <em style={{ color: "var(--tree-healthy)", fontStyle: "italic" }}>Forest</em>
            </h1>

            {/* CTA */}
            <button
              onClick={() => setShowIntro(false)}
              className="px-10 py-4 rounded-2xl text-base font-semibold transition-all"
              style={{
                background: "var(--tree-healthy)",
                color: "var(--forest-deep)",
                boxShadow: "0 0 40px rgba(74, 222, 128, 0.3)",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Enter the Forest →
            </button>
          </div>
        </div>
      )}

      {/* ─── Main UI (hidden during intro) ────────────────────────────────── */}
      {!showIntro && (
        <>
          {/* Header bar */}
          <div
            className="absolute top-0 left-0 right-0 z-30 flex items-center gap-4 px-6 py-3"
            style={{
              background: "linear-gradient(to bottom, rgba(6,12,9,0.92) 0%, transparent 100%)",
            }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--tree-healthy)", boxShadow: "0 0 8px var(--tree-healthy)" }}
              />
              <span
                className="text-sm font-bold"
                style={{ color: "var(--text-primary)", fontFamily: "Playfair Display, serif" }}
              >
                The Silent Forest
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(74, 222, 128, 0.1)",
                  border: "1px solid rgba(74, 222, 128, 0.2)",
                  color: "var(--tree-healthy)",
                  fontFamily: "Space Mono, monospace",
                }}
              >
                SDG 4
              </span>
            </div>

            {/* Region filter pills */}
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              {(Object.entries(REGION_COLORS) as [Region, string][]).map(([region, color]) => {
                const isActive = activeRegion === region;
                return (
                  <button
                    key={region}
                    onClick={() => handleRegionClick(region)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-all"
                    style={{
                      background: isActive ? `${color}25` : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isActive ? color : "rgba(255,255,255,0.08)"}`,
                      color: isActive ? color : "rgba(255,255,255,0.45)",
                      fontFamily: "Space Mono, monospace",
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: color, opacity: isActive ? 1 : 0.5 }}
                    />
                    {region}
                  </button>
                );
              })}
            </div>

            {/* About button */}
            <button
              onClick={() => setShowIntro(true)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                color: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              About
            </button>
          </div>

          {/* Country detail modal */}
          {selectedCountry && (
            <CountryDetail
              country={selectedCountry}
              onClose={() => setSelectedCountry(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
