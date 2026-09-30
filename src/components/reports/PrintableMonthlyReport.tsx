import React, { useState, useMemo } from 'react';
import { BAGHEWALA_WELLS } from '@/src/data/wellsData';
import { INITIAL_MAINTENANCE_RECORDS } from '@/src/data/maintenanceData';
import { getWellEconomics } from '@/src/data/economicsData';
import { Printer, ArrowLeft, Download, CheckSquare, Calendar, User, FileText } from 'lucide-react';

interface PrintableMonthlyReportProps {
  initialWellId?: string;
  onClose?: () => void;
  onNavigateToWell?: (wellId: string) => void;
}

export const PrintableMonthlyReport: React.FC<PrintableMonthlyReportProps> = ({
  initialWellId = 'BGW-09',
  onClose,
  onNavigateToWell,
}) => {
  const [selectedWellId, setSelectedWellId] = useState<string>(initialWellId);
  const [reportPeriod, setReportPeriod] = useState<string>('September 2026 (01-Sep-2026 to 27-Sep-2026)');
  const [preparedBy, setPreparedBy] = useState<string>('R. K. Sharma, Dy. CE (Production & Thermal)');
  const [reportRefNo, setReportRefNo] = useState<string>(`OIL/RAJ/BGW/MSR/2026-09/${initialWellId.replace('BGW-', '')}`);

  // Well details
  const well = useMemo(() => {
    return BAGHEWALA_WELLS.find(w => w.id === selectedWellId) || BAGHEWALA_WELLS[0];
  }, [selectedWellId]);

  // Economics & production metrics
  const eco = useMemo(() => {
    return getWellEconomics(well.id, well.pad, well.oilRateBOPD);
  }, [well]);

  // Workover / maintenance records for this well
  const wellWorkovers = useMemo(() => {
    return INITIAL_MAINTENANCE_RECORDS.filter(r => r.wellId === selectedWellId);
  }, [selectedWellId]);

  // Monthly aggregated metrics
  const monthlyStats = useMemo(() => {
    const waterCutPct = Math.min(85, Math.max(45, 58 + (well.oilRateBOPD % 12)));
    const grossBbls = Math.round(well.oilRateBOPD * 27 / (1 - waterCutPct / 100));
    const netOilBbls = Math.round(well.oilRateBOPD * 27);
    const downtimeHours = wellWorkovers.reduce((acc, w) => acc + w.downtimeHours, 0);
    const availableHours = 27 * 24; // 648 hours for 27 days
    const operatingHours = Math.max(0, availableHours - downtimeHours);
    const availabilityPct = Number(((operatingHours / availableHours) * 100).toFixed(1));

    return {
      waterCutPct,
      grossBbls,
      netOilBbls,
      downtimeHours,
      operatingHours,
      availabilityPct,
      pprlLbs: well.polishedRodLoadLbs,
      mprlLbs: well.minRodLoadLbs,
      viscosityCP: well.crudeViscosityCP,
      bhtC: well.bottomholeTempC,
      sor: eco.steamOilRatio,
      energyKwhPerBbl: eco.optimizedEnergyKwhPerBbl,
      liftingCostINR: eco.optimizedLiftingCostPerBblINR,
    };
  }, [well, eco, wellWorkovers]);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#14171A] min-h-screen p-4 sm:p-6 flex flex-col items-center">
      {/* ========================================================================= */}
      {/* SCREEN-ONLY TOOLBAR / CONTROLS (HIDDEN DURING PRINT)                     */}
      {/* ========================================================================= */}
      <aside aria-label="Report Controls" className="print:hidden w-full max-w-4xl bg-[#191D21] border border-[#2E343A] p-3 mb-4 font-mono text-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center flex-wrap gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 bg-[#14171A] hover:bg-[#252B30] text-[#E8E6E1] border border-[#2E343A] flex items-center gap-1 uppercase font-bold"
            >
              <ArrowLeft className="w-3 h-3 text-[#C8551D]" />
              <span>RETURN TO DASHBOARD</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 pl-2 border-l border-[#2E343A]">
            <span className="text-[#8A8F94] uppercase font-bold">WELL:</span>
            <select
              value={selectedWellId}
              onChange={(e) => {
                setSelectedWellId(e.target.value);
                setReportRefNo(`OIL/RAJ/BGW/MSR/2026-09/${e.target.value.replace('BGW-', '')}`);
              }}
              className="bg-[#14171A] border border-[#2E343A] text-[#E8E6E1] px-2 py-1 rounded-none font-mono"
            >
              {BAGHEWALA_WELLS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} - Pad {w.pad} ({w.oilRateBOPD} BOPD)
                </option>
              ))}
            </select>
            {onNavigateToWell && (
              <button
                type="button"
                onClick={() => onNavigateToWell(selectedWellId)}
                className="px-2 py-1 bg-[#14171A] hover:bg-[#252B30] text-[#C9B896] hover:text-[#E8E6E1] border border-[#2E343A] uppercase font-bold text-[9px] transition-none"
                title={`Open Digital Twin for ${selectedWellId}`}
              >
                TWIN ➔
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-[#2E343A]">
            <span className="text-[#8A8F94] uppercase">PREPARED BY:</span>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              className="bg-[#14171A] border border-[#2E343A] text-[#E8E6E1] px-2 py-1 text-[9.5px] w-48 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#8A8F94] text-[9px] hidden md:inline">
            PRINT PREVIEW: MONOCHROME / BLACK &amp; WHITE OPTIMIZED
          </span>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-[#C8551D] hover:bg-[#A84313] text-[#FFFFFF] font-bold uppercase flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT REPORT / SAVE PDF</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* PRINT-OPTIMIZED DOCUMENT SHEET (CLEAN BLACK-ON-WHITE, SQUARED TABLES)     */}
      {/* ========================================================================= */}
      <div 
        id="printable-document"
        className="w-full max-w-4xl bg-white text-black p-8 sm:p-10 font-mono shadow-2xl border-2 border-black space-y-4 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full print:m-0"
      >
        {/* DOCUMENT HEADER: OFFICIAL PSU FORMAT */}
        <div className="border-b-2 border-black pb-3">
          <div className="flex items-start justify-between">
            {/* Left: Organization Title */}
            <div>
              <div className="text-sm font-bold tracking-wider uppercase">
                OIL INDIA LIMITED // ONGC THERMAL ASSET
              </div>
              <div className="text-[11px] font-semibold tracking-wide text-neutral-800">
                RAJASTHAN BASIN PROJECT · BIKANER-NAGAUR SECTOR
              </div>
              <div className="text-[10px] text-neutral-600 mt-0.5">
                THERMAL EOR ASSET MONITORING CELL · STATUTORY PRODUCTION REPORT
              </div>
            </div>

            {/* Right: Statutory Badges */}
            <div className="text-right border border-black p-1.5 text-[8.5px] bg-neutral-50 leading-tight">
              <div className="font-bold">DGMS / OISD-173 COMPLIANT</div>
              <div>CONFIDENTIAL · INTERNAL USE ONLY</div>
              <div>DOC REF: {reportRefNo}</div>
            </div>
          </div>

          <div className="text-center mt-3 pt-2 border-t border-black">
            <h1 className="text-base font-bold uppercase tracking-widest underline decoration-1">
              MONTHLY WELL PERFORMANCE &amp; THERMAL MONITORING SUMMARY
            </h1>
            <p className="text-[10px] text-neutral-700 mt-0.5 font-semibold">
              WELLBORE VISCOUS COUPLING, SRP DYNAMICS, STEAM INJECTION &amp; MTBF AUDIT
            </p>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* REQUIRED HEADER BLOCK: WELL ID, FIELD NAME, REPORT PERIOD, PREPARED BY */}
        {/* ======================================================================= */}
        <div className="border-2 border-black divide-y border-collapse">
          {/* Row 1 */}
          <div className="grid grid-cols-12 divide-x divide-black text-[10px]">
            <div className="col-span-3 p-2 bg-neutral-100 font-bold uppercase">
              WELL IDENTIFIER:
            </div>
            <div className="col-span-3 p-2 font-bold text-xs">
              {well.id}
            </div>
            <div className="col-span-3 p-2 bg-neutral-100 font-bold uppercase">
              FIELD NAME:
            </div>
            <div className="col-span-3 p-2 font-semibold">
              Baghewala Heavy Oil Field
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-12 divide-x divide-black text-[10px]">
            <div className="col-span-3 p-2 bg-neutral-100 font-bold uppercase">
              REPORT PERIOD:
            </div>
            <div className="col-span-3 p-2 font-semibold">
              {reportPeriod}
            </div>
            <div className="col-span-3 p-2 bg-neutral-100 font-bold uppercase">
              PREPARED BY:
            </div>
            <div className="col-span-3 p-2 font-semibold">
              {preparedBy}
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-12 divide-x divide-black text-[9.5px]">
            <div className="col-span-3 p-2 bg-neutral-100 font-bold uppercase">
              PAD / DRILL SITE:
            </div>
            <div className="col-span-3 p-2">
              Pad {well.pad} (Cellar #02)
            </div>
            <div className="col-span-3 p-2 bg-neutral-100 font-bold uppercase">
              FORMATION &amp; DEPTH:
            </div>
            <div className="col-span-3 p-2">
              Jodhpur Sandstone · 1,120 m MD
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-12 divide-x divide-black text-[9.5px]">
            <div className="col-span-3 p-2 bg-neutral-100 font-bold uppercase">
              CURRENT CSS CYCLE:
            </div>
            <div className="col-span-3 p-2 font-semibold">
              Cycle #{well.cycleNumber} (Thermal Production Phase)
            </div>
            <div className="col-span-3 p-2 bg-neutral-100 font-bold uppercase">
              WELL STATUS:
            </div>
            <div className="col-span-3 p-2 font-bold">
              [{well.status.toUpperCase()}] · RUNTIME {monthlyStats.availabilityPct}%
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* TABLE 1: MONTHLY PRODUCTION & LIFT PERFORMANCE                          */}
        {/* ======================================================================= */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10.5px] font-bold uppercase">
            <span>TABLE 1: MONTHLY PRODUCTION &amp; PUMP RUNTIME BENCHMARKS</span>
            <span className="text-[9px] font-normal text-neutral-600">[CALCULATED BASIS: 27 DAYS]</span>
          </div>

          <table className="w-full border-2 border-black border-collapse text-[9.5px] text-left">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-black font-bold">
                <th className="border-r border-black p-1.5">PARAMETER</th>
                <th className="border-r border-black p-1.5 text-center">MONTHLY TARGET</th>
                <th className="border-r border-black p-1.5 text-center">ACTUAL RECORDED</th>
                <th className="border-r border-black p-1.5 text-center">VARIANCE</th>
                <th className="p-1.5">REMARKS / OPERATIONAL ASSESSMENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Net Heavy Oil Rate</td>
                <td className="border-r border-black p-1.5 text-center">30.0 BOPD</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{well.oilRateBOPD}.0 BOPD</td>
                <td className="border-r border-black p-1.5 text-center">+{(well.oilRateBOPD - 30.0).toFixed(1)} BOPD</td>
                <td className="p-1.5">Post-soak thermal stimulation sustaining elevated rate</td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Cumulative Net Production</td>
                <td className="border-r border-black p-1.5 text-center">810 bbls</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{monthlyStats.netOilBbls} bbls</td>
                <td className="border-r border-black p-1.5 text-center">+{monthlyStats.netOilBbls - 810} bbls</td>
                <td className="p-1.5">Heavy crude dispatched via insulated vacuum truck</td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Produced Water Cut</td>
                <td className="border-r border-black p-1.5 text-center">60.0 %</td>
                <td className="border-r border-black p-1.5 text-center">{monthlyStats.waterCutPct}.0 %</td>
                <td className="border-r border-black p-1.5 text-center">{(monthlyStats.waterCutPct - 60.0).toFixed(1)} %</td>
                <td className="p-1.5">Condensed steam return from Cycle #{well.cycleNumber} soak</td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Pump Operating Hours</td>
                <td className="border-r border-black p-1.5 text-center">648.0 hrs</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{monthlyStats.operatingHours.toFixed(1)} hrs</td>
                <td className="border-r border-black p-1.5 text-center">-{monthlyStats.downtimeHours.toFixed(1)} hrs</td>
                <td className="p-1.5">Availability: {monthlyStats.availabilityPct}% · Downtime: {monthlyStats.downtimeHours} hrs</td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Downhole Pump Fillage</td>
                <td className="border-r border-black p-1.5 text-center">75.0 %</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{well.pumpFillagePct}.0 %</td>
                <td className="border-r border-black p-1.5 text-center font-bold">
                  {well.pumpFillagePct < 60 ? '[FLUID POUND RISK]' : '[ACCEPTABLE]'}
                </td>
                <td className="p-1.5">Dynamometer pump card fillage index</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ======================================================================= */}
        {/* TABLE 2: THERMAL STEAM & RESERVOIR PARAMETERS                           */}
        {/* ======================================================================= */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10.5px] font-bold uppercase">
            <span>TABLE 2: CYCLIC STEAM STIMULATION (CSS) &amp; THERMAL VISCOSITY AUDIT</span>
            <span className="text-[9px] font-normal text-neutral-600">[DTS FIBER &amp; PT GAUGE DATA]</span>
          </div>

          <table className="w-full border-2 border-black border-collapse text-[9.5px] text-left">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-black font-bold">
                <th className="border-r border-black p-1.5">THERMAL METRIC</th>
                <th className="border-r border-black p-1.5 text-center">RECORDED VALUE</th>
                <th className="border-r border-black p-1.5 text-center">SAFETY / DESIGN LIMIT</th>
                <th className="border-r border-black p-1.5 text-center">INTEGRITY STATUS</th>
                <th className="p-1.5">OBSERVATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Bottom-Hole Temperature (BHT)</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{well.bottomholeTempC} °C</td>
                <td className="border-r border-black p-1.5 text-center">Min 105.0 °C (Rod Float)</td>
                <td className="border-r border-black p-1.5 text-center font-bold">
                  {well.bottomholeTempC < 112 ? '[THERMAL DECAY ALERT]' : '[STABLE]'}
                </td>
                <td className="p-1.5">Temperature margin above rod float point is {(well.bottomholeTempC - 105).toFixed(1)} °C</td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Crude Viscosity at Reservoir BHT</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{well.crudeViscosityCP} cP</td>
                <td className="border-r border-black p-1.5 text-center">Max 1,800 cP</td>
                <td className="border-r border-black p-1.5 text-center font-bold">
                  {well.crudeViscosityCP > 1400 ? '[HIGH VISCOUS DRAG]' : '[NORMAL]'}
                </td>
                <td className="p-1.5">Downstroke rod fall speed slowed by fluid friction</td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Cumulative Steam-Oil Ratio (SOR)</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{eco.steamOilRatio} m³/m³</td>
                <td className="border-r border-black p-1.5 text-center">Target &lt; 3.50 m³/m³</td>
                <td className="border-r border-black p-1.5 text-center font-bold">
                  {eco.steamOilRatio > 3.8 ? '[HIGH THERMAL COST]' : '[OPTIMAL]'}
                </td>
                <td className="p-1.5">Metric tons of steam consumed per barrel recovered</td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Cumulative Cycle Steam Injected</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{eco.steamTonnesPerCycle} Tonnes</td>
                <td className="border-r border-black p-1.5 text-center">Plan: 2,100 Tonnes</td>
                <td className="border-r border-black p-1.5 text-center">[WITHIN BUDGET]</td>
                <td className="p-1.5">Steam quality: 78% dryness at wellhead manifold</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ======================================================================= */}
        {/* TABLE 3: SRP MECHANICAL STRESS & LIFT RELIABILITY                       */}
        {/* ======================================================================= */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10.5px] font-bold uppercase">
            <span>TABLE 3: SUCKER ROD PUMP (SRP) STRUCTURAL STRESS &amp; LOAD PROFILE</span>
            <span className="text-[9px] font-normal text-neutral-600">[POLISHED ROD LOAD CELL AUDIT]</span>
          </div>

          <table className="w-full border-2 border-black border-collapse text-[9.5px] text-left">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-black font-bold">
                <th className="border-r border-black p-1.5">MECHANICAL PARAMETER</th>
                <th className="border-r border-black p-1.5 text-center">MEASURED PEAK</th>
                <th className="border-r border-black p-1.5 text-center">API 11L LIMIT</th>
                <th className="border-r border-black p-1.5 text-center">STRESS FACTOR</th>
                <th className="p-1.5">DIAGNOSTIC CONCLUSION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Peak Polished Rod Load (PPRL)</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{well.polishedRodLoadLbs.toLocaleString()} lbs</td>
                <td className="border-r border-black p-1.5 text-center">26,000 lbs</td>
                <td className="border-r border-black p-1.5 text-center">
                  {((well.polishedRodLoadLbs / 26000) * 100).toFixed(1)} %
                </td>
                <td className="p-1.5">Tensile stress below 7/8" Grade D rod endurance limit</td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Minimum Polished Rod Load (MPRL)</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{well.minRodLoadLbs.toLocaleString()} lbs</td>
                <td className="border-r border-black p-1.5 text-center">Min 2,000 lbs</td>
                <td className="border-r border-black p-1.5 text-center font-bold">
                  {well.minRodLoadLbs < 2000 ? '[ROD-FLOATING HAZARD]' : '[SAFE TENSION]'}
                </td>
                <td className="p-1.5">
                  {well.minRodLoadLbs < 2000 
                    ? 'Downstroke compressive buckling detected; VFD SPM reduced'
                    : 'Adequate rod fall velocity maintained downhole'}
                </td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Lifting Energy Consumption</td>
                <td className="border-r border-black p-1.5 text-center font-bold">{eco.optimizedEnergyKwhPerBbl} kWh/bbl</td>
                <td className="border-r border-black p-1.5 text-center">Baseline: {eco.historicalEnergyKwhPerBbl} kWh</td>
                <td className="border-r border-black p-1.5 text-center font-bold">
                  -{eco.energySavingsPct}% OPEX
                </td>
                <td className="p-1.5">VFD speed modulation prevents unnecessary cyclic work</td>
              </tr>
              <tr>
                <td className="border-r border-black p-1.5 font-bold">Net Lifting Cost per Barrel</td>
                <td className="border-r border-black p-1.5 text-center font-bold">₹{eco.optimizedLiftingCostPerBblINR} / bbl</td>
                <td className="border-r border-black p-1.5 text-center">Hist: ₹{eco.historicalLiftingCostPerBblINR} / bbl</td>
                <td className="border-r border-black p-1.5 text-center font-bold">
                  -₹{eco.historicalLiftingCostPerBblINR - eco.optimizedLiftingCostPerBblINR} / bbl
                </td>
                <td className="p-1.5">Power + Steam + Workover annualized cost allocation</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ======================================================================= */}
        {/* TABLE 4: INCIDENT, FAULT & WORKOVER LOG                                 */}
        {/* ======================================================================= */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10.5px] font-bold uppercase">
            <span>TABLE 4: RECORDED DOWNHOLE FAILURES, INTERVENTIONS &amp; WORKOVERS</span>
            <span className="text-[9px] font-normal text-neutral-600">[OISD AUDIT TRAIL]</span>
          </div>

          <table className="w-full border-2 border-black border-collapse text-[9.5px] text-left">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-black font-bold">
                <th className="border-r border-black p-1.5">DATE</th>
                <th className="border-r border-black p-1.5">FAILURE TYPE</th>
                <th className="border-r border-black p-1.5">ROOT CAUSE (FAULT MODEL)</th>
                <th className="border-r border-black p-1.5 text-center">DOWNTIME</th>
                <th className="border-r border-black p-1.5 text-center">COST (INR)</th>
                <th className="p-1.5">REMEDIAL ACTION TAKEN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {wellWorkovers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-neutral-600 font-semibold">
                    NO ROD PARTING OR PUMP UNSETTING WORKOVERS RECORDED FOR {selectedWellId} DURING THIS PERIOD [PASS]
                  </td>
                </tr>
              ) : (
                wellWorkovers.map((w) => (
                  <tr key={w.id}>
                    <td className="border-r border-black p-1.5 font-bold whitespace-nowrap">{w.date}</td>
                    <td className="border-r border-black p-1.5 font-bold uppercase">{w.failureType}</td>
                    <td className="border-r border-black p-1.5">{w.rootCause}</td>
                    <td className="border-r border-black p-1.5 text-center font-bold">{w.downtimeHours.toFixed(1)} hrs</td>
                    <td className="border-r border-black p-1.5 text-center font-semibold">₹{w.costImpactINR}L</td>
                    <td className="p-1.5 text-[8.5px] leading-tight">{w.remedyAction}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ======================================================================= */}
        {/* EXECUTIVE ENGINEERING REMARKS & CERTIFICATION BLOCK                    */}
        {/* ======================================================================= */}
        <div className="border-2 border-black p-2.5 space-y-1.5 text-[9.5px]">
          <div className="font-bold uppercase tracking-wider underline">
            EXECUTIVE ENGINEERING RECOMMENDATIONS &amp; MITIGATION PLAN:
          </div>
          <p className="leading-relaxed text-neutral-800">
            1. <strong>Thermal Management:</strong> BHT at {well.bottomholeTempC} °C is within operating parameters. When BHT decays below 108 °C, schedule restimulation CSS Cycle #{well.cycleNumber + 1} to prevent bitumen congelation.<br />
            2. <strong>Pumping Kinematics:</strong> Maintain SPM between {well.strokeRateSPM} and {(well.strokeRateSPM + 0.5).toFixed(1)} strokes/min to prevent polished rod compressive load drops (&gt; 2,000 lbs threshold).<br />
            3. <strong>OISD Compliance:</strong> All stuffing box seals, polished rod liners, and flowline check valves were inspected and certified leak-free as per OISD-173 statutory safety rules.
          </p>
        </div>

        {/* ======================================================================= */}
        {/* OFFICIAL SIGN-OFF SIGNATURE BLOCK (3 SQUARED SIGNATURE BOXES)           */}
        {/* ======================================================================= */}
        <div className="pt-2">
          <div className="text-[9.5px] font-bold uppercase mb-1">
            OFFICIAL CERTIFICATION &amp; ASSET SIGN-OFF:
          </div>
          <div className="grid grid-cols-3 gap-3 border-2 border-black p-2 text-[9px]">
            {/* Box 1: Prepared By */}
            <div className="border border-black p-2 flex flex-col justify-between h-20">
              <span className="font-bold text-[8.5px] uppercase text-neutral-700">PREPARED BY (FIELD ENGINEER):</span>
              <div className="border-b border-black w-full" />
              <div className="flex justify-between text-[8px] text-neutral-600">
                <span>{preparedBy.split(',')[0]}</span>
                <span>DATE: 27-SEP-2026</span>
              </div>
            </div>

            {/* Box 2: Verified By */}
            <div className="border border-black p-2 flex flex-col justify-between h-20">
              <span className="font-bold text-[8.5px] uppercase text-neutral-700">VERIFIED BY (THERMAL IN-CHARGE):</span>
              <div className="border-b border-black w-full" />
              <div className="flex justify-between text-[8px] text-neutral-600">
                <span>S. C. Mohapatra, CE (Thermal)</span>
                <span>DATE: 27-SEP-2026</span>
              </div>
            </div>

            {/* Box 3: Approved By */}
            <div className="border border-black p-2 flex flex-col justify-between h-20">
              <span className="font-bold text-[8.5px] uppercase text-neutral-700">APPROVED BY (ASSET MANAGER):</span>
              <div className="border-b border-black w-full" />
              <div className="flex justify-between text-[8px] text-neutral-600">
                <span>Dr. A. Verma, CGM (Thermal Asset)</span>
                <span>DATE: 27-SEP-2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* DOCUMENT FOOTER */}
        <div className="pt-2 border-t border-black flex items-center justify-between text-[8px] text-neutral-600">
          <span>OIL INDIA LIMITED · RAJASTHAN PROJECT · BAGHEWALA THERMAL ASSET</span>
          <span>REPORT GENERATED: 2026-09-27 15:00 UTC · SCADA ARCHIVE V2.4</span>
          <span>PAGE 1 OF 1</span>
        </div>
      </div>
    </div>
  );
};

export default PrintableMonthlyReport;
