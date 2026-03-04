import { useState, useCallback, useEffect } from "react";
import { CountryData, Region, chapters } from "@/lib/educationData";
import Forest from "@/components/Forest";
import NarrativePanel from "@/components/NarrativePanel";
import Legend from "@/components/Legend";
import CountryDetail from "@/components/CountryDetail";

const CHAPTER_METRICS: Record<number, string | null> = {
  0: null,
  1: "enrollment",
  2: "learningPoverty",
  3: "lays",
  4: "gender",
  5: null,
};

export default function Home() {
  const [chapterId, setChapterId] = useState(0);
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  const highlightMetric = CHAPTER_METRICS[chapterId];

  const handleNext = useCallback(() => {
    setChapterId((c) => Math.min(c + 1, chapters.length - 1));
  }, []);

  const handlePrev = useCallback(() => {
    setChapterId((c) => Math.max(c - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") {
        setSelectedCountry(null);
        setActiveRegion(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handlePrev]);

  const handleCountryClick = useCallback((country: CountryData) => {
    setSelectedCountry(country);
  }, []);

  const handleRegionClick = useCallback((region: Region | null) => {
    setActiveRegion(region);
  }, []);

  // ─── Intro screen ──────────────────────────────────────────────────────────
  if (showIntro) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--forest-deep)" }}
      >
        {/* Background stars */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 1 + (i % 3),
                height: 1 + (i % 3),
                left: `${(i * 137.5) % 100}%`,
                top: `${(i * 97.3) % 80}%`,
                background: "white",
                opacity: 0.1 + (i % 5) * 0.06,
              }}
            />
          ))}
        </div>

        <div className="relative text-center max-w-2xl px-8 z-10">
          {/* SDG badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-10"
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
            className="font-black leading-none mb-5"
            style={{
              fontSize: "clamp(52px, 8vw, 88px)",
              color: "var(--text-primary)",
              fontFamily: "Playfair Display, serif",
            }}
          >
            The Silent
            <br />
            <em style={{ color: "var(--tree-healthy)", fontStyle: "italic" }}>Forest</em>
          </h1>

          <p
            className="text-lg mb-2"
            style={{ color: "rgba(255,255,255,0.6)", fontWeight: 300 }}
          >
            Every tree is a country. Every canopy tells the truth.
          </p>

          <p
            className="text-sm mb-10 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            250 million children are enrolled in school — but millions are not learning.
            <br />
            This is the story enrollment rates don't tell.
          </p>

          {/* Dataset info */}
          <div
            className="rounded-2xl p-5 mb-8 text-left"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Mono, monospace" }}
            >
              Data Sources
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              {[
                ["World Bank Human Capital Index", "Learning-Adjusted Years of Schooling (LAYS)"],
                ["UNESCO Institute for Statistics", "Enrollment rates, Gender Parity Index"],
                ["World Bank Learning Poverty", "Share of children unable to read by age 10"],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-2">
                  <div
                    className="w-1 h-1 rounded-full mt-2 flex-shrink-0"
                    style={{ background: "var(--tree-healthy)" }}
                  />
                  <div>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{title}</span>
                    {" · "}
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowIntro(false)}
            className="px-10 py-4 rounded-2xl text-base font-semibold transition-all mb-5"
            style={{
              background: "var(--tree-healthy)",
              color: "var(--forest-deep)",
              boxShadow: "0 0 40px rgba(74, 222, 128, 0.25)",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Enter the Forest →
          </button>

          <p className="text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>
            Hover trees to explore · Click for details · Arrow keys to navigate chapters
          </p>
        </div>
      </div>
    );
  }

  // ─── Main visualization ────────────────────────────────────────────────────
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "var(--forest-deep)" }}
    >
      {/* Header bar */}
      <div
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3"
        style={{
          background: "linear-gradient(to bottom, rgba(6,12,9,0.92) 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-4">
          <span
            className="text-xs hidden sm:block"
            style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Mono, monospace" }}
          >
            {chapters[chapterId].title}
          </span>
          <button
            onClick={() => setShowIntro(true)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              color: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            About
          </button>
        </div>
      </div>

      {/* Forest canvas — full screen */}
      <div className="absolute inset-0">
        <Forest
          highlightMetric={highlightMetric}
          activeRegion={activeRegion}
          onCountryClick={handleCountryClick}
          chapterId={chapterId}
        />
      </div>

      {/* Hint bar */}
      <div
        className="absolute top-14 left-1/2 -translate-x-1/2 z-20 text-xs px-4 py-1.5 rounded-full pointer-events-none"
        style={{
          background: "rgba(6,12,9,0.65)",
          color: "rgba(255,255,255,0.22)",
          border: "1px solid rgba(255,255,255,0.05)",
          fontFamily: "Space Mono, monospace",
          backdropFilter: "blur(6px)",
          whiteSpace: "nowrap",
        }}
      >
        Hover to explore · Click for details · ← → keys to navigate
      </div>

      {/* Narrative panel — bottom left */}
      <div className="absolute bottom-6 left-5 z-20">
        <NarrativePanel
          chapterId={chapterId}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </div>

      {/* Legend — bottom right */}
      <div className="absolute bottom-6 right-5 z-20">
        <Legend
          activeRegion={activeRegion}
          onRegionClick={handleRegionClick}
          highlightMetric={highlightMetric}
        />
      </div>

      {/* Country detail side panel */}
      {selectedCountry && (
        <CountryDetail
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  );
}
