"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type RefObject } from "react";
import type { CountryData, Region, TimelineYear } from "@/lib/types";
import type { GuidedTourStep } from "./guided-tour";
import {
  TOUR_STORAGE_KEY,
  getTourSteps,
  type CompletedTours,
  type TourMode,
  type ViewMode,
} from "./tour-config";

interface UseGuidedTourArgs {
  containerRef: RefObject<HTMLDivElement | null>;
  viewMode: ViewMode;
  activeRegion: Region | null;
  selectedYear: TimelineYear;
  selectedCountry: CountryData | null;
}

export function useGuidedTour({
  containerRef,
  viewMode,
  activeRegion,
  selectedYear,
  selectedCountry,
}: UseGuidedTourArgs) {
  const [tourReady, setTourReady] = useState(false);
  const [completedTours, setCompletedTours] = useState<CompletedTours>({});
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeHandled, setWelcomeHandled] = useState(false);
  const [activeTourView, setActiveTourView] = useState<ViewMode | null>(null);
  const [promptedTourView, setPromptedTourView] = useState<ViewMode | null>(null);
  const [activeTourStep, setActiveTourStep] = useState(0);
  const [measuredTargetStyle, setMeasuredTargetStyle] = useState<CSSProperties | null>(null);
  const [measuredCardStyle, setMeasuredCardStyle] = useState<CSSProperties | null>(null);
  const [guideLine, setGuideLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [showGuideChoice, setShowGuideChoice] = useState(false);
  const [tourMode, setTourMode] = useState<TourMode>("full");

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(TOUR_STORAGE_KEY);
      if (raw) {
        setCompletedTours(JSON.parse(raw) as CompletedTours);
      }
    } catch {
      // Ignore invalid stored tour state and continue with first-run defaults.
    } finally {
      setTourReady(true);
    }
  }, []);

  const persistCompletedTours = useCallback((next: CompletedTours) => {
    setCompletedTours(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  useEffect(() => {
    if (!tourReady || selectedCountry || welcomeHandled) return;

    const timer = window.setTimeout(() => {
      setShowWelcomeModal(true);
      setWelcomeHandled(true);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [selectedCountry, tourReady, welcomeHandled]);

  useEffect(() => {
    if (!tourReady || selectedCountry || showWelcomeModal || !welcomeHandled) return;
    if (completedTours[viewMode]) return;
    if (activeTourView || promptedTourView) return;
    if (viewMode === "forest") return;

    const timer = window.setTimeout(() => {
      setPromptedTourView(viewMode);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [
    activeTourView,
    completedTours,
    promptedTourView,
    selectedCountry,
    showWelcomeModal,
    tourReady,
    viewMode,
    welcomeHandled,
  ]);

  useEffect(() => {
    if (activeTourView && activeTourView !== viewMode) {
      setActiveTourView(null);
      setActiveTourStep(0);
    }
    if (promptedTourView && promptedTourView !== viewMode) {
      setPromptedTourView(null);
    }
  }, [activeTourView, promptedTourView, viewMode]);

  const closeTourForView = useCallback(
    (view: ViewMode, markCompleted: boolean) => {
      if (markCompleted) {
        persistCompletedTours({ ...completedTours, [view]: true });
      }
      setActiveTourView(null);
      setActiveTourStep(0);
    },
    [completedTours, persistCompletedTours]
  );

  const dismissTransientTourUi = useCallback(() => {
    setShowGuideChoice(false);
    setPromptedTourView(null);
  }, []);

  const openTourForCurrentView = useCallback(() => {
    setPromptedTourView(null);
    setShowGuideChoice(true);
  }, []);

  const startTour = useCallback((view: ViewMode, mode: TourMode) => {
    setTourMode(mode);
    setShowGuideChoice(false);
    setPromptedTourView(null);
    setActiveTourView(view);
    setActiveTourStep(0);
  }, []);

  const startIntroGuide = useCallback(() => {
    setShowWelcomeModal(false);
    setTourMode("full");
    setActiveTourView(viewMode);
    setActiveTourStep(0);
  }, [viewMode]);

  const skipPromptedTour = useCallback(() => {
    if (!promptedTourView) return;
    persistCompletedTours({ ...completedTours, [promptedTourView]: true });
    setPromptedTourView(null);
  }, [completedTours, persistCompletedTours, promptedTourView]);

  const currentTourSteps = useMemo(() => {
    if (!activeTourView) return [];
    return getTourSteps(activeTourView, tourMode);
  }, [activeTourView, tourMode]);

  const currentTourStep = activeTourView ? currentTourSteps[activeTourStep] ?? null : null;

  useEffect(() => {
    if (!currentTourStep || !containerRef.current) {
      setMeasuredTargetStyle(null);
      setMeasuredCardStyle(null);
      setGuideLine(null);
      return;
    }

    const updateMeasurements = () => {
      const root = containerRef.current;
      if (!root || !currentTourStep) return;

      const target = root.querySelector(`[data-tour="${currentTourStep.id}"]`);
      if (!target) {
        setMeasuredTargetStyle(currentTourStep.targetStyle ?? null);
        setMeasuredCardStyle(currentTourStep.cardStyle ?? null);
        setGuideLine(null);
        return;
      }

      const rootRect = root.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const padding = 8;
      const top = Math.max(8, targetRect.top - rootRect.top - padding);
      const left = Math.max(8, targetRect.left - rootRect.left - padding);
      const width = Math.min(rootRect.width - left - 8, targetRect.width + padding * 2);
      const height = Math.min(rootRect.height - top - 8, targetRect.height + padding * 2);

      const highlightRadius =
        currentTourStep.id === "forest-y-axis" || currentTourStep.id === "forest-x-axis" ? 18 : 20;

      setMeasuredTargetStyle({
        left,
        top,
        width,
        height,
        borderRadius: highlightRadius,
      });

      const isMobile = rootRect.width < 768;
      const desiredCardWidth =
        currentTourStep.id === "forest-read" ? (isMobile ? 320 : 420) : 340;
      const desiredCardHeight =
        currentTourStep.id === "forest-read" ? (isMobile ? 180 : 240) : 210;
      const cardWidth = Math.min(desiredCardWidth, rootRect.width - 24);
      const gap = 14;
      const spaceRight = rootRect.width - (left + width);
      const placeRight = spaceRight >= cardWidth + gap;
      const spaceBelow = rootRect.height - (top + height);
      const placeBelow = spaceBelow >= desiredCardHeight;

      let cardLeft = left;
      let cardTop = top + height + gap;

      if (currentTourStep.id === "forest-read" && isMobile) {
        cardLeft = Math.max(8, (rootRect.width - cardWidth) / 2);
        cardTop = Math.max(8, top + height + 12);
        if (cardTop + desiredCardHeight > rootRect.height - 12) {
          cardTop = Math.max(8, top - desiredCardHeight - 12);
        }
      } else if (currentTourStep.id === "forest-read") {
        const leftSide = left - cardWidth - 24;
        const rightSide = left + width + 24;
        cardLeft =
          leftSide >= 12
            ? leftSide
            : Math.max(12, Math.min(rightSide, rootRect.width - cardWidth - 12));
        cardTop = Math.max(
          24,
          Math.min(top + height / 2 - desiredCardHeight / 2, rootRect.height - desiredCardHeight - 24)
        );
      } else if (placeRight) {
        cardLeft = left + width + gap;
        cardTop = Math.max(12, Math.min(top, rootRect.height - desiredCardHeight));
      } else if (!placeBelow) {
        cardTop = Math.max(12, top - (desiredCardHeight - 20));
        cardLeft = Math.max(12, Math.min(left, rootRect.width - cardWidth - 12));
      } else {
        cardLeft = Math.max(12, Math.min(left, rootRect.width - cardWidth - 12));
      }

      setMeasuredCardStyle({
        width: currentTourStep.cardStyle?.width,
        maxWidth: currentTourStep.cardStyle?.maxWidth,
        transform: "none",
        left: cardLeft,
        top: cardTop,
      });

      if (viewMode === "forest" && currentTourStep.id === "forest-read") {
        const yAxis = root.querySelector(`[data-tour="forest-y-axis"]`);
        const canopyTop = root.querySelector(`[data-tour="forest-read-canopy-top"]`);
        if (yAxis && canopyTop) {
          const yAxisRect = yAxis.getBoundingClientRect();
          const canopyRect = canopyTop.getBoundingClientRect();
          const lineY = canopyRect.top - rootRect.top + canopyRect.height / 2;
          const axisX = yAxisRect.left - rootRect.left + yAxisRect.width;
          const treeX = canopyRect.left - rootRect.left + canopyRect.width / 2;
          setGuideLine({ x1: axisX, y1: lineY, x2: treeX, y2: lineY });
        } else {
          setGuideLine(null);
        }
      } else {
        setGuideLine(null);
      }
    };

    const frame = window.requestAnimationFrame(updateMeasurements);
    window.addEventListener("resize", updateMeasurements);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateMeasurements);
    };
  }, [activeRegion, containerRef, currentTourStep, selectedYear, viewMode]);

  const handleTourNext = useCallback(() => {
    if (!activeTourView) return;

    if (activeTourStep >= currentTourSteps.length - 1) {
      closeTourForView(activeTourView, true);
      return;
    }

    setActiveTourStep((step) => step + 1);
  }, [activeTourStep, activeTourView, closeTourForView, currentTourSteps.length]);

  const handleTourPrev = useCallback(() => {
    setActiveTourStep((step) => Math.max(0, step - 1));
  }, []);

  const renderedTourStep: GuidedTourStep | null = currentTourStep
    ? {
        ...currentTourStep,
        targetStyle: measuredTargetStyle ?? currentTourStep.targetStyle,
        cardStyle: measuredCardStyle ?? currentTourStep.cardStyle,
      }
    : null;

  return {
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
  };
}
