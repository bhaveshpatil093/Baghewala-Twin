import React, { useState } from 'react';
import { WellData, WellCyclePhase } from '@/src/data/wellsData';
import { Flame, Clock, Calendar, CheckCircle2, ChevronRight, BarChart3, HelpCircle } from 'lucide-react';

interface CycleData {
  cycleNumber: number;
  isCurrent: boolean;
  activePhase?: WellCyclePhase;
  steamVolumeTons: number;
  steamQualityPct: number;
  injectionDays: number;
  soakDays: number;
  productionDays: number;
  peakBOPD: number;
  cumulativeBbl: number;
  cycleSOR: number;
  startDate: string;
  endDate: string;
}

interface CssCycleTimelineProps {
  well: WellData;
}

export const CssCycleTimeline: React.FC<CssCycleTimelineProps> = ({ well }) => {
  const [hoveredCycle, setHoveredCycle] = useState<CycleData | null>(null);
  const [activeSubPhase, setActiveSubPhase] = useState<'Injection' | 'Soak' | 'Production' | null>(null);

  const isVirginWell = well.cycleNumber <= 0;

  // Generate realistic cycle history up to the well's current cycleNumber
  const totalCycles = Math.max(0, well.cycleNumber);
  const cycles: CycleData[] = [];

  for (let c = 1; c <= totalCycles; c++) {
    const isCurrent = c === totalCycles;
    // Early cycles have higher peak production and lower SOR; later cycles experience thermal cooling
    const baseSteam = 3600 + (c * 300);
    const peak = Math.max(45, Math.round(165 - (c - 1) * 22));
    const cumulative = Math.round(peak * 75);
    const sor = Number((2.4 + (c - 1) * 0.45).toFixed(2));

    const startYear = 2024 + Math.floor((c - 1) * 0.7);
    const startMonth = ((c * 4) % 12) + 1;

    cycles.push({
      cycleNumber: c,
      isCurrent,
      activePhase: isCurrent ? well.cyclePhase : undefined,
      steamVolumeTons: isCurrent ? 4200 : baseSteam,
      steamQualityPct: 80,
      injectionDays: 16,
      soakDays: 6,
      productionDays: isCurrent ? well.daysSinceInjection : 120,
      peakBOPD: isCurrent ? Math.max(well.oilRateBOPD, 115) : peak,
      cumulativeBbl: cumulative,
      cycleSOR: isCurrent ? well.steamOilRatio : sor,
      startDate: `${startYear}-${String(startMonth).padStart(2, '0')}-01`,
      endDate: isCurrent ? 'ACTIVE' : `${startYear}-${String(Math.min(12, startMonth + 5)).padStart(2, '0')}-15`,
    });
  }

  if (isVirginWell) {
    return (
      <div className="bg-[#14171A] border border-[#2E343A] p-3 flex flex-col space-y-3 select-none">
        {/* Header Bar for Virgin Well */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#C9B896]" />
            <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
              CSS CYCLE HISTORY TIMELINE // CYCLES CONDUCTED: 0 (VIRGIN PRE-STIMULATION)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[9px]">
            <span className="px-2 py-0.5 border border-[#C9B896] text-[#C9B896] font-bold uppercase">
              PRE-THERMAL BASELINE // COMMISSIONING PENDING
            </span>
          </div>
        </div>

        {/* Virgin Well Instrumentation Telemetry Display */}
        <div className="bg-[#191D21] border border-[#2E343A] p-3 font-mono space-y-3">
          <div className="flex items-center justify-between border-b border-[#252B30] pb-2 text-[10px]">
            <div>
              <span className="font-bold text-[#E8E6E1] block">
                VIRGIN JODHPUR SANDSTONE RESERVOIR // ZERO CSS CYCLES CONDUCTED
              </span>
              <span className="text-[9px] text-[#8A8F94]">
                Wellbore completed in primary heavy oil formation. Thermal steam chamber not yet initiated.
              </span>
            </div>
            <span className="text-[9px] text-[#C9B896] font-bold px-1.5 py-0.5 border border-[#2E343A] bg-[#14171A]">
              STATUS: PRE-STEAM INITIATION
            </span>
          </div>

          {/* 4-Parameter Native Reservoir Baseline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px]">
            <div className="bg-[#14171A] border border-[#2E343A] p-2">
              <span className="text-[9px] text-[#5F656B] block uppercase">1. FORMATION BASELINE TEMP:</span>
              <span className="text-xs text-[#E8E6E1] font-bold block mt-0.5">75.0 °C</span>
              <span className="text-[8.5px] text-[#8A8F94]">Native geothermal equilibrium</span>
            </div>

            <div className="bg-[#14171A] border border-[#2E343A] p-2">
              <span className="text-[9px] text-[#5F656B] block uppercase">2. COLD CRUDE VISCOSITY:</span>
              <span className="text-xs text-[#C9B896] font-bold block mt-0.5">6,200 cP</span>
              <span className="text-[8.5px] text-[#8A8F94]">Immobile unheated bitumen state</span>
            </div>

            <div className="bg-[#14171A] border border-[#2E343A] p-2">
              <span className="text-[9px] text-[#5F656B] block uppercase">3. CUMULATIVE STEAM INJECTED:</span>
              <span className="text-xs text-[#8A8F94] font-bold block mt-0.5">0.0 METRIC TONS</span>
              <span className="text-[8.5px] text-[#5F656B]">Maiden cycle awaiting dispatch</span>
            </div>

            <div className="bg-[#14171A] border border-[#2E343A] p-2">
              <span className="text-[9px] text-[#5F656B] block uppercase">4. INITIAL STIMULATION TARGET:</span>
              <span className="text-xs text-[#C8551D] font-bold block mt-0.5">CYCLE 01 ALLOCATION</span>
              <span className="text-[8.5px] text-[#3A5F45] font-semibold">3,800t steam @ 14.2 MPa</span>
            </div>
          </div>

          {/* Virgin Visual Progression Guide Bar */}
          <div className="bg-[#14171A] border border-[#2E343A] p-2 text-[9px] text-[#8A8F94] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#C9B896]" />
              <span>COMMISSIONING ROADMAP: Baseline Formation Survey ➔ Surface Piping Hookup ➔ Cycle 01 Boiler Dispatch</span>
            </div>
            <span className="text-[#C8551D] font-bold shrink-0">READY FOR FIRST CYCLE STEAM INJECTION</span>
          </div>
        </div>

        {/* Timeline Footnote Strip */}
        <div className="flex items-center justify-between text-[9px] font-mono text-[#5F656B] pt-1 border-t border-[#2E343A]">
          <span>VIRGIN WELL STATE // PRE-THERMAL JODHPUR CRUDE BASELINE</span>
          <span>CYCLIC STIMULATION OPTIMIZATION PROTOCOL // OIL INDIA LIMITED</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#14171A] border border-[#2E343A] p-3 flex flex-col space-y-3 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#C8551D]" />
          <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
            CSS CYCLE HISTORY TIMELINE // CYCLES 01 TO 0{well.cycleNumber}
          </span>
        </div>

        {/* Phase Sub-Segment Key using Subtle Shading Differences in Same Rig-Orange Family */}
        <div className="flex items-center gap-3 text-[9px]">
          <span className="text-[#5F656B] uppercase">PHASE SHADING:</span>
          {/* Injection: Solid High-Heat Rig Orange */}
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-[#C8551D] border border-[#2E343A]" />
            <span className="text-[#E8E6E1]">INJECTION</span>
          </div>
          {/* Soak: Mid Burnt Shade */}
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-[#8F3D14] border border-[#2E343A]" />
            <span className="text-[#E8E6E1]">SOAK</span>
          </div>
          {/* Production: Deep Rich Base Tone */}
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-[#52230C] border border-[#2E343A]" />
            <span className="text-[#E8E6E1]">PRODUCTION</span>
          </div>
        </div>
      </div>

      {/* HORIZONTAL TIMELINE SEQUENCE (SQUARED SEGMENTS) */}
      <div className="relative pt-1 pb-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {cycles.map((cycle) => {
            const isHovered = hoveredCycle?.cycleNumber === cycle.cycleNumber;

            return (
              <div
                key={`cycle-${cycle.cycleNumber}`}
                onMouseEnter={() => setHoveredCycle(cycle)}
                onMouseLeave={() => {
                  setHoveredCycle(null);
                  setActiveSubPhase(null);
                }}
                className={`relative bg-[#191D21] border transition-none cursor-pointer flex flex-col p-2 space-y-1.5 ${
                  cycle.isCurrent
                    ? 'border-[#C8551D]'
                    : isHovered
                    ? 'border-[#E8E6E1]'
                    : 'border-[#2E343A]'
                }`}
              >
                {/* Cycle Title and State Indicator */}
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#E8E6E1]">
                      CYCLE 0{cycle.cycleNumber}
                    </span>
                    {cycle.isCurrent && (
                      <span className="text-[8px] px-1 py-0.2 bg-[#C8551D] text-[#E8E6E1] font-bold uppercase">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-[#8A8F94] text-[9px]">
                    {cycle.isCurrent ? 'IN PROGRESS' : 'COMPLETED'}
                  </span>
                </div>

                {/* VISIBLY DIFFERENT SUB-SEGMENTS: INJECTION, SOAK, PRODUCTION */}
                {/* Strictly within the same color family (monochromatic thermal shading) */}
                <div className="w-full h-7 bg-[#14171A] border border-[#2E343A] flex overflow-hidden">
                  {/* Sub-segment 1: Steam Injection (15% visual weight, Bright Rig Orange) */}
                  <div
                    style={{ width: '18%' }}
                    onMouseEnter={() => setActiveSubPhase('Injection')}
                    className="h-full bg-[#C8551D] border-r border-[#14171A] flex items-center justify-center text-[8px] font-mono text-[#FFFFFF] font-bold tracking-tighter"
                    title={`Injection: ${cycle.injectionDays} days`}
                  >
                    INJ
                  </div>

                  {/* Sub-segment 2: Soak Period (10% visual weight, Mid Burnt Shade) */}
                  <div
                    style={{ width: '14%' }}
                    onMouseEnter={() => setActiveSubPhase('Soak')}
                    className="h-full bg-[#8F3D14] border-r border-[#14171A] flex items-center justify-center text-[8px] font-mono text-[#E8E6E1] font-bold tracking-tighter"
                    title={`Soak: ${cycle.soakDays} days`}
                  >
                    SOAK
                  </div>

                  {/* Sub-segment 3: Production Phase (68% visual weight, Deep Rich Tone) */}
                  <div
                    style={{ width: '68%' }}
                    onMouseEnter={() => setActiveSubPhase('Production')}
                    className="h-full bg-[#52230C] flex items-center justify-between px-1.5 text-[8px] font-mono text-[#C9B896]"
                    title={`Production: ${cycle.productionDays} days`}
                  >
                    <span className="font-semibold uppercase truncate">
                      {cycle.isCurrent ? `${well.daysSinceInjection}d POST-INJ` : 'PROD (SRP)'}
                    </span>
                    <span className="text-[#E8E6E1] font-bold shrink-0">
                      {cycle.peakBOPD} bpd
                    </span>
                  </div>
                </div>

                {/* Sub-label Metrics */}
                <div className="flex items-center justify-between text-[9px] font-mono text-[#8A8F94] pt-0.5">
                  <span>STEAM: <strong className="text-[#C9B896]">{cycle.steamVolumeTons}t</strong></span>
                  <span>SOR: <strong className="text-[#E8E6E1]">{cycle.cycleSOR}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* INTERACTIVE HOVER TOOLTIP DISPLAY DOCK */}
        {hoveredCycle && (
          <div className="mt-2 bg-[#191D21] border border-[#C8551D] p-2.5 font-mono text-[10px] space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#2E343A] pb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#C8551D]" />
                <span className="font-bold text-[#E8E6E1]">
                  CYCLE 0{hoveredCycle.cycleNumber} DETAILED TELEMETRY INSPECTION
                </span>
                {hoveredCycle.isCurrent && (
                  <span className="px-1.5 py-0.2 border border-[#C8551D] text-[#C8551D] text-[9px] font-bold uppercase">
                    CURRENT ACTIVE CYCLE
                  </span>
                )}
              </div>
              <span className="text-[#8A8F94]">
                DATE WINDOW: {hoveredCycle.startDate} → {hoveredCycle.endDate}
              </span>
            </div>

            {/* Detailed 4-Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Metric 1: Steam Volume */}
              <div className="bg-[#14171A] border border-[#2E343A] p-2">
                <span className="text-[9px] text-[#5F656B] block uppercase">1. STEAM VOLUME INJECTED:</span>
                <span className="text-xs text-[#C8551D] font-bold block mt-0.5">
                  {hoveredCycle.steamVolumeTons.toLocaleString()} METRIC TONS
                </span>
                <span className="text-[9px] text-[#8A8F94]">
                  @ {hoveredCycle.steamQualityPct}% dryness · 14.5 MPa
                </span>
              </div>

              {/* Metric 2: Soak Duration */}
              <div className="bg-[#14171A] border border-[#2E343A] p-2">
                <span className="text-[9px] text-[#5F656B] block uppercase">2. SHUT-IN SOAK DURATION:</span>
                <span className="text-xs text-[#C9B896] font-bold block mt-0.5">
                  {hoveredCycle.soakDays} DAYS (EQUILIBRATION)
                </span>
                <span className="text-[9px] text-[#8A8F94]">
                  Conduction equilibration time
                </span>
              </div>

              {/* Metric 3: Resulting Peak Production */}
              <div className="bg-[#14171A] border border-[#2E343A] p-2">
                <span className="text-[9px] text-[#5F656B] block uppercase">3. RESULTING PEAK PRODUCTION:</span>
                <span className="text-xs text-[#E8E6E1] font-bold block mt-0.5">
                  {hoveredCycle.peakBOPD} BOPD
                </span>
                <span className="text-[9px] text-[#3A5F45] font-semibold">
                  Achieved at D+8 post-soak
                </span>
              </div>

              {/* Metric 4: Cycle SOR & Cumulative Recovery */}
              <div className="bg-[#14171A] border border-[#2E343A] p-2">
                <span className="text-[9px] text-[#5F656B] block uppercase">4. CUMULATIVE RECOVERY / SOR:</span>
                <span className="text-xs text-[#C9B896] font-bold block mt-0.5">
                  {hoveredCycle.cumulativeBbl.toLocaleString()} BBL · {hoveredCycle.cycleSOR} SOR
                </span>
                <span className="text-[9px] text-[#8A8F94]">
                  Steam-oil efficiency ratio
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Footnote Strip */}
      <div className="flex items-center justify-between text-[9px] font-mono text-[#5F656B] pt-1 border-t border-[#2E343A]">
        <span>HOVER SEGMENT FOR HIGH-FIDELITY STEAM ⇄ RECOVERY TELEMETRY</span>
        <span>CYCLIC STIMULATION OPTIMIZATION PROTOCOL // OIL INDIA LIMITED</span>
      </div>
    </div>
  );
};

export default CssCycleTimeline;
