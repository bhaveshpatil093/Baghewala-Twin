import React, { useState, useEffect } from 'react';
import { WellData } from '@/src/data/wellsData';
import { Activity, Gauge, Zap, Cpu, Sliders, Play, Square, AlertOctagon, RotateCcw } from 'lucide-react';
import LastUpdatedBadge from '@/src/components/shared/LastUpdatedBadge';

interface SrpLiveControlPanelProps {
  well: WellData;
  onUpdateVfdFrequency?: (freq: number) => void;
  onUpdateSPM?: (spm: number) => void;
}

export const SrpLiveControlPanel: React.FC<SrpLiveControlPanelProps> = ({
  well,
  onUpdateVfdFrequency,
  onUpdateSPM,
}) => {
  // Live instrument state with subtle sensor jitter for realism
  const [jitter, setJitter] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(well.strokeRateSPM > 0);
  const [manualTrim, setManualTrim] = useState<number>(0);
  const [isPacketFlashing, setIsPacketFlashing] = useState<boolean>(false);

  // Periodic subtle sensor drift (every 2.5s) to mimic live 4-20mA transducer polling
  const triggerScadaPulse = () => {
    setIsPacketFlashing(true);
    setJitter((Math.random() - 0.5) * 0.12);
    setTimeout(() => {
      setIsPacketFlashing(false);
    }, 400);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      triggerScadaPulse();
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    triggerScadaPulse();
  };

  // Physical specifications of Baghewala SRP units (Lufkin C-912-365-168)
  const strokeLengthIn = 168; // 168 inches polished rod stroke
  
  // Calculate live values
  const baseSPM = isRunning ? well.strokeRateSPM : 0;
  const liveSPM = isRunning ? Math.max(0, Number((baseSPM + manualTrim * 0.1 + jitter).toFixed(1))) : 0;
  
  // VFD Frequency: 50 Hz grid base, geared for 168" stroke (ratio ~ 8.4 Hz/SPM)
  const baseVfdHz = isRunning ? Math.min(50, Math.max(15, Number((liveSPM * 8.35).toFixed(1)))) : 0;
  const liveVfdHz = isRunning ? Number((baseVfdHz + (jitter * 2)).toFixed(1)) : 0;

  // Pump fillage percentage
  const liveFillage = well.pumpFillagePct;

  // Motor load percentage (75 HP / 55 kW motor rating)
  const baseMotorLoad = isRunning 
    ? Math.min(98, Math.max(20, Math.round(52 + (liveSPM * 5.2) + (well.crudeViscosityCP > 1000 ? 16 : 0))))
    : 0;
  const liveMotorLoad = baseMotorLoad;

  // Physical status thresholds
  const getFillageStatus = (pct: number) => {
    if (pct < 70) return { label: 'FLUID POUND DETECTED', color: 'text-[#8C2F2F]', led: 'bg-[#8C2F2F]' };
    if (pct < 85) return { label: 'PARTIAL INFLOW SLUG', color: 'text-[#C8551D]', led: 'bg-[#C8551D]' };
    return { label: 'FULL BARREL DRAW', color: 'text-[#3A5F45]', led: 'bg-[#3A5F45]' };
  };

  const fillageStatus = getFillageStatus(liveFillage);

  return (
    <div className="bg-[#191D21] border border-[#2E343A] p-3 flex flex-col space-y-3 select-none">
      {/* Control-Room Rack Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#C8551D]" />
          <div>
            <span className="font-bold text-[#E8E6E1] uppercase tracking-wider block">
              SURFACE ARTIFICIAL LIFT // LIVE SRP CONSOLE [C-912-365-168]
            </span>
            <span className="text-[9px] text-[#8A8F94]">
              ABB ACS880 VFD DRIVE · MODBUS RTU RS-485 // LOOP RATE: 100ms
            </span>
          </div>
        </div>

        {/* Operating State Flag & SCADA Polling Indicator */}
        <div className="flex items-center gap-3">
          <LastUpdatedBadge label="VFD" pollIntervalSec={3} onRefresh={handleManualRefresh} />

          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#14171A] border border-[#2E343A]">
            <span className={`w-2 h-2 ${isRunning ? (isPacketFlashing ? 'bg-[#4E9B68]' : 'bg-[#4E9B68]') : 'bg-[#DE5959]'}`} />
            <span className={`font-bold uppercase text-[9px] ${isRunning ? 'text-[#4E9B68]' : 'text-[#DE5959]'}`}>
              {isRunning ? 'DRIVE ENERGIZED (RUN)' : 'PUMP SHUT-IN (STOP)'}
            </span>
          </div>
          <span className="text-[#8A8F94] text-[9px]">NODE: BGW-VFD-09</span>
        </div>
      </div>

      {/* 5 SQUARED PHYSICAL INSTRUMENT READOUT TILES */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 transition-colors duration-100 ease-linear ${
        isPacketFlashing ? 'ring-1 ring-[#4E9B68]/40' : ''
      }`}>
        {/* ========================================================================= */}
        {/* TILE 1: STROKE LENGTH                                                     */}
        {/* ========================================================================= */}
        <div className="bg-[#14171A] border border-[#2E343A] p-3 flex flex-col justify-between space-y-2 relative">
          {/* Instrument Tag */}
          <div className="flex items-center justify-between font-mono text-[9px] border-b border-[#252B30] pb-1">
            <span className="text-[#8A8F94] font-bold">CH-01 // PR-DISP</span>
            <span className="text-[#5F656B]">BEAM POS 3</span>
          </div>

          <span className="text-[9px] font-mono text-[#5F656B] uppercase block">
            STROKE LENGTH
          </span>

          {/* Large Monospace Value with Unit Beside */}
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-mono text-3xl font-bold text-[#E8E6E1] tracking-tight">
              {strokeLengthIn}
            </span>
            <span className="font-mono text-xs font-semibold text-[#8A8F94] uppercase">
              in
            </span>
          </div>

          {/* Physical Gauge Reference Bar */}
          <div className="space-y-1 pt-1 border-t border-[#252B30]">
            <div className="w-full bg-[#1F2428] h-1.5 border border-[#2E343A]">
              <div
                style={{ width: `${(strokeLengthIn / 192) * 100}%` }}
                className="h-full bg-[#C9B896]"
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-[#5F656B]">
              <span>FIXED CRANK PIN</span>
              <span>4.27 m</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TILE 2: STROKES PER MINUTE (SPM)                                          */}
        {/* ========================================================================= */}
        <div className={`bg-[#14171A] border p-3 flex flex-col justify-between space-y-2 relative ${
          liveSPM > 6.0 ? 'border-[#C8551D]' : 'border-[#2E343A]'
        }`}>
          {/* Instrument Tag */}
          <div className="flex items-center justify-between font-mono text-[9px] border-b border-[#252B30] pb-1">
            <span className="text-[#8A8F94] font-bold">CH-02 // TACHOMETER</span>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 ${isRunning ? 'bg-[#3A5F45]' : 'bg-[#5F656B]'}`} />
              <span className="text-[#5F656B] text-[8px]">HALL EFFECT</span>
            </div>
          </div>

          <span className="text-[9px] font-mono text-[#5F656B] uppercase block">
            STROKES PER MINUTE
          </span>

          {/* Large Monospace Value with Unit Beside */}
          <div className="flex items-baseline gap-1.5 my-1">
            <span className={`font-mono text-3xl font-bold tracking-tight ${
              well.status === 'fault' ? 'text-[#8C2F2F]' : 'text-[#E8E6E1]'
            }`}>
              {liveSPM.toFixed(1)}
            </span>
            <span className="font-mono text-xs font-semibold text-[#8A8F94] uppercase">
              spm
            </span>
          </div>

          {/* Physical Gauge Reference Bar */}
          <div className="space-y-1 pt-1 border-t border-[#252B30]">
            <div className="w-full bg-[#1F2428] h-1.5 border border-[#2E343A]">
              <div
                style={{ width: `${Math.min(100, (liveSPM / 10) * 100)}%` }}
                className={`h-full ${liveSPM > 6.0 ? 'bg-[#C8551D]' : 'bg-[#3A5F45]'}`}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-[#5F656B]">
              <span>RATED: 1.5–7.0</span>
              <span className="text-[#C9B896]">{isRunning ? 'SPEED LOCKED' : 'OFF'}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TILE 3: VFD FREQUENCY                                                     */}
        {/* ========================================================================= */}
        <div className="bg-[#14171A] border border-[#2E343A] p-3 flex flex-col justify-between space-y-2 relative">
          {/* Instrument Tag */}
          <div className="flex items-center justify-between font-mono text-[9px] border-b border-[#252B30] pb-1">
            <span className="text-[#8A8F94] font-bold">CH-03 // INVERTER</span>
            <span className="text-[#5F656B]">IGBT PWM</span>
          </div>

          <span className="text-[9px] font-mono text-[#5F656B] uppercase block">
            VFD FREQUENCY
          </span>

          {/* Large Monospace Value with Unit Beside */}
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="font-mono text-3xl font-bold text-[#E8E6E1] tracking-tight">
              {liveVfdHz.toFixed(1)}
            </span>
            <span className="font-mono text-xs font-semibold text-[#8A8F94] uppercase">
              Hz
            </span>
          </div>

          {/* Physical Gauge Reference Bar */}
          <div className="space-y-1 pt-1 border-t border-[#252B30]">
            <div className="w-full bg-[#1F2428] h-1.5 border border-[#2E343A]">
              <div
                style={{ width: `${(liveVfdHz / 50) * 100}%` }}
                className="h-full bg-[#C8551D]"
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-[#5F656B]">
              <span>50 Hz GRID</span>
              <span className="text-[#8A8F94]">{((liveVfdHz / 50) * 100).toFixed(0)}% DRIVE</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TILE 4: PUMP FILLAGE PERCENTAGE                                           */}
        {/* ========================================================================= */}
        <div className={`bg-[#14171A] border p-3 flex flex-col justify-between space-y-2 relative ${
          liveFillage < 70 ? 'border-[#8C2F2F]' : liveFillage < 85 ? 'border-[#C8551D]' : 'border-[#2E343A]'
        }`}>
          {/* Instrument Tag */}
          <div className="flex items-center justify-between font-mono text-[9px] border-b border-[#252B30] pb-1">
            <span className="text-[#8A8F94] font-bold">CH-04 // DYNACARD</span>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 ${fillageStatus.led}`} />
              <span className="text-[#5F656B] text-[8px]">INTEGRATION</span>
            </div>
          </div>

          <span className="text-[9px] font-mono text-[#5F656B] uppercase block">
            PUMP FILLAGE
          </span>

          {/* Large Monospace Value with Unit Beside */}
          <div className="flex items-baseline gap-1.5 my-1">
            <span className={`font-mono text-3xl font-bold tracking-tight ${
              liveFillage < 70 ? 'text-[#8C2F2F]' : liveFillage < 85 ? 'text-[#C8551D]' : 'text-[#3A5F45]'
            }`}>
              {liveFillage}
            </span>
            <span className="font-mono text-xs font-semibold text-[#8A8F94] uppercase">
              %
            </span>
          </div>

          {/* Physical Gauge Reference Bar */}
          <div className="space-y-1 pt-1 border-t border-[#252B30]">
            <div className="w-full bg-[#1F2428] h-1.5 border border-[#2E343A]">
              <div
                style={{ width: `${liveFillage}%` }}
                className={`h-full ${
                  liveFillage < 70 ? 'bg-[#8C2F2F]' : liveFillage < 85 ? 'bg-[#C8551D]' : 'bg-[#3A5F45]'
                }`}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono">
              <span className={fillageStatus.color}>{fillageStatus.label}</span>
              <span className="text-[#5F656B]">BRL: 84%</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TILE 5: MOTOR LOAD                                                        */}
        {/* ========================================================================= */}
        <div className={`bg-[#14171A] border p-3 flex flex-col justify-between space-y-2 relative ${
          liveMotorLoad > 85 ? 'border-[#C8551D]' : 'border-[#2E343A]'
        }`}>
          {/* Instrument Tag */}
          <div className="flex items-center justify-between font-mono text-[9px] border-b border-[#252B30] pb-1">
            <span className="text-[#8A8F94] font-bold">CH-05 // CT CURRENT</span>
            <span className="text-[#5F656B]">75 HP 415V</span>
          </div>

          <span className="text-[9px] font-mono text-[#5F656B] uppercase block">
            MOTOR LOAD
          </span>

          {/* Large Monospace Value with Unit Beside */}
          <div className="flex items-baseline gap-1.5 my-1">
            <span className={`font-mono text-3xl font-bold tracking-tight ${
              liveMotorLoad > 85 ? 'text-[#C8551D]' : 'text-[#E8E6E1]'
            }`}>
              {liveMotorLoad}
            </span>
            <span className="font-mono text-xs font-semibold text-[#8A8F94] uppercase">
              %
            </span>
          </div>

          {/* Physical Gauge Reference Bar */}
          <div className="space-y-1 pt-1 border-t border-[#252B30]">
            <div className="w-full bg-[#1F2428] h-1.5 border border-[#2E343A]">
              <div
                style={{ width: `${liveMotorLoad}%` }}
                className={`h-full ${liveMotorLoad > 85 ? 'bg-[#C8551D]' : 'bg-[#C9B896]'}`}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-[#5F656B]">
              <span>{(liveMotorLoad * 0.55).toFixed(1)} kW</span>
              <span>THERMAL TRIP: 95%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Industrial Sub-Panel: Speed Trimmer & Physical Hardware Status */}
      <div className="bg-[#14171A] border border-[#2E343A] p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-3 text-[#8A8F94]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#3A5F45]" />
            <span>ENCODER: REVERSE ROTATION LOCK ON</span>
          </div>
          <span className="text-[#5F656B]">|</span>
          <span>
            BRAKE: <strong className="text-[#E8E6E1]">PNEUMATIC DISC ENGAGED ON SHUTDOWN</strong>
          </span>
        </div>

        {/* Speed Adjustment Trimmer Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#5F656B] uppercase">SPM TRIM:</span>
          <button
            type="button"
            onClick={() => setManualTrim((prev) => Math.max(-5, prev - 1))}
            className="px-2 py-0.5 bg-[#1F2428] hover:bg-[#272E34] text-[#E8E6E1] border border-[#2E343A] font-bold text-[10px]"
          >
            -0.1
          </button>
          <span className="px-1.5 text-[#C9B896] font-bold">
            {manualTrim === 0 ? '0.0' : manualTrim > 0 ? `+${(manualTrim * 0.1).toFixed(1)}` : (manualTrim * 0.1).toFixed(1)}
          </span>
          <button
            type="button"
            onClick={() => setManualTrim((prev) => Math.min(5, prev + 1))}
            className="px-2 py-0.5 bg-[#1F2428] hover:bg-[#272E34] text-[#E8E6E1] border border-[#2E343A] font-bold text-[10px]"
          >
            +0.1
          </button>
          {manualTrim !== 0 && (
            <button
              type="button"
              onClick={() => setManualTrim(0)}
              className="text-[#5F656B] hover:text-[#8A8F94] p-0.5"
              title="Reset trim"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SrpLiveControlPanel;
