import React, { useState, useMemo } from 'react';
import { 
  GitCompare, 
  Plus, 
  Trash2, 
  ChevronRight, 
  AlertTriangle, 
  Activity, 
  Flame, 
  Layers, 
  ArrowUpDown, 
  RotateCcw
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';
import { BAGHEWALA_WELLS, WellData } from '@/src/data/wellsData';
import { 
  getWellComparisonSeries, 
  COMPARISON_SCALES, 
  WellComparisonSeries 
} from '@/src/data/wellComparisonData';
import ComparisonLineChart from '@/src/components/charts/ComparisonLineChart';
import EmptyState from '@/src/components/shared/EmptyState';
import DS from '@/src/design-system';

interface WellComparisonPageProps {
  onNavigateToWell?: (wellId: string) => void;
}

export const WellComparisonPage: React.FC<WellComparisonPageProps> = ({ onNavigateToWell }) => {
  // Default to 3 contrasting wells (a top producer, a mid-life well, and the critical rod-float well BGW-09)
  const [selectedWellIds, setSelectedWellIds] = useState<string[]>(['BGW-01', 'BGW-03', 'BGW-09']);

  // Available wells not already selected
  const availableWells = useMemo(() => {
    return BAGHEWALA_WELLS.filter(w => !selectedWellIds.includes(w.id));
  }, [selectedWellIds]);

  // Compute time series data for each selected well
  const wellDataList: WellComparisonSeries[] = useMemo(() => {
    return selectedWellIds.map(id => getWellComparisonSeries(id));
  }, [selectedWellIds]);

  const handleSelectWell = (index: number, newWellId: string) => {
    const updated = [...selectedWellIds];
    updated[index] = newWellId;
    setSelectedWellIds(updated);
  };

  const handleAddWell = (wellIdToAdd: string) => {
    if (selectedWellIds.length < 4 && !selectedWellIds.includes(wellIdToAdd)) {
      setSelectedWellIds([...selectedWellIds, wellIdToAdd]);
    }
  };

  const handleRemoveWell = (index: number) => {
    if (selectedWellIds.length > 2) {
      setSelectedWellIds(selectedWellIds.filter((_, i) => i !== index));
    }
  };

  const setPreset = (presetIds: string[]) => {
    setSelectedWellIds(presetIds);
  };

  const getStatusTag = (well: WellData) => {
    if (well.status === 'fault') {
      return (
        <span className="inline-block px-1.5 py-0.5 border border-[#8C2F2F] bg-[#14171A] text-[#8C2F2F] font-mono text-[9px] font-bold tracking-wider uppercase">
          CRIT FAULT
        </span>
      );
    }
    if (well.status === 'alert') {
      return (
        <span className="inline-block px-1.5 py-0.5 border border-[#C8551D] bg-[#14171A] text-[#C8551D] font-mono text-[9px] font-bold tracking-wider uppercase">
          ALERT
        </span>
      );
    }
    if (well.cyclePhase === 'Injection' || well.cyclePhase === 'Soaking') {
      return (
        <span className="inline-block px-1.5 py-0.5 border border-[#2E343A] bg-[#14171A] text-[#C9B896] font-mono text-[9px] font-semibold tracking-wider uppercase">
          {well.cyclePhase === 'Injection' ? 'STEAM INJ' : 'SOAKING'}
        </span>
      );
    }
    return (
      <span className="inline-block px-1.5 py-0.5 border border-[#3A5F45] bg-[#14171A] text-[#3A5F45] font-mono text-[9px] font-bold tracking-wider uppercase">
        NORMAL
      </span>
    );
  };

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-4">
      {/* Instrumentation Header */}
      <PageHeader
        code="NAV-02B"
        title="WELL COMPARISON // SMALL MULTIPLES PERFORMANCE MATRIX"
        subtitle="Side-by-side synchronized scale analysis · Production, Thermal Decay & Rod Dynamics"
        badge="SHARED-SCALE-Y"
        statusText={`${selectedWellIds.length} WELLS SYNCHRONIZED`}
      />

      {/* Control Toolbar: Multi-Well Dropdowns & Presets */}
      <div className="bg-[#1F2428] border border-[#2E343A] p-3 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Well Selection Slots */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-[#8A8F94] mr-1">
              COMPARE WELLS (2 TO 4):
            </span>

            {selectedWellIds.map((wellId, index) => (
              <div 
                key={`slot-${index}`}
                className="flex items-center bg-[#14171A] border border-[#2E343A] text-xs font-mono"
              >
                <span className="px-2 py-1 text-[9px] text-[#5F656B] border-r border-[#2E343A] uppercase">
                  W{index + 1}
                </span>
                
                {/* Dropdown for this slot */}
                <select
                  value={wellId}
                  onChange={(e) => handleSelectWell(index, e.target.value)}
                  className="bg-transparent text-[#E8E6E1] font-bold px-2 py-1 outline-none cursor-pointer focus:text-[#C8551D]"
                >
                  <option value={wellId} className="bg-[#1F2428] text-[#E8E6E1]">
                    {wellId} ({BAGHEWALA_WELLS.find(w => w.id === wellId)?.pad})
                  </option>
                  {availableWells.map(w => (
                    <option key={w.id} value={w.id} className="bg-[#1F2428] text-[#E8E6E1]">
                      {w.id} ({w.pad} · {w.cyclePhase})
                    </option>
                  ))}
                </select>

                {/* Remove well button (if more than 2 wells) */}
                {selectedWellIds.length > 2 && (
                  <button
                    onClick={() => handleRemoveWell(index)}
                    title="Remove well from comparison"
                    className="px-1.5 py-1 text-[#5F656B] hover:text-[#8C2F2F] border-l border-[#2E343A] transition-none"
                  >
                    <Trash2 strokeWidth={1.25} className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Add 4th Well Button if less than 4 */}
            {selectedWellIds.length < 4 && availableWells.length > 0 && (
              <button
                onClick={() => handleAddWell(availableWells[0].id)}
                className="px-2 py-1 bg-[#14171A] hover:bg-[#272E34] text-[#C9B896] hover:text-[#E8E6E1] border border-[#2E343A] text-[10px] font-mono uppercase font-bold transition-none flex items-center gap-1"
              >
                <Plus strokeWidth={1.25} className="w-3 h-3" />
                <span>ADD WELL ({selectedWellIds.length}/4)</span>
              </button>
            )}
          </div>

          {/* Quick Comparison Presets */}
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-[#8A8F94] uppercase">PRESETS:</span>
            <div className="flex border border-[#2E343A] bg-[#14171A]">
              <button
                onClick={() => setPreset(['BGW-09', 'BGW-03', 'BGW-12', 'BGW-20'])}
                className="px-2 py-1 text-[9px] font-mono text-[#8C2F2F] hover:bg-[#272E34] border-r border-[#2E343A] font-bold"
              >
                FLAGGED ANOMALIES
              </button>
              <button
                onClick={() => setPreset(['BGW-01', 'BGW-02', 'BGW-15', 'BGW-18'])}
                className="px-2 py-1 text-[9px] font-mono text-[#C9B896] hover:bg-[#272E34] border-r border-[#2E343A] font-semibold"
              >
                CREST PRODUCERS
              </button>
              <button
                onClick={() => setPreset(['BGW-04', 'BGW-05', 'BGW-01'])}
                className="px-2 py-1 text-[9px] font-mono text-[#E8E6E1] hover:bg-[#272E34]"
              >
                CSS STAGES (INJ/SOAK/PROD)
              </button>
            </div>
          </div>
        </div>

        {/* Global Scale Info Banner */}
        <div className="flex flex-wrap items-center justify-between text-[9px] font-mono text-[#8A8F94] pt-2 border-t border-[#2E343A]">
          <div className="flex items-center gap-4">
            <span className="text-[#C9B896] font-semibold">SHARED SCALE LOCK:</span>
            <span>PROD: [0–150 BOPD]</span>
            <span className="text-[#5F656B]">·</span>
            <span>SOR: [1.0–6.0 m³/m³]</span>
            <span className="text-[#5F656B]">·</span>
            <span>TEMP: [60–260 °C]</span>
            <span className="text-[#5F656B]">·</span>
            <span>ROD: [0–26,000 lbs]</span>
          </div>
          <span className="text-[#5F656B]">X-AXIS: 30-DAY TELEMETRY WINDOW (2-DAY SAMPLES)</span>
        </div>
      </div>

      {/* SMALL MULTIPLES COMPARISON MATRIX (ONE COLUMN PER WELL) */}
      {wellDataList.length === 0 ? (
        <EmptyState
          icon={GitCompare}
          message="No wells selected for multi-well comparison"
          subMessage="Select 2 to 4 wells from the selector bar above or activate a preset profile to compare multi-well SCADA telemetry."
          actionText="RESTORE DEFAULT PRESET"
          onAction={() => setSelectedWellIds(['BGW-01', 'BGW-03', 'BGW-09'])}
        />
      ) : (
        <div 
          className={`grid gap-3 ${
            selectedWellIds.length === 2 
              ? 'grid-cols-1 md:grid-cols-2' 
              : selectedWellIds.length === 3 
              ? 'grid-cols-1 md:grid-cols-3' 
              : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
          }`}
        >
          {wellDataList.map(({ well, timeSeries }) => {
          // Prepare point arrays for charts
          const prodPoints = timeSeries.map(p => ({ x: p.day, y: p.oilRateBOPD }));
          const sorPoints = timeSeries.map(p => ({ x: p.day, y: p.steamOilRatio }));
          const tempPoints = timeSeries.map(p => ({ x: p.day, y: p.bottomholeTempC }));
          const peakRodPoints = timeSeries.map(p => ({ x: p.day, y: p.peakRodLoadLbs }));
          const minRodPoints = timeSeries.map(p => ({ x: p.day, y: p.minRodLoadLbs }));

          return (
            <div 
              key={well.id} 
              className={`bg-[#1F2428] border flex flex-col justify-between space-y-3 p-3 ${
                well.status === 'fault' ? 'border-[#8C2F2F]' : well.status === 'alert' ? 'border-[#C8551D]' : 'border-[#2E343A]'
              }`}
            >
              {/* Column Well Header */}
              <div className="bg-[#191D21] border border-[#2E343A] p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-[#E8E6E1]">
                      {well.id}
                    </span>
                    <span className="text-[9px] font-mono px-1 py-0.2 border border-[#2E343A] text-[#C9B896]">
                      {well.pad}
                    </span>
                  </div>
                  {getStatusTag(well)}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8F94]">
                  <span>{well.cyclePhase} (C-{well.cycleNumber})</span>
                  <span>{well.daysSinceInjection} d post-inj</span>
                </div>

                {well.alertReason && (
                  <div className="text-[9px] font-mono text-[#8C2F2F] bg-[#14171A] p-1 border border-[#8C2F2F] mt-1 leading-tight">
                    {well.alertReason}
                  </div>
                )}
              </div>

              {/* Metric 1: Production Trend (Shared Scale: 0 - 150 BOPD) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8A8F94]">
                  <span className="font-semibold text-[#E8E6E1]">1. DAILY PRODUCTION</span>
                  <span className="text-[#C9B896]">{well.oilRateBOPD} BOPD</span>
                </div>
                <ComparisonLineChart
                  data={prodPoints}
                  minY={COMPARISON_SCALES.production.min}
                  maxY={COMPARISON_SCALES.production.max}
                  yTicks={COMPARISON_SCALES.production.ticks as unknown as number[]}
                  color="#C9B896" // Desert sand flat line
                  height={95}
                  currentValue={well.oilRateBOPD}
                  unit="BOPD"
                />
              </div>

              {/* Metric 2: Steam-Oil Ratio (SOR) Trend (Shared Scale: 1.0 - 6.0 m³/m³) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8A8F94]">
                  <span className="font-semibold text-[#E8E6E1]">2. STEAM-OIL RATIO (SOR)</span>
                  <span className="text-[#C8551D]">{well.steamOilRatio} m³/m³</span>
                </div>
                <ComparisonLineChart
                  data={sorPoints}
                  minY={COMPARISON_SCALES.sor.min}
                  maxY={COMPARISON_SCALES.sor.max}
                  yTicks={COMPARISON_SCALES.sor.ticks as unknown as number[]}
                  color="#C8551D" // Rig-orange flat line
                  height={95}
                  currentValue={well.steamOilRatio}
                  unit="m³/m³"
                />
              </div>

              {/* Metric 3: Temperature Decay Curve (Shared Scale: 60 - 260 °C) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8A8F94]">
                  <span className="font-semibold text-[#E8E6E1]">3. TEMPERATURE DECAY</span>
                  <span className={well.bottomholeTempC >= 200 ? 'text-[#C8551D] font-bold' : 'text-[#E8E6E1]'}>
                    {well.bottomholeTempC} °C
                  </span>
                </div>
                <ComparisonLineChart
                  data={tempPoints}
                  minY={COMPARISON_SCALES.temperature.min}
                  maxY={COMPARISON_SCALES.temperature.max}
                  yTicks={COMPARISON_SCALES.temperature.ticks as unknown as number[]}
                  color="#C8551D" // Burnt oxide flat line
                  height={95}
                  currentValue={well.bottomholeTempC}
                  unit="°C"
                />
              </div>

              {/* Metric 4: Rod Load History (Shared Scale: 0 - 26,000 lbs) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8A8F94]">
                  <span className="font-semibold text-[#E8E6E1]">4. ROD LOAD (PEAK vs MIN)</span>
                  <span className={well.minRodLoadLbs < 1500 ? 'text-[#8C2F2F] font-bold' : 'text-[#E8E6E1]'}>
                    {well.minRodLoadLbs} lb min
                  </span>
                </div>
                <ComparisonLineChart
                  data={peakRodPoints}
                  minY={COMPARISON_SCALES.rodLoad.min}
                  maxY={COMPARISON_SCALES.rodLoad.max}
                  yTicks={COMPARISON_SCALES.rodLoad.ticks as unknown as number[]}
                  color="#E8E6E1" // Peak load in off-white
                  secondData={minRodPoints}
                  secondColor={well.minRodLoadLbs < 1500 ? '#8C2F2F' : '#3A5F45'} // Min load in warning-red or safety-green
                  thresholdLine={1500}
                  thresholdLabel="ROD FLOAT (1.5k)"
                  height={105}
                  currentValue={`${well.polishedRodLoadLbs.toLocaleString()} / ${well.minRodLoadLbs}`}
                  unit="lbs"
                />
                <div className="flex items-center justify-between text-[8px] font-mono text-[#5F656B] px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-0.5 bg-[#E8E6E1]" />
                    <span>PEAK LOAD</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-0.5 bg-[#8C2F2F]" />
                    <span>MIN LOAD (DOWNSTROKE)</span>
                  </div>
                </div>
              </div>

              {/* Column Footer: Direct Navigation Action */}
              <div className="pt-2 border-t border-[#2E343A]">
                <button
                  onClick={() => onNavigateToWell && onNavigateToWell(well.id)}
                  className="w-full py-1.5 px-3 bg-[#14171A] hover:bg-[#272E34] text-[#E8E6E1] hover:text-[#C8551D] border border-[#2E343A] hover:border-[#C8551D] text-[10px] font-mono font-bold tracking-wider uppercase transition-none flex items-center justify-center gap-1.5"
                >
                  <span>INSPECT TWIN: {well.id}</span>
                  <ChevronRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

export default WellComparisonPage;
