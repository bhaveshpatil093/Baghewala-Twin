import React, { useState } from 'react';
import { useSimulation } from '@/src/context/SimulationContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Flame, 
  Activity, 
  Thermometer, 
  ChevronRight,
  Droplets,
  AlertTriangle,
  AlertOctagon,
  Gauge
} from 'lucide-react';

interface SimulationControlStripProps {
  onNavigateToSimPage?: () => void;
}

export const SimulationControlStrip: React.FC<SimulationControlStripProps> = ({
  onNavigateToSimPage
}) => {
  const {
    isSimRunning,
    simSpeedMultiplier,
    totalSimulatedDaysElapsed,
    toggleSimulation,
    setSpeedMultiplier,
    advanceDays,
    resetSimulation,
    liveTotalBOPD,
    liveAverageTempC,
    liveAverageViscosityCP,
    liveFaultCount,
    liveAlertCount,
    liveRodFloatCount
  } = useSimulation();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  return (
    <aside 
      aria-label="Thermodynamic Simulation Engine Control Bar"
      className="bg-[#191D21] border-b border-[#2E343A] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono select-none"
    >
      {/* Left: Engine Running Indicator & Simulated Calendar Day */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span 
            className={`w-2 h-2 shrink-0 ${isSimRunning ? 'bg-[#4E9B68]' : 'bg-[#D96B27]'}`} 
            style={{ borderRadius: 0 }} 
          />
          <span className="font-bold text-[#E8E6E1] text-[11px] tracking-wide uppercase">
            THERMAL ENGINE
          </span>
          <span className={`text-[9px] px-1 py-0.2 border ${isSimRunning ? 'border-[#3A5F45] text-[#4E9B68] bg-[#14171A]' : 'border-[#C8551D] text-[#D96B27] bg-[#14171A]'}`}>
            {isSimRunning ? 'LIVE DRIFT' : 'PAUSED'}
          </span>
        </div>

        <div className="w-[1px] h-3.5 bg-[#2E343A]" />

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-[#8A8F94]">TIME ELAPSED:</span>
          <span className="text-[#C9B896] font-bold">
            +{totalSimulatedDaysElapsed.toFixed(1)} DAYS
          </span>
        </div>
      </div>

      {/* Center: Live Thermodynamic Fleet Drift Indicators */}
      <div className="hidden lg:flex items-center gap-4 text-[10.5px]">
        <div className="flex items-center gap-1.5" title="Field Aggregate Oil Rate from active wells">
          <Droplets className="w-3.5 h-3.5 text-[#C8551D]" />
          <span className="text-[#8A8F94]">OUTPUT:</span>
          <span className="font-bold text-[#E8E6E1]">{liveTotalBOPD.toLocaleString()} BOPD</span>
        </div>

        <div className="w-[1px] h-3 bg-[#2E343A]" />

        <div className="flex items-center gap-1.5" title="Average Bottomhole Sandface Temperature">
          <Thermometer className="w-3.5 h-3.5 text-[#C9B896]" />
          <span className="text-[#8A8F94]">AVG BHT:</span>
          <span className="font-bold text-[#E8E6E1]">{liveAverageTempC}°C</span>
        </div>

        <div className="w-[1px] h-3 bg-[#2E343A]" />

        <div className="flex items-center gap-1.5" title="Average Crude Viscosity at Sandface">
          <Activity className="w-3.5 h-3.5 text-[#C8551D]" />
          <span className="text-[#8A8F94]">AVG VISC:</span>
          <span className="font-bold text-[#E8E6E1]">{liveAverageViscosityCP.toLocaleString()} cP</span>
        </div>

        <div className="w-[1px] h-3 bg-[#2E343A]" />

        {/* Rod float count */}
        <div className="flex items-center gap-1.5">
          {liveRodFloatCount > 0 ? (
            <span className="flex items-center gap-1 text-[#DE5959] font-bold bg-[#14171A] px-1.5 py-0.5 border border-[#8C2F2F]">
              <AlertOctagon className="w-3 h-3 text-[#DE5959]" />
              <span>{liveRodFloatCount} ROD FLOATING</span>
            </span>
          ) : (
            <span className="text-[#4E9B68] text-[9.5px] font-bold">
              0 ROD FLOAT HAZARDS
            </span>
          )}
        </div>
      </div>

      {/* Right: Engine Playback & Fast-Forward Controls */}
      <div className="flex items-center gap-1.5">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={toggleSimulation}
          className={`px-2 py-1 flex items-center gap-1 border text-[10px] font-bold uppercase transition-none cursor-pointer ${
            isSimRunning 
              ? 'bg-[#14171A] hover:bg-[#252B30] text-[#E8E6E1] border-[#2E343A]' 
              : 'bg-[#C8551D] hover:bg-[#A94415] text-[#FFFFFF] border-[#C8551D]'
          }`}
          style={{ borderRadius: 0 }}
          title={isSimRunning ? 'Pause physical thermodynamic simulation' : 'Start physical thermodynamic simulation'}
        >
          {isSimRunning ? (
            <>
              <Pause className="w-3 h-3 text-[#E8E6E1]" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-white fill-white" />
              <span>RUN DRIFT</span>
            </>
          )}
        </button>

        {/* Speed Multiplier Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSpeedMenu(prev => !prev)}
            className="px-2 py-1 bg-[#14171A] hover:bg-[#1F2428] border border-[#2E343A] hover:border-[#C8551D] text-[10px] text-[#E8E6E1] flex items-center gap-1 cursor-pointer"
            style={{ borderRadius: 0 }}
            title="Adjust physical simulation time multiplier"
          >
            <FastForward className="w-3 h-3 text-[#C8551D]" />
            <span>{simSpeedMultiplier}x SPD</span>
          </button>

          {showSpeedMenu && (
            <div 
              className="absolute right-0 top-full mt-1 w-32 bg-[#191D21] border border-[#2E343A] shadow-xl p-1 z-50 flex flex-col space-y-0.5"
              style={{ borderRadius: 0 }}
            >
              {[1, 5, 15, 30, 60].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    setSpeedMultiplier(spd);
                    setShowSpeedMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1 text-[9.5px] flex items-center justify-between cursor-pointer ${
                    simSpeedMultiplier === spd 
                      ? 'bg-[#C8551D] text-white font-bold' 
                      : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#14171A]'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  <span>{spd}x SPEED</span>
                  <span className="text-[8px] text-[#E8E6E1]/70">{spd} d/min</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Advance +5 Days */}
        <button
          type="button"
          onClick={() => advanceDays(5)}
          className="px-2 py-1 bg-[#14171A] hover:bg-[#1F2428] border border-[#2E343A] hover:border-[#C8551D] text-[10px] text-[#8A8F94] hover:text-[#E8E6E1] transition-none cursor-pointer"
          style={{ borderRadius: 0 }}
          title="Instantly advance simulation by +5 days to observe cooling"
        >
          +5 DAYS
        </button>

        {/* Quick Advance +15 Days */}
        <button
          type="button"
          onClick={() => advanceDays(15)}
          className="px-2 py-1 bg-[#14171A] hover:bg-[#1F2428] border border-[#2E343A] hover:border-[#C8551D] text-[10px] text-[#8A8F94] hover:text-[#E8E6E1] transition-none cursor-pointer"
          style={{ borderRadius: 0 }}
          title="Instantly advance simulation by +15 days into critical cooldown"
        >
          +15 DAYS
        </button>

        {/* Reset to Day 0 */}
        <button
          type="button"
          onClick={resetSimulation}
          className="p-1 bg-[#14171A] hover:bg-[#8C2F2F] hover:text-white border border-[#2E343A] text-[#8A8F94] transition-none cursor-pointer"
          style={{ borderRadius: 0 }}
          title="Reset fleet back to Day 0 initial state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default SimulationControlStrip;
