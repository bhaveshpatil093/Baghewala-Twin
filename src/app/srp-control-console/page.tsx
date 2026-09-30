import React, { useState, useMemo } from 'react';
import PageHeader from '@/src/components/layout/PageHeader';
import { BAGHEWALA_WELLS, WellData } from '@/src/data/wellsData';
import { useSimulation } from '@/src/context/SimulationContext';
import LastUpdatedBadge from '@/src/components/shared/LastUpdatedBadge';
import DynamometerCardPanel from '@/src/components/digital-twin/DynamometerCardPanel';
import SrpLiveControlPanel from '@/src/components/digital-twin/SrpLiveControlPanel';
import SrpRecommendedAdjustmentCard from '@/src/components/digital-twin/SrpRecommendedAdjustmentCard';
import EmptyState from '@/src/components/shared/EmptyState';
import SkeletonBlock from '@/src/components/shared/SkeletonBlock';
import { 
  Activity, 
  Search, 
  Filter, 
  RotateCcw, 
  Sliders, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  ArrowRight,
  Zap,
  Gauge
} from 'lucide-react';

interface SrpControlConsolePageProps {
  onNavigateToWell?: (wellId: string) => void;
}

export default function SrpControlConsolePage({ onNavigateToWell }: SrpControlConsolePageProps = {}) {
  const { simulatedWellsList } = useSimulation();
  const [selectedWellId, setSelectedWellId] = useState<string>('BGW-09');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadStatusFilter, setLoadStatusFilter] = useState<'ALL' | 'NOMINAL' | 'OVERLOAD' | 'ROD_FLOAT'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedWell = useMemo(() => {
    return simulatedWellsList.find(w => w.id === selectedWellId) || simulatedWellsList[0];
  }, [simulatedWellsList, selectedWellId]);

  // Filtered wells for fleet SRP status table
  const filteredSrpWells = useMemo(() => {
    return simulatedWellsList.filter(w => {
      if (loadStatusFilter !== 'ALL') {
        if (loadStatusFilter === 'ROD_FLOAT' && !w.rodFloatingRisk) return false;
        if (loadStatusFilter === 'OVERLOAD' && w.rodLoadStatus !== 'HIGH LOAD') return false;
        if (loadStatusFilter === 'NOMINAL' && (w.rodFloatingRisk || w.rodLoadStatus !== 'NOMINAL')) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return w.id.toLowerCase().includes(q) || w.pad.toLowerCase().includes(q);
      }
      return true;
    });
  }, [simulatedWellsList, loadStatusFilter, searchQuery]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  // Fleet SRP stats derived from live physical simulation
  const activeSrpCount = simulatedWellsList.filter(w => w.cyclePhase === 'Production (SRP)').length;
  const rodFloatCount = simulatedWellsList.filter(w => w.rodFloatingRisk).length;
  const peakHighCount = simulatedWellsList.filter(w => w.rodLoadStatus === 'HIGH LOAD').length;
  const nominalCount = simulatedWellsList.filter(w => !w.rodFloatingRisk && w.rodLoadStatus === 'NOMINAL').length;

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-3 font-mono select-none">
      {/* Page Header */}
      <PageHeader
        code="NAV-05"
        title="SRP CONTROL CONSOLE"
        subtitle="Surface Sucker Rod Pumping Unit Operations · Dynamometer Card Diagnostics & VFD Kinematics"
        badge="SRP-SURFACE"
        statusText={`FLEET SRP: ${activeSrpCount} ACTIVE · ${nominalCount} NOMINAL · ${rodFloatCount} ROD FLOAT ALERTS`}
      />

      {/* 1. TOP TELEMETRY KPI STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[10px]">
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#3A5F45] p-2.5 flex items-center justify-between" style={{ borderRadius: 0 }}>
          <div>
            <span className="text-[#8A8F94] block uppercase">NOMINAL PUMPING UNITS</span>
            <span className="text-xl font-bold text-[#3A5F45]">{nominalCount} WELLS</span>
          </div>
          <Activity className="w-4 h-4 text-[#3A5F45]" />
        </div>

        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#8C2F2F] p-2.5 flex items-center justify-between" style={{ borderRadius: 0 }}>
          <div>
            <span className="text-[#8A8F94] block uppercase">ROD FLOAT HAZARD (MPRL &lt; 2k)</span>
            <span className="text-xl font-bold text-[#8C2F2F]">{rodFloatCount} WELLS</span>
          </div>
          <ShieldAlert className="w-4 h-4 text-[#8C2F2F]" />
        </div>

        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#C8551D] p-2.5 flex items-center justify-between" style={{ borderRadius: 0 }}>
          <div>
            <span className="text-[#8A8F94] block uppercase">HIGH TORQUE LOAD</span>
            <span className="text-xl font-bold text-[#C8551D]">{peakHighCount} WELLS</span>
          </div>
          <AlertTriangle className="w-4 h-4 text-[#C8551D]" />
        </div>

        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#C9B896] p-2.5 flex items-center justify-between" style={{ borderRadius: 0 }}>
          <div>
            <span className="text-[#8A8F94] block uppercase">TOTAL SRP PRODUCING</span>
            <span className="text-xl font-bold text-[#E8E6E1]">{activeSrpCount} WELLS</span>
          </div>
          <Sliders className="w-4 h-4 text-[#C9B896]" />
        </div>
      </div>

      {/* 2. WELL SELECTOR STRIP */}
      <div className="bg-[#191D21] border border-[#2E343A] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="text-[#8A8F94] uppercase font-bold">INSPECT UNIT:</span>
          <select
            value={selectedWell.id}
            onChange={(e) => setSelectedWellId(e.target.value)}
            className="bg-[#14171A] border border-[#2E343A] text-[#E8E6E1] font-bold px-2 py-1 outline-none cursor-pointer focus:border-[#C8551D]"
            style={{ borderRadius: 0 }}
          >
            {simulatedWellsList.map(w => (
              <option key={w.id} value={w.id} className="bg-[#191D21] text-[#E8E6E1]">
                {w.id} · {w.pad} [{w.strokeRateSPM} SPM · {w.pumpFillagePct}% FILL] {w.rodFloatingRisk ? '⚠ ROD FLOAT' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Live Metrics & SCADA Polling Indicator */}
        <div className="flex items-center gap-3 text-[9px] text-[#8A8F94] flex-wrap">
          <LastUpdatedBadge label="SCADA RTU" pollIntervalSec={3} onRefresh={handleRefresh} />
          <span>SPM: <strong className="text-[#E8E6E1]">{selectedWell.strokeRateSPM}</strong></span>
          <span>FILLAGE: <strong className="text-[#C9B896]">{selectedWell.pumpFillagePct}%</strong></span>
          <span>MPRL: <strong className={selectedWell.minRodLoadLbs < 2000 ? 'text-[#DE5959]' : 'text-[#4E9B68]'}>{selectedWell.minRodLoadLbs} lbs</strong></span>
          <span>PPRL: <strong className="text-[#E8E6E1]">{selectedWell.polishedRodLoadLbs} lbs</strong></span>
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

      {/* 3. DYNOCARDS & VFD CONTROL DUAL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        <DynamometerCardPanel well={selectedWell} />
        <div className="space-y-3">
          <SrpLiveControlPanel well={selectedWell} />
          <SrpRecommendedAdjustmentCard well={selectedWell} />
        </div>
      </div>

      {/* 4. FLEET SRP UNIT LOAD QUEUE TABLE */}
      <div className="bg-[#191D21] border border-[#2E343A] flex flex-col" style={{ borderRadius: 0 }}>
        {/* Table Filter Toolbar */}
        <div className="p-2.5 bg-[#14171A] border-b border-[#2E343A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9px]">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[#5F656B] uppercase font-bold">LOAD FILTER:</span>
            {(['ALL', 'NOMINAL', 'ROD_FLOAT', 'OVERLOAD'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setLoadStatusFilter(f)}
                className={`px-2 py-0.5 border uppercase font-bold transition-none ${
                  loadStatusFilter === f
                    ? 'border-[#C8551D] bg-[#C8551D] text-[#FFFFFF]'
                    : 'border-[#2E343A] bg-[#191D21] text-[#8A8F94] hover:text-[#E8E6E1]'
                }`}
                style={{ borderRadius: 0 }}
              >
                {f.replace('_', ' ')}
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
                placeholder="SEARCH WELL..."
                className="bg-[#191D21] border border-[#2E343A] pl-7 pr-2 py-0.5 text-[9px] text-[#E8E6E1] placeholder-[#5F656B] outline-none focus:border-[#C8551D] w-36"
                style={{ borderRadius: 0 }}
              />
            </div>
            <LastUpdatedBadge label="LOAD QUEUE" pollIntervalSec={3} onRefresh={handleRefresh} />
          </div>
        </div>

        {/* Table Column Headers */}
        <div className="grid grid-cols-12 gap-2 p-2 bg-[#14171A] border-b border-[#2E343A] text-[8.5px] text-[#5F656B] uppercase font-bold">
          <div className="col-span-2">WELL ID &amp; PAD</div>
          <div className="col-span-2">SPM &amp; STROKE</div>
          <div className="col-span-2">PUMP FILLAGE</div>
          <div className="col-span-2 text-right">PEAK LOAD (PPRL)</div>
          <div className="col-span-2 text-right">MIN LOAD (MPRL)</div>
          <div className="col-span-2 text-right">STATUS / ACTION</div>
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
        ) : filteredSrpWells.length === 0 ? (
          <EmptyState
            icon={Activity}
            message="No SRP telemetry records match load criteria"
            subMessage="Modify active load status filter or search parameters to inspect beam pump kinematics."
            actionText={loadStatusFilter !== 'ALL' || searchQuery ? 'RESET FILTERS' : undefined}
            onAction={() => {
              setLoadStatusFilter('ALL');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="divide-y divide-[#252B30] text-xs">
            {filteredSrpWells.slice(0, 10).map(w => (
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
                  {w.strokeRateSPM} SPM · 168 in
                </div>
                <div className="col-span-2 text-[9px]">
                  <span className={`font-bold ${w.pumpFillagePct < 70 ? 'text-[#C8551D]' : 'text-[#3A5F45]'}`}>
                    {w.pumpFillagePct}%
                  </span>
                </div>
                <div className="col-span-2 text-right text-[10px] text-[#E8E6E1]">
                  {w.polishedRodLoadLbs.toLocaleString()} lbs
                </div>
                <div className="col-span-2 text-right text-[10px] font-bold">
                  <span className={w.minRodLoadLbs < 2000 ? 'text-[#8C2F2F]' : 'text-[#E8E6E1]'}>
                    {w.minRodLoadLbs.toLocaleString()} lbs
                  </span>
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
