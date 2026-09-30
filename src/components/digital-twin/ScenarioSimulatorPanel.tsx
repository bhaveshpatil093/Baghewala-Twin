import React, { useState, useMemo } from 'react';
import { WellData } from '@/src/data/wellsData';
import { Sliders, RotateCcw, Check, ArrowRight, AlertTriangle, TrendingUp, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { useRole } from '@/src/context/RoleContext';

interface ScenarioSimulatorPanelProps {
  well: WellData;
  onApplyPlan?: (plan: { steamVolume: number; pressure: number; soakDays: number; projectedSOR: number; peakBOPD: number }) => void;
}

export const ScenarioSimulatorPanel: React.FC<ScenarioSimulatorPanelProps> = ({ 
  well, 
  onApplyPlan 
}) => {
  const { canApplyRecommendations } = useRole();
  // Recommended baseline constants for this well
  const baseline = useMemo(() => {
    const isHighVisc = well.crudeViscosityCP > 800;
    return {
      steamVolume: isHighVisc ? 4200 : 3800,
      pressure: 14.2,
      soakDays: 6,
      peakBOPD: isHighVisc ? 104 : 118,
      sor: Number(well.steamOilRatio.toFixed(2)),
    };
  }, [well]);

  // Live Scenario Slider States
  const [steamVolume, setSteamVolume] = useState<number>(baseline.steamVolume);
  const [injectionPressure, setInjectionPressure] = useState<number>(baseline.pressure);
  const [soakDays, setSoakDays] = useState<number>(baseline.soakDays);
  const [applied, setApplied] = useState<boolean>(false);

  // Physics Simulation Model
  const simulation = useMemo(() => {
    // Thermal enthalpy factor relative to baseline
    const volumeRatio = steamVolume / baseline.steamVolume;
    const pressureRatio = injectionPressure / baseline.pressure;
    // Soak effectiveness: exponential thermal conduction equilibration
    const soakEffectiveness = (1 - Math.exp(-soakDays / 3.2)) / (1 - Math.exp(-baseline.soakDays / 3.2));

    const enthalpyIndex = Math.pow(volumeRatio, 0.72) * Math.pow(pressureRatio, 0.45) * soakEffectiveness;

    // Simulated Peak Oil Rate
    const simPeakBOPD = Math.max(25, Math.round(baseline.peakBOPD * enthalpyIndex));

    // Decline rate: larger steam chambers cool slower (lower lambda)
    const decayRate = 0.016 * Math.pow(baseline.steamVolume / Math.max(1000, steamVolume), 0.35);
    const baselineDecayRate = 0.016;

    // 90-day production curve data points (5-day intervals)
    const days: number[] = [];
    const simulatedCurve: { day: number; bopd: number }[] = [];
    const baselineCurve: { day: number; bopd: number }[] = [];

    let simCumBbl = 0;
    let baseCumBbl = 0;

    for (let d = 0; d <= 90; d += 3) {
      days.push(d);
      const sRate = Math.round(Math.max(8, simPeakBOPD * Math.exp(-decayRate * d)));
      const bRate = Math.round(Math.max(8, baseline.peakBOPD * Math.exp(-baselineDecayRate * d)));

      simulatedCurve.push({ day: d, bopd: sRate });
      baselineCurve.push({ day: d, bopd: bRate });

      simCumBbl += sRate * 3;
      baseCumBbl += bRate * 3;
    }

    // Projected SOR = Steam injected (m3 water equivalent) / Oil recovered (m3)
    // 1 bbl oil = 0.158987 m3
    const simOilM3 = simCumBbl * 0.159;
    const simSOR = Number((steamVolume / Math.max(100, simOilM3)).toFixed(2));

    const deltaPeakBOPD = simPeakBOPD - baseline.peakBOPD;
    const deltaSOR = Number((simSOR - baseline.sor).toFixed(2));
    const deltaCumBbl = simCumBbl - baseCumBbl;

    // Fracture gradient warning if pressure > 15.5 MPa
    const isOverpressure = injectionPressure > 15.4;

    return {
      simPeakBOPD,
      simSOR,
      simCumBbl,
      deltaPeakBOPD,
      deltaSOR,
      deltaCumBbl,
      isOverpressure,
      simulatedCurve,
      baselineCurve,
    };
  }, [steamVolume, injectionPressure, soakDays, baseline]);

  const handleReset = () => {
    setSteamVolume(baseline.steamVolume);
    setInjectionPressure(baseline.pressure);
    setSoakDays(baseline.soakDays);
    setApplied(false);
  };

  const handleApply = () => {
    setApplied(true);
    if (onApplyPlan) {
      onApplyPlan({
        steamVolume,
        pressure: injectionPressure,
        soakDays,
        projectedSOR: simulation.simSOR,
        peakBOPD: simulation.simPeakBOPD,
      });
    }
  };

  // Chart coordinates
  const chartWidth = 560;
  const chartHeight = 160;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 22;

  const innerW = chartWidth - paddingLeft - paddingRight;
  const innerH = chartHeight - paddingTop - paddingBottom;

  const maxBOPD = 180;
  const minBOPD = 0;

  const getX = (d: number) => paddingLeft + (d / 90) * innerW;
  const getY = (val: number) => paddingTop + innerH - (Math.max(minBOPD, Math.min(maxBOPD, val)) / maxBOPD) * innerH;

  const simPath = simulation.simulatedCurve
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day).toFixed(1)} ${getY(p.bopd).toFixed(1)}`)
    .join(' ');

  const basePath = simulation.baselineCurve
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day).toFixed(1)} ${getY(p.bopd).toFixed(1)}`)
    .join(' ');

  return (
    <div className="bg-[#1F2428] border border-[#2E343A] p-3 flex flex-col space-y-3 select-none">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <Sliders strokeWidth={1.5} className="w-4 h-4 text-[#C8551D]" />
          <div>
            <span className="font-bold text-[#E8E6E1] text-xs uppercase tracking-wider block">
              SCENARIO SIMULATOR // INTERACTIVE PARAMETER TUNER
            </span>
            <span className="text-[9px] text-[#8A8F94]">
              Simulate alternate steam volume, pressure &amp; soak time against recommended baseline
            </span>
          </div>
        </div>

        {/* Live Delta Metrics Chip */}
        <div className="flex items-center gap-2 font-mono text-[9px]">
          <div className="px-2 py-0.5 bg-[#14171A] border border-[#2E343A] flex items-center gap-1.5">
            <span className="text-[#8A8F94]">PEAK OIL:</span>
            <strong className={`text-xs ${simulation.deltaPeakBOPD >= 0 ? 'text-[#3A5F45]' : 'text-[#8C2F2F]'}`}>
              {simulation.deltaPeakBOPD >= 0 ? `+${simulation.deltaPeakBOPD}` : simulation.deltaPeakBOPD} BOPD
            </strong>
          </div>
          <div className="px-2 py-0.5 bg-[#14171A] border border-[#2E343A] flex items-center gap-1.5">
            <span className="text-[#8A8F94]">SOR:</span>
            <strong className={`text-xs ${simulation.deltaSOR <= 0 ? 'text-[#3A5F45]' : 'text-[#C8551D]'}`}>
              {simulation.deltaSOR > 0 ? `+${simulation.deltaSOR}` : simulation.deltaSOR} m³/m³
            </strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls (3 Squared Sliders) & Right Chart (Live Recalculating) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* ========================================================================= */}
        {/* LEFT: THREE SQUARED SLIDER INPUTS (5 COLUMNS)                             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-[#14171A] border border-[#2E343A] p-3 flex flex-col justify-between space-y-3 font-mono">
          {/* Custom CSS for strictly squared-track, squared-handle sliders */}
          <style>{`
            .square-slider {
              -webkit-appearance: none;
              appearance: none;
              width: 100%;
              height: 6px;
              background: #1F2428;
              border: 1px solid #2E343A;
              border-radius: 0px !important;
              outline: none;
              margin: 6px 0;
            }
            .square-slider::-webkit-slider-runnable-track {
              -webkit-appearance: none;
              border-radius: 0px !important;
              height: 6px;
            }
            .square-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 14px;
              height: 14px;
              background: #C8551D;
              border: 1px solid #E8E6E1;
              border-radius: 0px !important;
              cursor: pointer;
              margin-top: -5px;
            }
            .square-slider::-moz-range-track {
              border-radius: 0px !important;
              height: 6px;
              background: #1F2428;
              border: 1px solid #2E343A;
            }
            .square-slider::-moz-range-thumb {
              width: 14px;
              height: 14px;
              background: #C8551D;
              border: 1px solid #E8E6E1;
              border-radius: 0px !important;
              cursor: pointer;
            }
          `}</style>

          {/* Slider 1: Steam Volume */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#8A8F94] uppercase font-semibold">1. STEAM VOLUME:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#E8E6E1]">
                  {steamVolume.toLocaleString()} t
                </span>
                <span className="text-[9px] text-[#5F656B]">
                  (BASE: {baseline.steamVolume}t)
                </span>
              </div>
            </div>
            <input
              type="range"
              min={2000}
              max={6500}
              step={100}
              value={steamVolume}
              onChange={(e) => {
                setSteamVolume(Number(e.target.value));
                setApplied(false);
              }}
              className="square-slider"
            />
            <div className="flex items-center justify-between text-[8px] text-[#5F656B]">
              <span>2,000 t (MIN)</span>
              <span>4,200 t (REC)</span>
              <span>6,500 t (MAX)</span>
            </div>
          </div>

          {/* Slider 2: Injection Pressure */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#8A8F94] uppercase font-semibold">2. INJECTION PRESSURE:</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${simulation.isOverpressure ? 'text-[#8C2F2F]' : 'text-[#E8E6E1]'}`}>
                  {injectionPressure.toFixed(1)} MPa
                </span>
                <span className="text-[9px] text-[#5F656B]">
                  (BASE: {baseline.pressure} MPa)
                </span>
              </div>
            </div>
            <input
              type="range"
              min={10.0}
              max={17.5}
              step={0.1}
              value={injectionPressure}
              onChange={(e) => {
                setInjectionPressure(Number(e.target.value));
                setApplied(false);
              }}
              className="square-slider"
            />
            <div className="flex items-center justify-between text-[8px] text-[#5F656B]">
              <span>10.0 MPa</span>
              <span>14.2 MPa (REC)</span>
              <span className={simulation.isOverpressure ? 'text-[#8C2F2F] font-bold' : ''}>
                17.5 MPa (FRAC: 16.0)
              </span>
            </div>
            {simulation.isOverpressure && (
              <div className="flex items-center gap-1 text-[8.5px] text-[#8C2F2F] bg-[#1F2428] p-1 border border-[#8C2F2F] mt-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>WARNING: Approaches formation fracture gradient limit (16.0 MPa).</span>
              </div>
            )}
          </div>

          {/* Slider 3: Soak Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#8A8F94] uppercase font-semibold">3. SOAK TIME:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#C9B896]">
                  {soakDays} DAYS
                </span>
                <span className="text-[9px] text-[#5F656B]">
                  (BASE: {baseline.soakDays}d)
                </span>
              </div>
            </div>
            <input
              type="range"
              min={2}
              max={14}
              step={1}
              value={soakDays}
              onChange={(e) => {
                setSoakDays(Number(e.target.value));
                setApplied(false);
              }}
              className="square-slider"
            />
            <div className="flex items-center justify-between text-[8px] text-[#5F656B]">
              <span>2 DAYS</span>
              <span>6 DAYS (REC)</span>
              <span>14 DAYS</span>
            </div>
          </div>

          {/* Simulation Result Callout Box */}
          <div className="bg-[#191D21] border border-[#2E343A] p-2 text-[9px] space-y-1">
            <div className="flex justify-between text-[#8A8F94]">
              <span>SIMULATED OUTCOME:</span>
              <strong className="text-[#E8E6E1]">{simulation.simCumBbl.toLocaleString()} BBL TOTAL</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#5F656B]">PROJECTED SOR:</span>
              <span className="text-xs font-bold text-[#C8551D]">
                {simulation.simSOR} m³/m³{' '}
                <span className="text-[9px] text-[#8A8F94] font-normal">
                  (BASE: {baseline.sor})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: LIVE-RECALCULATING CHART (7 COLUMNS)                               */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-[#14171A] border border-[#2E343A] p-3 flex flex-col justify-between space-y-2">
          {/* Chart Header & Legend */}
          <div className="flex items-center justify-between text-[10px] font-mono border-b border-[#2E343A] pb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#C8551D]" />
              <span className="font-bold text-[#E8E6E1] uppercase">
                PROJECTED 90-DAY POST-SOAK PRODUCTION CURVE
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[9px]">
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-0.5 bg-[#C8551D]" />
                <span className="text-[#C8551D] font-bold">SIMULATED SCENARIO</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-0.5 bg-[#8A8F94] border-t border-dashed" />
                <span className="text-[#8A8F94]">REC BASELINE</span>
              </div>
            </div>
          </div>

          {/* SVG Vector Line Chart */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto block overflow-visible"
              style={{ maxHeight: '180px' }}
            >
              {/* Subtle Dotted Gridlines & Y-Axis Scale */}
              {[0, 45, 90, 135, 180].map((tick) => {
                const y = getY(tick);
                return (
                  <g key={`y-${tick}`}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#2E343A"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={paddingLeft - 5}
                      y={y + 3}
                      fill="#5F656B"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Baseline & Ticks */}
              <line
                x1={paddingLeft}
                y1={paddingTop + innerH}
                x2={chartWidth - paddingRight}
                y2={paddingTop + innerH}
                stroke="#2E343A"
                strokeWidth="1"
              />

              {[0, 15, 30, 45, 60, 75, 90].map((d) => (
                <g key={`x-${d}`}>
                  <line
                    x1={getX(d)}
                    y1={paddingTop + innerH}
                    x2={getX(d)}
                    y2={paddingTop + innerH + 3}
                    stroke="#5F656B"
                    strokeWidth="1"
                  />
                  <text
                    x={getX(d)}
                    y={chartHeight - 4}
                    fill="#5F656B"
                    fontSize="7.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {d}d
                  </text>
                </g>
              ))}

              {/* 1. Baseline Curve (Dashed Mid-Grey Line, NO fill) */}
              <path
                d={basePath}
                fill="none"
                stroke="#8A8F94"
                strokeWidth="1.25"
                strokeDasharray="3,3"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />

              {/* 2. Simulated Scenario Curve (Solid Rig-Orange Line, NO fill) */}
              <path
                d={simPath}
                fill="none"
                stroke="#C8551D"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />

              {/* Peak Markers (Square Edged) */}
              <rect
                x={getX(0) - 2.5}
                y={getY(simulation.simPeakBOPD) - 2.5}
                width="5"
                height="5"
                fill="#C8551D"
              />
              <rect
                x={getX(0) - 2}
                y={getY(baseline.peakBOPD) - 2}
                width="4"
                height="4"
                fill="#8A8F94"
              />

              {/* Readout Tag for Simulated Peak */}
              <text
                x={getX(0) + 8}
                y={getY(simulation.simPeakBOPD) + 3}
                fill="#C8551D"
                fontSize="8.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                SIM: {simulation.simPeakBOPD} BOPD
              </text>

              {/* Readout Tag for Baseline Peak */}
              <text
                x={getX(0) + 8}
                y={getY(baseline.peakBOPD) + 12}
                fill="#8A8F94"
                fontSize="7.5"
                fontFamily="monospace"
              >
                BASE: {baseline.peakBOPD} BOPD
              </text>
            </svg>
          </div>

          {/* Chart Sub-Readout Footer */}
          <div className="flex flex-wrap items-center justify-between text-[9px] font-mono text-[#8A8F94] pt-1 border-t border-[#2E343A]">
            <span>X-AXIS: 90 DAYS POST-SOAK PRODUCTION RUN</span>
            <span>Y-AXIS: DAILY PRODUCTION RATE (BOPD)</span>
          </div>
        </div>
      </div>

      {/* Button Action Bar */}
      <div className="bg-[#14171A] border border-[#2E343A] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#8A8F94]">
          <span className="text-[9px] uppercase text-[#5F656B]">STATUS:</span>
          <span className="text-[10px]">
            {steamVolume === baseline.steamVolume && injectionPressure === baseline.pressure && soakDays === baseline.soakDays
              ? 'ALIGNED WITH RECOMMENDED BASELINE'
              : 'MODIFIED SCENARIO PARAMETERS ACTIVE'}
          </span>
        </div>

        {/* Buttons: Reset to Recommended & Apply This Plan */}
        <div className="flex items-center gap-2">
          {/* Reset to Recommended Button */}
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 bg-[#1F2428] hover:bg-[#272E34] text-[#8A8F94] hover:text-[#E8E6E1] border border-[#2E343A] text-[10px] font-mono font-bold uppercase transition-none flex items-center gap-1.5"
          >
            <RotateCcw strokeWidth={1.5} className="w-3.5 h-3.5" />
            <span>RESET TO RECOMMENDED</span>
          </button>

          {/* Apply This Plan Button (Primary Accent Button) */}
          <button
            type="button"
            onClick={handleApply}
            disabled={!canApplyRecommendations}
            className={`px-4 py-1.5 text-[10px] font-mono font-bold uppercase transition-none flex items-center gap-1.5 border ${
              canApplyRecommendations
                ? 'bg-[#C8551D] hover:bg-[#D9652D] text-[#E8E6E1] border-[#C8551D] cursor-pointer'
                : 'bg-[#252B30] text-[#8A8F94] border-[#3E454D] opacity-60 cursor-not-allowed hover:bg-[#252B30] hover:text-[#8A8F94]'
            }`}
            style={{ borderRadius: 0 }}
            title={
              canApplyRecommendations
                ? 'Apply simulated CSS parameters to well schedule'
                : 'Access Restricted: Viewer role is Read-Only. Switch to Field Engineer role to apply recommendations.'
            }
          >
            {!canApplyRecommendations && <Lock className="w-3.5 h-3.5 text-[#8A8F94]" />}
            {applied ? (
              <>
                <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                <span>PLAN APPLIED TO WELL TWIN</span>
              </>
            ) : (
              <>
                <span>{canApplyRecommendations ? 'APPLY THIS PLAN' : 'APPLY THIS PLAN (VIEWER: READ-ONLY)'}</span>
                {canApplyRecommendations && <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulatorPanel;
