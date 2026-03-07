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

interface RegionMean {
  region: Region;
  yearsInSchool: number;
  lays: number;
  learningPoverty: number;
  gpiPrimary: number;
  countryCount: number;
  color: string;
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

const AXIS_MAX_YEARS = 14;

function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

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
  const [regionTooltip, setRegionTooltip] = useState<{ region: RegionMean | null; x: number; y: number }>({ region: null, x: 0, y: 0 });
  const isMobile = dims.width < 768;

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

  const regionMeans = useMemo(() => {
    const regionGroups: Record<Region, CountryData[]> = {} as Record<Region, CountryData[]>;
    
    countries.forEach((c) => {
      if (!regionGroups[c.region]) {
        regionGroups[c.region] = [];
      }
      regionGroups[c.region].push(c);
    });

    return REGION_ORDER.map((region) => {
      const group = regionGroups[region] || [];
      if (group.length === 0) return null;
      
      const avgYearsInSchool = group.reduce((sum, c) => sum + c.yearsInSchool, 0) / group.length;
      const avgLays = group.reduce((sum, c) => sum + c.lays, 0) / group.length;
      const avgLearningPoverty = group.reduce((sum, c) => sum + c.learningPoverty, 0) / group.length;
      const avgGpi = group.reduce((sum, c) => sum + c.gpiPrimary, 0) / group.length;
      
      return {
        region,
        yearsInSchool: avgYearsInSchool,
        lays: avgLays,
        learningPoverty: avgLearningPoverty,
        gpiPrimary: avgGpi,
        countryCount: group.length,
        color: REGION_COLORS[region] ?? "#4ade80",
      };
    }).filter(Boolean) as RegionMean[];
  }, [countries]);

  const regionAsCountry = useMemo(() => {
    return regionMeans.map((r) => ({
      code: r.region.replace(/\s+/g, "_").toUpperCase(),
      name: r.region,
      region: r.region,
      yearsInSchool: r.yearsInSchool,
      lays: r.lays,
      learningPoverty: r.learningPoverty,
      gpiPrimary: r.gpiPrimary,
      countryCount: r.countryCount,
    } as CountryData & { countryCount: number }));
  }, [regionMeans]);

  const displayedCountries = useMemo(() => {
    if (activeRegion) {
      return countries
        .filter((c) => c.region === activeRegion)
        .sort((a, b) => a.lays - b.lays);
    }
    return regionAsCountry;
  }, [activeRegion, countries, regionAsCountry]);

  const layout = useMemo(() => {
    const containerWidth = dims.width;
    const height = dims.height;
    const groundY = Math.round(height * (isMobile ? 0.72 : 0.78));
    const marginL = isMobile ? 34 : 80;
    const marginR = isMobile ? 24 : 80;

    const n = displayedCountries.length;
    const svgWidth = containerWidth;
    const usableWidth = svgWidth - marginL - marginR;
    const spacing = usableWidth / Math.max(n, 1);

    const maxTrunkH = groundY * (isMobile ? 0.6 : 0.68);
    const baseScale = activeRegion ? (isMobile ? 0.72 : 1.0) : (isMobile ? 0.8 : 1.2);
    const scale = Math.max(baseScale, Math.min(isMobile ? 1.9 : 3.5, spacing / (isMobile ? 70 : 90)));

    return {
      positions: displayedCountries.map((country, i) => ({
        country,
        x: marginL + i * spacing + spacing / 2,
        y: groundY,
        scale,
        maxTrunkH,
        delay: i * 80 + 100,
      })),
      svgWidth,
      groundY,
      maxTrunkH,
    };
  }, [dims, displayedCountries, activeRegion, isMobile]);

  const { positions: treePositions, svgWidth, groundY } = layout;

  const handleHover = useCallback(
    (country: CountryData | null, x: number, y: number) => {
      setTooltip({ country, x, y });
    },
    []
  );

  const getTreeDimmed = (_country: CountryData) => {
    return false;
  };

  const isTreeHighlighted = (country: CountryData) => {
    return false;
  };

  const zoomParams = useMemo(() => {
    return { x: svgWidth / 2, scale: 1 };
  }, [svgWidth]);

  const treeLabels = useMemo(() => {
    return treePositions.map(({ country, x }) => ({
      label: activeRegion ? country.name : country.region,
      region: country.region,
      x,
      color: REGION_COLORS[country.region],
    }));
  }, [treePositions, activeRegion]);

  const guideTreeIndex = useMemo(() => {
    if (treePositions.length === 0) return -1;
    return Math.floor(treePositions.length / 2);
  }, [treePositions]);

