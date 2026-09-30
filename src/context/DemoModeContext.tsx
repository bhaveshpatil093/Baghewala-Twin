import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface DemoStepConfig {
  stepNumber: number; // 1 to 5
  totalSteps: number;
  phaseCode: string;
  headline: string;
  targetRoute: string;
  wellId: string;
  targetElementDescription: string;
  narrativeLead: string;
  technicalDetails: string;
  metrics: Array<{ label: string; value: string; status: 'critical' | 'warning' | 'success' | 'info' }>;
  simulatedActionLabel?: string;
  nextStepLabel: string;
  badgeLabel: string;
}

export const DEMO_STEPS: DemoStepConfig[] = [
  {
    stepNumber: 1,
    totalSteps: 5,
    phaseCode: 'PHASE-01 // HAZARD ONSET',
    headline: 'CRITICAL ROD-FLOATING & VISCOUS BITUMEN DRAG',
    targetRoute: 'digital-twin',
    wellId: 'BGW-09',
    targetElementDescription: 'Surface SRP Gauges & Downstroke Polished Rod Tension',
    narrativeLead: 'Well BGW-09 in Pad-B has entered an acute failure mode. Post-CSS reservoir thermal decay plunged sandface temperature to 108°C, causing heavy crude viscosity to spike to 1,620 cP.',
    technicalDetails: 'Severe viscous drag on the downstroke prevents the rod string from sinking freely. Minimum Polished Rod Load (MPRL) has collapsed from nominal 3,200 lbs down to 790 lbs (critical failure threshold is 2,000 lbs). The rod string is floating and buckling under severe compression, risking parted rods and thousands in workover downtime.',
    metrics: [
      { label: 'CRUDE VISCOSITY', value: '1,620 cP', status: 'critical' },
      { label: 'MIN ROD LOAD (MPRL)', value: '790 lbs [CRITICAL]', status: 'critical' },
      { label: 'ROD-FLOAT LIMIT', value: '2,000 lbs', status: 'warning' },
      { label: 'FAILURE RISK', value: 'IMMINENT ROD PART', status: 'critical' },
    ],
    nextStepLabel: 'INSPECT AI EARLY DETECTION ➔',
    badgeLabel: 'INCIDENT ONSET',
  },
  {
    stepNumber: 2,
    totalSteps: 5,
    phaseCode: 'PHASE-02 // EARLY INFERENCE',
    headline: 'AI DIGITAL TWIN EARLY DETECTION & ALARM TRIGGER',
    targetRoute: 'alerts-diagnostics',
    wellId: 'BGW-09',
    targetElementDescription: 'SCADA Fault Annunciator & Downhole DTS Temperature Decay Curve',
    narrativeLead: 'Rather than waiting for a surface rod-part catastrophic failure, the Baghewala AI Digital Twin solver identifies the coupled thermal decay signature hours in advance.',
    technicalDetails: 'Coupling downhole DTS thermal fiber logs with surface dynamometer transducers, the physics model detects that downstroke velocity v_max exceeds fluid terminal velocity v_term. An automated high-priority SCADA alarm is dispatched to the control room console 14 hours ahead of physical rod failure.',
    metrics: [
      { label: 'EARLY WARNING LEAD', value: '+14h 20m ADVANCE', status: 'success' },
      { label: 'MODEL CONFIDENCE', value: '96.4% PROBABILITY', status: 'info' },
      { label: 'DYNO DISTORTION', value: 'DOWNSTROKE FLATTENING', status: 'warning' },
      { label: 'SCADA PRIORITY', value: 'P1 CRITICAL DISPATCH', status: 'critical' },
    ],
    nextStepLabel: 'VIEW AI KINEMATIC RECOMMENDATION ➔',
    badgeLabel: 'AI EARLY INFERENCE',
  },
  {
    stepNumber: 3,
    totalSteps: 5,
    phaseCode: 'PHASE-03 // ACTIONABLE RECS',
    headline: 'PHYSICS-INFORMED KINEMATIC VFD OPTIMIZATION',
    targetRoute: 'digital-twin',
    wellId: 'BGW-09',
    targetElementDescription: 'AI Recommended Adjustment Card beside Live VFD Console',
    narrativeLead: 'The AI model synthesizes Stokes fluid drag equations with Lufkin beam mechanics to calculate the exact speed trim needed to arrest rod floating.',
    technicalDetails: 'The system prescribes reducing pumping speed from 4.2 SPM to 2.6 SPM (-38%) and shortening polished rod stroke length from 168" to 144" (crank pos 2). This cuts peak downstroke velocity by 41%, eliminating fluid pound shock while preserving net drawdown pressure.',
    metrics: [
      { label: 'RECOMMENDED SPEED', value: '2.6 SPM (-1.6 SPM)', status: 'info' },
      { label: 'STROKE LENGTH', value: '144 in (Crank Pos 2)', status: 'info' },
      { label: 'TARGET VFD FREQ', value: '21.7 Hz (from 35.1 Hz)', status: 'info' },
      { label: 'AVOIDED WORKOVER', value: '₹14.8 LAKHS SAVED', status: 'success' },
    ],
    simulatedActionLabel: 'SIMULATE APPLY SETPOINT ➔',
    nextStepLabel: 'PROCEED TO OPERATOR DISPATCH ➔',
    badgeLabel: 'AI PRESCRIPTIVE ADVICE',
  },
  {
    stepNumber: 4,
    totalSteps: 5,
    phaseCode: 'PHASE-04 // SCADA DISPATCH',
    headline: 'SCADA HANDSHAKE & IMMUTABLE PSU AUDIT LOGGING',
    targetRoute: 'audit-log',
    wellId: 'BGW-09',
    targetElementDescription: 'Official SCADA RTU Register Dispatch & Modbus Acknowledgement',
    narrativeLead: 'Authorized under the Field Engineer role, the operator verifies attribution weights and commits the setting to the wellhead RTU.',
    technicalDetails: 'An authenticated Modbus RTU packet (HR-40102 command) updates the wellhead VFD inverter in 84ms. Simultaneously, an immutable audit record is committed with timestamp, prior vs new setpoints, and engineer credentials to satisfy DGMS / DGH statutory regulatory compliance.',
    metrics: [
      { label: 'MODBUS REGISTER', value: 'HR-40102 [VFD_CMD]', status: 'info' },
      { label: 'SCADA ACK TIME', value: '82 ms LOOP', status: 'success' },
      { label: 'OPERATOR AUTH', value: 'Er. A. K. Sharma (DESK-04)', status: 'info' },
      { label: 'AUDIT HASH', value: 'AUD-20260929-012', status: 'success' },
    ],
    nextStepLabel: 'INSPECT OUTCOME & RECOVERY PAYOFF ➔',
    badgeLabel: 'COMMITTED TO VFD',
  },
  {
    stepNumber: 5,
    totalSteps: 5,
    phaseCode: 'PHASE-05 // PAYOFF & RECOVERY',
    headline: 'OUTCOME: ROD-FLOAT ELIMINATED, PRODUCTION & SOR SURGE',
    targetRoute: 'digital-twin',
    wellId: 'BGW-09',
    targetElementDescription: 'Restored Dynamometer Card & Optimized Field Economics',
    narrativeLead: 'Within 2 pump strokes of the 2.6 SPM VFD speed adjustment, downstroke fluid drag subsides and rod tension normalizes completely!',
    technicalDetails: 'Minimum rod load rebounds from 790 lbs to a safe 2,420 lbs (> 2,000 lbs limit). Pump barrel fillage climbs from 58% to 86%, avoiding fluid pound impact. Net daily oil production increases by +14 BOPD, while Steam-to-Oil Ratio (SOR) improves from 3.6 to 2.8 m³/m³, saving ₹4.2 Lakhs monthly in fuel gas.',
    metrics: [
      { label: 'RESTORED MPRL', value: '2,420 lbs [SAFE > 2,000]', status: 'success' },
      { label: 'PUMP FILLAGE', value: '86% [REBOUND +28%]', status: 'success' },
      { label: 'NET OIL RATE', value: '+14 BOPD INCREMENTAL', status: 'success' },
      { label: 'SOR EFFICIENCY', value: '3.6 → 2.8 m³/m³ (-22%)', status: 'success' },
    ],
    nextStepLabel: 'FINISH HACKATHON DEMO [RESET]',
    badgeLabel: 'OPTIMIZATION VERIFIED',
  },
];

