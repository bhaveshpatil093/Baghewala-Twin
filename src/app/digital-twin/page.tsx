import React, { useState } from 'react';
import { 
  Cpu, 
  Flame, 
  Activity, 
  Clock, 
  ChevronDown, 
  AlertTriangle, 
  AlertOctagon,
  Check,
  Layers, 
  Gauge, 
  Sliders, 
  CheckCircle2, 
  Compass, 
  Radio,
  ArrowRight,
  Database,
  Info,
  Printer
} from 'lucide-react';
import PrintableMonthlyReport from '@/src/components/reports/PrintableMonthlyReport';
import PageHeader from '@/src/components/layout/PageHeader';
import { BAGHEWALA_WELLS, WellData } from '@/src/data/wellsData';
import { useSimulation } from '@/src/context/SimulationContext';
import LastUpdatedBadge from '@/src/components/shared/LastUpdatedBadge';
import SubsurfaceWellboreSchematic from '@/src/components/digital-twin/SubsurfaceWellboreSchematic';
import ReservoirThermalDecayChart from '@/src/components/digital-twin/ReservoirThermalDecayChart';
import CssCycleTimeline from '@/src/components/digital-twin/CssCycleTimeline';
import RecommendedCssCyclePanel from '@/src/components/digital-twin/RecommendedCssCyclePanel';
import ScenarioSimulatorPanel from '@/src/components/digital-twin/ScenarioSimulatorPanel';
import SrpLiveControlPanel from '@/src/components/digital-twin/SrpLiveControlPanel';
import SrpRecommendedAdjustmentCard from '@/src/components/digital-twin/SrpRecommendedAdjustmentCard';
import DynamometerCardPanel from '@/src/components/digital-twin/DynamometerCardPanel';
import PredictiveRiskPanel from '@/src/components/digital-twin/PredictiveRiskPanel';
import WellHealthScorecard from '@/src/components/shared/WellHealthScorecard';
import InlineErrorCard from '@/src/components/shared/InlineErrorCard';
import TelemetryErrorBoundary from '@/src/components/shared/TelemetryErrorBoundary';
import DS from '@/src/design-system';