  const yAxisTicks = useMemo(() => {
    const maxYears = AXIS_MAX_YEARS;
    const ticks = isMobile ? [0, 4, 8, 12] : [0, 2, 4, 6, 8, 10, 12, 14];
    const marginL = isMobile ? 34 : 80;
    const maxTrunkH = groundY * 0.68;
    
    return ticks.map((years) => {
      const normalizedHeight = years / maxYears;
      const pixelY = groundY - normalizedHeight * maxTrunkH;
      return { years, y: pixelY, x: marginL - 10 };
    });
  }, [groundY, isMobile]);

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
          <filter id="legendShadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(0,0,0,0.45)" />
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

        <rect
          data-tour="forest-y-axis"
          x={isMobile ? 2 : 6}
          y={groundY - groundY * 0.72 - 14}
          width={isMobile ? 36 : 72}
          height={groundY * 0.72 + 28}
          fill="transparent"
          pointerEvents="none"
        />

        <g>
          {/* Y-Axis */}
          <line
            x1={isMobile ? 28 : 70}
            y1={groundY}
            x2={isMobile ? 28 : 70}
            y2={groundY - groundY * 0.72}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={1}
          />

          {/* Y-Axis ticks and labels */}
          {yAxisTicks.map(({ years, y }) => (
            <g key={years}>
              <line
                x1={isMobile ? 24 : 65}
                y1={y}
                x2={isMobile ? 28 : 70}
                y2={y}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth={1}
              />
              <text
                x={isMobile ? 18 : 58}
                y={y + 4}
                textAnchor="end"
                fill="rgba(255, 255, 255, 0.4)"
                fontSize={isMobile ? 9 : 10}
                fontFamily="Space Mono, monospace"
              >
                {years}
              </text>
              <line
                x1={isMobile ? 28 : 70}
                y1={y}
                x2={svgWidth - 40}
                y2={y}
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth={1}
                strokeDasharray="4 8"
              />
            </g>
          ))}

