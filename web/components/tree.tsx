"use client";

import { useState, useEffect } from "react";
import type { CountryData } from "@/lib/types";
import { REGION_COLORS } from "@/lib/constants";

interface TreeProps {
  country: CountryData;
  x: number;
  y: number;
  scale?: number;
  maxTrunkH?: number;
  highlighted?: boolean;
  dimmed?: boolean;
  dimOpacity?: number;
  showLabel?: boolean;
  onHover?: (country: CountryData | null, x: number, y: number) => void;
  onClick?: (country: CountryData) => void;
  animationDelay?: number;
  highlightMetric?: string | null;
}

function getTreeColor(country: CountryData, highlightMetric: string | null): string {
  const regionColor = REGION_COLORS[country.region];
  if (!highlightMetric) return regionColor;

  if (highlightMetric === "learningPoverty") {
    if (country.learningPoverty > 70) return "#EF4444";
    if (country.learningPoverty > 40) return "#F97316";
    if (country.learningPoverty > 20) return "#EAB308";
    return "#4ADE80";
  }
  if (highlightMetric === "lays") {
    if (country.lays < 4) return "#EF4444";
    if (country.lays < 7) return "#F97316";
    if (country.lays < 10) return "#EAB308";
    return "#4ADE80";
  }
  if (highlightMetric === "enrollment") {
    if (country.enrollmentRate < 70) return "#EF4444";
    if (country.enrollmentRate < 85) return "#F97316";
    if (country.enrollmentRate < 95) return "#EAB308";
    return "#4ADE80";
  }
  if (highlightMetric === "gender") {
    if (country.gpiPrimary < 0.85) return "#EF4444";
    if (country.gpiPrimary < 0.95) return "#F97316";
    if (country.gpiPrimary > 1.1) return "#06B6D4";
    return "#4ADE80";
  }
  return regionColor;
}

function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function Tree({
  country,
  x,
  y,
  scale = 1,
  maxTrunkH,
  highlighted = false,
  dimmed = false,
  dimOpacity,
  showLabel = false,
  onHover,
  onClick,
  animationDelay = 0,
  highlightMetric = null,
}: TreeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), animationDelay);
    return () => clearTimeout(t);
  }, [animationDelay]);

  const color = getTreeColor(country, highlightMetric);
  const learningRatio = Math.min(1, country.lays / Math.max(1, country.yearsInSchool));
  const isActive = isHovered || highlighted;

  const trunkH = maxTrunkH
    ? (country.yearsInSchool / 16) * maxTrunkH
    : (country.yearsInSchool / 16) * 110 * scale;
  const trunkW = Math.max(3, 5 * scale);

  const canopyR = (country.lays / 16) * 60 * scale;

  const seed = country.code.charCodeAt(0) * 31 + country.code.charCodeAt(1);
  const opacity = dimmed ? (dimOpacity ?? 0.15) : 1;
  const glowSize = isActive ? 18 : highlighted ? 12 : learningRatio > 0.75 ? 7 : 2;

  const numClusters = Math.max(1, Math.round((2 + sr(seed) * 2) + learningRatio * 6));

  if (!mounted) return null;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ opacity, cursor: "pointer", transition: "opacity 0.4s ease" }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
        onHover?.(country, rect.left + rect.width / 2, rect.top);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHover?.(null, 0, 0);
      }}
      onClick={() => onClick?.(country)}
    >
      <ellipse
        cx={0}
        cy={0}
        rx={trunkW * 1.5}
        ry={trunkW * 0.45}
        fill={color}
        opacity={0.18 + learningRatio * 0.12}
      />

      {learningRatio > 0.55 && (
        <ellipse
          cx={0}
          cy={2}
          rx={canopyR * 0.75}
          ry={6 * scale}
          fill={color}
          opacity={0.04 + learningRatio * 0.07}
        />
      )}

      <polygon
        points={`${-trunkW / 2},0 ${trunkW / 2},0 ${trunkW * 0.28},${-trunkH} ${-trunkW * 0.28},${-trunkH}`}
        fill={color}
        opacity={0.65 + learningRatio * 0.35}
        style={{
          filter: isActive ? `drop-shadow(0 0 ${glowSize}px ${color})` : "none",
          transition: "filter 0.2s ease",
        }}
      />

      {Array.from({ length: Math.round(1 + learningRatio * 2) }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const heightFrac = 0.45 + i * 0.15;
        const branchY = -trunkH * heightFrac;
        const branchLen = canopyR * (0.28 + learningRatio * 0.18);
        const angle = side * (0.55 + sr(seed + i * 7) * 0.25);
        return (
          <line
            key={`branch-${i}`}
            x1={0}
            y1={branchY}
            x2={Math.sin(angle) * branchLen}
            y2={branchY - Math.cos(angle * 0.6) * branchLen * 0.5}
            stroke={color}
            strokeWidth={trunkW * (0.3 - i * 0.06)}
            opacity={0.3 + learningRatio * 0.3}
            strokeLinecap="round"
          />
        );
      })}

      {learningRatio < 0.4 && (
        <>
          {[
            [-1.1, -0.55],
            [1.0, -0.5],
            [-0.75, -0.75],
            [0.85, -0.72],
          ].map(([dx, dy], i) => (
            <line
              key={i}
              x1={0}
              y1={-trunkH * 0.82}
              x2={dx * canopyR * 0.55}
              y2={-trunkH * 0.82 + dy * canopyR * 0.45}
              stroke={color}
              strokeWidth={trunkW * 0.28}
              opacity={0.2 + learningRatio * 0.2}
              strokeLinecap="round"
            />
          ))}
        </>
      )}

      <g
        style={{
          filter: `drop-shadow(0 0 ${isActive ? 8 : 4}px ${color}${isActive ? "80" : "40"})`,
          transition: "filter 0.3s ease",
        }}
      >
        <circle
          cx={0}
          cy={-trunkH - canopyR * 0.2}
          r={canopyR * 0.75}
          fill={color}
          opacity={0.2 + learningRatio * 0.4}
        />

        {Array.from({ length: numClusters }).map((_, i) => {
          const angle = sr(seed + i * 13) * Math.PI * 2;
          const dist = canopyR * (0.3 + sr(seed + i * 19) * 0.3);
          const r = canopyR * (0.3 + sr(seed + i * 23) * 0.2);
          const cx = Math.cos(angle) * dist;
          const cy = -trunkH - canopyR * 0.3 + Math.sin(angle) * dist * 0.7;

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill={color}
              opacity={(0.15 + learningRatio * 0.3) * (1 - i * 0.05)}
            />
          );
        })}
      </g>

      {(isActive || showLabel) && (
        <text
          x={0}
          y={14}
          textAnchor="middle"
          fill={color}
          opacity={isActive ? 0.95 : 0.6}
          fontSize={Math.max(6, 8 * scale)}
          fontWeight="bold"
          fontFamily="Space Mono, monospace"
          style={{ transition: "opacity 0.2s", userSelect: "none", pointerEvents: "none" }}
        >
          {country.code}
        </text>
      )}
    </g>
  );
}
