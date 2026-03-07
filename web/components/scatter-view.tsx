"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import type { CountryData, Region } from "@/lib/types";
import { REGION_COLORS, REGION_ABBR } from "@/lib/constants";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ScatterViewProps {
  countries: CountryData[];
  activeRegion: Region | null;
  onCountryClick?: (country: CountryData) => void;
}

const BRIGHT_REGION_COLORS: Record<Region, string> = {
  "Sub-Saharan Africa": "#FF6B6B",
  "South Asia": "#FFB347",
  "East Asia & Pacific": "#FFE066",
  "Europe & Central Asia": "#69DB7C",
  "Latin America & Caribbean": "#4ECDC4",
  "Middle East & North Africa": "#C5A3FF",
  "North America": "#51CF66",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: CountryData }[];
}) {
  if (!active || !payload?.length) return null;
  const c = payload[0].payload;
  const efficiency =
    c.yearsInSchool > 0 ? ((c.lays / c.yearsInSchool) * 100).toFixed(0) : "–";
  const color = BRIGHT_REGION_COLORS[c.region];

  return (
    <div
      className="px-3 py-2 rounded-xl text-xs"
      style={{
        background: "rgba(8,16,12,0.95)",
        border: `1px solid ${color}40`,
        fontFamily: "Space Mono, monospace",
        color: "rgba(255,255,255,0.8)",
        boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
      }}
    >
      <div className="font-semibold mb-1" style={{ color }}>
        {c.name}
      </div>
      <div
        className="text-[10px] mb-2"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        {c.region}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Enrolled</span>
        <span>{c.yearsInSchool.toFixed(1)} yrs</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Learning</span>
        <span style={{ color }}>{c.lays.toFixed(1)} yrs</span>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Efficiency</span>
        <span style={{ color: "var(--tree-healthy)" }}>{efficiency}%</span>
      </div>
    </div>
  );
}

function useIsMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export default function ScatterView({
  countries,
  activeRegion,
  onCountryClick,
}: ScatterViewProps) {
  const isMobile = useIsMobile();

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist.current = Math.hypot(dx, dy);
      } else if (e.touches.length === 1 && scale > 1) {
        setIsPanning(true);
        panStart.current = {
          x: e.touches[0].clientX - translate.x,
          y: e.touches[0].clientY - translate.y,
        };
      }
    },
    [scale, translate]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastPinchDist.current !== null) {
          const factor = dist / lastPinchDist.current;
          setScale((s) => Math.min(4, Math.max(1, s * factor)));
        }
        lastPinchDist.current = dist;
        e.preventDefault();
      } else if (e.touches.length === 1 && isPanning) {
        setTranslate({
          x: e.touches[0].clientX - panStart.current.x,
          y: e.touches[0].clientY - panStart.current.y,
        });
        e.preventDefault();
      }
    },
    [isPanning]
  );

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = null;
    setIsPanning(false);
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const chartMargin = isMobile
    ? { top: 8, right: 12, bottom: 32, left: 28 }
    : { top: 16, right: 32, bottom: 40, left: 48 };

  const dotRadius = isMobile ? 5 : 8;
  const axisFontSize = isMobile ? 8 : 10;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 px-2 md:mb-4">
        <div>
          <h3
            className="text-sm font-semibold text-white md:text-lg"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Years Enrolled vs Years Learned
          </h3>
          <p
            className="text-[10px] mt-0.5 md:text-xs md:mt-1"
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "Space Mono, monospace",
            }}
          >
            {isMobile
              ? "Pinch to zoom · Tap a dot for details"
              : "Each dot is a country · Closer to the diagonal = more efficient learning"}
          </p>
        </div>
        {isMobile && scale > 1 && (
          <button
            onClick={handleResetZoom}
            className="text-[10px] px-2 py-1 rounded-lg shrink-0"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "Space Mono, monospace",
            }}
          >
            Reset zoom
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-hidden"
        data-tour="scatter-chart"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: scale > 1 ? "none" : "pan-y" }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.15s ease-out",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={chartMargin}>
              <XAxis
                type="number"
                dataKey="yearsInSchool"
                domain={[4, 16]}
                tick={{
                  fill: "rgba(255,255,255,0.35)",
                  fontSize: axisFontSize,
                  fontFamily: "Space Mono, monospace",
                }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                label={
                  isMobile
                    ? undefined
                    : {
                        value: "Years enrolled in school",
                        position: "insideBottom",
                        offset: -20,
                        fill: "rgba(255,255,255,0.3)",
                        fontSize: 10,
                        fontFamily: "Space Mono, monospace",
                      }
                }
              />
              <YAxis
                type="number"
                dataKey="lays"
                domain={[0, 14]}
                tick={{
                  fill: "rgba(255,255,255,0.35)",
                  fontSize: axisFontSize,
                  fontFamily: "Space Mono, monospace",
                }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                label={
                  isMobile
                    ? undefined
                    : {
                        value: "Years of actual learning (LAYS)",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        fill: "rgba(255,255,255,0.3)",
                        fontSize: 10,
                        fontFamily: "Space Mono, monospace",
                      }
                }
              />
              <ReferenceLine
                segment={[
                  { x: 4, y: 4 },
                  { x: 14, y: 14 },
                ]}
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="4 4"
                label={
                  isMobile
                    ? undefined
                    : {
                        value: "100% efficiency",
                        position: "insideTopLeft",
                        fill: "rgba(255,255,255,0.2)",
                        fontSize: 9,
                        fontFamily: "Space Mono, monospace",
                      }
                }
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.08)" }}
              />

              <Scatter
                name="Countries"
                data={countries}
                onClick={(data) =>
                  onCountryClick?.(data as unknown as CountryData)
                }
              >
                {countries.map((c) => {
                  const dimmed =
                    activeRegion !== null && c.region !== activeRegion;
                  const color = BRIGHT_REGION_COLORS[c.region];
                  return (
                    <Cell
                      key={c.code}
                      fill={color}
                      fillOpacity={dimmed ? 0.15 : 0.7}
                      stroke={color}
                      strokeOpacity={dimmed ? 0.1 : 0.9}
                      strokeWidth={1.5}
                      r={dotRadius}
                      style={{ cursor: "pointer" }}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div
        data-tour="scatter-legend"
        className="mt-2 pt-2 flex flex-wrap items-center justify-center gap-2 md:mt-4 md:pt-3 md:gap-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {(Object.entries(BRIGHT_REGION_COLORS) as [Region, string][]).map(
          ([region, color]) => {
            const dimmed = activeRegion !== null && region !== activeRegion;
            return (
              <div
                key={region}
                className="flex items-center gap-1 md:gap-2"
                style={{ opacity: dimmed ? 0.3 : 1 }}
              >
                <div
                  className="w-2 h-2 rounded-full md:w-3 md:h-3"
                  style={{ background: color }}
                />
                <span
                  className="text-[8px] md:text-[10px]"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  {REGION_ABBR[region]}
                </span>
              </div>
            );
          }
        )}
      </div>

      <div
        className="mt-1 text-[9px] text-center md:mt-2 md:text-[10px]"
        style={{
          color: "rgba(255,255,255,0.25)",
          fontFamily: "Space Mono, monospace",
        }}
      >
        {isMobile ? "Tap a dot for details" : "Click on a country for details"}
      </div>
    </div>
  );
}
