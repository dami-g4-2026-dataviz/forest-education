import { CountryData, REGION_COLORS } from "@/lib/educationData";
import { useState, useEffect } from "react";

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
  zoomScale?: number;
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
  dimOpacity,
  showLabel = false,
  onHover,
  onClick,
  animationDelay = 0,
  highlightMetric = null,
  zoomScale = 1,
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

  // Canopy base radius driven by LAYS — minimum ensures crisis trees are visible
  const canopyR = Math.max(8 * scale, (country.lays / 16) * 60 * scale);

  const seed = country.code.charCodeAt(0) * 31 + country.code.charCodeAt(1);
  const opacity = dimmed ? (dimOpacity ?? 0.15) : 1;

  // Subtle trunk lean — organic feel without breaking the tree metaphor
  const leanAngle = (sr(seed * 3) - 0.5) * 0.06; // ±3 degrees max
  const trunkTipX = Math.sin(leanAngle) * trunkH;

  // Number of foliage petal clusters — more for healthier trees; doubled at high zoom
  const basePetals = Math.max(4, Math.round(4 + learningRatio * 5));
  const numPetals = zoomScale >= 3 ? basePetals * 2 : basePetals;

  // Canopy center (top of trunk, accounting for lean)
  const canopyCX = trunkTipX;
  const canopyCY = -trunkH;

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
        rx={trunkW * 1.8}
        ry={trunkW * 0.5}
        fill={color}
        opacity={0.15 + learningRatio * 0.1}
      />

      {/* Trunk — tapered polygon with slight lean */}
      <polygon
        points={`${-trunkW / 2},0 ${trunkW / 2},0 ${trunkTipX + trunkW * 0.22},${-trunkH} ${trunkTipX - trunkW * 0.22},${-trunkH}`}
        fill={color}
        opacity={0.55 + learningRatio * 0.45}
        style={{
          filter: isActive ? `drop-shadow(0 0 6px ${color})` : "none",
          transition: "filter 0.2s ease",
        }}
      />

      {/* Side branches — follow the trunk lean */}
      {Array.from({ length: Math.round(1 + learningRatio * 2) }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const heightFrac = 0.45 + i * 0.15;
        const branchBaseX = trunkTipX * heightFrac;
        const branchY = -trunkH * heightFrac;
        const branchLen = canopyR * (0.28 + learningRatio * 0.18);
        const angle = side * (0.55 + sr(seed + i * 7) * 0.25);
        return (
          <line
            key={`branch-${i}`}
            x1={branchBaseX}
            y1={branchY}
            x2={branchBaseX + Math.sin(angle) * branchLen}
            y2={branchY - Math.cos(angle * 0.6) * branchLen * 0.5}
            stroke={color}
            strokeWidth={trunkW * (0.3 - i * 0.06)}
            opacity={0.3 + learningRatio * 0.3}
            strokeLinecap="round"
          />
        );
      })}

      {/* Bare spindly branches for crisis trees — heavier at high zoom */}
      {learningRatio < 0.4 && (
        <>
          {[[-1.1, -0.55], [1.0, -0.5], [-0.75, -0.75], [0.85, -0.72]].map(([dx, dy], i) => (
            <line
              key={i}
              x1={trunkTipX * 0.82}
              y1={-trunkH * 0.82}
              x2={trunkTipX * 0.82 + dx * canopyR * 0.55}
              y2={-trunkH * 0.82 + dy * canopyR * 0.45}
              stroke={color}
              strokeWidth={trunkW * (zoomScale >= 3 ? 0.55 : 0.28)}
              opacity={zoomScale >= 3 ? 0.55 + learningRatio * 0.2 : 0.2 + learningRatio * 0.2}
              strokeLinecap="round"
            />
          ))}
        </>
      )}

      {/* === CANOPY: Organic radial petal clusters (poppyfield-inspired) === */}
      <g
        style={{
          transition: "filter 0.3s ease",
        }}
      >
        {/* Layer 1: Outer ambient halo — wide, very soft */}
        <circle
          cx={canopyCX}
          cy={canopyCY - canopyR * 0.1}
          r={canopyR * 1.35}
          fill={color}
          opacity={0.04 + learningRatio * 0.06}
          style={{ filter: `blur(${canopyR * 0.4}px)` }}
        />

        {/* Layer 2: Radial petal clusters — deliberately arranged like flower petals */}
        {Array.from({ length: numPetals }).map((_, i) => {
          // Bias upward: petals mostly in upper half, slight spread downward
          const baseAngle = (i / numPetals) * Math.PI * 2;
          const angleJitter = (sr(seed + i * 17) - 0.5) * 0.4;
          const angle = baseAngle + angleJitter;

          // Distance from center: varies per petal for organic feel
          const distFrac = 0.3 + sr(seed + i * 11) * 0.35;
          const dist = canopyR * distFrac;

          // Petal size: outer petals slightly smaller
          const petalR = canopyR * (0.38 + sr(seed + i * 23) * 0.22 - distFrac * 0.15);

          // Vertical bias — shift cluster center upward
          const px = canopyCX + Math.cos(angle) * dist;
          const py = canopyCY - canopyR * 0.15 + Math.sin(angle) * dist * 0.8;

          const petalOpacity = (0.18 + learningRatio * 0.28) * (1 - i * 0.03);

          return (
            <circle
              key={`petal-${i}`}
              cx={px}
              cy={py}
              r={Math.max(2, petalR)}
              fill={color}
              opacity={petalOpacity}
            />
          );
        })}

        {/* Layer 3: Dense inner core — the "heart" of the canopy */}
        <circle
          cx={canopyCX}
          cy={canopyCY - canopyR * 0.05}
          r={canopyR * 0.52}
          fill={color}
          opacity={0.3 + learningRatio * 0.35}
        />

        {/* Layer 4: Bright focal point — like poppyfield's stamen center */}
        {learningRatio > 0.25 && (
          <circle
            cx={canopyCX}
            cy={canopyCY - canopyR * 0.08}
            r={canopyR * 0.18}
            fill={color}
            opacity={0.6 + learningRatio * 0.4}
            style={{
              filter: isActive
                ? `drop-shadow(0 0 ${12}px ${color}) drop-shadow(0 0 ${24}px ${color}80)`
                : `drop-shadow(0 0 ${4 + learningRatio * 8}px ${color}90)`,
              transition: "filter 0.3s ease",
            }}
          />
        )}

        {/* Hover/highlight glow ring around canopy */}
        {isActive && (
          <circle
            cx={canopyCX}
            cy={canopyCY - canopyR * 0.1}
            r={canopyR * 1.1}
            fill="none"
            stroke={color}
            strokeWidth={1}
            opacity={0.25}
            style={{ filter: `blur(2px)` }}
          />
        )}
      </g>

      {/* Country code label */}
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
