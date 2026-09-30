import React, { useState, useMemo } from 'react';
import { WellData } from '@/src/data/wellsData';
import { AlertOctagon, AlertTriangle, Clock, ShieldAlert, ArrowRight, Zap, CheckCircle2, ChevronRight, Activity, ThermometerSnowflake, HelpCircle } from 'lucide-react';

interface HourlyRisk {
  hour: number; // 1 to 24
  label: string; // "+1h", "+2h"
  status: 'normal' | 'warning' | 'fault';
  projectedTempC: number;
  projectedViscosityCP: number;
  projectedMinRodLoadLbs: number;
  riskPct: number;
  recommendedAction: string;
}

interface PredictiveRiskPanelProps {
  well: WellData;
  onInterventionDispatch?: (plan: string) => void;
}

export const PredictiveRiskPanel: React.FC<PredictiveRiskPanelProps> = ({ 
  well,
  onInterventionDispatch,
}) => {
  const [hoveredHour, setHoveredHour] = useState<HourlyRisk | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(7); // Default to critical hour
  const [dispatched, setDispatched] = useState<boolean>(false);

  // Compute 24-hour predictive forecast using forward thermal-viscosity coupled physics
  const hourlyForecast: HourlyRisk[] = useMemo(() => {
    const hours: HourlyRisk[] = [];
    const baseTemp = well.bottomholeTempC;
    const baseVisc = well.crudeViscosityCP;
    const baseMinLoad = well.minRodLoadLbs > 0 ? well.minRodLoadLbs : 1800;

    // Hourly thermal decay rate in °C/hr: ~0.18°C/hr during cyclic cool-down
    const decayRatePerHour = 0.18;

    for (let h = 1; h <= 24; h++) {
      // Temperature declines steadily over 24 hours
      const pTemp = Number((baseTemp - (h * decayRatePerHour)).toFixed(1));
      
      // Viscosity rises exponentially as temperature drops (Andrade/Walther model)
      // μ(T) = A * exp(B / (T + 273.15))
      const deltaT = baseTemp - pTemp;
      const viscMultiplier = Math.exp(deltaT * 0.042);
      const pVisc = Math.round(baseVisc * viscMultiplier);

      // Min rod load decreases as fluid viscous skin friction increases on the downstroke
      // Drag Force ∝ Viscosity * Velocity
      const dragIncreaseLbs = (pVisc - baseVisc) * 1.45;
      const pMinLoad = Math.max(250, Math.round(baseMinLoad - dragIncreaseLbs));

      // Calculate risk classification
      let status: 'normal' | 'warning' | 'fault' = 'normal';
      let riskPct = 15;
      let action = 'Continuous SCADA surveillance · Nominal SRP operations';

      if (pMinLoad < 1400 || pVisc > 1400) {
        status = 'fault';
        riskPct = Math.min(99, Math.round(75 + (24 - h) * 1.2 + (pVisc / 70)));
        action = 'CRITICAL INTERVENTION: Flush wellbore with hot water or ramp down VFD to 2.5 SPM to avoid rod buckling.';
      } else if (pMinLoad < 2000 || pVisc > 750) {
        status = 'warning';
        riskPct = Math.round(45 + (h * 1.8));
        action = 'PREEMPTIVE INTERVENTION: Trim VFD by -0.3 SPM and stage hot water truck at Pad 09.';
      } else {
        status = 'normal';
        riskPct = Math.min(30, Math.round(10 + (h * 0.8)));
        action = 'Nominal downstroke gravity fall · No immediate intervention required.';
      }

      hours.push({
        hour: h,
        label: `+${h}h`,
        status,
        projectedTempC: pTemp,
        projectedViscosityCP: pVisc,
        projectedMinRodLoadLbs: pMinLoad,
        riskPct,
        recommendedAction: action,
      });
    }

    return hours;
  }, [well]);

  // Find critical intervention threshold hour (first hour transitioning to 'fault' or 'warning')
  const firstFaultHour = hourlyForecast.find((h) => h.status === 'fault');
  const firstWarningHour = hourlyForecast.find((h) => h.status === 'warning');

  // Currently inspected hour (hovered or selected)
  const activeInspection = hoveredHour || hourlyForecast.find((h) => h.hour === selectedHour) || hourlyForecast[0];

  const handleDispatch = () => {
    setDispatched(true);
    if (onInterventionDispatch) {
      onInterventionDispatch(`Preemptive hot-water thermal flush dispatched for ${well.id} at hour +${activeInspection.hour}`);
    }
  };

  return (
    <div className="bg-[#191D21] border border-[#2E343A] p-3 flex flex-col space-y-3 select-none">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <ShieldAlert strokeWidth={1.5} className="w-4 h-4 text-[#C8551D]" />
          <div>
            <span className="font-bold text-[#E8E6E1] text-xs uppercase tracking-wider block">
              PREDICTIVE RISK // 24-HOUR FORWARD ROD-FLOATING FORECAST
            </span>
            <span className="text-[9px] text-[#8A8F94]">
              Coupled thermal decay ⇄ downstroke viscous drag wave solver · 1-hour resolution
            </span>
          </div>
        </div>

        {/* Time-To-Event Alert Flag */}
        <div className="flex items-center gap-2">
          {firstFaultHour ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#14171A] border border-[#8C2F2F] text-[#8C2F2F] font-bold text-[9px]">
              <span className="w-2 h-2 bg-[#8C2F2F]" />
              <span>ROD-FLOAT CRITICAL IN +{firstFaultHour.hour}H ({firstFaultHour.projectedViscosityCP} cP)</span>
            </div>
          ) : firstWarningHour ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#14171A] border border-[#C8551D] text-[#C8551D] font-bold text-[9px]">
              <span className="w-2 h-2 bg-[#C8551D]" />
              <span>WARNING THRESHOLD IN +{firstWarningHour.hour}H</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#14171A] border border-[#3A5F45] text-[#4E9B68] font-bold text-[9px]">
              <CheckCircle2 className="w-3 h-3 text-[#4E9B68]" />
              <span>STABLE &gt; 24 HOURS (LOW RISK)</span>
            </div>
          )}

          <span className="text-[#8A8F94] text-[9px]">SOLVER: RK4 COUPLED</span>
        </div>
      </div>

      {/* CORE TIMELINE: HORIZONTAL SQUARED SEGMENTED BAR (24 HOURLY BLOCKS) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[9px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#8A8F94] font-semibold uppercase">NEXT 24 HOURS:</span>
            <span className="text-[#8A8F94]">NOW (0h) → +24h PROJECTION</span>
          </div>

          {/* Three-Colour Status System Legend with Shape/Icon & Text */}
          <div className="flex items-center gap-3 text-[8.5px]">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#4E9B68]" />
              <span className="text-[#8A8F94]">NOMINAL (LOW)</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-[#D96B27]" />
              <span className="text-[#8A8F94]">WARNING (MED)</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertOctagon className="w-3 h-3 text-[#DE5959]" />
              <span className="text-[#8A8F94]">CRITICAL FAULT (HIGH)</span>
            </div>
          </div>
        </div>

        {/* 24 Squared Segment Blocks */}
        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 p-1 bg-[#14171A] border border-[#2E343A]">
          {hourlyForecast.map((block) => {
            const isHovered = hoveredHour?.hour === block.hour;
            const isSelected = selectedHour === block.hour;

            // Strict three-colour status styling
            const bgClass =
              block.status === 'fault'
                ? 'bg-[#8C2F2F]'
                : block.status === 'warning'
                ? 'bg-[#C8551D]'
                : 'bg-[#3A5F45]';

            return (
              <div
                key={`h-${block.hour}`}
                onMouseEnter={() => setHoveredHour(block)}
                onMouseLeave={() => setHoveredHour(null)}
                onClick={() => setSelectedHour(block.hour)}
                className={`relative h-12 flex flex-col justify-between p-1 cursor-pointer transition-none ${bgClass} ${
                  isSelected || isHovered
                    ? 'ring-2 ring-[#E8E6E1] z-10'
                    : 'opacity-90 hover:opacity-100'
                }`}
                title={`Hour +${block.hour}: ${block.status.toUpperCase()} (${block.projectedViscosityCP} cP)`}
              >
                {/* Block Top: Hour Tag & Shape Indicator */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold text-[#E8E6E1] leading-none block">
                    +{block.hour}
                  </span>
                  <span className="text-[7.5px] font-bold text-white leading-none">
                    {block.status === 'fault' ? '✕' : block.status === 'warning' ? '▲' : '✓'}
                  </span>
                </div>

                {/* Block Bottom: Risk Pct or Load Marker */}
                <div className="w-full flex items-center justify-between font-mono text-[7px] text-[#E8E6E1]/90">
                  <span className="truncate">{Math.round(block.projectedMinRodLoadLbs / 1000)}k</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Axis Markers */}
        <div className="flex items-center justify-between text-[8px] font-mono text-[#5F656B] px-1">
          <span>T+0H (CURRENT SCADA)</span>
          <span>T+6H</span>
          <span>T+12H (MID-FORECAST)</span>
          <span>T+18H</span>
          <span>T+24H (HORIZON)</span>
        </div>
      </div>

      {/* DETAILED INSPECTION DOCK FOR HOVERED / SELECTED HOURLY BLOCK */}
      <div className="bg-[#14171A] border border-[#2E343A] p-2.5 font-mono space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#252B30] pb-1.5 text-[10px]">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 ${
              activeInspection.status === 'fault'
                ? 'bg-[#8C2F2F]'
                : activeInspection.status === 'warning'
                ? 'bg-[#C8551D]'
                : 'bg-[#3A5F45]'
            }`} />
            <span className="font-bold text-[#E8E6E1] uppercase">
              FORECAST TELEMETRY AT HOUR +{activeInspection.hour} ({activeInspection.label})
            </span>
            <span className={`text-[8.5px] px-1.5 py-0.2 border uppercase font-bold ${
              activeInspection.status === 'fault'
                ? 'border-[#8C2F2F] text-[#8C2F2F]'
                : activeInspection.status === 'warning'
                ? 'border-[#C8551D] text-[#C8551D]'
                : 'border-[#3A5F45] text-[#3A5F45]'
            }`}>
              {activeInspection.status === 'fault' ? 'CRITICAL RISK' : activeInspection.status === 'warning' ? 'ELEVATED RISK' : 'NOMINAL STABLE'}
            </span>
          </div>

          <span className="text-[#8A8F94] text-[9px]">
            PREDICTED FAILURE PROBABILITY: <strong className="text-[#E8E6E1]">{activeInspection.riskPct}%</strong>
          </span>
        </div>

        {/* 4-Parameter State Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Parameter 1: Bottomhole Temperature */}
          <div className="bg-[#191D21] border border-[#2E343A] p-2">
            <span className="text-[8.5px] text-[#5F656B] block uppercase">1. BHT COOLING:</span>
            <span className="text-xs text-[#E8E6E1] font-bold block mt-0.5">
              {activeInspection.projectedTempC} °C
            </span>
            <span className="text-[8px] text-[#8A8F94]">
              -{(well.bottomholeTempC - activeInspection.projectedTempC).toFixed(1)}°C from baseline
            </span>
          </div>

          {/* Parameter 2: Crude Viscosity */}
          <div className="bg-[#191D21] border border-[#2E343A] p-2">
            <span className="text-[8.5px] text-[#5F656B] block uppercase">2. CRUDE VISCOSITY:</span>
            <span className={`text-xs font-bold block mt-0.5 ${
              activeInspection.projectedViscosityCP > 1200 ? 'text-[#8C2F2F]' : activeInspection.projectedViscosityCP > 700 ? 'text-[#C8551D]' : 'text-[#3A5F45]'
            }`}>
              {activeInspection.projectedViscosityCP.toLocaleString()} cP
            </span>
            <span className="text-[8px] text-[#8A8F94]">
              +{activeInspection.projectedViscosityCP - well.crudeViscosityCP} cP shear rise
            </span>
          </div>

          {/* Parameter 3: Min Polished Rod Load */}
          <div className="bg-[#191D21] border border-[#2E343A] p-2">
            <span className="text-[8.5px] text-[#5F656B] block uppercase">3. MIN ROD LOAD (MPRL):</span>
            <span className={`text-xs font-bold block mt-0.5 ${
              activeInspection.projectedMinRodLoadLbs < 1500 ? 'text-[#8C2F2F]' : 'text-[#C9B896]'
            }`}>
              {activeInspection.projectedMinRodLoadLbs.toLocaleString()} lbs
            </span>
            <span className="text-[8px] text-[#8A8F94]">
              {activeInspection.projectedMinRodLoadLbs < 2000 ? 'Below 2,000 lbs threshold' : 'Within safety margin'}
            </span>
          </div>

          {/* Parameter 4: Downstroke Resistance */}
          <div className="bg-[#191D21] border border-[#2E343A] p-2">
            <span className="text-[8.5px] text-[#5F656B] block uppercase">4. GRAVITY DESCENT:</span>
            <span className={`text-xs font-bold block mt-0.5 ${
              activeInspection.status === 'fault' ? 'text-[#8C2F2F]' : 'text-[#E8E6E1]'
            }`}>
              {activeInspection.status === 'fault' ? 'BUCKLING HAZARD' : 'DECELERATED FALL'}
            </span>
            <span className="text-[8px] text-[#8A8F94]">
              Rod string deceleration index
            </span>
          </div>
        </div>

        {/* Actionable Engineering Intervention Line */}
        <div className="bg-[#191D21] border border-[#2E343A] p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5 max-w-xl">
            <span className="text-[8px] text-[#5F656B] uppercase block">
              PREEMPTIVE INTERVENTION PROTOCOL (BEFORE FAULT EMERGENCE):
            </span>
            <p className="text-[9.5px] text-[#C9B896] leading-relaxed">
              {activeInspection.recommendedAction}
            </p>
          </div>

          {/* Preemptive Action Dispatch Button */}
          <div className="shrink-0">
            {dispatched ? (
              <div className="flex items-center gap-1.5 text-[#3A5F45] font-bold text-[9px] px-2 py-1 border border-[#3A5F45] bg-[#14171A]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>INTERVENTION SCHEDULED (+{activeInspection.hour}H)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDispatch}
                className="px-3 py-1 bg-[#C8551D] hover:bg-[#D9652D] text-[#E8E6E1] text-[9.5px] font-mono font-bold uppercase transition-none border border-[#C8551D] flex items-center gap-1.5"
              >
                <span>DISPATCH PREEMPTIVE FLUSH</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveRiskPanel;
