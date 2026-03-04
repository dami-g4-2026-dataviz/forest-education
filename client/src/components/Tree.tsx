import { CountryData, REGION_COLORS } from "@/lib/educationData";
import { useState, useEffect } from "react";

interface TreeProps {
  country: CountryData;
  x: number;
  y: number;
  scale?: number;
  highlighted?: boolean;
  dimmed?: boolean;
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

// Seeded pseudo-random for deterministic jitter
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function Tree({
  country,
  x,
  y,
  scale = 1,
  highlighted = false,
  dimmed = false,
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

  // Trunk: height proportional to years in school
  const trunkH = (country.yearsInSchool / 16) * 110 * scale;
  const trunkW = Math.max(3, 5 * scale);

  // Canopy: radius proportional to years in school, density to learning ratio
  const canopyR = (country.yearsInSchool / 16) * 52 * scale;

  // Number of canopy layers (1 = bare, 5 = lush)
  const numLayers = Math.max(1, Math.round(1 + learningRatio * 4));

  const seed = country.code.charCodeAt(0) * 31 + country.code.charCodeAt(1);
  const opacity = dimmed ? 0.15 : 1;
  const glowSize = isActive ? 18 : highlighted ? 12 : learningRatio > 0.75 ? 7 : 2;

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
      {/* Ground glow for healthy trees */}
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

      {/* Trunk */}
      <rect
        x={-trunkW / 2}
        y={-trunkH}
        width={trunkW}
        height={trunkH}
        rx={trunkW / 2}
        fill={color}
        opacity={0.5 + learningRatio * 0.4}
        style={{
          filter: isActive ? `drop-shadow(0 0 ${glowSize}px ${color})` : "none",
          transition: "filter 0.2s ease",
        }}
      />

      {/* Bare branches for low-learning trees */}
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
              strokeWidth={trunkW * 0.35}
              opacity={0.25 + learningRatio * 0.25}
              strokeLinecap="round"
            />
          ))}
        </>
      )}

      {/* Canopy layers — stacked, each slightly smaller and higher */}
      {Array.from({ length: numLayers }).map((_, i) => {
        const frac = numLayers > 1 ? i / (numLayers - 1) : 0;
        const rx = canopyR * (1 - frac * 0.42);
        const ry = rx * 0.62;
        const cy = -trunkH - canopyR * 0.3 - frac * canopyR * 0.8;
        const jx = (sr(seed + i * 13) - 0.5) * 5 * scale;
        const layerOpacity =
          (0.22 + learningRatio * 0.32) * (1 - frac * 0.15);
        const isTopLayer = i === numLayers - 1;

        return (
          <ellipse
            key={i}
            cx={jx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={color}
            opacity={layerOpacity}
            style={
              isTopLayer && learningRatio > 0.65
                ? {
                    filter: `drop-shadow(0 0 ${glowSize * 0.55}px ${color})`,
                  }
                : undefined
            }
          />
        );
      })}

      {/* Hover ring on ground */}
      {isActive && (
        <ellipse
          cx={0}
          cy={0}
          rx={Math.max(canopyR * 0.4, 10)}
          ry={4 * scale}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.45}
        />
      )}

      {/* Country code label */}
      {scale > 0.7 && (
        <text
          x={0}
          y={11}
          textAnchor="middle"
          fill={color}
          opacity={isActive ? 0.9 : 0.3}
          fontSize={Math.max(6, 8 * scale)}
          fontFamily="Space Mono, monospace"
          style={{ transition: "opacity 0.2s", userSelect: "none" }}
        >
          {country.code}
        </text>
      )}
    </g>
  );
}
