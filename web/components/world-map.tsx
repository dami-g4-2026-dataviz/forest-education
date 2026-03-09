"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ZoomIn, ZoomOut, Locate } from "lucide-react";
import type { Region, CountryData } from "@/lib/types";
import { BRIGHT_REGION_COLORS, REGION_ABBR } from "@/lib/constants";

interface WorldMapProps {
  countries: CountryData[];
  highlightedRegion?: Region | null;
  onRegionHover?: (region: Region | null) => void;
  onCountryHover?: (country: CountryData | null) => void;
  onCountryClick?: (country: CountryData) => void;
}

interface GeoFeature {
  type: "Feature";
  properties: {
    ISO3_CODE: string;
    NAME_ENGL: string;
    CNTR_ID: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJSON {
  type: "FeatureCollection";
  features: GeoFeature[];
}

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 600;
const MAP_OFFSET_Y = 80; // Shift map down to show Scandinavia
const MERCATOR_MAX_LAT = 85.05112878;
const MAP_BACKGROUND_PADDING_X = 420;
const MAP_BACKGROUND_PADDING_Y = 360;
const MAP_BOUNDS = {
  minX: -MAP_BACKGROUND_PADDING_X,
  maxX: MAP_WIDTH + MAP_BACKGROUND_PADDING_X,
  minY: -MAP_BACKGROUND_PADDING_Y,
  maxY: MAP_HEIGHT + MAP_BACKGROUND_PADDING_Y,
};

// Mercator projection functions
function mercatorX(lon: number): number {
  return ((lon + 180) / 360) * MAP_WIDTH;
}

function mercatorY(lat: number): number {
  // Clamp near the poles to avoid Mercator singularities that stretch
  // Antarctica and the top of Greenland into long wedges.
  const clampedLat = Math.max(-MERCATOR_MAX_LAT, Math.min(MERCATOR_MAX_LAT, lat));
  const latRad = (clampedLat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = MAP_HEIGHT / 2 - (MAP_WIDTH * mercN) / (2 * Math.PI) + MAP_OFFSET_Y;
  return y;
}

function projectCoordinates(coords: number[][]): string {
  return coords
    .map(([lon, lat]) => {
      const x = mercatorX(lon);
      const y = mercatorY(lat);
      return `${x},${y}`;
    })
    .join(" L ");
}

function featureToPath(geometry: GeoFeature["geometry"]): string {
  if (geometry.type === "Polygon") {
    const coords = geometry.coordinates as number[][][];
    return coords.map((ring) => `M ${projectCoordinates(ring)} Z`).join(" ");
  } else if (geometry.type === "MultiPolygon") {
    const coords = geometry.coordinates as number[][][][];
    return coords
      .map((polygon) =>
        polygon.map((ring) => `M ${projectCoordinates(ring)} Z`).join(" ")
      )
      .join(" ");
  }
  return "";
}

function clampViewBoxToBounds(viewBox: { x: number; y: number; w: number; h: number }) {
  const maxX = MAP_BOUNDS.maxX - viewBox.w;
  const maxY = MAP_BOUNDS.maxY - viewBox.h;

  return {
    ...viewBox,
    x: Math.min(Math.max(viewBox.x, MAP_BOUNDS.minX), maxX),
    y: Math.min(Math.max(viewBox.y, MAP_BOUNDS.minY), maxY),
  };
}

const GEOJSON_URL =
  "https://gisco-services.ec.europa.eu/distribution/v2/countries/geojson/CNTR_RG_60M_2024_4326.geojson";

// LAYS-based color gradient: red (low) → amber (mid) → green (high)
const LAYS_MIN = 2;
const LAYS_MAX = 13;

function laysToColor(lays: number): string {
  const t = Math.max(0, Math.min(1, (lays - LAYS_MIN) / (LAYS_MAX - LAYS_MIN)));
  let r: number, g: number, b: number;
  if (t < 0.5) {
    const s = t * 2;
    r = 255;
    g = Math.round(61 + s * (179 - 61));
    b = Math.round(46 + s * (71 - 46));
  } else {
    const s = (t - 0.5) * 2;
    r = Math.round(255 - s * (255 - 74));
    g = Math.round(179 + s * (222 - 179));
    b = Math.round(71 + s * (128 - 71));
  }
  return `rgb(${r},${g},${b})`;
}

export default function WorldMap({
  countries,
  highlightedRegion,
  onRegionHover,
  onCountryHover,
  onCountryClick,
}: WorldMapProps) {
  const [geoData, setGeoData] = useState<GeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<CountryData[]>([]);
  const [colorMode, setColorMode] = useState<"lays" | "region">("lays");
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  
  // Pan and zoom state
  const [viewBox, setViewBox] = useState({ x: -50, y: 40, w: MAP_WIDTH + 100, h: MAP_HEIGHT - 60 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const defaultViewBox = { x: -50, y: 40, w: MAP_WIDTH + 100, h: MAP_HEIGHT - 60 };

  const countryLookup = useMemo(() => {
    const map = new Map<string, CountryData>();
    countries.forEach((c) => map.set(c.code, c));
    return map;
  }, [countries]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.region.toLowerCase().includes(query)
    ).slice(0, 8);
    setSearchResults(results);
  }, [searchQuery, countries]);

  const handleSearchSelect = useCallback((country: CountryData) => {
    setSearchQuery("");
    setShowSearch(false);
    setSearchResults([]);
    setHoveredCountry(country.code);
    onCountryClick?.(country);
  }, [onCountryClick]);

  // Zoom functions
  const handleZoom = useCallback((factor: number) => {
    setViewBox((prev) => {
      const newW = prev.w * factor;
      const newH = prev.h * factor;
      const minW = 200;
      const maxW = (MAP_WIDTH + 100) * 2;
      if (newW < minW || newW > maxW) return prev;
      const cx = prev.x + prev.w / 2;
      const cy = prev.y + prev.h / 2;
      return clampViewBoxToBounds({
        x: cx - newW / 2,
        y: cy - newH / 2,
        w: newW,
        h: newH,
      });
    });
  }, []);

  const handleReset = useCallback(() => {
    setViewBox(defaultViewBox);
  }, []);

  // Pan handlers
  const handlePanStart = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    setPanStart({ x: clientX, y: clientY });
  }, []);

  const handlePanMove = useCallback((clientX: number, clientY: number) => {
    if (!isPanning || !svgRef.current) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const dx = (panStart.x - clientX) * scaleX;
    const dy = (panStart.y - clientY) * scaleY;
    setViewBox((prev) =>
      clampViewBoxToBounds({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      })
    );
    setPanStart({ x: clientX, y: clientY });
  }, [isPanning, panStart, viewBox.w, viewBox.h]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Mouse events for pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      handlePanStart(e.clientX, e.clientY);
    }
  }, [handlePanStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handlePanMove(e.clientX, e.clientY);
  }, [handlePanMove]);

  const handleMouseUp = useCallback(() => {
    handlePanEnd();
  }, [handlePanEnd]);

  // Touch events for mobile pan
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handlePanStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handlePanMove]);

  const handleTouchEnd = useCallback(() => {
    handlePanEnd();
  }, [handlePanEnd]);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    handleZoom(factor);
  }, [handleZoom]);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then((data: GeoJSON) => {
        setGeoData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load GeoJSON:", err);
        setLoading(false);
      });
  }, []);

  const handleMouseEnter = useCallback(
    (iso3: string) => {
      setHoveredCountry(iso3);
      const country = countryLookup.get(iso3);
      if (country) {
        onCountryHover?.(country);
        onRegionHover?.(country.region);
      }
    },
    [countryLookup, onCountryHover, onRegionHover]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredCountry(null);
    onCountryHover?.(null);
  }, [onCountryHover]);

  const handleClick = useCallback(
    (iso3: string) => {
      const country = countryLookup.get(iso3);
      if (country) {
        onCountryClick?.(country);
      }
    },
    [countryLookup, onCountryClick]
  );

  const handleRegionClick = useCallback((region: Region) => {
    setActiveRegion((prev) => (prev === region ? null : region));
  }, []);

  const countryPaths = useMemo(() => {
    if (!geoData) return [];

    return geoData.features.map((feature) => {
      const iso3 = feature.properties.ISO3_CODE;
      const country = countryLookup.get(iso3);
      const path = featureToPath(feature.geometry);

      return {
        iso3,
        name: feature.properties.NAME_ENGL,
        path,
        country,
        region: country?.region ?? null,
        laysColor: country ? laysToColor(country.lays) : null,
        regionColor: country ? BRIGHT_REGION_COLORS[country.region] : null,
      };
    });
  }, [geoData, countryLookup]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: "#0a1612" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-t-transparent rounded-full"
          style={{ borderColor: "var(--tree-healthy)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      data-tour="map-pan"
      className="w-full h-full relative overflow-hidden touch-none" 
      style={{ background: "#0a1612" }}
    >
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <defs>
          <filter id="countryGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="countryHoverGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d1f1a" />
            <stop offset="50%" stopColor="#0a1612" />
            <stop offset="100%" stopColor="#081410" />
          </linearGradient>
        </defs>

        {/* Ocean */}
        <rect
          x={MAP_BOUNDS.minX}
          y={MAP_BOUNDS.minY}
          width={MAP_BOUNDS.maxX - MAP_BOUNDS.minX}
          height={MAP_BOUNDS.maxY - MAP_BOUNDS.minY}
          fill="url(#oceanGradient)"
        />

        {/* Grid lines */}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const y = mercatorY(lat);
          return (
            <g key={`lat-${lat}`}>
              <line
                x1={MAP_BOUNDS.minX}
                y1={y}
                x2={MAP_BOUNDS.maxX}
                y2={y}
                stroke="rgba(74, 222, 128, 0.08)"
                strokeWidth="1"
                strokeDasharray="8 12"
              />
              <text
                x="12"
                y={y - 6}
                fill="rgba(74, 222, 128, 0.25)"
                fontSize="10"
                fontFamily="Space Mono, monospace"
              >
                {lat}°
              </text>
            </g>
          );
        })}

        {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => {
          const x = mercatorX(lon);
          return (
            <line
              key={`lon-${lon}`}
              x1={x}
              y1={MAP_BOUNDS.minY}
              x2={x}
              y2={MAP_BOUNDS.maxY}
              stroke="rgba(74, 222, 128, 0.06)"
              strokeWidth="1"
              strokeDasharray="8 12"
            />
          );
        })}

        {/* Countries */}
        <g>
          {countryPaths.map(({ iso3, name, path, country, region, laysColor, regionColor }) => {
            const isHovered = hoveredCountry === iso3;
            // Merge external highlightedRegion (from forest hover) with local activeRegion filter
            const effectiveRegion = activeRegion ?? highlightedRegion ?? null;
            const isInHighlightedRegion = effectiveRegion && region === effectiveRegion;
            const isAnyRegionHighlighted = effectiveRegion !== null;
            const hasData = country !== undefined;
            const color = colorMode === "region" ? regionColor : laysColor;

            let fillColor = "#1a2a25";
            let fillOpacity = 0.8;
            let strokeColor = "rgba(74, 222, 128, 0.15)";
            let strokeWidth = 0.5;

            if (hasData && color) {
              fillColor = color;
              fillOpacity = isHovered ? 1 : isInHighlightedRegion ? 0.9 : isAnyRegionHighlighted ? 0.3 : 0.75;
              strokeColor = isHovered ? "#fff" : isInHighlightedRegion ? color : "rgba(255,255,255,0.2)";
              strokeWidth = isHovered ? 2 : isInHighlightedRegion ? 1 : 0.5;
            } else {
              fillOpacity = isAnyRegionHighlighted ? 0.2 : 0.5;
              strokeColor = "rgba(74, 222, 128, 0.1)";
            }

            return (
              <motion.path
                key={iso3}
                d={path}
                fill={fillColor}
                fillOpacity={fillOpacity}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                filter={isHovered && hasData ? "url(#countryHoverGlow)" : undefined}
                style={{ cursor: hasData ? "pointer" : "default" }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  scale: isHovered ? 1.01 : 1,
                }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => handleMouseEnter(iso3)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(iso3)}
              >
                <title>{name}{country ? ` (${country.region})` : ""}</title>
              </motion.path>
            );
          })}
        </g>
      </svg>

      {/* Floating tooltip */}
      <AnimatePresence>
        {hoveredCountry && countryLookup.get(hoveredCountry) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-3 right-3 top-20 z-10 md:left-auto md:right-6 md:top-20"
            style={{
              background: "rgba(10, 22, 18, 0.95)",
              border: `2px solid ${colorMode === "region" ? BRIGHT_REGION_COLORS[countryLookup.get(hoveredCountry)!.region] : laysToColor(countryLookup.get(hoveredCountry)!.lays)}`,
              borderRadius: "16px",
              padding: "16px",
              width: "auto",
              maxWidth: "320px",
              backdropFilter: "blur(12px)",
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 60px ${colorMode === "region" ? BRIGHT_REGION_COLORS[countryLookup.get(hoveredCountry)!.region] : laysToColor(countryLookup.get(hoveredCountry)!.lays)}30`,
            }}
          >
            {(() => {
              const country = countryLookup.get(hoveredCountry)!;
              const color = colorMode === "region" ? BRIGHT_REGION_COLORS[country.region] : laysToColor(country.lays);
              return (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: color, boxShadow: `0 0 12px ${color}` }}
                    />
                    <h3 className="text-xl font-bold text-white" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      {country.name}
                    </h3>
                  </div>
                  <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Space Mono, monospace" }}>
                    {country.region}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Years Learning
                      </div>
                      <div className="text-2xl font-bold" style={{ color, fontFamily: "Space Mono" }}>
                        {country.lays.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Years Enrolled
                      </div>
                      <div className="text-2xl font-bold text-white" style={{ fontFamily: "Space Mono" }}>
                        {country.yearsInSchool.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Learning Poverty</span>
                      <span className="text-sm font-semibold" style={{ color: country.learningPoverty > 50 ? "#FF6B6B" : "#69DB7C" }}>
                        {country.learningPoverty.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-[10px] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Click for full details
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search UI */}
      <div data-tour="map-search" className="absolute z-50 w-72" style={{ top: '6rem', left: 'calc(50% - 9rem)' }}>
        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all w-full sm:w-auto"
            style={{
              background: "rgba(10, 22, 18, 0.9)",
              border: "1px solid rgba(74, 222, 128, 0.2)",
              color: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Search size={16} style={{ color: "var(--tree-healthy)" }} />
            <span className="flex-1 text-left truncate">
              {showSearch ? "Search countries..." : "Search countries"}
            </span>
          </button>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl overflow-hidden"
                style={{
                  background: "rgba(10, 22, 18, 0.98)",
                  border: "1px solid rgba(74, 222, 128, 0.2)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <Search size={14} style={{ color: "var(--tree-healthy)" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type country name..."
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                    style={{ fontFamily: "Space Mono, monospace" }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-white/40 hover:text-white/70">
                      <X size={14} />
                    </button>
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => handleSearchSelect(country)}
                        className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors flex items-center gap-3"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: laysToColor(country.lays) }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{country.name}</div>
                          <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                            {country.region}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-semibold" style={{ color: "var(--tree-healthy)" }}>
                            {country.lays.toFixed(1)}
                          </div>
                          <div className="text-[9px] text-white/40">LAYS</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery && searchResults.length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-white/40">
                    No countries found
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-24 right-3 z-10 flex flex-col gap-2 md:bottom-20 md:right-6"
      >
        <button
          onClick={() => handleZoom(0.7)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
          style={{
            background: "rgba(10, 22, 18, 0.8)",
            border: "1px solid rgba(74, 222, 128, 0.2)",
          }}
          title="Zoom In"
        >
          <ZoomIn size={18} style={{ color: "var(--tree-healthy)" }} />
        </button>
        <button
          onClick={() => handleZoom(1.4)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
          style={{
            background: "rgba(10, 22, 18, 0.8)",
            border: "1px solid rgba(74, 222, 128, 0.2)",
          }}
          title="Zoom Out"
        >
          <ZoomOut size={18} style={{ color: "var(--tree-healthy)" }} />
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
          style={{
            background: "rgba(10, 22, 18, 0.8)",
            border: "1px solid rgba(74, 222, 128, 0.2)",
          }}
          title="Reset View"
        >
          <Locate size={18} style={{ color: "var(--tree-healthy)" }} />
        </button>
      </div>

      {/* Map controls: color mode + region filter */}
      <div
        className="absolute bottom-24 left-3 z-10 md:bottom-20 md:left-6"
        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}
      >
        {/* Color mode toggle */}
        <div className="mb-3">
          <div
            className="text-[10px] uppercase tracking-widest mb-1.5"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Mono, monospace" }}
          >
            Color by
          </div>
          <div
            className="flex gap-1 p-0.5 rounded-lg"
            style={{
              background: "rgba(10,22,18,0.85)",
              border: "1px solid rgba(74,222,128,0.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            {(["lays", "region"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                className="px-3 py-1 rounded-md text-[10px] transition-all"
                style={{
                  background: colorMode === mode ? "rgba(74,222,128,0.18)" : "transparent",
                  color: colorMode === mode ? "#4ADE80" : "rgba(255,255,255,0.4)",
                  fontFamily: "Space Mono, monospace",
                  fontWeight: colorMode === mode ? 700 : 400,
                }}
              >
                {mode === "lays" ? "LAYS" : "Region"}
              </button>
            ))}
          </div>
        </div>

        {/* LAYS gradient bar (LAYS mode only) */}
        {colorMode === "lays" && (
          <div className="mb-3">
            <div
              className="w-40 h-2.5 rounded-full"
              style={{ background: "linear-gradient(to right, #FF3D2E, #FFB347, #4ADE80)" }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Space Mono, monospace" }}>2 yrs</span>
              <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Space Mono, monospace" }}>13 yrs</span>
            </div>
          </div>
        )}

        {/* Region filter */}
        <div>
          <div
            className="text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Space Mono, monospace" }}
          >
            Regions
            {activeRegion && (
              <button
                onClick={() => setActiveRegion(null)}
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  background: "rgba(255,255,255,0.08)",
                  fontFamily: "Space Mono, monospace",
                }}
              >
                clear
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {(Object.keys(BRIGHT_REGION_COLORS) as Region[]).map((region) => {
              const color = BRIGHT_REGION_COLORS[region];
              const isActive = activeRegion === region;
              const count = countries.filter((c) => c.region === region).length;
              return (
                <button
                  key={region}
                  onClick={() => handleRegionClick(region)}
                  className="flex items-center gap-2 text-left transition-all"
                  style={{
                    opacity: activeRegion && !isActive ? 0.35 : 1,
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0 transition-all"
                    style={{
                      background: colorMode === "region" ? color : "rgba(255,255,255,0.3)",
                      boxShadow: isActive ? `0 0 6px ${color}` : "none",
                      outline: isActive ? `1.5px solid ${color}` : "none",
                    }}
                  />
                  <span
                    className="text-[10px] truncate"
                    style={{
                      color: isActive ? (colorMode === "region" ? color : "rgba(255,255,255,0.9)") : "rgba(255,255,255,0.6)",
                      fontFamily: "Space Mono, monospace",
                    }}
                  >
                    <span className="md:hidden">{REGION_ABBR[region]}</span>
                    <span className="hidden md:inline">{region}</span>
                  </span>
                  <span className="text-[9px] ml-auto shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="text-[9px] mt-2" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Space Mono, monospace" }}>
            Grey = no data
          </div>
        </div>
      </div>

      {/* Pan hint for mobile */}
      <div
        className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 text-[10px] px-3 py-1.5 rounded-full md:hidden"
        style={{
          background: "rgba(10, 22, 18, 0.7)",
          color: "rgba(255,255,255,0.5)",
          fontFamily: "Space Mono, monospace",
        }}
      >
        Drag to pan · Pinch to zoom
      </div>
    </div>
  );
}
