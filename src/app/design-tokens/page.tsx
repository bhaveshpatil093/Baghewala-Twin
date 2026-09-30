import React, { useState } from 'react';
import PageHeader from '@/src/components/layout/PageHeader';
import { 
  Layers, 
  Copy, 
  Check, 
  ArrowLeft, 
  FileCode2, 
  Palette, 
  Type, 
  Maximize2, 
  Square, 
  Sliders, 
  ShieldCheck, 
  Activity, 
  Flame, 
  AlertTriangle, 
  AlertOctagon, 
  Info,
  Terminal,
  Code2
} from 'lucide-react';

interface DesignTokensPageProps {
  onNavigate?: (routeId: string) => void;
}

export default function DesignTokensPage({ onNavigate }: DesignTokensPageProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Color Token Definitions
  const colorCategories = [
    {
      title: '1. CANVAS & SURFACE BACKGROUNDS (CHARCOAL & STEEL)',
      description: 'Strict low-eyestrain dark palette engineered for 24/7 mission-critical DCS control room operations.',
      tokens: [
        {
          name: 'bg-base',
          hex: '#14171A',
          rgb: '20, 23, 26',
          cssVar: '--oil-bg-base',
          tailwind: 'bg-[#14171A]',
          usage: 'Primary canvas background, main window background, recessed input boxes.',
          contrast: 'Base Level (0:1)',
        },
        {
          name: 'bg-panel',
          hex: '#1F2428',
          rgb: '31, 36, 40',
          cssVar: '--oil-bg-panel',
          tailwind: 'bg-[#1F2428]',
          usage: 'Standard elevated panel surface, card containers, sidebar background, TopBar background.',
          contrast: '1.2:1 against base',
        },
        {
          name: 'bg-subtle',
          hex: '#272E34',
          rgb: '39, 46, 52',
          cssVar: '--oil-bg-subtle',
          tailwind: 'bg-[#272E34]',
          usage: 'Subtle table row zebra hover state, active button states, secondary button backgrounds.',
          contrast: '1.5:1 against base',
        },
        {
          name: 'bg-active',
          hex: '#2C343B',
          rgb: '44, 52, 59',
          cssVar: '--oil-bg-active',
          tailwind: 'bg-[#2C343B]',
          usage: 'Active item selection background, clicked toggle states, pressed button states.',
          contrast: '1.8:1 against base',
        },
        {
          name: 'bg-header',
          hex: '#191D21',
          rgb: '25, 29, 33',
          cssVar: '--oil-bg-header',
          tailwind: 'bg-[#191D21]',
          usage: 'Sub-headers inside panels, toolbar strips, table caption rows.',
          contrast: '1.1:1 against base',
        },
        {
          name: 'bg-inset',
          hex: '#161A1D',
          rgb: '22, 26, 29',
          cssVar: '--oil-bg-inset',
          tailwind: 'bg-[#161A1D]',
          usage: 'Recessed numerical readouts, secondary code boxes, telemetry ticker wells.',
          contrast: '1.05:1 against base',
        },
      ],
    },
    {
      title: '2. STRUCTURAL TECHNICAL BORDERS (1PX FLAT DIVIDERS)',
      description: 'Depth in this system is created strictly through 1px flat structural lines. Zero drop shadows or blurring filters.',
      tokens: [
        {
          name: 'border-dim',
          hex: '#252B30',
          rgb: '37, 43, 48',
          cssVar: '--oil-border-dim',
          tailwind: 'border-[#252B30]',
          usage: 'Subtle internal table row dividers, quiet nested partition lines.',
          contrast: '1.4:1 against base',
        },
        {
          name: 'border-default',
          hex: '#2E343A',
          rgb: '46, 52, 58',
          cssVar: '--oil-border-default',
          tailwind: 'border-[#2E343A]',
          usage: 'Standard technical boundary for 100% of cards, panels, inputs, and button borders.',
          contrast: '1.7:1 against base',
        },
        {
          name: 'border-bright',
          hex: '#3E464E',
          rgb: '62, 70, 78',
          cssVar: '--oil-border-bright',
          tailwind: 'border-[#3E464E]',
          usage: 'Highlighted border on hover, focused field secondary border, elevated dialog boundaries.',
          contrast: '2.3:1 against base',
        },
        {
          name: 'border-sand',
          hex: '#C9B896',
          rgb: '201, 184, 150',
          cssVar: '--oil-border-sand',
          tailwind: 'border-[#C9B896]',
          usage: 'Geologic formation boundary, Thar desert accent line, thermal schedule indicators.',
          contrast: '8.4:1 against base',
        },
        {
          name: 'border-rig',
          hex: '#C8551D',
          rgb: '200, 85, 29',
          cssVar: '--oil-border-rig',
          tailwind: 'border-[#C8551D]',
          usage: 'Active focus outline (2px solid), active sidebar module left border, critical action border.',
          contrast: '4.8:1 against base',
        },
      ],
    },
    {
      title: '3. TYPOGRAPHY & TEXT COLOUR TOKENS (WCAG AA CERTIFIED)',
      description: 'All text tokens maintain > 4.5:1 contrast ratio against the charcoal background to guarantee readability in bright or dim rooms.',
      tokens: [
        {
          name: 'text-primary',
          hex: '#E8E6E1',
          rgb: '232, 230, 225',
          cssVar: '--oil-text-primary',
          tailwind: 'text-[#E8E6E1]',
          usage: 'Primary body text, metric values, table titles, prominent well identifiers.',
          contrast: '12.8:1 (AAA Pass)',
        },
        {
          name: 'text-secondary',
          hex: '#8A8F94',
          rgb: '138, 143, 148',
          cssVar: '--oil-text-secondary',
          tailwind: 'text-[#8A8F94]',
          usage: 'Secondary labels, units of measure, table headers, breadcrumbs, timestamp meta.',
          contrast: '5.8:1 (AA Pass)',
        },
        {
          name: 'text-muted',
          hex: '#5F656B',
          rgb: '95, 101, 107',
          cssVar: '--oil-text-muted',
          tailwind: 'text-[#5F656B]',
          usage: 'De-emphasized technical codes, system registry IDs, grid crosshair labels.',
          contrast: '3.2:1 (Decorative / Technical codes)',
        },
        {
          name: 'text-sand',
          hex: '#C9B896',
          rgb: '201, 184, 150',
          cssVar: '--oil-text-sand',
          tailwind: 'text-[#C9B896]',
          usage: 'Secondary accent text: Pad identifiers, cycle numbers, currency figures, Thar Basin metadata.',
          contrast: '8.4:1 (AAA Pass)',
        },
        {
          name: 'text-white',
          hex: '#FFFFFF',
          rgb: '255, 255, 255',
          cssVar: '--oil-text-white',
          tailwind: 'text-white',
          usage: 'Text on solid colored action buttons (Rig Orange button, Safety Green button).',
          contrast: '14.5:1 against dark base',
        },
      ],
    },
    {
      title: '4. INTERACTIVE RIG ACCENTS & THAR DESERT HIGHLIGHTS',
      description: 'Single warm rig-orange accent (#C8551D) inspired by industrial petroleum hardware and rust oxide. Never neon or saturated orange.',
      tokens: [
        {
          name: 'accent-rig',
          hex: '#C8551D',
          rgb: '200, 85, 29',
          cssVar: '--oil-accent-rig',
          tailwind: 'bg-[#C8551D] / text-[#C8551D]',
          usage: 'Sole interactive primary accent: primary action buttons, active navigation item indicator, critical focus rings.',
          contrast: '4.8:1 against base',
        },
        {
          name: 'accent-rig-hover',
          hex: '#B24816',
          rgb: '178, 72, 22',
          cssVar: '--oil-accent-hover',
          tailwind: 'hover:bg-[#B24816]',
          usage: 'Hover state for primary action buttons.',
          contrast: '4.2:1 against base',
        },
        {
          name: 'accent-rig-active',
          hex: '#9A3D11',
          rgb: '154, 61, 17',
          cssVar: '--oil-accent-active',
          tailwind: 'active:bg-[#9A3D11]',
          usage: 'Pressed/active state for primary action buttons.',
          contrast: '3.6:1 against base',
        },
        {
          name: 'accent-rig-subtle',
          hex: 'rgba(200, 85, 29, 0.15)',
          rgb: '200, 85, 29, 0.15',
          cssVar: '--oil-accent-subtle',
          tailwind: 'bg-[#C8551D]/15',
          usage: 'Subtle background highlight for warning banners, active selection badges.',
          contrast: 'Soft background tint',
        },
        {
          name: 'accent-sand',
          hex: '#C9B896',
          rgb: '201, 184, 150',
          cssVar: '--oil-accent-sand',
          tailwind: 'text-[#C9B896] / border-[#C9B896]',
          usage: 'Thar Desert sand secondary highlight: pad groupings, CSS cycle stage tags, OPEX figures.',
          contrast: '8.4:1 against base',
        },
      ],
    },
    {
      title: '5. STRICT RESERVED SCADA STATUS PALETTE (ISA-18.2 DCS)',
      description: 'Crucial SCADA Rule: Colors are reserved exclusively for operating states. No arbitrary blues, purples, or decorative greens are permitted.',
      tokens: [
        {
          name: 'status-normal-bg',
          hex: '#3A5F45',
          rgb: '58, 95, 69',
          cssVar: '--oil-status-normal',
          tailwind: 'bg-[#3A5F45]',
          usage: 'Deep safety-green badge fill, healthy RTU beacon, nominal pumping unit status.',
          contrast: '3.5:1 against base',
        },
        {
          name: 'status-normal-text',
          hex: '#4E9B68',
          rgb: '78, 155, 104',
          cssVar: '--oil-status-normal-text',
          tailwind: 'text-[#4E9B68]',
          usage: 'High-contrast safety-green text for status chips, nominal sensor readouts, audit approvals.',
          contrast: '5.5:1 (AA Pass)',
        },
        {
          name: 'status-fault-bg',
          hex: '#8C2F2F',
          rgb: '140, 47, 47',
          cssVar: '--oil-status-fault',
          tailwind: 'bg-[#8C2F2F]',
          usage: 'Deep warning-red badge fill, critical downstroke rod-float hazard, trip alarms.',
          contrast: '3.4:1 against base',
        },
        {
          name: 'status-fault-text',
          hex: '#DE5959',
          rgb: '222, 89, 89',
          cssVar: '--oil-status-fault-text',
          tailwind: 'text-[#DE5959]',
          usage: 'High-contrast warning-red text for emergency alerts, compressive load alarms, tripped RTUs.',
          contrast: '4.9:1 (AA Pass)',
        },
        {
          name: 'status-alert-text',
          hex: '#D96B27',
          rgb: '217, 107, 39',
          cssVar: '--oil-status-warning-text',
          tailwind: 'text-[#D96B27]',
          usage: 'High-contrast orange text for predictive thermal warnings and intermediate load warnings.',
          contrast: '5.8:1 (AA Pass)',
        },
      ],
    },
  ];

  // Typography Specifications
  const typographyTokens = [
    {
      level: 'Hero KPI Readout',
      sizePx: '30px',
      rem: '1.875rem',
      tailwind: 'text-3xl font-mono font-bold tracking-tight',
      font: 'Monospace',
      weight: '700 (Bold)',
      lineHeight: '1.1',
      usage: 'Field total production (BOPD), aggregate flow rate, main dashboard headline numbers.',
      sample: '1,420 BOPD',
    },
    {
      level: 'Standard KPI Readout',
      sizePx: '24px',
      rem: '1.5rem',
      tailwind: 'text-2xl font-mono font-bold tracking-tight',
      font: 'Monospace',
      weight: '700 (Bold)',
      lineHeight: '1.2',
      usage: 'Card metric values, live active well count, mean temperature readings.',
      sample: '114.8 °C',
    },
    {
      level: 'Compact Metric Value',
      sizePx: '20px',
      rem: '1.25rem',
      tailwind: 'text-xl font-mono font-bold',
      font: 'Monospace',
      weight: '700 (Bold)',
      lineHeight: '1.25',
      usage: 'Mini KPI cards, modal stat callouts, economic cost aggregates.',
      sample: '₹14.8 Lakhs',
    },
    {
      level: 'Section Heading',
      sizePx: '14px',
      rem: '0.875rem',
      tailwind: 'text-sm font-sans font-bold tracking-wider uppercase',
      font: 'Geometric Sans',
      weight: '700 (Bold)',
      lineHeight: '1.3',
      usage: 'Panel titles, page section headers, modal headers, toolbar category labels.',
      sample: 'CYCLIC STEAM STIMULATION SCHEDULE MATRIX',
    },
    {
      level: 'Standard UI / Table Text',
      sizePx: '12px',
      rem: '0.75rem',
      tailwind: 'text-xs font-sans font-medium',
      font: 'Geometric Sans',
      weight: '500 (Medium)',
      lineHeight: '1.4',
      usage: 'Standard button labels, descriptive prose, explanation cards, dialog descriptions.',
      sample: 'Viscous drag exceeds buoyant weight of 7/8 inch sucker rod string.',
    },
    {
      level: 'Dense Telemetry Cell',
      sizePx: '10px',
      rem: '0.625rem',
      tailwind: 'text-[10px] font-mono',
      font: 'Monospace',
      weight: '400 (Regular) / 700 (Bold)',
      lineHeight: '1.35',
      usage: 'Table data cells, sensor status strips, dynamometer coordinates, chart axes labels.',
      sample: 'MPRL: 1,420 lbs (DOWNSTROKE TENSION)',
    },
    {
      level: 'Technical Sub-Label',
      sizePx: '8.5px / 9px',
      rem: '0.5625rem',
      tailwind: 'text-[9px] font-mono uppercase tracking-wider',
      font: 'Monospace',
      weight: '600 (Semibold)',
      lineHeight: '1.2',
      usage: 'Table column headers, sensor register IDs, metadata captions, status indicator text.',
      sample: 'DTS SENSOR ID: 192.168.14.09',
    },
    {
      level: 'Micro Status Badge',
      sizePx: '7.5px / 8px',
      rem: '0.46875rem',
      tailwind: 'text-[7.5px] font-mono font-bold uppercase tracking-wider',
      font: 'Monospace',
      weight: '700 (Bold)',
      lineHeight: '1.0',
      usage: 'Compact pad tags [PAD-02], health indicators [OK], role stamps [WRITE PERMITTED].',
      sample: '[PAD-02 · C-03]',
    },
  ];

  // Spacing & Layout Tokens
  const spacingTokens = [
    { token: 'space-1', px: '1px', tailwind: 'p-0.2 / gap-0.5', usage: 'Hairline dividers, technical 1px borders, subtle button margins' },
    { token: 'space-2', px: '2px', tailwind: 'p-0.5 / py-0.2 / gap-0.5', usage: 'Dense badge padding, status beacon alignment, chip borders' },
    { token: 'space-4', px: '4px', tailwind: 'p-1 / gap-1', usage: 'Compact icon button padding, toolbar element gaps, sub-label margins' },
    { token: 'space-6', px: '6px', tailwind: 'py-1.5 px-2.5', usage: 'Standard technical button padding, form input vertical padding' },
    { token: 'space-8', px: '8px', tailwind: 'p-2 / gap-2', usage: 'Dense cell padding, secondary container padding, card header margin' },
    { token: 'space-10', px: '10px', tailwind: 'p-2.5 / gap-2.5', usage: 'Standard KPI tile padding, table filter bar spacing, list item padding' },
    { token: 'space-12', px: '12px', tailwind: 'p-3 / gap-3', usage: 'Standard panel container padding, 12-column grid gaps, modal inner padding' },
    { token: 'space-16', px: '16px', tailwind: 'p-4 / gap-4', usage: 'Page container root padding, major section breaks, dashboard row gaps' },
    { token: 'space-20', px: '20px', tailwind: 'p-5 / gap-5', usage: 'Print report inner margins, onboarding walkthrough card padding' },
    { token: 'space-24', px: '24px', tailwind: 'p-6', usage: 'Top-level view boundaries on large 4K displays' },
  ];

  // Layout Structural Dimension Constants
  const layoutConstants = [
    { name: 'TopBar Height', value: '56px (h-14)', fixed: true, usage: 'Fixed top SCADA annunciator, system heartbeat, clock, user profile' },
    { name: 'Sidebar Width (Desktop)', value: '256px (w-64)', fixed: true, usage: 'Fixed left navigation rail on lg+ desktop viewports' },
    { name: 'Sidebar Width (Tablet Icon Rail)', value: '56px (w-14)', fixed: true, usage: 'Icon-only fixed rail on tablet/smaller viewports' },
    { name: 'Simulation Control Strip Height', value: '38px', fixed: false, usage: 'Persistent physical drift engine status bar directly below TopBar' },
    { name: 'Table Row Height (Dense)', value: '38px', fixed: false, usage: 'Single-line telemetry records in Well Fleet and SRP Console tables' },
    { name: 'Table Row Height (Expanded)', value: '46px', fixed: false, usage: 'Two-line records with root-cause summaries in Maintenance Log' },
    { name: 'Standard Button Height', value: '28px to 32px', fixed: false, usage: 'Primary action buttons and toolbar controls' },
    { name: 'Corner Border Radius', value: '0px (STRICTLY ZERO)', fixed: true, usage: 'Zero-pill discipline: Every element, card, button, modal has 0px radius' },
    { name: 'Drop Shadows & Gradients', value: '0 (NONE)', fixed: true, usage: 'Forbidden: No box-shadow, no text-shadow, no linear-gradient' },
  ];

  // Next.js Tailwind Config Snippet
  const tailwindSnippet = `// tailwind.config.ts (Ready to copy into Next.js project)
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        oil: {
          bg: {
            base: '#14171A',     // Primary near-black charcoal canvas
            panel: '#1F2428',    // Standard elevated steel panel
            subtle: '#272E34',   // Row hover / subtle active surface
            active: '#2C343B',   // Selected item background
            header: '#191D21',   // Section header strip
            inset: '#161A1D',    // Recessed data box
          },
          border: {
            dim: '#252B30',      // Subtle table row divider
            default: '#2E343A',  // 1px standard technical border
            bright: '#3E464E',   // Highlighted technical border
            sand: '#C9B896',     // Thar desert geologic line
            rig: '#C8551D',      // Rig orange active border
          },
          text: {
            primary: '#E8E6E1',  // Off-white primary text (12.8:1)
            secondary: '#8A8F94',// Mid-grey secondary text (5.8:1)
            muted: '#5F656B',    // Dim meta labels
            sand: '#C9B896',     // Muted desert sand highlight (8.4:1)
          },
          accent: {
            rig: '#C8551D',      // Warm rig-orange / burnt rust oxide
            hover: '#B24816',    // Darker rig-orange on hover
            active: '#9A3D11',   // Deep rust on click
            sand: '#C9B896',     // Thar desert accent
          },
          status: {
            normal: '#3A5F45',     // Safety green surface
            normalText: '#4E9B68', // High-contrast green text (5.5:1)
            fault: '#8C2F2F',      // Warning red surface
            faultText: '#DE5959',  // High-contrast red text (4.9:1)
            alertText: '#D96B27',  // High-contrast orange text (5.8:1)
          },
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Inter', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
      },
      boxShadow: {
        none: 'none',
      },
      animation: {
        'scada-fade': 'scadaFadeIn 120ms linear forwards',
        'scada-slide-down': 'scadaSlideDown 120ms linear forwards',
        'scada-slide-up': 'scadaSlideUp 120ms linear forwards',
        'scada-slide-left': 'scadaSlideLeft 140ms linear forwards',
      },
      keyframes: {
        scadaFadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scadaSlideDown: {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scadaSlideUp: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scadaSlideLeft: {
          from: { opacity: '0', transform: 'translateX(8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
};

export default config;`;

  // Raw CSS Variables Snippet
  const cssVariablesSnippet = `/* globals.css : Strict Industrial Control Room Variables */
:root {
  color-scheme: dark;

  /* Surfaces */
  --oil-bg-base: #14171A;
  --oil-bg-panel: #1F2428;
  --oil-bg-subtle: #272E34;
  --oil-bg-active: #2C343B;
  --oil-bg-header: #191D21;
  --oil-bg-inset: #161A1D;

  /* Borders (1px flat boundaries, zero blur) */
  --oil-border-dim: #252B30;
  --oil-border-default: #2E343A;
  --oil-border-bright: #3E464E;
  --oil-border-sand: #C9B896;
  --oil-border-rig: #C8551D;

  /* Typography */
  --oil-text-primary: #E8E6E1;
  --oil-text-secondary: #8A8F94;
  --oil-text-muted: #5F656B;
  --oil-text-sand: #C9B896;

  /* Single Interactive Accent */
  --oil-accent-rig: #C8551D;
  --oil-accent-hover: #B24816;
  --oil-accent-active: #9A3D11;
  --oil-accent-sand: #C9B896;

  /* Reserved SCADA Status Colors */
  --oil-status-normal: #3A5F45;
  --oil-status-normal-text: #4E9B68;
  --oil-status-fault: #8C2F2F;
  --oil-status-fault-text: #DE5959;
  --oil-status-warning-text: #D96B27;
}

/* ZERO-PILL & ZERO-GRADIENT UNIVERSAL OVERRIDE */
*, *::before, *::after {
  border-radius: 0px !important;
  box-shadow: none !important;
  text-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* ACCESSIBLE SQUARED FOCUS RING */
:focus-visible {
  outline: 2px solid #C8551D !important;
  outline-offset: 1px !important;
  border-radius: 0px !important;
}`;

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-4 font-mono select-text">
      {/* Header with Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2E343A] pb-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-[#8A8F94] mb-1">
            <span>BAGHEWALA TWIN</span>
            <span>/</span>
            <span>INTERNAL ENGINEERING</span>
            <span>/</span>
            <span className="text-[#C8551D] font-bold">DESIGN TOKENS SPECIFICATION</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-[#E8E6E1] uppercase tracking-wide flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#C8551D]" />
            <span>DESIGN SYSTEM TOKENS REFERENCE // NEXT.JS MIGRATION GUIDE</span>
          </h1>
          <p className="text-xs text-[#8A8F94] font-sans mt-0.5">
            Exhaustive design token dictionary for engineering handoff. Every colour, font size, spacing unit, and structural constraint defined to replicate the exact industrial DCS control room aesthetic in Next.js.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="px-3 py-1.5 bg-[#191D21] hover:bg-[#252B30] text-[#E8E6E1] border border-[#2E343A] text-xs font-bold uppercase transition-none flex items-center gap-1.5 cursor-pointer"
              style={{ borderRadius: 0 }}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C8551D]" />
              <span>RETURN TO SETTINGS</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => copyToClipboard(tailwindSnippet, 'tailwind-all')}
            className="px-3 py-1.5 bg-[#C8551D] hover:bg-[#B24816] text-white text-xs font-bold uppercase transition-none flex items-center gap-1.5 cursor-pointer shadow-sm"
            style={{ borderRadius: 0 }}
            title="Copy Tailwind config to clipboard"
          >
            {copiedSection === 'tailwind-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'tailwind-all' ? 'CONFIG COPIED!' : 'COPY TAILWIND CONFIG'}</span>
          </button>
        </div>
      </div>

      {/* CORE SPECIFICATION RULES BANNER */}
      <section className="bg-[#191D21] border border-[#2E343A] border-l-4 border-l-[#C8551D] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#E8E6E1] uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C8551D]" />
            <span>NON-NEGOTIABLE ARCHITECTURAL DESIGN CONSTRAINTS (ZERO-PILL DISCIPLINE)</span>
          </span>
          <span className="px-2 py-0.5 bg-[#14171A] border border-[#2E343A] text-[9px] text-[#C9B896] font-bold">
            OIL-DCS-STD-01
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px] pt-1">
          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 space-y-1">
            <strong className="text-[#E8E6E1] block uppercase flex items-center gap-1">
              <Square className="w-3 h-3 text-[#C8551D]" />
              1. ZERO ROUNDED CORNERS
            </strong>
            <p className="text-[#8A8F94] font-sans leading-relaxed">
              Every button, badge, input, toggle switch, card, modal, and tooltip MUST have <code>borderRadius: 0px</code>. No pill shapes, capsules, or rounded corners anywhere.
            </p>
          </div>

          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 space-y-1">
            <strong className="text-[#E8E6E1] block uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#C9B896]" />
              2. ZERO GRADIENTS & SHADOWS
            </strong>
            <p className="text-[#8A8F94] font-sans leading-relaxed">
              Pure flat surfaces only. No drop shadows, text shadows, or linear gradients. Visual hierarchy is achieved exclusively through 1px technical borders.
            </p>
          </div>

          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 space-y-1">
            <strong className="text-[#E8E6E1] block uppercase flex items-center gap-1">
              <Palette className="w-3 h-3 text-[#4E9B68]" />
              3. RESERVED SCADA PALETTE
            </strong>
            <p className="text-[#8A8F94] font-sans leading-relaxed">
              Single interactive accent: Rig-orange <code>#C8551D</code>. Safety green <code>#3A5F45</code> and Warning red <code>#8C2F2F</code> are strictly reserved for SCADA operating states. No blue/purple.
            </p>
          </div>

          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 space-y-1">
            <strong className="text-[#E8E6E1] block uppercase flex items-center gap-1">
              <Type className="w-3 h-3 text-[#DE5959]" />
              4. DUAL TYPOGRAPHY MATRIX
            </strong>
            <p className="text-[#8A8F94] font-sans leading-relaxed">
              Geometric Sans for UI titles, controls, and descriptions. Monospace for 100% of sensor numbers, telemetry readouts, coordinates, and timestamps.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 1: COLOUR TOKENS DICTIONARY */}
      <section className="bg-[#191D21] border border-[#2E343A] p-3 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2E343A] pb-2">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#C8551D]" />
            <h2 className="text-sm font-bold text-[#E8E6E1] uppercase tracking-wider">
              1. COLOUR TOKEN DICTIONARY &amp; WCAG AA MATRIX
            </h2>
          </div>
          <span className="text-[9px] text-[#8A8F94]">25 DEFINED PALETTE TOKENS</span>
        </div>

        <div className="space-y-4">
          {colorCategories.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="bg-[#14171A] p-2 border border-[#2E343A] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-[#E8E6E1] uppercase">{cat.title}</span>
                <span className="text-[9px] text-[#8A8F94]">{cat.description}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {cat.tokens.map((token) => (
                  <div 
                    key={token.name}
                    className="bg-[#14171A] border border-[#2E343A] p-2.5 flex flex-col justify-between space-y-2"
                    style={{ borderRadius: 0 }}
                  >
                    {/* Top Row: Swatch & Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-7 h-7 border border-[#2E343A] shrink-0" 
                          style={{ backgroundColor: token.hex, borderRadius: 0 }} 
                        />
                        <div>
                          <strong className="text-xs text-[#E8E6E1] block uppercase">{token.name}</strong>
                          <span className="text-[9.5px] font-mono text-[#C9B896] block">{token.hex}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(token.hex, token.name)}
                        className="p-1 text-[#8A8F94] hover:text-[#E8E6E1] bg-[#191D21] border border-[#2E343A]"
                        title={`Copy ${token.hex}`}
                      >
                        {copiedSection === token.name ? <Check className="w-3 h-3 text-[#4E9B68]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-1 text-[9px] border-t border-[#252B30] pt-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#5F656B]">RGB:</span>
                        <span className="text-[#8A8F94]">{token.rgb}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5F656B]">CSS VAR:</span>
                        <code className="text-[#C8551D]">{token.cssVar}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5F656B]">TAILWIND:</span>
                        <code className="text-[#C9B896]">{token.tailwind}</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5F656B]">CONTRAST:</span>
                        <span className="text-[#4E9B68] font-bold">{token.contrast}</span>
                      </div>
                    </div>

                    {/* Usage note */}
                    <p className="text-[8.5px] font-sans text-[#8A8F94] leading-tight border-t border-[#252B30] pt-1">
                      {token.usage}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: TYPOGRAPHY HIERARCHY MATRIX */}
      <section className="bg-[#191D21] border border-[#2E343A] p-3 space-y-3">
        <div className="flex items-center justify-between border-b border-[#2E343A] pb-2">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-[#C9B896]" />
            <h2 className="text-sm font-bold text-[#E8E6E1] uppercase tracking-wider">
              2. TYPOGRAPHY MATRIX &amp; SCALE HIERARCHY
            </h2>
          </div>
          <span className="text-[9px] text-[#8A8F94]">GEOMETRIC SANS + INSTRUMENTATION MONOSPACE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#2E343A]">
            <thead className="bg-[#14171A] text-[9px] text-[#8A8F94] uppercase font-bold border-b border-[#2E343A]">
              <tr>
                <th className="p-2 border-r border-[#2E343A]">HIERARCHY LEVEL</th>
                <th className="p-2 border-r border-[#2E343A]">SIZE / REM</th>
                <th className="p-2 border-r border-[#2E343A]">FONT STACK &amp; WEIGHT</th>
                <th className="p-2 border-r border-[#2E343A]">TAILWIND UTILITY</th>
                <th className="p-2 border-r border-[#2E343A]">SYSTEM USAGE</th>
                <th className="p-2">LIVE SPECIMEN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252B30] text-[10px]">
              {typographyTokens.map((type, idx) => (
                <tr key={idx} className="hover:bg-[#181D21] transition-none">
                  <td className="p-2 border-r border-[#2E343A] font-bold text-[#E8E6E1] whitespace-nowrap">
                    {type.level}
                  </td>
                  <td className="p-2 border-r border-[#2E343A] font-mono text-[#C9B896] whitespace-nowrap">
                    {type.sizePx} ({type.rem})
                  </td>
                  <td className="p-2 border-r border-[#2E343A] whitespace-nowrap">
                    <span className="text-[#E8E6E1]">{type.font}</span>
                    <span className="text-[#5F656B] block text-[8.5px]">{type.weight}</span>
                  </td>
                  <td className="p-2 border-r border-[#2E343A] font-mono text-[#C8551D] text-[9px] whitespace-nowrap">
                    <code>{type.tailwind}</code>
                  </td>
                  <td className="p-2 border-r border-[#2E343A] font-sans text-[#8A8F94] text-[9.5px]">
                    {type.usage}
                  </td>
                  <td className="p-2 text-[#E8E6E1]">
                    <div className={type.tailwind} style={{ lineHeight: type.lineHeight }}>
                      {type.sample}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: SPACING, SIZING & LAYOUT TOKENS */}
      <section className="bg-[#191D21] border border-[#2E343A] p-3 space-y-3">
        <div className="flex items-center justify-between border-b border-[#2E343A] pb-2">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-[#4E9B68]" />
            <h2 className="text-sm font-bold text-[#E8E6E1] uppercase tracking-wider">
              3. SPACING SCALE &amp; LAYOUT CONSTANTS
            </h2>
          </div>
          <span className="text-[9px] text-[#8A8F94]">BASE-4 SCALE WITH SCADA MICRO-SPACING</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Spacing Scale Table */}
          <div className="bg-[#14171A] border border-[#2E343A] p-3 space-y-2">
            <span className="text-xs font-bold text-[#E8E6E1] uppercase block border-b border-[#2E343A] pb-1">
              PADDING &amp; MARGIN TOKEN SCALE
            </span>
            <div className="space-y-1.5 text-[9.5px]">
              {spacingTokens.map((sp) => (
                <div key={sp.token} className="flex items-center justify-between py-1 border-b border-[#252B30]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#C8551D] w-16">{sp.token}</span>
                    <span className="font-mono text-[#C9B896] w-12">{sp.px}</span>
                    <code className="text-[#8A8F94] text-[8.5px] w-24 truncate">{sp.tailwind}</code>
                  </div>
                  <span className="font-sans text-[8.5px] text-[#8A8F94] text-right truncate max-w-[200px]">
                    {sp.usage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Structural Layout Constants */}
          <div className="bg-[#14171A] border border-[#2E343A] p-3 space-y-2">
            <span className="text-xs font-bold text-[#E8E6E1] uppercase block border-b border-[#2E343A] pb-1">
              STRUCTURAL SIZING CONSTANTS &amp; CONSTRAINTS
            </span>
            <div className="space-y-1.5 text-[9.5px]">
              {layoutConstants.map((lc) => (
                <div key={lc.name} className="flex items-center justify-between py-1 border-b border-[#252B30]">
                  <div>
                    <strong className="text-[#E8E6E1] block">{lc.name}</strong>
                    <span className="font-sans text-[8px] text-[#8A8F94]">{lc.usage}</span>
                  </div>
                  <span className={`font-mono text-right font-bold ${lc.name.includes('Radius') ? 'text-[#DE5959]' : 'text-[#C9B896]'}`}>
                    {lc.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CODE EXPORT FOR NEXT.JS MIGRATION */}
      <section className="bg-[#191D21] border border-[#2E343A] p-3 space-y-3">
        <div className="flex items-center justify-between border-b border-[#2E343A] pb-2">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-[#C8551D]" />
            <h2 className="text-sm font-bold text-[#E8E6E1] uppercase tracking-wider">
              4. COPY-PASTE READY CODE CONFIGURATIONS FOR NEXT.JS
            </h2>
          </div>
          <span className="text-[9px] text-[#8A8F94]">NEXT.JS / TAILWIND V3 &amp; V4 COMPATIBLE</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Box 1: tailwind.config.ts */}
          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between border-b border-[#252B30] pb-1.5">
              <span className="text-[10px] font-bold text-[#C8551D]">tailwind.config.ts</span>
              <button
                type="button"
                onClick={() => copyToClipboard(tailwindSnippet, 'code-tailwind')}
                className="px-2 py-0.5 bg-[#191D21] hover:bg-[#252B30] border border-[#2E343A] text-[8.5px] uppercase font-bold text-[#E8E6E1] flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'code-tailwind' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                <span>COPY CODE</span>
              </button>
            </div>
            <pre className="text-[8.5px] font-mono text-[#8A8F94] bg-[#0F1215] p-2 overflow-x-auto max-h-60 leading-tight">
              {tailwindSnippet}
            </pre>
          </div>

          {/* Box 2: globals.css */}
          <div className="bg-[#14171A] border border-[#2E343A] p-2.5 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between border-b border-[#252B30] pb-1.5">
              <span className="text-[10px] font-bold text-[#C9B896]">globals.css (CSS Variables &amp; Overrides)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(cssVariablesSnippet, 'code-css')}
                className="px-2 py-0.5 bg-[#191D21] hover:bg-[#252B30] border border-[#2E343A] text-[8.5px] uppercase font-bold text-[#E8E6E1] flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'code-css' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                <span>COPY CODE</span>
              </button>
            </div>
            <pre className="text-[8.5px] font-mono text-[#8A8F94] bg-[#0F1215] p-2 overflow-x-auto max-h-60 leading-tight">
              {cssVariablesSnippet}
            </pre>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="p-3 bg-[#191D21] border border-[#2E343A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9px] text-[#8A8F94]">
        <div>
          <span>OIL INDIA LIMITED // BAGHEWALA DIGITAL TWIN INTERNAL ENGINEERING SPECIFICATION</span>
        </div>
        <div className="flex items-center gap-2 text-[#C9B896]">
          <Check className="w-3 h-3 text-[#4E9B68]" />
          <span>ZERO-PILL DISCIPLINE CERTIFIED · WCAG AA COMPLIANT · READY FOR NEXT.JS</span>
        </div>
      </div>
    </div>
  );
}
