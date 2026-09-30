/**
 * Baghewala Twin - Strictly Locked Industrial Control Room Design System
 * Built for Oil India Limited (OIL), Baghewala Heavy Oil Field, Rajasthan
 * Smart India Hackathon
 * 
 * STRICT ARCHITECTURAL CONSTRAINTS:
 * 1. Palette:
 *    - Primary Background: #14171A (near-black charcoal)
 *    - Panel Surfaces: #1F2428 (dark steel grey)
 *    - Single Interactive Accent: #C8551D (warm rig-orange / burnt rust oxide, NOT neon)
 *      Used strictly for primary actions, active states, and critical alerts.
 *    - Secondary Highlight: #C9B896 (muted desert sand, Thar Desert nod, used sparingly)
 *    - Primary Text: #E8E6E1 (off-white)
 *    - Secondary Text: #8A8F94 (mid-grey)
 *    - Normal/Healthy Status: #3A5F45 (deep safety-green, ONLY for normal/healthy)
 *    - Fault State: #8C2F2F (deep warning-red, ONLY for critical fault states)
 *    - STRICT RULE: No blue, purple, or other green anywhere in the application.
 * 
 * 2. Geometry & Depth:
 *    - Every corner in the application: Perfectly square, 0px border-radius, no exceptions.
 *    - Zero gradients anywhere (no backgrounds, no buttons, no charts).
 *    - Zero drop shadows: Depth is created strictly through flat 1px borders.
 * 
 * 3. Typography:
 *    - Headings & UI Labels: Geometric Grotesk Sans-Serif (font-sans)
 *    - Numeric Readouts, Sensor Values, Tables: Monospace (font-mono) styled as instrumentation displays
 * 
 * 4. Iconography:
 *    - Thin-stroke (strokeWidth={1.25} or {1.5}), technical blueprint style only.
 */

export const DS = {
  colors: {
    // Canvas & Panel Surfaces
    bgBase: '#14171A',        // Near-black charcoal primary canvas
    bgPanel: '#1F2428',       // Dark steel grey panel surface
    bgSubtle: '#272E34',      // Subtle active/row hover surface
    bgActive: '#2C343B',      // Active selection surface

    // Borders (1px flat structural boundaries, no shadows)
    borderDim: '#252B30',     // Quiet internal divider
    borderDefault: '#2E343A', // Standard technical panel border
    borderBright: '#3E464E',  // Highlighted technical border
    borderSand: '#C9B896',    // Thar sand accent border (used sparingly)
    borderRig: '#C8551D',     // Rig-orange border for active controls

    // Typography
    textPrimary: '#E8E6E1',   // Off-white primary text
    textSecondary: '#8A8F94', // Mid-grey secondary text
    textSand: '#C9B896',      // Muted desert sand secondary highlight
    textMuted: '#5F656B',     // Dim technical labels

    // Single Interactive Accent
    accentRig: '#C8551D',     // Warm rig-orange (burnt rust oxide)
    accentRigHover: '#B24816',
    accentRigActive: '#9A3D11',

    // Secondary Thar Desert Highlight (Sparingly used)
    accentSand: '#C9B896',
    accentSandMuted: '#8F8265',

    // Strict Reserved SCADA State Colors (NO other colored lights allowed)
    status: {
      normal: '#3A5F45',      // Deep safety-green (healthy only)
      normalText: '#4E9B68',  // High-contrast AA accessible green text (5.5:1)
      fault: '#8C2F2F',       // Deep warning-red (critical fault only)
      faultText: '#DE5959',   // High-contrast AA accessible red text (4.9:1)
      active: '#C8551D',      // Rig-orange (active state / alert)
      activeText: '#D96B27',  // High-contrast AA accessible orange text (5.8:1)
      standby: '#8A8F94',     // Mid-grey (standby / idle / offline)
    },
  },

  // Component Utility Classes (Zero radius, zero gradients, 1px flat borders)
  classes: {
    // Panels & Surfaces
    panel: 'bg-[#1F2428] border border-[#2E343A]',
    panelHeader: 'bg-[#191D21] border-b border-[#2E343A] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#8A8F94]',
    surface: 'bg-[#1F2428] border border-[#2E343A]',
    subtleBox: 'bg-[#14171A] border border-[#2E343A]',

    // Interactive Controls (Buttons strictly with #C8551D rig-orange as sole accent)
    buttonPrimary: 'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#C8551D] hover:bg-[#B24816] active:bg-[#9A3D11] text-[#E8E6E1] border border-[#C8551D] transition-none disabled:opacity-40 disabled:cursor-not-allowed',
    buttonSecondary: 'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#1F2428] hover:bg-[#272E34] active:bg-[#2C343B] text-[#E8E6E1] border border-[#2E343A] hover:border-[#3E464E] transition-none disabled:opacity-40',
    buttonGhost: 'px-2.5 py-1.5 text-xs font-medium text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#272E34] border border-transparent hover:border-[#2E343A] transition-none',
    buttonFault: 'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#8C2F2F] hover:bg-[#722626] text-[#E8E6E1] border border-[#8C2F2F] transition-none',

    // Form inputs (Flat, crisp, square)
    input: 'bg-[#14171A] border border-[#2E343A] focus:border-[#C8551D] text-xs text-[#E8E6E1] px-2.5 py-1.5 outline-none font-mono placeholder-[#5F656B]',
    select: 'bg-[#14171A] border border-[#2E343A] focus:border-[#C8551D] text-xs text-[#E8E6E1] px-2 py-1.5 outline-none font-mono',

    // Instrumentation Typography
    instrumentValue: 'font-mono text-xs tracking-tight font-semibold text-[#E8E6E1]',
    instrumentUnit: 'font-mono text-[10px] text-[#8A8F94] ml-1 uppercase',
    instrumentLabel: 'text-[10px] uppercase font-bold tracking-wider text-[#8A8F94]',
    headingSection: 'text-xs uppercase font-bold tracking-widest text-[#E8E6E1]',
    sandHighlight: 'text-[#C9B896] font-mono',

    // SCADA Status Square Indicators (Zero radius, no pill shapes)
    statusNormal: 'w-2 h-2 shrink-0 inline-block bg-[#3A5F45]',
    statusFault: 'w-2 h-2 shrink-0 inline-block bg-[#8C2F2F]',
    statusActive: 'w-2 h-2 shrink-0 inline-block bg-[#C8551D]',
    statusStandby: 'w-2 h-2 shrink-0 inline-block bg-[#8A8F94]',
  },

  // Icon blueprint styling specs
  iconProps: {
    strokeWidth: 1.25, // Thin-stroke blueprint/technical style
    className: 'w-4 h-4',
  },
} as const;

export default DS;