          <text
            x={isMobile ? 14 : 20}
            y={groundY - groundY * 0.36}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.5)"
            fontSize={isMobile ? 9 : 11}
            fontFamily="Space Mono, monospace"
            transform={`rotate(-90, ${isMobile ? 14 : 20}, ${groundY - groundY * 0.36})`}
          >
            {isMobile ? "Years in school" : "Years in School (trunk height)"}
          </text>
        </g>

        <rect
          data-tour="forest-x-axis"
          x={svgWidth * 0.2}
          y={groundY + (isMobile ? 30 : 40)}
          width={svgWidth * 0.6}
          height={isMobile ? 26 : 30}
          fill="transparent"
          pointerEvents="none"
        />

        <g>
          <text
            x={svgWidth / 2}
            y={groundY + (isMobile ? 48 : 60)}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.4)"
            fontSize={isMobile ? 9 : 11}
            fontFamily="Space Mono, monospace"
          >
            {activeRegion 
              ? isMobile
                ? `${activeRegion} countries`
                : `Countries in ${activeRegion} (sorted by learning outcomes, low → high)`
              : isMobile
                ? "Regions by learning outcomes"
                : "Region (sorted by learning outcomes, low → high)"
            }
          </text>
        </g>

        {/* Legend box */}
        <g data-tour="forest-legend" transform={`translate(${isMobile ? 12 : 92}, ${isMobile ? 12 : 30})`}>
          <rect
            x={0}
            y={0}
            width={isMobile ? 156 : 202}
            height={isMobile ? 78 : 104}
            rx={12}
            fill="rgba(5, 11, 8, 0.94)"
            stroke="rgba(255, 255, 255, 0.14)"
            strokeWidth={1}
            filter="url(#legendShadow)"
          />
          <rect
            x={1}
            y={1}
            width={isMobile ? 154 : 200}
            height={isMobile ? 76 : 102}
            rx={11}
            fill="rgba(10, 18, 14, 0.82)"
            stroke="rgba(74, 222, 128, 0.08)"
            strokeWidth={1}
          />
          <text
            x={14}
            y={isMobile ? 21 : 24}
            fill="rgba(255, 255, 255, 0.82)"
            fontSize={isMobile ? 10 : 12}
            fontFamily="Space Mono, monospace"
            fontWeight={600}
          >
            How to read
          </text>
          
          {/* Trunk legend */}
          <rect x={14} y={isMobile ? 32 : 40} width={isMobile ? 6 : 7} height={isMobile ? 18 : 24} rx={3} fill="rgba(139, 90, 43, 0.85)" />
          <text x={isMobile ? 28 : 34} y={isMobile ? 44 : 55} fill="rgba(255, 255, 255, 0.72)" fontSize={isMobile ? 9 : 11} fontFamily="Space Mono, monospace">
            {isMobile ? "Trunk = enrolled" : "Trunk = Years enrolled"}
          </text>
          
          {/* Canopy legend */}
          <circle cx={18} cy={isMobile ? 60 : 82} r={isMobile ? 8 : 10} fill="var(--tree-healthy)" opacity={0.82} />
          <text x={isMobile ? 28 : 34} y={isMobile ? 64 : 86} fill="rgba(255, 255, 255, 0.72)" fontSize={isMobile ? 9 : 11} fontFamily="Space Mono, monospace">
            {isMobile ? "Canopy = learned" : "Canopy = Years learned"}
          </text>
        </g>

        {treeLabels.map((tl, i) => (
          (!isMobile || treeLabels.length <= 8 || i % 2 === 0 || activeRegion === null) && (
          <text
            key={`${tl.label}-${i}`}
            x={tl.x}
            y={groundY + (isMobile ? 28 : 36)}
            textAnchor="middle"
            fill={tl.color}
            opacity={0.7}
            fontSize={isMobile ? 8 : activeRegion ? 10 : 12}
            fontFamily="Space Mono, monospace"
            fontWeight={500}
            style={{ transition: "opacity 0.35s ease" }}
          >
            {activeRegion 
              ? (tl.label.length > 12 ? tl.label.slice(0, 10) + "…" : tl.label)
              : tl.label.replace("Latin America & Caribbean", "Latin America")
            }
          </text>
          )
        ))}

        {treePositions.map(({ country, x, y, scale, maxTrunkH, delay }, index) => {
          const dimmed = getTreeDimmed(country);
          const dimOpacity = focusedCountryCode ? 0.05 : 0.12;
          const trunkHeight = (country.yearsInSchool / AXIS_MAX_YEARS) * maxTrunkH;
          const canopyRadius = Math.max(8 * scale, (country.lays / 16) * 60 * scale);
          const seed = country.code.charCodeAt(0) * 31 + country.code.charCodeAt(1);
          const leanAngle = (sr(seed * 3) - 0.5) * 0.06;
          const trunkTipX = Math.sin(leanAngle) * trunkHeight;
          // Match the bright focal point in the canopy so the guide line
          // starts from the exact visual cue users should read.
          const canopyGuideX = x + trunkTipX;
          const canopyGuideY = y - trunkHeight;
          const canopyTopY = canopyGuideY - canopyRadius * 1.27;
          const labelY = canopyTopY - 18;
          const readHighlightTop = Math.min(y - trunkHeight, canopyTopY) - 28;
          const readHighlightHeight = y - readHighlightTop + 28;
          
          return (
            <g key={country.code}>
              {index === guideTreeIndex && (
                <>
                  <rect
                    data-tour="forest-read"
                    x={x - canopyRadius - 20}
                    y={readHighlightTop}
                    width={canopyRadius * 2 + 40}
                    height={readHighlightHeight}
                    fill="transparent"
                    pointerEvents="none"
                  />
                  <rect
                    data-tour="forest-read-canopy-top"
                    x={canopyGuideX - 2}
                    y={canopyGuideY - 2}
                    width={4}
                    height={4}
                    fill="transparent"
                    pointerEvents="none"
                  />
                </>
              )}
              <Tree
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
                zoomScale={zoomParams.scale}
              />
              <g data-tour={index === guideTreeIndex ? "forest-lays-label" : undefined}>
                <text
                  x={x}
                  y={labelY}
                  textAnchor="middle"
                  fill={REGION_COLORS[country.region]}
                  opacity={dimmed ? 0.2 : 0.9}
                  fontSize={isMobile ? 10 : 13}
                  fontFamily="Space Mono, monospace"
                  fontWeight={700}
                  style={{ transition: "opacity 0.35s ease" }}
                >
                  {country.lays.toFixed(1)}
                </text>
                {!isMobile && (
                  <text
                    x={x}
                    y={labelY + 12}
                    textAnchor="middle"
                    fill="rgba(255, 255, 255, 0.4)"
                    opacity={dimmed ? 0.15 : 0.6}
                    fontSize={9}
                    fontFamily="Space Mono, monospace"
                    style={{ transition: "opacity 0.35s ease" }}
                  >
                    yrs learned
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </svg>

      {tooltip.country && (
        <CustomTooltip country={tooltip.country} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
}
