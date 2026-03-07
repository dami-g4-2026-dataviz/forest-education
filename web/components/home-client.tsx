"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronDown, TreePine, ArrowRight, Settings2, ScatterChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CountryData, Region } from "@/lib/types";
import { NARRATIVE_CHAPTERS } from "@/lib/constants";
import Forest from "./forest";
import CountryDetail from "./country-detail";
import Legend from "./legend";
import ScatterView from "./ScatterView";

interface HomeClientProps {
  countries: CountryData[];
}

export default function HomeClient({ countries }: HomeClientProps) {
  const [introStep, setIntroStep] = useState<0 | 1 | 2>(0);
  const [narrativeChapter, setNarrativeChapter] = useState(0);
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [highlightMetric, setHighlightMetric] = useState<string | null>(null);
  const [forestRevealDone, setForestRevealDone] = useState(false);
  const [showScatter, setShowScatter] = useState(false);

  const isNarrative = introStep === 2 && narrativeChapter < NARRATIVE_CHAPTERS.length;
  const isFreeExplore = introStep === 2 && narrativeChapter >= NARRATIVE_CHAPTERS.length;

  const advanceIntro = useCallback(() => {
    if (introStep < 2) {
      setIntroStep((s) => (s + 1) as 0 | 1 | 2);
      if (introStep === 1) setForestRevealDone(false);
    } else if (narrativeChapter < NARRATIVE_CHAPTERS.length) {
      setNarrativeChapter((c) => c + 1);
    }
  }, [introStep, narrativeChapter]);

  const skipToExplore = () => {
    setIntroStep(2);
    setNarrativeChapter(NARRATIVE_CHAPTERS.length);
  };

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

  useEffect(() => {
    if (introStep === 2) setForestRevealDone(true);
  }, [introStep]);

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
      <div className="absolute inset-0">
        <Forest
          countries={countries}
          highlightMetric={highlightMetric}
          activeRegion={activeRegion}
          onCountryClick={isFreeExplore ? handleCountryClick : () => {}}
          chapterId={isFreeExplore ? -1 : narrativeChapter}
          focusedCountryCode={forestRevealDone ? (currentChapter?.code ?? undefined) : undefined}
        />
      </div>

      <AnimatePresence mode="wait">
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
                The Learning
                <br />
                <em style={{ color: "var(--tree-healthy)", fontStyle: "italic" }}>Forest</em>
              </motion.h1>

            </div>

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
                {/* Big stat callout */}
                <div className="mb-3">
                  <div
                    className="font-black leading-none mb-1"
                    style={{ fontSize: 52, color: "var(--tree-healthy)", fontFamily: "Space Mono, monospace" }}
                  >
                    1 in 2
                  </div>
                  <div className="text-sm font-light" style={{ color: "rgba(255,255,255,0.65)" }}>
                    children can&rsquo;t read a simple text by age 10
                  </div>
                </div>
                <div
                  className="text-xs mb-4 pb-3"
                  style={{ color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  That&rsquo;s 250M children enrolled, but not learning.
                </div>
                {/* Example trees: Niger vs Finland */}
                <div className="flex justify-around items-end mb-2 gap-4">
                  {/* Niger */}
                  <div className="flex flex-col items-center gap-1">
                    <svg width="52" height="80" viewBox="0 0 52 80">
                      {/* canopy */}
                      <circle cx="26" cy="38" r="10" fill="#EF4444" opacity="0.7" />
                      {/* trunk */}
                      <rect x="23" y="46" width="6" height="28" rx="2" fill="rgba(255,255,255,0.25)" />
                    </svg>
                    <span className="text-[10px] text-center leading-tight" style={{ color: "#EF4444", fontFamily: "Space Mono, monospace" }}>Niger<br/>2 yrs learning</span>
                  </div>
                  {/* Finland */}
                  <div className="flex flex-col items-center gap-1">
                    <svg width="52" height="80" viewBox="0 0 52 80">
                      {/* canopy */}
                      <circle cx="26" cy="20" r="18" fill="var(--tree-healthy)" opacity="0.75" />
                      {/* trunk */}
                      <rect x="23" y="36" width="6" height="38" rx="2" fill="rgba(255,255,255,0.25)" />
                    </svg>
                    <span className="text-[10px] text-center leading-tight" style={{ color: "var(--tree-healthy)", fontFamily: "Space Mono, monospace" }}>Finland<br/>13 yrs learning</span>
                  </div>
                </div>
                <p className="text-[10px] mb-4 text-center" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Mono, monospace" }}>
                  Trunk = years enrolled · Canopy = years actually learned
                </p>

                <p
                  className="text-[10px]"
                  style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Mono, monospace" }}
                >
                  Sources: UNESCO UIS 2023 · World Bank HCI 2024
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

              {currentChapter.region && (
                <div
                  className="text-[10px] mb-3"
                  style={{ color: currentChapter.regionColor ?? undefined, fontFamily: "Space Mono, monospace", letterSpacing: "0.1em" }}
                >
                  {currentChapter.region.toUpperCase()}
                </div>
              )}

              <h2
                className="text-3xl font-bold mb-4 leading-tight text-white"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                {currentChapter.headline}
              </h2>
              <p className="text-lg text-white/60 mb-3 font-light leading-relaxed">
                {currentChapter.subtext}
              </p>

              <div
                className="text-[10px] mb-8 pt-2"
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontFamily: "Space Mono, monospace",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                ↳ "Years of learning" = Learning-Adjusted Years of Schooling (LAYS) · World Bank HCI 2024
              </div>

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

                {narrativeChapter >= 1 && (
                  <button
                    onClick={skipToExplore}
                    className="text-xs opacity-30 hover:opacity-100 transition-opacity"
                    style={{ color: "white", fontFamily: "Space Mono, monospace" }}
                  >
                    Skip to explore
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {isFreeExplore && (
          <motion.div
            key="explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-30 pointer-events-none"
          >
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none px-4 w-max max-w-full">
              <div
                className="px-6 py-3 rounded-2xl backdrop-blur-xl border border-white/10"
                style={{ background: "rgba(8, 16, 12, 0.6)" }}
              >
                <h2 className="text-sm md:text-base font-medium text-white/90 mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
                  The world has largely solved enrollment. It hasn&rsquo;t solved learning.
                </h2>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]" style={{ fontFamily: "Space Mono, monospace" }}>
                  The Learning Forest · SDG 4
                </p>
              </div>
            </div>

            <div
              className="absolute top-0 left-0 right-0 z-30 flex items-center gap-4 px-6 py-3 pointer-events-auto"
              style={{
                background: "linear-gradient(to bottom, rgba(6,12,9,0.92) 0%, transparent 100%)",
              }}
            >
              <div className="flex items-center gap-3 flex-shrink-0">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--tree-healthy)", boxShadow: "0 0 8px var(--tree-healthy)" }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--text-primary)", fontFamily: "Playfair Display, serif" }}
                >
                  The Learning Forest
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

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowScatter((s) => !s)}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: showScatter ? "rgba(74, 222, 128, 0.12)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${showScatter ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: showScatter ? "var(--tree-healthy)" : "rgba(255,255,255,0.45)",
                  }}
                >
                  <ScatterChart size={14} />
                  Scatter View
                </button>

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
            </div>

            <div className="absolute top-20 left-6 z-30 pointer-events-auto">
              <Legend
                activeRegion={activeRegion}
                onRegionClick={handleRegionClick}
                highlightMetric={highlightMetric}
              />
            </div>

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

            {/* Scatter plot overlay */}
            <AnimatePresence>
              {showScatter && (
                <motion.div
                  key="scatter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto"
                  style={{ backdropFilter: "blur(8px)", background: "rgba(4,10,7,0.7)" }}
                  onClick={() => setShowScatter(false)}
                >
                  <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="rounded-3xl p-6"
                    style={{
                      background: "rgba(8,16,12,0.95)",
                      border: "1px solid rgba(74,222,128,0.12)",
                      width: "calc(100vw - 48px)",
                      height: "calc(100vh - 48px)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-2 px-2">
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Mono, monospace" }}>
                        Enrollment vs. Learning · all countries
                      </span>
                      <button
                        onClick={() => setShowScatter(false)}
                        className="text-xs opacity-40 hover:opacity-100 transition-opacity"
                        style={{ color: "white", fontFamily: "Space Mono, monospace" }}
                      >
                        ✕
                      </button>
                    </div>
                    <ScatterView countries={countries} activeRegion={activeRegion} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer bar — sources + credit */}
            <div
              className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-2 pointer-events-auto group"
              style={{
                background: "linear-gradient(to top, rgba(4,10,7,0.7) 0%, transparent 100%)",
                opacity: 0.25,
                transition: "opacity 0.35s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.25")}
            >
              <div className="flex items-center gap-5">
                <a
                  href="https://sdgs.un.org/goals/goal4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] uppercase tracking-widest hover:text-white transition-colors"
                  style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Space Mono, monospace" }}
                >
                  SDG 4.1 ↗
                </a>
                <a
                  href="https://www.worldbank.org/en/publication/human-capital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] uppercase tracking-widest hover:text-white transition-colors"
                  style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Space Mono, monospace" }}
                >
                  World Bank HCI ↗
                </a>
                <a
                  href="https://uis.unesco.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] uppercase tracking-widest hover:text-white transition-colors"
                  style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Space Mono, monospace" }}
                >
                  UNESCO UIS ↗
                </a>
              </div>
              <span
                className="text-[9px] uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Mono, monospace" }}
              >
                The Learning Forest · Data as of 2024
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
