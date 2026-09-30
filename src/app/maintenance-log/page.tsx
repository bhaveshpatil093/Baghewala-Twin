import React, { useState, useMemo } from 'react';
import PageHeader from '@/src/components/layout/PageHeader';
import { BAGHEWALA_WELLS } from '@/src/data/wellsData';
import { 
  MaintenanceRecord, 
  MonthlyFailureFrequency, 
  INITIAL_MAINTENANCE_RECORDS, 
  MONTHLY_FAILURE_FREQUENCY 
} from '@/src/data/maintenanceData';
import EmptyState from '@/src/components/shared/EmptyState';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Filter, 
  Search, 
  Download, 
  Calendar, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Layers, 
  Cpu, 
  FileSpreadsheet
} from 'lucide-react';

interface MaintenanceLogPageProps {
  onNavigateToWell?: (wellId: string) => void;
}

export const MaintenanceLogPage: React.FC<MaintenanceLogPageProps> = ({ 
  onNavigateToWell 
}) => {
  const [selectedWellId, setSelectedWellId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>('WO-2026-0918');

  // Filter records
  const filteredRecords = useMemo(() => {
    return INITIAL_MAINTENANCE_RECORDS.filter((rec) => {
      // Well Filter
      if (selectedWellId !== 'ALL' && rec.wellId !== selectedWellId) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== 'ALL' && rec.category !== selectedCategory) {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesWell = rec.wellId.toLowerCase().includes(q);
        const matchesType = rec.failureType.toLowerCase().includes(q);
        const matchesCause = rec.rootCause.toLowerCase().includes(q);
        const matchesRig = rec.workoverRigId.toLowerCase().includes(q);
        const matchesRemedy = rec.remedyAction.toLowerCase().includes(q);
        return matchesWell || matchesType || matchesCause || matchesRig || matchesRemedy;
      }

      return true;
    });
  }, [selectedWellId, selectedCategory, searchQuery]);

  // Compute MTBF & Summary Reliability Metrics
  const summaryStats = useMemo(() => {
    const records = selectedWellId === 'ALL' 
      ? INITIAL_MAINTENANCE_RECORDS 
      : INITIAL_MAINTENANCE_RECORDS.filter(r => r.wellId === selectedWellId);

    const totalIncidents = records.length;
    const rodFailuresCount = records.filter(r => r.category === 'ROD_FAILURE').length;
    const pumpUnsettingCount = records.filter(r => r.category === 'PUMP_UNSETTING').length;
    const totalDowntimeHours = records.reduce((acc, r) => acc + r.downtimeHours, 0);
    const totalCostINR = records.reduce((acc, r) => acc + r.costImpactINR, 0);
    const totalCostUSD = records.reduce((acc, r) => acc + r.costImpactUSD, 0);
    const totalLostBarrels = records.reduce((acc, r) => acc + r.costBreakdown.lostBarrels, 0);

    // MTBF calculation:
    // Observation period = 365 days
    // If specific well: MTBF = (365 days - (totalDowntimeHours / 24)) / (totalIncidents || 1)
    // If field wide: MTBF per well average
    const operationalDays = Math.max(1, 365 - (totalDowntimeHours / 24));
    const mtbfDays = totalIncidents > 0 
      ? Math.round(operationalDays / totalIncidents) 
      : 365;

    // Reliability Index (0 - 100%)
    const availabilityPct = Number((((365 * 24 - totalDowntimeHours) / (365 * 24)) * 100).toFixed(1));

    return {
      totalIncidents,
      rodFailuresCount,
      pumpUnsettingCount,
      totalDowntimeHours,
      totalCostINR: Number(totalCostINR.toFixed(1)),
      totalCostUSD,
      totalLostBarrels,
      mtbfDays,
      availabilityPct,
    };
  }, [selectedWellId]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Record ID', 'Date', 'Well ID', 'Pad', 'Failure Type', 'Root Cause', 'Downtime Hours', 'Cost INR Lakhs', 'Cost USD', 'Workover Rig', 'CSS Cycle', 'Remedy Action'];
    const rows = filteredRecords.map(r => [
      r.id,
      r.date,
      r.wellId,
      r.pad,
      `"${r.failureType}"`,
      `"${r.rootCause.replace(/"/g, '""')}"`,
      r.downtimeHours,
      r.costImpactINR,
      r.costImpactUSD,
      `"${r.workoverRigId}"`,
      r.cssCycle,
      `"${r.remedyAction.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Maintenance_Log_${selectedWellId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle row expansion
  const toggleRow = (id: string) => {
    setExpandedRecordId(prev => prev === id ? null : id);
  };

  // Styling helper for failure types
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'ROD_FAILURE':
        return {
          border: 'border-l-4 border-l-[#8C2F2F]',
          badgeText: 'text-[#8C2F2F]',
          badgeBorder: 'border-[#8C2F2F]',
          label: 'ROD FAILURE',
          dot: 'bg-[#8C2F2F]',
        };
      case 'PUMP_UNSETTING':
        return {
          border: 'border-l-4 border-l-[#C8551D]',
          badgeText: 'text-[#C8551D]',
          badgeBorder: 'border-[#C8551D]',
          label: 'PUMP UNSETTING',
          dot: 'bg-[#C8551D]',
        };
      case 'SURFACE_MECHANICAL':
      default:
        return {
          border: 'border-l-4 border-l-[#C9B896]',
          badgeText: 'text-[#C9B896]',
          badgeBorder: 'border-[#C9B896]',
          label: 'SURFACE REPAIR',
          dot: 'bg-[#C9B896]',
        };
    }
  };

  // Monthly failure chart parameters
  const chartHeight = 110;
  const maxMonthlyFailures = Math.max(...MONTHLY_FAILURE_FREQUENCY.map(m => m.totalFailures), 6);

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-3 select-none">
      {/* Page Header */}
      <PageHeader
        code="NAV-06B"
        title="MAINTENANCE & RELIABILITY LOG"
        subtitle="Downhole Rod Buckling & Pump Unsetting Historical Registry · Root-Cause Fault Classification · MTBF Metrics"
        badge="SCADA-MTBF"
        statusText={`RECORDED: ${summaryStats.totalIncidents} INCIDENTS · MTBF: ${summaryStats.mtbfDays} DAYS`}
      />

      {/* TOP SUMMARY PANEL (MTBF METRICS & 12-MONTH FAILURE FREQUENCY CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch font-mono">
        {/* Left Side (5 cols): MTBF & Critical Operational Metrics */}
        <div className="lg:col-span-5 bg-[#191D21] border border-[#2E343A] p-3 flex flex-col justify-between space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#2E343A] pb-1.5 text-[9px]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C8551D]" />
              <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
                RELIABILITY METRICS // {selectedWellId === 'ALL' ? 'FIELD FLEET (35 WELLS)' : selectedWellId}
              </span>
            </div>
            <span className="text-[#8A8F94] text-[8.5px]">365-DAY WINDOW</span>
          </div>

          {/* Core Metric 1: Mean Time Between Failures (MTBF) */}
          <div className="bg-[#14171A] border border-[#2E343A] border-l-4 border-l-[#C8551D] p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#8A8F94] block uppercase">MEAN TIME BETWEEN FAILURES (MTBF)</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-bold text-[#E8E6E1]">{summaryStats.mtbfDays}</span>
                <span className="text-xs text-[#C8551D] font-bold">DAYS / RUN</span>
              </div>
              <span className="text-[8px] text-[#5F656B]">
                {selectedWellId === 'BGW-09' 
                  ? 'High thermal decay risk · Field baseline target: 165 Days'
                  : 'Calculated over active rod string run hours'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-[#5F656B] block">WELL RUNTIME:</span>
              <span className="text-xs font-bold text-[#3A5F45]">{summaryStats.availabilityPct}%</span>
            </div>
          </div>

          {/* Secondary Metric Grid: Downtime, Cost, and Failure Splits */}
          <div className="grid grid-cols-3 gap-2 text-[9px]">
            {/* Downtime Hours */}
            <div className="bg-[#14171A] border border-[#2E343A] p-2">
              <span className="text-[8px] text-[#5F656B] block uppercase">CUM DOWNTIME</span>
              <span className="text-sm font-bold text-[#8C2F2F] block mt-0.5">
                {summaryStats.totalDowntimeHours} <span className="text-[9px] text-[#8A8F94]">hrs</span>
              </span>
              <span className="text-[7.5px] text-[#5F656B]">{summaryStats.totalLostBarrels} bbls lost</span>
            </div>

            {/* Total Cost Impact */}
            <div className="bg-[#14171A] border border-[#2E343A] p-2">
              <span className="text-[8px] text-[#5F656B] block uppercase">WORKOVER OPEX</span>
              <span className="text-sm font-bold text-[#C9B896] block mt-0.5">
                ₹{summaryStats.totalCostINR} <span className="text-[9px] text-[#8A8F94]">L</span>
              </span>
              <span className="text-[7.5px] text-[#5F656B]">${summaryStats.totalCostUSD.toLocaleString()} USD</span>
            </div>

            {/* Failure Count Split */}
            <div className="bg-[#14171A] border border-[#2E343A] p-2">
              <span className="text-[8px] text-[#5F656B] block uppercase">ROD / PUMP INCIDENTS</span>
              <div className="text-sm font-bold text-[#E8E6E1] block mt-0.5">
                <span className="text-[#8C2F2F]">{summaryStats.rodFailuresCount}</span>
                <span className="text-[#5F656B]"> / </span>
                <span className="text-[#C8551D]">{summaryStats.pumpUnsettingCount}</span>
              </div>
              <span className="text-[7.5px] text-[#5F656B]">{summaryStats.totalIncidents} total workovers</span>
            </div>
          </div>
        </div>

        {/* Right Side (7 cols): Trend Chart of Failure Frequency over the Last 12 Months */}
        <div className="lg:col-span-7 bg-[#191D21] border border-[#2E343A] p-3 flex flex-col justify-between space-y-2">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#2E343A] pb-1.5 text-[9px]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#C8551D]" />
              <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
                12-MONTH FAILURE FREQUENCY TREND (OCT 2025 – SEP 2026)
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[8px]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#8C2F2F]" />
                <span className="text-[#8A8F94]">ROD PARTING / BUCKLING</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#C8551D]" />
                <span className="text-[#8A8F94]">PUMP UNSETTING / WASH</span>
              </div>
            </div>
          </div>

          {/* 12-Month Segmented Stacked Bar Chart */}
          <div className="bg-[#14171A] border border-[#2E343A] p-2 relative">
            {/* Horizontal Gridlines */}
            <div className="absolute inset-x-2 top-2 bottom-6 flex flex-col justify-between pointer-events-none opacity-30">
              <div className="border-b border-[#2E343A] w-full" />
              <div className="border-b border-[#2E343A] w-full" />
              <div className="border-b border-[#2E343A] w-full" />
            </div>

            {/* Bars Container */}
            <div className="grid grid-cols-12 gap-1.5 items-end h-28 pt-2 pb-1 relative z-10">
              {MONTHLY_FAILURE_FREQUENCY.map((item, idx) => {
                const rodHeight = (item.rodFailures / maxMonthlyFailures) * 100;
                const pumpHeight = (item.pumpUnsettings / maxMonthlyFailures) * 100;

                return (
                  <div key={item.month} className="flex flex-col items-center h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="text-[7.5px] text-[#C9B896] font-bold opacity-0 group-hover:opacity-100 transition-none mb-0.5">
                      {item.totalFailures}
                    </div>

                    {/* Stacked Bar (Zero-Radius Square Block) */}
                    <div className="w-full flex flex-col items-center justify-end">
                      {/* Top Stack: Pump Unsettings */}
                      {item.pumpUnsettings > 0 && (
                        <div
                          style={{ height: `${pumpHeight}%` }}
                          className="w-full bg-[#C8551D] border-t border-x border-[#8C3A12] transition-none"
                          title={`${item.month}: ${item.pumpUnsettings} Pump Unsettings`}
                        />
                      )}
                      {/* Bottom Stack: Rod Failures */}
                      {item.rodFailures > 0 && (
                        <div
                          style={{ height: `${rodHeight}%` }}
                          className="w-full bg-[#8C2F2F] border border-[#5C1B1B] transition-none"
                          title={`${item.month}: ${item.rodFailures} Rod Failures`}
                        />
                      )}
                    </div>

                    {/* Month Label */}
                    <span className="text-[7.5px] text-[#8A8F94] mt-1.5 truncate block text-center">
                      {item.month.split(" '")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Failure Pattern Annotation */}
          <div className="flex items-center justify-between text-[8px] text-[#5F656B] px-1">
            <span>PEAK CYCLIC RISK: JAN '26 &amp; JUN '26 (POST-SOAK CONDENSATION TRANSITION)</span>
            <span>MODEL: WEIBULL RELIABILITY β = 1.82</span>
          </div>
        </div>
      </div>

      {/* FILTER & WELL SELECTION CONTROL CONSOLE */}
      <div className="bg-[#191D21] border border-[#2E343A] p-2.5 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Left: Well Selector & Category Filter */}
        <div className="flex items-center flex-wrap gap-2 text-[10px]">
          {/* Well Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F656B] uppercase font-semibold">WELL FILTER:</span>
            <select
              value={selectedWellId}
              onChange={(e) => setSelectedWellId(e.target.value)}
              className="bg-[#14171A] border border-[#2E343A] text-[#E8E6E1] text-[10px] px-2 py-1 rounded-none font-mono focus:outline-none focus:border-[#C8551D]"
            >
              <option value="ALL">ALL WELLS (FIELD REGISTRY)</option>
              {BAGHEWALA_WELLS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} - Pad {w.pad} ({w.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: 'ALL EVENTS' },
              { id: 'ROD_FAILURE', label: 'ROD FAILURES' },
              { id: 'PUMP_UNSETTING', label: 'PUMP UNSETTINGS' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-1 border text-[9px] uppercase font-mono transition-none ${
                  selectedCategory === cat.id
                    ? 'border-[#C8551D] bg-[#14171A] text-[#E8E6E1] font-bold'
                    : 'border-[#2E343A] bg-[#191D21] text-[#8A8F94] hover:text-[#E8E6E1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Search Box & CSV Export */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="relative">
            <Search className="absolute left-2 top-2 w-3 h-3 text-[#5F656B]" />
            <input
              type="text"
              placeholder="SEARCH CAUSE, RIG, ACTION..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#14171A] border border-[#2E343A] pl-7 pr-2 py-1 text-[9.5px] text-[#E8E6E1] placeholder-[#5F656B] focus:outline-none focus:border-[#C8551D] rounded-none font-mono w-48 sm:w-56"
            />
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

      {/* SQUARED TABLE: MAINTENANCE & FAILURE LOG PER WELL */}
      <div className="bg-[#191D21] border border-[#2E343A] flex flex-col font-mono">
        {/* Table Column Headers */}
        <div className="bg-[#14171A] border-b border-[#2E343A] px-3 py-2 grid grid-cols-12 gap-2 text-[9px] text-[#8A8F94] uppercase font-bold tracking-wider">
          <div className="col-span-2">DATE [UTC]</div>
          <div className="col-span-1">WELL ID</div>
          <div className="col-span-2">FAILURE TYPE</div>
          <div className="col-span-4">ROOT CAUSE (FAULT MODEL CLASSIFICATION)</div>
          <div className="col-span-1 text-center">DOWNTIME</div>
          <div className="col-span-1 text-right">COST ESTIMATE</div>
          <div className="col-span-1 text-right">DETAILS</div>
        </div>

        {/* Table Rows */}
        {filteredRecords.length === 0 ? (
          <EmptyState
            icon={Wrench}
            message={selectedWellId !== 'ALL' ? `No maintenance records logged for well ${selectedWellId}` : "No maintenance dispatch records found"}
            subMessage="No rod parting, fluid pound, or workover events recorded matching active criteria."
            actionText={selectedWellId !== 'ALL' || selectedCategory !== 'ALL' || searchQuery ? 'RESET FILTERS' : undefined}
            onAction={() => {
              setSelectedWellId('ALL');
              setSelectedCategory('ALL');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="divide-y divide-[#252B30]">
            {filteredRecords.map((record) => {
              const styles = getCategoryStyles(record.category);
              const isExpanded = expandedRecordId === record.id;

              return (
                <div
                  key={record.id}
                  className={`flex flex-col transition-none ${styles.border} ${
                    isExpanded ? 'bg-[#1D2227]' : 'bg-[#191D21] hover:bg-[#1D2227]'
                  }`}
                >
                  {/* Primary Row Grid */}
                  <div
                    onClick={() => toggleRow(record.id)}
                    className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center cursor-pointer text-xs"
                  >
                    {/* 1. Date */}
                    <div className="col-span-2 font-mono text-[10px] text-[#8A8F94] flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 ${styles.dot}`} />
                      <span className="text-[#E8E6E1] font-bold">{record.date}</span>
                      <span className="text-[8px] text-[#5F656B]">({record.id})</span>
                    </div>

                    {/* 2. Well ID (Clickable) */}
                    <div className="col-span-1 font-mono">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateToWell) onNavigateToWell(record.wellId);
                        }}
                        className="px-1.5 py-0.5 bg-[#14171A] hover:bg-[#C8551D] hover:text-[#E8E6E1] border border-[#2E343A] text-xs font-bold text-[#E8E6E1] transition-none"
                        title={`View ${record.wellId} Digital Twin`}
                      >
                        {record.wellId}
                      </button>
                    </div>

                    {/* 3. Failure Type */}
                    <div className="col-span-2 font-mono">
                      <span className={`px-1.5 py-0.5 border ${styles.badgeBorder} ${styles.badgeText} text-[8.5px] font-bold uppercase truncate block max-w-fit bg-[#14171A]`}>
                        {record.failureType}
                      </span>
                    </div>

                    {/* 4. Root Cause (as classified by the fault model) */}
                    <div className="col-span-4 font-mono text-[9.5px] text-[#E8E6E1] pr-2">
                      <div className="font-semibold text-[#E8E6E1] leading-tight">
                        {record.rootCause}
                      </div>
                      <div className="text-[8px] text-[#8A8F94] truncate">
                        CSS Cycle #{record.cssCycle} · Rig: {record.workoverRigId}
                      </div>
                    </div>

                    {/* 5. Downtime Hours */}
                    <div className="col-span-1 font-mono text-center">
                      <span className="font-bold text-[#E8E6E1] text-xs">
                        {record.downtimeHours.toFixed(1)}
                      </span>
                      <span className="text-[8px] text-[#5F656B] block">HOURS</span>
                    </div>

                    {/* 6. Cost Impact Estimate */}
                    <div className="col-span-1 font-mono text-right">
                      <span className="font-bold text-[#C9B896] text-xs">
                        ₹{record.costImpactINR.toFixed(1)}L
                      </span>
                      <span className="text-[8px] text-[#5F656B] block">
                        ${(record.costImpactUSD / 1000).toFixed(1)}k USD
                      </span>
                    </div>

                    {/* 7. Expand / Accordion Caret */}
                    <div className="col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(record.id);
                        }}
                        className="p-1 text-[#5F656B] hover:text-[#E8E6E1]"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED ACCORDION: REMEDY ACTIONS & COST BREAKDOWN */}
                  {isExpanded && (
                    <div className="bg-[#14171A] border-t border-[#252B30] p-3 text-[10px] font-mono space-y-2.5">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Left (7 cols): Workover Execution & Remedy Action */}
                        <div className="md:col-span-7 space-y-2">
                          <div className="bg-[#191D21] border border-[#2E343A] p-2 space-y-1">
                            <span className="text-[8px] text-[#5F656B] uppercase font-bold block">
                              WORKOVER RIG REMEDY ACTION &amp; REPAIR SCOPE:
                            </span>
                            <p className="text-[9.5px] text-[#E8E6E1] leading-relaxed">
                              {record.remedyAction}
                            </p>
                          </div>

                          <div className="bg-[#191D21] border border-[#2E343A] p-2 flex items-center justify-between text-[9px]">
                            <span>ASSIGNED CREW: <strong className="text-[#E8E6E1]">{record.workoverRigId}</strong></span>
                            <span>LOCATION: <strong className="text-[#C9B896]">{record.wellId} ({record.pad})</strong></span>
                          </div>
                        </div>

                        {/* Right (5 cols): Itemized Cost Impact Breakdown */}
                        <div className="md:col-span-5 bg-[#191D21] border border-[#2E343A] p-2 flex flex-col justify-between space-y-1.5">
                          <span className="text-[8px] text-[#5F656B] uppercase font-bold block border-b border-[#252B30] pb-1">
                            ITEMIZED COST &amp; LOST PRODUCTION BREAKDOWN:
                          </span>

                          <div className="space-y-1 text-[9px]">
                            <div className="flex justify-between">
                              <span className="text-[#8A8F94]">Workover Rig Mob / Dayrate:</span>
                              <strong className="text-[#E8E6E1]">₹{record.costBreakdown.workoverRigINR}L</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8A8F94]">String Replacement &amp; Insert Pump:</span>
                              <strong className="text-[#E8E6E1]">₹{record.costBreakdown.partsAndStringsINR}L</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8A8F94]">Deferred Oil Production ({record.costBreakdown.lostBarrels} bbls):</span>
                              <strong className="text-[#C8551D]">₹{record.costBreakdown.deferredOilProductionINR}L</strong>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-[#252B30] font-bold">
                              <span className="text-[#C9B896]">TOTAL INCIDENT IMPACT:</span>
                              <span className="text-[#E8E6E1]">₹{record.costImpactINR}L (${record.costImpactUSD.toLocaleString()})</span>
                            </div>
                          </div>

                          {/* Quick Link to Digital Twin */}
                          <div className="pt-1 border-t border-[#252B30]">
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateToWell) onNavigateToWell(record.wellId);
                              }}
                              className="w-full py-1 bg-[#14171A] hover:bg-[#C8551D] text-[#8A8F94] hover:text-[#E8E6E1] border border-[#2E343A] text-[9px] uppercase font-bold flex items-center justify-center gap-1 transition-none"
                            >
                              <span>INSPECT {record.wellId} TWIN</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Table Footer */}
        <div className="bg-[#14171A] border-t border-[#2E343A] px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9.5px] text-[#8A8F94]">
          <div className="flex items-center gap-2">
            <span>SHOWING <strong className="text-[#E8E6E1]">{filteredRecords.length}</strong> WORKOVER ENTRIES</span>
            <span className="text-[#5F656B]">·</span>
            <span>DATA SOURCE: ONGC WORKOVER LOGS &amp; SCADA ROOT-CAUSE FAULT CLASSIFIER</span>
          </div>
          <span className="text-[#5F656B]">OISD-173 STATUTORY MAINTENANCE AUDIT COMPLIANT</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceLogPage;
