"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ChevronDown, TreePine, ArrowRight, ScatterChart, Globe2, Trees, Filter, X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CountryData, Region, TimelineYear } from "@/lib/types";
import { TIMELINE_YEARS } from "@/lib/types";
import { REGION_COLORS, NARRATIVE_CHAPTERS } from "@/lib/constants";
import { generateTimelineData, getDataForYear } from "@/lib/timeline";
import Forest from "./forest";
import CountryDetail from "./country-detail";
import ScatterView from "./ScatterView";
import WorldMap from "./world-map";
import TimelineSlider from "./timeline-slider";

interface HomeClientProps {
  countries: CountryData[];
}

type ViewMode = "map" | "forest" | "scatter";
type GenderParityFilter = "all" | "girls-behind" | "near-parity" | "boys-behind";

export default function HomeClient({ countries }: HomeClientProps) {
  const [introStep, setIntroStep] = useState<0 | 1 | 2>(0);
  const [narrativeChapter, setNarrativeChapter] = useState(0);
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [highlightMetric, setHighlightMetric] = useState<string | null>(null);
  const [forestRevealDone, setForestRevealDone] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("forest");
  const [showRegionFilter, setShowRegionFilter] = useState(false);
  const [showGenderFilter, setShowGenderFilter] = useState(false);
  const [showYearFilter, setShowYearFilter] = useState(false);
  const [selectedYear, setSelectedYear] = useState<TimelineYear>(2024);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [genderFilter, setGenderFilter] = useState<GenderParityFilter>("all");

  const timelineData = useMemo(() => generateTimelineData(countries), [countries]);
  const currentYearData = useMemo(() => getDataForYear(timelineData, selectedYear), [timelineData, selectedYear]);

  useEffect(() => {
    if (!isTimelinePlaying) return;
    
    const interval = setInterval(() => {
      setSelectedYear((current) => {
        const currentIndex = TIMELINE_YEARS.indexOf(current);
        const nextIndex = (currentIndex + 1) % TIMELINE_YEARS.length;
        return TIMELINE_YEARS[nextIndex];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isTimelinePlaying]);

  const REGIONS: Region[] = [
    "Sub-Saharan Africa",
    "South Asia",
    "Middle East & North Africa",
    "Latin America & Caribbean",
    "East Asia & Pacific",
    "Europe & Central Asia",
    "North America",
  ];

  const GENDER_FILTER_OPTIONS: {
    id: GenderParityFilter;
    label: string;
    color: string;
    description: string;
  }[] = [
    {
      id: "all",
      label: "All Gender Profiles",
      color: "var(--tree-healthy)",
      description: "Show every country",
    },
    {
      id: "girls-behind",
      label: "Girls Behind",
      color: "#F97316",
      description: "Primary GPI below 0.95",
    },
    {
      id: "near-parity",
      label: "Near Parity",
      color: "#4ADE80",
      description: "Primary GPI between 0.95 and 1.05",
    },
    {
      id: "boys-behind",
      label: "Boys Behind",
      color: "#06B6D4",
      description: "Primary GPI above 1.05",
    },
  ];

  const matchesGenderFilter = useCallback((country: CountryData, filter: GenderParityFilter) => {
    if (filter === "all") return true;
    if (filter === "girls-behind") return country.gpiPrimary < 0.95;
    if (filter === "near-parity") return country.gpiPrimary >= 0.95 && country.gpiPrimary <= 1.05;
    return country.gpiPrimary > 1.05;
  }, []);

  const filteredYearData = useMemo(() => {
    return currentYearData.filter((country) => matchesGenderFilter(country, genderFilter));
  }, [currentYearData, genderFilter, matchesGenderFilter]);

  const activeGenderFilter = useMemo(
    () => GENDER_FILTER_OPTIONS.find((option) => option.id === genderFilter) ?? GENDER_FILTER_OPTIONS[0],
    [genderFilter]
  );

  const activeHighlightMetric = genderFilter === "all" ? highlightMetric : "gender";

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
        setGenderFilter("all");
        setHighlightMetric(null);
        setShowRegionFilter(false);
        setShowGenderFilter(false);
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

  useEffect(() => {
    if (!showRegionFilter && !showGenderFilter && !showYearFilter) return;
    const handleClick = () => {
      setShowRegionFilter(false);
      setShowGenderFilter(false);
      setShowYearFilter(false);
    };
    const timer = setTimeout(() => {
      window.addEventListener("click", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClick);
    };
  }, [showRegionFilter, showGenderFilter, showYearFilter]);

  useEffect(() => {
    if (!selectedCountry) return;
    const countryStillVisible = filteredYearData.some((country) => country.code === selectedCountry.code);
    if (!countryStillVisible) {
      setSelectedCountry(null);
    }
  }, [filteredYearData, selectedCountry]);

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
      style={{ background: "#0a1612" }}
    >
      {/* Forest background only shown during intro/narrative */}
      {introStep < 2 || isNarrative ? (
        <div className="absolute inset-0">
          <Forest
            countries={countries}
            highlightMetric={activeHighlightMetric}
            activeRegion={activeRegion}
            onCountryClick={() => {}}
            chapterId={narrativeChapter}
            focusedCountryCode={forestRevealDone ? (currentChapter?.code ?? undefined) : undefined}
          />
        </div>
      ) : null}

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

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1.0 }}
                className="mt-5 text-sm"
                style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Space Mono, monospace", lineHeight: 1.8 }}
              >
                Compare education outcomes across countries, regions, and years.
                <br />
                See where time in school becomes learning, and where it does not.
              </motion.p>
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
              className="max-w-2xl px-10 py-12 rounded-3xl flex flex-col gap-6"
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

              <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-start">
                <div>
                  <div
                    className="text-[10px] mb-3"
                    style={{
                      color: "var(--tree-healthy)",
                      fontFamily: "Space Mono, monospace",
                      letterSpacing: "0.12em",
                    }}
                  >
                    MAIN MESSAGE
                  </div>
                  <div className="mb-3">
                    <div
                      className="font-black leading-none mb-1"
                      style={{ fontSize: 52, color: "var(--tree-healthy)", fontFamily: "Space Mono, monospace" }}
                    >
                      Three views
                    </div>
                    <div className="text-sm font-light" style={{ color: "rgba(255,255,255,0.65)" }}>
                      one question: how much learning do school years actually produce?
                    </div>
                  </div>
                  <div
                    className="text-xs mb-4 pb-3"
                    style={{ color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    The current experience is built to compare countries across a forest view, a scatter view, and a world map, while also letting you move through time.
                  </div>
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: "rgba(255,255,255,0.7)", fontWeight: 300 }}
                  >
                    The main message stays the same: years spent in school and years of actual learning are not the same thing. This interface helps you inspect that gap from multiple angles instead of relying on a single headline number.
                  </p>

                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      className="text-[10px] mb-2"
                      style={{
                        color: "rgba(255,255,255,0.45)",
                        fontFamily: "Space Mono, monospace",
                        letterSpacing: "0.12em",
                      }}
                    >
                      WHAT EACH VIEW DOES
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>
                      In the
                      <span style={{ color: "var(--text-primary)" }}> forest </span>
                      each tree represents a country, comparing time in school with learning gained. In the
                      <span style={{ color: "var(--tree-healthy)" }}> scatter view </span>
                      each dot shows efficiency more directly. In the
                      <span style={{ color: "rgba(255,255,255,0.85)" }}> map </span>
                      you can locate patterns geographically.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgba(74, 222, 128, 0.05)",
                      border: "1px solid rgba(74, 222, 128, 0.14)",
                    }}
                  >
                    <div
                      className="text-[10px] mb-3"
                      style={{
                        color: "var(--tree-healthy)",
                        fontFamily: "Space Mono, monospace",
                        letterSpacing: "0.12em",
                      }}
                    >
                      SOP
                    </div>
                    <div className="space-y-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.68)" }}>
                      <p>1. Start with the guided story or skip straight to exploration.</p>
                      <p>2. Switch between forest, scatter, and map depending on the comparison you want to make.</p>
                      <p>3. Use the region filter and the year controls to narrow the dataset.</p>
                      <p>4. Click any country to open its details and compare the metrics more closely.</p>
                    </div>
                  </div>

                  <div className="flex justify-around items-end gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <svg width="52" height="80" viewBox="0 0 52 80">
                        <circle cx="26" cy="38" r="10" fill="#EF4444" opacity="0.7" />
                        <rect x="23" y="46" width="6" height="28" rx="2" fill="rgba(255,255,255,0.25)" />
                      </svg>
                      <span className="text-[10px] text-center leading-tight" style={{ color: "#EF4444", fontFamily: "Space Mono, monospace" }}>
                        Niger
                        <br />
                        2 yrs learning
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <svg width="52" height="80" viewBox="0 0 52 80">
                        <circle cx="26" cy="20" r="18" fill="var(--tree-healthy)" opacity="0.75" />
                        <rect x="23" y="36" width="6" height="38" rx="2" fill="rgba(255,255,255,0.25)" />
                      </svg>
                      <span className="text-[10px] text-center leading-tight" style={{ color: "var(--tree-healthy)", fontFamily: "Space Mono, monospace" }}>
                        Finland
                        <br />
                        13 yrs learning
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-center" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Mono, monospace" }}>
                    Forest = structure · Scatter = efficiency · Map = geography
                  </p>
                </div>
              </div>

              <p
                className="text-[10px]"
                style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Mono, monospace" }}
              >
                Sources: UNESCO UIS 2023 · World Bank HCI 2024
              </p>

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
                Start guided walkthrough →
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
            className="absolute inset-0 z-30"
          >
            {/* World Map View - Full Screen Bright */}
            {viewMode === "map" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
                style={{ background: "#0a1612" }}
              >
                <WorldMap
                  countries={filteredYearData}
                  highlightedRegion={activeRegion}
                  onRegionHover={() => {}}
                  onCountryHover={() => {}}
                  onCountryClick={handleCountryClick}
                />
              </motion.div>
            )}

            {/* Forest View */}
            {viewMode === "forest" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pt-28 pb-28 md:pt-14"
              >
                <Forest
                  countries={filteredYearData}
                  highlightMetric={activeHighlightMetric}
                  activeRegion={activeRegion}
                  onCountryClick={handleCountryClick}
                  chapterId={-1}
                  focusedCountryCode={undefined}
                />
              </motion.div>
            )}

            {/* Scatter View */}
            {viewMode === "scatter" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 px-3 pt-32 pb-28 sm:px-4 md:px-12 md:pt-24"
                style={{ background: "#0a1612" }}
              >
                <ScatterView
                  countries={filteredYearData}
                  activeRegion={activeRegion}
                  onCountryClick={handleCountryClick}
                />
              </motion.div>
            )}


            {/* Top Navigation Bar */}
            <div
              className="absolute top-0 left-0 right-0 z-40 flex flex-wrap items-start gap-2 px-3 py-3 pointer-events-auto sm:px-4 md:items-center md:gap-4 md:px-6"
              style={{
                background:
                  viewMode === "map"
                    ? "linear-gradient(to bottom, rgba(6, 16, 12, 0.32), rgba(6, 16, 12, 0.14))"
                    : "rgba(10,22,18,0.4)",
                backdropFilter: viewMode === "map" ? "blur(14px) saturate(130%)" : "blur(12px)",
                WebkitBackdropFilter: viewMode === "map" ? "blur(14px) saturate(130%)" : "blur(12px)",
                borderBottom:
                  viewMode === "map"
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(74, 222, 128, 0.1)",
                boxShadow:
                  viewMode === "map"
                    ? "0 8px 30px rgba(0, 0, 0, 0.18)"
                    : "none",
              }}
            >
              {/* Logo */}
              <div className="flex w-full items-center gap-3 flex-shrink-0 sm:w-auto">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--tree-healthy)", boxShadow: "0 0 8px var(--tree-healthy)" }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--text-primary)", fontFamily: "Playfair Display, serif" }}
                >
                  The Forest
                </span>
              </div>

              {/* View Mode Switcher */}
              <div
                className="order-2 flex items-center gap-1 rounded-xl p-1 md:ml-4"
                style={{
                  background: viewMode === "map" ? "transparent" : "rgba(255,255,255,0.05)",
                  border: viewMode === "map" ? "none" : "1px solid rgba(255,255,255,0.04)",
                  boxShadow: viewMode === "map" ? "none" : undefined,
                }}
              >
                <button
                  onClick={() => setViewMode("forest")}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] transition-all sm:px-3 sm:text-xs"
                  style={{
                    background:
                      viewMode === "forest"
                        ? "rgba(74, 222, 128, 0.15)"
                        : viewMode === "map"
                          ? "rgba(4, 10, 7, 0.18)"
                          : "transparent",
                    color: viewMode === "forest" ? "var(--tree-healthy)" : "rgba(255,255,255,0.5)",
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  <Trees size={14} />
                  Forest
                </button>
                <button
                  onClick={() => setViewMode("scatter")}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] transition-all sm:px-3 sm:text-xs"
                  style={{
                    background:
                      viewMode === "scatter"
                        ? "rgba(74, 222, 128, 0.15)"
                        : viewMode === "map"
                          ? "rgba(4, 10, 7, 0.18)"
                          : "transparent",
                    color: viewMode === "scatter" ? "var(--tree-healthy)" : "rgba(255,255,255,0.5)",
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  <ScatterChart size={14} />
                  Scatter
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] transition-all sm:px-3 sm:text-xs"
                  style={{
                    background: viewMode === "map" ? "rgba(74, 222, 128, 0.18)" : "transparent",
                    color: viewMode === "map" ? "var(--tree-healthy)" : "rgba(255,255,255,0.5)",
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  <Globe2 size={14} />
                  Map
                </button>
              </div>

              {/* Region Filter - only for Forest and Scatter */}
              {(viewMode === "forest" || viewMode === "scatter") && (
                <div className="relative order-3">
                  <button
                    onClick={() => setShowRegionFilter(!showRegionFilter)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] transition-all sm:px-3 sm:text-xs"
                    style={{
                      background: activeRegion ? `${REGION_COLORS[activeRegion]}20` : "rgba(255,255,255,0.05)",
                      border: activeRegion ? `1px solid ${REGION_COLORS[activeRegion]}50` : "1px solid rgba(255,255,255,0.1)",
                      color: activeRegion ? REGION_COLORS[activeRegion] : "rgba(255,255,255,0.5)",
                      fontFamily: "Space Mono, monospace",
                    }}
                  >
                    <Filter size={14} />
                    {activeRegion ? (
                      <>
                        {activeRegion.length > 15 ? activeRegion.slice(0, 13) + "…" : activeRegion}
                        <X
                          size={12}
                          className="ml-1 hover:opacity-70"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRegion(null);
                          }}
                        />
                      </>
                    ) : (
                      <>
                        All Regions
                        <ChevronDown size={12} />
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {showRegionFilter && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 z-50 mt-2 rounded-xl p-2"
                        style={{
                          background: "rgba(10, 22, 18, 0.95)",
                          border: "1px solid rgba(74, 222, 128, 0.2)",
                          backdropFilter: "blur(12px)",
                          minWidth: "200px",
                          maxWidth: "min(280px, calc(100vw - 24px))",
                        }}
                      >
                        <button
                          onClick={() => {
                            setActiveRegion(null);
                            setShowRegionFilter(false);
                          }}
                          className="w-full text-left text-xs px-3 py-2 rounded-lg transition-all hover:bg-white/5"
                          style={{
                            color: !activeRegion ? "var(--tree-healthy)" : "rgba(255,255,255,0.6)",
                            fontFamily: "Space Mono, monospace",
                            background: !activeRegion ? "rgba(74, 222, 128, 0.1)" : "transparent",
                          }}
                        >
                          All Regions
                        </button>
                        {REGIONS.map((region) => (
                          <button
                            key={region}
                            onClick={() => {
                              setActiveRegion(region);
                              setShowRegionFilter(false);
                            }}
                            className="w-full text-left text-xs px-3 py-2 rounded-lg transition-all hover:bg-white/5 flex items-center gap-2"
                            style={{
                              color: activeRegion === region ? REGION_COLORS[region] : "rgba(255,255,255,0.6)",
                              fontFamily: "Space Mono, monospace",
                              background: activeRegion === region ? `${REGION_COLORS[region]}15` : "transparent",
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: REGION_COLORS[region] }}
                            />
                            {region}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="relative order-3">
                <button
                  onClick={() => setShowGenderFilter(!showGenderFilter)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] transition-all sm:px-3 sm:text-xs"
                  style={{
                    background:
                      genderFilter !== "all"
                        ? `${activeGenderFilter.color}20`
                        : "rgba(255,255,255,0.05)",
                    border:
                      genderFilter !== "all"
                        ? `1px solid ${activeGenderFilter.color}50`
                        : "1px solid rgba(255,255,255,0.1)",
                    color:
                      genderFilter !== "all"
                        ? activeGenderFilter.color
                        : "rgba(255,255,255,0.5)",
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  <Filter size={14} />
                  {genderFilter !== "all" ? (
                    <>
                      {activeGenderFilter.label}
                      <X
                        size={12}
                        className="ml-1 hover:opacity-70"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGenderFilter("all");
                        }}
                      />
                    </>
                  ) : (
                    <>
                      Gender
                      <ChevronDown size={12} />
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {showGenderFilter && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 z-50 mt-2 rounded-xl p-2"
                      style={{
                        background: "rgba(10, 22, 18, 0.95)",
                        border: "1px solid rgba(74, 222, 128, 0.2)",
                        backdropFilter: "blur(12px)",
                        minWidth: "240px",
                        maxWidth: "min(300px, calc(100vw - 24px))",
                      }}
                    >
                      {GENDER_FILTER_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setGenderFilter(option.id);
                            setShowGenderFilter(false);
                          }}
                          className="w-full text-left text-xs px-3 py-2 rounded-lg transition-all hover:bg-white/5 flex items-start gap-2"
                          style={{
                            color: genderFilter === option.id ? option.color : "rgba(255,255,255,0.7)",
                            fontFamily: "Space Mono, monospace",
                            background: genderFilter === option.id ? `${option.color}15` : "transparent",
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full mt-1 shrink-0"
                            style={{ background: option.color }}
                          />
                          <div>
                            <div>{option.label}</div>
                            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>
                              {option.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Year Filter */}
              <div className="relative order-3">
                <button
                  onClick={() => setShowYearFilter(!showYearFilter)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] transition-all sm:px-3 sm:text-xs"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "var(--tree-healthy)",
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  <Calendar size={14} />
                  {selectedYear}
                  <ChevronDown size={12} />
                </button>

                <AnimatePresence>
                  {showYearFilter && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 z-50 mt-2 max-h-[300px] overflow-y-auto rounded-xl p-2"
                      style={{
                        background: "rgba(10, 22, 18, 0.95)",
                        border: "1px solid rgba(74, 222, 128, 0.2)",
                        backdropFilter: "blur(12px)",
                        minWidth: "100px",
                        maxWidth: "min(180px, calc(100vw - 24px))",
                      }}
                    >
                      {[...TIMELINE_YEARS].reverse().map((year) => (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYear(year);
                            setShowYearFilter(false);
                          }}
                          className="w-full text-left text-xs px-3 py-2 rounded-lg transition-all hover:bg-white/5"
                          style={{
                            color: selectedYear === year ? "var(--tree-healthy)" : "rgba(255,255,255,0.6)",
                            fontFamily: "Space Mono, monospace",
                            background: selectedYear === year ? "rgba(74, 222, 128, 0.15)" : "transparent",
                            fontWeight: selectedYear === year ? 600 : 400,
                          }}
                        >
                          {year}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Spacer */}
              <div className="hidden flex-1 lg:block" />

            </div>

            {/* Country Detail Panel */}
            <AnimatePresence>
              {selectedCountry && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                  <div className="pointer-events-auto h-full w-full">
                    <CountryDetail
                      country={selectedCountry}
                      onClose={() => setSelectedCountry(null)}
                    />
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Timeline Slider */}
            <div
              className="absolute bottom-0 left-0 right-0 z-40 px-3 py-3 pointer-events-auto sm:px-4 md:px-6 md:py-4"
              style={{
                background: viewMode === "map" ? "transparent" : "rgba(10,22,18,0.6)",
                backdropFilter: viewMode === "map" ? "none" : "blur(12px)",
                WebkitBackdropFilter: viewMode === "map" ? "none" : "blur(12px)",
                borderTop: viewMode === "map" ? "none" : "1px solid rgba(74, 222, 128, 0.1)",
              }}
            >
              <TimelineSlider
                year={selectedYear}
                onChange={setSelectedYear}
                isPlaying={isTimelinePlaying}
                onPlayPause={() => setIsTimelinePlaying(!isTimelinePlaying)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
