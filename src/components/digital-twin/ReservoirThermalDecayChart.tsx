import React, { useState } from 'react';
import { WellData } from '@/src/data/wellsData';
import { Thermometer, Droplets, Info, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import LastUpdatedBadge from '@/src/components/shared/LastUpdatedBadge';

interface ReservoirThermalDecayChartProps {
  well: WellData;
}

export const ReservoirThermalDecayChart: React.FC<ReservoirThermalDecayChartProps> = ({ well }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    day: number;
    temp: number;
    visc: number;
    isProjection: boolean;
  } | null>(null);

  const isVirginWell = well.cycleNumber <= 0;
  const todayDay = isVirginWell ? 0 : well.daysSinceInjection;
  const totalDays = Math.max(90, todayDay + 30);

  // Physics decline model parameters
  const tBase = 75; // Native baseline formation temp (°C)
  const tInit = isVirginWell 
    ? 75 
    : Math.min(260, Math.max(220, well.bottomholeTempC + (todayDay * 1.45)));
  const coolingK = isVirginWell ? 0 : (well.rodFloatingRisk ? 0.034 : 0.022); // Flagged wells experience faster thermal dissipation

  // Generate 2-day sample points from day 0 to totalDays
  const dataPoints: { day: number; temp: number; visc: number; isProjection: boolean }[] = [];

  for (let d = 0; d <= totalDays; d += 2) {
    const temp = isVirginWell ? 75 : Math.round(tBase + (tInit - tBase) * Math.exp(-coolingK * d));
    // Viscosity model for 17° API Baghewala crude: mu(T) = 5500 * exp(-0.029 * (temp - 75))
    const rawVisc = isVirginWell ? 6200 : Math.round(6200 * Math.exp(-0.030 * (temp - 75)));
    const visc = Math.max(25, Math.min(8500, rawVisc));

    dataPoints.push({
      day: d,
      temp,
      visc,
      isProjection: isVirginWell ? false : d > todayDay,
    });
  }

  // Find exact value for today
  const todayTemp = isVirginWell ? 75 : well.bottomholeTempC;
  const todayVisc = isVirginWell ? 6200 : well.crudeViscosityCP;

  // Chart Dimensions & Scales
  const width = 640;
  const height = 240;
  const paddingLeft = 44; // Left Y-Axis (Temperature in °C)
  const paddingRight = 48; // Right Y-Axis (Viscosity in cP)
  const paddingTop = 24;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Scales
  const minTemp = 60;
  const maxTemp = 260;
  const tempRange = maxTemp - minTemp;

  const minVisc = 0;
  const maxVisc = 5000;
  const viscRange = maxVisc - minVisc;

  const getX = (d: number) => paddingLeft + (d / totalDays) * chartWidth;
  const getYTemp = (t: number) => paddingTop + chartHeight - ((t - minTemp) / tempRange) * chartHeight;
  const getYVisc = (v: number) => paddingTop + chartHeight - ((Math.min(v, maxVisc) - minVisc) / viscRange) * chartHeight;

  // Split series into Historical (<= today) and Projection (>= today)
  const historicalPoints = dataPoints.filter(p => p.day <= todayDay);
  const projectionPoints = dataPoints.filter(p => p.day >= todayDay);

  // If todayDay is not on exact 2-day step, ensure seamless connection at todayDay
  const todayCoord = {
    x: getX(todayDay),
    yTemp: getYTemp(todayTemp),
    yVisc: getYVisc(todayVisc),
  };

  // Temperature Historical Solid Path
  const tempHistoricalPath = historicalPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day).toFixed(1)} ${getYTemp(p.temp).toFixed(1)}`)
    .join(' ') + (historicalPoints.length > 0 ? ` L ${todayCoord.x.toFixed(1)} ${todayCoord.yTemp.toFixed(1)}` : '');

  // Temperature Projection Dashed Path
  const tempProjectionPath = `M ${todayCoord.x.toFixed(1)} ${todayCoord.yTemp.toFixed(1)} ` +
    projectionPoints
      .map(p => `L ${getX(p.day).toFixed(1)} ${getYTemp(p.temp).toFixed(1)}`)
      .join(' ');

  // Viscosity Historical Solid Path (Sand accent)
  const viscHistoricalPath = historicalPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day).toFixed(1)} ${getYVisc(p.visc).toFixed(1)}`)
    .join(' ') + (historicalPoints.length > 0 ? ` L ${todayCoord.x.toFixed(1)} ${todayCoord.yVisc.toFixed(1)}` : '');

  // Viscosity Projection Dashed Path (Sand accent)
  const viscProjectionPath = `M ${todayCoord.x.toFixed(1)} ${todayCoord.yVisc.toFixed(1)} ` +
    projectionPoints
      .map(p => `L ${getX(p.day).toFixed(1)} ${getYVisc(p.visc).toFixed(1)}`)
      .join(' ');

  // Ticks
  const tempTicks = [60, 100, 140, 180, 220, 260];
  const viscTicks = [0, 1000, 2000, 3000, 4000, 5000];
  const dayTicks = [0, 15, 30, 45, 60, 75, 90].filter(d => d <= totalDays);

  // Critical Viscosity threshold (1,000 cP = rod floating risk zone)
  const critViscY = getYVisc(1000);

  return (
    <div className="bg-[#14171A] border border-[#2E343A] p-3 flex flex-col space-y-3 select-none">
      {/* Header and Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#C8551D]" />
          <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
            {isVirginWell 
              ? 'RESERVOIR THERMAL DECAY // VIRGIN BASELINE (ISOTHERMAL 75°C)' 
              : 'RESERVOIR THERMAL DECAY // BHT DECLINE ⇄ CRUDE VISCOSITY SOLVER'}
          </span>
        </div>

        {/* Legend & SCADA Badge */}
        <div className="flex items-center gap-3 text-[9px] flex-wrap">
          <LastUpdatedBadge label="DTS" pollIntervalSec={3} />

          {/* Primary: Temperature Line */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-[#C8551D]" />
            <span className="text-[#C8551D] font-bold">BHT (°C)</span>
            <span className="text-[#8A8F94]">{isVirginWell ? '[ISOTHERMAL BASELINE]' : '[SOLID: HIST / DASH: PROJ]'}</span>
          </div>

          {/* Secondary: Viscosity Line (Sand accent) */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-[#C9B896]" />
            <span className="text-[#C9B896] font-bold">VISCOSITY (cP)</span>
            <span className="text-[#5F656B]">[RIGHT AXIS]</span>
          </div>

          {/* Today Indicator */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-[#E8E6E1] border border-[#C8551D]" />
            <span className="text-[#E8E6E1] font-bold">{isVirginWell ? 'VIRGIN BASELINE' : `TODAY (DAY ${todayDay})`}</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="w-full bg-[#191D21] border border-[#2E343A] p-2 relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[560px] h-auto block overflow-visible"
        >
          {/* Subtle Dotted Horizontal Gridlines */}
          {tempTicks.map((tick, i) => {
            const y = getYTemp(tick);
            return (
              <g key={`grid-${tick}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#2E343A"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                {/* Left Y-Axis Label: Temperature (°C) */}
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  fill="#C8551D"
                  fontSize="8.5"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {tick}°C
                </text>
                {/* Right Y-Axis Label: Viscosity (cP) */}
                <text
                  x={width - paddingRight + 6}
                  y={y + 3}
                  fill="#C9B896"
                  fontSize="8.5"
                  fontFamily="monospace"
                  textAnchor="start"
                >
                  {viscTicks[i]} cP
                </text>
              </g>
            );
          })}

          {/* Critical 1,000 cP Viscosity Warning Horizontal Dotted Line */}
          <line
            x1={paddingLeft}
            y1={critViscY}
            x2={width - paddingRight}
            y2={critViscY}
            stroke="#8C2F2F"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <text
            x={width - paddingRight - 8}
            y={critViscY - 4}
            fill="#8C2F2F"
            fontSize="8"
            fontFamily="monospace"
            textAnchor="end"
          >
            ROD-FLOATING RISK THRESHOLD (μ &gt; 1,000 cP)
          </text>

          {/* Vertical 'Today' Reference Boundary Line */}
          <line
            x1={todayCoord.x}
            y1={paddingTop}
            x2={todayCoord.x}
            y2={paddingTop + chartHeight}
            stroke="#E8E6E1"
            strokeWidth="1"
            strokeDasharray="2,2"
          />

          {/* Today Monospace Tag on X-Axis Header */}
          <rect
            x={todayCoord.x - 30}
            y={paddingTop - 18}
            width="60"
            height="14"
            fill="#14171A"
            stroke="#C8551D"
            strokeWidth="1"
          />
          <text
            x={todayCoord.x}
            y={paddingTop - 8}
            fill="#E8E6E1"
            fontSize="7.5"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            TODAY: D+{todayDay}
          </text>

          {/* X-Axis Baseline & Ticks */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#2E343A"
            strokeWidth="1"
          />

          {dayTicks.map(d => (
            <g key={`day-${d}`}>
              <line
                x1={getX(d)}
                y1={paddingTop + chartHeight}
                x2={getX(d)}
                y2={paddingTop + chartHeight + 4}
                stroke="#5F656B"
                strokeWidth="1"
              />
              <text
                x={getX(d)}
                y={height - 6}
                fill="#8A8F94"
                fontSize="8.5"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {d === 0 ? '0d (INJ)' : `${d}d`}
              </text>
            </g>
          ))}

          {/* 1. VISCOSITY CURVES (SAND-ACCENT COLOUR) */}
          {/* Historical Viscosity Solid Flat Line */}
          <path
            d={viscHistoricalPath}
            fill="none"
            stroke="#C9B896"
            strokeWidth="1.75"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />

          {/* Viscosity Dashed Projection Line */}
          <path
            d={viscProjectionPath}
            fill="none"
            stroke="#C9B896"
            strokeWidth="1.5"
            strokeDasharray="4,3"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />

          {/* 2. TEMPERATURE CURVES (WARM RIG-ORANGE) */}
          {/* Historical Temperature Solid Flat Line */}
          <path
            d={tempHistoricalPath}
            fill="none"
            stroke="#C8551D"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />

          {/* Temperature Dashed Projection Line */}
          <path
            d={tempProjectionPath}
            fill="none"
            stroke="#C8551D"
            strokeWidth="1.5"
            strokeDasharray="4,3"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />

          {/* 3. TODAY MARKERS (SQUARE-EDGED POINTS) */}
          {/* Temperature Today Square Point */}
          <rect
            x={todayCoord.x - 3.5}
            y={todayCoord.yTemp - 3.5}
            width="7"
            height="7"
            fill="#C8551D"
            stroke="#E8E6E1"
            strokeWidth="1.25"
          />

          {/* Viscosity Today Square Point */}
          <rect
            x={todayCoord.x - 3.5}
            y={todayCoord.yVisc - 3.5}
            width="7"
            height="7"
            fill="#C9B896"
            stroke="#14171A"
            strokeWidth="1.25"
          />

          {/* Today Numerical Readout Callout Box */}
          <g transform={`translate(${todayCoord.x > width - 180 ? todayCoord.x - 145 : todayCoord.x + 10}, ${Math.min(height - 75, Math.max(paddingTop + 5, todayCoord.yTemp - 30))})`}>
            <rect
              x="0"
              y="0"
              width="135"
              height="44"
              fill="#14171A"
              stroke="#2E343A"
              strokeWidth="1"
            />
            <text x="8" y="13" fill="#8A8F94" fontSize="8" fontFamily="monospace">
              STATUS AT DAY {todayDay}:
            </text>
            <text x="8" y="26" fill="#C8551D" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
              BHT: {todayTemp} °C
            </text>
            <text x="8" y="38" fill="#C9B896" fontSize="9" fontFamily="monospace" fontWeight="bold">
              μ: {todayVisc.toLocaleString()} cP
            </text>
          </g>

          {/* Axis Titles */}
          {/* Left Y-Axis Title */}
          <text
            x={paddingLeft - 32}
            y={paddingTop - 10}
            fill="#C8551D"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ← BHT (°C)
          </text>

          {/* Right Y-Axis Title */}
          <text
            x={width - paddingRight + 8}
            y={paddingTop - 10}
            fill="#C9B896"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            VISCOSITY (cP) →
          </text>
        </svg>
      </div>

      {/* Physics Solvers Technical Footnote */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] font-mono bg-[#191D21] border border-[#2E343A] p-2.5">
        <div>
          <span className="text-[#5F656B] block">DECLINE FORMULA:</span>
          <span className="text-[#E8E6E1]">
            {isVirginWell ? 'ISOTHERMAL BASELINE (T = 75°C STATIC)' : 'T(t) = T_base + (T_0 - T_base)·e^(-k·t)'}
          </span>
        </div>
        <div>
          <span className="text-[#5F656B] block">COOLING CONSTANT (k):</span>
          <span className="text-[#C8551D] font-bold">
            {isVirginWell ? '0.000 day⁻¹ (STATIC EQUILIBRIUM)' : `${coolingK.toFixed(3)} day⁻¹`}
          </span>
        </div>
        <div>
          <span className="text-[#5F656B] block">PROJECTED RUN-LIFE TO 1,000 cP:</span>
          <span className={todayVisc >= 1000 ? 'text-[#8C2F2F] font-bold' : 'text-[#3A5F45] font-bold'}>
            {isVirginWell 
              ? 'PRE-STIMULATION // CYCLE 01 REQUIRED'
              : todayVisc >= 1000 
              ? 'CRITICAL // VISCOSITY EXCEEDED' 
              : `~${Math.max(0, Math.round((Math.log(6200 / 1000) / 0.030) + 75 - tBase) * 0.45)} DAYS REMAINING`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReservoirThermalDecayChart;
