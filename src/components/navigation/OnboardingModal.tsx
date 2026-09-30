import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, X, Check, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (routeId: string) => void;
}

interface OnboardingStep {
  stepNumber: string;
  badge: string;
  title: string;
  routeId: string;
  explanation: string;
  subDetails: string[];
  renderIcon: () => React.ReactNode;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps: OnboardingStep[] = [
    {
      stepNumber: '01 / 04',
      badge: 'SPATIAL ASSET OVERVIEW',
      title: 'Field Overview',
      routeId: 'field-overview',
      explanation: 'Monitor real-time surface production, thermal states, and operating health across all 35 heavy oil wells in the Baghewala Thar Desert asset.',
      subDetails: [
        '5 Drill Pads (Pad-01 to Pad-05) spatial telemetry layout',
        'Real-time gross liquid and net bitumen rate consolidation',
        'Coupled reservoir temperature decay contours',
      ],
      renderIcon: () => (
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-24 h-24 text-[#C8551D] stroke-[1.25]">
          {/* Flat Technical Line-art: 3x3 Coordinate Field Grid */}
          <rect x="15" y="15" width="70" height="70" stroke="#2E343A" strokeDasharray="3 3" />
          <line x1="15" y1="50" x2="85" y2="50" stroke="#2E343A" strokeDasharray="2 2" />
          <line x1="50" y1="15" x2="50" y2="85" stroke="#2E343A" strokeDasharray="2 2" />
          {/* Drill Pads / Wells */}
          <rect x="24" y="24" width="10" height="10" stroke="#C8551D" fill="#191D21" />
          <rect x="66" y="24" width="10" height="10" stroke="#3A5F45" fill="#191D21" />
          <rect x="45" y="45" width="10" height="10" stroke="#C8551D" fill="#C8551D" fillOpacity="0.2" />
          <rect x="24" y="66" width="10" height="10" stroke="#3A5F45" fill="#191D21" />
          <rect x="66" y="66" width="10" height="10" stroke="#C9B896" fill="#191D21" />
          {/* Antenna Telemetry Signal */}
          <path d="M 45 40 L 50 32 L 55 40" stroke="#C9B896" />
          <line x1="50" y1="32" x2="50" y2="45" stroke="#C9B896" />
        </svg>
      ),
    },
    {
      stepNumber: '02 / 04',
      badge: 'PHYSICS-INFORMED DIGITAL TWIN',
      title: 'Digital Twin',
      routeId: 'digital-twin',
      explanation: 'Couple transient subsurface thermal decay directly with surface sucker-rod pumping kinematics to predict viscous drag before downstroke buckling occurs.',
      subDetails: [
        'Live downhole DTS fiber bottomhole temperature (BHT) curves',
        'Real-time surface & pump dynocard shape diagnostics',
        'Viscosity versus temperature (μ-T) constitutive model',
      ],
      renderIcon: () => (
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-24 h-24 text-[#C9B896] stroke-[1.25]">
          {/* Flat Technical Line-art: Surface Pumpjack Beam & Wellbore */}
          {/* Samson post */}
          <polygon points="30,70 42,35 48,35 60,70" stroke="#8A8F94" />
          {/* Walking beam */}
          <line x1="20" y1="42" x2="68" y2="28" stroke="#E8E6E1" strokeWidth="2" />
          {/* Horsehead & Pitman */}
          <path d="M 16 45 C 16 38 20 36 24 35" stroke="#C8551D" strokeWidth="1.5" />
          <line x1="65" y1="30" x2="65" y2="58" stroke="#8A8F94" />
          <rect x="61" y="54" width="8" height="8" stroke="#C8551D" />
          {/* Polished Rod String entering casing */}
          <line x1="16" y1="45" x2="16" y2="88" stroke="#C9B896" strokeWidth="1.5" />
          <line x1="10" y1="70" x2="22" y2="70" stroke="#2E343A" />
          {/* Downhole thermal waves */}
          <path d="M 12 84 Q 16 80 20 84 Q 24 88 28 84" stroke="#C8551D" />
        </svg>
      ),
    },
    {
      stepNumber: '03 / 04',
      badge: 'THERMAL RECOVERY STRATEGY',
      title: 'CSS Planner',
      routeId: 'css-cycle-planner',
      explanation: 'Plan and execute cyclic steam injection, conductive reservoir soak times, and production transition triggers to maintain minimum steam-oil ratios.',
      subDetails: [
        'Superheated steam allocation (14.2 MPa @ 78% dryness)',
        'Soak phase thermal conduction equilibration chronometer',
        'Economic steam-oil ratio (SOR < 3.5) threshold forecasting',
      ],
      renderIcon: () => (
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-24 h-24 text-[#C8551D] stroke-[1.25]">
          {/* Flat Technical Line-art: Steam Boiler & High Pressure Injection Lines */}
          <rect x="18" y="32" width="36" height="42" stroke="#E8E6E1" />
          {/* Pressure dials & burner flame */}
          <rect x="30" y="40" width="12" height="12" stroke="#C9B896" />
          <line x1="36" y1="46" x2="39" y2="43" stroke="#C8551D" />
          <path d="M 30 65 Q 36 56 42 65" stroke="#C8551D" />
          {/* Insulated Steam Header Pipeline */}
          <path d="M 54 42 L 78 42 L 78 75" stroke="#C8551D" strokeWidth="2" />
          {/* Thermal plume rays */}
          <line x1="74" y1="80" x2="82" y2="80" stroke="#C9B896" strokeDasharray="1 2" />
          <line x1="72" y1="84" x2="84" y2="84" stroke="#C9B896" strokeDasharray="1 2" />
          <line x1="70" y1="88" x2="86" y2="88" stroke="#C9B896" strokeDasharray="1 2" />
        </svg>
      ),
    },
    {
      stepNumber: '04 / 04',
      badge: 'ISA-18.2 ALARM ANNUNCIATOR',
      title: 'Alerts & Diagnostics',
      routeId: 'alerts-diagnostics',
      explanation: 'Detect severe viscous fluid drag, minimum rod tension violations under 2,000 lbs, and premature thermal cooling before structural failure occurs.',
      subDetails: [
        'Real-time rod floating & compressive buckling detection',
        'Downhole pump barrel fillage & fluid pound classification',
        'One-click setpoint dispatch to field RTU control nodes',
      ],
      renderIcon: () => (
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="w-24 h-24 text-[#8C2F2F] stroke-[1.25]">
          {/* Flat Technical Line-art: Annunciator Beacon & Shock Vector Waves */}
          {/* Squared Annunciator Housing */}
          <rect x="22" y="24" width="56" height="52" stroke="#8C2F2F" />
          <rect x="26" y="28" width="48" height="44" stroke="#2E343A" />
          {/* Warning Octagon / Triangle */}
          <polygon points="50,34 68,64 32,64" stroke="#C8551D" strokeWidth="1.5" />
          <line x1="50" y1="44" x2="50" y2="54" stroke="#C8551D" strokeWidth="2" />
          <rect x="48.5" y="57.5" width="3" height="3" fill="#C8551D" />
          {/* Radio Alarm Waves */}
          <path d="M 14 36 Q 8 50 14 64" stroke="#8C2F2F" strokeDasharray="2 2" />
          <path d="M 86 36 Q 92 50 86 64" stroke="#8C2F2F" strokeDasharray="2 2" />
        </svg>
      ),
    },
  ];

  if (!isOpen) return null;

  const activeStep = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('baghewala_onboarding_completed', 'true');
    onClose();
  };

  const handleNavigateAndClose = (routeId: string) => {
    localStorage.setItem('baghewala_onboarding_completed', 'true');
    onClose();
    onNavigate?.(routeId);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#14171A]/90 flex items-center justify-center p-4 select-none font-mono animate-scada-fade"
      style={{ borderRadius: 0 }}
    >
      {/* Squared Full-Screen Step Card Container */}
      <div 
        className="w-full max-w-2xl bg-[#191D21] border-2 border-[#2E343A] flex flex-col relative"
        style={{ borderRadius: 0 }}
      >
        {/* ========================================================================= */}
        {/* 1. MODAL TOP BAR (OIL LOGO & SKIP TOUR BUTTON)                            */}
        {/* ========================================================================= */}
        <div 
          className="p-3 bg-[#14171A] border-b border-[#2E343A] flex items-center justify-between"
          style={{ borderRadius: 0 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#191D21] border border-[#C8551D] flex items-center justify-center text-xs font-bold text-[#C8551D]">
              OIL
            </div>
            <div>
              <span className="text-xs font-bold text-[#E8E6E1] uppercase tracking-wider block">
                OIL INDIA LIMITED // BAGHEWALA TWIN
              </span>
              <span className="text-[8.5px] text-[#8A8F94]">
                ENGINEERING CONSOLE ONBOARDING TOUR
              </span>
            </div>
          </div>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleComplete}
            className="px-2.5 py-1 bg-[#14171A] hover:bg-[#20262B] border border-[#2E343A] hover:border-[#8C2F2F] text-[9.5px] text-[#8A8F94] hover:text-[#FFFFFF] uppercase font-bold transition-none cursor-pointer flex items-center gap-1"
            style={{ borderRadius: 0 }}
            title="Skip tour and enter engineering console"
          >
            <span>SKIP TOUR</span>
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. CARD CONTENT BODY                                                      */}
        {/* ========================================================================= */}
        <div className="p-6 flex flex-col md:flex-row items-center gap-6 bg-[#191D21]">
          {/* Left: Technical Line-Art Icon Display Box */}
          <div 
            className="w-40 h-40 bg-[#14171A] border border-[#2E343A] flex items-center justify-center shrink-0 p-3 relative"
            style={{ borderRadius: 0 }}
          >
            {activeStep.renderIcon()}

            {/* Corner Decorative Square */}
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#C8551D]" />
          </div>

          {/* Right: Step Metadata, Title & One Sentence Explanation */}
          <div className="flex-1 flex flex-col space-y-3 text-left">
            {/* Step Number & Module Badge */}
            <div className="flex items-center gap-2 text-[9px]">
              <span className="px-1.5 py-0.5 bg-[#C8551D] text-white font-bold" style={{ borderRadius: 0 }}>
                {activeStep.stepNumber}
              </span>
              <span className="text-[#C9B896] uppercase font-bold border border-[#2E343A] px-2 py-0.5 bg-[#14171A]">
                {activeStep.badge}
              </span>
            </div>

            {/* Step Title */}
            <h2 className="text-xl font-bold text-[#E8E6E1] tracking-wide">
              {activeStep.title}
            </h2>

            {/* One Sentence Explanation */}
            <p className="text-xs text-[#E8E6E1] leading-relaxed border-l-2 border-[#C8551D] pl-3 py-0.5 font-sans">
              {activeStep.explanation}
            </p>

            {/* Sub-details List */}
            <ul className="space-y-1 pt-1 text-[9px] text-[#8A8F94]">
              {activeStep.subDetails.map((detail, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#C9B896] shrink-0" style={{ borderRadius: 0 }} />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SQUARED NAVIGATION FOOTER & PROGRESS INDICATOR                         */}
        {/* ========================================================================= */}
        <div 
          className="p-3 bg-[#14171A] border-t border-[#2E343A] flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderRadius: 0 }}
        >
          {/* Progress indicator made of SMALL SQUARE DOTS (NOT CIRCULAR DOTS) */}
          <div className="flex items-center gap-2">
            <span className="text-[8.5px] text-[#5F656B] uppercase font-bold mr-1">
              PROGRESS:
            </span>
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-3 h-3 cursor-pointer transition-none ${
                    idx === currentStep
                      ? 'bg-[#C8551D] border border-[#C8551D]' // Active: Rig Orange Square
                      : idx < currentStep
                      ? 'bg-[#3A5F45] border border-[#3A5F45]' // Completed: Green Square
                      : 'bg-[#191D21] border border-[#2E343A]' // Inactive: Dark Slate Square
                  }`}
                  style={{ borderRadius: 0 }}
                  title={`Jump to step ${idx + 1}: ${steps[idx].title}`}
                />
              ))}
            </div>
            <span className="text-[9px] text-[#8A8F94] font-bold ml-1">
              STEP {currentStep + 1} OF {steps.length}
            </span>
          </div>

          {/* Navigation Buttons: Strictly Squared */}
          <div className="flex items-center gap-2">
            {/* Back Button */}
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 bg-[#191D21] hover:bg-[#252B30] border border-[#2E343A] text-[10px] text-[#8A8F94] hover:text-[#E8E6E1] uppercase font-bold flex items-center gap-1 transition-none cursor-pointer"
                style={{ borderRadius: 0 }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
            )}

            {/* Jump to this module directly */}
            <button
              type="button"
              onClick={() => handleNavigateAndClose(activeStep.routeId)}
              className="px-2.5 py-1.5 bg-[#14171A] hover:bg-[#20262B] border border-[#2E343A] text-[9.5px] text-[#C9B896] hover:text-[#E8E6E1] uppercase font-bold transition-none cursor-pointer"
              style={{ borderRadius: 0 }}
              title={`Open ${activeStep.title} Page`}
            >
              GO TO {activeStep.title.toUpperCase()}
            </button>

            {/* Squared Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase flex items-center gap-1.5 transition-none cursor-pointer shadow-sm ${
                currentStep === steps.length - 1
                  ? 'bg-[#3A5F45] hover:bg-[#4E7D5C] text-[#FFFFFF]'
                  : 'bg-[#C8551D] hover:bg-[#A84313] text-[#FFFFFF]'
              }`}
              style={{ borderRadius: 0 }}
            >
              <span>{currentStep === steps.length - 1 ? 'START CONSOLE' : 'NEXT STEP'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