export interface DemoModeContextType {
  isDemoActive: boolean;
  demoStep: number;
  currentConfig: DemoStepConfig;
  autoPlay: boolean;
  startDemo: () => void;
  stopDemo: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepNumber: number) => void;
  toggleAutoPlay: () => void;
  registerNavigationHandler: (handler: (route: string, wellId?: string) => void) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoActive, setIsDemoActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('baghewala_demo_active') === 'true';
    } catch {
      return false;
    }
  });

  const [demoStep, setDemoStep] = useState<number>(1);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [navHandler, setNavHandler] = useState<((route: string, wellId?: string) => void) | null>(null);

  const registerNavigationHandler = useCallback((handler: (route: string, wellId?: string) => void) => {
    setNavHandler(() => handler);
  }, []);

  const currentConfig = DEMO_STEPS[demoStep - 1] || DEMO_STEPS[0];

  const navigateToStep = useCallback((stepNum: number) => {
    const config = DEMO_STEPS[stepNum - 1];
    if (config && navHandler) {
      navHandler(config.targetRoute, config.wellId);
    }
  }, [navHandler]);

  const startDemo = useCallback(() => {
    setIsDemoActive(true);
    setDemoStep(1);
    try {
      localStorage.setItem('baghewala_demo_active', 'true');
    } catch {
      // ignore
    }
    navigateToStep(1);
  }, [navigateToStep]);

  const stopDemo = useCallback(() => {
    setIsDemoActive(false);
    setAutoPlay(false);
    try {
      localStorage.setItem('baghewala_demo_active', 'false');
    } catch {
      // ignore
    }
  }, []);

  const goToStep = useCallback((stepNumber: number) => {
    const bounded = Math.max(1, Math.min(5, stepNumber));
    setDemoStep(bounded);
    navigateToStep(bounded);
  }, [navigateToStep]);

  const nextStep = useCallback(() => {
    if (demoStep >= 5) {
      stopDemo();
    } else {
      goToStep(demoStep + 1);
    }
  }, [demoStep, goToStep, stopDemo]);

  const prevStep = useCallback(() => {
    if (demoStep > 1) {
      goToStep(demoStep - 1);
    }
  }, [demoStep, goToStep]);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay(prev => !prev);
  }, []);

  // Auto-play timer (advances every 9 seconds if autoPlay is enabled)
  useEffect(() => {
    if (!isDemoActive || !autoPlay) return;

    const timer = setInterval(() => {
      setDemoStep(current => {
        if (current >= 5) {
          setIsDemoActive(false);
          setAutoPlay(false);
          return 1;
        }
        const next = current + 1;
        navigateToStep(next);
        return next;
      });
    }, 9000);

    return () => clearInterval(timer);
  }, [isDemoActive, autoPlay, navigateToStep]);

  return (
    <DemoModeContext.Provider
      value={{
        isDemoActive,
        demoStep,
        currentConfig,
        autoPlay,
        startDemo,
        stopDemo,
        nextStep,
        prevStep,
        goToStep,
        toggleAutoPlay,
        registerNavigationHandler,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = (): DemoModeContextType => {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};

export default DemoModeContext;
