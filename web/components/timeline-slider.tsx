"use client";

import { useCallback, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { TIMELINE_YEARS, type TimelineYear } from "@/lib/types";

interface TimelineSliderProps {
  year: TimelineYear;
  onChange: (year: TimelineYear) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export default function TimelineSlider({
  year,
  onChange,
  isPlaying,
  onPlayPause,
}: TimelineSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const currentIndex = TIMELINE_YEARS.indexOf(year);
  const isDragging = useRef(false);

  const resolveYearFromX = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = x / rect.width;
    const index = Math.round(percentage * (TIMELINE_YEARS.length - 1));
    const clamped = Math.max(0, Math.min(TIMELINE_YEARS.length - 1, index));
    onChange(TIMELINE_YEARS[clamped]);
  }, [onChange]);

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    resolveYearFromX(e.clientX);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    resolveYearFromX(e.touches[0].clientX);
  }, [resolveYearFromX]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    resolveYearFromX(e.touches[0].clientX);
  }, [resolveYearFromX]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-xl px-0 py-1 sm:px-4 sm:py-2"
      style={{
        background: "transparent",
      }}
    >
      <button
        onClick={onPlayPause}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-all"
        style={{
          background: isPlaying
            ? "rgba(74, 222, 128, 0.2)"
            : "rgba(4, 10, 7, 0.18)",
          border: `1px solid ${
            isPlaying
              ? "rgba(74, 222, 128, 0.4)"
              : "rgba(255,255,255,0.08)"
          }`,
          color: isPlaying ? "var(--tree-healthy)" : "rgba(255,255,255,0.6)",
        }}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      <div
        className="ml-auto text-base font-bold tabular-nums text-right sm:ml-0 sm:text-lg"
        style={{
          color: "var(--tree-healthy)",
          fontFamily: "Space Mono, monospace",
          textShadow: "0 0 20px var(--tree-healthy)",
        }}
      >
        {year}
      </div>

      <div
        ref={sliderRef}
        className="relative order-3 flex h-10 basis-full cursor-pointer items-center sm:order-none sm:h-8 sm:flex-1 sm:basis-auto"
        onClick={handleSliderClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none" }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
        
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full transition-all duration-300"
          style={{
            width: `${(currentIndex / (TIMELINE_YEARS.length - 1)) * 100}%`,
            background: "var(--tree-healthy)",
            boxShadow: "0 0 8px var(--tree-healthy)",
          }}
        />

        {TIMELINE_YEARS.map((y, i) => {
          const isActive = y === year;
          const isPast = i <= currentIndex;
          const isMajorYear = y % 5 === 0;
          return (
            <div
              key={y}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${(i / (TIMELINE_YEARS.length - 1)) * 100}%` }}
            >
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 14 : isMajorYear ? 8 : 4,
                  height: isActive ? 14 : isMajorYear ? 8 : 4,
                  background: isActive ? "var(--tree-healthy)" : isPast ? "rgba(74, 222, 128, 0.5)" : "rgba(255,255,255,0.2)",
                  boxShadow: isActive ? "0 0 12px var(--tree-healthy)" : "none",
                }}
              />
              {(isMajorYear || isActive) && (
                <span
                  className={`absolute top-5 whitespace-nowrap text-[9px] transition-all duration-300 ${isActive ? "block" : "hidden sm:block"}`}
                  style={{
                    color: isActive ? "var(--tree-healthy)" : "rgba(255,255,255,0.35)",
                    fontFamily: "Space Mono, monospace",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {y}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
