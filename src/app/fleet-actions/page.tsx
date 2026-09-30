import React, { useState, useMemo } from 'react';
import PageHeader from '@/src/components/layout/PageHeader';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Flame, 
  Activity, 
  ArrowRight, 
  RotateCcw, 
  Filter, 
  CheckCheck, 
  Clock, 
  ShieldAlert, 
  Cpu, 
  ChevronRight,
  TrendingUp,
  Download,
  Zap,
  Info,
  Lock,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { useRole } from '@/src/context/RoleContext';
import { useAuditLog } from '@/src/context/AuditLogContext';
import { BAGHEWALA_WELLS } from '@/src/data/wellsData';
import EmptyState from '@/src/components/shared/EmptyState';
import DS from '@/src/design-system';

export type ActionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RecommendationCategory = 'SRP_KINEMATICS' | 'CSS_THERMAL' | 'WELLBORE_INTEGRITY' | 'POWER_TARIFF';
export type TriageStatus = 'PENDING' | 'APPROVED' | 'DISMISSED';

export interface FleetRecommendation {
  id: string;
  wellId: string;
  pad: string;
  title: string;
  category: RecommendationCategory;
  priority: ActionPriority;
  impactRank: number; // 1 (highest) to 10
  estimatedImpact: {
    oilDeltaBOPD?: number;
    stressReductionPct?: number;
    costSavingsINR?: string;
    bhtDeltaC?: number;
    summary: string;
  };
  parameterChange: {
    parameter: string;
    currentValue: string;
    recommendedValue: string;
  };
  engineeringReasoning: string;
  confidenceScore: number;
  status: TriageStatus;
  triagedAt?: string;
  triagedBy?: string;
}

