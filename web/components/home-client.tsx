"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronDown, ScatterChart, Globe2, Trees, Filter, X, Calendar, CircleHelp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CountryData, Region, TimelineYear } from "@/lib/types";
import { TIMELINE_YEARS } from "@/lib/types";
import { REGION_COLORS, REGION_ABBR } from "@/lib/constants";
import { generateTimelineData, getDataForYear } from "@/lib/timeline";
import Forest from "./forest";
import CountryDetail from "./country-detail";
import ScatterView from "./scatter-view";
import WorldMap from "./world-map";
import TimelineSlider from "./timeline-slider";
import GuidedTour from "./guided-tour";
import { CanopyLogo, ForestGuideLine, GuideChoiceMenu, PromptedTourModal, WelcomeModal } from "./tour-ui";
import { getPageOnlyLabel, type ViewMode } from "./tour-config";
import { useGuidedTour } from "./use-guided-tour";

interface HomeClientProps {
  countries: CountryData[];
}

export default function HomeClient({ countries }: HomeClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("forest");
  const [showRegionFilter, setShowRegionFilter] = useState(false);
  const [showYearFilter, setShowYearFilter] = useState(false);
  const [selectedYear, setSelectedYear] = useState<TimelineYear>(2024);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
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

  const {
    activeTourStep,
    activeTourView,
    closeTourForView,
    currentTourSteps,
    dismissTransientTourUi,
    guideLine,
    handleTourNext,
    handleTourPrev,
    openTourForCurrentView,
    promptedTourView,
    renderedTourStep,
    showGuideChoice,
    showWelcomeModal,
    skipPromptedTour,
    startIntroGuide,
    startTour,
  } = useGuidedTour({
    containerRef,
    viewMode,
    activeRegion,
    selectedYear,
    selectedCountry,
  });

  useEffect(() => {
    const viewLabel =
      viewMode === "forest"
        ? "Forest"
        : viewMode === "scatter"
          ? "Scatterplot"
          : "Map";

    document.title = `The Forest — ${viewLabel}`;
  }, [viewMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCountry(null);
        setActiveRegion(null);
        setShowRegionFilter(false);
        setShowYearFilter(false);
        dismissTransientTourUi();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismissTransientTourUi]);

  useEffect(() => {
    if (!showRegionFilter && !showYearFilter && !showGuideChoice) return;
    const handleClick = () => {
      setShowRegionFilter(false);
      setShowYearFilter(false);
      dismissTransientTourUi();
    };
    const timer = setTimeout(() => {
      window.addEventListener("click", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClick);
    };
  }, [dismissTransientTourUi, showGuideChoice, showRegionFilter, showYearFilter]);

  const handleCountryClick = useCallback((country: CountryData) => {
    setSelectedCountry(country);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "#0a1612" }}
    >
      <div className="absolute inset-0 z-30">
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
                  countries={currentYearData}
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
                  countries={currentYearData}
                  highlightMetric={null}
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
                  countries={currentYearData}
                  activeRegion={activeRegion}
                  onCountryClick={handleCountryClick}
                />
              </motion.div>
            )}


            {/* Top Navigation Bar */}
            <div
              className="absolute top-0 left-0 right-0 z-40 flex flex-wrap items-center gap-2 px-3 py-3 pointer-events-auto sm:px-4 md:gap-4 md:px-6"
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
              <div className="flex w-full items-center gap-2 flex-shrink-0 sm:w-auto">
                <CanopyLogo size={28} />
                <span
                  className="text-sm font-medium tracking-wide"
                  style={{ color: "var(--text-primary)", fontFamily: "DM Sans, sans-serif" }}
                >
                  The Forest
                </span>
              </div>

              {/* View Mode Switcher */}
              <div
                data-tour="view-switcher"
                className="order-2 flex items-center h-9 rounded-xl md:ml-4"
                style={{
                  background: viewMode === "map" ? "transparent" : "rgba(255,255,255,0.05)",
                  border: viewMode === "map" ? "none" : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: viewMode === "map" ? "none" : undefined,
                }}
              >
                <button
                  onClick={() => setViewMode("forest")}
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-0 h-9 min-w-[2.25rem] text-[11px] transition-all sm:text-xs"
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
                  title="Forest View"
                >
                  <Trees size={16} />
                  <span className="hidden sm:inline">Forest</span>
                </button>
                <button
                  onClick={() => setViewMode("scatter")}
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-0 h-9 min-w-[2.25rem] text-[11px] transition-all sm:text-xs"
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
                  title="Scatter View"
                >
                  <ScatterChart size={16} />
                  <span className="hidden sm:inline">Scatter</span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-0 h-9 min-w-[2.25rem] text-[11px] transition-all sm:text-xs"
                  style={{
                    background: viewMode === "map" ? "rgba(74, 222, 128, 0.18)" : "transparent",
                    color: viewMode === "map" ? "var(--tree-healthy)" : "rgba(255,255,255,0.5)",
                    fontFamily: "Space Mono, monospace",
                  }}
                  title="Map View"
                >
                  <Globe2 size={16} />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>

              {/* Region Filter - only for Forest and Scatter */}
              {(viewMode === "forest" || viewMode === "scatter") && (
                <div data-tour="region-filter" className="relative order-3">
                  <button
                    onClick={() => setShowRegionFilter(!showRegionFilter)}
                    className="flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-[11px] transition-all sm:text-xs"
                    style={{
                      background: activeRegion ? `${REGION_COLORS[activeRegion]}20` : "rgba(255,255,255,0.05)",
                      border: activeRegion ? `1px solid ${REGION_COLORS[activeRegion]}50` : "1px solid rgba(255,255,255,0.1)",
                      color: activeRegion ? REGION_COLORS[activeRegion] : "rgba(255,255,255,0.5)",
                      fontFamily: "Space Mono, monospace",
                    }}
                    title={activeRegion || "All Regions"}
                  >
                    <Filter size={16} />
                    {activeRegion ? (
                      <>
                        <span className="hidden sm:inline">{REGION_ABBR[activeRegion]}</span>
                        <X
                          size={12}
                          className="hover:opacity-70"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRegion(null);
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">All Regions</span>
                        <ChevronDown size={14} />
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

              {/* Year Filter */}
              <div data-tour="year-filter" className="relative order-3">
                <button
                  onClick={() => setShowYearFilter(!showYearFilter)}
                  className="flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-[11px] transition-all sm:text-xs"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "var(--tree-healthy)",
                    fontFamily: "Space Mono, monospace",
                  }}
                  title={`Year: ${selectedYear}`}
                >
                  <Calendar size={16} />
                  <span>{selectedYear}</span>
                  <ChevronDown size={14} className="hidden sm:inline" />
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

              <div data-tour="guide-button" className="relative order-3">
                <button
                  onClick={(e) => { e.stopPropagation(); openTourForCurrentView(); }}
                  className="flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-[11px] transition-all sm:text-xs"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "Space Mono, monospace",
                  }}
                  title="Replay guided tour"
                >
                  <CircleHelp size={16} />
                  <span className="hidden sm:inline">Guide</span>
                </button>

                <div onClick={(e) => e.stopPropagation()}>
                  <GuideChoiceMenu
                    open={showGuideChoice}
                    viewMode={viewMode}
                    getPageOnlyLabel={getPageOnlyLabel}
                    onStartTour={startTour}
                  />
                </div>
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
              data-tour="timeline-slider"
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

            <GuidedTour
              open={activeTourView === viewMode && renderedTourStep !== null}
              step={renderedTourStep}
              stepIndex={activeTourStep}
              totalSteps={currentTourSteps.length}
              onNext={handleTourNext}
              onPrev={handleTourPrev}
              onSkip={() => {
                if (activeTourView) {
                  closeTourForView(activeTourView, true);
                }
              }}
              canGoBack={activeTourStep > 0}
              isLastStep={activeTourStep === currentTourSteps.length - 1}
            />
            <ForestGuideLine guideLine={activeTourView === "forest" ? guideLine : null} />
            <WelcomeModal open={showWelcomeModal} onStartIntroGuide={startIntroGuide} />
            <PromptedTourModal
              view={promptedTourView}
              getPageOnlyLabel={getPageOnlyLabel}
              onSkip={skipPromptedTour}
              onStartTour={startTour}
            />
      </div>
    </div>
  );
}
