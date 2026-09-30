import React, { useState, useMemo } from 'react';
import PageHeader from '@/src/components/layout/PageHeader';
import LastUpdatedBadge from '@/src/components/shared/LastUpdatedBadge';
import { useSimulation } from '@/src/context/SimulationContext';
import { 
  AlertSeverity, 
  AlertCategory, 
  FieldAlert, 
  INITIAL_FIELD_ALERTS 
} from '@/src/data/alertsData';
import EmptyState from '@/src/components/shared/EmptyState';
import SkeletonBlock from '@/src/components/shared/SkeletonBlock';
import { 
  AlertTriangle, 
  AlertOctagon,
  Info,
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Filter, 
  X, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  CheckSquare, 
  SlidersHorizontal, 
  Download, 
  RefreshCw, 
  Zap, 
  Activity, 
  Cpu, 
  Flame, 
  Gauge, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

interface AlertsDiagnosticsPageProps {
  onNavigateToWell?: (wellId: string) => void;
}

export const AlertsDiagnosticsPage: React.FC<AlertsDiagnosticsPageProps> = ({ 
  onNavigateToWell 
}) => {
  const { wellsState, totalSimulatedDaysElapsed } = useSimulation();
  const [alerts, setAlerts] = useState<FieldAlert[]>(INITIAL_FIELD_ALERTS);
  const [acknowledgedSimAlerts, setAcknowledgedSimAlerts] = useState<Set<string>>(new Set());
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>('ALT-8842'); // Initially expand primary alert
  const [ackToast, setAckToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  // Combine baseline alerts with live physical drift alerts from the simulation engine
  const allAlerts = useMemo(() => {
    const list: FieldAlert[] = [...alerts];
    const existingWellIds = new Set(list.filter(a => a.status === 'ACTIVE').map(a => a.wellId));

    // Inspect all 35 wells in the simulation fleet
    Object.values(wellsState).forEach(w => {
      if (w.status === 'fault' && !existingWellIds.has(w.wellId)) {
        const simId = `ALT-SIM-${w.wellId}`;
        const isAcked = acknowledgedSimAlerts.has(simId);
        list.unshift({
          id: simId,
          timestamp: `SIM +${Math.round(totalSimulatedDaysElapsed)}d SCADA`,
          wellId: w.wellId,
          pad: w.pad,
          category: 'ROD_FLOATING',
          categoryLabel: 'ROD FLOATING',
          severity: 'critical',
          title: `Drift Alert: Severe Viscous Drag (${w.crudeViscosityCP} cP) - Rod Float Hazard`,
          description: `Thermal decay has cooled reservoir sandface to ${w.bottomholeTempC}°C after ${Math.round(w.simulatedDaysSinceInjection)} days post-steam. Downstroke load collapsed to ${w.minRodLoadLbs} lbs (< 1,600 lbs). Heavy asphaltic bitumen resisting rod string descent.`,
          triggerMetric: `MPRL ${w.minRodLoadLbs} lbs · Visc ${w.crudeViscosityCP} cP · BHT ${w.bottomholeTempC}°C`,
          recommendedAction: `Schedule urgent Cyclic Steam Stimulation (CSS) re-steaming or trim VFD speed to prevent compressive rod buckling.`,
          status: isAcked ? 'ACKNOWLEDGED' : 'ACTIVE',
          cycleNumber: w.cycleNumber,
        });
      } else if (w.status === 'alert' && !existingWellIds.has(w.wellId)) {
        const simId = `ALT-SIM-${w.wellId}`;
        const isAcked = acknowledgedSimAlerts.has(simId);
        list.unshift({
          id: simId,
          timestamp: `SIM +${Math.round(totalSimulatedDaysElapsed)}d SCADA`,
          wellId: w.wellId,
          pad: w.pad,
          category: 'THERMAL_COOLING',
          categoryLabel: 'THERMAL COOLING',
          severity: 'warning',
          title: `Reservoir Thermal Decay Warning: Sandface at ${w.bottomholeTempC}°C`,
          description: `Continuous cooling observed in Jodhpur formation. Heavy crude viscosity has risen to ${w.crudeViscosityCP} cP, increasing polished rod friction drag.`,
          triggerMetric: `BHT ${w.bottomholeTempC}°C · Visc ${w.crudeViscosityCP} cP`,
          recommendedAction: `Plan CSS cycle restimulation within 5 to 7 days; monitor downstroke load on dynocard.`,
          status: isAcked ? 'ACKNOWLEDGED' : 'ACTIVE',
          cycleNumber: w.cycleNumber,
        });
      }
    });

    return list;
  }, [alerts, wellsState, totalSimulatedDaysElapsed, acknowledgedSimAlerts]);

  // Compute live statistics for header summary strip
  const stats = useMemo(() => {
    const activeCritical = allAlerts.filter(a => a.severity === 'critical' && a.status === 'ACTIVE').length;
    const activeWarning = allAlerts.filter(a => a.severity === 'warning' && a.status === 'ACTIVE').length;
    const resolvedOrInfo = allAlerts.filter(a => a.severity === 'resolved' || a.severity === 'info' || a.status === 'RESOLVED').length;
    const total = allAlerts.length;
    return { activeCritical, activeWarning, resolvedOrInfo, total };
  }, [allAlerts]);

  // Filter alerts based on active chips and search query
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((alert) => {
      // Severity Filter
      if (selectedSeverity !== 'ALL') {
        if (selectedSeverity === 'critical' && alert.severity !== 'critical') return false;
        if (selectedSeverity === 'warning' && alert.severity !== 'warning') return false;
        if (selectedSeverity === 'resolved' && alert.severity !== 'resolved' && alert.severity !== 'info') return false;
      }

      // Category / Type Filter
      if (selectedCategory !== 'ALL' && alert.category !== selectedCategory) {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesWell = alert.wellId.toLowerCase().includes(q);
        const matchesPad = alert.pad.toLowerCase().includes(q);
        const matchesType = alert.categoryLabel.toLowerCase().includes(q);
        const matchesTitle = alert.title.toLowerCase().includes(q);
        const matchesDesc = alert.description.toLowerCase().includes(q);
        const matchesAction = alert.recommendedAction.toLowerCase().includes(q);
        const matchesId = alert.id.toLowerCase().includes(q);
        return matchesWell || matchesPad || matchesType || matchesTitle || matchesDesc || matchesAction || matchesId;
      }

      return true;
    });
  }, [allAlerts, selectedSeverity, selectedCategory, searchQuery]);

  // Acknowledge handler
  const handleAcknowledge = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (id.startsWith('ALT-SIM-')) {
      setAcknowledgedSimAlerts(prev => new Set(prev).add(id));
    } else {
      setAlerts(prev => prev.map(a => {
        if (a.id === id) {
          return {
            ...a,
            status: 'ACKNOWLEDGED',
            acknowledgedBy: 'B. Patil (Operator)',
          };
        }
        return a;
      }));
    }

    setAckToast(`ALERT [${id}] ACKNOWLEDGED`);
    setTimeout(() => setAckToast(null), 3500);
  };

  // Toggle row accordion
  const toggleRow = (id: string) => {
    setExpandedAlertId(prev => prev === id ? null : id);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Alert ID', 'Timestamp', 'Well ID', 'Pad', 'Category', 'Severity', 'Status', 'Description', 'Trigger Metric', 'Recommended Action'];
    const rows = filteredAlerts.map(a => [
      a.id,
      `"${a.timestamp}"`,
      a.wellId,
      a.pad,
      `"${a.categoryLabel}"`,
      a.severity.toUpperCase(),
      a.status,
      `"${a.description.replace(/"/g, '""')}"`,
      `"${a.triggerMetric.replace(/"/g, '""')}"`,
      `"${a.recommendedAction.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Baghewala_SCADA_Alerts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Left border and tag styles according to the three-colour system
  const getSeverityStyles = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          leftBorder: 'border-l-4 border-l-[#8C2F2F]',
          badgeBorder: 'border-[#8C2F2F]',
          badgeText: 'text-[#DE5959]',
          badgeBg: 'bg-[#14171A]',
          label: 'CRITICAL',
          dot: 'bg-[#8C2F2F]',
          icon: AlertOctagon,
        };
      case 'warning':
        return {
          leftBorder: 'border-l-4 border-l-[#C8551D]',
          badgeBorder: 'border-[#C8551D]',
          badgeText: 'text-[#D96B27]',
          badgeBg: 'bg-[#14171A]',
          label: 'WARNING',
          dot: 'bg-[#C8551D]',
          icon: AlertTriangle,
        };
      case 'info':
      case 'resolved':
      default:
        return {
          leftBorder: 'border-l-4 border-l-[#3A5F45]',
          badgeBorder: 'border-[#3A5F45]',
          badgeText: 'text-[#4E9B68]',
          badgeBg: 'bg-[#14171A]',
          label: severity === 'info' ? 'INFO' : 'RESOLVED',
          dot: 'bg-[#3A5F45]',
          icon: severity === 'info' ? Info : CheckCircle2,
        };
    }
  };

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-3 select-none">
      {/* Page Header */}
      <PageHeader 
        code="NAV-06"
        title="ALERTS & DIAGNOSTICS"
        subtitle="ISA-18.2 Compliant Field Alarm Annunciator · Root-Cause Physics Diagnostics · Cross-Field Trip Logs"
        badge="SCADA-ISA18.2"
        statusText={`${stats.activeCritical} CRITICAL · ${stats.activeWarning} WARNINGS ACTIVE`}
      />

      {/* Toast Notification */}
      {ackToast && (
        <div className="bg-[#1F2428] border border-[#3A5F45] text-[#3A5F45] p-2 flex items-center justify-between text-xs font-mono animate-scada-fade">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-bold">{ackToast}</span>
          </div>
          <span className="text-[10px] text-[#8A8F94]">TIMESTAMP LOGGED IN SCADA AUDIT TRAIL</span>
        </div>
      )}

      {/* TOP SUMMARY METRICS STRIP (4 SQUARED TILES) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono">
        {/* Metric 1: Critical Alarms */}
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#8C2F2F] p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#8A8F94] block uppercase">ACTIVE CRITICAL FAULTS</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#8C2F2F]">{stats.activeCritical}</span>
              <span className="text-[9px] text-[#8A8F94]">UNRESOLVED</span>
            </div>
          </div>
          <div className="w-8 h-8 bg-[#14171A] border border-[#2E343A] flex items-center justify-center">
            <AlertOctagon className="w-4 h-4 text-[#8C2F2F]" />
          </div>
        </div>

        {/* Metric 2: Warning Alarms */}
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#C8551D] p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#8A8F94] block uppercase">PREDICTIVE WARNINGS</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#C8551D]">{stats.activeWarning}</span>
              <span className="text-[9px] text-[#8A8F94]">IN PROGRESS</span>
            </div>
          </div>
          <div className="w-8 h-8 bg-[#14171A] border border-[#2E343A] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#C8551D]" />
          </div>
        </div>

        {/* Metric 3: Cleared & Resolved */}
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#3A5F45] p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#8A8F94] block uppercase">RESOLVED / NORMALIZED</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#3A5F45]">{stats.resolvedOrInfo}</span>
              <span className="text-[9px] text-[#8A8F94]">SYSTEM CLEARED</span>
            </div>
          </div>
          <div className="w-8 h-8 bg-[#14171A] border border-[#2E343A] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#3A5F45]" />
          </div>
        </div>

        {/* Metric 4: Mean Time to Acknowledge (MTTA) */}
        <div className="bg-[#191D21] border border-[#2E343A] p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#8A8F94] block uppercase">MEAN TIME TO ACK (MTTA)</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold text-[#E8E6E1]">3.8</span>
              <span className="text-[9px] text-[#8A8F94]">MINUTES</span>
            </div>
          </div>
          <div className="w-8 h-8 bg-[#14171A] border border-[#2E343A] flex items-center justify-center">
            <Clock className="w-4 h-4 text-[#C9B896]" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL CONSOLE */}
      <div className="bg-[#191D21] border border-[#2E343A] p-3 space-y-2.5 font-mono">
        {/* Row 1: Search Box & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Search Box with Clear Button */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#5F656B]" />
            <input
              type="text"
              placeholder="SEARCH WELL ID, ALERT TYPE, SYMPTOM, KEYWORDS (e.g. BGW-09, VISCOSITY, POUND)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14171A] border border-[#2E343A] pl-8 pr-8 py-1.5 text-xs text-[#E8E6E1] placeholder-[#5F656B] focus:outline-none focus:border-[#C8551D] rounded-none font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-[#5F656B] hover:text-[#E8E6E1]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Actions (LastUpdatedBadge, Export CSV & Reset Filters) */}
          <div className="flex items-center gap-2">
            <LastUpdatedBadge label="SCADA QUEUE" pollIntervalSec={3} onRefresh={handleRefresh} />

            {(selectedSeverity !== 'ALL' || selectedCategory !== 'ALL' || searchQuery !== '') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSeverity('ALL');
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1.5 bg-[#14171A] hover:bg-[#1F2428] text-[#8A8F94] hover:text-[#E8E6E1] border border-[#2E343A] text-[10px] font-bold uppercase transition-none flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>RESET FILTERS</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-[#1F2428] hover:bg-[#272E34] text-[#E8E6E1] border border-[#2E343A] text-[10px] font-bold uppercase transition-none flex items-center gap-1.5"
            >
              <Download className="w-3 h-3 text-[#C8551D]" />
              <span>EXPORT SHIFT CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: Filter Chips for Severity & Alert Type */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-2 border-t border-[#252B30] text-[10px]">
          {/* Severity Filter Chips */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[#5F656B] uppercase font-semibold mr-1">SEVERITY:</span>
            {[
              { id: 'ALL', label: 'ALL SEVERITIES' },
              { id: 'critical', label: 'CRITICAL (FAULT)', color: 'text-[#8C2F2F] border-[#8C2F2F]' },
              { id: 'warning', label: 'WARNING (MED)', color: 'text-[#C8551D] border-[#C8551D]' },
              { id: 'resolved', label: 'RESOLVED / INFO', color: 'text-[#3A5F45] border-[#3A5F45]' },
            ].map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedSeverity(chip.id)}
                className={`px-2 py-0.5 border text-[9.5px] font-mono transition-none uppercase ${
                  selectedSeverity === chip.id
                    ? 'bg-[#14171A] font-bold ' + (chip.color || 'border-[#C8551D] text-[#E8E6E1]')
                    : 'border-[#2E343A] bg-[#191D21] text-[#8A8F94] hover:text-[#E8E6E1]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Alert Category Filter Chips */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[#5F656B] uppercase font-semibold mr-1">TYPE:</span>
            {[
              { id: 'ALL', label: 'ALL TYPES' },
              { id: 'ROD_FLOATING', label: 'ROD FLOATING' },
              { id: 'THERMAL_COOLING', label: 'THERMAL' },
              { id: 'PUMP_OFF', label: 'PUMP-OFF' },
              { id: 'SURFACE_VFD', label: 'VFD' },
              { id: 'RESERVOIR_PRESSURE', label: 'PRESSURE' },
              { id: 'VALVE_LEAK', label: 'VALVE' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 border text-[9.5px] font-mono transition-none uppercase ${
                  selectedCategory === cat.id
                    ? 'border-[#C9B896] bg-[#14171A] text-[#C9B896] font-bold'
                    : 'border-[#2E343A] bg-[#191D21] text-[#8A8F94] hover:text-[#E8E6E1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DENSE SQUARED ALERTS TABLE LIST */}
      <div className="bg-[#191D21] border border-[#2E343A] flex flex-col font-mono">
        {/* Table Panel Header with Corner SCADA Badge */}
        <div className="bg-[#14171A] border-b border-[#2E343A] px-3 py-1.5 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#C8551D]" />
            <span className="font-bold text-[#E8E6E1] uppercase tracking-wider text-[9px]">
              REAL-TIME SCADA FAULT &amp; TELEMETRY ALARM QUEUE [{filteredAlerts.length} ACTIVE EVENTS]
            </span>
          </div>
          <LastUpdatedBadge label="ALERTS" pollIntervalSec={3} onRefresh={handleRefresh} />
        </div>

        {/* Table Column Headers */}
        <div className="bg-[#161A1D] border-b border-[#2E343A] px-3 py-2 grid grid-cols-12 gap-2 text-[9px] text-[#8A8F94] uppercase font-bold tracking-wider">
          <div className="col-span-2">TIMESTAMP [UTC]</div>
          <div className="col-span-1">WELL ID</div>
          <div className="col-span-2">ALERT TYPE</div>
          <div className="col-span-1">SEVERITY</div>
          <div className="col-span-5">DIAGNOSTIC DESCRIPTION / SYMPTOM</div>
          <div className="col-span-1 text-right">ACTION</div>
        </div>

        {/* Loading & Empty States */}
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2 bg-[#14171A] border border-[#2E343A]">
                <SkeletonBlock className="col-span-2 h-4" />
                <SkeletonBlock className="col-span-1 h-4" />
                <SkeletonBlock className="col-span-2 h-4" />
                <SkeletonBlock className="col-span-1 h-4" />
                <SkeletonBlock className="col-span-5 h-4" />
                <SkeletonBlock className="col-span-1 h-4" />
              </div>
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            message="No active alerts for this well"
            subMessage="All SCADA parameters within nominal limits. Zero active telemetry threshold violations."
            actionText={searchQuery || selectedSeverity !== 'ALL' || selectedCategory !== 'ALL' ? 'RESET FILTERS' : undefined}
            onAction={() => {
              setSearchQuery('');
              setSelectedSeverity('ALL');
              setSelectedCategory('ALL');
            }}
          />
        ) : (
          <div className="divide-y divide-[#252B30]">
            {filteredAlerts.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              const isExpanded = expandedAlertId === alert.id;

              return (
                <div
                  key={alert.id}
                  className={`flex flex-col transition-none ${styles.leftBorder} ${
                    isExpanded ? 'bg-[#1D2227]' : 'bg-[#191D21] hover:bg-[#1D2227]'
                  }`}
                >
                  {/* Primary Row Header Grid */}
                  <div
                    onClick={() => toggleRow(alert.id)}
                    className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center cursor-pointer text-xs"
                  >
                    {/* 1. Timestamp in Monospace */}
                    <div className="col-span-2 font-mono text-[10px] text-[#8A8F94] flex items-center gap-1.5">
                      <styles.icon className={`w-3 h-3 ${styles.badgeText} shrink-0`} />
                      <span className="text-[#E8E6E1] font-bold">{alert.timestamp.split(' ')[1]}</span>
                      <span className="text-[8.5px] text-[#8A8F94]">{alert.timestamp.split(' ')[0]}</span>
                    </div>

                    {/* 2. Well ID (Clickable to Navigate to Well Digital Twin) */}
                    <div className="col-span-1 font-mono">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateToWell) onNavigateToWell(alert.wellId);
                        }}
                        className="px-1.5 py-0.5 bg-[#14171A] hover:bg-[#C8551D] hover:text-[#E8E6E1] border border-[#2E343A] text-xs font-bold text-[#E8E6E1] transition-none inline-flex items-center gap-1 cursor-pointer"
                        title={`View ${alert.wellId} in Digital Twin`}
                      >
                        <span>{alert.wellId}</span>
                      </button>
                    </div>

                    {/* 3. Alert Type Category */}
                    <div className="col-span-2 font-mono">
                      <span className="px-1.5 py-0.5 bg-[#14171A] border border-[#2E343A] text-[9px] font-semibold text-[#C9B896] uppercase truncate block max-w-fit">
                        {alert.categoryLabel}
                      </span>
                    </div>

                    {/* 4. Severity Tag with Icon & Explicit Label */}
                    <div className="col-span-1 font-mono">
                      <span className={`px-1.5 py-0.5 border ${styles.badgeBorder} ${styles.badgeText} text-[8.5px] font-bold uppercase inline-flex items-center gap-1`}>
                        <styles.icon className="w-2.5 h-2.5 shrink-0" />
                        <span>{styles.label}</span>
                      </span>
                    </div>

                    {/* 5. Short Description */}
                    <div className="col-span-5 font-mono text-[10px] text-[#E8E6E1] pr-2">
                      <div className="font-bold text-[#E8E6E1] truncate">
                        {alert.title}
                      </div>
                      <div className="text-[9px] text-[#8A8F94] truncate">
                        {alert.description}
                      </div>
                    </div>

                    {/* 6. Quick Action / Accordion Caret */}
                    <div className="col-span-1 flex items-center justify-end gap-1.5">
                      {alert.status === 'ACTIVE' ? (
                        <button
                          type="button"
                          onClick={(e) => handleAcknowledge(alert.id, e)}
                          className="px-2 py-0.5 bg-[#14171A] hover:bg-[#3A5F45] text-[#8A8F94] hover:text-[#E8E6E1] border border-[#2E343A] hover:border-[#3A5F45] text-[8.5px] font-mono font-bold uppercase transition-none"
                          title="Acknowledge SCADA alarm"
                        >
                          ACK
                        </button>
                      ) : (
                        <span className="text-[8px] text-[#5F656B] font-mono uppercase">
                          {alert.status}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(alert.id);
                        }}
                        className="p-1 text-[#5F656B] hover:text-[#E8E6E1]"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED ACCORDION DIAGNOSTICS BAY */}
                  {isExpanded && (
                    <div className="bg-[#14171A] border-t border-[#252B30] p-3 text-[10px] font-mono space-y-2.5">
                      {/* Sub-Header Strip */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9px] text-[#8A8F94] border-b border-[#252B30] pb-1.5">
                        <div className="flex items-center gap-3">
                          <span>ALARM ID: <strong className="text-[#E8E6E1]">{alert.id}</strong></span>
                          <span>LOCATION: <strong className="text-[#E8E6E1]">{alert.pad}</strong></span>
                          <span>CSS CYCLE: <strong className="text-[#C9B896]">#{alert.cycleNumber}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>STATUS: <strong className="text-[#E8E6E1]">{alert.status}</strong></span>
                          {alert.acknowledgedBy && (
                            <span>BY: <strong className="text-[#3A5F45]">{alert.acknowledgedBy}</strong></span>
                          )}
                        </div>
                      </div>

                      {/* 2-Column Diagnostics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Left (7 cols): Full Description & Trigger Physics */}
                        <div className="md:col-span-7 space-y-2">
                          <div className="bg-[#191D21] border border-[#2E343A] p-2 space-y-1">
                            <span className="text-[8.5px] text-[#5F656B] uppercase block font-semibold">
                              DETAILED SYMPTOM &amp; PHYSICAL PHENOMENON:
                            </span>
                            <p className="text-[9.5px] text-[#E8E6E1] leading-relaxed">
                              {alert.description}
                            </p>
                          </div>

                          <div className="bg-[#191D21] border border-[#2E343A] p-2 flex items-center justify-between">
                            <span className="text-[8.5px] text-[#5F656B] uppercase">TRIGGER METRIC READING:</span>
                            <span className="text-[10px] font-bold text-[#C8551D] px-1.5 py-0.5 bg-[#14171A] border border-[#2E343A]">
                              {alert.triggerMetric}
                            </span>
                          </div>
                        </div>

                        {/* Right (5 cols): Recommended Engineering Protocol & Actions */}
                        <div className="md:col-span-5 bg-[#191D21] border border-[#2E343A] p-2 flex flex-col justify-between space-y-2">
                          <div className="space-y-1">
                            <span className="text-[8.5px] text-[#5F656B] uppercase block font-semibold">
                              RECOMMENDED MITIGATION PROTOCOL:
                            </span>
                            <p className="text-[9.5px] text-[#C9B896] leading-relaxed">
                              {alert.recommendedAction}
                            </p>
                          </div>

                          {/* Quick Navigation Button to Well's Digital Twin */}
                          <div className="flex items-center gap-2 pt-1 border-t border-[#252B30]">
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateToWell) onNavigateToWell(alert.wellId);
                              }}
                              className="w-full py-1.5 px-2 bg-[#C8551D] hover:bg-[#D9652D] text-[#E8E6E1] text-[9.5px] font-bold uppercase transition-none border border-[#C8551D] flex items-center justify-center gap-1.5"
                            >
                              <span>OPEN {alert.wellId} DIGITAL TWIN</span>
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
            <span>SHOWING <strong className="text-[#E8E6E1]">{filteredAlerts.length}</strong> OF <strong className="text-[#E8E6E1]">{alerts.length}</strong> LOGGED FIELD ALARMS</span>
            <span className="text-[#5F656B]">·</span>
            <span>BAGHEWALA SCADA NODE: 27°48'N 71°45'E</span>
          </div>
          <span className="text-[#5F656B]">DGMS &amp; OISD-173 THERMAL COMPLIANCE VERIFIED</span>
        </div>
      </div>
    </div>
  );
};

export default AlertsDiagnosticsPage;
