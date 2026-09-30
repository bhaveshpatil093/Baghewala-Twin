import React, { useState, useMemo } from 'react';
import PageHeader from '@/src/components/layout/PageHeader';
import { BAGHEWALA_WELLS } from '@/src/data/wellsData';
import { 
  FIELD_ECONOMIC_SUMMARY, 
  WELL_ECONOMICS_DATABASE, 
  getWellEconomics, 
  WellEconomics 
} from '@/src/data/economicsData';
import { 
  DollarSign, 
  Zap, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Percent,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Printer
} from 'lucide-react';
import PrintableMonthlyReport from '@/src/components/reports/PrintableMonthlyReport';

interface ReportsEconomicsPageProps {
  onNavigateToWell?: (wellId: string) => void;
}

export const ReportsEconomicsPage: React.FC<ReportsEconomicsPageProps> = ({
  onNavigateToWell,
}) => {
  // Toggle: 'FIELD' | 'WELL'
  const [viewScope, setViewScope] = useState<'FIELD' | 'WELL'>('FIELD');
  const [selectedWellId, setSelectedWellId] = useState<string>('BGW-09');
  const [showPrintReport, setShowPrintReport] = useState<boolean>(false);

  // Active economic model
  const activeWellEconomics: WellEconomics = useMemo(() => {
    const foundWell = BAGHEWALA_WELLS.find(w => w.id === selectedWellId);
    return getWellEconomics(
      selectedWellId, 
      foundWell?.pad || 'Pad-02', 
      foundWell?.oilRateBOPD || 34
    );
  }, [selectedWellId]);

  // Derived metrics based on toggle
  const isField = viewScope === 'FIELD';

  const metrics = useMemo(() => {
    if (isField) {
      return {
        scopeLabel: 'FIELD-WIDE FLEET (35 ACTIVE WELLS)',
        // 1. Energy Consumption per Barrel
        energyConsumption: {
          historicalKwh: FIELD_ECONOMIC_SUMMARY.historicalEnergyKwhPerBbl,
          optimizedKwh: FIELD_ECONOMIC_SUMMARY.optimizedEnergyKwhPerBbl,
          savingsPct: FIELD_ECONOMIC_SUMMARY.energySavingsPct,
          unit: 'kWh / bbl',
        },
        // 2. Steam Cost per Cycle
        steamCost: {
          historicalLakhs: FIELD_ECONOMIC_SUMMARY.historicalSteamCostLakhsAvg,
          optimizedLakhs: FIELD_ECONOMIC_SUMMARY.optimizedSteamCostLakhsAvg,
          savingsLakhs: FIELD_ECONOMIC_SUMMARY.steamCostSavingsLakhsAvg,
          tonnesPerCycle: FIELD_ECONOMIC_SUMMARY.steamTonnesPerCycleAvg,
          unit: '₹ Lakhs / Cycle',
        },
        // 3. Cost Savings Comparison Bar Pairs
        annualOpex: {
          historical: FIELD_ECONOMIC_SUMMARY.totalHistoricalAnnualOpexCrores,
          optimized: FIELD_ECONOMIC_SUMMARY.totalOptimizedAnnualOpexCrores,
          savings: FIELD_ECONOMIC_SUMMARY.totalAnnualSavingsCrores,
          unit: '₹ Crores / Year',
          savingsUSD: FIELD_ECONOMIC_SUMMARY.totalAnnualSavingsUSD,
        },
        liftingCost: {
          historical: FIELD_ECONOMIC_SUMMARY.historicalLiftingCostINR,
          optimized: FIELD_ECONOMIC_SUMMARY.optimizedLiftingCostINR,
          savings: FIELD_ECONOMIC_SUMMARY.historicalLiftingCostINR - FIELD_ECONOMIC_SUMMARY.optimizedLiftingCostINR,
          unit: '₹ / bbl',
        },
        // 4. Projected Annual Savings Breakdown
        breakdown: [
          {
            title: 'Steam Restimulation Timing Optimization',
            amount: `₹${FIELD_ECONOMIC_SUMMARY.fieldSavingsBreakdown.steamEfficiencyCrores.toFixed(2)} Cr`,
            pct: 44.8,
            desc: 'Eliminating premature steam injection by pacing CSS to critical rod-float temperature boundary.',
          },
          {
            title: 'Workover Rig & String Parting Avoidance',
            amount: `₹${FIELD_ECONOMIC_SUMMARY.fieldSavingsBreakdown.workoverAvoidanceCrores.toFixed(2)} Cr`,
            pct: 24.4,
            desc: 'Averting 14 major rod unseating / buckling workovers via predictive minimum load monitoring.',
          },
          {
            title: 'Dynamic VFD Power & Speed Modulation',
            amount: `₹${FIELD_ECONOMIC_SUMMARY.fieldSavingsBreakdown.powerVfdCrores.toFixed(2)} Cr`,
            pct: 19.2,
            desc: 'Reducing motor kilowatt draw and downstroke fluid friction with automated VFD throttling.',
          },
          {
            title: 'Deferred Production Recovery',
            amount: `₹${FIELD_ECONOMIC_SUMMARY.fieldSavingsBreakdown.productionRecoveryCrores.toFixed(2)} Cr`,
            pct: 11.6,
            desc: 'Salvaging 16,800 bbls of deferred crude through reduced mechanical shut-in hours.',
          },
        ],
      };
    } else {
      return {
        scopeLabel: `WELL ${activeWellEconomics.wellId} (${activeWellEconomics.pad})`,
        // 1. Energy Consumption per Barrel
        energyConsumption: {
          historicalKwh: activeWellEconomics.historicalEnergyKwhPerBbl,
          optimizedKwh: activeWellEconomics.optimizedEnergyKwhPerBbl,
          savingsPct: activeWellEconomics.energySavingsPct,
          unit: 'kWh / bbl',
        },
        // 2. Steam Cost per Cycle
        steamCost: {
          historicalLakhs: activeWellEconomics.historicalSteamCostLakhs,
          optimizedLakhs: activeWellEconomics.optimizedSteamCostLakhs,
          savingsLakhs: activeWellEconomics.steamCostSavingsLakhs,
          tonnesPerCycle: activeWellEconomics.steamTonnesPerCycle,
          unit: '₹ Lakhs / Cycle',
        },
        // 3. Cost Savings Comparison Bar Pairs
        annualOpex: {
          historical: activeWellEconomics.historicalAnnualOpexLakhs,
          optimized: activeWellEconomics.optimizedAnnualOpexLakhs,
          savings: activeWellEconomics.annualSavingsLakhs,
          unit: '₹ Lakhs / Year',
          savingsUSD: activeWellEconomics.annualSavingsUSD,
        },
        liftingCost: {
          historical: activeWellEconomics.historicalLiftingCostPerBblINR,
          optimized: activeWellEconomics.optimizedLiftingCostPerBblINR,
          savings: activeWellEconomics.historicalLiftingCostPerBblINR - activeWellEconomics.optimizedLiftingCostPerBblINR,
          unit: '₹ / bbl',
        },
        // 4. Projected Annual Savings Breakdown
        breakdown: [
          {
            title: 'Steam Quality & Restimulation Optimization',
            amount: `₹${activeWellEconomics.savingsBreakdown.steamOptimizationLakhs.toFixed(1)}L`,
            pct: 43.4,
            desc: 'Extending production run to 142 days per cycle without fluid freeze.',
          },
          {
            title: 'Downhole Workover Pulling Avoidance',
            amount: `₹${activeWellEconomics.savingsBreakdown.workoverAvoidanceLakhs.toFixed(1)}L`,
            pct: 28.7,
            desc: 'Preventing downstroke compressive rod buckling in 1,620 cP crude.',
          },
          {
            title: 'VFD Speed Trimming & Power Tariff Savings',
            amount: `₹${activeWellEconomics.savingsBreakdown.powerVfdSavingsLakhs.toFixed(1)}L`,
            pct: 16.1,
            desc: 'Trimming pump speed from 4.2 to 2.6 SPM during viscous transition.',
          },
          {
            title: 'Deferred Heavy Oil Recovery',
            amount: `₹${activeWellEconomics.savingsBreakdown.deferredProductionRecoveryLakhs.toFixed(1)}L`,
            pct: 11.8,
            desc: 'Recapturing lost pumping barrels via automated stroke synchronization.',
          },
        ],
      };
    }
  }, [isField, activeWellEconomics]);

  // Export Financial CSV report
  const handleExportCSV = () => {
    const filename = isField 
      ? 'Baghewala_Field_Economics_Report.csv' 
      : `Baghewala_${selectedWellId}_Economics_Report.csv`;

    const headers = ['Scope', 'Metric Name', 'Historical Setting', 'Optimized Setting', 'Net Variance / Savings', 'Unit'];
    const rows = [
      [metrics.scopeLabel, 'Energy Consumption per Barrel', metrics.energyConsumption.historicalKwh, metrics.energyConsumption.optimizedKwh, `-${metrics.energyConsumption.savingsPct}%`, metrics.energyConsumption.unit],
      [metrics.scopeLabel, 'Steam Cost per Cycle', metrics.steamCost.historicalLakhs, metrics.steamCost.optimizedLakhs, `Save ₹${metrics.steamCost.savingsLakhs}L`, metrics.steamCost.unit],
      [metrics.scopeLabel, 'Annual Operating Expenditure (OPEX)', metrics.annualOpex.historical, metrics.annualOpex.optimized, `Save ${metrics.annualOpex.savings}`, metrics.annualOpex.unit],
      [metrics.scopeLabel, 'Lifting Cost per Barrel', metrics.liftingCost.historical, metrics.liftingCost.optimized, `Save ₹${metrics.liftingCost.savings}`, metrics.liftingCost.unit],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showPrintReport) {
    return (
      <PrintableMonthlyReport 
        initialWellId={selectedWellId} 
        onClose={() => setShowPrintReport(false)} 
      />
    );
  }

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-3 select-none">
      {/* Page Header */}
      <PageHeader
        code="NAV-07"
        title="REPORTS & FINANCIAL ECONOMICS"
        subtitle="Energy Intensity per Barrel · Steam-to-Oil Ratio (SOR) Cost Allocation · OPEX Optimization Model"
        badge="ECON-OPEX"
        statusText={`SCOPE: ${isField ? 'FIELD-WIDE (35 WELLS)' : selectedWellId} · DGMS CERTIFIED`}
      />

      {/* TOP CONTROL CONSOLE: FIELD VS WELL LEVEL TOGGLE & EXPORT BUTTON */}
      <div className="bg-[#191D21] border border-[#2E343A] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono">
        {/* Toggle Switch */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#5F656B] uppercase font-bold">ANALYSIS SCOPE:</span>
          
          <div className="inline-flex border border-[#2E343A] bg-[#14171A] p-0.5 divide-x divide-[#2E343A]">
            <button
              type="button"
              onClick={() => setViewScope('FIELD')}
              className={`px-3 py-1 text-[10px] uppercase font-bold transition-none flex items-center gap-1.5 ${
                isField 
                  ? 'bg-[#C8551D] text-[#E8E6E1]' 
                  : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#191D21]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>FIELD LEVEL (35 WELLS)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewScope('WELL')}
              className={`px-3 py-1 text-[10px] uppercase font-bold transition-none flex items-center gap-1.5 ${
                !isField 
                  ? 'bg-[#C8551D] text-[#E8E6E1]' 
                  : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#191D21]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>INDIVIDUAL WELL LEVEL</span>
            </button>
          </div>

          {/* Individual Well Selector (Visible only when 'WELL' scope is selected) */}
          {!isField && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#2E343A]">
              <span className="text-[10px] text-[#5F656B] uppercase">SELECT WELL:</span>
              <select
                value={selectedWellId}
                onChange={(e) => setSelectedWellId(e.target.value)}
                className="bg-[#14171A] border border-[#2E343A] text-[#E8E6E1] text-[10px] px-2 py-1 rounded-none font-mono focus:outline-none focus:border-[#C8551D]"
              >
                {BAGHEWALA_WELLS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.id} - Pad {w.pad} ({w.oilRateBOPD} BOPD, {w.crudeViscosityCP} cP)
                  </option>
                ))}
              </select>

              {onNavigateToWell && (
                <button
                  type="button"
                  onClick={() => onNavigateToWell(selectedWellId)}
                  className="px-2 py-1 bg-[#14171A] hover:bg-[#252B30] border border-[#2E343A] text-[9px] text-[#C9B896] hover:text-[#E8E6E1] transition-none uppercase flex items-center gap-1"
                  title="Open Well Digital Twin"
                >
                  <span>OPEN TWIN</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Export & Print Action */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowPrintReport(true)}
            className="px-3 py-1.5 bg-[#1F2428] hover:bg-[#272E34] text-[#E8E6E1] border border-[#2E343A] hover:border-[#C9B896] text-[10px] font-bold uppercase transition-none flex items-center gap-1.5 font-mono shadow-sm"
            title="Open Clean Black-on-White Monthly Well Performance Report"
          >
            <Printer className="w-3.5 h-3.5 text-[#C9B896]" />
            <span>PRINTABLE MONTHLY REPORT</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-[#1F2428] hover:bg-[#272E34] text-[#E8E6E1] border border-[#2E343A] text-[10px] font-bold uppercase transition-none flex items-center gap-1.5 font-mono"
          >
            <Download className="w-3.5 h-3.5 text-[#C8551D]" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* TOP 3 CORE FINANCIAL SUMMARY TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono">
        {/* ========================================================================= */}
        {/* TILE 1: ENERGY CONSUMPTION PER BARREL                                      */}
        {/* ========================================================================= */}
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#C8551D] p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-[#2E343A] pb-1 text-[9px]">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#C8551D]" />
              <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
                ENERGY CONSUMPTION PER BARREL
              </span>
            </div>
            <span className="text-[8px] px-1 py-0.2 bg-[#14171A] border border-[#3A5F45] text-[#3A5F45] font-bold">
              -{metrics.energyConsumption.savingsPct}% OPEX
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div>
              <span className="text-[8px] text-[#5F656B] block uppercase">OPTIMIZED AI TWIN:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#E8E6E1]">
                  {metrics.energyConsumption.optimizedKwh}
                </span>
                <span className="text-xs text-[#8A8F94] font-semibold">{metrics.energyConsumption.unit}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[8px] text-[#5F656B] block uppercase">HISTORICAL BASELINE:</span>
              <span className="text-lg font-bold text-[#8A8F94] line-through">
                {metrics.energyConsumption.historicalKwh}
              </span>
              <span className="text-[9px] text-[#5F656B] block">kwh / bbl</span>
            </div>
          </div>

          <div className="bg-[#14171A] border border-[#2E343A] p-1.5 text-[8.5px] text-[#8A8F94] flex items-center justify-between">
            <span>SAVINGS: <strong className="text-[#3A5F45]">{(metrics.energyConsumption.historicalKwh - metrics.energyConsumption.optimizedKwh).toFixed(1)} kWh/bbl</strong></span>
            <span>TARIFF: <strong className="text-[#C9B896]">₹7.20 / kWh</strong></span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TILE 2: STEAM COST PER CYCLE                                              */}
        {/* ========================================================================= */}
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#8C2F2F] p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-[#2E343A] pb-1 text-[9px]">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#8C2F2F]" />
              <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
                STEAM COST PER CYCLE
              </span>
            </div>
            <span className="text-[8px] px-1 py-0.2 bg-[#14171A] border border-[#8C2F2F] text-[#8C2F2F] font-bold">
              {metrics.steamCost.tonnesPerCycle} TONNES
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div>
              <span className="text-[8px] text-[#5F656B] block uppercase">OPTIMIZED STEAM OPEX:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#E8E6E1]">
                  ₹{metrics.steamCost.optimizedLakhs}
                </span>
                <span className="text-xs text-[#C9B896] font-semibold">LAKHS</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[8px] text-[#5F656B] block uppercase">UNTIMED INJECTION:</span>
              <span className="text-lg font-bold text-[#8A8F94] line-through">
                ₹{metrics.steamCost.historicalLakhs}L
              </span>
              <span className="text-[9px] text-[#5F656B] block">per cycle</span>
            </div>
          </div>

          <div className="bg-[#14171A] border border-[#2E343A] p-1.5 text-[8.5px] text-[#8A8F94] flex items-center justify-between">
            <span>PER CYCLE REDUCTION: <strong className="text-[#3A5F45]">₹{metrics.steamCost.savingsLakhs}L</strong></span>
            <span>STEAM VALUE: <strong className="text-[#C9B896]">₹1,420/tonne</strong></span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TILE 3: PROJECTED ANNUAL SAVINGS ESTIMATE                                  */}
        {/* ========================================================================= */}
        <div className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#3A5F45] p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-[#2E343A] pb-1 text-[9px]">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#3A5F45]" />
              <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
                PROJECTED ANNUAL SAVINGS ESTIMATE
              </span>
            </div>
            <span className="text-[8px] px-1 py-0.2 bg-[#14171A] border border-[#3A5F45] text-[#3A5F45] font-bold">
              NET GAIN
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div>
              <span className="text-[8px] text-[#5F656B] block uppercase">ANNUAL CASH CONSERVATION:</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-[#3A5F45]">
                  {isField ? `₹${metrics.annualOpex.savings.toFixed(2)} Cr` : `₹${metrics.annualOpex.savings.toFixed(1)} Lakhs`}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[8px] text-[#5F656B] block uppercase">USD EQUIVALENT:</span>
              <span className="text-lg font-bold text-[#E8E6E1]">
                ${(metrics.annualOpex.savingsUSD / (isField ? 1000000 : 1000)).toFixed(2)}{isField ? 'M' : 'k'}
              </span>
              <span className="text-[8px] text-[#8A8F94] block">USD / year</span>
            </div>
          </div>

          <div className="bg-[#14171A] border border-[#2E343A] p-1.5 text-[8.5px] text-[#8A8F94] flex items-center justify-between">
            <span>ANNUAL OPEX CUT: <strong className="text-[#3A5F45]">{(((metrics.annualOpex.historical - metrics.annualOpex.optimized) / metrics.annualOpex.historical) * 100).toFixed(1)}%</strong></span>
            <span>MODEL: <strong className="text-[#C9B896]">DGMS COMPLIANT</strong></span>
          </div>
        </div>
      </div>

      {/* CORE COMPARISON SECTION: ESTIMATED COST SAVINGS COMPARISON BAR PAIRS */}
      {/* IMPORTANT CONSTRAINT: Flat solid colour bars with squared edges (NO GRADIENT FILLS) */}
      <div className="bg-[#191D21] border border-[#2E343A] p-3 space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#2E343A] pb-2 text-[10px]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#C8551D]" />
            <div>
              <span className="font-bold text-[#E8E6E1] uppercase tracking-wider block">
                OPTIMIZED VERSUS HISTORICAL OPERATION // COMPARISON BAR PAIRS
              </span>
              <span className="text-[9px] text-[#8A8F94]">
                Flat solid color bars with squared edges · Quantifying direct OPEX variance across lifecycle dimensions
              </span>
            </div>
          </div>

          {/* Bar Chart Legend */}
          <div className="flex items-center gap-4 text-[9px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3 bg-[#8C2F2F]" />
              <span className="text-[#8A8F94] font-semibold">HISTORICAL / UNTIMED OPERATION</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3 bg-[#3A5F45]" />
              <span className="text-[#E8E6E1] font-bold">OPTIMIZED DIGITAL TWIN OPERATION</span>
            </div>
          </div>
        </div>

        {/* 4 COMPARISON BAR PAIRS */}
        <div className="space-y-4 pt-1">
          {/* ========================================================================= */}
          {/* BAR PAIR 1: TOTAL ANNUAL OPERATING EXPENDITURE (OPEX)                    */}
          {/* ========================================================================= */}
          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <span className="text-[#E8E6E1] font-bold uppercase">
                  1. ANNUAL DIRECT OPEX ({metrics.annualOpex.unit})
                </span>
                <span className="text-[8.5px] text-[#5F656B]">
                  [POWER + STEAM + PULLING RIG DAYRATE]
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#8C2F2F] font-semibold">
                  HISTORICAL: {isField ? `₹${metrics.annualOpex.historical.toFixed(1)} Cr` : `₹${metrics.annualOpex.historical}L`}
                </span>
                <span className="text-[#5F656B]">vs</span>
                <span className="text-[#3A5F45] font-bold">
                  OPTIMIZED: {isField ? `₹${metrics.annualOpex.optimized.toFixed(1)} Cr` : `₹${metrics.annualOpex.optimized}L`}
                </span>
                <span className="text-[9px] px-1 py-0.5 bg-[#191D21] border border-[#3A5F45] text-[#3A5F45] font-bold">
                  SAVE {isField ? `₹${metrics.annualOpex.savings.toFixed(2)} Cr` : `₹${metrics.annualOpex.savings}L`}
                </span>
              </div>
            </div>

            {/* Flat Solid Bar Pair */}
            <div className="space-y-1.5">
              {/* Historical Bar: Flat Solid Rust-Red (#8C2F2F) */}
              <div className="flex items-center gap-2">
                <span className="text-[8.5px] text-[#8A8F94] w-20 truncate">HISTORICAL</span>
                <div className="flex-1 bg-[#191D21] h-5 border border-[#2E343A] relative overflow-hidden">
                  <div
                    style={{ width: '100%' }}
                    className="h-full bg-[#8C2F2F] transition-none"
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center text-[9px] font-bold text-[#FFFFFF]">
                    {isField ? `₹${metrics.annualOpex.historical.toFixed(1)} Cr` : `₹${metrics.annualOpex.historical} Lakhs`}
                  </span>
                </div>
              </div>

              {/* Optimized Bar: Flat Solid Slate-Green (#3A5F45) */}
              <div className="flex items-center gap-2">
                <span className="text-[8.5px] text-[#3A5F45] font-bold w-20 truncate">OPTIMIZED</span>
                <div className="flex-1 bg-[#191D21] h-5 border border-[#2E343A] relative overflow-hidden">
                  <div
                    style={{ width: `${(metrics.annualOpex.optimized / metrics.annualOpex.historical) * 100}%` }}
                    className="h-full bg-[#3A5F45] transition-none"
                  />
                  <span className="absolute inset-y-0 left-2 flex items-center text-[9px] font-bold text-[#FFFFFF]">
                    {isField ? `₹${metrics.annualOpex.optimized.toFixed(1)} Cr` : `₹${metrics.annualOpex.optimized} Lakhs`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BAR PAIR 2: LIFTING COST PER BARREL (₹/bbl)                               */}
          {/* ========================================================================= */}
          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <span className="text-[#E8E6E1] font-bold uppercase">
                  2. LIFTING COST PER BARREL ({metrics.liftingCost.unit})
                </span>
                <span className="text-[8.5px] text-[#5F656B]">
                  [NET COST ALLOCATED PER PRODUCED HEAVY CRUDE BARREL]
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#8C2F2F] font-semibold">
                  HISTORICAL: ₹{metrics.liftingCost.historical} / bbl
                </span>
                <span className="text-[#5F656B]">vs</span>
                <span className="text-[#3A5F45] font-bold">
                  OPTIMIZED: ₹{metrics.liftingCost.optimized} / bbl
                </span>
                <span className="text-[9px] px-1 py-0.5 bg-[#191D21] border border-[#3A5F45] text-[#3A5F45] font-bold">
                  -₹{metrics.liftingCost.savings} / bbl ({(metrics.liftingCost.savings / metrics.liftingCost.historical * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Flat Solid Bar Pair */}
            <div className="space-y-1.5">
              {/* Historical Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[8.5px] text-[#8A8F94] w-20 truncate">HISTORICAL</span>
                <div className="flex-1 bg-[#191D21] h-5 border border-[#2E343A] relative overflow-hidden">
                  <div
                    style={{ width: '100%' }}
                    className="h-full bg-[#8C2F2F] transition-none"
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center text-[9px] font-bold text-[#FFFFFF]">
                    ₹{metrics.liftingCost.historical} / bbl
                  </span>
                </div>
              </div>

              {/* Optimized Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[8.5px] text-[#3A5F45] font-bold w-20 truncate">OPTIMIZED</span>
                <div className="flex-1 bg-[#191D21] h-5 border border-[#2E343A] relative overflow-hidden">
                  <div
                    style={{ width: `${(metrics.liftingCost.optimized / metrics.liftingCost.historical) * 100}%` }}
                    className="h-full bg-[#3A5F45] transition-none"
                  />
                  <span className="absolute inset-y-0 left-2 flex items-center text-[9px] font-bold text-[#FFFFFF]">
                    ₹{metrics.liftingCost.optimized} / bbl
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BAR PAIR 3: ENERGY CONSUMPTION PER BARREL (kWh/bbl)                       */}
          {/* ========================================================================= */}
          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <span className="text-[#E8E6E1] font-bold uppercase">
                  3. ELECTRICAL LIFTING ENERGY INTENSITY ({metrics.energyConsumption.unit})
                </span>
                <span className="text-[8.5px] text-[#5F656B]">
                  [VFD MOTOR ELECTRICAL CONSUMPTION AT GRID TARIFF]
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#8C2F2F] font-semibold">
                  HISTORICAL: {metrics.energyConsumption.historicalKwh} kWh
                </span>
                <span className="text-[#5F656B]">vs</span>
                <span className="text-[#3A5F45] font-bold">
                  OPTIMIZED: {metrics.energyConsumption.optimizedKwh} kWh
                </span>
                <span className="text-[9px] px-1 py-0.5 bg-[#191D21] border border-[#3A5F45] text-[#3A5F45] font-bold">
                  -{metrics.energyConsumption.savingsPct}% INTENSITY
                </span>
              </div>
            </div>

            {/* Flat Solid Bar Pair */}
            <div className="space-y-1.5">
              {/* Historical Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[8.5px] text-[#8A8F94] w-20 truncate">HISTORICAL</span>
                <div className="flex-1 bg-[#191D21] h-5 border border-[#2E343A] relative overflow-hidden">
                  <div
                    style={{ width: '100%' }}
                    className="h-full bg-[#8C2F2F] transition-none"
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center text-[9px] font-bold text-[#FFFFFF]">
                    {metrics.energyConsumption.historicalKwh} kWh / bbl
                  </span>
                </div>
              </div>

              {/* Optimized Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[8.5px] text-[#3A5F45] font-bold w-20 truncate">OPTIMIZED</span>
                <div className="flex-1 bg-[#191D21] h-5 border border-[#2E343A] relative overflow-hidden">
                  <div
                    style={{ width: `${(metrics.energyConsumption.optimizedKwh / metrics.energyConsumption.historicalKwh) * 100}%` }}
                    className="h-full bg-[#3A5F45] transition-none"
                  />
                  <span className="absolute inset-y-0 left-2 flex items-center text-[9px] font-bold text-[#FFFFFF]">
                    {metrics.energyConsumption.optimizedKwh} kWh / bbl
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BAR PAIR 4: STEAM COST PER CYCLE (₹ Lakhs)                                */}
          {/* ========================================================================= */}
          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <span className="text-[#E8E6E1] font-bold uppercase">
                  4. STEAM COST EXPENDITURE PER CYCLE ({metrics.steamCost.unit})
                </span>
                <span className="text-[8.5px] text-[#5F656B]">
                  [BOILER FUEL + FEEDWATER TREATING + CASING INJECTION]
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#8C2F2F] font-semibold">
                  HISTORICAL: ₹{metrics.steamCost.historicalLakhs}L
                </span>
                <span className="text-[#5F656B]">vs</span>
                <span className="text-[#3A5F45] font-bold">
                  OPTIMIZED: ₹{metrics.steamCost.optimizedLakhs}L
                </span>
                <span className="text-[9px] px-1 py-0.5 bg-[#191D21] border border-[#3A5F45] text-[#3A5F45] font-bold">
                  SAVE ₹{metrics.steamCost.savingsLakhs}L
                </span>
              </div>
            </div>

            {/* Flat Solid Bar Pair */}
            <div className="space-y-1.5">
              {/* Historical Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[8.5px] text-[#8A8F94] w-20 truncate">HISTORICAL</span>
                <div className="flex-1 bg-[#191D21] h-5 border border-[#2E343A] relative overflow-hidden">
                  <div
                    style={{ width: '100%' }}
                    className="h-full bg-[#8C2F2F] transition-none"
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center text-[9px] font-bold text-[#FFFFFF]">
                    ₹{metrics.steamCost.historicalLakhs} Lakhs
                  </span>
                </div>
              </div>

              {/* Optimized Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[8.5px] text-[#3A5F45] font-bold w-20 truncate">OPTIMIZED</span>
                <div className="flex-1 bg-[#191D21] h-5 border border-[#2E343A] relative overflow-hidden">
                  <div
                    style={{ width: `${(metrics.steamCost.optimizedLakhs / metrics.steamCost.historicalLakhs) * 100}%` }}
                    className="h-full bg-[#3A5F45] transition-none"
                  />
                  <span className="absolute inset-y-0 left-2 flex items-center text-[9px] font-bold text-[#FFFFFF]">
                    ₹{metrics.steamCost.optimizedLakhs} Lakhs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: ITEMISED ANNUAL SAVINGS CONTRIBUTIONS BREAKDOWN */}
      <div className="bg-[#191D21] border border-[#2E343A] p-3 space-y-2.5 font-mono">
        <div className="flex items-center justify-between border-b border-[#2E343A] pb-1.5 text-[9px]">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#3A5F45]" />
            <span className="font-bold text-[#E8E6E1] uppercase tracking-wider">
              PROJECTED ANNUAL SAVINGS BREAKDOWN // BY VALUE DRIVER
            </span>
          </div>
          <span className="text-[#8A8F94] text-[8.5px]">
            TOTAL RECAPTURED VALUE: <strong className="text-[#3A5F45]">{isField ? `₹${metrics.annualOpex.savings.toFixed(2)} Crores` : `₹${metrics.annualOpex.savings} Lakhs`}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {metrics.breakdown.map((item, idx) => (
            <div
              key={item.title}
              className="bg-[#14171A] border border-[#2E343A] p-2.5 flex flex-col justify-between space-y-2 relative"
            >
              {/* Category Header */}
              <div className="flex items-start justify-between gap-1 text-[9px]">
                <span className="text-[#E8E6E1] font-bold uppercase leading-snug">
                  {item.title}
                </span>
                <span className="text-[8px] px-1 py-0.2 bg-[#191D21] border border-[#2E343A] text-[#C9B896] font-bold shrink-0">
                  {item.pct}%
                </span>
              </div>

              {/* Amount */}
              <div>
                <span className="text-xl font-bold text-[#3A5F45] block">
                  {item.amount}
                </span>
                <span className="text-[8px] text-[#5F656B]">ANNUALIZED VALUE</span>
              </div>

              {/* Description */}
              <p className="text-[8.5px] text-[#8A8F94] leading-relaxed pt-1 border-t border-[#252B30]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER DIAGNOSTICS & STATUTORY BENCHMARKS STRIP */}
      <div className="bg-[#191D21] border border-[#2E343A] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9.5px] font-mono text-[#8A8F94]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#3A5F45]" />
          <span>DGMS &amp; OISD-173 THERMAL PRODUCTION AND ENERGY AUDIT CERTIFIED</span>
          <span className="text-[#5F656B]">·</span>
          <span>CURRENCY BASIS: INR (₹) / USD ($1 = ₹83.33)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#5F656B]">CALCULATION ENGINE: THERMAL-PHYSICS ECONOMIC DIGITAL TWIN V2.4</span>
        </div>
      </div>
    </div>
  );
};

export default ReportsEconomicsPage;
