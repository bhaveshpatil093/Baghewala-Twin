export interface MaintenanceRecord {
  id: string; // e.g. "WO-2026-0814"
  date: string; // "2026-08-14"
  wellId: string; // "BGW-09"
  pad: string; // "Pad-02"
  failureType: 
    | 'Sucker Rod Parting'
    | 'Rod Buckling & Fatigue'
    | 'Pump Unseating / Stuck Plunger'
    | 'Traveling Valve Washout'
    | 'Standing Valve Jam'
    | 'Polished Rod Liner Wear'
    | 'Tubing Leak / Fluid Pound Shock';
  rootCause: string; // Fault-model classification
  downtimeHours: number; // e.g. 72.5
  costImpactINR: number; // In Indian Rupees Lakhs (e.g. 14.8 = ₹14.8 Lakhs)
  costImpactUSD: number; // Equivalent USD (e.g. $17,800)
  costBreakdown: {
    workoverRigINR: number;
    partsAndStringsINR: number;
    deferredOilProductionINR: number;
    lostBarrels: number;
  };
  workoverRigId: string; // e.g. "ONGC Rig Shivangi-IV"
  remedyAction: string; // Action taken
  cssCycle: number;
  category: 'ROD_FAILURE' | 'PUMP_UNSETTING' | 'SURFACE_MECHANICAL';
}

export interface MonthlyFailureFrequency {
  month: string; // "Oct '25", "Nov '25"
  rodFailures: number;
  pumpUnsettings: number;
  totalFailures: number;
}

export const MONTHLY_FAILURE_FREQUENCY: MonthlyFailureFrequency[] = [
  { month: "Oct '25", rodFailures: 2, pumpUnsettings: 1, totalFailures: 3 },
  { month: "Nov '25", rodFailures: 1, pumpUnsettings: 1, totalFailures: 2 },
  { month: "Dec '25", rodFailures: 3, pumpUnsettings: 0, totalFailures: 3 },
  { month: "Jan '26", rodFailures: 4, pumpUnsettings: 2, totalFailures: 6 },
  { month: "Feb '26", rodFailures: 2, pumpUnsettings: 1, totalFailures: 3 },
  { month: "Mar '26", rodFailures: 3, pumpUnsettings: 2, totalFailures: 5 },
  { month: "Apr '26", rodFailures: 1, pumpUnsettings: 1, totalFailures: 2 },
  { month: "May '26", rodFailures: 2, pumpUnsettings: 1, totalFailures: 3 },
  { month: "Jun '26", rodFailures: 4, pumpUnsettings: 2, totalFailures: 6 },
  { month: "Jul '26", rodFailures: 3, pumpUnsettings: 1, totalFailures: 4 },
  { month: "Aug '26", rodFailures: 2, pumpUnsettings: 2, totalFailures: 4 },
  { month: "Sep '26", rodFailures: 3, pumpUnsettings: 1, totalFailures: 4 },
];

