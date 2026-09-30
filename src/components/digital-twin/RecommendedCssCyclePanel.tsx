import React, { useState } from 'react';
import { WellData } from '@/src/data/wellsData';
import { Flame, Check, ShieldCheck, Zap, AlertTriangle, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import WhyRecommendationPanel from '@/src/components/shared/WhyRecommendationPanel';
import { useRole } from '@/src/context/RoleContext';
import { useAuditLog } from '@/src/context/AuditLogContext';

interface ParameterSet {
  id: 'conservative' | 'balanced' | 'aggressive';
  title: string;
  badge?: string;
  steamVolumeTons: number;
  injectionPressureMpa: number;
  soakDays: number;
  projectedSOR: number;
  incrementalBOPD: number;
  cumulativeRecoveryBbl: number;
  reasoning: string;
}

interface RecommendedCssCyclePanelProps {
  well: WellData;
  onApplyStrategy?: (strategyId: string) => void;
}

export const RecommendedCssCyclePanel: React.FC<RecommendedCssCyclePanelProps> = ({ 
  well,
  onApplyStrategy 
}) => {
  const { canApplyRecommendations, userProfile } = useRole();
  const { addAuditEntry } = useAuditLog();
  const [selectedStrategy, setSelectedStrategy] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [applied, setApplied] = useState<boolean>(false);

  const isVirginWell = well.cycleNumber <= 0;
  const nextCycleNum = isVirginWell ? 1 : well.cycleNumber + 1;
  const isHighViscosity = well.crudeViscosityCP > 800;
  const hasRodFloatRisk = well.rodFloatingRisk;
  const baseSOR = well.steamOilRatio > 0 ? well.steamOilRatio : 3.2;

  // Parameter Sets dynamically calculated from well's current thermodynamic state
  const strategies: ParameterSet[] = [
    {
      id: 'conservative',
      title: 'CONSERVATIVE',
      badge: isVirginWell ? 'INITIAL PILOT' : 'MINIMAL RISK',
      steamVolumeTons: isHighViscosity ? 3200 : 3000,
      injectionPressureMpa: 12.8,
      soakDays: 4,
      projectedSOR: Number((baseSOR * 0.92).toFixed(2)),
      incrementalBOPD: isHighViscosity ? 72 : 85,
      cumulativeRecoveryBbl: 7800,
      reasoning: isVirginWell
        ? `Pre-heats virgin near-wellbore matrix below caprock fracture limit (12.8 MPa). Lowers native cold viscosity from ${well.crudeViscosityCP} cP to ~340 cP for controlled maiden cycle flow.`
        : isHighViscosity
        ? `Preserves Jodhpur caprock margin at 12.8 MPa. Lowers viscosity from ${well.crudeViscosityCP} cP to ~340 cP; avoids thermal breakthrough to adjacent offset well.`
        : `Limits steam consumption; steady reservoir pressure maintenance with zero sand mobilization risk.`,
    },
    {
      id: 'balanced',
      title: 'BALANCED',
      badge: isVirginWell ? 'PRIMARY DESIGN' : 'RECOMMENDED BASELINE',
      steamVolumeTons: isHighViscosity ? 4200 : 3800,
      injectionPressureMpa: 14.2,
      soakDays: 6,
      projectedSOR: Number(baseSOR.toFixed(2)),
      incrementalBOPD: isHighViscosity ? 104 : 118,
      cumulativeRecoveryBbl: 11200,
      reasoning: isVirginWell
        ? `Standard Baghewala Cycle 01 commissioning template. 3,800t steam establishes 24m heated chamber, cutting native 6,200 cP bitumen to 85 cP for primary thermal recovery.`
        : isHighViscosity
        ? `Optimal enthalpy delivery. Penetrates 24m radius, heating bottomhole to 205°C and cutting viscosity to 85 cP, fully eliminating rod float risk.`
        : `Balances steam cost against recovery rate. Expected 6-day soak maximizes conductive heat equilibration across perforated payzone.`,
    },
    {
      id: 'aggressive',
      title: 'AGGRESSIVE',
      badge: isVirginWell ? 'DEEP STIMULATION' : 'MAX RECOVERY',
      steamVolumeTons: isHighViscosity ? 5400 : 4800,
      injectionPressureMpa: 15.6,
      soakDays: 8,
      projectedSOR: Number((baseSOR * 1.14).toFixed(2)),
      incrementalBOPD: isHighViscosity ? 138 : 145,
      cumulativeRecoveryBbl: 15600,
      reasoning: isVirginWell
        ? `Aggressive maiden stimulation establishing 32m deep thermal radius into virgin sandstone pay. Requires strict bottomhole pressure monitoring near fracture margin.`
        : isHighViscosity
        ? `Deepest thermal front (32m), targeting rapid recovery boost (+${isHighViscosity ? 138 : 145} BOPD). Trade-off: Higher SOR (${(baseSOR * 1.14).toFixed(2)}) and approaches 85% of formation fracture gradient.`
        : `Maximizes near-term cash flow with extended heated radius. Requires monitoring bottomhole pressure transducers for sand screen integrity.`,
    },
  ];

  const handleSelect = (id: 'conservative' | 'balanced' | 'aggressive') => {
    setSelectedStrategy(id);
    setApplied(false);
  };

  const handleApply = () => {
    setApplied(true);
    if (onApplyStrategy) {
      onApplyStrategy(selectedStrategy);
    }
    const currentStrat = strategies.find(s => s.id === selectedStrategy) || strategies[1];
    addAuditEntry({
      wellId: well.id,
      pad: well.pad,
      category: 'CSS_THERMAL',
      parameter: `CSS Cycle 0${nextCycleNum} Steam Allocation`,
      previousValue: `Cycle 0${well.cycleNumber} (${well.cyclePhase})`,
      appliedValue: `Cycle 0${nextCycleNum} (${currentStrat.steamVolumeTons} t @ ${currentStrat.injectionPressureMpa} MPa, ${currentStrat.soakDays}d soak)`,
      diffSummary: `+${currentStrat.steamVolumeTons} t steam`,
      appliedBy: userProfile.name,
      role: userProfile.roleTitle,
      desk: userProfile.desk,
      status: 'SCHEDULED',
      modbusRegister: 'HR-40301 (STEAM_GEN_SG01)',
      reasoning: currentStrat.reasoning,
      confidenceScore: 95,
      expectedGain: `+${currentStrat.incrementalBOPD} BOPD peak post-soak`,
      acknowledgementMs: 98,
    });
  };

  return (
    <div className="bg-[#1F2428] border border-[#2E343A] border-l-4 border-l-[#C8551D] p-3 flex flex-col space-y-3 select-none">
      {/* Panel Header: Squared, Actionable Recommendation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <Flame strokeWidth={1.5} className="w-4 h-4 text-[#C8551D]" />
          <div>
            <span className="font-bold text-[#E8E6E1] text-xs uppercase tracking-wider block">
              RECOMMENDED NEXT CSS CYCLE // CYCLE 0{nextCycleNum} STIMULATION DISPATCH
            </span>
            <span className="text-[9px] text-[#8A8F94]">
              Coupled thermal-lift forward solver · Optimized for {well.id} ({well.pad})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 border border-[#C8551D] bg-[#14171A] text-[#C8551D] font-bold text-[9px] uppercase">
            ACTIONABLE DISPATCH
          </span>
          <span className="text-[#8A8F94] text-[9px]">
            TRIGGER: {isVirginWell ? 'MAIDEN CYCLE COMMISSIONING (READY FOR STEAM)' : well.daysSinceInjection >= 60 ? 'IMMEDIATE DISPATCH' : `SCHEDULE IN ~${Math.max(0, 75 - well.daysSinceInjection)} DAYS`}
          </span>
        </div>
      </div>

      {/* THREE SUGGESTED PARAMETER SETS (SIDE BY SIDE SQUARED SUB-CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {strategies.map((strat) => {
          const isSelected = selectedStrategy === strat.id;
          const isBalanced = strat.id === 'balanced';

          return (
            <div
              key={strat.id}
              onClick={() => handleSelect(strat.id)}
              className={`bg-[#14171A] border p-3 flex flex-col justify-between space-y-2.5 transition-none cursor-pointer group ${
                isSelected
                  ? 'border-[#C8551D] bg-[#1A1D20]'
                  : isBalanced
                  ? 'border-[#C9B896] hover:border-[#E8E6E1]'
                  : 'border-[#2E343A] hover:border-[#8A8F94]'
              }`}
            >
              {/* Sub-card Header */}
              <div className="flex items-center justify-between border-b border-[#2E343A] pb-1.5 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 ${isSelected ? 'bg-[#C8551D]' : isBalanced ? 'bg-[#C9B896]' : 'bg-[#5F656B]'}`} />
                  <span className="font-bold text-xs text-[#E8E6E1]">
                    {strat.title}
                  </span>
                </div>
                <span
                  className={`text-[8.5px] px-1 py-0.2 border font-bold uppercase ${
                    isSelected
                      ? 'border-[#C8551D] text-[#C8551D]'
                      : isBalanced
                      ? 'border-[#C9B896] text-[#C9B896]'
                      : 'border-[#2E343A] text-[#8A8F94]'
                  }`}
                >
                  {strat.badge}
                </span>
              </div>

              {/* Core Injection & Soak Parameters Grid */}
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px] py-1 border-b border-[#2E343A]">
                <div>
                  <span className="text-[#5F656B] block">STEAM VOL:</span>
                  <strong className="text-xs text-[#E8E6E1] block mt-0.5">
                    {strat.steamVolumeTons.toLocaleString()}t
                  </strong>
                  <span className="text-[8px] text-[#8A8F94]">@ 80% qual</span>
                </div>
                <div>
                  <span className="text-[#5F656B] block">INJ PRESS:</span>
                  <strong className="text-xs text-[#E8E6E1] block mt-0.5">
                    {strat.injectionPressureMpa} MPa
                  </strong>
                  <span className="text-[8px] text-[#8A8F94]">142 bar</span>
                </div>
                <div>
                  <span className="text-[#5F656B] block">SOAK TIME:</span>
                  <strong className="text-xs text-[#C9B896] block mt-0.5">
                    {strat.soakDays} DAYS
                  </strong>
                  <span className="text-[8px] text-[#8A8F94]">Conduction</span>
                </div>
              </div>

              {/* Projected Outcome Pair: SOR & Incremental Production */}
              <div className="bg-[#191D21] border border-[#2E343A] p-2 font-mono space-y-1">
                <span className="text-[8px] text-[#5F656B] uppercase block">
                  PROJECTED RECOVERY OUTCOME PAIR:
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-[#8A8F94]">INCR PROD:</span>
                    <div className="text-xs font-bold text-[#3A5F45]">
                      +{strat.incrementalBOPD} BOPD
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-[#8A8F94]">EST. SOR:</span>
                    <div className="text-xs font-bold text-[#C8551D]">
                      {strat.projectedSOR} m³/m³
                    </div>
                  </div>
                </div>
                <div className="text-[8.5px] text-[#8A8F94] pt-0.5 flex justify-between border-t border-[#252B30]">
                  <span>EST. RECOVERY:</span>
                  <strong className="text-[#E8E6E1]">{strat.cumulativeRecoveryBbl.toLocaleString()} BBL</strong>
                </div>
              </div>

              {/* Short Reasoning Line in Smaller Grey Monospace Text */}
              <div className="pt-1">
                <span className="text-[8px] text-[#5F656B] block uppercase font-mono mb-0.5">
                  ENGINEERING TRADE-OFF ANALYSIS:
                </span>
                <p className="text-[9px] font-mono text-[#8A8F94] leading-relaxed">
                  {strat.reasoning}
                </p>
              </div>

              {/* Select Option State Button */}
              <button
                type="button"
                className={`w-full mt-2 py-1 px-2 text-[9px] font-mono font-bold uppercase transition-none border flex items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-[#C8551D] text-[#E8E6E1] border-[#C8551D]'
                    : 'bg-[#191D21] text-[#8A8F94] border-[#2E343A] group-hover:text-[#E8E6E1] group-hover:border-[#C8551D]'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check strokeWidth={2} className="w-3 h-3" />
                    <span>SELECTED DISPATCH</span>
                  </>
                ) : (
                  <span>CHOOSE {strat.title}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Reusable Why this recommendation expandable panel */}
      <WhyRecommendationPanel 
        well={well}
        contextType="css-cycle"
        title="WHY THIS THERMAL STEAM RECOMMENDATION?"
      />

      {/* Action Footer Bar */}
      <div className="bg-[#14171A] border border-[#2E343A] p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-2 text-[#8A8F94]">
          <span className="w-1.5 h-1.5 bg-[#C8551D]" />
          <span>
            ACTIVE SELECTION: <strong className="text-[#E8E6E1]">{selectedStrategy.toUpperCase()}</strong> STRATEGY
          </span>
          <span className="text-[#5F656B]">|</span>
          <span>
            FORMATION: <strong className="text-[#C9B896]">JODHPUR SANDSTONE</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {applied ? (
            <div className="flex items-center gap-1.5 text-[#3A5F45] font-bold px-2 py-1 border border-[#3A5F45] bg-[#191D21]">
              <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
              <span>DISPATCH PLAN COMMITTED TO SCADA RTU</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              disabled={!canApplyRecommendations}
              className={`px-3 py-1 font-bold text-[10px] font-mono uppercase transition-none flex items-center gap-1.5 border ${
                canApplyRecommendations
                  ? 'bg-[#C8551D] hover:bg-[#D9652D] text-[#E8E6E1] border-[#C8551D] cursor-pointer'
                  : 'bg-[#252B30] text-[#8A8F94] border-[#3E454D] opacity-60 cursor-not-allowed hover:bg-[#252B30] hover:text-[#8A8F94]'
              }`}
              style={{ borderRadius: 0 }}
              title={
                canApplyRecommendations
                  ? `Commit Cycle 0${nextCycleNum} dispatch plan to SCADA RTU`
                  : 'Access Restricted: Viewer role is Read-Only. Switch to Field Engineer role to apply recommendations.'
              }
            >
              {!canApplyRecommendations && <Lock strokeWidth={1.5} className="w-3 h-3 text-[#8A8F94]" />}
              <span>{canApplyRecommendations ? `COMMIT CYCLE 0${nextCycleNum} DISPATCH PLAN` : `COMMIT CYCLE 0${nextCycleNum} (VIEWER: READ-ONLY)`}</span>
              {canApplyRecommendations && <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendedCssCyclePanel;