interface DigitalTwinPageProps {
  selectedWellId?: string;
  onSelectWell?: (wellId: string) => void;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = ({
  selectedWellId = 'BGW-09',
  onSelectWell,
}) => {
  const { simulatedWellsList } = useSimulation();
  const [showPrintReport, setShowPrintReport] = useState<boolean>(false);
  const [sensorStreamError, setSensorStreamError] = useState<string | null>(null);
  const [isRetryingSensor, setIsRetryingSensor] = useState<boolean>(false);
  const currentWell = simulatedWellsList.find(w => w.id === selectedWellId) || simulatedWellsList[0];

  const handleSimulateSensorFailure = () => {
    setSensorStreamError(
      `Failed to stream real-time downhole DTS fiber and load cell telemetry packets for well ${currentWell.id} [${currentWell.pad}]. SCADA RTU Modbus node at 192.168.14.${currentWell.id.replace('BGW-', '')} did not respond within 4,000ms.`
    );
  };

  const handleRetrySensor = () => {
    setIsRetryingSensor(true);
    setTimeout(() => {
      setSensorStreamError(null);
      setIsRetryingSensor(false);
    }, 600);
  };

  const handleWellChange = (newId: string) => {
    setSensorStreamError(null);
    if (onSelectWell) {
      onSelectWell(newId);
    }
  };

  // Get Phase display and days description
  const getPhaseDetails = (well: WellData) => {
    switch (well.cyclePhase) {
      case 'Injection':
        return {
          phaseLabel: 'INJECTION',
          phaseSub: 'HIGH-PRESSURE SUPERHEATED STEAM INJECTION',
          color: '#D96B27',
          daysText: 'DAY 0 OF INJECTION (STEAM INJECTOR ACTIVE)',
          badgeColor: 'border-[#C8551D] text-[#D96B27]',
        };
      case 'Soaking':
        return {
          phaseLabel: 'SOAK',
          phaseSub: 'THERMAL CONDUCTION SHUT-IN EQUILIBRATION',
          color: '#C9B896',
          daysText: `DAY ${well.daysSinceInjection} OF SOAK PHASE (WELL SHUT-IN)`,
          badgeColor: 'border-[#C9B896] text-[#C9B896]',
        };
      case 'Shut-in':
        return {
          phaseLabel: well.cycleNumber <= 0 ? 'VIRGIN BASELINE' : 'SHUT-IN',
          phaseSub: well.cycleNumber <= 0 ? 'PRE-THERMAL FORMATION SURVEY · AWAITING CYCLE 01' : 'WELL SHUT-IN · SURFACE ISOLATION VALVE CLOSED',
          color: '#C9B896',
          daysText: well.cycleNumber <= 0 ? 'VIRGIN UNSTIMULATED RESERVOIR (CYCLE 00)' : `WELL SHUT-IN (CYCLE ${well.cycleNumber})`,
          badgeColor: 'border-[#2E343A] text-[#C9B896]',
        };
      case 'Production (SRP)':
      default:
        return {
          phaseLabel: 'PRODUCTION',
          phaseSub: 'SUCKER ROD PUMP (SRP) ARTIFICIAL LIFT',
          color: '#4E9B68',
          daysText: `${well.daysSinceInjection} DAYS INTO PRODUCTION PHASE (CYCLE ${well.cycleNumber})`,
          badgeColor: 'border-[#3A5F45] text-[#4E9B68]',
        };
    }
  };

  const phaseInfo = getPhaseDetails(currentWell);

  const getStatusBadge = (well: WellData) => {
    if (well.status === 'fault') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#8C2F2F] bg-[#14171A] text-[#DE5959] font-mono text-[10px] font-bold tracking-widest uppercase">
          <AlertOctagon className="w-3 h-3 text-[#DE5959]" />
          <span>CRIT FAULT</span>
        </span>
      );
    }
    if (well.status === 'alert') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#C8551D] bg-[#14171A] text-[#D96B27] font-mono text-[10px] font-bold tracking-widest uppercase">
          <AlertTriangle className="w-3 h-3 text-[#D96B27]" />
          <span>ALERT ACTIVE</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#3A5F45] bg-[#14171A] text-[#4E9B68] font-mono text-[10px] font-bold tracking-widest uppercase">
        <Check className="w-3 h-3 text-[#4E9B68]" />
        <span>NOMINAL</span>
      </span>
    );
  };

  if (showPrintReport) {
    return (
      <PrintableMonthlyReport 
        initialWellId={currentWell.id} 
        onClose={() => setShowPrintReport(false)} 
      />
    );
  }

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-4">
      {/* 1. PERSISTENT CONTROL-ROOM WELL HEADER */}
      <div className="bg-[#1F2428] border border-[#2E343A] p-3 flex flex-col space-y-3 select-none">
        {/* Top Header Row: Well ID, Well Selector & Physical Asset ID */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#2E343A] pb-3">
          {/* Well ID and Quick Switcher Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#C8551D]" />
              <span className="font-mono text-xs font-bold text-[#8A8F94] tracking-widest uppercase">
                DIGITAL TWIN //
              </span>
              <h1 className="font-mono text-xl sm:text-2xl font-bold text-[#E8E6E1] tracking-tight">
                {currentWell.id}
              </h1>
            </div>

            {/* Well Selector Dropdown */}
            <div className="flex items-center bg-[#14171A] border border-[#2E343A] text-xs font-mono">
              <span className="px-2 py-1 text-[9px] text-[#5F656B] border-r border-[#2E343A] uppercase">
                SWITCH WELL:
              </span>
              <select
                value={currentWell.id}
                onChange={(e) => handleWellChange(e.target.value)}
                className="bg-transparent text-[#E8E6E1] font-bold px-2.5 py-1 outline-none cursor-pointer focus:text-[#C8551D]"
              >
                {simulatedWellsList.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[#1F2428] text-[#E8E6E1]">
                    {w.id} · {w.pad} [{w.cyclePhase.toUpperCase()}] {w.status !== 'normal' ? `— ${w.status.toUpperCase()}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Health Status Tag */}
            {getStatusBadge(currentWell)}
          </div>

          {/* Asset & SCADA DCS Telemetry Status Indicators & Print Report Action */}
          <div className="flex items-center flex-wrap gap-2 text-[10px] font-mono self-start lg:self-auto">
            {/* Live SCADA RTU Polling Timestamp & Refresh */}
            <LastUpdatedBadge label="RTU" pollIntervalSec={3} />

            <button
              type="button"
              onClick={() => setShowPrintReport(true)}
              className="px-2.5 py-1 bg-[#14171A] hover:bg-[#252B30] border border-[#2E343A] hover:border-[#C9B896] text-[#E8E6E1] text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-none shadow-sm cursor-pointer"
              title="Generate Official Printable Monthly Well Performance Report"
            >
              <Printer className="w-3.5 h-3.5 text-[#C9B896]" />
              <span className="hidden sm:inline">PRINT MONTHLY REPORT</span>
            </button>

            <div className="px-2 py-1 bg-[#14171A] border border-[#2E343A] text-[#8A8F94]">
              <span className="text-[#5F656B]">PAD:</span>{' '}
              <strong className="text-[#C9B896]">{currentWell.pad}</strong>
            </div>
            <div className="px-2 py-1 bg-[#14171A] border border-[#2E343A] text-[#8A8F94]">
              <span className="text-[#5F656B]">SOLVER:</span>{' '}
              <strong className="text-[#3A5F45]">COUPLED T-μ-SRP 1.0s</strong>
            </div>
            <div className="px-2 py-1 bg-[#14171A] border border-[#2E343A] text-[#8A8F94]">
              <span className="text-[#5F656B]">RTU NODE:</span>{' '}
              <strong className="text-[#E8E6E1]">BGW-RTU-{currentWell.id.replace('BGW-', '')}</strong>
            </div>

            {sensorStreamError ? (
              <button
                type="button"
                onClick={handleRetrySensor}
                disabled={isRetryingSensor}
                className="px-2.5 py-1 bg-[#8C2F2F] hover:bg-[#A83838] border border-[#8C2F2F] text-[#FFFFFF] text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-none shadow-sm cursor-pointer"
                title="Retry failed SCADA RTU sensor telemetry link"
              >
                <Radio className={`w-3.5 h-3.5 ${isRetryingSensor ? 'animate-spin' : ''}`} />
                <span>{isRetryingSensor ? 'RETRYING...' : 'RECONNECT RTU'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSimulateSensorFailure}
                className="px-2 py-1 bg-[#14171A] hover:bg-[#252B30] border border-[#2E343A] hover:border-[#8C2F2F] text-[#8A8F94] hover:text-[#8C2F2F] text-[9.5px] font-mono uppercase font-bold flex items-center gap-1 transition-none cursor-pointer"
                title="Simulate a real-time sensor failure / RTU packet loss to test error handling"
              >
                <Radio className="w-3 h-3 text-[#3A5F45]" />
                <span className="hidden sm:inline">SIMULATE SENSOR DROP</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Header Row: CURRENT CSS CYCLE PHASE & DAYS INTO CURRENT PHASE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-0.5">
          {/* Box 1: CSS Cycle Phase */}
          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flame strokeWidth={1.25} className="w-5 h-5 text-[#C8551D] shrink-0" />
              <div>
                <span className="text-[9px] font-mono uppercase text-[#8A8F94] block">
                  CURRENT CSS CYCLE PHASE
                </span>
                <span className="font-mono text-sm font-bold text-[#E8E6E1]">
                  {phaseInfo.phaseLabel}
                </span>
                <span className="text-[9px] font-mono text-[#5F656B] block">
                  {phaseInfo.phaseSub}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${phaseInfo.badgeColor} font-bold`}>
                CYCLE 0{currentWell.cycleNumber}
              </span>
            </div>
          </div>

          {/* Box 2: Days into Current Phase */}
          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock strokeWidth={1.25} className="w-5 h-5 text-[#C9B896] shrink-0" />
              <div>
                <span className="text-[9px] font-mono uppercase text-[#8A8F94] block">
                  PHASE TIME DURATION
                </span>
                <span className="font-mono text-sm font-bold text-[#C9B896]">
                  {phaseInfo.daysText}
                </span>
                <span className="text-[9px] font-mono text-[#5F656B] block">
                  POST-STEAM INJECTION CHRONOMETER
                </span>
              </div>
            </div>
          </div>

          {/* Box 3: Coupled Physics Alert / Status Summary */}
          <div className={`p-2.5 flex items-center justify-between border ${
            currentWell.status === 'fault'
              ? 'bg-[#14171A] border-[#8C2F2F]'
              : currentWell.status === 'alert'
              ? 'bg-[#14171A] border-[#C8551D]'
              : 'bg-[#14171A] border-[#2E343A]'
          }`}>
            <div className="flex items-center gap-2.5">
              <Activity strokeWidth={1.25} className={`w-5 h-5 shrink-0 ${
                currentWell.status === 'fault'
                  ? 'text-[#8C2F2F]'
                  : currentWell.status === 'alert'
                  ? 'text-[#C8551D]'
                  : 'text-[#3A5F45]'
              }`} />
              <div>
                <span className="text-[9px] font-mono uppercase text-[#8A8F94] block">
                  COUPLED TWIN HEALTH
                </span>
                <span className="font-mono text-xs font-bold text-[#E8E6E1]">
                  {currentWell.status === 'fault'
                    ? 'CRITICAL ROD FLOATING DETECTED'
                    : currentWell.status === 'alert'
                    ? 'HIGH VISCOSITY DRAG WARNING'
                    : 'THERMAL-LIFT DYNAMICS NOMINAL'}
                </span>
                <span className="text-[9px] font-mono text-[#8A8F94] block">
                  {currentWell.alertReason || 'Subsurface viscosity within pump range.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4D Multi-Dimensional Well Health Scorecard (Expanded Variant) */}
      <WellHealthScorecard well={currentWell} variant="expanded" />

      {/* SENSOR TELEMETRY ERROR STATE (SQUARED RED-BORDERED INLINE ERROR) */}
      {sensorStreamError && (
        <InlineErrorCard
          title="DOWNHOLE DTS FIBER & LOAD CELL SENSOR PACKET TIMEOUT"
          errorCode="ERR_SCADA_RTU_TIMEOUT_408"
          errorMessage={sensorStreamError}
          technicalDetails={`Protocol: Modbus TCP/IP (Port 502) · Target IP: 192.168.14.${currentWell.id.replace('BGW-', '')} · Packet Drop: 100% · Last telemetry sync: 18:42:00 IST · Sensor health: DEGRADED · DGMS Fail-Safe Mode Active`}
          onRetry={handleRetrySensor}
          isRetrying={isRetryingSensor}
        />
      )}

      {/* 2. TWO VERTICAL ZONES: SUBSURFACE STATE & SURFACE STATE (Stacked Vertically on Tablet, Side-by-Side on Desktop >= 1280px) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 items-start">
        {/* ========================================================================= */}
        {/* LEFT ZONE: SUBSURFACE STATE (RESERVOIR / WELLBORE DATA)                     */}
        {/* ========================================================================= */}
        <TelemetryErrorBoundary moduleName="SUBSURFACE STATE">
          <section className="bg-[#1F2428] border border-[#2E343A] flex flex-col space-y-3 p-3">
          {/* Monospace Section Header with Squared Section Divider */}
          <div className="bg-[#191D21] border border-[#2E343A] px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#C9B896]" />
              <h2 className="font-mono text-xs md:text-sm font-bold text-[#E8E6E1] tracking-wider uppercase">
                SUBSURFACE STATE // RESERVOIR &amp; WELLBORE DATA
              </h2>
            </div>
            <span className="text-[9px] font-mono text-[#C9B896] uppercase font-bold">
              ZONE-01 [DEPTH: 1,250m KB]
            </span>
          </div>

          {/* Subsurface Quick Telemetry Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-[#14171A] border border-[#2E343A] p-2 font-mono">
              <span className="text-[9px] text-[#5F656B] block">FORMATION:</span>
              <span className="text-xs text-[#E8E6E1] font-bold">JODHPUR SS</span>
            </div>
            <div className="bg-[#14171A] border border-[#2E343A] p-2 font-mono">
              <span className="text-[9px] text-[#5F656B] block">EST. BHT (T):</span>
              <span className={`text-xs font-bold ${currentWell.bottomholeTempC >= 200 ? 'text-[#C8551D]' : 'text-[#E8E6E1]'}`}>
                {currentWell.bottomholeTempC} °C
              </span>
            </div>
            <div className="bg-[#14171A] border border-[#2E343A] p-2 font-mono">
              <span className="text-[9px] text-[#5F656B] block">VISCOSITY (μ):</span>
              <span className={`text-xs font-bold ${currentWell.crudeViscosityCP > 500 ? 'text-[#8C2F2F]' : 'text-[#C9B896]'}`}>
                {currentWell.crudeViscosityCP} cP
              </span>
            </div>
            <div className="bg-[#14171A] border border-[#2E343A] p-2 font-mono">
              <span className="text-[9px] text-[#5F656B] block">STEAM OIL RATIO:</span>
              <span className="text-xs text-[#C9B896] font-bold">
                {currentWell.steamOilRatio} m³/m³
              </span>
            </div>
          </div>

          {/* Subsurface Primary Bay: Vertical Schematic Cross-Section Diagram */}
          <SubsurfaceWellboreSchematic well={currentWell} />

          {/* Subsurface Secondary Bay: Reservoir Thermal Decay & Viscosity Solver Chart */}
          <ReservoirThermalDecayChart well={currentWell} />

          {/* Subsurface Tertiary Bay: CSS Cycle History Timeline */}
          <CssCycleTimeline well={currentWell} />

          {/* Subsurface Quaternary Bay: Actionable Recommended Next CSS Cycle Panel */}
          <RecommendedCssCyclePanel well={currentWell} />

          {/* Subsurface Quinary Bay: Interactive Scenario Simulator Panel */}
          <ScenarioSimulatorPanel well={currentWell} />

          {/* Subsurface Footer Diagnostics Strip */}
          <div className="bg-[#191D21] border border-[#2E343A] p-2.5 flex items-center justify-between text-[10px] font-mono text-[#8A8F94]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#3A5F45]" />
              <span>THERMAL CONDUCTIVITY: 1.82 W/m·K</span>
            </div>
            <span className="text-[#5F656B]">RESERVOIR PRESSURE: 8.4 MPa</span>
          </div>
        </section>
        </TelemetryErrorBoundary>

        {/* ========================================================================= */}
        {/* RIGHT ZONE: SURFACE STATE (SRP / PUMP DATA)                               */}
        {/* ========================================================================= */}
        <TelemetryErrorBoundary moduleName="SURFACE STATE">
        <section className="bg-[#1F2428] border border-[#2E343A] flex flex-col space-y-3 p-3">
          {/* Monospace Section Header with Squared Section Divider */}
          <div className="bg-[#191D21] border border-[#2E343A] px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#C9B896]" />
              <h2 className="font-mono text-xs md:text-sm font-bold text-[#E8E6E1] tracking-wider uppercase">
                SURFACE STATE // SRP &amp; PUMP DATA
              </h2>
            </div>
            <span className="text-[9px] font-mono text-[#C9B896] uppercase font-bold">
              ZONE-02 [SRP C-912-365-168]
            </span>
          </div>

          {/* Surface State Primary Bay: Live SRP Control Panel & Recommended Adjustment Card Beside It */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 items-stretch">
            <div className="xl:col-span-8 flex flex-col justify-between">
              <SrpLiveControlPanel well={currentWell} />
            </div>
            <div className="xl:col-span-4 flex flex-col justify-between">
              <SrpRecommendedAdjustmentCard well={currentWell} />
            </div>
          </div>

          {/* Surface Secondary Bay: Dynamometer Card Closed-Loop Plot & Historical Trending */}
          <DynamometerCardPanel well={currentWell} />

          {/* Surface Tertiary Bay: Dedicated Predictive Risk 24-Hour Forward Forecast */}
          <PredictiveRiskPanel well={currentWell} />

          {/* Surface Footer Diagnostics Strip */}
          <div className="bg-[#191D21] border border-[#2E343A] p-2.5 flex items-center justify-between text-[10px] font-mono text-[#8A8F94]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#3A5F45]" />
              <span>GEARBOX RATING: 912,000 in-lbs (74% LOAD)</span>
            </div>
            <span className="text-[#5F656B]">MOTOR: 75 HP / 415V 50Hz</span>
          </div>
        </section>
        </TelemetryErrorBoundary>
      </div>
    </div>
  );
};

export default DigitalTwinPage;
