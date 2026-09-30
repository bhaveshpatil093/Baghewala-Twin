import React, { useMemo } from 'react';
import { WellData } from '@/src/data/wellsData';
import { Flame, Activity, ShieldAlert, DollarSign, Award, Info, AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';

export type HealthGrade = 'A' | 'B' | 'C' | 'D';

export interface HealthDimension {
  key: 'thermal' | 'pump' | 'mechanical' | 'economic';
  label: string;
  shortLabel: string;
  score: number; // 0 - 100
  grade: HealthGrade;
  metricLabel: string;
  metricValue: string;
  benchmark: string;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
}

export interface WellHealthScorecardProps {
  well: WellData;
  variant?: 'compact' | 'expanded';
  className?: string;
  showTitle?: boolean;
}

// Helper to determine flat color based on grade (strictly flat, zero gradients)
export const getGradeFlatColor = (grade: HealthGrade): string => {
  switch (grade) {
    case 'A':
      return '#3A5F45'; // Sage green
    case 'B':
      return '#4E7D5C'; // Forest green
    case 'C':
      return '#C8551D'; // Industrial rig-orange
    case 'D':
      return '#8C2F2F'; // Crimson red
    default:
      return '#8A8F94';
  }
};

// High contrast WCAG AA accessible text colors (>4.5:1 against dark backgrounds)
export const getGradeTextColor = (grade: HealthGrade): string => {
  switch (grade) {
    case 'A':
      return 'text-[#4E9B68]'; // 5.5:1
    case 'B':
      return 'text-[#5FB37B]'; // 7.2:1
    case 'C':
      return 'text-[#D96B27]'; // 5.8:1
    case 'D':
      return 'text-[#DE5959]'; // 4.9:1
    default:
      return 'text-[#8A8F94]';
  }
};

export const getGradeAccessibleColor = (grade: HealthGrade): string => {
  switch (grade) {
    case 'A':
      return '#4E9B68';
    case 'B':
      return '#5FB37B';
    case 'C':
      return '#D96B27';
    case 'D':
      return '#DE5959';
    default:
      return '#8A8F94';
  }
};

export const getGradeIcon = (grade: HealthGrade) => {
  switch (grade) {
    case 'A':
    case 'B':
      return CheckCircle2;
    case 'C':
      return AlertTriangle;
    case 'D':
      return AlertOctagon;
    default:
      return Info;
  }
};

export const getGradeBorderColor = (grade: HealthGrade): string => {
  switch (grade) {
    case 'A':
      return 'border-[#3A5F45]';
    case 'B':
      return 'border-[#4E7D5C]';
    case 'C':
      return 'border-[#C8551D]';
    case 'D':
      return 'border-[#8C2F2F]';
    default:
      return 'border-[#8A8F94]';
  }
};

export const WellHealthScorecard: React.FC<WellHealthScorecardProps> = ({
  well,
  variant = 'expanded',
  className = '',
  showTitle = true,
}) => {
  // Compute the 4 health dimensions deterministically from live well parameters
  const dimensions = useMemo<HealthDimension[]>(() => {
    // 1. THERMAL EFFICIENCY
    let thermalScore = 70;
    const bht = well.bottomholeTempC || 120;
    const sor = well.steamOilRatio || 3.5;

    if (bht >= 150 && sor <= 3.2) thermalScore = 94;
    else if (bht >= 130 && sor <= 3.6) thermalScore = 84;
    else if (bht >= 115 && sor <= 4.0) thermalScore = 68;
    else thermalScore = Math.max(30, Math.round((bht / 115) * 45));

    let thermalGrade: HealthGrade = 'C';
    if (thermalScore >= 85) thermalGrade = 'A';
    else if (thermalScore >= 72) thermalGrade = 'B';
    else if (thermalScore >= 55) thermalGrade = 'C';
    else thermalGrade = 'D';

    // 2. PUMP PERFORMANCE
    let pumpScore = 75;
    const fillage = well.pumpFillagePct || 70;
    if (well.cyclePhase === 'Injection' || well.cyclePhase === 'Soaking') {
      pumpScore = 85; // Standby during thermal phase
    } else {
      if (fillage >= 85) pumpScore = 93;
      else if (fillage >= 74) pumpScore = 80;
      else if (fillage >= 62) pumpScore = 62;
      else pumpScore = Math.max(25, Math.round(fillage * 0.7));
    }

    let pumpGrade: HealthGrade = 'C';
    if (pumpScore >= 85) pumpGrade = 'A';
    else if (pumpScore >= 72) pumpGrade = 'B';
    else if (pumpScore >= 55) pumpGrade = 'C';
    else pumpGrade = 'D';

    // 3. MECHANICAL RISK (Structural load safety margin: 100 = completely safe, lower = higher risk)
    let mechScore = 80;
    const mprl = well.minRodLoadLbs || 3000;
    const pprl = well.polishedRodLoadLbs || 20000;

    if (well.cyclePhase === 'Injection' || well.cyclePhase === 'Soaking') {
      mechScore = 90;
    } else {
      if (mprl >= 3500 && pprl < 24000) mechScore = 95;
      else if (mprl >= 2200 && pprl < 25500) mechScore = 81;
      else if (mprl >= 1400) mechScore = 58;
      else mechScore = Math.max(20, Math.round((mprl / 2000) * 45));
    }

    let mechGrade: HealthGrade = 'C';
    if (mechScore >= 85) mechGrade = 'A';
    else if (mechScore >= 72) mechGrade = 'B';
    else if (mechScore >= 55) mechGrade = 'C';
    else mechGrade = 'D';

    // 4. ECONOMIC EFFICIENCY
    let econScore = 72;
    const bopd = well.oilRateBOPD || 0;
    if (bopd >= 80 && sor <= 3.2) econScore = 92;
    else if (bopd >= 50 && sor <= 3.8) econScore = 80;
    else if (bopd >= 25) econScore = 64;
    else econScore = Math.max(30, Math.round(30 + (bopd / 25) * 25));

    let econGrade: HealthGrade = 'C';
    if (econScore >= 85) econGrade = 'A';
    else if (econScore >= 72) econGrade = 'B';
    else if (econScore >= 55) econGrade = 'C';
    else econGrade = 'D';

    return [
      {
        key: 'thermal',
        label: 'Thermal Efficiency',
        shortLabel: 'THERMAL',
        score: thermalScore,
        grade: thermalGrade,
        metricLabel: 'BHT / SOR',
        metricValue: `${bht}°C · ${sor.toFixed(1)} m³/m³`,
        benchmark: 'Ref: >115°C / <3.5 SOR',
        status: thermalGrade === 'A' ? 'EXCELLENT' : thermalGrade === 'B' ? 'GOOD' : thermalGrade === 'C' ? 'WARNING' : 'CRITICAL',
      },
      {
        key: 'pump',
        label: 'Pump Performance',
        shortLabel: 'PUMP',
        score: pumpScore,
        grade: pumpGrade,
        metricLabel: 'Pump Fillage',
        metricValue: `${fillage}% (${well.strokeRateSPM} SPM)`,
        benchmark: 'API 11L: >75%',
        status: pumpGrade === 'A' ? 'EXCELLENT' : pumpGrade === 'B' ? 'GOOD' : pumpGrade === 'C' ? 'WARNING' : 'CRITICAL',
      },
      {
        key: 'mechanical',
        label: 'Mechanical Risk',
        shortLabel: 'MECH RISK',
        score: mechScore,
        grade: mechGrade,
        metricLabel: 'Tension Margin',
        metricValue: `${mprl.toLocaleString()} lbs MPRL`,
        benchmark: 'Safe Limit: >2,000 lbs',
        status: mechGrade === 'A' ? 'EXCELLENT' : mechGrade === 'B' ? 'GOOD' : mechGrade === 'C' ? 'WARNING' : 'CRITICAL',
      },
      {
        key: 'economic',
        label: 'Economic Efficiency',
        shortLabel: 'ECONOMIC',
        score: econScore,
        grade: econGrade,
        metricLabel: 'Recovery Rate',
        metricValue: `${bopd} BOPD`,
        benchmark: 'Target: >35 BOPD',
        status: econGrade === 'A' ? 'EXCELLENT' : econGrade === 'B' ? 'GOOD' : econGrade === 'C' ? 'WARNING' : 'CRITICAL',
      },
    ];
  }, [well]);

  // Overall average grade calculation
  const compositeScore = Math.round(
    dimensions.reduce((acc, d) => acc + d.score, 0) / dimensions.length
  );
  let overallGrade: HealthGrade = 'C';
  if (compositeScore >= 85) overallGrade = 'A';
  else if (compositeScore >= 72) overallGrade = 'B';
  else if (compositeScore >= 55) overallGrade = 'C';
  else overallGrade = 'D';

  // =========================================================================
  // COMPACT VARIANT: FOR THE WELL FLEET TABLE & DENSE LISTS
  // =========================================================================
  if (variant === 'compact') {
    return (
      <div 
        className={`inline-flex flex-col gap-1 font-mono text-[9px] select-none ${className}`}
        style={{ borderRadius: 0 }}
      >
        <div className="grid grid-cols-4 gap-1.5 min-w-[190px]">
          {dimensions.map((dim) => {
            const flatColor = getGradeFlatColor(dim.grade);
            return (
              <div 
                key={dim.key} 
                className="flex flex-col bg-[#14171A] border border-[#2E343A] p-1"
                style={{ borderRadius: 0 }}
                title={`${dim.label}: Grade ${dim.grade} (${dim.score}%) - ${dim.metricValue}`}
              >
                {/* Header: Short label & Single Letter Grade */}
                <div className="flex items-center justify-between text-[7.5px] leading-none mb-1">
                  <span className="text-[#8A8F94] font-bold uppercase truncate">
                    {dim.shortLabel.slice(0, 3)}
                  </span>
                  <span 
                    className="font-bold text-[8.5px] px-0.5 border"
                    style={{ 
                      color: flatColor,
                      borderColor: flatColor,
                      borderRadius: 0 
                    }}
                  >
                    {dim.grade}
                  </span>
                </div>

                {/* Squared Horizontal Gauge Bar (NOT circular, flat color, no gradient) */}
                <div 
                  className="w-full bg-[#191D21] h-1.5 border border-[#2E343A] overflow-hidden"
                  style={{ borderRadius: 0 }}
                >
                  <div
                    style={{
                      width: `${dim.score}%`,
                      backgroundColor: flatColor,
                      borderRadius: 0,
                    }}
                    className="h-full transition-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // EXPANDED VARIANT: FOR THE DIGITAL TWIN PAGE (DETAILED 4D SCORECARD)
  // =========================================================================
  return (
    <div 
      className={`bg-[#191D21] border border-[#2E343A] p-3 space-y-3 font-mono select-none ${className}`}
      style={{ borderRadius: 0 }}
    >
      {/* Title & Composite Fleet Index Header */}
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-[#14171A] border border-[#C8551D] text-[#C8551D]">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-[#E8E6E1] uppercase tracking-wider block">
                WELL HEALTH SCORECARD (4D MULTI-DIMENSIONAL AUDIT)
              </span>
              <span className="text-[8.5px] text-[#8A8F94]">
                COUPLED RESERVOIR THERMAL · PUMP BARREL · SUCKER ROD STRESS · LIFT OPEX
              </span>
            </div>
          </div>

          {/* Overall Health Grade Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[#8A8F94] text-[9px] uppercase">COMPOSITE ASSET RATING:</span>
            <div 
              className="px-2 py-0.5 border flex items-center gap-1.5"
              style={{
                borderColor: getGradeFlatColor(overallGrade),
                backgroundColor: '#14171A',
                borderRadius: 0,
              }}
            >
              {React.createElement(getGradeIcon(overallGrade), {
                className: `w-3 h-3 ${getGradeTextColor(overallGrade)}`,
              })}
              <span 
                className={`text-xs font-bold ${getGradeTextColor(overallGrade)}`}
              >
                GRADE {overallGrade}
              </span>
              <span className="text-[9px] text-[#8A8F94]">({compositeScore}/100)</span>
            </div>
          </div>
        </div>
      )}

      {/* Four Dimensions Grid: Squared Horizontal Gauge Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {dimensions.map((dim) => {
          const flatColor = getGradeFlatColor(dim.grade);

          return (
            <div
              key={dim.key}
              className="bg-[#14171A] border border-[#2E343A] p-2.5 flex flex-col justify-between space-y-2"
              style={{ borderRadius: 0 }}
            >
              {/* Header: Dimension Label & Letter Grade */}
              <div className="flex items-start justify-between gap-1">
                <div>
                  <span className="text-[9.5px] font-bold text-[#E8E6E1] uppercase block">
                    {dim.label}
                  </span>
                  <span className="text-[8px] text-[#8A8F94]">
                    {dim.metricLabel}: <strong className="text-[#C9B896]">{dim.metricValue}</strong>
                  </span>
                </div>

                {/* Single Letter Grade (A-D) beside each with accessible icon */}
                <div 
                  className={`px-1.5 py-0.5 border font-bold text-xs flex items-center gap-1 ${getGradeTextColor(dim.grade)}`}
                  style={{
                    borderColor: flatColor,
                    backgroundColor: '#191D21',
                    borderRadius: 0,
                  }}
                >
                  {React.createElement(getGradeIcon(dim.grade), {
                    className: "w-2.5 h-2.5 shrink-0",
                  })}
                  <span>{dim.grade}</span>
                </div>
              </div>

              {/* Squared Horizontal Gauge Bar (NOT circular, flat color, no gradient) */}
              <div className="space-y-1">
                <div 
                  className="w-full bg-[#191D21] h-3 border border-[#2E343A] relative overflow-hidden"
                  style={{ borderRadius: 0 }}
                >
                  <div
                    style={{
                      width: `${dim.score}%`,
                      backgroundColor: flatColor, // Strictly flat colour to current level
                      borderRadius: 0, // Squared edges
                    }}
                    className="h-full transition-none"
                  />
                  <span className="absolute inset-y-0 right-1.5 flex items-center text-[7.5px] font-bold text-[#FFFFFF] select-none drop-shadow-sm">
                    {dim.score}%
                  </span>
                </div>

                {/* Benchmark Tag */}
                <div className="flex items-center justify-between text-[7.5px] text-[#8A8F94]">
                  <span>{dim.benchmark}</span>
                  <span 
                    className={`font-bold ${getGradeTextColor(dim.grade)}`}
                  >
                    [{dim.status}]
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WellHealthScorecard;
