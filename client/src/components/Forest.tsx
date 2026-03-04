import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { countries, CountryData, REGION_COLORS, Region } from "@/lib/educationData";
import Tree from "./Tree";
import Tooltip from "./Tooltip";

interface ForestProps {
  highlightMetric: string | null;
  activeRegion: Region | null;
  onCountryClick: (country: CountryData) => void;
  chapterId: number;
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

function layoutTrees(containerWidth: number, height: number) {
  // Ground is at 85% of height — trees grow upward into the sky
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

  // Height-driven scale: tallest tree fills ~70% of the sky above ground
  const scaleByHeight = (groundY * 0.70) / ((14 / 16) * 110);

  // Each tree needs at least 60px so canopies are readable and labels visible
  // canopyR = (avgYrs/16)*52*scale ≈ 35.75*scale; diameter ≈ 71.5*scale
  // At scale ≈ 0.8 and spacing 60px, canopies just touch — a natural "forest" look
  const minSpacingPx = 60;
  const minSvgWidth = n * minSpacingPx + marginL + marginR;
  const svgWidth = Math.max(containerWidth, minSvgWidth);

  const usableWidth = svgWidth - marginL - marginR;
  const spacing = usableWidth / n;

  // Width-driven scale: canopy diameter ≤ spacing
  // avgYrs ≈ 11 → canopyR ≈ 35.75*scale, we want 2*canopyR ≈ spacing*0.9
  const scaleByWidth = (spacing * 0.9) / (35.75 * 2);
  const scale = Math.max(0.6, Math.min(2.5, Math.min(scaleByHeight, scaleByWidth)));

  return {
    positions: sorted.map((country, i) => ({
      country,
      x: marginL + i * spacing + spacing / 2,
      y: groundY,
      scale,
      delay: i * 22 + 150,
    })),
    svgWidth,
    groundY,
  };
}

// Deterministic star positions (enough for wide canvases)
const STARS = Array.from({ length: 250 }, (_, i) => ({
  x: (i * 137.508) % 100,
  y: (i * 97.31) % 70,
  r: 0.3 + (i % 4) * 0.3,
  opacity: 0.08 + (i % 6) * 0.07,
}));

export default function Forest({
  highlightMetric,
  activeRegion,
  onCountryClick,
  chapterId,
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

  const layout = useMemo(() => layoutTrees(dims.width, dims.height), [dims]);
  const { positions: treePositions, svgWidth, groundY } = layout;

  const handleHover = useCallback(
    (country: CountryData | null, x: number, y: number) => {
      setTooltip({ country, x, y });
    },
    []
  );

  const isTreeDimmed = (country: CountryData) =>
    !!(activeRegion && country.region !== activeRegion);

  const isTreeHighlighted = (country: CountryData) => {
    if (chapterId === 2 && country.learningPoverty > 70) return true;
    if (chapterId === 3 && country.lays < 4) return true;
    if (chapterId === 4 && country.gpiPrimary < 0.85) return true;
    return false;
  };

  // Region label positions
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
    <div ref={containerRef} className="relative w-full h-full select-none overflow-x-auto">
      <svg width={svgWidth} height={dims.height} style={{ display: "block", minWidth: svgWidth }}>
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

        {/* Sky */}
        <rect width={svgWidth} height={dims.height} fill="url(#skyGrad)" />
        {/* Moon ambient glow */}
        <rect width={svgWidth} height={dims.height} fill="url(#moonGlow)" />

        {/* Stars */}
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

        {/* Fog band — sits at canopy level */}
        <rect
          x={-svgWidth * 0.1}
          y={groundY - 200}
          width={svgWidth * 1.2}
          height={60}
          fill="rgba(74, 222, 128, 0.018)"
          filter="url(#fogBlur)"
        />

        {/* Ground fill */}
        <rect
          x={0}
          y={groundY}
          width={svgWidth}
          height={dims.height - groundY}
          fill="url(#groundGrad)"
        />

        {/* Ground line */}
        <line
          x1={0}
          y1={groundY}
          x2={svgWidth}
          y2={groundY}
          stroke="rgba(74, 222, 128, 0.14)"
          strokeWidth={1}
        />

        {/* Region divider lines */}
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

        {/* Region labels below ground */}
        {regionLabels.map(
          (rl) =>
            rl && (
              <text
                key={rl.region}
                x={rl.x}
                y={groundY + 22}
                textAnchor="middle"
                fill={rl.color}
                opacity={
                  activeRegion
                    ? activeRegion === rl.region
                      ? 0.8
                      : 0.12
                    : 0.35
                }
                fontSize={9}
                fontFamily="Space Mono, monospace"
                style={{ transition: "opacity 0.35s ease" }}
              >
                {rl.region.replace(" & ", "/").split(" ")[0]}
              </text>
            )
        )}

        {/* Trees */}
        {treePositions.map(({ country, x, y, scale, delay }) => (
          <Tree
            key={country.code}
            country={country}
            x={x}
            y={y}
            scale={scale}
            highlighted={isTreeHighlighted(country)}
            dimmed={isTreeDimmed(country)}
            onHover={handleHover}
            onClick={onCountryClick}
            animationDelay={delay}
            highlightMetric={highlightMetric}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip.country && (
        <Tooltip country={tooltip.country} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
}
