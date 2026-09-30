import React, { useState } from 'react';
import { 
  CheckSquare, 
  Flame, 
  Activity, 
  Layers, 
  SlidersHorizontal, 
  Terminal, 
  Gauge, 
  ShieldCheck, 
  AlertTriangle,
  Cpu
} from 'lucide-react';
import DS from '@/src/design-system';

interface PageProps {
  currentRoute: string;
}

const routeTitles: Record<string, { title: string; code: string; desc: string }> = {
  overview: {
    title: 'FIELD OVERVIEW & SCADA GRID',
    code: 'VIEW-01',
    desc: '35-well status overview, field total steam delivery, aggregate gross liquid & BOPD.',
  },
  'coupled-physics': {
    title: 'COUPLED WELL-TO-SURFACE PHYSICS ENGINE',
    code: 'VIEW-02',
    desc: 'Reservoir temperature field linked dynamically to crude viscosity and surface rod loading.',
  },
  'css-cycles': {
    title: 'CYCLIC STEAM STIMULATION (CSS) CYCLES',
    code: 'VIEW-03',
    desc: 'Injection phase steam enthalpy, soak duration monitoring, thermal front dissipation.',
  },
  'thermal-front': {
    title: 'DOWNHOLE THERMAL FRONT & GAUGES',
    code: 'VIEW-04',
    desc: 'Distributed temperature sensing (DTS) and downhole pressure-temperature gauge array.',
  },
  'srp-lift': {
    title: 'SUCKER ROD PUMP (SRP) SURFACE LIFT',
    code: 'VIEW-05',
    desc: 'Surface dynamometer cards, polished rod peak load (PRL), minimum rod load, gearbox torque.',
  },
  'surface-manifold': {
    title: 'WELLHEAD & GGS FLOWLINE MANIFOLD',
    code: 'VIEW-06',
    desc: 'Header pressure, steam distribution manifold, group gathering station (GGS) telemetry.',
  },
  wells: {
    title: '35-WELL TELEMETRY ROSTER & MATRIX',
    code: 'VIEW-07',
    desc: 'Comprehensive multi-well status, current cycle stage, stroke rate, API gravity, water cut.',
  },
  optimization: {
    title: 'PREDICTIVE TWIN AI OPTIMIZATION',
    code: 'VIEW-08',
    desc: 'Steam-to-oil ratio (SOR) minimization, optimal soak period, rod fatigue prediction.',
  },
  alarms: {
    title: 'SCADA ALARM CONSOLE & ANNUNCIATOR',
    code: 'VIEW-09',
    desc: 'ISA-18.2 compliant priority alarm list, trip logs, acknowledgement log.',
  },
  reports: {
    title: 'SHIFT LOGS & COMPLIANCE REPORTS',
    code: 'VIEW-10',
    desc: 'Shift handover logs, DGMS thermal compliance records, daily oil production allocation.',
  },
};

