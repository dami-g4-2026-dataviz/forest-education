import { CountryData, REGION_COLORS } from "@/lib/educationData";
import { useState, useEffect } from "react";

interface TreeProps {
  country: CountryData;
  x: number;
  y: number;
  scale?: number;
  maxTrunkH?: number; // if provided, trunk height is derived from this (dense/poppyfield mode)
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
  maxTrunkH,
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

  const dense = !!maxTrunkH;

  // Trunk: height driven by maxTrunkH in dense mode, otherwise traditional formula
  const trunkH = dense
    ? (country.yearsInSchool / 16) * maxTrunkH
    : (country.yearsInSchool / 16) * 110 * scale;
  const trunkW = dense ? Math.max(2, 3.5 * scale) : Math.max(3, 5 * scale);

  // Canopy: small dot in dense mode, proportional blob in normal mode
  const canopyR = dense
    ? Math.max(3.5, (country.yearsInSchool / 16) * 16 * scale)
    : (country.yearsInSchool / 16) * 52 * scale;

  // Fewer layers in dense mode to avoid blur clutter
  const maxLayers = dense ? 2 : 5;
  const numLayers = Math.max(1, Math.round(1 + learningRatio * (maxLayers - 1)));

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
      {/* Root flare at base */}
      <ellipse
        cx={0}
        cy={0}
        rx={trunkW * 1.5}
        ry={trunkW * 0.45}
        fill={color}
        opacity={0.18 + learningRatio * 0.12}
      />

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

      {/* Trunk — tapered polygon (wider at base) */}
      <polygon
        points={`${-trunkW / 2},0 ${trunkW / 2},0 ${trunkW * 0.28},${-trunkH} ${-trunkW * 0.28},${-trunkH}`}
        fill={color}
        opacity={0.5 + learningRatio * 0.4}
        style={{
          filter: isActive ? `drop-shadow(0 0 ${glowSize}px ${color})` : "none",
          transition: "filter 0.2s ease",
        }}
      />

      {/* Side branches — sparse on all trees, denser on healthier ones */}
      {!dense && Array.from({ length: Math.round(1 + learningRatio * 2) }).map((_, i) => {
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

      {/* Bare spindly branches — crisis trees */}
      {!dense && learningRatio < 0.4 && (
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

      {/* Canopy layers — stacked organic blobs */}
      {Array.from({ length: numLayers }).map((_, i) => {
        const frac = numLayers > 1 ? i / (numLayers - 1) : 0;
        // Wider at the middle, narrowing toward top (natural deciduous silhouette)
        const widthPeak = 0.4;
        const widthShape = frac < widthPeak
          ? frac / widthPeak
          : 1 - (frac - widthPeak) / (1 - widthPeak);
        const rx = canopyR * (0.55 + widthShape * 0.45);
        const ry = rx * (0.58 + learningRatio * 0.1);
        const cy = -trunkH - canopyR * 0.2 - frac * canopyR * 0.95;
        const jx = dense ? 0 : (sr(seed + i * 13) - 0.5) * 6 * scale;
        const layerOpacity = (0.2 + learningRatio * 0.32) * (1 - frac * 0.12);
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
                ? { filter: `drop-shadow(0 0 ${glowSize * 0.55}px ${color})` }
                : undefined
            }
          />
        );
      })}

      {/* Satellite foliage clusters for healthy trees — gives organic crown shape */}
      {!dense && learningRatio > 0.5 && Array.from({ length: Math.round(learningRatio * 3) }).map((_, i) => {
        const angle = (sr(seed + i * 31) * Math.PI * 2);
        const dist = canopyR * (0.55 + sr(seed + i * 17) * 0.3);
        const clusterR = canopyR * (0.22 + sr(seed + i * 23) * 0.18);
        const cx = Math.cos(angle) * dist * 0.7;
        const cy = -trunkH - canopyR * 0.6 + Math.sin(angle) * dist * 0.45;
        return (
          <ellipse
            key={`cluster-${i}`}
            cx={cx}
            cy={cy}
            rx={clusterR}
            ry={clusterR * 0.72}
            fill={color}
            opacity={0.12 + learningRatio * 0.14}
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

      {/* Country code label — shown on hover in dense mode, always when scale large enough */}
      {(isActive || (!dense && scale > 0.7)) && (
        <text
          x={0}
          y={dense ? -trunkH - canopyR * 1.6 : 11}
          textAnchor="middle"
          fill={color}
          opacity={isActive ? 0.95 : 0.3}
          fontSize={dense ? Math.max(7, 9 * scale) : Math.max(6, 8 * scale)}
          fontFamily="Space Mono, monospace"
          style={{ transition: "opacity 0.2s", userSelect: "none", pointerEvents: "none" }}
        >
          {country.code}
        </text>
      )}
    </g>
  );
}
