import React from 'react';
import { useDemoMode, DEMO_STEPS } from '@/src/context/DemoModeContext';
import { 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Activity, 
  Flame, 
  Radio, 
  Gauge, 
  ShieldAlert,
  Sliders,
  Cpu
} from 'lucide-react';

export const DemoCalloutOverlay: React.FC = () => {
  const { 
    isDemoActive, 
    demoStep, 
    currentConfig, 
    autoPlay, 
    stopDemo, 
    nextStep, 
    prevStep, 
    goToStep, 
    toggleAutoPlay 
  } = useDemoMode();

  if (!isDemoActive) return null;

  const isFinalStep = demoStep === 5;

  const getPhaseTheme = () => {
    switch (demoStep) {
      case 1:
        return {
          border: 'border-[#DE5959]',
          bg: 'bg-[#1C1414]',
          badge: 'bg-[#DE5959] text-white',
          textAccent: 'text-[#DE5959]',
          icon: ShieldAlert,
        };
      case 2:
        return {
          border: 'border-[#D96B27]',
          bg: 'bg-[#1F1914]',
          badge: 'bg-[#D96B27] text-white',
          textAccent: 'text-[#D96B27]',
          icon: AlertTriangle,
        };
      case 3:
        return {
          border: 'border-[#C8551D]',
          bg: 'bg-[#191D21]',
          badge: 'bg-[#C8551D] text-white',
          textAccent: 'text-[#C8551D]',
          icon: Sliders,
        };
      case 4:
        return {
          border: 'border-[#C9B896]',
          bg: 'bg-[#191D21]',
          badge: 'bg-[#C9B896] text-[#14171A]',
          textAccent: 'text-[#C9B896]',
          icon: Radio,
        };
      case 5:
        return {
          border: 'border-[#4E9B68]',
          bg: 'bg-[#141A16]',
          badge: 'bg-[#4E9B68] text-white',
          textAccent: 'text-[#4E9B68]',
          icon: CheckCircle2,
        };
      default:
        return {
          border: 'border-[#C8551D]',
          bg: 'bg-[#191D21]',
          badge: 'bg-[#C8551D] text-white',
          textAccent: 'text-[#C8551D]',
          icon: Sparkles,
        };
    }
  };

  const theme = getPhaseTheme();
  const IconComponent = theme.icon;

  return (
    <>
      {/* Target Focus Border Highlight across the viewport top (Flat solid line, strictly zero gradients) */}
      <div className="fixed top-14 left-0 right-0 h-0.5 z-50 pointer-events-none bg-[#C8551D]" />

      {/* Persistent Floating Demo Dock (Positioned at bottom for non-intrusive visibility) */}
      <aside 
        aria-label="Hackathon Scenario Walkthrough"
        className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[580px] z-50 border-2 ${theme.border} bg-[#14171A] flex flex-col font-mono select-none animate-scada-slide-up`}
        style={{ borderRadius: 0 }}
      >
        {/* Top Header Bar */}
        <div className={`px-3 py-2 bg-[#191D21] border-b ${theme.border} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 text-[8.5px] font-bold uppercase ${theme.badge}`} style={{ borderRadius: 0 }}>
              HACKATHON DEMO // {currentConfig.badgeLabel}
            </span>
            <span className="text-[10px] text-[#E8E6E1] font-bold">
              STEP 0{demoStep} / 05
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 5 Square Step Blocks */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => goToStep(step)}
                  className={`w-3 h-3 text-[7px] font-bold flex items-center justify-center transition-none cursor-pointer ${
                    step === demoStep
                      ? `${theme.badge} ring-1 ring-white`
                      : step < demoStep
                      ? 'bg-[#3A5F45] text-white'
                      : 'bg-[#252B30] text-[#8A8F94] hover:bg-[#343D45]'
                  }`}
                  style={{ borderRadius: 0 }}
                  title={`Jump to Phase 0${step}`}
                >
                  {step}
                </button>
              ))}
            </div>

            <div className="w-[1px] h-3.5 bg-[#2E343A] mx-0.5" />

            {/* Auto-Play Toggle */}
            <button
              type="button"
              onClick={toggleAutoPlay}
              className={`px-1.5 py-0.5 border text-[8.5px] font-bold uppercase flex items-center gap-1 transition-none cursor-pointer ${
                autoPlay 
                  ? 'bg-[#3A5F45] text-white border-[#3A5F45]' 
                  : 'bg-[#14171A] text-[#8A8F94] border-[#2E343A] hover:text-[#E8E6E1]'
              }`}
              style={{ borderRadius: 0 }}
              title={autoPlay ? 'Pause 9s Auto-Advance' : 'Enable 9s Auto-Advance'}
            >
              {autoPlay ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              <span>{autoPlay ? 'AUTO [ON]' : 'AUTO'}</span>
            </button>

            {/* Exit Demo Button */}
            <button
              type="button"
              onClick={stopDemo}
              className="p-1 bg-[#14171A] hover:bg-[#8C2F2F] hover:text-white border border-[#2E343A] text-[#8A8F94] transition-none cursor-pointer"
              style={{ borderRadius: 0 }}
              title="Exit Hackathon Demo Mode"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Narrative & Scenario Body */}
        <div className="p-3.5 space-y-3 bg-[#191D21]">
          {/* Headline with Icon */}
          <div className="flex items-start gap-2">
            <div className={`p-1 border ${theme.border} bg-[#14171A] shrink-0 mt-0.5`}>
              <IconComponent className={`w-4 h-4 ${theme.textAccent}`} />
            </div>
            <div>
              <span className={`text-[9px] font-bold uppercase tracking-wider block ${theme.textAccent}`}>
                {currentConfig.phaseCode}
              </span>
              <h3 className="text-xs font-bold text-[#E8E6E1] uppercase leading-tight tracking-wide">
                {currentConfig.headline}
              </h3>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="space-y-1.5">
            <p className="font-mono text-xs font-bold text-[#E8E6E1] leading-snug">
              {currentConfig.narrativeLead}
            </p>
            <p className="font-sans text-[11px] text-[#C9B896] leading-relaxed">
              {currentConfig.technicalDetails}
            </p>
          </div>

          {/* Squared Telemetry Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            {currentConfig.metrics.map((m, idx) => (
              <div 
                key={idx} 
                className="bg-[#14171A] border border-[#2E343A] p-1.5 flex flex-col justify-between"
                style={{ borderRadius: 0 }}
              >
                <span className="text-[7.5px] text-[#8A8F94] uppercase font-bold block truncate">
                  {m.label}
                </span>
                <span className={`text-[10px] font-bold truncate ${
                  m.status === 'critical' ? 'text-[#DE5959]' :
                  m.status === 'warning' ? 'text-[#D96B27]' :
                  m.status === 'success' ? 'text-[#4E9B68]' : 'text-[#C9B896]'
                }`}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* Pointing Callout Target Guide */}
          <div className="px-2.5 py-1.5 bg-[#14171A] border border-[#2E343A] flex items-center justify-between text-[9px] text-[#8A8F94]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#C9B896]" />
              <span>INSPECTING TARGET:</span>
              <strong className="text-[#E8E6E1]">{currentConfig.targetElementDescription}</strong>
            </span>
            <span className="text-[#C9B896]">WELL {currentConfig.wellId}</span>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-3 py-2 bg-[#161A1D] border-t border-[#2E343A] flex items-center justify-between gap-2">
          {/* Back Step Button */}
          <button
            type="button"
            onClick={prevStep}
            disabled={demoStep === 1}
            className="px-2.5 py-1.5 bg-[#14171A] hover:bg-[#20262B] border border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1] text-[9.5px] uppercase font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-none"
            style={{ borderRadius: 0 }}
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">PREV PHASE</span>
          </button>

          {/* Forward Step Action Button */}
          <button
            type="button"
            onClick={nextStep}
            className={`flex-1 py-1.5 px-3 text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 transition-none cursor-pointer shadow-md ${
              isFinalStep
                ? 'bg-[#3A5F45] hover:bg-[#4E7D5C] text-white border border-[#3A5F45]'
                : 'bg-[#C8551D] hover:bg-[#D9652D] text-white border border-[#C8551D]'
            }`}
            style={{ borderRadius: 0 }}
          >
            <span>{currentConfig.nextStepLabel}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DemoCalloutOverlay;
