"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { CountryData, Region } from "@/lib/types";
import { REGION_COLORS } from "@/lib/constants";
import Tree from "./tree";
import CustomTooltip from "./custom-tooltip";

interface ForestProps {
  countries: CountryData[];
  highlightMetric: string | null;
  activeRegion: Region | null;
  onCountryClick: (country: CountryData) => void;
  chapterId: number;
  focusedCountryCode?: string | null;
}

interface TooltipState {
  country: CountryData | null;
  x: number;
  y: number;
}

const REGION_ORDER: Region[] = [
  "Sub-Saharan Africa",
  "South Asia",
  "Middle East & North Africa",
  "Latin America & Caribbean",
  "East Asia & Pacific",
  "Europe & Central Asia",
  "North America",
];

const STARS = Array.from({ length: 250 }, (_, i) => ({
  x: (i * 137.508) % 100,
  y: (i * 97.31) % 70,
  r: 0.3 + (i % 4) * 0.3,
  opacity: 0.08 + (i % 6) * 0.07,
}));

export default function Forest({
  countries,
  highlightMetric,
  activeRegion,
  onCountryClick,
  chapterId,
  focusedCountryCode = null,
}: ForestProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 1200, height: 700 });
  const [tooltip, setTooltip] = useState<TooltipState>({ country: null, x: 0, y: 0 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDims({ width, height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const layout = useMemo(() => {
    const containerWidth = dims.width;
    const height = dims.height;
    const groundY = Math.round(height * 0.85);
    const marginL = 32;
    const marginR = 32;

    const sorted = [...countries].sort((a, b) => {
      const ra = REGION_ORDER.indexOf(a.region);
      const rb = REGION_ORDER.indexOf(b.region);
      if (ra !== rb) return ra - rb;
      return a.yearsInSchool - b.yearsInSchool;
    });

    const n = sorted.length;
    const svgWidth = containerWidth;
    const usableWidth = svgWidth - marginL - marginR;
    const spacing = usableWidth / n;

    const maxTrunkH = groundY * 0.72;
    const scaleByWidth = spacing / (11 * 2);
    const scale = Math.max(0.3, Math.min(2.5, scaleByWidth));

    return {
      positions: sorted.map((country, i) => ({
        country,
        x: marginL + i * spacing + spacing / 2,
        y: groundY,
        scale,
        maxTrunkH,
        delay: i * 18 + 80,
      })),
      svgWidth,
      groundY,
      maxTrunkH,
    };
  }, [dims, countries]);

  const { positions: treePositions, svgWidth, groundY } = layout;

  const handleHover = useCallback(
    (country: CountryData | null, x: number, y: number) => {
      setTooltip({ country, x, y });
    },
    []
  );

  const getTreeDimmed = (country: CountryData) => {
    if (focusedCountryCode) {
      return country.code !== focusedCountryCode;
    }
    if (activeRegion) {
      return country.region !== activeRegion;
    }
    return false;
  };

  const isTreeHighlighted = (country: CountryData) => {
    if (chapterId === 2 && country.learningPoverty > 70) return true;
    if (chapterId === 3 && country.lays < 4) return true;
    if (chapterId === 4 && country.gpiPrimary < 0.85) return true;
    return false;
  };

  const zoomParams = useMemo(() => {
    if (focusedCountryCode) {
      const tree = treePositions.find((t) => t.country.code === focusedCountryCode);
      return { x: tree?.x ?? svgWidth / 2, scale: 4.5 };
    }
    if (activeRegion) {
      const trees = treePositions.filter((t) => t.country.region === activeRegion);
      const avgX = trees.reduce((sum, t) => sum + t.x, 0) / trees.length;
      return { x: avgX, scale: 2.8 };
    }
    return { x: svgWidth / 2, scale: 1 };
  }, [focusedCountryCode, activeRegion, treePositions, svgWidth]);

  const regionLabels = useMemo(() => {
    return REGION_ORDER.map((region) => {
      const trees = treePositions.filter((t) => t.country.region === region);
      if (!trees.length) return null;
      const minX = Math.min(...trees.map((t) => t.x));
      const maxX = Math.max(...trees.map((t) => t.x));
      return {
        region,
        x: (minX + maxX) / 2,
        color: REGION_COLORS[region],
        firstX: minX,
      };
    }).filter(Boolean);
  }, [treePositions]);

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden">
      <svg
        width={svgWidth}
        height={dims.height}
        style={{
          display: "block",
          transformOrigin: `${zoomParams.x}px ${groundY}px`,
          transform: `scale(${zoomParams.scale})`,
          transition: "transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#040A07" />
            <stop offset="60%" stopColor="#080E0B" />
            <stop offset="100%" stopColor="#0F1A14" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#162019" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#040A07" />
          </linearGradient>
          <radialGradient id="moonGlow" cx="82%" cy="10%" r="18%">
            <stop offset="0%" stopColor="rgba(74,222,128,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="fogBlur">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        <rect width={svgWidth} height={dims.height} fill="url(#skyGrad)" />
        <rect width={svgWidth} height={dims.height} fill="url(#moonGlow)" />

        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={(s.x / 100) * svgWidth}
            cy={(s.y / 100) * groundY}
            r={s.r}
            fill="white"
            opacity={s.opacity}
          />
        ))}

        <rect
          x={-svgWidth * 0.1}
          y={groundY - 200}
          width={svgWidth * 1.2}
          height={60}
          fill="rgba(74, 222, 128, 0.018)"
          filter="url(#fogBlur)"
        />

        <rect
          x={0}
          y={groundY}
          width={svgWidth}
          height={dims.height - groundY}
          fill="url(#groundGrad)"
        />

        <line
          x1={0}
          y1={groundY}
          x2={svgWidth}
          y2={groundY}
          stroke="rgba(74, 222, 128, 0.14)"
          strokeWidth={1}
        />

        {regionLabels.map((rl, ri) => {
          if (!rl || ri === 0) return null;
          return (
            <line
              key={rl.region + "-div"}
              x1={rl.firstX - 6}
              y1={groundY - 30}
              x2={rl.firstX - 6}
              y2={groundY}
              stroke={rl.color}
              strokeWidth={0.5}
              opacity={0.18}
            />
          );
        })}

        {regionLabels.map(
          (rl) =>
            rl && (
              <text
                key={rl.region}
                x={rl.x}
                y={groundY + 20}
                textAnchor="middle"
                fill={rl.color}
                opacity={
                  activeRegion
                    ? activeRegion === rl.region
                      ? 0.8
                      : 0.12
                    : 0.35
                }
                fontSize={8}
                fontFamily="Space Mono, monospace"
                style={{ transition: "opacity 0.35s ease" }}
              >
                {rl.region.replace(" & ", "/").split(" ")[0]}
              </text>
            )
        )}

        {treePositions.map(({ country, x, y, scale, maxTrunkH, delay }) => {
          const dimmed = getTreeDimmed(country);
          const dimOpacity = focusedCountryCode ? 0.05 : 0.12;
          return (
            <Tree
              key={country.code}
              country={country}
              x={x}
              y={y}
              scale={scale}
              maxTrunkH={maxTrunkH}
              highlighted={isTreeHighlighted(country)}
              dimmed={dimmed}
              dimOpacity={dimOpacity}
              onHover={handleHover}
              onClick={onCountryClick}
              animationDelay={delay}
              highlightMetric={highlightMetric}
            />
          );
        })}
      </svg>

      {tooltip.country && (
        <CustomTooltip country={tooltip.country} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
}
