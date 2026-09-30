import React, { useState, useRef, useCallback } from 'react';
import PageHeader from '@/src/components/layout/PageHeader';
import { BAGHEWALA_WELLS, WellData } from '@/src/data/wellsData';
import { useSimulation } from '@/src/context/SimulationContext';
import LastUpdatedBadge from '@/src/components/shared/LastUpdatedBadge';
import ModelConfidenceHeatmap from '@/src/components/charts/ModelConfidenceHeatmap';
import InlineErrorCard from '@/src/components/shared/InlineErrorCard';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon,
  Database, 
  Cpu, 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  Flame, 
  Activity, 
  Download, 
  ShieldCheck, 
  FileText,
  Clock,
  Play,
  Pause,
  FastForward,
  Thermometer,
  Droplets,
  Gauge,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';

interface DataSimulationPageProps {
  onNavigateToWell?: (wellId: string) => void;
}

type DatasetType = 'PHYSICAL_DRIFT_ENGINE' | 'PRODUCTION' | 'CSS_CYCLE' | 'SRP_OPERATING';

interface ParsedCSVData {
  fileName: string;
  fileSizeBytes: number;
  datasetType: DatasetType;
  headers: string[];
  rows: Record<string, string>[];
  targetWellId: string;
  timestamp: string;
}

// Sample CSV contents for quick 1-click evaluation
const SAMPLE_PRODUCTION_CSV = `Date,Well_ID,Pad,Gross_Liquid_BLPD,Net_Oil_BOPD,Water_Cut_Pct,Tubing_Pressure_PSI,Casing_Pressure_PSI,Cumulative_Oil_BBL
2026-09-01,BGW-09,Pad-02,112.5,38.2,66.0,85.4,142.0,14250
2026-09-02,BGW-09,Pad-02,110.8,37.6,66.1,84.8,141.5,14288
2026-09-03,BGW-09,Pad-02,109.4,36.9,66.3,84.1,141.0,14325
2026-09-04,BGW-09,Pad-02,107.5,36.1,66.4,83.5,140.2,14361
2026-09-05,BGW-09,Pad-02,105.8,35.4,66.5,82.8,139.8,14396
2026-09-06,BGW-09,Pad-02,104.2,34.8,66.6,82.1,139.0,14431
2026-09-07,BGW-09,Pad-02,103.0,34.2,66.8,81.5,138.5,14465
2026-09-08,BGW-09,Pad-02,101.5,33.5,67.0,80.8,137.8,14498
2026-09-09,BGW-09,Pad-02,99.8,32.9,67.0,80.2,137.0,14531
2026-09-10,BGW-09,Pad-02,98.4,32.1,67.4,79.5,136.4,14563
2026-09-11,BGW-09,Pad-02,97.0,31.5,67.5,78.9,135.8,14595
2026-09-12,BGW-09,Pad-02,95.5,30.8,67.7,78.2,135.0,14626`;

const SAMPLE_CSS_CSV = `CSS_Cycle,Well_ID,Pad,Injection_Start_Date,Steam_Tonnes,Steam_Temp_C,Steam_Quality_Pct,Soak_Days,Peak_BHT_C,Cum_SOR
Cycle_1,BGW-09,Pad-02,2025-04-10,2150,310,78.5,14,198.5,3.42
Cycle_2,BGW-09,Pad-02,2025-11-18,2200,312,79.0,16,204.0,3.85
Cycle_3,BGW-09,Pad-02,2026-05-22,2300,315,80.2,15,208.5,4.12`;

const SAMPLE_SRP_CSV = `Timestamp_UTC,Well_ID,SPM,Stroke_Length_In,PPRL_Lbs,MPRL_Lbs,Fluid_Friction_Drag_Lbs,Motor_Power_KW,Pump_Fillage_Pct,Card_Diagnosis
2026-09-27T00:00:00Z,BGW-09,3.2,120,24800,2150,3850,18.4,68.5,Fluid Pound Slight
2026-09-27T02:00:00Z,BGW-09,3.2,120,24950,2080,3920,18.6,67.2,Fluid Pound Slight
2026-09-27T04:00:00Z,BGW-09,3.1,120,25100,1980,4100,18.9,65.8,Rod Float Hazard
2026-09-27T06:00:00Z,BGW-09,3.0,120,24700,2120,3800,18.2,69.0,Normal Heavy Oil
2026-09-27T08:00:00Z,BGW-09,3.0,120,24650,2180,3750,18.1,70.5,Normal Heavy Oil
2026-09-27T10:00:00Z,BGW-09,3.0,120,24600,2210,3700,18.0,71.2,Normal Heavy Oil
2026-09-27T12:00:00Z,BGW-09,3.0,120,24820,2140,3820,18.3,69.8,Normal Heavy Oil
2026-09-27T14:00:00Z,BGW-09,2.8,120,24200,2350,3500,17.5,74.0,Optimized VFD Trim`;

