"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ViewMode } from "./tour-config";

export function CanopyLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#4ade80" opacity="0.15" />
      <circle cx="16" cy="12" r="6" fill="#4ade80" opacity="0.4" />
      <circle cx="10" cy="15" r="5" fill="#4ade80" opacity="0.35" />
      <circle cx="22" cy="15" r="5" fill="#4ade80" opacity="0.35" />
      <circle cx="13" cy="19" r="4.5" fill="#4ade80" opacity="0.3" />
      <circle cx="19" cy="19" r="4.5" fill="#4ade80" opacity="0.3" />
      <circle cx="16" cy="15" r="5" fill="#4ade80" opacity="0.6" />
      <circle cx="16" cy="14" r="2.5" fill="#4ade80" opacity="0.9" />
    </svg>
  );
}

interface GuideChoiceMenuProps {
  open: boolean;
  viewMode: ViewMode;
  getPageOnlyLabel: (view: ViewMode) => string;
  onStartTour: (view: ViewMode, mode: "full" | "page-only") => void;
}

export function GuideChoiceMenu({
  open,
  viewMode,
  getPageOnlyLabel,
  onStartTour,
}: GuideChoiceMenuProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute top-full right-0 z-50 mt-2 rounded-xl p-2"
          style={{
            background: "rgba(10, 22, 18, 0.95)",
            border: "1px solid rgba(74, 222, 128, 0.2)",
            backdropFilter: "blur(12px)",
            minWidth: "200px",
            maxWidth: "min(260px, calc(100vw - 24px))",
          }}
        >
          <div
            className="px-3 py-1.5 text-[10px] uppercase tracking-[0.15em]"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Space Mono, monospace" }}
          >
            Which guide?
          </div>
          <button
            onClick={() => onStartTour(viewMode, "full")}
            className="w-full text-left text-xs px-3 py-2.5 rounded-lg transition-all hover:bg-white/5"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            <span style={{ color: "var(--tree-healthy)" }}>Full walkthrough</span>
          </button>
          <button
            onClick={() => onStartTour(viewMode, "page-only")}
            className="w-full text-left text-xs px-3 py-2.5 rounded-lg transition-all hover:bg-white/5"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            <span style={{ color: "var(--tree-healthy)" }}>{getPageOnlyLabel(viewMode)}</span>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

interface ForestGuideLineProps {
  guideLine: { x1: number; y1: number; x2: number; y2: number } | null;
}

export function ForestGuideLine({ guideLine }: ForestGuideLineProps) {
  if (!guideLine) return null;

  const lineLen = Math.abs(guideLine.x2 - guideLine.x1);
  const midX = (guideLine.x1 + guideLine.x2) / 2;
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 768;
  const labelText = isNarrow ? "trunk → y-axis" : "read bright center → y-axis";
  const labelW = isNarrow ? 106 : 164;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[71] h-full w-full"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <filter id="guide-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line
        x1={guideLine.x1}
        y1={guideLine.y1}
        x2={guideLine.x2}
        y2={guideLine.y2}
        stroke="rgba(74, 222, 128, 0.25)"
        strokeWidth={isNarrow ? 4 : 6}
        filter="url(#guide-glow)"
      />
      <line
        x1={guideLine.x1}
        y1={guideLine.y1}
        x2={guideLine.x2}
        y2={guideLine.y2}
        stroke="rgba(255,255,255,0.9)"
        strokeWidth={isNarrow ? 1.5 : 2}
        strokeDasharray={isNarrow ? "6 5" : "8 6"}
      />
      <circle cx={guideLine.x1} cy={guideLine.y1} r={isNarrow ? 4 : 5} fill="white" filter="url(#guide-glow)" />
      <circle cx={guideLine.x1} cy={guideLine.y1} r={isNarrow ? 2.5 : 3} fill="white" />
      <circle cx={guideLine.x2} cy={guideLine.y2} r={isNarrow ? 5 : 6} fill="var(--tree-healthy)" opacity={0.35} filter="url(#guide-glow)" />
      <circle cx={guideLine.x2} cy={guideLine.y2} r={isNarrow ? 3 : 4} fill="var(--tree-healthy)" />
      {lineLen > 40 && (
        <>
          <rect
            x={midX - labelW / 2}
            y={guideLine.y1 - (isNarrow ? 22 : 26)}
            width={labelW}
            height={isNarrow ? 18 : 20}
            rx={isNarrow ? 9 : 10}
            fill="rgba(8, 16, 12, 0.85)"
            stroke="rgba(74, 222, 128, 0.25)"
            strokeWidth={1}
          />
          <text
            x={midX}
            y={guideLine.y1 - (isNarrow ? 9 : 12)}
            textAnchor="middle"
            fill="rgba(255,255,255,0.75)"
            fontSize={isNarrow ? 9 : 10}
            fontFamily="Space Mono, monospace"
          >
            {labelText}
          </text>
        </>
      )}
    </svg>
  );
}

interface WelcomeModalProps {
  open: boolean;
  onStartIntroGuide: () => void;
}

