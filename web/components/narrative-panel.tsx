"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { chapters, globalStats } from "@/lib/constants";

interface NarrativePanelProps {
  chapterId: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function NarrativePanel({ chapterId, onNext, onPrev }: NarrativePanelProps) {
  const isLast = chapterId === chapters.length - 1;
  const isFirst = chapterId === 0;
  const [visible, setVisible] = useState(true);
  const [displayedId, setDisplayedId] = useState(chapterId);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setDisplayedId(chapterId);
      setVisible(true);
    }, 180);
    return () => clearTimeout(t);
  }, [chapterId]);

  const displayed = chapters[displayedId];

  return (
    <div
      className="narrative-panel rounded-2xl p-5 flex flex-col gap-3"
      style={{ maxWidth: 340, minWidth: 290 }}
    >
      <div className="flex items-center gap-1.5">
        {chapters.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-400"
            style={{
              width: i === chapterId ? 18 : 5,
              height: 5,
              background:
                i === chapterId
                  ? "var(--tree-healthy)"
                  : i < chapterId
                  ? "rgba(74, 222, 128, 0.35)"
                  : "rgba(255,255,255,0.12)",
              transition: "all 0.35s ease",
            }}
          />
        ))}
        <span
          className="ml-auto text-xs"
          style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Mono, monospace" }}
        >
          {chapterId + 1}/{chapters.length}
        </span>
      </div>

      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        <div
          className="text-xs uppercase tracking-widest mb-1.5"
          style={{ color: "var(--tree-healthy)", fontFamily: "Space Mono, monospace" }}
        >
          {displayed.subtitle}
        </div>

        <h2
          className="text-xl font-bold leading-tight mb-2"
          style={{ color: "var(--text-primary)", fontFamily: "Playfair Display, serif" }}
        >
          {displayed.title}
        </h2>

        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
          {displayed.body}
        </p>

        {displayed.metric && (
          <div
            className="rounded-lg px-3 py-2 text-xs mb-3"
            style={{
              background: "rgba(74, 222, 128, 0.07)",
              border: "1px solid rgba(74, 222, 128, 0.18)",
              color: "var(--tree-healthy)",
              fontFamily: "Space Mono, monospace",
              lineHeight: 1.5,
            }}
          >
            {displayed.metric}
          </div>
        )}

        {displayedId === chapters.length - 1 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: "Out of school", value: `${globalStats.outOfSchool}M`, color: "#EF4444" },
              { label: "Learning poverty", value: `${globalStats.learningPoverty}%`, color: "#F97316" },
              { label: "Years behind SDG", value: `${globalStats.yearsLate}`, color: "#EAB308" },
              { label: "LAYS gap", value: `${globalStats.laysGap} yrs`, color: "#4ADE80" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-lg p-2.5 text-center"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="text-lg font-bold"
                  style={{ color, fontFamily: "Space Mono, monospace" }}
                >
                  {value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg transition-all"
          style={{
            color: isFirst ? "rgba(255,255,255,0.18)" : "var(--text-secondary)",
            background: isFirst ? "transparent" : "rgba(255,255,255,0.05)",
            cursor: isFirst ? "not-allowed" : "pointer",
          }}
        >
          <ChevronLeft size={14} />
          Back
        </button>

        {!isLast ? (
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
            style={{
              color: "var(--forest-deep)",
              background: "var(--tree-healthy)",
              boxShadow: "0 0 16px rgba(74,222,128,0.25)",
            }}
          >
            Next
            <ChevronRight size={14} />
          </button>
        ) : (
          <span
            className="text-xs px-3 py-2"
            style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Space Mono, monospace" }}
          >
            Explore freely
          </span>
        )}
      </div>
    </div>
  );
}