export const DataSimulationPage: React.FC<DataSimulationPageProps> = ({
  onNavigateToWell,
}) => {
  const {
    isSimRunning,
    simSpeedMultiplier,
    totalSimulatedDaysElapsed,
    wellsState,
    simulatedWellsList,
    toggleSimulation,
    setSpeedMultiplier,
    advanceDays,
    resetSimulation,
    reSteamWell,
    liveTotalBOPD,
    liveAverageTempC,
    liveAverageViscosityCP,
    liveFaultCount,
    liveAlertCount,
    liveRodFloatCount
  } = useSimulation();

  const [sandboxWellId, setSandboxWellId] = useState<string>('BGW-09');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<DatasetType>('PHYSICAL_DRIFT_ENGINE');
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null);
  const [parseError, setParseError] = useState<{ message: string; technicalDetails: string } | null>(null);
  const [targetWellOverride, setTargetWellOverride] = useState<string>('BGW-09');
  const [ingestionState, setIngestionState] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [ingestionProgress, setIngestionProgress] = useState<number>(0);

  const sandboxWell = simulatedWellsList.find(w => w.id === sandboxWellId) || simulatedWellsList[0];
  const sandboxState = wellsState[sandboxWell.id];

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse raw CSV string into structured table
  const parseCSVString = (csvText: string, fileName: string, fileSizeBytes: number) => {
    setParseError(null);
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      setParseError({
        message: `Failed to parse telemetry dataset "${fileName}". File contains insufficient rows or invalid newline encoding.`,
        technicalDetails: `Received ${lines.length} lines. Minimum required: 1 header row + 1 data record row. Check line terminator CRLF vs LF.`,
      });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    if (headers.length < 3) {
      setParseError({
        message: `Failed to parse CSV schema in "${fileName}". Comma delimiter not detected.`,
        technicalDetails: `Detected only ${headers.length} column(s): "${headers[0]}". Ensure values are separated by commas (,) and not tabs or semicolons.`,
      });
      return;
    }

    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i];
      // Simple regex-based comma splitter that accounts for quotes
      const values = currentLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length === headers.length) {
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });
        rows.push(rowObj);
      }
    }

    // Determine category based on header keys
    let detectedCategory: DatasetType = selectedCategory;
    const headerStr = headers.join(' ').toLowerCase();
    if (headerStr.includes('steam') || headerStr.includes('css')) {
      detectedCategory = 'CSS_CYCLE';
    } else if (headerStr.includes('pprl') || headerStr.includes('spm') || headerStr.includes('load')) {
      detectedCategory = 'SRP_OPERATING';
    } else if (headerStr.includes('bopd') || headerStr.includes('oil')) {
      detectedCategory = 'PRODUCTION';
    }

    // Identify target well from rows or default
    const firstWell = rows[0]?.['Well_ID'] || rows[0]?.['WellID'] || targetWellOverride;

    setParsedData({
      fileName,
      fileSizeBytes,
      datasetType: detectedCategory,
      headers,
      rows,
      targetWellId: firstWell,
      timestamp: new Date().toISOString(),
    });
    setTargetWellOverride(firstWell);
    setIngestionState('IDLE');
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseCSVString(content, file.name, file.size);
    };
    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError({
        message: 'UNSUPPORTED TELEMETRY FILE FORMAT',
        technicalDetails: `Selected file "${file.name}" is not a RFC-4180 compliant .csv document. Please select a valid CSV telemetry log.`
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseCSVString(content, file.name, file.size);
    };
    reader.readAsText(file);
  }, [selectedCategory, targetWellOverride]);

  // Load sample dataset
  const handleLoadSample = (type: DatasetType) => {
    setSelectedCategory(type);
    let sampleContent = SAMPLE_PRODUCTION_CSV;
    let sampleName = 'Baghewala_Production_History_Sep2026.csv';

    if (type === 'CSS_CYCLE') {
      sampleContent = SAMPLE_CSS_CSV;
      sampleName = 'Baghewala_CSS_Steam_Cycle_Registry.csv';
    } else if (type === 'SRP_OPERATING') {
      sampleContent = SAMPLE_SRP_CSV;
      sampleName = 'Baghewala_SRP_Dynamometer_Telemetry_Log.csv';
    }

    parseCSVString(sampleContent, sampleName, sampleContent.length);
  };

  // Reset upload
  const handleReset = () => {
    setParsedData(null);
    setIngestionState('IDLE');
    setIngestionProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Confirm and Ingest into Digital Twin
  const handleConfirmIngestion = () => {
    setIngestionState('PROCESSING');
    setIngestionProgress(15);

    setTimeout(() => setIngestionProgress(45), 300);
    setTimeout(() => setIngestionProgress(80), 700);
    setTimeout(() => {
      setIngestionProgress(100);
      setIngestionState('SUCCESS');
    }, 1100);
  };

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-3 select-none">
      {/* Page Header */}
      <PageHeader
        code="NAV-08"
        title="DATA & SIMULATION WORKSPACE"
        subtitle="Historical Reservoir Telemetry Ingestion · CSS Steam Logs · SRP Dyno Data Replay"
        badge="INGEST-ENGINE"
        statusText={`STATUS: ${ingestionState === 'SUCCESS' ? 'INGESTED & SYNCHRONIZED' : parsedData ? 'PARSED // PENDING INGESTION' : 'STANDBY'}`}
      />

      {/* TOP CONFIGURATION / CATEGORY STRIP */}
      <div className="bg-[#191D21] border border-[#2E343A] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-[10px]">
        {/* Dataset Categories */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[#5F656B] uppercase font-bold">DATASET CATEGORY:</span>
          
          <div className="inline-flex border border-[#2E343A] bg-[#14171A] p-0.5 divide-x divide-[#2E343A]">
            <button
              type="button"
              onClick={() => setSelectedCategory('PHYSICAL_DRIFT_ENGINE')}
              className={`px-2.5 py-1 text-[9.5px] uppercase font-bold transition-none flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'PHYSICAL_DRIFT_ENGINE'
                  ? 'bg-[#C8551D] text-[#E8E6E1]'
                  : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#191D21]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>PHYSICAL DRIFT ENGINE</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('PRODUCTION')}
              className={`px-2.5 py-1 text-[9.5px] uppercase font-bold transition-none flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'PRODUCTION'
                  ? 'bg-[#C8551D] text-[#E8E6E1]'
                  : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#191D21]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>PRODUCTION CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('CSS_CYCLE')}
              className={`px-2.5 py-1 text-[9.5px] uppercase font-bold transition-none flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'CSS_CYCLE'
                  ? 'bg-[#C8551D] text-[#E8E6E1]'
                  : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#191D21]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>CSS CYCLE CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('SRP_OPERATING')}
              className={`px-2.5 py-1 text-[9.5px] uppercase font-bold transition-none flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'SRP_OPERATING'
                  ? 'bg-[#C8551D] text-[#E8E6E1]'
                  : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#191D21]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>SRP DYNO CSV</span>
            </button>
          </div>
        </div>

        {/* Right side of category strip: LastUpdatedBadge or 1-Click Sample Preloader */}
        <div className="flex items-center gap-2">
          <LastUpdatedBadge label="SIM SCADA" pollIntervalSec={3} />

          {selectedCategory !== 'PHYSICAL_DRIFT_ENGINE' && (
            <button
              type="button"
              onClick={() => {
                setParseError(null);
                handleLoadSample(selectedCategory);
              }}
              className="px-2 py-1 bg-[#14171A] hover:bg-[#252B30] border border-[#2E343A] hover:border-[#C9B896] text-[#C9B896] hover:text-[#E8E6E1] uppercase font-bold text-[9px] transition-none flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>PRELOAD {selectedCategory.replace('_', ' ')}</span>
            </button>
          )}
        </div>
      </div>

      {/* SQUARED RED-BORDERED INLINE ERROR CARD IF PARSING FAILS */}
      {parseError && (
        <InlineErrorCard
          title="CSV TELEMETRY SCHEMA ERROR"
          errorCode="ERR_CSV_SCHEMA_VALIDATION_FAILED"
          errorMessage={parseError.message}
          technicalDetails={parseError.technicalDetails}
          onRetry={() => {
            setParseError(null);
            handleLoadSample(selectedCategory);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 1. PHYSICAL DRIFT ENGINE WORKBENCH                                         */}
      {/* ========================================================================= */}
      {selectedCategory === 'PHYSICAL_DRIFT_ENGINE' && (
        <div className="space-y-3 font-mono">
          {/* Top Engine Interactive Dashboard */}
          <div className="bg-[#1F2428] border border-[#2E343A] p-3 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#2E343A] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#C8551D]" />
                <div>
                  <h2 className="text-sm font-bold text-[#E8E6E1] uppercase tracking-wider">
                    THERMODYNAMIC FLEET DRIFT ENGINE // LIVE PHYSICS COUPLING
                  </h2>
                  <p className="text-[10px] text-[#8A8F94]">
                    Real-time lumped-capacitance thermal decay ⇄ ASTM Walther viscosity ⇄ Sucker rod pump mechanics
                  </p>
                </div>
              </div>

              {/* Engine Control Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSimulation}
                  className={`px-3 py-1.5 flex items-center gap-1.5 border text-xs font-bold uppercase transition-none cursor-pointer ${
                    isSimRunning
                      ? 'bg-[#14171A] hover:bg-[#252B30] text-[#E8E6E1] border-[#2E343A]'
                      : 'bg-[#C8551D] hover:bg-[#A94415] text-[#FFFFFF] border-[#C8551D]'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  {isSimRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>PAUSE ENGINE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>RESUME DRIFT</span>
                    </>
                  )}
                </button>

                <div className="flex border border-[#2E343A] bg-[#14171A]">
                  {[1, 5, 15, 30, 60].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setSpeedMultiplier(spd)}
                      className={`px-2 py-1 text-[9.5px] cursor-pointer ${
                        simSpeedMultiplier === spd
                          ? 'bg-[#C8551D] text-white font-bold'
                          : 'text-[#8A8F94] hover:text-[#E8E6E1]'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => advanceDays(1)}
                  className="px-2 py-1.5 bg-[#14171A] hover:bg-[#252B30] border border-[#2E343A] hover:border-[#C8551D] text-[10px] text-[#E8E6E1] cursor-pointer"
                >
                  +1 DAY
                </button>

                <button
                  type="button"
                  onClick={() => advanceDays(5)}
                  className="px-2 py-1.5 bg-[#14171A] hover:bg-[#252B30] border border-[#2E343A] hover:border-[#C8551D] text-[10px] text-[#E8E6E1] cursor-pointer"
                >
                  +5 DAYS
                </button>

                <button
                  type="button"
                  onClick={() => advanceDays(15)}
                  className="px-2 py-1.5 bg-[#14171A] hover:bg-[#252B30] border border-[#2E343A] hover:border-[#C8551D] text-[10px] text-[#C9B896] font-bold cursor-pointer"
                >
                  +15 DAYS
                </button>

                <button
                  type="button"
                  onClick={resetSimulation}
                  className="px-2.5 py-1.5 bg-[#14171A] hover:bg-[#8C2F2F] hover:text-white border border-[#2E343A] text-[10px] text-[#8A8F94] cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET</span>
                </button>
              </div>
            </div>

            {/* Live Aggregate Fleet State Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px]">
              <div className="bg-[#14171A] border border-[#2E343A] p-2.5">
                <span className="text-[#8A8F94] block uppercase">SIMULATED TIME</span>
                <span className="text-xl font-bold text-[#C9B896]">+{totalSimulatedDaysElapsed.toFixed(1)} DAYS</span>
                <span className="text-[8.5px] text-[#8A8F94] block">PROGRESSION CLOCK</span>
              </div>

              <div className="bg-[#14171A] border border-[#2E343A] p-2.5">
                <span className="text-[#8A8F94] block uppercase">FIELD OUTPUT</span>
                <span className="text-xl font-bold text-[#E8E6E1]">{liveTotalBOPD.toLocaleString()} BOPD</span>
                <span className="text-[8.5px] text-[#4E9B68] block">35 WELLS ACTIVE</span>
              </div>

              <div className="bg-[#14171A] border border-[#2E343A] p-2.5">
                <span className="text-[#8A8F94] block uppercase">AVG SANDFACE TEMP</span>
                <span className="text-xl font-bold text-[#C8551D]">{liveAverageTempC}°C</span>
                <span className="text-[8.5px] text-[#8A8F94] block">NATIVE BASE: 68°C</span>
              </div>

              <div className="bg-[#14171A] border border-[#2E343A] p-2.5">
                <span className="text-[#8A8F94] block uppercase">AVG CRUDE VISCOSITY</span>
                <span className="text-xl font-bold text-[#C9B896]">{liveAverageViscosityCP.toLocaleString()} cP</span>
                <span className="text-[8.5px] text-[#8A8F94] block">NON-NEWTONIAN</span>
              </div>

              <div className="bg-[#14171A] border border-[#2E343A] p-2.5">
                <span className="text-[#8A8F94] block uppercase">ROD FLOAT HAZARDS</span>
                <span className={`text-xl font-bold ${liveRodFloatCount > 0 ? 'text-[#DE5959]' : 'text-[#4E9B68]'}`}>
                  {liveRodFloatCount} WELLS
                </span>
                <span className="text-[8.5px] text-[#8A8F94] block">MPRL &lt; 1,600 LBS</span>
              </div>
            </div>
          </div>

          {/* PLAIN-LANGUAGE PHYSICAL EXPLANATION CARDS (EXPLAINING THE PHYSICS WITHOUT CODE) */}
          <div className="bg-[#191D21] border border-[#2E343A] p-3 space-y-2.5">
            <div className="flex items-center gap-2 border-b border-[#2E343A] pb-2">
              <HelpCircle className="w-4 h-4 text-[#C9B896]" />
              <h3 className="text-xs font-bold text-[#E8E6E1] uppercase tracking-wider">
                HOW THE PHYSICAL SIMULATION ENGINE WORKS (IN PLAIN ENGINEERING TERMS)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[10px]">
              {/* Pillar 1 */}
              <div className="bg-[#14171A] border border-[#2E343A] p-3 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#C8551D] font-bold text-xs mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>1. STEAM INJECTION &amp; HEAT BLEED</span>
                  </div>
                  <p className="text-[#8A8F94] leading-relaxed">
                    During Cyclic Steam Stimulation (CSS), 2,000+ tonnes of superheated steam heat the near-wellbore sandpack up to 235°C. Once the well is put on artificial lift, this heat naturally bleeds away into surrounding cold rock layers. The bottomhole temperature steadily decays day after day back toward the native 68°C reservoir baseline.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#252B30] text-[9px] text-[#C9B896]">
                  <strong>Key Behavior:</strong> Sandface cools ~1.5°C per day on active production.
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-[#14171A] border border-[#2E343A] p-3 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#C9B896] font-bold text-xs mb-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>2. THE EXPONENTIAL VISCOSITY TRAP</span>
                  </div>
                  <p className="text-[#8A8F94] leading-relaxed">
                    Baghewala heavy oil (17° API) contains heavy asphaltic bitumen. Its viscosity changes exponentially with temperature: at 230°C right after steaming, it is as fluid as warm vegetable oil (~30 cP). Below 140°C, it thickens rapidly; below 100°C, viscosity surges past 2,000 cP; and below 70°C, it solidifies into stiff roadway asphalt (~14,000+ cP).
                  </p>
                </div>
                <div className="pt-2 border-t border-[#252B30] text-[9px] text-[#C9B896]">
                  <strong>Key Behavior:</strong> A 30°C temperature drop causes a 10x spike in viscous drag.
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-[#14171A] border border-[#2E343A] p-3 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#DE5959] font-bold text-xs mb-1">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>3. DOWNSTROKE ROD FLOATING</span>
                  </div>
                  <p className="text-[#8A8F94] leading-relaxed">
                    A sucker rod pumping unit lifts and drops a steel rod string spanning 1,100 meters downhole. On the downstroke, the heavy rods must sink purely under gravity. When the crude cools into thick tar, upward fluid shear drag holds the rods up. When drag exceeds rod weight, the rods float: downstroke load collapses near 0 lbs, the rod string buckles into compression, and pumping stalls.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#252B30] text-[9px] text-[#DE5959]">
                  <strong>Critical Danger:</strong> Downstroke minimum load &lt; 1,600 lbs triggers critical alarms.
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="bg-[#14171A] border border-[#2E343A] p-3 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#4E9B68] font-bold text-xs mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>4. REAL-TIME DYNOCARD MORPHING</span>
                  </div>
                  <p className="text-[#8A8F94] leading-relaxed">
                    A surface dynamometer card graphs polished rod load versus stroke position. In hot wells, it forms an upright rectangular parallelogram. As viscous drag increases, the bottom downstroke line sags down. During severe rod float, the downstroke load drops flat along the bottom floor (&lt;1,000 lbs), giving operators an immediate visual signature of cooling.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#252B30] text-[9px] text-[#4E9B68]">
                  <strong>Closed-Loop:</strong> The card shape directly reflects live viscosity calculations.
                </div>
              </div>
            </div>
          </div>

          {/* INTERACTIVE SINGLE-WELL PHYSICS WORKBENCH */}
          <div className="bg-[#1F2428] border border-[#2E343A] p-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#E8E6E1] uppercase">
                  INTERACTIVE WELL PHYSICS SANDBOX //
                </span>
                <select
                  value={sandboxWell.id}
                  onChange={(e) => setSandboxWellId(e.target.value)}
                  className="bg-[#14171A] border border-[#2E343A] text-[#E8E6E1] font-bold px-2 py-1 text-xs outline-none cursor-pointer focus:border-[#C8551D]"
                >
                  {simulatedWellsList.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.id} · {w.pad} [{w.cyclePhase.toUpperCase()}] {w.status !== 'normal' ? `(${w.status.toUpperCase()})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Steam Re-Injection Action Button */}
              <button
                type="button"
                onClick={() => reSteamWell(sandboxWell.id)}
                className="px-3 py-1.5 bg-[#C8551D] hover:bg-[#B24816] text-white text-xs font-bold uppercase flex items-center gap-1.5 transition-none cursor-pointer"
                title="Dispatch superheated steam cycle to reheat this well back to 235°C and reset viscosity"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>DISPATCH STEAM RE-INJECTION ({sandboxWell.id})</span>
              </button>
            </div>

            {/* Well Telemetry Grid & Dynamometer Plot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* Left 5 Cols: Live Well Parameters */}
              <div className="lg:col-span-5 bg-[#14171A] border border-[#2E343A] p-3 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#252B30] pb-1.5 mb-2">
                    <span className="text-[#C9B896] font-bold text-xs">{sandboxWell.id} [{sandboxWell.pad}]</span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold border uppercase ${
                      sandboxWell.status === 'fault'
                        ? 'border-[#8C2F2F] text-[#DE5959] bg-[#14171A]'
                        : sandboxWell.status === 'alert'
                        ? 'border-[#C8551D] text-[#D96B27] bg-[#14171A]'
                        : 'border-[#3A5F45] text-[#4E9B68] bg-[#14171A]'
                    }`}>
                      {sandboxWell.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between py-1 border-b border-[#252B30]">
                      <span className="text-[#8A8F94]">DAYS INTO CYCLE:</span>
                      <span className="text-[#E8E6E1] font-bold">{sandboxState?.simulatedDaysSinceInjection.toFixed(1)} DAYS</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#252B30]">
                      <span className="text-[#8A8F94]">SANDFACE TEMP (BHT):</span>
                      <span className="text-[#C8551D] font-bold">{sandboxState?.bottomholeTempC}°C</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#252B30]">
                      <span className="text-[#8A8F94]">CRUDE VISCOSITY (μ):</span>
                      <span className="text-[#C9B896] font-bold">{sandboxState?.crudeViscosityCP.toLocaleString()} cP</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#252B30]">
                      <span className="text-[#8A8F94]">PEAK LOAD (PPRL):</span>
                      <span className="text-[#E8E6E1] font-bold">{sandboxState?.polishedRodLoadLbs.toLocaleString()} lbs</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#252B30]">
                      <span className="text-[#8A8F94]">MIN LOAD (MPRL / DOWN):</span>
                      <span className={`font-bold ${sandboxState?.minRodLoadLbs < 1600 ? 'text-[#DE5959]' : 'text-[#4E9B68]'}`}>
                        {sandboxState?.minRodLoadLbs.toLocaleString()} lbs {sandboxState?.minRodLoadLbs < 1600 ? '⚠ ROD FLOAT' : '✓ OK'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#252B30]">
                      <span className="text-[#8A8F94]">PUMP FILLAGE:</span>
                      <span className="text-[#E8E6E1] font-bold">{sandboxState?.pumpFillagePct}%</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-[#8A8F94]">OIL PRODUCTION:</span>
                      <span className="text-[#4E9B68] font-bold">{sandboxState?.oilRateBOPD} BOPD</span>
                    </div>
                  </div>
                </div>

                {onNavigateToWell && (
                  <button
                    type="button"
                    onClick={() => onNavigateToWell(sandboxWell.id)}
                    className="w-full py-1.5 bg-[#191D21] hover:bg-[#252B30] text-[#E8E6E1] border border-[#2E343A] hover:border-[#C8551D] text-[10px] font-bold uppercase transition-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>OPEN {sandboxWell.id} DIGITAL TWIN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right 7 Cols: Live Synthetic Dynamometer Card Responding Directly to Viscosity */}
              <div className="lg:col-span-7 bg-[#14171A] border border-[#2E343A] p-3 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between border-b border-[#252B30] pb-1.5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#C8551D]" />
                    <span className="text-[10px] font-bold text-[#E8E6E1] uppercase">
                      LIVE DYNAMOMETER CARD // SHAPE RESPONDING TO {sandboxState?.crudeViscosityCP} cP
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.5 text-[8.5px] font-bold border uppercase ${
                    sandboxState?.rodFloatingRisk
                      ? 'border-[#8C2F2F] text-[#DE5959] bg-[#14171A]'
                      : 'border-[#3A5F45] text-[#4E9B68] bg-[#14171A]'
                  }`}>
                    {sandboxState?.cardDiagnosis}
                  </span>
                </div>

                {/* SVG Dynocard Plot */}
                <div className="w-full relative py-1">
                  <svg viewBox="0 0 500 200" className="w-full h-44 block">
                    {/* Background Grid */}
                    {[0, 50, 100, 150].map((y) => (
                      <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="#252B30" strokeWidth="1" strokeDasharray="2,2" />
                    ))}
                    {[50, 136, 222, 308, 394, 480].map((x) => (
                      <line key={x} x1={x} y1="0" x2={x} y2="170" stroke="#252B30" strokeWidth="1" strokeDasharray="2,2" />
                    ))}

                    {/* Critical Minimum Load Threshold (1,600 lbs line) */}
                    <line x1="50" y1="152" x2="480" y2="152" stroke="#8C2F2F" strokeWidth="1.5" strokeDasharray="4,3" />
                    <text x="55" y="148" fill="#DE5959" fontSize="8" fontFamily="monospace">ROD FLOAT CRITICAL LIMIT (1,600 lb)</text>

                    {/* Axis Labels */}
                    <text x="5" y="20" fill="#8A8F94" fontSize="8" fontFamily="monospace">30k lb</text>
                    <text x="5" y="85" fill="#8A8F94" fontSize="8" fontFamily="monospace">15k lb</text>
                    <text x="5" y="165" fill="#8A8F94" fontSize="8" fontFamily="monospace">0 lb</text>
                    <text x="50" y="185" fill="#8A8F94" fontSize="8" fontFamily="monospace">0"</text>
                    <text x="250" y="185" fill="#8A8F94" fontSize="8" fontFamily="monospace">84" (MID)</text>
                    <text x="460" y="185" fill="#8A8F94" fontSize="8" fontFamily="monospace">168"</text>

                    {/* Dynocard Polygon */}
                    {sandboxState?.dynoCardPoints && sandboxState.dynoCardPoints.length > 0 && (
                      <path
                        d={sandboxState.dynoCardPoints.map((pt, i) => {
                          const x = 50 + (pt.pos / 168) * (480 - 50);
                          const y = 170 - (Math.max(0, Math.min(30000, pt.load)) / 30000) * 160;
                          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                        }).join(' ') + ' Z'}
                        fill="rgba(200, 85, 29, 0.08)"
                        stroke={sandboxState.rodFloatingRisk ? '#DE5959' : '#C8551D'}
                        strokeWidth="2.5"
                      />
                    )}
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[9px] text-[#8A8F94] border-t border-[#252B30] pt-1">
                  <span>STROKE: 168 INCHES · 4.5 SPM</span>
                  <span>{sandboxState?.rodFloatingRisk ? '⚠ CRITICAL DOWNSTROKE DEFICIT' : '✓ HEALTHY CYCLE BALANCE'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FLEET COOLDOWN PROGRESSION MATRIX */}
          <div className="bg-[#1F2428] border border-[#2E343A] p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-[#2E343A] pb-1.5 text-xs">
              <span className="font-bold text-[#E8E6E1] uppercase">
                FLEET THERMAL DRIFT MATRIX (ALL 35 WELLS)
              </span>
              <span className="text-[10px] text-[#8A8F94]">
                SHOWING REAL-TIME TEMPERATURE, VISCOSITY &amp; DOWNSTROKE ROD RISK
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 text-[9px]">
              {simulatedWellsList.map((well) => {
                const isSelected = well.id === sandboxWell.id;
                return (
                  <button
                    key={well.id}
                    type="button"
                    onClick={() => setSandboxWellId(well.id)}
                    className={`p-1.5 border text-left flex flex-col justify-between transition-none cursor-pointer ${
                      isSelected
                        ? 'border-[#C8551D] bg-[#272E34]'
                        : well.status === 'fault'
                        ? 'border-[#8C2F2F] bg-[#14171A]'
                        : well.status === 'alert'
                        ? 'border-[#C8551D]/60 bg-[#14171A]'
                        : 'border-[#2E343A] bg-[#14171A] hover:border-[#8A8F94]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#E8E6E1]">{well.id}</span>
                      <span className={`text-[7.5px] px-1 py-0.2 border ${
                        well.status === 'fault'
                          ? 'border-[#8C2F2F] text-[#DE5959]'
                          : well.status === 'alert'
                          ? 'border-[#C8551D] text-[#D96B27]'
                          : 'border-[#3A5F45] text-[#4E9B68]'
                      }`}>
                        {well.status === 'fault' ? 'FLT' : well.status === 'alert' ? 'ALT' : 'OK'}
                      </span>
                    </div>

                    <div className="text-[#8A8F94] text-[8px] my-0.5">
                      {well.bottomholeTempC}°C · {well.crudeViscosityCP} cP
                    </div>

                    <div className="flex items-center justify-between font-mono text-[8px]">
                      <span className="text-[#C9B896]">{well.oilRateBOPD} bpd</span>
                      {well.rodFloatingRisk && <span className="text-[#DE5959] font-bold">FLOAT!</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CSV HISTORICAL INGESTION (RENDERED IF OTHER CATEGORY SELECTED)          */}
      {/* ========================================================================= */}
      {selectedCategory !== 'PHYSICAL_DRIFT_ENGINE' && (
        <div className="space-y-3 font-mono">
          {/* SQUARED DRAG-AND-DROP UPLOAD ZONE */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full bg-[#191D21] border-2 border-dashed transition-none cursor-pointer p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 font-mono ${
              isDragging
                ? 'border-[#C8551D] bg-[#1E2328]'
                : 'border-[#2E343A] hover:border-[#C8551D] hover:bg-[#1C2024]'
            }`}
            style={{ borderRadius: 0 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="p-3 bg-[#14171A] border border-[#2E343A] text-[#C8551D]">
              <Upload className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-[#E8E6E1] uppercase tracking-wider">
                DRAG &amp; DROP HISTORICAL CSV FILE HERE, OR <span className="text-[#C8551D] underline">BROWSE DISK</span>
              </div>
              <p className="text-[10px] text-[#8A8F94]">
                ACCEPTED FORMATS: UTF-8 COMMA-SEPARATED VALUES (.CSV) · MAX FILE SIZE: 25 MB
              </p>
            </div>
          </div>

        <div className="flex items-center flex-wrap justify-center gap-2 pt-1 text-[9px] text-[#5F656B]">
          <span className="px-2 py-0.5 bg-[#14171A] border border-[#2E343A]">
            PRODUCTION: Date, BOPD, BLPD, Water Cut %, Pressures
          </span>
          <span className="px-2 py-0.5 bg-[#14171A] border border-[#2E343A]">
            CSS: Cycle #, Steam Tonnes, Temp °C, Soak Days
          </span>
          <span className="px-2 py-0.5 bg-[#14171A] border border-[#2E343A]">
            SRP: Timestamp, SPM, PPRL, MPRL, Drag, Fillage %
          </span>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* PARSED DATA PREVIEW TABLE & INGESTION CONFIRMATION PANEL                   */}
      {/* ========================================================================= */}
      {parsedData && (
        <div className="bg-[#191D21] border border-[#2E343A] p-3 space-y-3 font-mono">
          {/* Header Summary Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3A5F45]" />
              <div>
                <span className="font-bold text-[#E8E6E1] uppercase tracking-wider block">
                  PARSED CSV: {parsedData.fileName}
                </span>
                <span className="text-[9px] text-[#8A8F94]">
                  {parsedData.rows.length} VALID RECORDS · {parsedData.headers.length} COLUMNS · {(parsedData.fileSizeBytes / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            {/* Target Asset Assignment Dropdown & Actions */}
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-[#14171A] border border-[#2E343A] px-2 py-1">
                <span className="text-[#5F656B] uppercase text-[9px]">TARGET ASSET TWIN:</span>
                <select
                  value={targetWellOverride}
                  onChange={(e) => setTargetWellOverride(e.target.value)}
                  className="bg-transparent text-[#E8E6E1] text-[9.5px] font-bold focus:outline-none"
                >
                  {BAGHEWALA_WELLS.map((w) => (
                    <option key={w.id} value={w.id} className="bg-[#1F2428]">
                      {w.id} - Pad {w.pad} ({w.oilRateBOPD} BOPD)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 bg-[#14171A] hover:bg-[#252B30] text-[#8A8F94] hover:text-[#E8E6E1] border border-[#2E343A] text-[9.5px] uppercase font-bold transition-none flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-[#8C2F2F]" />
                <span>DISCARD</span>
              </button>
            </div>
          </div>

          {/* Parsed Data Preview Squared Table */}
          <div className="bg-[#14171A] border border-[#2E343A] overflow-x-auto max-h-72 divide-y divide-[#252B30]">
            <table className="w-full border-collapse text-[9.5px] text-left">
              <thead className="bg-[#191D21] text-[#8A8F94] sticky top-0 uppercase font-bold tracking-wider z-10 border-b border-[#2E343A]">
                <tr>
                  <th className="p-2 border-r border-[#2E343A] text-center w-12">#</th>
                  {parsedData.headers.map((h) => (
                    <th key={h} className="p-2 border-r border-[#2E343A] whitespace-nowrap">
                      {h.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252B30] text-[#E8E6E1]">
                {parsedData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1C2024] transition-none">
                    <td className="p-2 border-r border-[#2E343A] text-center font-bold text-[#5F656B] bg-[#191D21]">
                      {idx + 1}
                    </td>
                    {parsedData.headers.map((h) => (
                      <td key={h} className="p-2 border-r border-[#2E343A] whitespace-nowrap">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ingestion Progress or Execution Bar */}
          {ingestionState === 'PROCESSING' && (
            <div className="bg-[#14171A] border border-[#2E343A] p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#C8551D] font-bold uppercase flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 animate-spin" />
                  INGESTING &amp; SOLVING COUPLED SUBSURFACE TWIN EQUATIONS...
                </span>
                <span className="text-[#E8E6E1] font-bold">{ingestionProgress}%</span>
              </div>
              <div className="w-full bg-[#191D21] h-2 border border-[#2E343A] overflow-hidden">
                <div
                  style={{ width: `${ingestionProgress}%` }}
                  className="bg-[#C8551D] h-full transition-all duration-100 ease-linear"
                />
              </div>
            </div>
          )}

          {/* Ingestion Success Confirmation Receipt */}
          {ingestionState === 'SUCCESS' && (
            <div className="bg-[#14171A] border border-[#3A5F45] border-l-4 border-l-[#3A5F45] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#3A5F45]" />
                  <div>
                    <span className="text-xs font-bold text-[#E8E6E1] uppercase block">
                      DATASET SUCCESSFULLY INGESTED INTO {targetWellOverride} TWIN
                    </span>
                    <span className="text-[9px] text-[#8A8F94]">
                      {parsedData.rows.length} records processed · Dynamometer curve bounds re-indexed · Thermal decay curve calibrated
                    </span>
                  </div>
                </div>

                {onNavigateToWell && (
                  <button
                    type="button"
                    onClick={() => onNavigateToWell(targetWellOverride)}
                    className="px-3 py-1.5 bg-[#3A5F45] hover:bg-[#4E7D5C] text-[#FFFFFF] text-[10px] uppercase font-bold flex items-center gap-1.5 transition-none shadow-sm"
                  >
                    <span>OPEN {targetWellOverride} DIGITAL TWIN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Row: CONFIRMATION BUTTON TO INGEST INTO THE TWIN */}
          {ingestionState !== 'SUCCESS' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#2E343A]">
              <div className="text-[9px] text-[#5F656B]">
                SCHEMA INTEGRITY: <strong className="text-[#3A5F45]">OISD-173 VERIFIED</strong> · COMPATIBLE WITH 4D THERMAL SOLVER
              </div>

              <button
                type="button"
                disabled={ingestionState === 'PROCESSING'}
                onClick={handleConfirmIngestion}
                className={`px-4 py-2 text-xs font-bold uppercase transition-none flex items-center justify-center gap-2 shadow-sm font-mono ${
                  ingestionState === 'PROCESSING'
                    ? 'bg-[#2E343A] text-[#8A8F94] cursor-not-allowed'
                    : 'bg-[#3A5F45] hover:bg-[#4E7D5C] text-[#FFFFFF]'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>CONFIRM INGESTION INTO DIGITAL TWIN</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Model Confidence by Well Heatmap Grid */}
      <ModelConfidenceHeatmap onNavigateToWell={onNavigateToWell} />

      {/* INGESTION & DATA COMPLIANCE GUIDE FOOTER */}
      <div className="bg-[#191D21] border border-[#2E343A] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9px] font-mono text-[#8A8F94]">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#C9B896]" />
          <span>SUPPORTED SOURCES: ONGC SCADA HISTORIAN, ECLIPSE / CMG STARS REPOSITORIES</span>
          <span className="text-[#5F656B]">·</span>
          <span>CALIBRATION INTERVAL: 15-MINUTE OR DAILY SYNCHRONIZATION</span>
        </div>

        <span className="text-[#5F656B]">AUTO-CHECKSUM CRC-32 ENABLED</span>
      </div>
    </div>
  );
};

export default DataSimulationPage;