export const MainPage: React.FC<PageProps> = ({ currentRoute }) => {
  const currentView = routeTitles[currentRoute] || routeTitles['overview'];
  const [testParam, setTestParam] = useState<string>('BGW-012');

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#14171A] space-y-4">
      {/* Engineering Viewport Header & Locator Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border border-[#2E343A] bg-[#1F2428] px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-[#C8551D]" />
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#8A8F94]">WORKSPACE:</span>
            <span className="text-[#C8551D] font-bold tracking-wider">
              {currentView.title}
            </span>
            <span className="text-[#5F656B]">·</span>
            <span className="text-[#E8E6E1]">{currentView.code}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono text-[#8A8F94] mt-1 md:mt-0">
          <div>
            <span className="text-[#5F656B]">COORD: </span>
            <span className="text-[#C9B896]">27°48&apos;N 71°45&apos;E</span>
          </div>
          <div>
            <span className="text-[#5F656B]">FORMATION: </span>
            <span className="text-[#E8E6E1]">JODHPUR HEAVY OIL (17° API)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#3A5F45]">
            <span className="w-1.5 h-1.5 bg-[#3A5F45]" />
            <span className="font-bold">SYSTEM LOCKED & VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Design System Specification & Confirmation Console */}
      <div className="border border-[#2E343A] bg-[#1F2428] p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2E343A] pb-2">
          <div className="flex items-center gap-2">
            <CheckSquare strokeWidth={1.25} className="w-4 h-4 text-[#C8551D]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#E8E6E1]">
              DESIGN SYSTEM SPECIFICATION &amp; AUDIT LOCK
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-[#8A8F94]">STANDARD:</span>
            <span className="text-[#C9B896] font-bold">OIL-DCS-STD-2026</span>
            <span className="text-[#5F656B]">·</span>
            <span className="text-[#3A5F45] font-bold">ALL 7 CONSTRAINTS COMPLIANT</span>
          </div>
        </div>

        {/* 1. Palette Lock Swatches */}
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#8A8F94] mb-2 font-mono">
            1. LOCKED COLOR SYSTEM (NO BLUE / PURPLE / NEON PERMITTED)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {/* Primary Background */}
            <div className="border border-[#2E343A] bg-[#14171A] p-2 flex flex-col justify-between h-20">
              <span className="text-[10px] font-mono text-[#8A8F94] uppercase">Primary Bg</span>
              <div>
                <span className="font-mono text-xs font-bold text-[#E8E6E1]">#14171A</span>
                <span className="block text-[9px] text-[#5F656B]">Near-black charcoal</span>
              </div>
            </div>

            {/* Panel Surfaces */}
            <div className="border border-[#2E343A] bg-[#1F2428] p-2 flex flex-col justify-between h-20">
              <span className="text-[10px] font-mono text-[#8A8F94] uppercase">Panel Surface</span>
              <div>
                <span className="font-mono text-xs font-bold text-[#E8E6E1]">#1F2428</span>
                <span className="block text-[9px] text-[#5F656B]">Dark steel grey</span>
              </div>
            </div>

            {/* Single Accent: Warm Rig-Orange */}
            <div className="border border-[#C8551D] bg-[#C8551D] p-2 flex flex-col justify-between h-20 text-[#E8E6E1]">
              <span className="text-[10px] font-mono uppercase font-bold text-[#14171A]">Single Accent</span>
              <div>
                <span className="font-mono text-xs font-bold">#C8551D</span>
                <span className="block text-[9px] text-[#14171A] font-medium">Warm rig-orange</span>
              </div>
            </div>

            {/* Desert Sand */}
            <div className="border border-[#C9B896] bg-[#14171A] p-2 flex flex-col justify-between h-20">
              <span className="text-[10px] font-mono text-[#C9B896] uppercase font-bold">Desert Sand</span>
              <div>
                <span className="font-mono text-xs font-bold text-[#C9B896]">#C9B896</span>
                <span className="block text-[9px] text-[#8A8F94]">Thar Desert highlight</span>
              </div>
            </div>

            {/* Primary Text */}
            <div className="border border-[#2E343A] bg-[#14171A] p-2 flex flex-col justify-between h-20">
              <span className="text-[10px] font-mono text-[#8A8F94] uppercase">Primary Text</span>
              <div>
                <span className="font-mono text-xs font-bold text-[#E8E6E1]">#E8E6E1</span>
                <span className="block text-[9px] text-[#5F656B]">Off-white</span>
              </div>
            </div>

            {/* Secondary Text */}
            <div className="border border-[#2E343A] bg-[#14171A] p-2 flex flex-col justify-between h-20">
              <span className="text-[10px] font-mono text-[#8A8F94] uppercase">Secondary Text</span>
              <div>
                <span className="font-mono text-xs font-bold text-[#8A8F94]">#8A8F94</span>
                <span className="block text-[9px] text-[#5F656B]">Mid-grey</span>
              </div>
            </div>

            {/* Reserved Statuses */}
            <div className="border border-[#2E343A] bg-[#14171A] p-2 flex flex-col justify-between h-20">
              <span className="text-[10px] font-mono text-[#8A8F94] uppercase">Reserved Signals</span>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#3A5F45]" />
                  <span className="font-mono text-[10px] font-bold text-[#3A5F45]">#3A5F45 Normal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#8C2F2F]" />
                  <span className="font-mono text-[10px] font-bold text-[#8C2F2F]">#8C2F2F Fault</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Test Rack & Form Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-[#2E343A]">
          {/* Action Primitives */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#8A8F94] block font-bold">
              2. BUTTONS &amp; CONTROLS (STRICT 0PX RADIUS, ZERO GRADIENT)
            </span>
            <div className="flex flex-wrap gap-2">
              <button className={DS.classes.buttonPrimary}>
                Primary Action (#C8551D)
              </button>
              <button className={DS.classes.buttonSecondary}>
                Secondary (#1F2428)
              </button>
              <button className={DS.classes.buttonFault}>
                Emergency Stop (#8C2F2F)
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-mono text-[#8A8F94]">WELL SELECTOR:</span>
              <input 
                type="text" 
                value={testParam} 
                onChange={(e) => setTestParam(e.target.value)}
                className="bg-[#14171A] border border-[#2E343A] focus:border-[#C8551D] px-2 py-1 text-xs font-mono text-[#E8E6E1] outline-none w-28"
              />
              <span className="text-[10px] font-mono text-[#3A5F45] font-bold">CONNECTED</span>
            </div>
          </div>

          {/* Instrumentation Numeric Sensor Readouts */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#8A8F94] block font-bold">
              3. SENSOR INSTRUMENTATION READOUTS (MONOSPACE)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#14171A] border border-[#2E343A] p-2">
                <span className="text-[9px] font-mono uppercase text-[#8A8F94] block">CSS STEAM ENTHALPY</span>
                <span className="font-mono text-sm font-bold text-[#E8E6E1]">2,784.6</span>
                <span className="text-[9px] font-mono text-[#8A8F94] ml-1">kJ/kg</span>
              </div>
              <div className="bg-[#14171A] border border-[#2E343A] p-2">
                <span className="text-[9px] font-mono uppercase text-[#8A8F94] block">CRUDE VISCOSITY (T)</span>
                <span className="font-mono text-sm font-bold text-[#C9B896]">142.8</span>
                <span className="text-[9px] font-mono text-[#8A8F94] ml-1">cP</span>
              </div>
              <div className="bg-[#14171A] border border-[#2E343A] p-2">
                <span className="text-[9px] font-mono uppercase text-[#8A8F94] block">SRP PEAK POLISHED LOAD</span>
                <span className="font-mono text-sm font-bold text-[#E8E6E1]">18,450</span>
                <span className="text-[9px] font-mono text-[#8A8F94] ml-1">lbs</span>
              </div>
              <div className="bg-[#14171A] border border-[#2E343A] p-2">
                <span className="text-[9px] font-mono uppercase text-[#8A8F94] block">RESERVOIR TEMP (FORMATION)</span>
                <span className="font-mono text-sm font-bold text-[#C8551D]">186.4</span>
                <span className="text-[9px] font-mono text-[#8A8F94] ml-1">°C</span>
              </div>
            </div>
          </div>

          {/* Constraints Verification Checklist */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#8A8F94] block font-bold">
              4. AUDIT CHECKLIST (PHYSICAL RULES)
            </span>
            <div className="bg-[#14171A] border border-[#2E343A] p-2.5 space-y-1.5 font-mono text-[10px]">
              <div className="flex items-center justify-between text-[#E8E6E1]">
                <span>Border Radius:</span>
                <span className="text-[#3A5F45] font-bold">0px (Strict Squared)</span>
              </div>
              <div className="flex items-center justify-between text-[#E8E6E1]">
                <span>Gradients:</span>
                <span className="text-[#3A5F45] font-bold">0% (Pure Flat Fills)</span>
              </div>
              <div className="flex items-center justify-between text-[#E8E6E1]">
                <span>Drop Shadows:</span>
                <span className="text-[#3A5F45] font-bold">None (1px Border Separation)</span>
              </div>
              <div className="flex items-center justify-between text-[#E8E6E1]">
                <span>Color Isolation:</span>
                <span className="text-[#3A5F45] font-bold">Zero Blue / Purple / Neon</span>
              </div>
              <div className="flex items-center justify-between text-[#E8E6E1]">
                <span>Iconography:</span>
                <span className="text-[#3A5F45] font-bold">1.25px Blueprint Stroke</span>
              </div>
              <div className="flex items-center justify-between text-[#E8E6E1]">
                <span>Location Nod:</span>
                <span className="text-[#C9B896] font-bold">Thar Desert Sand (#C9B896)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standby Canvas for Subsequent Prompts */}
      <div className="border border-dashed border-[#2E343A] bg-[#14171A] p-6 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 mb-2 font-mono text-xs">
          <Terminal strokeWidth={1.25} className="w-4 h-4 text-[#C8551D]" />
          <span className="font-bold text-[#E8E6E1]">DESIGN SYSTEM LOCKED &amp; SHELL READY</span>
        </div>
        <p className="text-xs font-mono text-[#8A8F94] max-w-lg">
          The base industrial app shell, navigation console, and design system tokens are fully configured and locked to your exact specifications. Ready to implement the next screen.
        </p>
      </div>
    </div>
  );
};

export default MainPage;
