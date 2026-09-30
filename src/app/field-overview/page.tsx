import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  AlertOctagon,
  Check,
  Activity, 
  Flame, 
  Layers, 
  Droplets, 
  ExternalLink,
  ChevronRight,
  Filter,
  Maximize2
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';
import Sparkline from '@/src/components/charts/Sparkline';
import LastUpdatedBadge from '@/src/components/shared/LastUpdatedBadge';
import { useSimulation } from '@/src/context/SimulationContext';
import IsometricFieldSchematic from '@/src/components/field-overview/IsometricFieldSchematic';
import { 
  BAGHEWALA_WELLS, 
  WellData, 
  TOTAL_FIELD_PRODUCTION_BOPD, 
  FIELD_AVG_SOR, 
  ACTIVE_CSS_CYCLES_COUNT, 
  FLAGGED_ROD_RISK_WELLS 
} from '@/src/data/wellsData';
import DS from '@/src/design-system';

interface FieldOverviewPageProps {
  onNavigateToWell?: (wellId: string) => void;
}

export const FieldOverviewPage: React.FC<FieldOverviewPageProps> = ({ onNavigateToWell }) => {
  const { simulatedWellsList, liveTotalBOPD, liveRodFloatCount, totalSimulatedDaysElapsed } = useSimulation();
  const [selectedWell, setSelectedWell] = useState<WellData>(simulatedWellsList.find(w => w.id === 'BGW-09') || simulatedWellsList[0]);
  const [hoveredWell, setHoveredWell] = useState<WellData | null>(null);
  const [filterPad, setFilterPad] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'isometric' | 'matrix'>('isometric');

  // Trend historical sparkline data (last 14 days)
  const productionTrend = [2620, 2640, 2680, 2710, 2690, 2750, 2780, 2760, 2790, 2810, 2830, 2820, 2840, liveTotalBOPD];
  const sorTrend = [3.55, 3.50, 3.48, 3.42, 3.45, 3.38, 3.35, 3.32, 3.30, 3.28, 3.26, 3.25, 3.24, 3.24];
  const activeCyclesTrend = [8, 8, 9, 9, 10, 10, 11, 11, 10, 10, 10, 10, 10, 10];
  const rodRiskTrend = [2, 2, 3, 3, 3, 4, 3, 3, 4, 4, 3, 3, 4, Math.max(liveRodFloatCount, 2)];

  const pads = ['ALL', 'Pad-01', 'Pad-02', 'Pad-03', 'Pad-04', 'Pad-05'];

  const activeSelectedWell = simulatedWellsList.find(w => w.id === selectedWell.id) || selectedWell;

  const handleWellClick = (well: WellData) => {
    setSelectedWell(well);
    if (onNavigateToWell) {
      onNavigateToWell(well.id);
    }
  };

  const getStatusColor = (status: 'normal' | 'alert' | 'fault') => {
    switch (status) {
      case 'normal':
        return '#3A5F45'; // Deep safety-green
      case 'alert':
        return '#C8551D'; // Rig-orange
      case 'fault':
        return '#8C2F2F'; // Deep warning-red
      default:
        return '#8A8F94';
    }
  };

  const filteredWells = filterPad === 'ALL' 
    ? simulatedWellsList 
    : simulatedWellsList.filter(w => w.pad === filterPad);

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-4">
      {/* Instrumentation Header */}
      <PageHeader
        code="NAV-01"
        title="FIELD OVERVIEW & SCADA TELEMETRY"
        subtitle="35-well coupled thermal-lift grid · Jodhpur Heavy Oil Formation (Thar Desert Basin)"
        badge="BAGHEWALA-PML"
        statusText="35 WELLS TRANSMITTING"
      />

      {/* TOP ROW: FOUR SQUARED KPI TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Field Production */}
        <div className="bg-[#1F2428] border border-[#2E343A] p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8A8F94]">
            <span>TOTAL FIELD PRODUCTION</span>
            <span className="text-[#C9B896]">BOPD</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl lg:text-3xl font-bold text-[#E8E6E1] tracking-tight">
              {liveTotalBOPD.toLocaleString()}
            </span>
            <div className="flex items-center text-[11px] font-mono text-[#4E9B68] font-bold">
              <ArrowUpRight strokeWidth={1.5} className="w-3.5 h-3.5 mr-0.5" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Thin sparkline with NO fill colour */}
          <div className="pt-1">
            <Sparkline data={productionTrend} color="#C9B896" height={22} strokeWidth={1.25} />
            <div className="flex justify-between text-[9px] font-mono text-[#8A8F94] mt-1">
              <span>DAY {totalSimulatedDaysElapsed.toFixed(0)}</span>
              <span>LIVE RATE: {liveTotalBOPD} BBL/D</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Field Average Steam-Oil Ratio */}
        <div className="bg-[#1F2428] border border-[#2E343A] p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8A8F94]">
            <span>FIELD AVG STEAM-OIL RATIO</span>
            <span className="text-[#C9B896]">m³/m³</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl lg:text-3xl font-bold text-[#E8E6E1] tracking-tight">
              {FIELD_AVG_SOR}
            </span>
            <div className="flex items-center text-[11px] font-mono text-[#3A5F45] font-bold">
              <ArrowDownRight strokeWidth={1.5} className="w-3.5 h-3.5 mr-0.5" />
              <span>-0.12 (IMP)</span>
            </div>
          </div>

          {/* Thin sparkline with NO fill colour */}
          <div className="pt-1">
            <Sparkline data={sorTrend} color="#C9B896" height={22} strokeWidth={1.25} />
            <div className="flex justify-between text-[9px] font-mono text-[#5F656B] mt-1">
              <span>DESIGN BASELINE: 3.50</span>
              <span>EFFICIENCY: 92.6%</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Active CSS Cycles Running */}
        <div className="bg-[#1F2428] border border-[#2E343A] p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8A8F94]">
            <span>ACTIVE CSS CYCLES RUNNING</span>
            <span className="text-[#C8551D]">THERMAL</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl lg:text-3xl font-bold text-[#E8E6E1] tracking-tight">
                {ACTIVE_CSS_CYCLES_COUNT}
              </span>
              <span className="font-mono text-xs text-[#8A8F94]">/ 35 WELLS</span>
            </div>
            <div className="text-[10px] font-mono text-[#C9B896] font-semibold">
              5 INJ · 5 SOAK
            </div>
          </div>

          {/* Thin sparkline with NO fill colour */}
          <div className="pt-1">
            <Sparkline data={activeCyclesTrend} color="#C8551D" height={22} strokeWidth={1.25} />
            <div className="flex justify-between text-[9px] font-mono text-[#5F656B] mt-1">
              <span>STEAM BOILER: 45 T/HR</span>
              <span>25 ON SRP LIFT</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Wells Flagged for Rod-Floating Risk */}
        <div className="bg-[#1F2428] border border-[#2E343A] p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8A8F94]">
            <span>ROD-FLOATING RISK FLAGGED</span>
            <span className="text-[#DE5959] font-bold">DOWNSTROKE</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl lg:text-3xl font-bold text-[#DE5959] tracking-tight">
                {liveRodFloatCount < 10 ? `0${liveRodFloatCount}` : liveRodFloatCount}
              </span>
              <span className="font-mono text-xs text-[#8A8F94]">WELLS</span>
            </div>
            <div className="flex items-center text-[11px] font-mono text-[#DE5959] font-bold">
              <ArrowUpRight strokeWidth={1.5} className="w-3.5 h-3.5 mr-0.5" />
              <span>DYNAMIC HAZARD</span>
            </div>
          </div>

          {/* Thin sparkline with NO fill colour (Warning Red line) */}
          <div className="pt-1">
            <Sparkline data={rodRiskTrend} color="#8C2F2F" height={22} strokeWidth={1.25} />
            <div className="flex justify-between text-[9px] font-mono text-[#8A8F94] mt-1">
              <span>PUMP DRAG ALERT</span>
              <span className="text-[#DE5959] font-bold">HIGH VISCOSITY</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE: LARGE SCHEMATIC MAP PANEL OF BAGHEWALA FIELD LAYOUT */}
      <div className="bg-[#1F2428] border border-[#2E343A] flex flex-col">
        {/* Map Header & Filter Controls */}
        <div className="bg-[#191D21] border-b border-[#2E343A] px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#C9B896]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E8E6E1]">
              BAGHEWALA FIELD LAYOUT SCHEMATIC // 35-WELL PAD MATRIX
            </span>
          </div>

          {/* Filter Pad, LastUpdatedBadge & Status Indicator Legend */}
          <div className="flex items-center gap-3 text-[10px] font-mono flex-wrap">
            {/* Live SCADA RTU Polling Timestamp & Refresh */}
            <LastUpdatedBadge label="SCADA" pollIntervalSec={3} />

            {/* Perspective View Switcher: Isometric 3D vs 2D Matrix */}
            <div className="flex border border-[#2E343A] bg-[#14171A]">
              <button
                type="button"
                onClick={() => setViewMode('isometric')}
                className={`px-2 py-0.5 text-[9px] font-mono font-bold transition-none cursor-pointer flex items-center gap-1 ${
                  viewMode === 'isometric'
                    ? 'bg-[#C8551D] text-[#E8E6E1]'
                    : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#272E34]'
                }`}
                style={{ borderRadius: 0 }}
                title="View Isometric Flat-Shaded Engineering Schematic"
              >
                <span>ISOMETRIC 3D</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-2 py-0.5 text-[9px] font-mono font-bold transition-none cursor-pointer flex items-center gap-1 ${
                  viewMode === 'matrix'
                    ? 'bg-[#C8551D] text-[#E8E6E1]'
                    : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#272E34]'
                }`}
                style={{ borderRadius: 0 }}
                title="View 2D Matrix Wellhead Grid"
              >
                <span>PAD MATRIX</span>
              </button>
            </div>

            {/* Pad Filter Selector */}
            <div className="flex items-center gap-1">
              <span className="text-[#8A8F94]">PAD:</span>
              <div className="flex border border-[#2E343A] bg-[#14171A]">
                {pads.map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPad(p)}
                    className={`px-2 py-0.5 text-[9px] font-mono transition-none cursor-pointer ${
                      filterPad === p
                        ? 'bg-[#C8551D] text-[#E8E6E1] font-bold'
                        : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#272E34]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Strict Status Color Legend with Dynamic Live Counts */}
            <div className="flex items-center gap-3 border-l border-[#2E343A] pl-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-[#3A5F45]" />
                <span className="text-[#8A8F94]">NORMAL ({simulatedWellsList.filter(w => w.status === 'normal').length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-[#C8551D]" />
                <span className="text-[#D96B27]">ALERT ({simulatedWellsList.filter(w => w.status === 'alert').length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-[#8C2F2F]" />
                <span className="text-[#DE5959]">CRIT FAULT ({simulatedWellsList.filter(w => w.status === 'fault').length})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Schematic Grid Area */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Viewport: Isometric 3D Schematic vs 2D Matrix Grid */}
          <div className="lg:col-span-3 bg-[#14171A] border border-[#2E343A] p-0 relative overflow-hidden">
            {viewMode === 'isometric' ? (
              <IsometricFieldSchematic
                wells={simulatedWellsList}
                selectedWell={activeSelectedWell}
                onSelectWell={handleWellClick}
                hoveredWell={hoveredWell}
                setHoveredWell={setHoveredWell}
                filterPad={filterPad}
              />
            ) : (
              <div className="p-4 relative overflow-x-auto">
                {/* Background Geodetic Lines & Coordinates */}
                <div className="absolute top-2 left-2 text-[9px] font-mono text-[#8A8F94]">
                  NW BOUNDARY // 27°48&apos;42&quot;N 71°44&apos;18&quot;E
                </div>
                <div className="absolute bottom-2 right-2 text-[9px] font-mono text-[#8A8F94]">
                  SE BOUNDARY // 27°47&apos;10&quot;N 71°46&apos;50&quot;E
                </div>

                {/* Pad Groups Matrix */}
                <div className="space-y-4 pt-4 pb-2">
                  {['Pad-01', 'Pad-02', 'Pad-03', 'Pad-04', 'Pad-05'].map((padName, padIndex) => {
                    const padWells = simulatedWellsList.filter(w => w.pad === padName);
                    if (filterPad !== 'ALL' && filterPad !== padName) return null;

                    return (
                      <div key={padName} className="border border-[#2E343A] bg-[#191D21] p-2.5">
                        {/* Pad Header */}
                        <div className="flex items-center justify-between border-b border-[#2E343A] pb-1.5 mb-2 font-mono text-[10px]">
                          <div className="flex items-center gap-2">
                            <span className="text-[#C9B896] font-bold uppercase">{padName}</span>
                            <span className="text-[#5F656B]">|</span>
                            <span className="text-[#8A8F94]">
                              {padIndex === 0 && 'CREST DEPOCENTER CLUSTER'}
                              {padIndex === 1 && 'NORTH FLANK SECTOR'}
                              {padIndex === 2 && 'CENTRAL LEASE AREA'}
                              {padIndex === 3 && 'SOUTH FLANK AREA'}
                              {padIndex === 4 && 'EAST STEP-OUT EXTENSION'}
                            </span>
                          </div>
                          <span className="text-[#5F656B]">{padWells.length} WELLHEADS</span>
                        </div>

                        {/* Well Markers in Row Grid (Square markers, NOT circular pins) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                          {padWells.map((well) => {
                            const statusColor = getStatusColor(well.status);
                            const isSelected = selectedWell?.id === well.id;
                            const isHovered = hoveredWell?.id === well.id;

                            return (
                              <button
                                key={well.id}
                                onClick={() => handleWellClick(well)}
                                onMouseEnter={() => setHoveredWell(well)}
                                onMouseLeave={() => setHoveredWell(null)}
                                title={`Click to inspect Digital Twin for ${well.id}`}
                                className={`p-2 border text-left transition-none relative flex flex-col justify-between h-20 ${
                                  isSelected
                                    ? 'border-[#C8551D] bg-[#272E34]'
                                    : 'border-[#2E343A] bg-[#14171A] hover:border-[#8A8F94]'
                                }`}
                              >
                                {/* Top row: Square Marker & Well ID & Accessible Status Icon + Text */}
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs font-bold text-[#E8E6E1]">
                                    {well.id}
                                  </span>
                                  {/* STRICT SQUARED ACCESSIBLE STATUS BADGE */}
                                  <div className="flex items-center gap-1 font-mono text-[7.5px] font-bold">
                                    {well.status === 'fault' ? (
                                      <span className="flex items-center gap-0.5 text-[#DE5959] border border-[#8C2F2F] bg-[#14171A] px-1 py-0.2">
                                        <AlertOctagon className="w-2.5 h-2.5 text-[#DE5959]" />
                                        <span>FLT</span>
                                      </span>
                                    ) : well.status === 'alert' ? (
                                      <span className="flex items-center gap-0.5 text-[#D96B27] border border-[#C8551D] bg-[#14171A] px-1 py-0.2">
                                        <AlertTriangle className="w-2.5 h-2.5 text-[#D96B27]" />
                                        <span>ALT</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-0.5 text-[#4E9B68] border border-[#3A5F45] bg-[#14171A] px-1 py-0.2">
                                        <Check className="w-2.5 h-2.5 text-[#4E9B68]" />
                                        <span>OK</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Middle: Cycle Phase & Oil Rate */}
                                <div className="text-[9px] font-mono">
                                  <div className="text-[#8A8F94] truncate">
                                    {well.cyclePhase === 'Production (SRP)' ? 'SRP PROD' : well.cyclePhase.toUpperCase()}
                                  </div>
                                  <div className="text-[#C9B896] font-semibold">
                                    {well.oilRateBOPD > 0 ? `${well.oilRateBOPD} BOPD` : `T: ${well.reservoirTempC}°C`}
                                  </div>
                                </div>

                                {/* Bottom: Warning indicator flag if rod risk */}
                                <div className="flex items-center justify-between text-[8px] font-mono pt-0.5 border-t border-[#252B30]">
                                  <span className="text-[#5F656B]">μ: {well.crudeViscosityCP} cP</span>
                                  {well.rodFloatingRisk && (
                                    <span className="text-[#8C2F2F] font-bold">ROD!</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Inspector Dock for Selected/Hovered Well */}
          <div className="bg-[#191D21] border border-[#2E343A] p-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#2E343A] pb-2">
                <div>
                  <span className="text-[9px] font-mono uppercase text-[#8A8F94] block">SELECTED WELL INSPECTOR</span>
                  <span className="font-mono text-base font-bold text-[#E8E6E1]">
                    {activeSelectedWell.id}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-2.5 h-2.5" 
                    style={{ backgroundColor: getStatusColor(activeSelectedWell.status) }} 
                  />
                  <span className="text-[10px] font-mono uppercase font-bold text-[#E8E6E1]">
                    {activeSelectedWell.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Status Alert Detail */}
              {activeSelectedWell.alertReason && (
                <div className="bg-[#14171A] border border-[#8C2F2F] p-2 text-[10px] font-mono text-[#E8E6E1]">
                  <div className="flex items-center gap-1.5 text-[#DE5959] font-bold mb-0.5">
                    <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>SCADA TELEMETRY WARNING</span>
                  </div>
                  <p className="text-[#8A8F94]">{activeSelectedWell.alertReason}</p>
                </div>
              )}

              {/* Physical Parameters List */}
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between py-1 border-b border-[#252B30]">
                  <span className="text-[#8A8F94]">PAD ASSIGNMENT:</span>
                  <span className="text-[#C9B896]">{activeSelectedWell.pad}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B30]">
                  <span className="text-[#8A8F94]">CYCLE STATUS:</span>
                  <span className="text-[#E8E6E1]">{activeSelectedWell.cyclePhase} (C-{activeSelectedWell.cycleNumber})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B30]">
                  <span className="text-[#8A8F94]">OIL RATE (BOPD):</span>
                  <span className="text-[#E8E6E1] font-bold">{activeSelectedWell.oilRateBOPD} bbl/d</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B30]">
                  <span className="text-[#8A8F94]">RESERVOIR TEMP (T):</span>
                  <span className="text-[#C8551D] font-bold">{activeSelectedWell.bottomholeTempC || activeSelectedWell.reservoirTempC} °C</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B30]">
                  <span className="text-[#8A8F94]">CRUDE VISCOSITY (μ):</span>
                  <span className="text-[#C9B896] font-bold">{activeSelectedWell.crudeViscosityCP} cP</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B30]">
                  <span className="text-[#8A8F94]">PEAK POLISHED LOAD:</span>
                  <span className="text-[#E8E6E1]">{activeSelectedWell.polishedRodLoadLbs.toLocaleString()} lbs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252B30]">
                  <span className="text-[#8A8F94]">MIN ROD LOAD (DOWN):</span>
                  <span className={`font-bold ${activeSelectedWell.minRodLoadLbs < 1500 ? 'text-[#DE5959]' : 'text-[#4E9B68]'}`}>
                    {activeSelectedWell.minRodLoadLbs.toLocaleString()} lbs
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8A8F94]">PUMP SPEED (SPM):</span>
                  <span className="text-[#E8E6E1]">{activeSelectedWell.strokeRateSPM} SPM</span>
                </div>
              </div>
            </div>

            {/* Direct Navigation Button to Digital Twin Page */}
            <div className="pt-3 border-t border-[#2E343A] space-y-1.5">
              <button
                onClick={() => onNavigateToWell && onNavigateToWell(activeSelectedWell.id)}
                className="w-full py-2 px-3 bg-[#C8551D] hover:bg-[#B24816] active:bg-[#9A3D11] text-[#E8E6E1] border border-[#C8551D] text-xs font-mono font-bold tracking-wider uppercase transition-none flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>OPEN DIGITAL TWIN: {activeSelectedWell.id}</span>
                <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5" />
              </button>
              <p className="text-[9px] font-mono text-[#8A8F94] text-center">
                Solves coupled reservoir thermal model ⇄ dynamometer load card
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: HORIZONTAL SCROLLING STRIP OF 'ATTENTION REQUIRED' WELL CARDS */}
      {(() => {
        const attentionWells = simulatedWellsList.filter(w => w.rodFloatingRisk || w.status === 'fault' || w.status === 'alert');
        const hasAttention = attentionWells.length > 0;

        return (
          <div className="bg-[#1F2428] border border-[#2E343A] p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-[#2E343A] pb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 ${hasAttention ? 'bg-[#8C2F2F]' : 'bg-[#3A5F45]'}`} />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#E8E6E1]">
                  {hasAttention 
                    ? `ATTENTION REQUIRED // FLAGGED ANOMALIES (${attentionWells.length} WELLS)`
                    : 'ALL ASSETS WITHIN NORMAL TELEMETRY THRESHOLDS (0 ACTIVE ANOMALIES)'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-[10px] font-mono text-[#8A8F94]">
                  {hasAttention 
                    ? 'CRITICAL DOWNSTROKE ROD-FLOATING & THERMAL COOLING ALERTS'
                    : 'CONTINUOUS SCADA TELEMETRY SCAN // 35 OF 35 WELLS OPERATING NOMINALLY'}
                </span>
                <LastUpdatedBadge label="ANOMALIES" pollIntervalSec={3} />
              </div>
            </div>

            {hasAttention ? (
              /* Horizontal Scrolling Card Track */
              <div className="flex gap-3 overflow-x-auto pb-2 pt-1 select-none">
                {attentionWells.map((well) => (
                  <div
                    key={well.id}
                    className={`min-w-[320px] max-w-[340px] bg-[#14171A] border p-3 flex flex-col justify-between shrink-0 space-y-2.5 ${
                      well.status === 'fault'
                        ? 'border-[#8C2F2F]'
                        : 'border-[#C8551D]'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#E8E6E1]">
                          {well.id}
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.5 border border-[#2E343A] text-[#C9B896]">
                          {well.pad}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-2 h-2" 
                          style={{ backgroundColor: getStatusColor(well.status) }} 
                        />
                        <span className={`text-[10px] font-mono uppercase font-bold ${well.status === 'fault' ? 'text-[#8C2F2F]' : 'text-[#C8551D]'}`}>
                          {well.status === 'fault' ? 'CRIT FAULT' : 'WARNING'}
                        </span>
                      </div>
                    </div>

                    {/* Anomaly Description */}
                    <div className="text-[10px] font-mono text-[#8A8F94] bg-[#191D21] p-2 border border-[#2E343A] leading-relaxed">
                      <span className="text-[#E8E6E1] font-semibold block mb-0.5">
                        {well.status === 'fault' ? 'SEVERITY: IMMEDIATE TRIP RISK' : 'SEVERITY: DRIFT WARNING'}
                      </span>
                      {well.alertReason}
                    </div>

                    {/* Physical Coupled Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#191D21] border border-[#2E343A] p-2">
                      <div>
                        <span className="text-[#5F656B] block">VISCOSITY (μ):</span>
                        <span className="text-[#C9B896] font-bold">{well.crudeViscosityCP} cP</span>
                      </div>
                      <div>
                        <span className="text-[#5F656B] block">MIN ROD LOAD:</span>
                        <span className="text-[#8C2F2F] font-bold">{well.minRodLoadLbs} lbs</span>
                      </div>
                      <div>
                        <span className="text-[#5F656B] block">PUMP SPEED:</span>
                        <span className="text-[#E8E6E1]">{well.strokeRateSPM} SPM</span>
                      </div>
                      <div>
                        <span className="text-[#5F656B] block">SOR:</span>
                        <span className="text-[#E8E6E1]">{well.steamOilRatio} m³/m³</span>
                      </div>
                    </div>

                    {/* Action Link to Digital Twin */}
                    <button
                      onClick={() => onNavigateToWell && onNavigateToWell(well.id)}
                      className="w-full py-1.5 px-3 bg-[#191D21] hover:bg-[#272E34] text-[#E8E6E1] hover:text-[#C8551D] border border-[#2E343A] hover:border-[#C8551D] text-[10px] font-mono font-bold tracking-wider uppercase transition-none flex items-center justify-center gap-1.5"
                    >
                      <span>INSPECT DIGITAL TWIN →</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* All Wells Healthy SCADA Verification Strip */
              <div className="bg-[#14171A] border border-[#2E343A] p-3 flex flex-col space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252B30] pb-2 text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3A5F45]" />
                    <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
                      ALL 35 BAGHEWALA WELLS OPERATING WITHIN NOMINAL ENVELOPES
                    </span>
                  </div>
                  <span className="text-[9px] text-[#4E9B68] font-bold px-2 py-0.5 border border-[#3A5F45] bg-[#191D21]">
                    FLEET INTEGRITY: 100% NOMINAL
                  </span>
                </div>

                {/* 4-Card Telemetry Verification Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[10px]">
                  <div className="bg-[#191D21] border border-[#2E343A] p-2.5">
                    <div className="flex items-center justify-between text-[#8A8F94] uppercase text-[9px] mb-1">
                      <span>DOWNSTROKE ROD LOAD</span>
                      <span className="text-[#3A5F45] font-bold">NOMINAL</span>
                    </div>
                    <span className="text-sm font-bold text-[#E8E6E1] block">ALL MPRL &gt; 1,500 LBS</span>
                    <span className="text-[8.5px] text-[#5F656B] block mt-1">Zero rod compression or downstroke float detected across 25 active pumping units</span>
                  </div>

                  <div className="bg-[#191D21] border border-[#2E343A] p-2.5">
                    <div className="flex items-center justify-between text-[#8A8F94] uppercase text-[9px] mb-1">
                      <span>THERMAL VISCOSITY</span>
                      <span className="text-[#3A5F45] font-bold">STABLE</span>
                    </div>
                    <span className="text-sm font-bold text-[#E8E6E1] block">BHT &gt; 140 °C ON SRP</span>
                    <span className="text-[8.5px] text-[#5F656B] block mt-1">Bottomhole temperatures prevent heavy crude viscous drag across active production pay</span>
                  </div>

                  <div className="bg-[#191D21] border border-[#2E343A] p-2.5">
                    <div className="flex items-center justify-between text-[#8A8F94] uppercase text-[9px] mb-1">
                      <span>CAPROCK INTEGRITY</span>
                      <span className="text-[#3A5F45] font-bold">SECURE</span>
                    </div>
                    <span className="text-sm font-bold text-[#E8E6E1] block">P_INJ &lt; 15.4 MPA</span>
                    <span className="text-[8.5px] text-[#5F656B] block mt-1">Steam injection pressures at active thermal pads strictly under 85% formation fracture limit</span>
                  </div>

                  <div className="bg-[#191D21] border border-[#2E343A] p-2.5">
                    <div className="flex items-center justify-between text-[#8A8F94] uppercase text-[9px] mb-1">
                      <span>SURFACE DYNAMOMETER</span>
                      <span className="text-[#3A5F45] font-bold">92.4% AVG</span>
                    </div>
                    <span className="text-sm font-bold text-[#E8E6E1] block">FULL PUMP FILLAGE</span>
                    <span className="text-[8.5px] text-[#5F656B] block mt-1">Zero traveling valve leakage or gas interference detected by surface dynacard pattern classifier</span>
                  </div>
                </div>

                {/* Footnote Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[9px] text-[#5F656B] pt-1 border-t border-[#252B30] gap-1">
                  <span>SCADA DIAGNOSTIC POLLER: ACTIVE SCANNING AT 3-SECOND CADENCE · ZERO ACTION DISPATCHES PENDING</span>
                  <span className="text-[#8A8F94]">BAGHEWALA PML PRODUCTION MONITORING PROTOCOL // DGMS COMPLIANT</span>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default FieldOverviewPage;
