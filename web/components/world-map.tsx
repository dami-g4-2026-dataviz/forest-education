"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Region, CountryData } from "@/lib/types";
import { REGION_COLORS } from "@/lib/constants";

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

// Mercator projection functions
function mercatorX(lon: number): number {
  return ((lon + 180) / 360) * MAP_WIDTH;
}

function mercatorY(lat: number): number {
  const latRad = (lat * Math.PI) / 180;
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

const GEOJSON_URL =
  "https://gisco-services.ec.europa.eu/distribution/v2/countries/geojson/CNTR_RG_60M_2024_4326.geojson";

// Brighter versions of region colors for the map
const BRIGHT_REGION_COLORS: Record<Region, string> = {
  "Sub-Saharan Africa": "#FF6B6B",
  "South Asia": "#FFB347",
  "East Asia & Pacific": "#FFE066",
  "Europe & Central Asia": "#69DB7C",
  "Latin America & Caribbean": "#4ECDC4",
  "Middle East & North Africa": "#C5A3FF",
  "North America": "#51CF66",
};

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

  const countryLookup = useMemo(() => {
    const map = new Map<string, CountryData>();
    countries.forEach((c) => map.set(c.code, c));
    return map;
  }, [countries]);

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
        color: country ? BRIGHT_REGION_COLORS[country.region] : null,
        originalColor: country ? REGION_COLORS[country.region] : null,
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
    <div className="w-full h-full relative overflow-hidden" style={{ background: "#0a1612" }}>
      <svg
        viewBox={`-50 40 ${MAP_WIDTH + 100} ${MAP_HEIGHT - 60}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
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
        <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#oceanGradient)" />

        {/* Grid lines */}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const y = mercatorY(lat);
          return (
            <g key={`lat-${lat}`}>
              <line
                x1="0"
                y1={y}
                x2={MAP_WIDTH}
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
              y1="0"
              x2={x}
              y2={MAP_HEIGHT}
              stroke="rgba(74, 222, 128, 0.06)"
              strokeWidth="1"
              strokeDasharray="8 12"
            />
          );
        })}

        {/* Countries */}
        <g>
          {countryPaths.map(({ iso3, name, path, country, region, color }) => {
            const isHovered = hoveredCountry === iso3;
            const isInHighlightedRegion = highlightedRegion && region === highlightedRegion;
            const isAnyRegionHighlighted = highlightedRegion !== null && highlightedRegion !== undefined;
            const hasData = country !== undefined;

            let fillColor = "#1a2a25";
            let fillOpacity = 0.8;
            let strokeColor = "rgba(74, 222, 128, 0.15)";
            let strokeWidth = 0.5;

            if (hasData && color) {
              fillColor = color;
              fillOpacity = isHovered ? 1 : isInHighlightedRegion ? 0.9 : isAnyRegionHighlighted ? 0.35 : 0.75;
              strokeColor = isHovered ? "#fff" : isInHighlightedRegion ? color : "rgba(255,255,255,0.2)";
              strokeWidth = isHovered ? 2 : isInHighlightedRegion ? 1 : 0.5;
            } else {
              fillOpacity = isAnyRegionHighlighted ? 0.3 : 0.5;
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
              border: `2px solid ${BRIGHT_REGION_COLORS[countryLookup.get(hoveredCountry)!.region]}`,
              borderRadius: "16px",
              padding: "16px",
              width: "auto",
              maxWidth: "320px",
              backdropFilter: "blur(12px)",
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 60px ${BRIGHT_REGION_COLORS[countryLookup.get(hoveredCountry)!.region]}30`,
            }}
          >
            {(() => {
              const country = countryLookup.get(hoveredCountry)!;
              const color = BRIGHT_REGION_COLORS[country.region];
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
                  <p className="text-sm mb-4" style={{ color, fontFamily: "Space Mono, monospace" }}>
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

      {/* Region legend */}
      <div
        className="absolute bottom-24 left-3 z-10 max-w-[calc(100vw-1.5rem)] md:bottom-20 md:left-6 md:max-w-none"
        style={{
          background: "transparent",
          border: "none",
          backdropFilter: "none",
          textShadow: "0 2px 12px rgba(0,0,0,0.55)",
        }}
      >
        <div
          className="text-[10px] uppercase tracking-widest mb-3"
          style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Space Mono, monospace" }}
        >
          Regions
        </div>
        <div className="flex flex-col gap-2">
          {(Object.entries(BRIGHT_REGION_COLORS) as [Region, string][]).map(([region, color]) => {
            const isHighlighted = highlightedRegion === region;
            const countryCount = countries.filter((c) => c.region === region).length;
            return (
              <div
                key={region}
                className="flex items-center gap-2 cursor-pointer transition-all"
                style={{ opacity: highlightedRegion && !isHighlighted ? 0.4 : 1 }}
                onMouseEnter={() => onRegionHover?.(region)}
                onMouseLeave={() => onRegionHover?.(null)}
              >
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ 
                    background: color, 
                    boxShadow: isHighlighted ? `0 0 8px ${color}` : "none",
                  }}
                />
                <span
                  className="text-xs"
                  style={{ 
                    color: isHighlighted ? color : "rgba(255,255,255,0.7)", 
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  {region.length > 20 ? region.slice(0, 18) + "…" : region}
                </span>
                <span
                  className="text-[10px] ml-auto"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {countryCount}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
