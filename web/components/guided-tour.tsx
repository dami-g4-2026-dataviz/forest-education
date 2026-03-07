"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface GuidedTourStep {
  id: string;
  title: string;
  description: ReactNode;
  targetStyle?: CSSProperties;
  cardStyle?: CSSProperties;
}

interface GuidedTourProps {
  open: boolean;
  step: GuidedTourStep | null;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

export default function GuidedTour({
  open,
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  canGoBack,
  isLastStep,
}: GuidedTourProps) {
  return (
    <AnimatePresence>
      {open && step ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[70]"
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="absolute rounded-full border border-[rgba(74,222,128,0.9)] bg-[rgba(74,222,128,0.08)] shadow-[0_0_0_9999px_rgba(0,0,0,0.02),0_0_24px_rgba(74,222,128,0.45)]"
            style={step.targetStyle}
          >
            <div className="absolute inset-2 rounded-full border border-[rgba(74,222,128,0.35)]" />
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute w-[min(340px,calc(100vw-16px))] rounded-2xl border border-[rgba(74,222,128,0.2)] bg-[rgba(8,16,12,0.96)] p-3 shadow-2xl max-h-[min(320px,calc(100vh-100px))] overflow-y-auto sm:p-4"
            style={step.cardStyle}
          >
            <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3 sm:gap-3">
              <div>
                <div
                  className="mb-0.5 text-[9px] uppercase tracking-[0.18em] sm:mb-1 sm:text-[10px]"
                  style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Mono, monospace" }}
                >
                  Guided Tour {stepIndex + 1}/{totalSteps}
                </div>
                <h3 className="text-sm font-semibold text-white sm:text-base" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {step.title}
                </h3>
              </div>
              <button
                onClick={onSkip}
                className="rounded-lg p-1 text-white/45 transition hover:bg-white/5 hover:text-white/75 shrink-0"
                aria-label="Close tour"
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="text-xs leading-relaxed sm:text-sm"
              style={{ color: "rgba(255,255,255,0.72)", fontFamily: "DM Sans, sans-serif" }}
            >
              {step.description}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4 sm:gap-3">
              <button
                onClick={onSkip}
                className="text-[11px] transition hover:text-white sm:text-xs"
                style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Space Mono, monospace" }}
              >
                Skip
              </button>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {canGoBack ? (
                  <button
                    onClick={onPrev}
                    className="rounded-xl border border-white/10 px-2.5 py-1.5 text-[11px] text-white/75 transition hover:bg-white/5 sm:px-3 sm:py-2 sm:text-xs"
                    style={{ fontFamily: "Space Mono, monospace" }}
                  >
                    Back
                  </button>
                ) : null}
                <button
                  onClick={onNext}
                  className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition hover:brightness-110 sm:px-3 sm:py-2 sm:text-xs"
                  style={{
                    background: "var(--tree-healthy)",
                    color: "var(--forest-deep)",
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  {isLastStep ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
