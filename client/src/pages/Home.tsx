import { useState, useCallback, useEffect } from "react";
import { countries, CountryData, Region, REGION_COLORS } from "@/lib/educationData";
import Forest from "@/components/Forest";
import CountryDetail from "@/components/CountryDetail";
import { ChevronDown, TreePine, ArrowRight } from "lucide-react";

const NARRATIVE_CHAPTERS = [
  {
    code: "NER",
    headline: "5 years in school. 2 years of learning.",
    subtext: "92% of 10-year-olds in Niger cannot read a simple sentence.",
  },
  {
    code: "IND",
    headline: "10 years enrolled. Half of it lost.",
    subtext: "High enrollment hides a learning crisis affecting 250 million children.",
  },
  {
    code: "SGP",
    headline: "13 years in school. 12.8 years of learning.",
    subtext: "The gap between Niger and Singapore is 10 years of real learning — a full childhood.",
  },
];

export default function Home() {
  const [introStep, setIntroStep] = useState<0 | 1 | 2>(0); // 0=title, 1=context, 2=main
  const [narrativeChapter, setNarrativeChapter] = useState(0);
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  const isNarrative = introStep === 2 && narrativeChapter < NARRATIVE_CHAPTERS.length;
  const isFreeExplore = introStep === 2 && narrativeChapter >= NARRATIVE_CHAPTERS.length;

  const advanceIntro = useCallback(() => {
    if (introStep < 2) {
      setIntroStep((s) => (s + 1) as 0 | 1 | 2);
    } else if (narrativeChapter < NARRATIVE_CHAPTERS.length) {
      setNarrativeChapter((c) => c + 1);
    }
  }, [introStep, narrativeChapter]);

  const skipToExplore = () => {
    setIntroStep(2);
    setNarrativeChapter(NARRATIVE_CHAPTERS.length);
  };

  // Keyboard & scroll handlers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (introStep === 0 && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
        advanceIntro();
      } else if (introStep === 1 && (e.key === "Enter" || e.key === " ")) {
        advanceIntro();
      } else if (isNarrative && (e.key === "Enter" || e.key === "ArrowRight")) {
        advanceIntro();
      } else if (isFreeExplore && e.key === "Escape") {
        setSelectedCountry(null);
        setActiveRegion(null);
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (introStep === 0 && e.deltaY > 0) advanceIntro();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [introStep, advanceIntro, isNarrative, isFreeExplore]);

  const handleCountryClick = useCallback((country: CountryData) => {
    setSelectedCountry(country);
  }, []);

  const handleRegionClick = useCallback((region: Region) => {
    setActiveRegion((r) => (r === region ? null : region));
  }, []);

  const currentChapter = isNarrative ? NARRATIVE_CHAPTERS[narrativeChapter] : null;

  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "var(--forest-deep)" }}
    >
      {/* Forest canvas — always rendered */}
      <div className="absolute inset-0">
        <Forest
          highlightMetric={null}
          activeRegion={activeRegion}
          onCountryClick={isFreeExplore ? handleCountryClick : () => {}}
          chapterId={narrativeChapter}
          focusedCountryCode={currentChapter?.code}
        />
      </div>

      {/* ─── Screen 1: Title ────────────────────────────────────────────────── */}
      {introStep === 0 && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "rgba(4,10,7,0.88)", backdropFilter: "blur(2px)" }}
        >
          <div className="text-center px-8">
            {/* SDG badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-10"
              style={{
                background: "rgba(74, 222, 128, 0.08)",
                border: "1px solid rgba(74, 222, 128, 0.22)",
                color: "var(--tree-healthy)",
                fontFamily: "Space Mono, monospace",
                letterSpacing: "0.05em",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--tree-healthy)", boxShadow: "0 0 6px var(--tree-healthy)" }}
              />
              SDG 4 · Quality Education · Data Story
            </div>

            <h1
              className="font-black leading-none"
              style={{
                fontSize: "clamp(52px, 8vw, 90px)",
                color: "var(--text-primary)",
                fontFamily: "Playfair Display, serif",
              }}
            >
              The Silent
              <br />
              <em style={{ color: "var(--tree-healthy)", fontStyle: "italic" }}>Forest</em>
            </h1>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={advanceIntro}
            className="absolute bottom-10 flex flex-col items-center gap-2 opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-primary)" }}
          >
            <span className="text-xs" style={{ fontFamily: "Space Mono, monospace", letterSpacing: "0.12em" }}>
              SCROLL
            </span>
            <ChevronDown size={20} className="animate-bounce" />
          </button>
        </div>
      )}

      {/* ─── Screen 2: Context + CTA ───────────────────────────────────────── */}
      {introStep === 1 && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(4,10,7,0.72)", backdropFilter: "blur(1px)" }}
        >
          <div
            className="text-center max-w-lg px-10 py-12 rounded-3xl flex flex-col items-center gap-6"
            style={{
              background: "rgba(8, 16, 12, 0.82)",
              border: "1px solid rgba(74, 222, 128, 0.1)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Tree icon */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(74, 222, 128, 0.08)",
                border: "1px solid rgba(74, 222, 128, 0.2)",
              }}
            >
              <TreePine size={28} style={{ color: "var(--tree-healthy)" }} strokeWidth={1.5} />
            </div>

            <div>
              <p
                className="text-base leading-relaxed mb-3"
                style={{ color: "rgba(255,255,255,0.75)", fontWeight: 300 }}
              >
                Every tree is a country. Its trunk is how long children stay in school.
                Its canopy is how much they actually learn.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                250 million children are enrolled — but millions leave without basic skills.
                This is the story enrollment rates don't tell.
              </p>
            </div>

            <button
              onClick={advanceIntro}
              className="px-10 py-3.5 rounded-2xl text-sm font-semibold tracking-wide transition-all"
              style={{
                background: "var(--tree-healthy)",
                color: "var(--forest-deep)",
                boxShadow: "0 0 32px rgba(74, 222, 128, 0.28)",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Enter the Forest →
            </button>

            <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)", fontFamily: "Space Mono, monospace" }}>
              Data: World Bank HCI · UNESCO UIS · World Bank Learning Poverty
            </span>
          </div>
        </div>
      )}

      {/* ─── Narrative Chapters ───────────────────────────────────────────── */}
      {isNarrative && currentChapter && (
        <div className="absolute inset-0 z-40 flex items-center pointer-events-none">
          <div 
            className="ml-[10%] max-w-md p-10 rounded-3xl pointer-events-auto animate-in fade-in slide-in-from-left-8 duration-700"
            style={{ 
              background: "rgba(8, 16, 12, 0.85)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(16px)"
            }}
          >
            <div className="flex gap-1.5 mb-6">
              {NARRATIVE_CHAPTERS.map((_, i) => (
                <div 
                  key={i} 
                  className="h-1 rounded-full transition-all duration-500"
                  style={{ 
                    width: i === narrativeChapter ? 24 : 8,
                    background: i === narrativeChapter ? "var(--tree-healthy)" : "rgba(255,255,255,0.15)"
                  }}
                />
              ))}
            </div>
            
            <h2 
              className="text-3xl font-bold mb-4 leading-tight text-white"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {currentChapter.headline}
            </h2>
            <p className="text-lg text-white/60 mb-8 font-light leading-relaxed">
              {currentChapter.subtext}
            </p>

            <div className="flex items-center justify-between">
              <button
                onClick={advanceIntro}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:gap-3"
                style={{
                  background: "var(--tree-healthy)",
                  color: "var(--forest-deep)",
                }}
              >
                {narrativeChapter === NARRATIVE_CHAPTERS.length - 1 ? "Start Exploring" : "Next"} 
                <ArrowRight size={16} />
              </button>

              <button 
                onClick={skipToExplore}
                className="text-xs opacity-30 hover:opacity-100 transition-opacity"
                style={{ color: "white", fontFamily: "Space Mono, monospace" }}
              >
                Skip to explore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Explore UI ────────────────────────────────────────────────── */}
      {isFreeExplore && (
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
              onClick={() => {
                setIntroStep(1);
                setNarrativeChapter(0);
              }}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                color: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Restart
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

