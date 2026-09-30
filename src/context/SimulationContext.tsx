import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BAGHEWALA_WELLS, WellData, WellStatus } from '@/src/data/wellsData';
import { 
  WellPhysicalState, 
  calculateWellPhysicalStep, 
  SimulationEngineState 
} from '@/src/data/simulationEngine';
import { useNotifications } from '@/src/context/NotificationContext';

interface SimulationContextType {
  // Live state
  isSimRunning: boolean;
  simSpeedMultiplier: number; // 1 = Real-time, 10 = Fast, 50 = Warp, 200 = Accelerated
  totalSimulatedDaysElapsed: number;
  wellsState: Record<string, WellPhysicalState>;
  simulatedWellsList: WellData[];
  
  // Controls
  startSimulation: () => void;
  pauseSimulation: () => void;
  toggleSimulation: () => void;
  setSpeedMultiplier: (speed: number) => void;
  advanceDays: (days: number) => void;
  resetSimulation: () => void;
  reSteamWell: (wellId: string) => void;
  
  // Aggregate field metrics derived live
  liveTotalBOPD: number;
  liveAverageTempC: number;
  liveAverageViscosityCP: number;
  liveFaultCount: number;
  liveAlertCount: number;
  liveNormalCount: number;
  liveRodFloatCount: number;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRunning, setIsRunning] = useState<boolean>(true); // Auto-running by default for realistic background activity
  const [speedMultiplier, setSpeedMultiplierState] = useState<number>(5); // 5 simulated days per real-time minute
  const [daysElapsed, setDaysElapsed] = useState<number>(0);
  const [reSteamedWells, setReSteamedWells] = useState<Record<string, number>>({}); // wellId -> new injection offset
  
  const { notifyWarning, notifyCritical, notifyInfo } = useNotifications();
  const notifiedEventsRef = useRef<Set<string>>(new Set());

  // Compute physical states for all 35 wells
  const wellsState = useMemo(() => {
    const states: Record<string, WellPhysicalState> = {};
    for (const rawWell of BAGHEWALA_WELLS) {
      // Check if this well was re-steamed during simulation
      const resteamOffset = reSteamedWells[rawWell.id] ?? 0;
      const effectiveAdditionalDays = Math.max(0, daysElapsed - resteamOffset);
      
      states[rawWell.id] = calculateWellPhysicalStep(rawWell, effectiveAdditionalDays);
    }
    return states;
  }, [daysElapsed, reSteamedWells]);

  // Convert states to WellData format to feed into legacy props smoothly
  const simulatedWellsList = useMemo(() => {
    return BAGHEWALA_WELLS.map((rawWell) => {
      const sim = wellsState[rawWell.id];
      if (!sim) return rawWell;
      return {
        ...rawWell,
        status: sim.status,
        daysSinceInjection: Math.round(sim.simulatedDaysSinceInjection),
        bottomholeTempC: sim.bottomholeTempC,
        reservoirTempC: sim.bottomholeTempC,
        crudeViscosityCP: sim.crudeViscosityCP,
        oilRateBOPD: sim.oilRateBOPD,
        polishedRodLoadLbs: sim.polishedRodLoadLbs,
        minRodLoadLbs: sim.minRodLoadLbs,
        pumpFillagePct: sim.pumpFillagePct,
        rodLoadStatus: sim.rodLoadStatus,
        rodFloatingRisk: sim.rodFloatingRisk,
        alertReason: sim.alertReason,
      };
    });
  }, [wellsState]);

  // Alert dispatcher when physical states drift into critical/warning zones
  useEffect(() => {
    for (const [wellId, state] of Object.entries(wellsState)) {
      if (state.status === 'fault' && !notifiedEventsRef.current.has(`${wellId}-fault-${Math.floor(daysElapsed / 5)}`)) {
        notifiedEventsRef.current.add(`${wellId}-fault-${Math.floor(daysElapsed / 5)}`);
        notifyCritical(
          `CRITICAL: ${wellId} Downstroke Rod Float Hazard`,
          `Reservoir cooled to ${state.bottomholeTempC}°C (${state.crudeViscosityCP} cP). Downstroke load collapsed to ${state.minRodLoadLbs} lbs. Plunger stalled in viscous column.`,
          {
            wellId,
            triggerMetric: `MPRL ${state.minRodLoadLbs} lb · ${state.crudeViscosityCP} cP`,
            actionLabel: 'INSPECT WELL TWIN',
          }
        );
      } else if (state.status === 'alert' && !notifiedEventsRef.current.has(`${wellId}-alert-${Math.floor(daysElapsed / 7)}`)) {
        notifiedEventsRef.current.add(`${wellId}-alert-${Math.floor(daysElapsed / 7)}`);
        notifyWarning(
          `WARNING: ${wellId} Viscous Drag Warning`,
          `Cooling front progressing: BHT ${state.bottomholeTempC}°C. Viscosity exceeded ${state.crudeViscosityCP} cP. Thermal re-steaming needed within 5-7 days.`,
          {
            wellId,
            triggerMetric: `BHT ${state.bottomholeTempC}°C · Visc ${state.crudeViscosityCP} cP`,
          }
        );
      }
    }
  }, [wellsState, daysElapsed, notifyCritical, notifyWarning]);

  // Physics Ticker: Advances simulation time smoothly
  useEffect(() => {
    if (!isRunning) return;

    // Tick every 1000ms. If speedMultiplier is 5, 1 minute = 5 days -> 1 second = 5/60 = 0.0833 days
    const intervalMs = 1000;
    const daysPerSecond = (speedMultiplier / 60);

    const timer = setInterval(() => {
      setDaysElapsed((prev) => {
        const next = prev + daysPerSecond;
        return Math.round(next * 100) / 100;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRunning, speedMultiplier]);

  // Controls
  const startSimulation = useCallback(() => setIsRunning(true), []);
  const pauseSimulation = useCallback(() => setIsRunning(false), []);
  const toggleSimulation = useCallback(() => setIsRunning((prev) => !prev), []);
  const setSpeedMultiplier = useCallback((speed: number) => setSpeedMultiplierState(speed), []);
  
  const advanceDays = useCallback((days: number) => {
    setDaysElapsed((prev) => Math.round((prev + days) * 100) / 100);
  }, []);

  const resetSimulation = useCallback(() => {
    setDaysElapsed(0);
    setReSteamedWells({});
    notifiedEventsRef.current.clear();
    notifyInfo('Simulation Engine Reset', 'All wells returned to Day 0 initial baseline state.');
  }, [notifyInfo]);

  const reSteamWell = useCallback((wellId: string) => {
    setReSteamedWells((prev) => ({
      ...prev,
      [wellId]: daysElapsed,
    }));
    notifyInfo(`CSS Cycle Re-Injected: ${wellId}`, `Thermal steam cycle dispatched. Sandface heated to 235°C, viscosity reset to 32 cP.`);
  }, [daysElapsed, notifyInfo]);

  // Aggregate field metrics derived live
  const liveTotalBOPD = useMemo(() => {
    return simulatedWellsList.reduce((acc, w) => acc + w.oilRateBOPD, 0);
  }, [simulatedWellsList]);

  const liveAverageTempC = useMemo(() => {
    const active = simulatedWellsList.filter(w => w.cyclePhase === 'Production (SRP)');
    if (active.length === 0) return 160;
    return Math.round(active.reduce((acc, w) => acc + w.bottomholeTempC, 0) / active.length);
  }, [simulatedWellsList]);

  const liveAverageViscosityCP = useMemo(() => {
    const active = simulatedWellsList.filter(w => w.cyclePhase === 'Production (SRP)');
    if (active.length === 0) return 250;
    return Math.round(active.reduce((acc, w) => acc + w.crudeViscosityCP, 0) / active.length);
  }, [simulatedWellsList]);

  const liveFaultCount = useMemo(() => {
    return simulatedWellsList.filter(w => w.status === 'fault').length;
  }, [simulatedWellsList]);

  const liveAlertCount = useMemo(() => {
    return simulatedWellsList.filter(w => w.status === 'alert').length;
  }, [simulatedWellsList]);

  const liveNormalCount = useMemo(() => {
    return simulatedWellsList.filter(w => w.status === 'normal').length;
  }, [simulatedWellsList]);

  const liveRodFloatCount = useMemo(() => {
    return simulatedWellsList.filter(w => w.rodFloatingRisk).length;
  }, [simulatedWellsList]);

  return (
    <SimulationContext.Provider
      value={{
        isSimRunning: isRunning,
        simSpeedMultiplier: speedMultiplier,
        totalSimulatedDaysElapsed: daysElapsed,
        wellsState,
        simulatedWellsList,
        startSimulation,
        pauseSimulation,
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
        liveNormalCount,
        liveRodFloatCount,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