const INITIAL_RECOMMENDATIONS: FleetRecommendation[] = [
  {
    id: 'REC-2026-0927-01',
    wellId: 'BGW-12',
    pad: 'Pad-02',
    title: 'Throttle VFD Stroke Rate to Prevent Compressive Rod Buckling',
    category: 'SRP_KINEMATICS',
    priority: 'CRITICAL',
    impactRank: 1,
    estimatedImpact: {
      stressReductionPct: 38,
      costSavingsINR: '₹4,80,000 (Prevents Rod Parting Workover)',
      summary: 'Eliminate rod float; restore MPRL > 2,000 lbs',
    },
    parameterChange: {
      parameter: 'Pumping Speed (SPM)',
      currentValue: '4.6 SPM',
      recommendedValue: '3.8 SPM (-0.8 SPM)',
    },
    engineeringReasoning: 'Minimum polished rod load dropped to 1,420 lbs due to 890 cP fluid drag post-steam cooling. Compressive stresses exceed API 11L limits.',
    confidenceScore: 96,
    status: 'PENDING',
  },
  {
    id: 'REC-2026-0927-02',
    wellId: 'BGW-09',
    pad: 'Pad-02',
    title: 'Trim VFD Speed & Stroke Length to Counteract Downstroke Viscous Drag',
    category: 'SRP_KINEMATICS',
    priority: 'CRITICAL',
    impactRank: 2,
    estimatedImpact: {
      stressReductionPct: 32,
      oilDeltaBOPD: 3.5,
      costSavingsINR: '₹1,45,000/month in Motor Wear',
      summary: '+3.5 BOPD via improved pump fillage (68% → 82%)',
    },
    parameterChange: {
      parameter: 'SPM & Stroke Length',
      currentValue: '3.2 SPM / 120 in',
      recommendedValue: '2.8 SPM / 100 in',
    },
    engineeringReasoning: 'Heavy crude viscosity surge (1,420 cP at 116°C). Slower downstroke allows the rod string to fall under gravity without buckling.',
    confidenceScore: 94,
    status: 'PENDING',
  },
  {
    id: 'REC-2026-0927-03',
    wellId: 'BGW-07',
    pad: 'Pad-01',
    title: 'Trigger CSS Cycle #3 Thermal Restimulation & Steam Allocation',
    category: 'CSS_THERMAL',
    priority: 'HIGH',
    impactRank: 3,
    estimatedImpact: {
      oilDeltaBOPD: 42,
      bhtDeltaC: 84,
      costSavingsINR: 'Net +₹18.2L Cumulative Margin',
      summary: '+42 BOPD post-soak; restore BHT from 108°C to 192°C',
    },
    parameterChange: {
      parameter: 'CSS Phase Transition',
      currentValue: 'Production (Day 142)',
      recommendedValue: 'Shut-in for SG-01 Steam Injection',
    },
    engineeringReasoning: 'BHT has decayed to 108°C near the economic cutoff boundary. Mobility ratio dropped 4.2x. Reservoir simulation indicates high oil saturation remains in near-wellbore matrix.',
    confidenceScore: 91,
    status: 'PENDING',
  },
  {
    id: 'REC-2026-0927-04',
    wellId: 'BGW-04',
    pad: 'Pad-01',
    title: 'Rebalance Counterweight Crank Position to Trim Peak Structural Torque',
    category: 'SRP_KINEMATICS',
    priority: 'HIGH',
    impactRank: 4,
    estimatedImpact: {
      stressReductionPct: 18,
      costSavingsINR: '₹62,000/month Power & Gearbox OPEX',
      summary: '-18% Peak Torque load; gearbox safety factor restored',
    },
    parameterChange: {
      parameter: 'Counterbalance Position',
      currentValue: 'Position #2 (68 in)',
      recommendedValue: 'Position #4 (76 in)',
    },
    engineeringReasoning: 'Upstroke motor power spike detected at 24.2 kW with 114°C crude cooling. Shifting counterweights outwards balances cyclic torque load.',
    confidenceScore: 89,
    status: 'PENDING',
  },
  {
    id: 'REC-2026-0927-05',
    wellId: 'BGW-24',
    pad: 'Pad-04',
    title: 'Ramp Up Pumping Speed to Drain Near-Wellbore Thermal Bank Post-Soak',
    category: 'SRP_KINEMATICS',
    priority: 'HIGH',
    impactRank: 5,
    estimatedImpact: {
      oilDeltaBOPD: 18,
      summary: '+18 BOPD gross production during peak mobility window',
    },
    parameterChange: {
      parameter: 'Pumping Speed (SPM)',
      currentValue: '3.6 SPM',
      recommendedValue: '4.4 SPM (+0.8 SPM)',
    },
    engineeringReasoning: 'Well BGW-24 is 12 days into Cycle #2 production at 178°C BHT. Viscosity is ultra-low (85 cP); increasing SPM maximizes drawdown while fluid mobility is optimal.',
    confidenceScore: 93,
    status: 'PENDING',
  },
  {
    id: 'REC-2026-0927-06',
    wellId: 'BGW-10',
    pad: 'Pad-02',
    title: 'Conclude Soak Phase Early; Begin Controlled SRP Ramp-Up',
    category: 'CSS_THERMAL',
    priority: 'MEDIUM',
    impactRank: 6,
    estimatedImpact: {
      oilDeltaBOPD: 28,
      summary: 'Prevent thermal dissipation; recover heated bitumen bank',
    },
    parameterChange: {
      parameter: 'Operating State',
      currentValue: 'Soaking (Day 14)',
      recommendedValue: 'Initiate SRP Pumping at 2.4 SPM',
    },
    engineeringReasoning: 'DTS temperature gradient indicates thermal equilibrium reached across 18m drainage radius. Extended soaking will lead to conductive heat loss into overlying Jodhpur shale.',
    confidenceScore: 88,
    status: 'PENDING',
  },
  {
    id: 'REC-2026-0927-07',
    wellId: 'BGW-16',
    pad: 'Pad-03',
    title: 'Adjust Downhole Valve Timing & Add Sinker Bar Weight',
    category: 'WELLBORE_INTEGRITY',
    priority: 'MEDIUM',
    impactRank: 7,
    estimatedImpact: {
      stressReductionPct: 22,
      costSavingsINR: '₹85,000 Component Wear',
      summary: 'Dampen fluid pound impact shock waves by 22%',
    },
    parameterChange: {
      parameter: 'Sinker Bar Assembly',
      currentValue: 'Standard 1.5 in Rods',
      recommendedValue: 'Install 500 lbs Tungsten Sinker Bar',
    },
    engineeringReasoning: 'Severe fluid pound detected on lower dynocard loop. Adding sinker bar ballast maintains downstroke rod tension in 600 cP crude.',
    confidenceScore: 86,
    status: 'PENDING',
  },
  {
    id: 'REC-2026-0927-08',
    wellId: 'BGW-03',
    pad: 'Pad-01',
    title: 'Optimise VFD Duty Cycle for Off-Peak Electricity Tariff Window',
    category: 'POWER_TARIFF',
    priority: 'LOW',
    impactRank: 8,
    estimatedImpact: {
      costSavingsINR: '₹38,000/month Net Power Savings',
      summary: 'Shift peak kW pumping to Jodhpur Discom night tariff',
    },
    parameterChange: {
      parameter: 'Time-of-Day VFD Schedule',
      currentValue: 'Constant 4.0 SPM',
      recommendedValue: '3.2 SPM (Day) / 4.6 SPM (22:00-06:00)',
    },
    engineeringReasoning: 'Electricity tariff drops from ₹8.40/kWh to ₹4.20/kWh during nocturnal off-peak hours. Pumping heavier at night reduces field operating expenditure.',
    confidenceScore: 92,
    status: 'PENDING',
  },
];

