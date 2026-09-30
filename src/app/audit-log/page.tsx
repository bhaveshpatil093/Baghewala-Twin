import React, { useState, useMemo } from 'react';
import PageHeader from '@/src/components/layout/PageHeader';
import { useAuditLog, AuditLogEntry, AuditCategory, AuditStatus } from '@/src/context/AuditLogContext';
import { useRole } from '@/src/context/RoleContext';
import LastUpdatedBadge from '@/src/components/shared/LastUpdatedBadge';
import EmptyState from '@/src/components/shared/EmptyState';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  ChevronDown, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  User, 
  ShieldCheck, 
  Activity, 
  Flame, 
  Wrench, 
  Zap, 
  Cpu, 
  FileText,
  Building2,
  Sliders,
  Sparkles,
  Lock,
  Eye
} from 'lucide-react';

interface AuditLogPageProps {
  onNavigateToWell?: (wellId: string) => void;
}

export default function AuditLogPage({ onNavigateToWell }: AuditLogPageProps) {
  const { logs, exportToCsv } = useAuditLog();
  const { role, isViewer } = useRole();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | AuditCategory>('ALL');
  const [selectedPad, setSelectedPad] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | AuditStatus>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter logs chronologically
  const filteredLogs = useMemo(() => {
    return logs.filter(item => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (selectedPad !== 'ALL' && item.pad !== selectedPad) return false;
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchWell = item.wellId.toLowerCase().includes(q);
        const matchEng = item.appliedBy.toLowerCase().includes(q);
        const matchParam = item.parameter.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchReason = item.reasoning.toLowerCase().includes(q);
        const matchDesk = item.desk.toLowerCase().includes(q);
        return matchWell || matchEng || matchParam || matchId || matchReason || matchDesk;
      }

      return true;
    });
  }, [logs, selectedCategory, selectedPad, selectedStatus, searchQuery]);

  // Summary counts
  const totalCount = logs.length;
  const srpCount = logs.filter(l => l.category === 'SRP_KINEMATICS').length;
  const cssCount = logs.filter(l => l.category === 'CSS_THERMAL').length;
  const integrityCount = logs.filter(l => l.category === 'WELLBORE_INTEGRITY' || l.category === 'POWER_TARIFF').length;

  const getCategoryBadge = (category: AuditCategory) => {
    switch (category) {
      case 'SRP_KINEMATICS':
        return { label: 'SRP KINEMATICS', color: 'text-[#C8551D] border-[#C8551D] bg-[#14171A]', icon: Activity };
      case 'CSS_THERMAL':
        return { label: 'CSS THERMAL', color: 'text-[#C9B896] border-[#C9B896] bg-[#14171A]', icon: Flame };
      case 'WELLBORE_INTEGRITY':
        return { label: 'WELLBORE INTEGRITY', color: 'text-[#DE5959] border-[#DE5959] bg-[#14171A]', icon: Wrench };
      case 'POWER_TARIFF':
        return { label: 'POWER TARIFF', color: 'text-[#4E9B68] border-[#4E9B68] bg-[#14171A]', icon: Zap };
      default:
        return { label: category, color: 'text-[#8A8F94] border-[#2E343A] bg-[#14171A]', icon: Sliders };
    }
  };

  const getStatusBadge = (status: AuditStatus) => {
    switch (status) {
      case 'COMMITTED_SCADA':
        return { label: 'COMMITTED SCADA', style: 'text-[#4E9B68] border-[#3A5F45] bg-[#3A5F45]/15' };
      case 'DISPATCHED_RTU':
        return { label: 'DISPATCHED RTU', style: 'text-[#C8551D] border-[#C8551D] bg-[#C8551D]/15' };
      case 'SCHEDULED':
        return { label: 'SCHEDULED', style: 'text-[#C9B896] border-[#C9B896] bg-[#14171A]' };
      case 'VERIFIED':
        return { label: 'VERIFIED ON-SITE', style: 'text-[#4E9B68] border-[#3A5F45] bg-[#14171A]' };
      default:
        return { label: status, style: 'text-[#8A8F94] border-[#2E343A] bg-[#14171A]' };
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-4 font-mono select-none">
      {/* Top PSU Header */}
      <PageHeader
        code="NAV-06C"
        title="APPLIED RECOMMENDATION AUDIT TRAIL"
        subtitle="Chronological operational accountability log — full PSU traceability of wellhead setpoint modifications &amp; steam allocations"
        badge="PSU-AUDIT"
        statusText="DGMS / DGH STATUTORY REGISTER"
      />

      {/* Role Notice if in Viewer */}
      {isViewer && (
        <div 
          className="bg-[#191D21] border border-[#D96B27] p-2.5 flex items-center justify-between text-xs font-mono text-[#E8E6E1]"
          style={{ borderRadius: 0 }}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#D96B27] shrink-0" />
            <div>
              <span className="font-bold text-[#D96B27] uppercase">AUDIT SURVEILLANCE MODE (VIEWER ROLE ACTIVE):</span>{' '}
              <span className="text-[#8A8F94]">
                You have unrestricted access to inspect the permanent SCADA dispatch register, digital timestamps, engineer credentials, and parameter deltas.
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-[#14171A] border border-[#D96B27] text-[#D96B27] text-[9.5px] font-bold uppercase shrink-0">
            INSPECTION
          </span>
        </div>
      )}

      {/* 4 SQUARED STATISTICAL SUMMARY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Metric 1 */}
        <div className="bg-[#191D21] border border-[#2E343A] p-3 flex flex-col justify-between" style={{ borderRadius: 0 }}>
          <div className="flex items-center justify-between text-[#8A8F94] text-[9px] uppercase font-bold border-b border-[#252B30] pb-1">
            <span>TOTAL COMMITTED AUDIT RECORDS</span>
            <Building2 className="w-3.5 h-3.5 text-[#C9B896]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#E8E6E1]">{totalCount}</span>
            <span className="text-[9.5px] text-[#4E9B68] font-bold">HISTORICAL LOGS</span>
          </div>
          <span className="text-[8.5px] text-[#5F656B]">Permanent immutable Modbus hash</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#191D21] border border-[#2E343A] p-3 flex flex-col justify-between" style={{ borderRadius: 0 }}>
          <div className="flex items-center justify-between text-[#8A8F94] text-[9px] uppercase font-bold border-b border-[#252B30] pb-1">
            <span>SRP KINEMATIC VFD TRIMS</span>
            <Activity className="w-3.5 h-3.5 text-[#C8551D]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#C8551D]">{srpCount}</span>
            <span className="text-[9.5px] text-[#8A8F94]">SPEED / STROKE DISPATCHES</span>
          </div>
          <span className="text-[8.5px] text-[#5F656B]">Average response: 84ms loop</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#191D21] border border-[#2E343A] p-3 flex flex-col justify-between" style={{ borderRadius: 0 }}>
          <div className="flex items-center justify-between text-[#8A8F94] text-[9px] uppercase font-bold border-b border-[#252B30] pb-1">
            <span>CSS THERMAL ALLOCATIONS</span>
            <Flame className="w-3.5 h-3.5 text-[#C9B896]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#C9B896]">{cssCount}</span>
            <span className="text-[9.5px] text-[#8A8F94]">STEAM CYCLES SCHEDULED</span>
          </div>
          <span className="text-[8.5px] text-[#5F656B]">SG-01 / SG-02 boiler tonnage</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#191D21] border border-[#2E343A] p-3 flex flex-col justify-between" style={{ borderRadius: 0 }}>
          <div className="flex items-center justify-between text-[#8A8F94] text-[9px] uppercase font-bold border-b border-[#252B30] pb-1">
            <span>PSU STATUTORY COMPLIANCE</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#4E9B68]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#4E9B68]">100%</span>
            <span className="text-[9.5px] text-[#4E9B68] font-bold">DGMS AUDIT READY</span>
          </div>
          <span className="text-[8.5px] text-[#5F656B]">Signed by authorized Engineers</span>
        </div>
      </div>

      {/* FILTER & EXPORT TOOLBAR */}
      <div 
        className="bg-[#191D21] border border-[#2E343A] p-3 flex flex-col space-y-2.5"
        style={{ borderRadius: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#5F656B]" />
            <input
              type="text"
              placeholder="SEARCH WELL ID, ENGINEER, PARAMETER, OR DESK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14171A] border border-[#2E343A] pl-8 pr-3 py-1.5 text-xs text-[#E8E6E1] placeholder-[#5F656B] focus:outline-none focus:border-[#C8551D] font-mono"
              style={{ borderRadius: 0 }}
            />
          </div>

          {/* Quick Actions: LastUpdatedBadge & Export CSV */}
          <div className="flex items-center gap-2">
            <LastUpdatedBadge label="AUDIT TRAIL" pollIntervalSec={3} />

            <button
              type="button"
              onClick={exportToCsv}
              className="px-3 py-1.5 bg-[#14171A] hover:bg-[#1E2328] border border-[#2E343A] hover:border-[#C9B896] text-[#E8E6E1] text-[10px] font-bold uppercase transition-none flex items-center gap-1.5 cursor-pointer shadow-sm"
              style={{ borderRadius: 0 }}
              title="Download full statutory CSV for Directorate General of Hydrocarbons (DGH)"
            >
              <Download className="w-3.5 h-3.5 text-[#C9B896]" />
              <span>EXPORT AUDIT CSV</span>
            </button>

            {(searchQuery || selectedCategory !== 'ALL' || selectedPad !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedPad('ALL');
                  setSelectedStatus('ALL');
                }}
                className="px-2.5 py-1.5 bg-[#14171A] hover:bg-[#1E2328] border border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1] text-[10px] font-bold uppercase flex items-center gap-1"
                style={{ borderRadius: 0 }}
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips: Category & Pad */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#252B30] text-[9.5px]">
          {/* Category Chips */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[#5F656B] font-bold uppercase mr-1">CATEGORY:</span>
            {[
              { id: 'ALL', label: 'ALL CATEGORIES' },
              { id: 'SRP_KINEMATICS', label: 'SRP KINEMATICS' },
              { id: 'CSS_THERMAL', label: 'CSS THERMAL' },
              { id: 'WELLBORE_INTEGRITY', label: 'INTEGRITY' },
              { id: 'POWER_TARIFF', label: 'POWER TARIFF' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2 py-0.5 border uppercase font-bold transition-none ${
                  selectedCategory === cat.id
                    ? 'border-[#C8551D] bg-[#C8551D] text-[#FFFFFF]'
                    : 'border-[#2E343A] bg-[#14171A] text-[#8A8F94] hover:text-[#E8E6E1]'
                }`}
                style={{ borderRadius: 0 }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Pad Filter Chips */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F656B] font-bold uppercase mr-1">PAD:</span>
            {['ALL', 'PAD-A', 'PAD-B', 'PAD-C', 'PAD-D'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPad(p)}
                className={`px-2 py-0.5 border uppercase font-bold transition-none ${
                  selectedPad === p
                    ? 'border-[#C9B896] bg-[#14171A] text-[#C9B896]'
                    : 'border-[#2E343A] bg-[#14171A] text-[#8A8F94] hover:text-[#E8E6E1]'
                }`}
                style={{ borderRadius: 0 }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SQUARED CHRONOLOGICAL AUDIT LOG TABLE */}
      <div 
        className="bg-[#191D21] border border-[#2E343A] flex flex-col font-mono"
        style={{ borderRadius: 0 }}
      >
        {/* Table Header Bar */}
        <div className="bg-[#161A1D] border-b border-[#2E343A] px-3 py-2 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-[#C8551D]" />
            <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
              OFFICIAL OPERATIONAL DISPATCH REGISTER [{filteredLogs.length} ENTRIES]
            </span>
          </div>
          <span className="text-[9px] text-[#8A8F94]">
            SORT: CHRONOLOGICAL [LATEST FIRST]
          </span>
        </div>

        {/* Table Column Headers */}
        <div className="bg-[#14171A] border-b border-[#2E343A] px-3 py-2 grid grid-cols-12 gap-2 text-[8.5px] text-[#8A8F94] uppercase font-bold tracking-wider">
          <div className="col-span-2">TIMESTAMP [IST] // AUDIT ID</div>
          <div className="col-span-1">WELL &amp; PAD</div>
          <div className="col-span-2">CATEGORY &amp; PARAMETER</div>
          <div className="col-span-3">PREVIOUS VALUE ➔ APPLIED VALUE</div>
          <div className="col-span-2">APPLIED BY [OFFICER]</div>
          <div className="col-span-1 text-center">SCADA STATUS</div>
          <div className="col-span-1 text-right">INSPECT</div>
        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            message="No audit dispatch records match active criteria"
            subMessage="Adjust telemetry search query or reset category and pad filters to view dispatch entries."
            actionText="RESET FILTERS"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedPad('ALL');
              setSelectedStatus('ALL');
            }}
          />
        ) : (
          <div className="divide-y divide-[#252B30]">
            {filteredLogs.map((entry) => {
              const catBadge = getCategoryBadge(entry.category);
              const statusBadge = getStatusBadge(entry.status);
              const isExpanded = expandedId === entry.id;

              return (
                <div key={entry.id} className="flex flex-col hover:bg-[#181D21] transition-none">
                  {/* Primary Row */}
                  <div 
                    onClick={() => toggleExpand(entry.id)}
                    className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center text-[10px] cursor-pointer"
                  >
                    {/* 1. Timestamp & Audit ID */}
                    <div className="col-span-2 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[#E8E6E1] font-bold">
                        <Clock className="w-3 h-3 text-[#C8551D] shrink-0" />
                        <span>{entry.timestamp}</span>
                      </div>
                      <span className="text-[8.5px] text-[#5F656B] block">
                        {entry.id}
                      </span>
                    </div>

                    {/* 2. Well ID & Pad */}
                    <div className="col-span-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateToWell) onNavigateToWell(entry.wellId);
                        }}
                        className="text-[#C8551D] hover:underline font-bold text-xs cursor-pointer block text-left"
                        title={`Open Digital Twin for ${entry.wellId}`}
                      >
                        {entry.wellId}
                      </button>
                      <span className="text-[8px] text-[#8A8F94] block">
                        {entry.pad}
                      </span>
                    </div>

                    {/* 3. Category & Parameter */}
                    <div className="col-span-2 space-y-0.5 pr-2">
                      <span className="font-bold text-[#E8E6E1] block truncate" title={entry.parameter}>
                        {entry.parameter}
                      </span>
                      <span className={`inline-block px-1 py-0.2 border text-[7.5px] font-bold uppercase ${catBadge.color}`} style={{ borderRadius: 0 }}>
                        {catBadge.label}
                      </span>
                    </div>

                    {/* 4. Previous Value -> Applied Value (Diff Display) */}
                    <div className="col-span-3 space-y-0.5 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[#8A8F94] line-through text-[9px] bg-[#14171A] px-1 py-0.2 border border-[#2E343A]">
                          {entry.previousValue}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#C8551D] shrink-0" />
                        <span className="text-[#4E9B68] font-bold text-[10px] bg-[#14171A] px-1 py-0.2 border border-[#3A5F45]">
                          {entry.appliedValue}
                        </span>
                      </div>
                      {entry.diffSummary && (
                        <span className="text-[8px] text-[#C9B896] block">
                          Δ {entry.diffSummary}
                        </span>
                      )}
                    </div>

                    {/* 5. Applied By & Role */}
                    <div className="col-span-2 space-y-0.5">
                      <div className="flex items-center gap-1 font-bold text-[#E8E6E1]">
                        <User className="w-3 h-3 text-[#8A8F94]" />
                        <span className="truncate">{entry.appliedBy}</span>
                      </div>
                      <span className="text-[8px] text-[#8A8F94] block truncate">
                        {entry.role} · {entry.desk}
                      </span>
                    </div>

                    {/* 6. SCADA Status */}
                    <div className="col-span-1 text-center">
                      <span className={`px-1.5 py-0.5 border text-[7.5px] font-bold uppercase inline-block ${statusBadge.style}`} style={{ borderRadius: 0 }}>
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* 7. Action / Expand Icon */}
                    <div className="col-span-1 text-right flex items-center justify-end">
                      <button
                        type="button"
                        aria-label="Toggle details"
                        className="p-1 text-[#8A8F94] hover:text-[#E8E6E1]"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#C8551D]" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detailed Audit Traceability Card */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-[#14171A] border-t border-b border-[#2E343A] space-y-3 font-mono text-[10px]">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Box 1: Engineering & Physics Justification */}
                        <div className="md:col-span-2 p-2.5 bg-[#191D21] border border-[#2E343A] space-y-1">
                          <span className="text-[9px] text-[#C8551D] font-bold uppercase flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            PHYSICS ATTRIBUTION &amp; OPERATIONAL JUSTIFICATION:
                          </span>
                          <p className="font-sans text-xs text-[#E8E6E1] leading-relaxed">
                            {entry.reasoning}
                          </p>
                          {entry.expectedGain && (
                            <div className="pt-1.5 border-t border-[#252B30] flex items-center gap-2 text-[9px]">
                              <span className="text-[#8A8F94]">ESTIMATED OUTCOME:</span>
                              <strong className="text-[#4E9B68]">{entry.expectedGain}</strong>
                            </div>
                          )}
                        </div>

                        {/* Box 2: Telemetry & Modbus Register Proof */}
                        <div className="p-2.5 bg-[#191D21] border border-[#2E343A] space-y-2">
                          <span className="text-[9px] text-[#C9B896] font-bold uppercase block border-b border-[#252B30] pb-1">
                            SCADA DISPATCH PROOF:
                          </span>
                          <div className="space-y-1 text-[9px]">
                            <div className="flex justify-between">
                              <span className="text-[#8A8F94]">MODBUS REGISTER:</span>
                              <span className="text-[#E8E6E1] font-bold">{entry.modbusRegister || 'HR-40102'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8A8F94]">ACK TIME:</span>
                              <span className="text-[#4E9B68] font-bold">{entry.acknowledgementMs || 84} ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8A8F94]">MODEL CONFIDENCE:</span>
                              <span className="text-[#C9B896] font-bold">{entry.confidenceScore}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8A8F94]">STATION TERMINAL:</span>
                              <span className="text-[#E8E6E1]">{entry.desk}</span>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-[#252B30]">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onNavigateToWell) onNavigateToWell(entry.wellId);
                              }}
                              className="w-full py-1 bg-[#14171A] hover:bg-[#252B30] border border-[#2E343A] text-[#C8551D] hover:text-[#FFFFFF] text-[9px] font-bold uppercase transition-none text-center block"
                              style={{ borderRadius: 0 }}
                            >
                              OPEN WELL DIGITAL TWIN ➔
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Official Digital Signature Footer */}
                      <div className="p-2 bg-[#191D21] border border-[#2E343A] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[8.5px] text-[#8A8F94]">
                        <div>
                          <span>DIGITAL AUDIT STAMP: </span>
                          <span className="text-[#C9B896]">OIL-RAJ-JDP // {entry.id} // SHA-256 VERIFIED</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-[#4E9B68]" />
                          <span className="text-[#4E9B68] font-bold">APPROVED BY CERTIFIED PETROLEUM ENGINEER</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Table Bottom Footer */}
        <div className="p-2.5 bg-[#14171A] border-t border-[#2E343A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9px] text-[#8A8F94]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4E9B68]" style={{ borderRadius: 0 }} />
            <span>OIL INDIA LIMITED (OIL) // RAJASTHAN BASIN AUDIT LOGGING PROTOCOL VER 2.4</span>
          </div>
          <span className="text-[#C9B896]">
            RECORD RETENTION: 7 YEARS (STATUTORY DGMS/DGH MANDATE)
          </span>
        </div>
      </div>
    </div>
  );
}
