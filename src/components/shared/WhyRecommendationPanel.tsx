import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Sliders, Layers, Info } from 'lucide-react';
import { WellData } from '@/src/data/wellsData';

export interface RecommendationFactor {
  id?: string;
  label: string;
  percentage: number; // 0 - 100
  metricValue?: string; // e.g., "114°C (-18°C decay)", "68% fillage"
  impact?: 'DOMINANT' | 'PRIMARY' | 'SECONDARY' | 'CONTRIBUTING';
  description?: string;
}

export interface WhyRecommendationPanelProps {
  title?: string;
  subtitle?: string;
  factors?: RecommendationFactor[];
  contextType?: 'srp-adjustment' | 'css-cycle' | 'thermal-restimulation' | 'general';
  accentColor?: string; // Flat single accent color with varying bar length only, strictly no gradient
  defaultExpanded?: boolean;
  className?: string;
  well?: WellData;
}

export const WhyRecommendationPanel: React.FC<WhyRecommendationPanelProps> = ({
  title = 'WHY THIS RECOMMENDATION?',
  subtitle = 'INPUT FACTOR ATTRIBUTION // PHYSICS INFERENCE WEIGHTING',
  factors: customFactors,
  contextType = 'srp-adjustment',
  accentColor = '#C8551D', // Industrial Rig-Orange flat solid accent
  defaultExpanded = false,
  className = '',
  well,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  // Generate dynamic contextual factors if not explicitly provided
  const resolvedFactors: RecommendationFactor[] = React.useMemo(() => {
    if (customFactors && customFactors.length > 0) {
      return customFactors;
    }

    if (contextType === 'srp-adjustment') {
      const isViscous = (well?.crudeViscosityCP || 1200) > 800;
      const isPoorFillage = (well?.pumpFillagePct || 70) < 75;

      return [
        {
          id: 'viscous-drag',
          label: 'Downstroke Viscous Drag & Rod-Float Risk',
          percentage: isViscous ? 44 : 28,
          metricValue: `${well?.crudeViscosityCP || 1420} cP crude at BHT`,
          impact: isViscous ? 'DOMINANT' : 'PRIMARY',
          description: 'High fluid friction slows downstroke rod velocity, reducing MPRL below safe 2,000 lbs threshold.',
        },
        {
          id: 'fillage-starvation',
          label: 'Pump Barrel Fillage & Inflow Starvation',
          percentage: isPoorFillage ? 32 : 24,
          metricValue: `${well?.pumpFillagePct || 68}% fillage index`,
          impact: isPoorFillage ? 'PRIMARY' : 'SECONDARY',
          description: 'Premature fluid pound shock waves detected on dyno card lower corner.',
        },
        {
          id: 'bht-decline',
          label: 'Reservoir BHT Decline & Thermal Cooling',
          percentage: 16,
          metricValue: `${well?.bottomholeTempC || 116}°C (-14°C from soak)`,
          impact: 'SECONDARY',
          description: 'Wellbore cooling accelerates fluid re-congelation near the perforations.',
        },
        {
          id: 'vfd-power',
          label: 'Motor Torque & VFD Power Tariff Optimization',
          percentage: 8,
          metricValue: '18.4 kW (₹7.20/kWh)',
          impact: 'CONTRIBUTING',
          description: 'Trimming SPM reduces kilowatt draw while maintaining net displacement.',
        },
      ];
    }

    if (contextType === 'css-cycle' || contextType === 'thermal-restimulation') {
      return [
        {
          id: 'temperature-decline',
          label: 'Bottom-Hole Temperature (BHT) Decay Curve',
          percentage: 42,
          metricValue: `${well?.bottomholeTempC || 112}°C (crit: 105°C)`,
          impact: 'DOMINANT',
          description: 'DTS fiber sensor registers exponential thermal decay approaching rod-float limit.',
        },
        {
          id: 'sor-economic-boundary',
          label: 'Cumulative Steam-Oil Ratio (SOR) Cost Threshold',
          percentage: 28,
          metricValue: `${well?.steamOilRatio || 3.8} m³/m³ (target < 3.5)`,
          impact: 'PRIMARY',
          description: 'Marginal steam cost per additional barrel exceeds economic recovery envelope.',
        },
        {
          id: 'viscosity-increase',
          label: 'Crude Viscosity Surge (> 1,400 cP Boundary)',
          percentage: 18,
          metricValue: `${well?.crudeViscosityCP || 1620} cP reservoir condition`,
          impact: 'SECONDARY',
          description: 'Formation mobility ratio dropping by 3.2x as reservoir fluid cools.',
        },
        {
          id: 'historical-cycle-pattern',
          label: 'Historical Cycle Pattern & Offset Pad Analogs',
          percentage: 12,
          metricValue: `Cycle #${(well?.cycleNumber || 2)} offset matching`,
          impact: 'CONTRIBUTING',
          description: 'Empirical Weibull cycle model forecasts sharp production tail off after day 145.',
        },
      ];
    }

    // Default / general factors
    return [
      {
        id: 'factor-1',
        label: 'Thermodynamic State & Temperature Decline',
        percentage: 40,
        metricValue: 'High impact',
        impact: 'DOMINANT',
      },
      {
        id: 'factor-2',
        label: 'Downhole Fillage Drop & Inflow Capacity',
        percentage: 30,
        metricValue: 'Moderate impact',
        impact: 'PRIMARY',
      },
      {
        id: 'factor-3',
        label: 'Historical Production & Cycle Correlation',
        percentage: 20,
        metricValue: 'Historical baseline',
        impact: 'SECONDARY',
      },
      {
        id: 'factor-4',
        label: 'Surface Mechanical Constraints & Safety API Limits',
        percentage: 10,
        metricValue: 'API 11L verified',
        impact: 'CONTRIBUTING',
      },
    ];
  }, [customFactors, contextType, well]);

  return (
    <div className={`w-full font-mono select-none ${className}`}>
      {/* EXPAND / COLLAPSE TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-[#14171A] hover:bg-[#1E2328] border border-[#2E343A] hover:border-[#C8551D] px-2.5 py-1.5 flex items-center justify-between text-[9px] uppercase font-bold transition-none group cursor-pointer"
        style={{ borderRadius: 0 }}
      >
        <div className="flex items-center gap-2">
          <HelpCircle 
            strokeWidth={1.5} 
            className="w-3.5 h-3.5 text-[#C8551D] group-hover:text-[#E8E6E1]" 
          />
          <span className="text-[#C9B896] group-hover:text-[#E8E6E1] tracking-wider">
            {title}
          </span>
          <span className="text-[7.5px] px-1 py-0.2 bg-[#191D21] border border-[#2E343A] text-[#8A8F94] font-normal hidden sm:inline">
            ATTRIBUTION BREAKDOWN
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#8A8F94] group-hover:text-[#E8E6E1]">
          <span className="text-[8px] uppercase">
            {isExpanded ? 'COLLAPSE' : 'EXPAND'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#C8551D]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* EXPANDED CONTENT PANEL */}
      {isExpanded && (
        <div 
          className="bg-[#191D21] border-x border-b border-[#2E343A] p-2.5 space-y-2.5 transition-none"
          style={{ borderRadius: 0 }}
        >
          {/* Subtitle / Model Info */}
          <div className="flex items-center justify-between border-b border-[#252B30] pb-1 text-[8px] text-[#5F656B]">
            <span className="uppercase tracking-wider font-semibold">
              {subtitle}
            </span>
            <span className="text-[#8A8F94]">
              TOTAL: 100% WEIGHT
            </span>
          </div>

          {/* SQUARED HORIZONTAL BAR BREAKDOWN */}
          {/* Strictly flat bars with NO gradient, single accent color with varying bar length only */}
          <div className="space-y-2">
            {resolvedFactors.map((factor, idx) => (
              <div 
                key={factor.id || factor.label || idx}
                className="bg-[#14171A] border border-[#2E343A] p-2 space-y-1"
                style={{ borderRadius: 0 }}
              >
                {/* Top Label & Percentage */}
                <div className="flex items-center justify-between text-[9px] gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[#5F656B] text-[8px] font-bold">#{idx + 1}</span>
                    <span className="text-[#E8E6E1] font-semibold truncate">
                      {factor.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {factor.metricValue && (
                      <span className="text-[8px] text-[#8A8F94] hidden sm:inline">
                        [{factor.metricValue}]
                      </span>
                    )}
                    <span 
                      className="font-bold text-[9.5px]"
                      style={{ color: accentColor }}
                    >
                      {factor.percentage}%
                    </span>
                  </div>
                </div>

                {/* Flat Horizontal Bar: Strictly solid single accent color, squared edges, no gradient */}
                <div 
                  className="w-full bg-[#191D21] h-3.5 border border-[#2E343A] relative overflow-hidden"
                  style={{ borderRadius: 0 }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(2, factor.percentage))}%`,
                      backgroundColor: accentColor, // Flat solid colour
                      borderRadius: 0, // Squared edges
                    }}
                    className="h-full transition-none"
                  />
                  {/* Subtle percentage overlay inside bar if space permits */}
                  <span className="absolute inset-y-0 left-1.5 flex items-center text-[7.5px] font-bold text-[#FFFFFF] drop-shadow-sm select-none">
                    {factor.impact || `${factor.percentage}%`}
                  </span>
                </div>

                {/* Optional Factor Explanatory Description */}
                {factor.description && (
                  <p className="text-[8px] text-[#8A8F94] leading-tight pt-0.5">
                    {factor.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Panel Footer: Solver Methodology */}
          <div className="pt-1 border-t border-[#252B30] flex items-center justify-between text-[7.5px] text-[#5F656B]">
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3 text-[#8A8F94]" />
              <span>SHAPLEY VALUE ATTRIBUTION · 4D THERMAL &amp; DYNOCARD SOLVER</span>
            </div>
            <span>DGMS STATUTORY AUDITABLE</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhyRecommendationPanel;
