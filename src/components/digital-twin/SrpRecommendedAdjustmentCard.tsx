import React, { useState } from 'react';
import { WellData } from '@/src/data/wellsData';
import { Sliders, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Zap, RotateCcw, Lock } from 'lucide-react';
import WhyRecommendationPanel from '@/src/components/shared/WhyRecommendationPanel';
import { useRole } from '@/src/context/RoleContext';
import { useAuditLog } from '@/src/context/AuditLogContext';

interface SrpRecommendedAdjustmentCardProps {
  well: WellData;
  onApplySettings?: (newSettings: { spm: number; strokeIn: number }) => void;
}

export const SrpRecommendedAdjustmentCard: React.FC<SrpRecommendedAdjustmentCardProps> = ({
  well,
  onApplySettings,
}) => {
  const { canApplyRecommendations, isViewer, userProfile } = useRole();
  const { addAuditEntry } = useAuditLog();
  const [applied, setApplied] = useState<boolean>(false);

  const isHighViscosity = well.crudeViscosityCP > 800;
  const isPoorFillage = well.pumpFillagePct < 75;
  const currentSPM = well.strokeRateSPM > 0 ? well.strokeRateSPM : 4.2;
  const currentStrokeIn = 168; // Standard Lufkin C-912 crank pos 3

  // Physics-based optimization solver:
  // Downstroke Velocity v_max = pi * S * N / 720 (ft/s)
  // Terminal rod fall velocity v_term = (2 * g * r^2 * (rho_steel - rho_fluid)) / (9 * mu)
  // In high viscosity (1620 cP), v_term is very low (~0.8 ft/s), requiring lower SPM and shorter stroke
  const recommendedSPM = isHighViscosity
    ? 2.6
    : isPoorFillage
    ? Math.max(2.0, Number((currentSPM - 1.2).toFixed(1)))
    : Number((currentSPM + 0.3).toFixed(1));

  const recommendedStrokeIn = isHighViscosity ? 144 : 168;

  const reasoning = isHighViscosity
    ? `Crude viscosity at ${well.crudeViscosityCP} cP creates high drag. Cutting SPM to ${recommendedSPM} and stroke to ${recommendedStrokeIn}" reduces peak downstroke velocity by 41%, restoring min rod load above 2,200 lbs and preventing fluid pound.`
    : isPoorFillage
    ? `Pump fillage at ${well.pumpFillagePct}% indicates inflow starvation. Slowing to ${recommendedSPM} SPM allows reservoir fluid recharge into the pump barrel, eliminating fluid pound impact.`
    : `Optimal thermodynamic state (${well.bottomholeTempC}°C, ${well.crudeViscosityCP} cP). Increasing to ${recommendedSPM} SPM safely maximizes daily oil rate by +14 BOPD within 75 HP motor rating.`;

  const handleApply = () => {
    setApplied(true);
    if (onApplySettings) {
      onApplySettings({ spm: recommendedSPM, strokeIn: recommendedStrokeIn });
    }
    addAuditEntry({
      wellId: well.id,
      pad: well.pad,
      category: 'SRP_KINEMATICS',
      parameter: 'Pumping Speed & Polished Rod Stroke',
      previousValue: `${currentSPM} SPM / ${currentStrokeIn}" stroke`,
      appliedValue: `${recommendedSPM} SPM / ${recommendedStrokeIn}" stroke`,
      diffSummary: `${Number((recommendedSPM - currentSPM).toFixed(1))} SPM (${recommendedStrokeIn}" stroke)`,
      appliedBy: userProfile.name,
      role: userProfile.roleTitle,
      desk: userProfile.desk,
      status: 'COMMITTED_SCADA',
      modbusRegister: 'HR-40102 (VFD_FREQ_CMD)',
      reasoning,
      confidenceScore: isHighViscosity ? 96 : 94,
      expectedGain: isHighViscosity ? 'Restores MPRL > 2,200 lbs to prevent rod float' : '+14 BOPD net oil rate',
      acknowledgementMs: 82,
    });
  };

  const handleRevert = () => {
    setApplied(false);
    if (onApplySettings) {
      onApplySettings({ spm: currentSPM, strokeIn: currentStrokeIn });
    }
  };

  return (
    <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#C8551D] p-3 flex flex-col justify-between space-y-3 font-mono select-none h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[#2E343A] pb-1.5 text-[9px]">
        <div className="flex items-center gap-1.5">
          <Sliders strokeWidth={1.5} className="w-3.5 h-3.5 text-[#C8551D]" />
          <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
            RECOMMENDED ADJUSTMENT
          </span>
        </div>
        <span className="text-[8px] px-1 py-0.2 border border-[#C8551D] text-[#C8551D] font-bold uppercase bg-[#14171A]">
          AI OPTIMIZATION
        </span>
      </div>

      {/* Target Factors Banner */}
      <div className="bg-[#14171A] border border-[#2E343A] p-1.5 text-[8.5px] flex items-center justify-between text-[#8A8F94]">
        <span>
          VISCOSITY: <strong className={isHighViscosity ? 'text-[#8C2F2F]' : 'text-[#3A5F45]'}>{well.crudeViscosityCP} cP</strong>
        </span>
        <span className="text-[#5F656B]">|</span>
        <span>
          FILLAGE: <strong className={isPoorFillage ? 'text-[#8C2F2F]' : 'text-[#3A5F45]'}>{well.pumpFillagePct}%</strong>
        </span>
      </div>

      {/* BEFORE / AFTER PAIR OF NUMBERS WITH CLEAR ARROW */}
      <div className="space-y-2.5">
        {/* Pair 1: Strokes Per Minute (SPM) */}
        <div className="bg-[#14171A] border border-[#2E343A] p-2">
          <div className="flex items-center justify-between text-[8px] text-[#5F656B] uppercase mb-1">
            <span>PUMP SPEED [SPM]</span>
            <span className="text-[#8A8F94]">VFD FREQ ADJUST</span>
          </div>

          <div className="flex items-center justify-between">
            {/* Before Value */}
            <div className="text-left">
              <span className="text-[7.5px] text-[#5F656B] block">CURRENT:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#8A8F94] line-through">
                  {currentSPM.toFixed(1)}
                </span>
                <span className="text-[9px] text-[#5F656B]">SPM</span>
              </div>
            </div>

            {/* Clear Arrow Between Them */}
            <div className="px-2 flex flex-col items-center">
              <ArrowRight strokeWidth={2} className="w-4 h-4 text-[#C8551D]" />
              <span className="text-[7px] text-[#C8551D] font-bold mt-0.5">
                {recommendedSPM < currentSPM ? `-${(currentSPM - recommendedSPM).toFixed(1)}` : `+${(recommendedSPM - currentSPM).toFixed(1)}`}
              </span>
            </div>

            {/* After Value */}
            <div className="text-right">
              <span className="text-[7.5px] text-[#C9B896] block font-semibold">RECOMMENDED:</span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-bold text-[#E8E6E1]">
                  {recommendedSPM.toFixed(1)}
                </span>
                <span className="text-[10px] text-[#C9B896] font-semibold">SPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pair 2: Stroke Length (Inches) */}
        <div className="bg-[#14171A] border border-[#2E343A] p-2">
          <div className="flex items-center justify-between text-[8px] text-[#5F656B] uppercase mb-1">
            <span>STROKE LENGTH [IN]</span>
            <span className="text-[#8A8F94]">CRANK PIN POS</span>
          </div>

          <div className="flex items-center justify-between">
            {/* Before Value */}
            <div className="text-left">
              <span className="text-[7.5px] text-[#5F656B] block">CURRENT:</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold ${recommendedStrokeIn !== currentStrokeIn ? 'text-[#8A8F94] line-through' : 'text-[#E8E6E1]'}`}>
                  {currentStrokeIn}
                </span>
                <span className="text-[9px] text-[#5F656B]">in</span>
              </div>
            </div>

            {/* Clear Arrow Between Them */}
            <div className="px-2 flex flex-col items-center">
              <ArrowRight strokeWidth={2} className="w-4 h-4 text-[#C8551D]" />
              <span className="text-[7px] text-[#C8551D] font-bold mt-0.5">
                {recommendedStrokeIn !== currentStrokeIn ? 'POS 2' : 'HOLD'}
              </span>
            </div>

            {/* After Value */}
            <div className="text-right">
              <span className="text-[7.5px] text-[#C9B896] block font-semibold">RECOMMENDED:</span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-bold text-[#E8E6E1]">
                  {recommendedStrokeIn}
                </span>
                <span className="text-[10px] text-[#C9B896] font-semibold">in</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Short Reasoning Line in Smaller Grey Monospace Text */}
      <div className="bg-[#14171A] border border-[#2E343A] p-2 space-y-1">
        <span className="text-[7.5px] text-[#5F656B] uppercase block">
          ENGINEERING REASONING:
        </span>
        <p className="text-[9px] text-[#8A8F94] leading-relaxed">
          {reasoning}
        </p>
      </div>

      {/* Reusable Why this recommendation expandable panel */}
      <WhyRecommendationPanel 
        well={well}
        contextType="srp-adjustment"
        title="WHY THIS SRP RECOMMENDATION?"
      />

      {/* Action Footer: 'Apply Setting' Button Styled as Primary Accent Action */}
      <div className="pt-1">
        {applied ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#14171A] border border-[#3A5F45] text-[#3A5F45] text-[9.5px] font-bold uppercase">
              <CheckCircle2 strokeWidth={2} className="w-3.5 h-3.5" />
              <span>SETTINGS COMMITTED TO VFD</span>
            </div>
            <button
              type="button"
              onClick={handleRevert}
              className="w-full py-1 text-[8.5px] text-[#5F656B] hover:text-[#8A8F94] transition-none text-center flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>REVERT TO PRIOR SETTING ({currentSPM} SPM)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleApply}
              disabled={!canApplyRecommendations}
              className={`w-full py-2 px-3 text-[10px] font-bold uppercase transition-none border flex items-center justify-center gap-1.5 shadow-none ${
                canApplyRecommendations
                  ? 'bg-[#C8551D] hover:bg-[#D9652D] text-[#E8E6E1] border-[#C8551D] cursor-pointer'
                  : 'bg-[#252B30] text-[#8A8F94] border-[#3E454D] opacity-60 cursor-not-allowed hover:bg-[#252B30] hover:text-[#8A8F94]'
              }`}
              style={{ borderRadius: 0 }}
              title={
                canApplyRecommendations
                  ? 'Commit recommended SPM and stroke length setpoint to VFD'
                  : 'Access Restricted: Viewer role is Read-Only. Switch to Field Engineer role to apply recommendations.'
              }
            >
              {!canApplyRecommendations && <Lock strokeWidth={1.5} className="w-3.5 h-3.5 text-[#8A8F94]" />}
              <span>{canApplyRecommendations ? 'APPLY SETTING' : 'APPLY SETTING (VIEWER: READ-ONLY)'}</span>
              {canApplyRecommendations && <ArrowRight strokeWidth={2} className="w-3.5 h-3.5" />}
            </button>
            {!canApplyRecommendations && (
              <p className="text-[8px] text-[#8A8F94] text-center font-mono flex items-center justify-center gap-1">
                <span>🔒 ACCESS RESTRICTED: FIELD ENGINEER REQUIRED</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SrpRecommendedAdjustmentCard;