interface FleetActionsPageProps {
  onNavigateToWell?: (wellId: string) => void;
}

export const FleetActionsPage: React.FC<FleetActionsPageProps> = ({ onNavigateToWell }) => {
  const { canApplyRecommendations, isViewer, userProfile } = useRole();
  const { addAuditEntry } = useAuditLog();
  const [recommendations, setRecommendations] = useState<FleetRecommendation[]>(INITIAL_RECOMMENDATIONS);
  const [statusFilter, setStatusFilter] = useState<'ALL' | TriageStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ActionPriority>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | RecommendationCategory>('ALL');
  const [padFilter, setPadFilter] = useState<string>('ALL');
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Approve action
  const handleApprove = (id: string) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          status: 'APPROVED',
          triagedAt: now,
          triagedBy: `${userProfile.name} (${userProfile.roleTitle})`,
        };
      }
      return rec;
    }));

    const rec = recommendations.find(r => r.id === id);
    if (rec) {
      setNotificationBanner(`DISPATCHED TO SCADA: ${rec.wellId} — ${rec.parameterChange.parameter} set to ${rec.parameterChange.recommendedValue}`);
      addAuditEntry({
        wellId: rec.wellId,
        pad: rec.pad,
        category: rec.category,
        parameter: rec.parameterChange.parameter,
        previousValue: rec.parameterChange.currentValue,
        appliedValue: rec.parameterChange.recommendedValue,
        diffSummary: rec.estimatedImpact.summary,
        appliedBy: userProfile.name,
        role: userProfile.roleTitle,
        desk: userProfile.desk,
        status: 'COMMITTED_SCADA',
        modbusRegister: 'HR-40102 (SCADA_SETPOINT)',
        reasoning: rec.engineeringReasoning,
        confidenceScore: rec.confidenceScore,
        expectedGain: rec.estimatedImpact.summary,
        acknowledgementMs: 86,
      });
    }
    setTimeout(() => setNotificationBanner(null), 4000);
  };

  // Dismiss action
  const handleDismiss = (id: string) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          status: 'DISMISSED',
          triagedAt: now,
          triagedBy: 'Er. A. K. Sharma (Sr. Res Eng)',
        };
      }
      return rec;
    }));

    const rec = recommendations.find(r => r.id === id);
    setNotificationBanner(`DEFERRED / LOGGED: Recommendation for ${rec?.wellId} marked dismissed in morning audit log.`);
    setTimeout(() => setNotificationBanner(null), 4000);
  };

  // Undo action
  const handleResetItem = (id: string) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          status: 'PENDING',
          triagedAt: undefined,
          triagedBy: undefined,
        };
      }
      return rec;
    }));
  };

  // Batch Approve All High Confidence (>90%) Pending Actions
  const handleBatchApproveHighConfidence = () => {
    const now = new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' });
    let count = 0;
    setRecommendations(prev => prev.map(rec => {
      if (rec.status === 'PENDING' && rec.confidenceScore >= 90) {
        count++;
        return {
          ...rec,
          status: 'APPROVED',
          triagedAt: now,
          triagedBy: 'Er. A. K. Sharma (Batch Dispatch)',
        };
      }
      return rec;
    }));

    setNotificationBanner(`BATCH DISPATCH: Approved & deployed ${count} high-confidence AI recommendations to field DCS.`);
    setTimeout(() => setNotificationBanner(null), 4500);
  };

  // Reset entire triage session
  const handleResetAll = () => {
    setRecommendations(INITIAL_RECOMMENDATIONS);
    setNotificationBanner('Morning triage board reset to initial pending state.');
    setTimeout(() => setNotificationBanner(null), 3000);
  };

  // Filter pipeline
  const filteredList = useMemo(() => {
    return recommendations.filter(rec => {
      if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && rec.priority !== priorityFilter) return false;
      if (categoryFilter !== 'ALL' && rec.category !== categoryFilter) return false;
      if (padFilter !== 'ALL' && rec.pad !== padFilter) return false;
      return true;
    }).sort((a, b) => a.impactRank - b.impactRank);
  }, [recommendations, statusFilter, priorityFilter, categoryFilter, padFilter]);

  // Aggregate stats
  const pendingCount = recommendations.filter(r => r.status === 'PENDING').length;
  const approvedCount = recommendations.filter(r => r.status === 'APPROVED').length;
  const dismissedCount = recommendations.filter(r => r.status === 'DISMISSED').length;

  const totalOilGain = recommendations
    .filter(r => r.status !== 'DISMISSED')
    .reduce((acc, r) => acc + (r.estimatedImpact.oilDeltaBOPD || 0), 0);

  // Helper for priority flat color
  const getPriorityStyle = (priority: ActionPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          bg: 'bg-[#8C2F2F]',
          text: 'text-[#FFFFFF]',
          border: 'border-[#8C2F2F]',
          label: 'CRITICAL IMPACT',
        };
      case 'HIGH':
        return {
          bg: 'bg-[#C8551D]',
          text: 'text-[#FFFFFF]',
          border: 'border-[#C8551D]',
          label: 'HIGH IMPACT',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-[#C9B896]',
          text: 'text-[#14171A]',
          border: 'border-[#C9B896]',
          label: 'MEDIUM IMPACT',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-[#3A5F45]',
          text: 'text-[#FFFFFF]',
          border: 'border-[#3A5F45]',
          label: 'LOW / OPEX',
        };
    }
  };

  // Helper for category label
  const getCategoryLabel = (category: RecommendationCategory) => {
    switch (category) {
      case 'SRP_KINEMATICS':
        return 'SRP KINEMATICS';
      case 'CSS_THERMAL':
        return 'CSS THERMAL CYCLE';
      case 'WELLBORE_INTEGRITY':
        return 'WELLBORE INTEGRITY';
      case 'POWER_TARIFF':
        return 'POWER TARIFF OPTIMIZATION';
    }
  };

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-3 select-none font-mono">
      {/* Page Header */}
      <PageHeader
        code="NAV-05B"
        title="RECOMMENDED ACTIONS ACROSS FLEET"
        subtitle="Field-Wide Prioritized AI Triage Console · Coupled Thermal & SRP Lift Strategy"
        badge="MORNING-TRIAGE"
        statusText={`TRIAGE STATUS: ${pendingCount} PENDING · ${approvedCount} APPROVED · ${dismissedCount} DISMISSED`}
      />

      {/* Real-time Notification Banner */}
      {notificationBanner && (
        <div 
          className="bg-[#191D21] border-l-4 border-l-[#C8551D] border-y border-r border-[#2E343A] p-2.5 flex items-center justify-between text-[10px] text-[#E8E6E1] animate-scada-fade"
          style={{ borderRadius: 0 }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#C8551D]" />
            <span>{notificationBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationBanner(null)}
            className="text-[9px] text-[#8A8F94] hover:text-[#FFFFFF]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Role Access Banner when Viewer */}
      {isViewer && (
        <div 
          className="bg-[#191D21] border border-[#D96B27] p-2.5 flex items-center justify-between text-xs font-mono text-[#E8E6E1]"
          style={{ borderRadius: 0 }}
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#D96B27] shrink-0" />
            <div>
              <span className="font-bold text-[#D96B27] uppercase">READ-ONLY AUDIT MODE (VIEWER ROLE ACTIVE):</span>{' '}
              <span className="text-[#8A8F94]">
                All recommendations, economic gains, and attribution factors are visible for surveillance. Action buttons are access-controlled. Switch to <strong>Field Engineer</strong> in the top bar to approve or dispatch setpoints.
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-[#14171A] border border-[#D96B27] text-[#D96B27] text-[9.5px] font-bold uppercase shrink-0">
            READ-ONLY
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MORNING TRIAGE EXECUTIVE SUMMARY STRIP                                 */}
      {/* ========================================================================= */}
      <div 
        className="bg-[#191D21] border border-[#2E343A] p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]"
        style={{ borderRadius: 0 }}
      >
        {/* Metric 1: Pending Actions */}
        <div className="bg-[#14171A] border border-[#2E343A] p-2.5 flex flex-col justify-between" style={{ borderRadius: 0 }}>
          <div className="flex items-center justify-between text-[#8A8F94] uppercase text-[9px]">
            <span>OPEN AI RECOMMENDATIONS</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#C8551D]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-[#E8E6E1]">{pendingCount}</span>
            <span className="text-[9px] text-[#8A8F94]">of {recommendations.length} total</span>
          </div>
          <span className="text-[8px] text-[#C8551D] mt-1 font-semibold">
            {recommendations.filter(r => r.status === 'PENDING' && (r.priority === 'CRITICAL' || r.priority === 'HIGH')).length} High / Critical Urgency
          </span>
        </div>

        {/* Metric 2: Estimated Net Production Gain */}
        <div className="bg-[#14171A] border border-[#2E343A] p-2.5 flex flex-col justify-between" style={{ borderRadius: 0 }}>
          <div className="flex items-center justify-between text-[#8A8F94] uppercase text-[9px]">
            <span>EST. NET PRODUCTION GAIN</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#3A5F45]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-[#3A5F45]">+{totalOilGain.toFixed(1)}</span>
            <span className="text-[9px] text-[#8A8F94]">BOPD</span>
          </div>
          <span className="text-[8px] text-[#8A8F94] mt-1">
            Across 4 production acceleration tasks
          </span>
        </div>

        {/* Metric 3: Catastrophic Workover Risk Mitigated */}
        <div className="bg-[#14171A] border border-[#2E343A] p-2.5 flex flex-col justify-between" style={{ borderRadius: 0 }}>
          <div className="flex items-center justify-between text-[#8A8F94] uppercase text-[9px]">
            <span>WORKOVER RISK PREVENTED</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#8C2F2F]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-[#E8E6E1]">₹6.25 L</span>
            <span className="text-[9px] text-[#8A8F94]">EST. VALUE</span>
          </div>
          <span className="text-[8px] text-[#8A8F94] mt-1">
            Rod buckling &amp; stuffing box wear avoidance
          </span>
        </div>

        {/* Metric 4: Triage Completion Progress */}
        <div className="bg-[#14171A] border border-[#2E343A] p-2.5 flex flex-col justify-between" style={{ borderRadius: 0 }}>
          <div className="flex items-center justify-between text-[#8A8F94] uppercase text-[9px]">
            <span>MORNING TRIAGE STATUS</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#C9B896]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-[#C9B896]">
              {Math.round(((approvedCount + dismissedCount) / recommendations.length) * 100)}%
            </span>
            <span className="text-[9px] text-[#8A8F94]">COMPLETED</span>
          </div>
          {/* Flat progress bar */}
          <div className="w-full bg-[#191D21] h-1.5 border border-[#2E343A] overflow-hidden mt-1" style={{ borderRadius: 0 }}>
            <div 
              style={{ 
                width: `${((approvedCount + dismissedCount) / recommendations.length) * 100}%`,
                backgroundColor: '#3A5F45',
                borderRadius: 0 
              }} 
              className="h-full transition-none"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER & BATCH ACTION TOOLBAR (SQUARED)                                */}
      {/* ========================================================================= */}
      <div 
        className="bg-[#191D21] border border-[#2E343A] p-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 text-[9px]"
        style={{ borderRadius: 0 }}
      >
        {/* Left Filters */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Status Filter */}
          <div className="flex items-center border border-[#2E343A] bg-[#14171A]">
            <span className="px-2 py-1 text-[#5F656B] uppercase border-r border-[#2E343A]">STATUS:</span>
            {(['ALL', 'PENDING', 'APPROVED', 'DISMISSED'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 font-bold uppercase transition-none ${
                  statusFilter === st
                    ? 'bg-[#C8551D] text-[#E8E6E1]'
                    : 'text-[#8A8F94] hover:text-[#E8E6E1]'
                }`}
                style={{ borderRadius: 0 }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center border border-[#2E343A] bg-[#14171A]">
            <span className="px-2 py-1 text-[#5F656B] uppercase border-r border-[#2E343A]">PRIORITY:</span>
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(pr => (
              <button
                key={pr}
                type="button"
                onClick={() => setPriorityFilter(pr)}
                className={`px-2 py-1 font-bold uppercase transition-none ${
                  priorityFilter === pr
                    ? 'bg-[#2E343A] text-[#E8E6E1] border-b border-[#C8551D]'
                    : 'text-[#8A8F94] hover:text-[#E8E6E1]'
                }`}
                style={{ borderRadius: 0 }}
              >
                {pr}
              </button>
            ))}
          </div>

          {/* Pad Filter */}
          <div className="flex items-center border border-[#2E343A] bg-[#14171A]">
            <span className="px-2 py-1 text-[#5F656B] uppercase border-r border-[#2E343A]">PAD:</span>
            {(['ALL', 'Pad-01', 'Pad-02', 'Pad-03', 'Pad-04'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPadFilter(p)}
                className={`px-2 py-1 font-bold uppercase transition-none ${
                  padFilter === p
                    ? 'bg-[#2E343A] text-[#E8E6E1]'
                    : 'text-[#8A8F94] hover:text-[#E8E6E1]'
                }`}
                style={{ borderRadius: 0 }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Right Batch Actions */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleBatchApproveHighConfidence}
            disabled={pendingCount === 0 || !canApplyRecommendations}
            className={`px-2.5 py-1 text-[9px] uppercase font-bold flex items-center gap-1.5 transition-none shadow-sm ${
              canApplyRecommendations && pendingCount > 0
                ? 'bg-[#3A5F45] hover:bg-[#4E7D5C] text-[#FFFFFF] cursor-pointer'
                : 'bg-[#252B30] text-[#8A8F94] border border-[#3E454D] opacity-60 cursor-not-allowed hover:bg-[#252B30]'
            }`}
            style={{ borderRadius: 0 }}
            title={
              canApplyRecommendations
                ? 'Approve all recommendations with model confidence score >= 90%'
                : 'Access Restricted: Viewer role is Read-Only. Only Field Engineers can batch approve recommendations.'
            }
          >
            {!canApplyRecommendations ? <Lock className="w-3.5 h-3.5 text-[#8A8F94]" /> : <CheckCheck className="w-3.5 h-3.5" />}
            <span>{canApplyRecommendations ? 'APPROVE HIGH CONFIDENCE (>90%)' : 'APPROVE HIGH CONFIDENCE (VIEWER: READ-ONLY)'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            className="px-2 py-1 bg-[#14171A] hover:bg-[#20262B] border border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1] text-[9px] uppercase font-bold flex items-center gap-1 transition-none"
            style={{ borderRadius: 0 }}
            title="Reset triage status for morning simulation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SQUARED PRIORITIZED TASK LIST                                          */}
      {/* ========================================================================= */}
      <div 
        className="bg-[#191D21] border border-[#2E343A] flex flex-col divide-y divide-[#2E343A] shadow-xl"
        style={{ borderRadius: 0 }}
      >
        {/* Table Header Bar */}
        <div className="bg-[#14171A] p-2.5 grid grid-cols-12 gap-2 text-[9px] text-[#5F656B] uppercase font-bold items-center border-b border-[#2E343A]">
          <div className="col-span-1 text-center">RANK &amp; PRIORITY</div>
          <div className="col-span-2">WELL ID &amp; PAD</div>
          <div className="col-span-3">RECOMMENDATION &amp; TYPE</div>
          <div className="col-span-3">ESTIMATED IMPACT &amp; PARAMETER DIFF</div>
          <div className="col-span-3 text-right">TRIAGE DECISION (APPROVE / DISMISS)</div>
        </div>

        {/* Empty State */}
        {filteredList.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            message="No pending dispatch recommendations matching active criteria"
            subMessage="All optimization proposals for the selected filter have been evaluated, committed, or deferred."
            actionText={statusFilter !== 'ALL' || priorityFilter !== 'ALL' || padFilter !== 'ALL' ? 'RESET FILTERS' : undefined}
            onAction={() => {
              setStatusFilter('ALL');
              setPriorityFilter('ALL');
              setPadFilter('ALL');
            }}
          />
        ) : (
          filteredList.map((rec) => {
            const pStyle = getPriorityStyle(rec.priority);
            const isApproved = rec.status === 'APPROVED';
            const isDismissed = rec.status === 'DISMISSED';
            const isPending = rec.status === 'PENDING';

            return (
              <div
                key={rec.id}
                className={`p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center transition-none ${
                  isApproved
                    ? 'bg-[#14171A]/70 opacity-90'
                    : isDismissed
                    ? 'bg-[#14171A]/40 opacity-60'
                    : 'bg-[#191D21] hover:bg-[#1E2328]'
                }`}
              >
                {/* 1. Priority & Rank (Col 1) */}
                <div className="md:col-span-1 flex flex-col items-center justify-center space-y-1">
                  <span className="text-[11px] font-bold text-[#E8E6E1]">
                    #{rec.impactRank}
                  </span>
                  <span 
                    className={`px-1.5 py-0.5 text-[7.5px] font-bold uppercase border ${pStyle.border} ${pStyle.text} ${pStyle.bg}`}
                    style={{ borderRadius: 0 }}
                  >
                    {rec.priority}
                  </span>
                </div>

                {/* 2. Well ID & Pad with Direct Twin Link (Col 2) */}
                <div className="md:col-span-2 flex flex-col space-y-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onNavigateToWell && onNavigateToWell(rec.wellId)}
                      className="font-bold text-xs text-[#E8E6E1] hover:text-[#C8551D] flex items-center gap-1 group text-left cursor-pointer"
                      title={`Open Digital Twin for ${rec.wellId}`}
                    >
                      <span>{rec.wellId}</span>
                      <ArrowRight className="w-3 h-3 text-[#5F656B] group-hover:text-[#C8551D]" />
                    </button>
                    <span className="text-[8px] text-[#C9B896] bg-[#14171A] border border-[#2E343A] px-1 py-0.2">
                      {rec.pad}
                    </span>
                    {onNavigateToWell && (
                      <button
                        type="button"
                        onClick={() => onNavigateToWell(rec.wellId)}
                        className="px-1 py-0.2 bg-[#14171A] hover:bg-[#C8551D] hover:text-white border border-[#C8551D] text-[#C8551D] text-[7.5px] font-bold uppercase transition-none cursor-pointer"
                        title={`Inspect Digital Twin for ${rec.wellId}`}
                      >
                        TWIN
                      </button>
                    )}
                  </div>
                  <span className="text-[8px] text-[#5F656B]">
                    MODEL FIDELITY: <strong className="text-[#3A5F45]">{rec.confidenceScore}%</strong>
                  </span>
                </div>

                {/* 3. Recommendation Title & Reasoning (Col 3) */}
                <div className="md:col-span-3 flex flex-col space-y-1">
                  <span className="text-[10px] font-bold text-[#E8E6E1] leading-snug">
                    {rec.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-[8px] text-[#C8551D] font-bold">
                    <span>[{getCategoryLabel(rec.category)}]</span>
                  </div>
                  <p className="text-[8px] text-[#8A8F94] leading-tight line-clamp-2">
                    {rec.engineeringReasoning}
                  </p>
                </div>

                {/* 4. Estimated Impact & Parameter Diff (Col 3) */}
                <div className="md:col-span-3 flex flex-col space-y-1.5 bg-[#14171A] border border-[#2E343A] p-2" style={{ borderRadius: 0 }}>
                  {/* Parameter Diff */}
                  <div className="flex items-center justify-between text-[8px]">
                    <span className="text-[#8A8F94] uppercase">{rec.parameterChange.parameter}:</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-[#5F656B] line-through">{rec.parameterChange.currentValue}</span>
                      <span className="text-[#C8551D]">→</span>
                      <span className="text-[#3A5F45]">{rec.parameterChange.recommendedValue}</span>
                    </div>
                  </div>

                  {/* Impact Summary Tag */}
                  <div className="flex items-center gap-1 text-[8.5px] font-bold text-[#E8E6E1]">
                    <Zap className="w-3 h-3 text-[#C8551D] shrink-0" />
                    <span>{rec.estimatedImpact.summary}</span>
                  </div>

                  {rec.estimatedImpact.costSavingsINR && (
                    <span className="text-[7.5px] text-[#C9B896]">
                      {rec.estimatedImpact.costSavingsINR}
                    </span>
                  )}
                </div>

                {/* 5. Approve / Dismiss Action Pair styled as squared button pairs (Col 3) */}
                <div className="md:col-span-3 flex flex-col items-end justify-center space-y-1.5">
                  {isPending ? (
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      {/* Approve Button: Strict squared corner */}
                      <button
                        type="button"
                        onClick={() => handleApprove(rec.id)}
                        disabled={!canApplyRecommendations}
                        className={`flex-1 sm:flex-none px-3 py-1.5 text-[9.5px] font-bold uppercase flex items-center justify-center gap-1.5 transition-none shadow-sm ${
                          canApplyRecommendations
                            ? 'bg-[#3A5F45] hover:bg-[#4E7D5C] text-[#FFFFFF] cursor-pointer'
                            : 'bg-[#252B30] text-[#8A8F94] border border-[#3E454D] opacity-60 cursor-not-allowed hover:bg-[#252B30]'
                        }`}
                        style={{ borderRadius: 0 }}
                        title={
                          canApplyRecommendations
                            ? 'Approve recommendation and dispatch setpoint to SCADA RTU'
                            : 'Access Restricted: Viewer role is Read-Only. Only Field Engineers can approve recommendations.'
                        }
                      >
                        {!canApplyRecommendations ? <Lock className="w-3.5 h-3.5 text-[#8A8F94]" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{canApplyRecommendations ? 'APPROVE' : 'APPROVE (LOCKED)'}</span>
                      </button>

                      {/* Dismiss Button: Strict squared corner */}
                      <button
                        type="button"
                        onClick={() => handleDismiss(rec.id)}
                        disabled={!canApplyRecommendations}
                        className={`flex-1 sm:flex-none px-2.5 py-1.5 text-[9.5px] font-bold uppercase flex items-center justify-center gap-1 transition-none border ${
                          canApplyRecommendations
                            ? 'bg-[#14171A] hover:bg-[#252B30] border-[#2E343A] hover:border-[#8C2F2F] text-[#8A8F94] hover:text-[#8C2F2F] cursor-pointer'
                            : 'bg-[#252B30] text-[#8A8F94] border-[#3E454D] opacity-60 cursor-not-allowed hover:bg-[#252B30]'
                        }`}
                        style={{ borderRadius: 0 }}
                        title={
                          canApplyRecommendations
                            ? 'Dismiss recommendation from morning triage queue'
                            : 'Access Restricted: Viewer role is Read-Only. Only Field Engineers can dismiss recommendations.'
                        }
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>DISMISS</span>
                      </button>
                    </div>
                  ) : isApproved ? (
                    <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                      <div className="flex flex-col items-end">
                        <span className="px-2 py-0.5 bg-[#3A5F45]/20 border border-[#3A5F45] text-[#3A5F45] font-bold text-[8.5px] uppercase flex items-center gap-1" style={{ borderRadius: 0 }}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>APPROVED &amp; DISPATCHED</span>
                        </span>
                        <span className="text-[7.5px] text-[#5F656B] mt-0.5">
                          {rec.triagedAt} · {rec.triagedBy}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleResetItem(rec.id)}
                        className="text-[8px] text-[#8A8F94] hover:text-[#E8E6E1] underline"
                      >
                        UNDO
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                      <div className="flex flex-col items-end">
                        <span className="px-2 py-0.5 bg-[#14171A] border border-[#2E343A] text-[#8A8F94] font-bold text-[8.5px] uppercase flex items-center gap-1" style={{ borderRadius: 0 }}>
                          <XCircle className="w-3 h-3 text-[#8C2F2F]" />
                          <span>DISMISSED / DEFERRED</span>
                        </span>
                        <span className="text-[7.5px] text-[#5F656B] mt-0.5">
                          {rec.triagedAt} · Logged in Audit Trail
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleResetItem(rec.id)}
                        className="text-[8px] text-[#8A8F94] hover:text-[#E8E6E1] underline"
                      >
                        UNDO
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info Strip */}
      <div 
        className="bg-[#191D21] border border-[#2E343A] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[8.5px] text-[#5F656B]"
        style={{ borderRadius: 0 }}
      >
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#C9B896]" />
          <span>STATUTORY AUDIT: ALL APPROVED SETPOINTS ARE SIGNED AND LOGGED UNDER DGMS GUIDELINES</span>
          <span>·</span>
          <span>SCADA RTU MODBUS POLL: 10 SECONDS</span>
        </div>
        <span className="text-[#8A8F94]">DESK-04 MORNING SHIFT</span>
      </div>
    </div>
  );
};

export default FleetActionsPage;