export function WelcomeModal({ open, onStartIntroGuide }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[80] overflow-y-auto overscroll-contain p-3 touch-pan-y sm:flex sm:items-center sm:justify-center sm:p-6"
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px]" />
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="relative mx-auto my-4 max-h-[calc(100dvh-24px)] w-full max-w-[560px] overflow-y-auto rounded-[28px] border p-5 shadow-2xl sm:my-0 sm:max-h-[min(720px,calc(100dvh-48px))] sm:p-7"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,22,17,0.98) 0%, rgba(8,16,12,0.98) 100%)",
              borderColor: "rgba(74, 222, 128, 0.18)",
              boxShadow:
                "0 24px 90px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  background: "rgba(74, 222, 128, 0.1)",
                  border: "1px solid rgba(74, 222, 128, 0.14)",
                }}
              >
                <CanopyLogo size={26} />
              </div>
              <div>
                <div
                  className="text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: "rgba(255,255,255,0.38)", fontFamily: "Space Mono, monospace" }}
                >
                  Welcome
                </div>
                <h2
                  className="text-xl font-semibold text-white sm:text-2xl"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  The forest is growing, but learning still trails behind
                </h2>
              </div>
            </div>

            <div
              className="space-y-4 text-sm leading-7 sm:text-[15px]"
              style={{ color: "rgba(255,255,255,0.76)", fontFamily: "DM Sans, sans-serif" }}
            >
              <p>
                Across many countries, school enrollment has increased over time, but the quality of learning has
                not kept pace. More children are reaching school, yet the number of years they truly learn often
                grows more slowly than the number of years they attend.
              </p>
              <p>
                That is why this project uses a forest metaphor. A tree can look tall and healthy from a distance,
                just as enrollment growth can look like clear progress. But the canopy tells a deeper story: it
                represents how much learning is actually taking place beneath that growth.
              </p>
              <p>
                In this forest, tall trunks stand for time spent in school, while the canopy reveals the quality
                and depth of learning. The gap between the two helps make hidden inefficiency visible at a glance.
              </p>
            </div>

            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div
                className="max-w-[260px] text-xs leading-5"
                style={{ color: "rgba(255,255,255,0.42)", fontFamily: "Space Mono, monospace" }}
              >
                Continue to the introductory guide for a quick walkthrough of the views, filters, and timeline.
              </div>
              <button
                onClick={onStartIntroGuide}
                className="w-full rounded-2xl px-4 py-3 text-sm font-semibold transition hover:brightness-110 sm:w-auto"
                style={{
                  background: "var(--tree-healthy)",
                  color: "var(--forest-deep)",
                  fontFamily: "Space Mono, monospace",
                  boxShadow: "0 10px 30px rgba(74, 222, 128, 0.18)",
                }}
              >
                Start introductory guide
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

interface PromptedTourModalProps {
  view: ViewMode | null;
  getPageOnlyLabel: (view: ViewMode) => string;
  onSkip: () => void;
  onStartTour: (view: ViewMode, mode: "full" | "page-only") => void;
}

export function PromptedTourModal({
  view,
  getPageOnlyLabel,
  onSkip,
  onStartTour,
}: PromptedTourModalProps) {
  return (
    <AnimatePresence>
      {view ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[79] overflow-y-auto overscroll-contain p-3 touch-pan-y sm:flex sm:items-center sm:justify-center sm:p-6"
        >
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
          <motion.div
            initial={{ y: 14, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative mx-auto my-4 max-h-[calc(100dvh-24px)] w-full max-w-[460px] overflow-y-auto rounded-[24px] border p-5 shadow-2xl sm:my-0 sm:max-h-[min(640px,calc(100dvh-48px))] sm:p-6"
            style={{
              background: "linear-gradient(180deg, rgba(11,22,17,0.98) 0%, rgba(8,16,12,0.98) 100%)",
              borderColor: "rgba(74, 222, 128, 0.16)",
              boxShadow: "0 20px 80px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.04)",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  background: "rgba(74, 222, 128, 0.1)",
                  border: "1px solid rgba(74, 222, 128, 0.14)",
                }}
              >
                <CanopyLogo size={24} />
              </div>
              <div>
                <div
                  className="text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: "rgba(255,255,255,0.36)", fontFamily: "Space Mono, monospace" }}
                >
                  Walkthrough
                </div>
                <h2
                  className="text-lg font-semibold text-white sm:text-xl"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  Explore the {view} view with a quick guide?
                </h2>
              </div>
            </div>

            <p
              className="text-sm leading-7 sm:text-[15px]"
              style={{ color: "rgba(255,255,255,0.74)", fontFamily: "DM Sans, sans-serif" }}
            >
              I can walk through the main reading logic, controls, and interactions for this page. You can always
              replay it later from the <span style={{ color: "var(--tree-healthy)" }}>Guide</span> button.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={onSkip}
                className="w-full rounded-2xl border px-4 py-3 text-sm transition hover:bg-white/5 sm:w-auto"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.72)",
                  fontFamily: "Space Mono, monospace",
                }}
              >
                No thanks
              </button>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <button
                  onClick={() => onStartTour(view, "page-only")}
                  className="w-full rounded-2xl border px-4 py-3 text-sm transition hover:bg-white/5 sm:w-auto"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.82)",
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  {getPageOnlyLabel(view)}
                </button>
                <button
                  onClick={() => onStartTour(view, "full")}
                  className="w-full rounded-2xl px-4 py-3 text-sm font-semibold transition hover:brightness-110 sm:w-auto"
                  style={{
                    background: "var(--tree-healthy)",
                    color: "var(--forest-deep)",
                    fontFamily: "Space Mono, monospace",
                    boxShadow: "0 10px 30px rgba(74, 222, 128, 0.18)",
                  }}
                >
                  Full walkthrough
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
