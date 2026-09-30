import React, { useState, useMemo } from 'react';
import PageHeader from '@/src/components/layout/PageHeader';
import { BAGHEWALA_WELLS, WellData } from '@/src/data/wellsData';
import CssCycleTimeline from '@/src/components/digital-twin/CssCycleTimeline';
import RecommendedCssCyclePanel from '@/src/components/digital-twin/RecommendedCssCyclePanel';
import EmptyState from '@/src/components/shared/EmptyState';
import SkeletonBlock from '@/src/components/shared/SkeletonBlock';
import { 
  Flame, 
  Clock, 
  Calendar, 
  Activity, 
  CheckCircle2, 
  Search, 
  Filter, 
  RotateCcw, 
  ArrowRight,
  Gauge,
  Sliders,
  Zap,
  Info
} from 'lucide-react';

interface CssCyclePlannerPageProps {
  onNavigateToWell?: (wellId: string) => void;
}

export default function CssCyclePlannerPage({ onNavigateToWell }: CssCyclePlannerPageProps = {}) {
  const [selectedWellId, setSelectedWellId] = useState<string>('BGW-09');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [phaseFilter, setPhaseFilter] = useState<'ALL' | 'Injection' | 'Soaking' | 'Production (SRP)'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedWell = useMemo(() => {
    return BAGHEWALA_WELLS.find(w => w.id === selectedWellId) || BAGHEWALA_WELLS[0];
  }, [selectedWellId]);

  // Filtered wells list for the thermal schedule table
  const filteredScheduleWells = useMemo(() => {
    return BAGHEWALA_WELLS.filter(w => {
      if (phaseFilter !== 'ALL' && w.cyclePhase !== phaseFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return w.id.toLowerCase().includes(q) || w.pad.toLowerCase().includes(q);
      }
      return true;
    });
  }, [phaseFilter, searchQuery]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  // Fleet thermal stats
  const injectionCount = BAGHEWALA_WELLS.filter(w => w.cyclePhase === 'Injection').length;
  const soakCount = BAGHEWALA_WELLS.filter(w => w.cyclePhase === 'Soaking').length;
  const prodCount = BAGHEWALA_WELLS.filter(w => w.cyclePhase === 'Production (SRP)').length;
  const avgSOR = (BAGHEWALA_WELLS.reduce((acc, w) => acc + w.steamOilRatio, 0) / BAGHEWALA_WELLS.length).toFixed(2);

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-3 font-mono select-none">
      {/* Page Header */}
      <PageHeader
        code="NAV-04"
        title="CSS CYCLE PLANNER"
        subtitle="Cyclic Steam Stimulation Multi-Phase Thermal Management · Injection, Soak & Production Sequencing"
        badge="THERMAL-CSS"
        statusText={`STATUS: ${injectionCount} STEAM INJECTING · ${soakCount} SHUT-IN SOAK · ${prodCount} SRP ACTIVE`}
      />

      {/* 1. TOP THERMAL FLEET KPI STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[10px]">
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#C8551D] p-2.5 flex items-center justify-between" style={{ borderRadius: 0 }}>
          <div>
            <span className="text-[#8A8F94] block uppercase">STEAM INJECTION ACTIVE</span>
            <span className="text-xl font-bold text-[#C8551D]">{injectionCount} WELLS</span>
          </div>
          <Flame className="w-4 h-4 text-[#C8551D]" />
        </div>

        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#C9B896] p-2.5 flex items-center justify-between" style={{ borderRadius: 0 }}>
          <div>
            <span className="text-[#8A8F94] block uppercase">SHUT-IN SOAK PHASE</span>
            <span className="text-xl font-bold text-[#C9B896]">{soakCount} WELLS</span>
          </div>
          <Clock className="w-4 h-4 text-[#C9B896]" />
        </div>

        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#3A5F45] p-2.5 flex items-center justify-between" style={{ borderRadius: 0 }}>
          <div>
            <span className="text-[#8A8F94] block uppercase">POST-STEAM SRP PRODUCTION</span>
            <span className="text-xl font-bold text-[#3A5F45]">{prodCount} WELLS</span>
          </div>
          <Activity className="w-4 h-4 text-[#3A5F45]" />
        </div>

        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#C8551D] p-2.5 flex items-center justify-between" style={{ borderRadius: 0 }}>
          <div>
            <span className="text-[#8A8F94] block uppercase">FLEET AVG SOR</span>
            <span className="text-xl font-bold text-[#E8E6E1]">{avgSOR} m³/m³</span>
          </div>
          <span className="text-[8px] text-[#5F656B]">TARGET &lt; 3.5</span>
        </div>
      </div>

      {/* 2. WELL SELECTOR & TIMELINE INSPECTOR */}
      <div className="bg-[#191D21] border border-[#2E343A] p-3 space-y-3" style={{ borderRadius: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8F94] uppercase font-bold">SELECT TARGET WELL:</span>
            <select
              value={selectedWell.id}
              onChange={(e) => setSelectedWellId(e.target.value)}
              className="bg-[#14171A] border border-[#2E343A] text-[#E8E6E1] font-bold px-2 py-1 outline-none cursor-pointer focus:border-[#C8551D]"
              style={{ borderRadius: 0 }}
            >
              {BAGHEWALA_WELLS.map(w => (
                <option key={w.id} value={w.id} className="bg-[#191D21] text-[#E8E6E1]">
                  {w.id} · {w.pad} [CYCLE {w.cycleNumber} - {w.cyclePhase.toUpperCase()}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-[9px] text-[#8A8F94] flex-wrap">
            <span>PAD: <strong className="text-[#C9B896]">{selectedWell.pad}</strong></span>
            <span>BHT: <strong className="text-[#E8E6E1]">{selectedWell.bottomholeTempC}°C</strong></span>
            <span>SOR: <strong className="text-[#C8551D]">{selectedWell.steamOilRatio}</strong></span>
            {onNavigateToWell && (
              <button
                type="button"
                onClick={() => onNavigateToWell(selectedWell.id)}
                className="px-2.5 py-1 bg-[#C8551D] hover:bg-[#D9652D] text-white text-[9px] font-bold uppercase transition-none flex items-center gap-1 cursor-pointer ml-1"
                style={{ borderRadius: 0 }}
                title={`Open Digital Twin for ${selectedWell.id}`}
              >
                <span>OPEN DIGITAL TWIN ({selectedWell.id})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Two-column layout: Timeline on left, Recommended Next Strategy on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          <CssCycleTimeline well={selectedWell} />
          <RecommendedCssCyclePanel well={selectedWell} />
        </div>
      </div>

      {/* 3. FIELD-WIDE CSS STAGE QUEUE TABLE */}
      <div className="bg-[#191D21] border border-[#2E343A] flex flex-col" style={{ borderRadius: 0 }}>
        {/* Table Filter Toolbar */}
        <div className="p-2.5 bg-[#14171A] border-b border-[#2E343A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9px]">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[#5F656B] uppercase font-bold">STAGE FILTER:</span>
            {(['ALL', 'Injection', 'Soaking', 'Production (SRP)'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPhaseFilter(p)}
                className={`px-2 py-0.5 border uppercase font-bold transition-none ${
                  phaseFilter === p
                    ? 'border-[#C8551D] bg-[#C8551D] text-[#FFFFFF]'
                    : 'border-[#2E343A] bg-[#191D21] text-[#8A8F94] hover:text-[#E8E6E1]'
                }`}
                style={{ borderRadius: 0 }}
              >
                {p === 'Production (SRP)' ? 'PRODUCTION' : p.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1.5 w-3 h-3 text-[#5F656B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH WELL OR PAD..."
                className="bg-[#191D21] border border-[#2E343A] pl-7 pr-2 py-0.5 text-[9px] text-[#E8E6E1] placeholder-[#5F656B] outline-none focus:border-[#C8551D] w-36"
                style={{ borderRadius: 0 }}
              />
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="px-2 py-0.5 bg-[#191D21] border border-[#2E343A] hover:border-[#C8551D] text-[#8A8F94] hover:text-[#E8E6E1] text-[9px] uppercase font-bold"
              style={{ borderRadius: 0 }}
            >
              REFRESH
            </button>
          </div>
        </div>

        {/* Table Column Headers */}
        <div className="grid grid-cols-12 gap-2 p-2 bg-[#14171A] border-b border-[#2E343A] text-[8.5px] text-[#5F656B] uppercase font-bold">
          <div className="col-span-2">WELL ID &amp; PAD</div>
          <div className="col-span-2">CYCLE NUMBER</div>
          <div className="col-span-2">CURRENT PHASE</div>
          <div className="col-span-2 text-right">DAYS POST-INJ</div>
          <div className="col-span-2 text-right">BHT (°C)</div>
          <div className="col-span-2 text-right">ACTION</div>
        </div>

        {/* Loading & Empty State Handling */}
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2 bg-[#14171A] border border-[#2E343A]">
                <SkeletonBlock className="col-span-2 h-4" />
                <SkeletonBlock className="col-span-2 h-4" />
                <SkeletonBlock className="col-span-2 h-4" />
                <SkeletonBlock className="col-span-2 h-4" />
                <SkeletonBlock className="col-span-2 h-4" />
                <SkeletonBlock className="col-span-2 h-4" />
              </div>
            ))}
          </div>
        ) : filteredScheduleWells.length === 0 ? (
          <EmptyState
            icon={Flame}
            message="No wells match thermal phase query criteria"
            subMessage="Modify phase filter selection or clear well search query to display CSS thermal records."
            actionText={phaseFilter !== 'ALL' || searchQuery ? 'RESET FILTERS' : undefined}
            onAction={() => {
              setPhaseFilter('ALL');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="divide-y divide-[#252B30] text-xs">
            {filteredScheduleWells.slice(0, 10).map(w => (
              <div
                key={w.id}
                onClick={() => setSelectedWellId(w.id)}
                className={`grid grid-cols-12 gap-2 p-2.5 items-center cursor-pointer transition-none ${
                  selectedWell.id === w.id
                    ? 'bg-[#1E2328] border-l-2 border-l-[#C8551D]'
                    : 'bg-[#191D21] hover:bg-[#1E2328]'
                }`}
              >
                <div className="col-span-2 flex items-center gap-1.5 font-bold text-[#E8E6E1]">
                  <span>{w.id}</span>
                  <span className="text-[8px] text-[#5F656B] border border-[#2E343A] px-1">{w.pad}</span>
                </div>
                <div className="col-span-2 text-[9px] text-[#C9B896]">
                  {w.cycleNumber <= 0 ? 'CYCLE 00 (VIRGIN)' : `CYCLE 0${w.cycleNumber}`}
                </div>
                <div className="col-span-2 text-[9px]">
                  <span className={`px-1.5 py-0.2 border text-[8px] font-bold uppercase ${
                    w.cyclePhase === 'Injection'
                      ? 'border-[#C8551D] text-[#C8551D]'
                      : w.cyclePhase === 'Soaking'
                      ? 'border-[#C9B896] text-[#C9B896]'
                      : w.cyclePhase === 'Shut-in'
                      ? 'border-[#2E343A] text-[#C9B896]'
                      : 'border-[#3A5F45] text-[#3A5F45]'
                  }`}>
                    {w.cycleNumber <= 0 ? 'PRE-THERMAL' : w.cyclePhase === 'Production (SRP)' ? 'PRODUCTION' : w.cyclePhase.toUpperCase()}
                  </span>
                </div>
                <div className="col-span-2 text-right text-[10px] text-[#E8E6E1]">
                  {w.cycleNumber <= 0 ? 'PRE-INJ' : `${w.daysSinceInjection} d`}
                </div>
                <div className="col-span-2 text-right text-[10px] font-bold text-[#E8E6E1]">
                  {w.bottomholeTempC} °C
                </div>
                <div className="col-span-2 text-right flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWellId(w.id);
                    }}
                    className="px-2 py-0.5 bg-[#14171A] hover:bg-[#252B30] border border-[#2E343A] text-[8.5px] uppercase font-bold text-[#C9B896]"
                    style={{ borderRadius: 0 }}
                  >
                    SELECT
                  </button>
                  {onNavigateToWell && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToWell(w.id);
                      }}
                      className="px-2 py-0.5 bg-[#191D21] hover:bg-[#C8551D] hover:text-white border border-[#C8551D] text-[8.5px] uppercase font-bold text-[#C8551D] transition-none flex items-center gap-0.5"
                      style={{ borderRadius: 0 }}
                      title={`Open Digital Twin for ${w.id}`}
                    >
                      <span>TWIN</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
