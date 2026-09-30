import React, { useState, useMemo, useRef, useCallback } from 'react';
import PageHeader from '@/src/components/layout/PageHeader';
import { BAGHEWALA_WELLS } from '@/src/data/wellsData';
import { 
  DailyDataPoint, 
  generateHistoricalTimeSeries 
} from '@/src/data/historicalTrendsData';
import EmptyState from '@/src/components/shared/EmptyState';
import { 
  Calendar, 
  TrendingUp, 
  Flame, 
  Zap, 
  AlertTriangle, 
  ShieldAlert, 
  SlidersHorizontal, 
  Download, 
  ChevronDown, 
  Building2, 
  Layers, 
  Activity, 
  Filter, 
  Clock, 
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface HistoricalTrendsPageProps {
  onNavigateToWell?: (wellId: string) => void;
}

type TimeRangePreset = '30D' | '90D' | '180D' | '365D' | '730D';

export const HistoricalTrendsPage: React.FC<HistoricalTrendsPageProps> = ({
  onNavigateToWell,
}) => {
  // Filters & State
  const [selectedPreset, setSelectedPreset] = useState<TimeRangePreset>('365D');
  const [selectedWellId, setSelectedWellId] = useState<string>('FIELD');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Convert preset to day count
  const presetDays = useMemo(() => {
    switch (selectedPreset) {
      case '30D': return 30;
      case '90D': return 90;
      case '180D': return 180;
      case '365D': return 365;
      case '730D': return 730;
      default: return 365;
    }
  }, [selectedPreset]);

  // Generate data series
  const rawData = useMemo(() => {
    return generateHistoricalTimeSeries(selectedWellId, presetDays);
  }, [selectedWellId, presetDays]);

  // Compute Summary KPI metrics for the active range
  const summaryKPIs = useMemo(() => {
    if (rawData.length === 0) {
      return { avgOil: 0, avgSor: 0, avgEnergy: 0, totalFailures: 0, minOil: 0, maxOil: 0 };
    }

    const sumOil = rawData.reduce((acc, d) => acc + d.oilRateBOPD, 0);
    const sumSor = rawData.reduce((acc, d) => acc + d.steamOilRatio, 0);
    const sumEnergy = rawData.reduce((acc, d) => acc + d.energyKwhPerBbl, 0);
    const totalFailures = rawData.reduce((acc, d) => acc + d.rodFailureCount, 0);

    const oilVals = rawData.map(d => d.oilRateBOPD);
    const minOil = Math.min(...oilVals);
    const maxOil = Math.max(...oilVals);

    return {
      avgOil: Math.round(sumOil / rawData.length),
      avgSor: Number((sumSor / rawData.length).toFixed(2)),
      avgEnergy: Number((sumEnergy / rawData.length).toFixed(1)),
      totalFailures,
      minOil,
      maxOil,
    };
  }, [rawData]);

  // Start & End dates in selected window
  const dateRangeBounds = useMemo(() => {
    if (rawData.length === 0) return { start: '', end: '' };
    return {
      start: rawData[0].date,
      end: rawData[rawData.length - 1].date,
    };
  }, [rawData]);

  // Mouse hover tracking for synced crosshair
  const chartRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current || rawData.length === 0) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = x / rect.width;
    const idx = Math.min(rawData.length - 1, Math.max(0, Math.round(pct * (rawData.length - 1))));
    setHoveredIndex(idx);
  }, [rawData]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  // Active inspected data point (or default to latest)
  const activeDataPoint = hoveredIndex !== null 
    ? rawData[hoveredIndex] 
    : (rawData.length > 0 ? rawData[rawData.length - 1] : null);

  // SVG Chart Dimensions
  const svgWidth = 1000;
  const svgHeight = 110;
  const padding = { top: 12, bottom: 20, left: 55, right: 20 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Chart 1: Daily Oil Production
  const oilMin = Math.max(0, Math.floor(summaryKPIs.minOil * 0.85));
  const oilMax = Math.ceil(summaryKPIs.maxOil * 1.15);

  // Chart 2: SOR (Steam-Oil Ratio)
  const sorMin = 1.0;
  const sorMax = 6.0;

  // Chart 3: Energy per Barrel (kWh/bbl)
  const energyMin = 15;
  const energyMax = 55;

  // Chart 4: Rod Failure Events (Stepped stem plot / scatter)
  const maxFailures = 2;

  // Coordinate mapping helper
  const getX = (index: number) => {
    if (rawData.length <= 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (rawData.length - 1)) * graphWidth;
  };

  const getY = (val: number, min: number, max: number) => {
    const clamped = Math.max(min, Math.min(max, val));
    const normalized = (clamped - min) / (max - min || 1);
    return padding.top + (1 - normalized) * graphHeight;
  };

  // Build SVG polyline paths (Flat line without gradient fills)
  const oilPoints = rawData.length > 1 ? rawData.map((d, i) => `${getX(i)},${getY(d.oilRateBOPD, oilMin, oilMax)}`).join(' ') : '';
  const sorPoints = rawData.length > 1 ? rawData.map((d, i) => `${getX(i)},${getY(d.steamOilRatio, sorMin, sorMax)}`).join(' ') : '';
  const energyPoints = rawData.length > 1 ? rawData.map((d, i) => `${getX(i)},${getY(d.energyKwhPerBbl, energyMin, energyMax)}`).join(' ') : '';

  // X-Axis sample ticks (approx 6 evenly spaced date ticks)
  const xTickIndices = useMemo(() => {
    if (rawData.length === 0) return [];
    if (rawData.length === 1) return [0];
    const count = Math.min(6, rawData.length);
    const step = Math.floor((rawData.length - 1) / (count - 1 || 1));
    return Array.from({ length: count }, (_, i) => Math.min(rawData.length - 1, i * step));
  }, [rawData]);

  // Export CSV
  const handleExportCSV = () => {
    const filename = `Historical_Trends_${selectedWellId}_${dateRangeBounds.start}_to_${dateRangeBounds.end}.csv`;
    const headers = ['Date', 'Scope', 'Daily Oil Production (BOPD)', 'Water Cut (%)', 'Steam-Oil Ratio (SOR)', 'Energy Consumption (kWh/bbl)', 'Rod Failure Incidents', 'Failure Well', 'Failure Root Cause'];
    const rows = rawData.map(d => [
      d.date,
      selectedWellId === 'FIELD' ? 'FIELD FLEET' : d.rodFailureWell || selectedWellId,
      d.oilRateBOPD,
      `${d.waterCutPct}%`,
      d.steamOilRatio,
      d.energyKwhPerBbl,
      d.rodFailureCount,
      d.rodFailureWell || 'N/A',
      `"${(d.rodFailureDetails || 'None').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-3 select-none">
      {/* Page Header */}
      <PageHeader
        code="NAV-07B"
        title="HISTORICAL TRENDS"
        subtitle="Long-Term Multi-Parameter Production, Thermal SOR, Energy Intensity & Failure Incidence Logs"
        badge="SCADA-TIME-SERIES"
        statusText={`WINDOW: ${dateRangeBounds.start} → ${dateRangeBounds.end} [${presetDays} DAYS]`}
      />

      {/* TOP CONTROL CONSOLE: DATE-RANGE SELECTOR & SCOPE FILTER */}
      <div className="bg-[#191D21] border border-[#2E343A] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono">
        {/* Left: Target Scope (Field Fleet vs Specific Well) */}
        <div className="flex items-center flex-wrap gap-2 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F656B] uppercase font-bold">ASSET SCOPE:</span>
            <select
              value={selectedWellId}
              onChange={(e) => setSelectedWellId(e.target.value)}
              className="bg-[#14171A] border border-[#2E343A] text-[#E8E6E1] text-[10px] px-2 py-1 rounded-none font-mono focus:outline-none focus:border-[#C8551D]"
            >
              <option value="FIELD">ALL FIELD FLEET (35 ACTIVE WELLS)</option>
              {BAGHEWALA_WELLS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} - Pad {w.pad} ({w.oilRateBOPD} BOPD, {w.crudeViscosityCP} cP)
                </option>
              ))}
            </select>
          </div>

          {selectedWellId !== 'FIELD' && onNavigateToWell && (
            <button
              type="button"
              onClick={() => onNavigateToWell(selectedWellId)}
              className="px-2 py-1 bg-[#14171A] hover:bg-[#252B30] border border-[#2E343A] text-[9px] text-[#C9B896] hover:text-[#E8E6E1] transition-none uppercase flex items-center gap-1"
            >
              <span>OPEN TWIN</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right: Date-Range Selector Presets & Export */}
        <div className="flex items-center flex-wrap gap-2 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="text-[#5F656B] uppercase font-semibold mr-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>RANGE:</span>
            </span>

            {(['30D', '90D', '180D', '365D', '730D'] as TimeRangePreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSelectedPreset(preset)}
                className={`px-2 py-1 border text-[9.5px] uppercase font-mono transition-none ${
                  selectedPreset === preset
                    ? 'border-[#C8551D] bg-[#14171A] text-[#E8E6E1] font-bold'
                    : 'border-[#2E343A] bg-[#191D21] text-[#8A8F94] hover:text-[#E8E6E1]'
                }`}
              >
                {preset === '730D' ? '2 YEARS' : preset === '365D' ? '1 YEAR' : preset}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2.5 py-1 bg-[#1F2428] hover:bg-[#272E34] text-[#E8E6E1] border border-[#2E343A] text-[9.5px] font-bold uppercase transition-none flex items-center gap-1"
          >
            <Download className="w-3 h-3 text-[#C8551D]" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* TOP 4 SUMMARY TELEMETRY INDICATOR SQUARED TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono">
        {/* KPI 1: Mean Daily Oil */}
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#3A5F45] p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#8A8F94] block uppercase">AVG DAILY OIL RATE</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#3A5F45]">{summaryKPIs.avgOil.toLocaleString()}</span>
              <span className="text-[9px] text-[#8A8F94]">BOPD</span>
            </div>
          </div>
          <div className="text-right text-[8px] text-[#5F656B]">
            <span>RANGE PEAK:</span>
            <span className="text-[#E8E6E1] font-bold block">{summaryKPIs.maxOil} BOPD</span>
          </div>
        </div>

        {/* KPI 2: Mean SOR */}
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#C8551D] p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#8A8F94] block uppercase">MEAN STEAM-OIL RATIO</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#C8551D]">{summaryKPIs.avgSor}</span>
              <span className="text-[9px] text-[#8A8F94]">m³/m³</span>
            </div>
          </div>
          <div className="text-right text-[8px] text-[#5F656B]">
            <span>SOR BENCHMARK:</span>
            <span className="text-[#E8E6E1] font-bold block">&lt; 3.5 TARGET</span>
          </div>
        </div>

        {/* KPI 3: Mean Energy per Barrel */}
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#C9B896] p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#8A8F94] block uppercase">AVG ENERGY INTENSITY</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#C9B896]">{summaryKPIs.avgEnergy}</span>
              <span className="text-[9px] text-[#8A8F94]">kWh / bbl</span>
            </div>
          </div>
          <div className="text-right text-[8px] text-[#5F656B]">
            <span>GRID DRAW:</span>
            <span className="text-[#E8E6E1] font-bold block">415V 50Hz</span>
          </div>
        </div>

        {/* KPI 4: Cumulative Rod Failures */}
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#8C2F2F] p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#8A8F94] block uppercase">ROD PARTING / FAILURES</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#8C2F2F]">{summaryKPIs.totalFailures}</span>
              <span className="text-[9px] text-[#8A8F94]">INCIDENTS</span>
            </div>
          </div>
          <div className="text-right text-[8px] text-[#5F656B]">
            <span>FAILURE RATE:</span>
            <span className="text-[#E8E6E1] font-bold block">{(summaryKPIs.totalFailures / (presetDays / 365)).toFixed(1)} / YEAR</span>
          </div>
        </div>
      </div>

      {/* SYNCHRONIZED TIME-SERIES HOVER INSPECTION CALLOUT BAR */}
      <div className="bg-[#191D21] border border-[#2E343A] px-3 py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#C9B896]">
            <Clock className="w-3.5 h-3.5 text-[#C8551D]" />
            <span>INSPECTED DATE:</span>
            <strong className="text-[#E8E6E1] bg-[#14171A] px-1.5 py-0.5 border border-[#2E343A]">
              {activeDataPoint ? `${activeDataPoint.date} (${activeDataPoint.displayDate})` : 'N/A'}
            </strong>
          </div>

          {activeDataPoint?.cyclePhase && (
            <span className="text-[8.5px] px-1.5 py-0.5 border border-[#2E343A] bg-[#14171A] text-[#8A8F94] uppercase">
              CSS PHASE: <strong className="text-[#E8E6E1]">{activeDataPoint.cyclePhase}</strong>
            </span>
          )}
        </div>

        {activeDataPoint && (
          <div className="flex items-center flex-wrap gap-4 text-[9.5px]">
            <div>
              <span className="text-[#5F656B]">OIL: </span>
              <strong className="text-[#3A5F45]">{activeDataPoint.oilRateBOPD.toLocaleString()} BOPD</strong>
            </div>
            <div>
              <span className="text-[#5F656B]">SOR: </span>
              <strong className="text-[#C8551D]">{activeDataPoint.steamOilRatio} m³/m³</strong>
            </div>
            <div>
              <span className="text-[#5F656B]">ENERGY: </span>
              <strong className="text-[#C9B896]">{activeDataPoint.energyKwhPerBbl} kWh/bbl</strong>
            </div>
            <div>
              <span className="text-[#5F656B]">ROD FAILURE: </span>
              {activeDataPoint.rodFailureCount > 0 ? (
                <strong className="text-[#8C2F2F] bg-[#8C2F2F]/20 px-1 py-0.2 border border-[#8C2F2F]">
                  YES ({activeDataPoint.rodFailureWell})
                </strong>
              ) : (
                <span className="text-[#3A5F45]">NONE</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MULTIPLE STACKED FLAT LINE CHARTS (SHARED SQUARED CONTAINERS & MONOSPACE AXES) */}
      <div 
        ref={chartRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex flex-col space-y-3 cursor-crosshair"
      >
        {/* ========================================================================= */}
        {/* CHART 1: DAILY OIL PRODUCTION (BOPD)                                      */}
        {/* ========================================================================= */}
        <div className="bg-[#191D21] border border-[#2E343A] p-3 font-mono space-y-1.5 relative">
          <div className="flex items-center justify-between border-b border-[#2E343A] pb-1 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#3A5F45]" />
              <span className="font-bold text-[#E8E6E1] uppercase tracking-wide">
                1. DAILY OIL PRODUCTION RATE (BOPD)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-[#8A8F94]">
              <span>MIN: <strong className="text-[#E8E6E1]">{summaryKPIs.minOil}</strong></span>
              <span>·</span>
              <span>MAX: <strong className="text-[#E8E6E1]">{summaryKPIs.maxOil}</strong></span>
              <span>·</span>
              <span>MEAN: <strong className="text-[#3A5F45]">{summaryKPIs.avgOil} BOPD</strong></span>
            </div>
          </div>

          <div className="w-full relative bg-[#14171A] border border-[#2E343A] h-28">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              {/* Horizontal Gridlines & Monospace Y-Axis Labels */}
              {[0, 0.5, 1].map((pct) => {
                const y = padding.top + pct * graphHeight;
                const val = Math.round(oilMax - pct * (oilMax - oilMin));
                return (
                  <g key={pct}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#252B30"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padding.left - 6}
                      y={y + 3}
                      fill="#8A8F94"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Flat Solid Line Path (Zero gradient fills) */}
              {rawData.length > 1 ? (
                <polyline
                  fill="none"
                  stroke="#3A5F45"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  points={oilPoints}
                />
              ) : rawData.length === 1 ? (
                <g>
                  <line
                    x1={padding.left}
                    y1={getY(rawData[0].oilRateBOPD, oilMin, oilMax)}
                    x2={svgWidth - padding.right}
                    y2={getY(rawData[0].oilRateBOPD, oilMin, oilMax)}
                    stroke="#3A5F45"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                  <rect
                    x={getX(0) - 3.5}
                    y={getY(rawData[0].oilRateBOPD, oilMin, oilMax) - 3.5}
                    width="7"
                    height="7"
                    fill="#3A5F45"
                    stroke="#E8E6E1"
                    strokeWidth="1.5"
                  />
                </g>
              ) : null}

              {/* Hover Crosshair Vertical Line */}
              {hoveredIndex !== null && (
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding.top}
                  x2={getX(hoveredIndex)}
                  y2={svgHeight - padding.bottom}
                  stroke="#E8E6E1"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              )}

              {/* Hover Active Dot */}
              {hoveredIndex !== null && (
                <rect
                  x={getX(hoveredIndex) - 3}
                  y={getY(rawData[hoveredIndex].oilRateBOPD, oilMin, oilMax) - 3}
                  width="6"
                  height="6"
                  fill="#E8E6E1"
                  stroke="#3A5F45"
                  strokeWidth="1.5"
                />
              )}
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHART 2: STEAM-OIL RATIO (SOR)                                            */}
        {/* ========================================================================= */}
        <div className="bg-[#191D21] border border-[#2E343A] p-3 font-mono space-y-1.5 relative">
          <div className="flex items-center justify-between border-b border-[#2E343A] pb-1 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#C8551D]" />
              <span className="font-bold text-[#E8E6E1] uppercase tracking-wide">
                2. STEAM-OIL RATIO (SOR - m³ STEAM / m³ CRUDE)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-[#8A8F94]">
              <span>OPTIMAL TARGET: &lt; 3.2</span>
              <span>·</span>
              <span>MEAN: <strong className="text-[#C8551D]">{summaryKPIs.avgSor}</strong></span>
            </div>
          </div>

          <div className="w-full relative bg-[#14171A] border border-[#2E343A] h-28">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              {/* Horizontal Gridlines & Monospace Y-Axis Labels */}
              {[0, 0.5, 1].map((pct) => {
                const y = padding.top + pct * graphHeight;
                const val = (sorMax - pct * (sorMax - sorMin)).toFixed(1);
                return (
                  <g key={pct}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#252B30"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padding.left - 6}
                      y={y + 3}
                      fill="#8A8F94"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Benchmark Reference Line (SOR = 3.5 boundary) */}
              <line
                x1={padding.left}
                y1={getY(3.5, sorMin, sorMax)}
                x2={svgWidth - padding.right}
                y2={getY(3.5, sorMin, sorMax)}
                stroke="#C8551D"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.5"
              />

              {/* Flat Solid Line Path */}
              {rawData.length > 1 ? (
                <polyline
                  fill="none"
                  stroke="#C8551D"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  points={sorPoints}
                />
              ) : rawData.length === 1 ? (
                <g>
                  <line
                    x1={padding.left}
                    y1={getY(rawData[0].steamOilRatio, sorMin, sorMax)}
                    x2={svgWidth - padding.right}
                    y2={getY(rawData[0].steamOilRatio, sorMin, sorMax)}
                    stroke="#C8551D"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                  <rect
                    x={getX(0) - 3.5}
                    y={getY(rawData[0].steamOilRatio, sorMin, sorMax) - 3.5}
                    width="7"
                    height="7"
                    fill="#C8551D"
                    stroke="#E8E6E1"
                    strokeWidth="1.5"
                  />
                </g>
              ) : null}

              {/* Hover Crosshair Vertical Line */}
              {hoveredIndex !== null && (
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding.top}
                  x2={getX(hoveredIndex)}
                  y2={svgHeight - padding.bottom}
                  stroke="#E8E6E1"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              )}

              {/* Hover Active Dot */}
              {hoveredIndex !== null && (
                <rect
                  x={getX(hoveredIndex) - 3}
                  y={getY(rawData[hoveredIndex].steamOilRatio, sorMin, sorMax) - 3}
                  width="6"
                  height="6"
                  fill="#E8E6E1"
                  stroke="#C8551D"
                  strokeWidth="1.5"
                />
              )}
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHART 3: ENERGY CONSUMPTION PER BARREL (kWh/bbl)                          */}
        {/* ========================================================================= */}
        <div className="bg-[#191D21] border border-[#2E343A] p-3 font-mono space-y-1.5 relative">
          <div className="flex items-center justify-between border-b border-[#2E343A] pb-1 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#C9B896]" />
              <span className="font-bold text-[#E8E6E1] uppercase tracking-wide">
                3. ELECTRICAL ENERGY INTENSITY (kWh / bbl)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-[#8A8F94]">
              <span>THERMAL COOLING SURGE THRESHOLD: &gt; 35 kWh</span>
              <span>·</span>
              <span>MEAN: <strong className="text-[#C9B896]">{summaryKPIs.avgEnergy} kWh/bbl</strong></span>
            </div>
          </div>

          <div className="w-full relative bg-[#14171A] border border-[#2E343A] h-28">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              {/* Horizontal Gridlines & Monospace Y-Axis Labels */}
              {[0, 0.5, 1].map((pct) => {
                const y = padding.top + pct * graphHeight;
                const val = Math.round(energyMax - pct * (energyMax - energyMin));
                return (
                  <g key={pct}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#252B30"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padding.left - 6}
                      y={y + 3}
                      fill="#8A8F94"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Flat Solid Line Path */}
              {rawData.length > 1 ? (
                <polyline
                  fill="none"
                  stroke="#C9B896"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  points={energyPoints}
                />
              ) : rawData.length === 1 ? (
                <g>
                  <line
                    x1={padding.left}
                    y1={getY(rawData[0].energyKwhPerBbl, energyMin, energyMax)}
                    x2={svgWidth - padding.right}
                    y2={getY(rawData[0].energyKwhPerBbl, energyMin, energyMax)}
                    stroke="#C9B896"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                  <rect
                    x={getX(0) - 3.5}
                    y={getY(rawData[0].energyKwhPerBbl, energyMin, energyMax) - 3.5}
                    width="7"
                    height="7"
                    fill="#C9B896"
                    stroke="#E8E6E1"
                    strokeWidth="1.5"
                  />
                </g>
              ) : null}

              {/* Hover Crosshair Vertical Line */}
              {hoveredIndex !== null && (
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding.top}
                  x2={getX(hoveredIndex)}
                  y2={svgHeight - padding.bottom}
                  stroke="#E8E6E1"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              )}

              {/* Hover Active Dot */}
              {hoveredIndex !== null && (
                <rect
                  x={getX(hoveredIndex) - 3}
                  y={getY(rawData[hoveredIndex].energyKwhPerBbl, energyMin, energyMax) - 3}
                  width="6"
                  height="6"
                  fill="#E8E6E1"
                  stroke="#C9B896"
                  strokeWidth="1.5"
                />
              )}
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHART 4: ROD FAILURE EVENTS TIMELINE (STEM & SCATTER PLOT)                */}
        {/* ========================================================================= */}
        <div className="bg-[#191D21] border border-[#2E343A] p-3 font-mono space-y-1.5 relative">
          <div className="flex items-center justify-between border-b border-[#2E343A] pb-1 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#8C2F2F]" />
              <span className="font-bold text-[#E8E6E1] uppercase tracking-wide">
                4. SUCKER ROD FAILURE &amp; PUMP UNSETTING EVENTS
              </span>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-[#8A8F94]">
              <span>TOTAL INCIDENTS IN WINDOW: <strong className="text-[#8C2F2F]">{summaryKPIs.totalFailures}</strong></span>
              <span>·</span>
              <span>CLASSIFIED BY WEIBULL FAULT MODEL</span>
            </div>
          </div>

          <div className="w-full relative bg-[#14171A] border border-[#2E343A] h-28">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              {/* Baseline Grid & Zero Axis */}
              <line
                x1={padding.left}
                y1={svgHeight - padding.bottom}
                x2={svgWidth - padding.right}
                y2={svgHeight - padding.bottom}
                stroke="#2E343A"
                strokeWidth="1"
              />
              <text
                x={padding.left - 6}
                y={svgHeight - padding.bottom + 3}
                fill="#8A8F94"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                0
              </text>

              <line
                x1={padding.left}
                y1={padding.top}
                x2={svgWidth - padding.right}
                y2={padding.top}
                stroke="#252B30"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={padding.left - 6}
                y={padding.top + 3}
                fill="#8A8F94"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                1+
              </text>

              {/* Failure Event Vertical Stems & Squared Markers */}
              {rawData.map((d, i) => {
                if (d.rodFailureCount <= 0) return null;
                const x = getX(i);
                const yBase = svgHeight - padding.bottom;
                const yTop = padding.top + 8;

                return (
                  <g key={d.date} className="cursor-pointer">
                    {/* Stem Line */}
                    <line
                      x1={x}
                      y1={yBase}
                      x2={x}
                      y2={yTop}
                      stroke="#8C2F2F"
                      strokeWidth="2"
                    />

                    {/* Top Squared Incident Flag */}
                    <rect
                      x={x - 4}
                      y={yTop - 4}
                      width="8"
                      height="8"
                      fill="#8C2F2F"
                      stroke="#FFFFFF"
                      strokeWidth="1"
                    />

                    {/* Well Label */}
                    <text
                      x={x}
                      y={yTop - 6}
                      fill="#E8E6E1"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {d.rodFailureWell}
                    </text>
                  </g>
                );
              })}

              {/* Shared Monospace X-Axis Date Labels across the bottom chart */}
              {xTickIndices.map((idx) => {
                const d = rawData[idx];
                const x = getX(idx);
                return (
                  <g key={idx}>
                    <line
                      x1={x}
                      y1={svgHeight - padding.bottom}
                      x2={x}
                      y2={svgHeight - padding.bottom + 4}
                      stroke="#8A8F94"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={svgHeight - 4}
                      fill="#8A8F94"
                      fontSize="8.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {d.displayDate}
                    </text>
                  </g>
                );
              })}

              {/* Hover Crosshair Vertical Line */}
              {hoveredIndex !== null && (
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding.top}
                  x2={getX(hoveredIndex)}
                  y2={svgHeight - padding.bottom}
                  stroke="#E8E6E1"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* FOOTER DIAGNOSTICS & STATUS NOTE */}
      <div className="bg-[#191D21] border border-[#2E343A] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9px] font-mono text-[#8A8F94]">
        <div className="flex items-center gap-2">
          <span>BAGHEWALA SCADA HISTORICAL ARCHIVE</span>
          <span className="text-[#5F656B]">·</span>
          <span>SAMPLED AT 24-HOUR RESOLUTION</span>
          <span className="text-[#5F656B]">·</span>
          <span>DGMS THERMAL LOGGING STANDARD OISD-173</span>
        </div>
        <div className="flex items-center gap-3">
          <span>CROSSHAIR: HOVER TO INSPECT SYNCHRONIZED TIMESTAMPS</span>
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrendsPage;