export const INITIAL_MAINTENANCE_RECORDS: MaintenanceRecord[] = [
  {
    id: 'WO-2026-0918',
    date: '2026-09-18',
    wellId: 'BGW-09',
    pad: 'Pad-02',
    failureType: 'Rod Buckling & Fatigue',
    rootCause: 'Downstroke Viscous Compression (Viscosity > 1,600 cP at 112°C)',
    downtimeHours: 64.5,
    costImpactINR: 16.4,
    costImpactUSD: 19680,
    costBreakdown: {
      workoverRigINR: 6.8,
      partsAndStringsINR: 4.2,
      deferredOilProductionINR: 5.4,
      lostBarrels: 110,
    },
    workoverRigId: 'ONGC Workover Unit-07',
    remedyAction: 'Pulled sheared 7/8" Grade D rod string at 640m. Replaced 12 rod sections with high-strength sinker bars to enhance downstroke fall.',
    cssCycle: 2,
    category: 'ROD_FAILURE',
  },
  {
    id: 'WO-2026-0804',
    date: '2026-08-04',
    wellId: 'BGW-09',
    pad: 'Pad-02',
    failureType: 'Pump Unseating / Stuck Plunger',
    rootCause: 'Asphaltene & Bitumen Congelation in Barrel (BHT 108°C)',
    downtimeHours: 82.0,
    costImpactINR: 19.8,
    costImpactUSD: 23760,
    costBreakdown: {
      workoverRigINR: 8.5,
      partsAndStringsINR: 5.1,
      deferredOilProductionINR: 6.2,
      lostBarrels: 145,
    },
    workoverRigId: 'Shivangi Workover Rig-IV',
    remedyAction: 'Circulated 140°C light gas oil solvent to dissolve wax plug. Pulled insert pump; replaced scored chrome-plated plunger with spray-metal barrel.',
    cssCycle: 2,
    category: 'PUMP_UNSETTING',
  },
  {
    id: 'WO-2026-0612',
    date: '2026-06-12',
    wellId: 'BGW-09',
    pad: 'Pad-02',
    failureType: 'Sucker Rod Parting',
    rootCause: 'Corrosion Fatigue / H2S Embrittlement in Thermal Condensed Water',
    downtimeHours: 54.0,
    costImpactINR: 13.2,
    costImpactUSD: 15840,
    costBreakdown: {
      workoverRigINR: 5.6,
      partsAndStringsINR: 3.4,
      deferredOilProductionINR: 4.2,
      lostBarrels: 92,
    },
    workoverRigId: 'ONGC Workover Unit-07',
    remedyAction: 'Fished parted rod at 420m depth using overshot tool. Dosed continuous amine corrosion inhibitor down annulus.',
    cssCycle: 1,
    category: 'ROD_FAILURE',
  },
  {
    id: 'WO-2026-0722',
    date: '2026-07-22',
    wellId: 'BGW-04',
    pad: 'Pad-01',
    failureType: 'Traveling Valve Washout',
    rootCause: 'Abrasive Fine Sand & Silt Slurry Erosion (Jodhpur Formation Inflow)',
    downtimeHours: 48.0,
    costImpactINR: 11.5,
    costImpactUSD: 13800,
    costBreakdown: {
      workoverRigINR: 5.0,
      partsAndStringsINR: 2.8,
      deferredOilProductionINR: 3.7,
      lostBarrels: 80,
    },
    workoverRigId: 'ONGC Rig-12',
    remedyAction: 'Unseated insert pump; replaced eroded Stellite ball and seat with cobalt-tungsten alloy valve assembly.',
    cssCycle: 3,
    category: 'PUMP_UNSETTING',
  },
  {
    id: 'WO-2026-0518',
    date: '2026-05-18',
    wellId: 'BGW-04',
    pad: 'Pad-01',
    failureType: 'Sucker Rod Parting',
    rootCause: 'Cyclic Overload Tension from Heavy Bitumen Plug (PPRL > 27,800 lbs)',
    downtimeHours: 68.0,
    costImpactINR: 17.1,
    costImpactUSD: 20520,
    costBreakdown: {
      workoverRigINR: 7.2,
      partsAndStringsINR: 4.5,
      deferredOilProductionINR: 5.4,
      lostBarrels: 115,
    },
    workoverRigId: 'Shivangi Workover Rig-IV',
    remedyAction: 'Fished and replaced bottom 20 rods; upgraded VFD control parameter to limit max motor torque.',
    cssCycle: 2,
    category: 'ROD_FAILURE',
  },
  {
    id: 'WO-2026-0829',
    date: '2026-08-29',
    wellId: 'BGW-12',
    pad: 'Pad-02',
    failureType: 'Tubing Leak / Fluid Pound Shock',
    rootCause: 'Mechanical Fluid Pound Vibration at 52% Barrel Fillage',
    downtimeHours: 76.5,
    costImpactINR: 18.2,
    costImpactUSD: 21840,
    costBreakdown: {
      workoverRigINR: 7.9,
      partsAndStringsINR: 4.8,
      deferredOilProductionINR: 5.5,
      lostBarrels: 122,
    },
    workoverRigId: 'ONGC Workover Unit-07',
    remedyAction: 'Pressure tested tubing string to 3,000 psi; pulled 3 split tubing joints at 780m. Re-anchored tubing string with thermal anchor.',
    cssCycle: 2,
    category: 'ROD_FAILURE',
  },
  {
    id: 'WO-2026-0708',
    date: '2026-07-08',
    wellId: 'BGW-12',
    pad: 'Pad-02',
    failureType: 'Standing Valve Jam',
    rootCause: 'Heavy Tar Scale Accumulation on Standing Valve Ball Cage',
    downtimeHours: 42.0,
    costImpactINR: 9.8,
    costImpactUSD: 11760,
    costBreakdown: {
      workoverRigINR: 4.2,
      partsAndStringsINR: 2.4,
      deferredOilProductionINR: 3.2,
      lostBarrels: 68,
    },
    workoverRigId: 'ONGC Rig-12',
    remedyAction: 'Pumped hot condensate down tubing; unset pump and cleaned ball seat cage assembly in solvent bath.',
    cssCycle: 2,
    category: 'PUMP_UNSETTING',
  },
  {
    id: 'WO-2026-0414',
    date: '2026-04-14',
    wellId: 'BGW-16',
    pad: 'Pad-03',
    failureType: 'Polished Rod Liner Wear',
    rootCause: 'Viscous Packing Gland Friction & Sand Scorching in 46°C Ambience',
    downtimeHours: 18.0,
    costImpactINR: 4.6,
    costImpactUSD: 5520,
    costBreakdown: {
      workoverRigINR: 1.8,
      partsAndStringsINR: 1.6,
      deferredOilProductionINR: 1.2,
      lostBarrels: 28,
    },
    workoverRigId: 'Pad Maintenance Crew',
    remedyAction: 'Replaced 1-1/2" polished rod spray-metal liner; repacked stuffing box with high-temp Teflon cone packings.',
    cssCycle: 1,
    category: 'SURFACE_MECHANICAL',
  },
  {
    id: 'WO-2026-0628',
    date: '2026-06-28',
    wellId: 'BGW-07',
    pad: 'Pad-01',
    failureType: 'Traveling Valve Washout',
    rootCause: 'Severe Cavitation & Gas Interference Micro-Pitting',
    downtimeHours: 44.0,
    costImpactINR: 10.4,
    costImpactUSD: 12480,
    costBreakdown: {
      workoverRigINR: 4.6,
      partsAndStringsINR: 2.6,
      deferredOilProductionINR: 3.2,
      lostBarrels: 72,
    },
    workoverRigId: 'ONGC Rig-12',
    remedyAction: 'Swapped valve assembly to silicon nitride ceramic ball and carbide seat for gas-resistant seal.',
    cssCycle: 2,
    category: 'PUMP_UNSETTING',
  },
  {
    id: 'WO-2026-0305',
    date: '2026-03-05',
    wellId: 'BGW-22',
    pad: 'Pad-04',
    failureType: 'Sucker Rod Parting',
    rootCause: 'Fatigue Fracture at Pin Thread Undercut (Cycle Count 2.8M)',
    downtimeHours: 58.0,
    costImpactINR: 14.5,
    costImpactUSD: 17400,
    costBreakdown: {
      workoverRigINR: 6.2,
      partsAndStringsINR: 3.8,
      deferredOilProductionINR: 4.5,
      lostBarrels: 98,
    },
    workoverRigId: 'Shivangi Workover Rig-IV',
    remedyAction: 'Retrieved string; installed ultrasonic-inspected Grade KD rod section with rolled threads.',
    cssCycle: 3,
    category: 'ROD_FAILURE',
  },
  {
    id: 'WO-2025-1120',
    date: '2025-11-20',
    wellId: 'BGW-01',
    pad: 'Pad-01',
    failureType: 'Pump Unseating / Stuck Plunger',
    rootCause: 'Post-Soak Bitumen Emulsion Flash & Sand Deposition',
    downtimeHours: 50.0,
    costImpactINR: 12.0,
    costImpactUSD: 14400,
    costBreakdown: {
      workoverRigINR: 5.2,
      partsAndStringsINR: 3.1,
      deferredOilProductionINR: 3.7,
      lostBarrels: 82,
    },
    workoverRigId: 'ONGC Workover Unit-07',
    remedyAction: 'Chemical wash with xylene soak; replaced plunger and reset hold-down mandrel.',
    cssCycle: 3,
    category: 'PUMP_UNSETTING',
  },
];
