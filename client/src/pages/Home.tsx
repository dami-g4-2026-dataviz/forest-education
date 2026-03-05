import { useState, useCallback, useEffect } from "react";
import { countries, CountryData, Region, REGION_COLORS } from "@/lib/educationData";
import Forest from "@/components/Forest";
import CountryDetail from "@/components/CountryDetail";
import Legend from "@/components/Legend";
import { ChevronDown, TreePine, ArrowRight, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NARRATIVE_CHAPTERS = [
  {
    code: "NER",
    headline: "5 years in school. 2 years of learning.",
    subtext: "92% of 10-year-olds in Niger cannot read a simple sentence. The trunk is tall, but the canopy is bare.",
  },
  {
    code: "IND",
    headline: "High enrollment hides a learning crisis.",
    subtext: "Since 1970, enrollment has doubled. But in South Asia, half of school time translates to zero learning.",
  },
  {
    code: "VNM",
    headline: "The Efficiency Exception.",
    subtext: "In Vietnam, 12.9 years of school result in 10.2 years of real learning. A dense canopy shows what quality looks like.",
  },
  {
    code: "SGP",
    headline: "A childhood apart.",
    subtext: "The gap between the best and worst education systems is 10 years of real learning — a full childhood lost.",
  },
];

export default function Home() {
  const [introStep, setIntroStep] = useState<0 | 1 | 2>(0); // 0=title, 1=context, 2=main
  const [narrativeChapter, setNarrativeChapter] = useState(0);
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [highlightMetric, setHighlightMetric] = useState<string | null>(null);

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
        setHighlightMetric(null);
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

  const handleRegionClick = useCallback((region: Region | null) => {
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
          highlightMetric={highlightMetric}
          activeRegion={activeRegion}
          onCountryClick={isFreeExplore ? handleCountryClick : () => {}}
          chapterId={narrativeChapter}
          focusedCountryCode={currentChapter?.code}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Screen 1: Title ────────────────────────────────────────────────── */}
        {introStep === 0 && (
          <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: "rgba(4,10,7,0.88)", backdropFilter: "blur(2px)" }}
          >
            <div className="text-center px-8">
              {/* SDG badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
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
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 1.2 }}
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
              </motion.h1>
            </div>

            {/* Scroll indicator */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              whileHover={{ opacity: 0.7 }}
              onClick={advanceIntro}
              className="absolute bottom-10 flex flex-col items-center gap-2 transition-opacity"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="text-xs" style={{ fontFamily: "Space Mono, monospace", letterSpacing: "0.12em" }}>
                SCROLL
              </span>
              <ChevronDown size={20} className="animate-bounce" />
            </motion.button>
          </motion.div>
        )}

        {/* ─── Screen 2: Context + CTA ───────────────────────────────────────── */}
        {introStep === 1 && (
          <motion.div
            key="context"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
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
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(74, 222, 128, 0.08)",
                  border: "1px solid rgba(74, 222, 128, 0.2)",
                }}
              >
                <TreePine size={28} style={{ color: "var(--tree-healthy)" }} strokeWidth={1.5} />
              </motion.div>

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

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(74, 222, 128, 0.4)" }}
                whileTap={{ scale: 0.98 }}
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
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── Narrative Chapters ───────────────────────────────────────────── */}
        {isNarrative && currentChapter && (
          <motion.div
            key={`narrative-${narrativeChapter}`}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 z-40 flex items-center pointer-events-none"
          >
            <div
              className="ml-[10%] max-w-md p-10 rounded-3xl pointer-events-auto shadow-2xl"
              style={{
                background: "rgba(8, 16, 12, 0.85)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="flex gap-1.5 mb-6">
                {NARRATIVE_CHAPTERS.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      width: i === narrativeChapter ? 24 : 8,
                      background: i === narrativeChapter ? "var(--tree-healthy)" : "rgba(255,255,255,0.15)"
                    }}
                    className="h-1 rounded-full"
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
                <motion.button
                  whileHover={{ gap: "12px" }}
                  onClick={advanceIntro}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "var(--tree-healthy)",
                    color: "var(--forest-deep)",
                  }}
                >
                  {narrativeChapter === NARRATIVE_CHAPTERS.length - 1 ? "Start Exploring" : "Next"}
                  <ArrowRight size={16} />
                </motion.button>

                <button
                  onClick={skipToExplore}
                  className="text-xs opacity-30 hover:opacity-100 transition-opacity"
                  style={{ color: "white", fontFamily: "Space Mono, monospace" }}
                >
                  Skip to explore
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Main Explore UI ────────────────────────────────────────────────── */}
        {isFreeExplore && (
          <motion.div
            key="explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-30 pointer-events-none"
          >
            {/* Global Message Overlay - Visible in Explore Mode */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none px-4 w-full max-w-2xl">
              <div 
                className="px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/10"
                style={{ background: "rgba(8, 16, 12, 0.6)" }}
              >
                <h2 className="text-sm md:text-base font-medium text-white/90 mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
                  "The world has solved the problem of enrollment, but it is failing the problem of learning."
                </h2>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]" style={{ fontFamily: "Space Mono, monospace" }}>
                  The Silent Forest · SDG 4.1.1
                </p>
              </div>
            </div>

            {/* Header bar */}
            <div
              className="absolute top-0 left-0 right-0 z-30 flex items-center gap-4 px-6 py-3 pointer-events-auto"
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

              {/* Highlight toggle */}
              <button
                onClick={() => setHighlightMetric(highlightMetric ? null : "learningPoverty")}
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: highlightMetric ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${highlightMetric ? "#EF4444" : "rgba(255,255,255,0.08)"}`,
                  color: highlightMetric ? "#EF4444" : "rgba(255,255,255,0.45)",
                }}
              >
                <Settings2 size={14} />
                Highlight Poverty
              </button>

              {/* Restart button */}
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
                Replay Intro
              </button>
            </div>

            {/* Legend - positioned top left, below header */}
            <div className="absolute top-20 left-6 z-30 pointer-events-auto">
              <Legend 
                activeRegion={activeRegion}
                onRegionClick={handleRegionClick}
                highlightMetric={highlightMetric}
              />
            </div>

            {/* Country detail modal wrapper */}
            <div className="absolute inset-0 pointer-events-none">
              {selectedCountry && (
                <div className="pointer-events-auto h-full w-full">
                  <CountryDetail
                    country={selectedCountry}
                    onClose={() => setSelectedCountry(null)}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
