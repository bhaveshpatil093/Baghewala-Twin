import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronRight, 
  Filter, 
  Terminal, 
  Activity, 
  Flame, 
  AlertTriangle,
  AlertOctagon,
  Check,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';
import PageHeader from '@/src/components/layout/PageHeader';
import { BAGHEWALA_WELLS, WellData, WellStatus } from '@/src/data/wellsData';
import { useSimulation } from '@/src/context/SimulationContext';
import LastUpdatedBadge from '@/src/components/shared/LastUpdatedBadge';
import WellHealthScorecard from '@/src/components/shared/WellHealthScorecard';
import EmptyState from '@/src/components/shared/EmptyState';
import SkeletonBlock from '@/src/components/shared/SkeletonBlock';
import DS from '@/src/design-system';

interface WellFleetPageProps {
  onNavigateToWell?: (wellId: string) => void;
  onNavigateToComparison?: () => void;
}

type SortField = 
  | 'id' 
  | 'cycleNumber' 
  | 'daysSinceInjection' 
  | 'bottomholeTempC' 
  | 'strokeRateSPM' 
  | 'pumpFillagePct' 
  | 'rodLoadStatus' 
  | 'steamOilRatio' 
  | 'oilRateBOPD' 
  | 'status';

export const WellFleetPage: React.FC<WellFleetPageProps> = ({ onNavigateToWell, onNavigateToComparison }) => {
  const { simulatedWellsList } = useSimulation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | WellStatus | 'INJ_SOAK'>('ALL');
  const [padFilter, setPadFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Status counts for industrial terminal chips from live simulation
  const totalCount = simulatedWellsList.length;
  const normalCount = simulatedWellsList.filter(w => w.status === 'normal' && w.cyclePhase === 'Production (SRP)').length;
  const alertCount = simulatedWellsList.filter(w => w.status === 'alert').length;
  const faultCount = simulatedWellsList.filter(w => w.status === 'fault').length;
  const thermalCount = simulatedWellsList.filter(w => w.cyclePhase === 'Injection' || w.cyclePhase === 'Soaking').length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter and Sort Pipeline
  const filteredWells = useMemo(() => {
    return simulatedWellsList.filter((well) => {
      // Search query filter (matches ID, pad, phase, rod load status, or alert reason)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        well.id.toLowerCase().includes(q) ||
        well.pad.toLowerCase().includes(q) ||
        well.cyclePhase.toLowerCase().includes(q) ||
        well.rodLoadStatus.toLowerCase().includes(q) ||
        (well.alertReason && well.alertReason.toLowerCase().includes(q));

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'ALL') {
        matchesStatus = true;
      } else if (statusFilter === 'INJ_SOAK') {
        matchesStatus = well.cyclePhase === 'Injection' || well.cyclePhase === 'Soaking';
      } else {
        matchesStatus = well.status === statusFilter;
      }

      // Pad filter
      const matchesPad = padFilter === 'ALL' || well.pad === padFilter;

      return matchesSearch && matchesStatus && matchesPad;
    }).sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
          break;
        case 'cycleNumber':
          comparison = a.cycleNumber - b.cycleNumber;
          break;
        case 'daysSinceInjection':
          comparison = a.daysSinceInjection - b.daysSinceInjection;
          break;
        case 'bottomholeTempC':
          comparison = a.bottomholeTempC - b.bottomholeTempC;
          break;
        case 'strokeRateSPM':
          comparison = a.strokeRateSPM - b.strokeRateSPM;
          break;
        case 'pumpFillagePct':
          comparison = a.pumpFillagePct - b.pumpFillagePct;
          break;
        case 'rodLoadStatus':
          comparison = a.rodLoadStatus.localeCompare(b.rodLoadStatus);
          break;
        case 'steamOilRatio':
          comparison = a.steamOilRatio - b.steamOilRatio;
          break;
        case 'oilRateBOPD':
          comparison = a.oilRateBOPD - b.oilRateBOPD;
          break;
        case 'status':
          const order = { fault: 0, alert: 1, normal: 2 };
          comparison = order[a.status] - order[b.status];
          break;
        default:
          comparison = 0;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [searchQuery, statusFilter, padFilter, sortField, sortAsc]);

  // Aggregate stats of filtered set
  const filteredBOPD = filteredWells.reduce((sum, w) => sum + w.oilRateBOPD, 0);
  const avgTemp = filteredWells.length > 0 
    ? Math.round(filteredWells.reduce((sum, w) => sum + w.bottomholeTempC, 0) / filteredWells.length) 
    : 0;
  const avgSOR = filteredWells.length > 0 
    ? (filteredWells.reduce((sum, w) => sum + w.steamOilRatio, 0) / filteredWells.length).toFixed(2)
    : '0.00';

  const renderSortArrow = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown strokeWidth={1.25} className="w-3 h-3 text-[#5F656B] inline ml-1 opacity-60" />;
    }
    return sortAsc ? (
      <ArrowUp strokeWidth={1.5} className="w-3 h-3 text-[#C8551D] inline ml-1" />
    ) : (
      <ArrowDown strokeWidth={1.5} className="w-3 h-3 text-[#C8551D] inline ml-1" />
    );
  };

  const getStatusBadge = (well: WellData) => {
    if (well.status === 'fault') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#8C2F2F] bg-[#14171A] text-[#DE5959] font-mono text-[9px] font-bold tracking-wider uppercase">
          <AlertOctagon className="w-2.5 h-2.5 text-[#DE5959]" />
          <span>CRIT FAULT</span>
        </span>
      );
    }
    if (well.status === 'alert') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#C8551D] bg-[#14171A] text-[#D96B27] font-mono text-[9px] font-bold tracking-wider uppercase">
          <AlertTriangle className="w-2.5 h-2.5 text-[#D96B27]" />
          <span>ALERT</span>
        </span>
      );
    }
    if (well.cyclePhase === 'Injection' || well.cyclePhase === 'Soaking') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#2E343A] bg-[#14171A] text-[#C9B896] font-mono text-[9px] font-semibold tracking-wider uppercase">
          <Flame className="w-2.5 h-2.5 text-[#C9B896]" />
          <span>{well.cyclePhase === 'Injection' ? 'STEAM INJ' : 'SOAKING'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#3A5F45] bg-[#14171A] text-[#4E9B68] font-mono text-[9px] font-bold tracking-wider uppercase">
        <Check className="w-2.5 h-2.5 text-[#4E9B68]" />
        <span>NORMAL</span>
      </span>
    );
  };

  const getRodLoadBadge = (well: WellData) => {
    switch (well.rodLoadStatus) {
      case 'ROD FLOAT':
        return (
          <span className="font-mono text-[#DE5959] font-bold inline-flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-[#DE5959] shrink-0" />
            <span>ROD FLOAT [{well.minRodLoadLbs} lb]</span>
          </span>
        );
      case 'COMPRESSION':
        return (
          <span className="font-mono text-[#D96B27] font-bold inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#D96B27] shrink-0" />
            <span>COMPRESSION [{well.minRodLoadLbs} lb]</span>
          </span>
        );
      case 'HIGH LOAD':
        return (
          <span className="font-mono text-[#D96B27] inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#D96B27] shrink-0" />
            <span>HIGH LOAD [{well.polishedRodLoadLbs.toLocaleString()} lb]</span>
          </span>
        );
      case 'INJ / SOAK':
        return (
          <span className="font-mono text-[#8A8F94] inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#8A8F94] shrink-0" />
            <span>PUMP OFFLINE</span>
          </span>
        );
      default:
        return (
          <span className="font-mono text-[#8A8F94] inline-flex items-center gap-1">
            <Check className="w-3 h-3 text-[#4E9B68] shrink-0" />
            <span>NOMINAL [{well.minRodLoadLbs} lb]</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-3">
      {/* Page Header */}
      <PageHeader
        code="NAV-02"
        title="WELL FLEET // TELEMETRY TERMINAL MATRIX"
        subtitle="Full 35-well telemetry dataset · Jodhpur Heavy Oil Sector · SCADA RTU-01 Synchronization"
        badge="BAGHEWALA-ROSTER"
        statusText="35 WELLS STREAMING"
      />

      {/* Industrial Terminal Controls Bar */}
      <div className="bg-[#1F2428] border border-[#2E343A] p-3 space-y-3">
        {/* Top Controls: Search Input & Pad Selector */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Text Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#8A8F94]">
              <Search strokeWidth={1.25} className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH WELL ID, PAD, OR ANOMALY..."
              className="w-full bg-[#14171A] border border-[#2E343A] focus:border-[#C8551D] pl-8 pr-3 py-1.5 text-xs font-mono text-[#E8E6E1] placeholder-[#5F656B] outline-none transition-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center font-mono text-[10px] text-[#8A8F94] hover:text-[#E8E6E1]"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Pad Filter Selector & Compare Wells Shortcut */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-[#8A8F94] uppercase">PAD SECTOR:</span>
              <div className="flex border border-[#2E343A] bg-[#14171A]">
                {['ALL', 'Pad-01', 'Pad-02', 'Pad-03', 'Pad-04', 'Pad-05'].map((pad) => (
                  <button
                    key={pad}
                    onClick={() => setPadFilter(pad)}
                    className={`px-2 py-1 text-[9px] font-mono transition-none ${
                      padFilter === pad
                        ? 'bg-[#C8551D] text-[#E8E6E1] font-bold'
                        : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#272E34]'
                    }`}
                  >
                    {pad}
                  </button>
                ))}
              </div>
            </div>

            {onNavigateToComparison && (
              <button
                onClick={onNavigateToComparison}
                className="px-2.5 py-1 bg-[#14171A] hover:bg-[#272E34] text-[#C9B896] hover:text-[#E8E6E1] border border-[#2E343A] hover:border-[#C8551D] text-[10px] font-mono font-bold uppercase transition-none"
              >
                COMPARE WELLS (SMALL MULTIPLES) →
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Chips (Squared, Not Pill-Shaped) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2E343A]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-[#8A8F94] mr-1">
              STATUS FILTER:
            </span>

            {/* ALL Chip */}
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 text-[10px] font-mono border transition-none flex items-center gap-1.5 ${
                statusFilter === 'ALL'
                  ? 'border-[#C8551D] bg-[#272E34] text-[#E8E6E1] font-bold'
                  : 'border-[#2E343A] bg-[#14171A] text-[#8A8F94] hover:text-[#E8E6E1]'
              }`}
            >
              <span>ALL WELLS</span>
              <span className="text-[#C9B896]">({totalCount})</span>
            </button>

            {/* NORMAL Chip */}
            <button
              onClick={() => setStatusFilter('normal')}
              className={`px-2.5 py-1 text-[10px] font-mono border transition-none flex items-center gap-1.5 ${
                statusFilter === 'normal'
                  ? 'border-[#3A5F45] bg-[#272E34] text-[#3A5F45] font-bold'
                  : 'border-[#2E343A] bg-[#14171A] text-[#8A8F94] hover:text-[#E8E6E1]'
              }`}
            >
              <span className="w-2 h-2 bg-[#3A5F45]" />
              <span>NORMAL SRP</span>
              <span className="text-[#3A5F45] font-bold">({normalCount})</span>
            </button>

            {/* ALERT Chip */}
            <button
              onClick={() => setStatusFilter('alert')}
              className={`px-2.5 py-1 text-[10px] font-mono border transition-none flex items-center gap-1.5 ${
                statusFilter === 'alert'
                  ? 'border-[#C8551D] bg-[#272E34] text-[#C8551D] font-bold'
                  : 'border-[#2E343A] bg-[#14171A] text-[#8A8F94] hover:text-[#E8E6E1]'
              }`}
            >
              <span className="w-2 h-2 bg-[#C8551D]" />
              <span>WARNING</span>
              <span className="text-[#C8551D] font-bold">({alertCount})</span>
            </button>

            {/* CRITICAL FAULT Chip */}
            <button
              onClick={() => setStatusFilter('fault')}
              className={`px-2.5 py-1 text-[10px] font-mono border transition-none flex items-center gap-1.5 ${
                statusFilter === 'fault'
                  ? 'border-[#8C2F2F] bg-[#272E34] text-[#8C2F2F] font-bold'
                  : 'border-[#2E343A] bg-[#14171A] text-[#8A8F94] hover:text-[#E8E6E1]'
              }`}
            >
              <span className="w-2 h-2 bg-[#8C2F2F]" />
              <span>CRIT FAULT</span>
              <span className="text-[#8C2F2F] font-bold">({faultCount})</span>
            </button>

            {/* THERMAL INJECTION/SOAK Chip */}
            <button
              onClick={() => setStatusFilter('INJ_SOAK')}
              className={`px-2.5 py-1 text-[10px] font-mono border transition-none flex items-center gap-1.5 ${
                statusFilter === 'INJ_SOAK'
                  ? 'border-[#C9B896] bg-[#272E34] text-[#C9B896] font-bold'
                  : 'border-[#2E343A] bg-[#14171A] text-[#8A8F94] hover:text-[#E8E6E1]'
              }`}
            >
              <span className="w-2 h-2 bg-[#C9B896]" />
              <span>CSS INJ / SOAK</span>
              <span className="text-[#C9B896] font-bold">({thermalCount})</span>
            </button>
          </div>

          {/* Reset Filters Shortcut & SCADA Polling Indicator */}
          <div className="flex items-center gap-3">
            <LastUpdatedBadge label="SCADA" pollIntervalSec={3} />

            {(searchQuery || statusFilter !== 'ALL' || padFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setPadFilter('ALL');
                }}
                className="text-[10px] font-mono text-[#C8551D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw strokeWidth={1.25} className="w-3 h-3" />
                <span>RESET FILTERS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DENSE INDUSTRIAL DATA TERMINAL TABLE */}
      <div className="bg-[#1F2428] border border-[#2E343A] overflow-hidden flex flex-col flex-1">
        {/* Table Viewport Container */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-21rem)]">
          <table className="w-full text-left border-collapse select-none">
            {/* Table Header: Sticky, 1px Border, Monospace, Technical Styling */}
            <thead className="sticky top-0 bg-[#191D21] border-b border-[#2E343A] z-10 text-[10px] font-mono text-[#8A8F94] uppercase tracking-wider">
              <tr>
                {/* 1. Well ID */}
                <th 
                  onClick={() => handleSort('id')}
                  className="py-2.5 px-3 border-r border-[#2E343A] cursor-pointer hover:text-[#E8E6E1] whitespace-nowrap"
                >
                  <div className="flex items-center justify-between">
                    <span>WELL ID</span>
                    {renderSortArrow('id')}
                  </div>
                </th>

                {/* 2. CSS Cycle Number */}
                <th 
                  onClick={() => handleSort('cycleNumber')}
                  className="py-2.5 px-3 border-r border-[#2E343A] cursor-pointer hover:text-[#E8E6E1] whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end">
                    <span>CYCLE</span>
                    {renderSortArrow('cycleNumber')}
                  </div>
                </th>

                {/* 3. Days Since Last Steam Injection */}
                <th 
                  onClick={() => handleSort('daysSinceInjection')}
                  className="py-2.5 px-3 border-r border-[#2E343A] cursor-pointer hover:text-[#E8E6E1] whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end">
                    <span>DAYS POST-INJ</span>
                    {renderSortArrow('daysSinceInjection')}
                  </div>
                </th>

                {/* 4. Current Bottomhole Temp Estimate */}
                <th 
                  onClick={() => handleSort('bottomholeTempC')}
                  className="py-2.5 px-3 border-r border-[#2E343A] cursor-pointer hover:text-[#E8E6E1] whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end">
                    <span>BHT (°C)</span>
                    {renderSortArrow('bottomholeTempC')}
                  </div>
                </th>

                {/* 5. Current SPM */}
                <th 
                  onClick={() => handleSort('strokeRateSPM')}
                  className="py-2.5 px-3 border-r border-[#2E343A] cursor-pointer hover:text-[#E8E6E1] whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end">
                    <span>SPM</span>
                    {renderSortArrow('strokeRateSPM')}
                  </div>
                </th>

                {/* 6. Pump Fillage % */}
                <th 
                  onClick={() => handleSort('pumpFillagePct')}
                  className="py-2.5 px-3 border-r border-[#2E343A] cursor-pointer hover:text-[#E8E6E1] whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end">
                    <span>FILLAGE %</span>
                    {renderSortArrow('pumpFillagePct')}
                  </div>
                </th>

                {/* 7. Rod Load Status */}
                <th 
                  onClick={() => handleSort('rodLoadStatus')}
                  className="py-2.5 px-3 border-r border-[#2E343A] cursor-pointer hover:text-[#E8E6E1] whitespace-nowrap"
                >
                  <div className="flex items-center justify-between">
                    <span>ROD LOAD STATUS</span>
                    {renderSortArrow('rodLoadStatus')}
                  </div>
                </th>

                {/* 8. SOR */}
                <th 
                  onClick={() => handleSort('steamOilRatio')}
                  className="py-2.5 px-3 border-r border-[#2E343A] cursor-pointer hover:text-[#E8E6E1] whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end">
                    <span>SOR</span>
                    {renderSortArrow('steamOilRatio')}
                  </div>
                </th>

                {/* 9. Daily Production */}
                <th 
                  onClick={() => handleSort('oilRateBOPD')}
                  className="py-2.5 px-3 border-r border-[#2E343A] cursor-pointer hover:text-[#E8E6E1] whitespace-nowrap text-right"
                >
                  <div className="flex items-center justify-end">
                    <span>PROD (BOPD)</span>
                    {renderSortArrow('oilRateBOPD')}
                  </div>
                </th>

                {/* 10. Health Status tag */}
                <th 
                  onClick={() => handleSort('status')}
                  className="py-2.5 px-3 border-r border-[#2E343A] cursor-pointer hover:text-[#E8E6E1] whitespace-nowrap text-center"
                >
                  <div className="flex items-center justify-center">
                    <span>STATUS</span>
                    {renderSortArrow('status')}
                  </div>
                </th>

                {/* 11. 4D Well Health Scorecard (Compact horizontal gauges) */}
                <th className="py-2.5 px-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>HEALTH SCORECARD</span>
                    <span className="text-[8px] text-[#C8551D] border border-[#2E343A] px-1">[4D GAUGES]</span>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table Body: Flat rows, NO zebra striping, thin 1px row dividers */}
            <tbody className="divide-y divide-[#2E343A] text-xs font-mono">
              {filteredWells.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-6 px-4">
                    <EmptyState
                      icon={Search}
                      message="No well telemetry records match query parameters"
                      subMessage="Modify filter criteria or clear search term to display fleet telemetry records."
                      actionText="RESET FILTERS"
                      onAction={() => {
                        setSearchQuery('');
                        setStatusFilter('ALL');
                        setPadFilter('ALL');
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredWells.map((well) => {
                  const isFault = well.status === 'fault';
                  const isAlert = well.status === 'alert';

                  return (
                    <tr
                      key={well.id}
                      onClick={() => onNavigateToWell && onNavigateToWell(well.id)}
                      title={`Click to inspect Digital Twin deep-dive for ${well.id}`}
                      className="bg-[#1F2428] hover:bg-[#272E34] cursor-pointer transition-none group"
                    >
                      {/* 1. Well ID & Pad */}
                      <td className="py-2 px-3 border-r border-[#2E343A] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigateToWell) onNavigateToWell(well.id);
                            }}
                            className="font-bold text-[#E8E6E1] group-hover:text-[#C8551D] hover:underline cursor-pointer flex items-center gap-1 text-left"
                            title={`Inspect ${well.id} Digital Twin`}
                          >
                            <span>{well.id}</span>
                            <ChevronRight className="w-3 h-3 text-[#5F656B] group-hover:text-[#C8551D]" />
                          </button>
                          <span className="text-[9px] text-[#5F656B] border border-[#2E343A] px-1 py-0.2">
                            {well.pad}
                          </span>
                        </div>
                      </td>

                      {/* 2. CSS Cycle Number */}
                      <td className="py-2 px-3 border-r border-[#2E343A] whitespace-nowrap text-right text-[#C9B896]">
                        C-{well.cycleNumber}
                      </td>

                      {/* 3. Days Since Last Steam Injection */}
                      <td className="py-2 px-3 border-r border-[#2E343A] whitespace-nowrap text-right text-[#E8E6E1]">
                        {well.daysSinceInjection === 0 ? (
                          <span className="text-[#C8551D] font-bold">INJ NOW</span>
                        ) : (
                          `${well.daysSinceInjection} d`
                        )}
                      </td>

                      {/* 4. Current Bottomhole Temp Estimate */}
                      <td className="py-2 px-3 border-r border-[#2E343A] whitespace-nowrap text-right">
                        <span className={well.bottomholeTempC >= 200 ? 'text-[#C8551D] font-bold' : 'text-[#E8E6E1]'}>
                          {well.bottomholeTempC} °C
                        </span>
                      </td>

                      {/* 5. Current SPM */}
                      <td className="py-2 px-3 border-r border-[#2E343A] whitespace-nowrap text-right">
                        {well.strokeRateSPM > 0 ? (
                          <span className="text-[#E8E6E1]">{well.strokeRateSPM.toFixed(1)}</span>
                        ) : (
                          <span className="text-[#5F656B]">—</span>
                        )}
                      </td>

                      {/* 6. Pump Fillage % */}
                      <td className="py-2 px-3 border-r border-[#2E343A] whitespace-nowrap text-right">
                        {well.pumpFillagePct > 0 ? (
                          <span className={`font-bold ${well.pumpFillagePct < 70 ? 'text-[#8C2F2F]' : 'text-[#E8E6E1]'}`}>
                            {well.pumpFillagePct}%
                          </span>
                        ) : (
                          <span className="text-[#5F656B]">0%</span>
                        )}
                      </td>

                      {/* 7. Rod Load Status */}
                      <td className="py-2 px-3 border-r border-[#2E343A] whitespace-nowrap text-[11px]">
                        {getRodLoadBadge(well)}
                      </td>

                      {/* 8. SOR */}
                      <td className="py-2 px-3 border-r border-[#2E343A] whitespace-nowrap text-right text-[#C9B896]">
                        {well.steamOilRatio.toFixed(1)}
                      </td>

                      {/* 9. Daily Production */}
                      <td className="py-2 px-3 border-r border-[#2E343A] whitespace-nowrap text-right font-bold text-[#E8E6E1]">
                        {well.oilRateBOPD > 0 ? (
                          <span>{well.oilRateBOPD}</span>
                        ) : (
                          <span className="text-[#5F656B]">0</span>
                        )}
                      </td>

                      {/* 10. Health Status Tag (Strict Squared Tag) */}
                      <td className="py-2 px-3 border-r border-[#2E343A] whitespace-nowrap text-center">
                        {getStatusBadge(well)}
                      </td>

                      {/* 11. 4D Well Health Scorecard (Compact horizontal gauges) */}
                      <td className="py-2 px-3 whitespace-nowrap text-center">
                        <WellHealthScorecard well={well} variant="compact" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom SCADA Telemetry Summary Strip */}
        <div className="bg-[#191D21] border-t border-[#2E343A] px-3 py-2 flex flex-col md:flex-row items-start md:items-center justify-between text-[10px] font-mono text-[#8A8F94] gap-2">
          <div className="flex items-center gap-3">
            <span>
              FILTERED: <strong className="text-[#E8E6E1]">{filteredWells.length}</strong> / {totalCount} WELLS
            </span>
            <span className="text-[#5F656B]">|</span>
            <span>
              TOTAL PROD: <strong className="text-[#C9B896]">{filteredBOPD.toLocaleString()} BOPD</strong>
            </span>
            <span className="text-[#5F656B]">|</span>
            <span>
              AVG BHT: <strong className="text-[#E8E6E1]">{avgTemp} °C</strong>
            </span>
            <span className="text-[#5F656B]">|</span>
            <span>
              AVG SOR: <strong className="text-[#C9B896]">{avgSOR} m³/m³</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] text-[#5F656B]">
            <Terminal strokeWidth={1.25} className="w-3.5 h-3.5 text-[#C8551D]" />
            <span>CLICK ROW TO LOAD DIGITAL TWIN COUPLED PHYSICS SOLVER</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellFleetPage;
