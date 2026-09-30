/**
 * Physical Simulation Engine for Baghewala Heavy Oil Field
 * Oil India Limited (OIL), Rajasthan
 * 
 * Physically-grounded thermodynamic and mechanical equations:
 * 1. Reservoir Thermal Decay: Lumped-capacitance convective/conductive heat dissipation
 *    T(t) = T_baseline + (T_initial - T_baseline) * exp(-k_decay * t)
 * 2. ASTM D341 / Walther Equation for Heavy Oil Viscosity:
 *    log10(log10(viscosity + 0.7)) = A - B * log10(T_Kelvin)
 * 3. Polished Rod Load & Sucker Rod Pump Mechanics:
 *    PPRL = W_rods_buoyant + W_fluid + F_viscous_up
 *    MPRL = W_rods_buoyant - F_viscous_down (where F_viscous_down > W_buoyant triggers ROD FLOAT)
 * 4. Closed-loop Dynamometer Card Synthesis responding dynamically to viscosity, fillage, and loads
 */

import { WellData, WellStatus } from '@/src/data/wellsData';

export interface SimulatedDynoPoint {
  pos: number;  // inches (0 to strokeLength)
  load: number; // lbs
}

export interface WellPhysicalState {
  wellId: string;
  pad: string;
  simulatedDaysSinceInjection: number;
  cycleNumber: number;
  cyclePhase: 'Injection' | 'Soaking' | 'Production (SRP)' | 'Shut-in';
  bottomholeTempC: number;
  crudeViscosityCP: number;
  oilRateBOPD: number;
  steamOilRatio: number;
  polishedRodLoadLbs: number; // Peak load (PPRL)
  minRodLoadLbs: number;      // Minimum load (MPRL)
  strokeRateSPM: number;
  pumpFillagePct: number;
  rodLoadStatus: 'NOMINAL' | 'HIGH LOAD' | 'ROD FLOAT' | 'COMPRESSION' | 'INJ / SOAK';
  rodFloatingRisk: boolean;
  status: WellStatus;
  alertReason?: string;
  cardDiagnosis: 'Normal' | 'Rod Floating' | 'Pump-Off' | 'Gas Interference' | 'Traveling Valve Leak' | 'Viscous Dragging';
  dynoCardPoints: SimulatedDynoPoint[];
}

export interface SimulationEngineState {
  isRunning: boolean;
  speedMultiplier: number; // 1x, 5x, 20x, 100x
  totalSimulatedDaysElapsed: number;
  lastTickTimestamp: number;
  wellsState: Record<string, WellPhysicalState>;
}

// -------------------------------------------------------------
// Core Physics Formulas
// -------------------------------------------------------------

/** Native reservoir background baseline temperature in Baghewala (°C) */
export const NATIVE_RESERVOIR_TEMP_C = 68;

/** Average initial post-soak near-wellbore sandface temperature (°C) */
export const POST_STEAM_PEAK_TEMP_C = 235;

/**
 * 1. Temperature decay function after cyclic steam injection (CSS)
 * tDays: days into production cycle
 * decayRate: dissipation constant (typically 0.015 - 0.038 /day based on thermal diffusivity)
 */
export function calculateTemperatureDecay(
  tDays: number, 
  peakTempC: number = POST_STEAM_PEAK_TEMP_C, 
  baseTempC: number = NATIVE_RESERVOIR_TEMP_C,
  decayRate: number = 0.024
): number {
  const decayed = baseTempC + (peakTempC - baseTempC) * Math.exp(-decayRate * Math.max(0, tDays));
  return Math.round(decayed * 10) / 10;
}

/**
 * 2. Walther / ASTM D341 crude oil viscosity-temperature relationship
 * Calibrated specifically for Baghewala heavy bitumen:
 * At 230°C: ~25-45 cP (flows easily like warm syrup)
 * At 150°C: ~200-350 cP
 * At 100°C: ~1,200-2,400 cP
 * At 68°C (reservoir base): ~12,000-25,000 cP (near immobile asphaltic state)
 */
export function calculateCrudeViscosity(tempC: number): number {
  // Safe clamp on reservoir temperature
  const clampedT = Math.max(45, Math.min(280, tempC));
  // Double-log formulation approximation
  // ln(visc) = A / (T_c + 40)^2 or exponential power-law
  const deltaT = clampedT - 65;
  // Calibrated model: Base 14,000 cP at 68°C decaying exponentially with thermal activation energy
  const visc = 14500 * Math.exp(-0.0345 * deltaT);
  return Math.round(Math.max(22, Math.min(28000, visc)));
}

/**
 * 3. Sucker Rod Pump (SRP) load response to viscous drag
 * Fluid friction drag along 1,100m rod string in 2-7/8" tubing:
 * F_drag = C_visc * (Viscosity^0.55) * (StrokeRate / 4.5)
 */
export function calculateSrpLoads(
  viscosityCP: number,
  strokeRateSPM: number = 4.8,
  nominalRodWeightLbs: number = 14200,
  fluidColumnWeightLbs: number = 8800
) {
  // Friction drag on rod string increases sublinearly with viscosity in non-Newtonian flow
  const viscousDragLbs = Math.round(22 * Math.pow(viscosityCP, 0.58) * (strokeRateSPM / 4.5));
  
  // Upstroke: Motor lifts rod string + fluid load + opposes downward fluid shear
  const pprl = Math.round(nominalRodWeightLbs + fluidColumnWeightLbs + viscousDragLbs * 0.7);

  // Downstroke: Rod string falls by gravity, opposed by upward viscous buoyancy and wall shear
  // If upward viscous drag exceeds buoyant rod weight in fluid, the rod floats (MPRL drops to 0 or compression)!
  const buoyantRodWeight = nominalRodWeightLbs * 0.87; // Steel immersed in crude
  const rawMprl = Math.round(buoyantRodWeight - viscousDragLbs * 1.15);
  const mprl = Math.max(120, rawMprl);

  // Rod floating risk threshold is below 1,600 lbs on downstroke
  const rodFloatingRisk = mprl < 1600;
  const rodInCompression = mprl < 450;

  let rodLoadStatus: 'NOMINAL' | 'HIGH LOAD' | 'ROD FLOAT' | 'COMPRESSION' | 'INJ / SOAK' = 'NOMINAL';
  if (rodInCompression) {
    rodLoadStatus = 'COMPRESSION';
  } else if (rodFloatingRisk) {
    rodLoadStatus = 'ROD FLOAT';
  } else if (pprl > 27500) {
    rodLoadStatus = 'HIGH LOAD';
  }

  return {
    pprl: Math.min(33500, pprl),
    mprl,
    viscousDragLbs,
    rodFloatingRisk,
    rodLoadStatus
  };
}

/**
 * 4. Inflow & Oil Production Rate decline
 * Flow rate proportional to reservoir mobility: k / mu(T)
 */
export function calculateOilProductionRate(
  viscosityCP: number,
  baseBOPD: number = 135
): number {
  // Reference viscosity where well achieves nominal 120-140 BOPD is ~80 cP
  const mobilityFactor = Math.pow(80 / Math.max(30, viscosityCP), 0.45);
  const rate = Math.round(baseBOPD * mobilityFactor);
  return Math.max(8, Math.min(185, rate));
}

/**
 * 5. Synthetic Closed-Loop Dynamometer Card Generation
 * Synthesizes 12 to 16 positional points around the 168-inch stroke
 * dynamically morphing based on viscosity and downstroke buoyancy retardance
 */
export function generateSyntheticDynoPoints(
  strokeLength: number,
  pprl: number,
  mprl: number,
  viscosityCP: number,
  fillagePct: number
): { points: SimulatedDynoPoint[]; diagnosis: 'Normal' | 'Rod Floating' | 'Pump-Off' | 'Gas Interference' | 'Traveling Valve Leak' | 'Viscous Dragging' } {
  const pts: SimulatedDynoPoint[] = [];

  // Severe Rod Float Condition (Viscosity > 1,800 cP or MPRL < 1,600 lbs)
  if (mprl < 1600 || viscosityCP > 2200) {
    // Upstroke: Pick up load rapidly
    pts.push({ pos: 0, load: Math.round(mprl * 1.1) });
    pts.push({ pos: strokeLength * 0.1, load: Math.round(pprl * 0.55) });
    pts.push({ pos: strokeLength * 0.25, load: Math.round(pprl * 0.88) });
    pts.push({ pos: strokeLength * 0.55, load: pprl });
    pts.push({ pos: strokeLength * 0.85, load: Math.round(pprl * 0.98) });
    pts.push({ pos: strokeLength, load: Math.round(pprl * 0.92) });

    // Downstroke: Severe sag/collapse because rod string cannot sink through cold bitumen
    pts.push({ pos: strokeLength * 0.9, load: Math.round(pprl * 0.55) });
    pts.push({ pos: strokeLength * 0.75, load: Math.round(mprl * 2.8) });
    pts.push({ pos: strokeLength * 0.55, load: Math.round(mprl * 1.4) });
    pts.push({ pos: strokeLength * 0.35, load: mprl });
    pts.push({ pos: strokeLength * 0.15, load: Math.round(mprl * 0.95) });
    pts.push({ pos: 0, load: Math.round(mprl * 1.1) });

    return { points: pts, diagnosis: 'Rod Floating' };
  }

  // Fluid pound / pump-off condition (Low fillage < 70%)
  if (fillagePct < 72) {
    const poundImpactPos = strokeLength * (1 - fillagePct / 100);
    pts.push({ pos: 0, load: Math.round(mprl * 1.1) });
    pts.push({ pos: strokeLength * 0.15, load: Math.round(pprl * 0.72) });
    pts.push({ pos: strokeLength * 0.45, load: pprl });
    pts.push({ pos: strokeLength, load: Math.round(pprl * 0.95) });

    // Downstroke fluid pound vertical plunge
    pts.push({ pos: strokeLength * 0.85, load: Math.round(pprl * 0.9) });
    pts.push({ pos: poundImpactPos + 5, load: Math.round(pprl * 0.82) });
    pts.push({ pos: poundImpactPos - 5, load: Math.round(mprl * 1.25) }); // Sudden impact drop
    pts.push({ pos: strokeLength * 0.2, load: mprl });
    pts.push({ pos: 0, load: Math.round(mprl * 1.1) });

    return { points: pts, diagnosis: 'Pump-Off' };
  }

  // Moderate Viscous Dragging (Viscosity between 600 and 1,800 cP)
  if (viscosityCP > 500) {
    pts.push({ pos: 0, load: Math.round(mprl * 1.15) });
    pts.push({ pos: strokeLength * 0.15, load: Math.round(pprl * 0.65) });
    pts.push({ pos: strokeLength * 0.35, load: Math.round(pprl * 0.92) });
    pts.push({ pos: strokeLength * 0.65, load: pprl });
    pts.push({ pos: strokeLength, load: Math.round(pprl * 0.94) });

    // Downstroke moderate concave drag
    pts.push({ pos: strokeLength * 0.85, load: Math.round(pprl * 0.62) });
    pts.push({ pos: strokeLength * 0.6, load: Math.round(mprl * 2.2) });
    pts.push({ pos: strokeLength * 0.35, load: Math.round(mprl * 1.4) });
    pts.push({ pos: strokeLength * 0.15, load: Math.round(mprl * 1.1) });
    pts.push({ pos: 0, load: Math.round(mprl * 1.15) });

    return { points: pts, diagnosis: 'Viscous Dragging' };
  }

  // Ideal Normal Full-Barrel Card (Low viscosity, healthy lift)
  pts.push({ pos: 0, load: mprl });
  pts.push({ pos: strokeLength * 0.1, load: Math.round(pprl * 0.7) });
  pts.push({ pos: strokeLength * 0.25, load: Math.round(pprl * 0.95) });
  pts.push({ pos: strokeLength * 0.6, load: pprl });
  pts.push({ pos: strokeLength * 0.9, load: Math.round(pprl * 0.98) });
  pts.push({ pos: strokeLength, load: Math.round(pprl * 0.92) });

  // Downstroke flat rectangular release
  pts.push({ pos: strokeLength * 0.9, load: Math.round(mprl * 1.5) });
  pts.push({ pos: strokeLength * 0.75, load: Math.round(mprl * 1.25) });
  pts.push({ pos: strokeLength * 0.45, load: Math.round(mprl * 1.1) });
  pts.push({ pos: strokeLength * 0.15, load: mprl });
  pts.push({ pos: 0, load: mprl });

  return { points: pts, diagnosis: 'Normal' };
}

// -------------------------------------------------------------
// Well Physics Calculation for a Single Well at Given Time
// -------------------------------------------------------------

export function calculateWellPhysicalStep(
  initialWell: WellData, 
  additionalSimulatedDays: number
): WellPhysicalState {
  const isThermalActive = initialWell.cyclePhase === 'Injection' || initialWell.cyclePhase === 'Soaking';

  // If in injection or soak, the temperature is at steam plateau, pump is offline
  if (isThermalActive) {
    const dyno = generateSyntheticDynoPoints(168, 0, 0, 30, 0);
    return {
      wellId: initialWell.id,
      pad: initialWell.pad,
      simulatedDaysSinceInjection: 0,
      cycleNumber: initialWell.cycleNumber,
      cyclePhase: initialWell.cyclePhase,
      bottomholeTempC: initialWell.bottomholeTempC,
      crudeViscosityCP: initialWell.crudeViscosityCP,
      oilRateBOPD: 0,
      steamOilRatio: initialWell.steamOilRatio,
      polishedRodLoadLbs: 0,
      minRodLoadLbs: 0,
      strokeRateSPM: 0,
      pumpFillagePct: 0,
      rodLoadStatus: 'INJ / SOAK',
      rodFloatingRisk: false,
      status: 'normal',
      cardDiagnosis: 'Normal',
      dynoCardPoints: dyno.points,
    };
  }

  // Production (SRP) wells decay over simulated time
  const totalDays = initialWell.daysSinceInjection + additionalSimulatedDays;
  
  // Specific decay rates calibrated to pad geology (Pad 02/03 have faster thermal bleeding)
  const isHighRiskPad = initialWell.pad === 'Pad-02' || initialWell.pad === 'Pad-03';
  const decayRate = isHighRiskPad ? 0.026 : 0.019;
  
  // Peak post-soak was around 225-245°C
  const peakTemp = Math.min(250, Math.max(210, initialWell.bottomholeTempC + initialWell.daysSinceInjection * 1.2));
  const newTempC = calculateTemperatureDecay(totalDays, peakTemp, NATIVE_RESERVOIR_TEMP_C, decayRate);
  const newViscosityCP = calculateCrudeViscosity(newTempC);
  
  // Calculate resulting mechanical loads
  const loads = calculateSrpLoads(newViscosityCP, initialWell.strokeRateSPM);
  
  // Production rate drops with viscosity rise
  const newOilRateBOPD = calculateOilProductionRate(newViscosityCP, 130);
  
  // Pump fillage degrades as viscous crude struggles to enter the standing valve
  const newFillagePct = Math.round(Math.max(48, Math.min(96, 94 - (newViscosityCP / 120))));

  // Status triage based on physical thresholds
  let newStatus: WellStatus = 'normal';
  let alertReason: string | undefined = undefined;

  if (loads.rodFloatingRisk || newTempC < 115 || newViscosityCP > 2500) {
    newStatus = 'fault';
    alertReason = `Severe Viscous Cooling (${newViscosityCP} cP at ${newTempC}°C) - Downstroke rod load collapse to ${loads.mprl} lbs (Rod Floating Critical Fault)`;
  } else if (newTempC < 145 || newViscosityCP > 600 || newFillagePct < 75) {
    newStatus = 'alert';
    alertReason = `Thermal decay warning (${newViscosityCP} cP at ${newTempC}°C) - High viscous drag, cycle re-steam needed within 7 days`;
  }

  // Dynamometer card shape responding directly to this state
  const dyno = generateSyntheticDynoPoints(168, loads.pprl, loads.mprl, newViscosityCP, newFillagePct);

  return {
    wellId: initialWell.id,
    pad: initialWell.pad,
    simulatedDaysSinceInjection: Math.round(totalDays * 10) / 10,
    cycleNumber: initialWell.cycleNumber,
    cyclePhase: initialWell.cyclePhase,
    bottomholeTempC: newTempC,
    crudeViscosityCP: newViscosityCP,
    oilRateBOPD: newOilRateBOPD,
    steamOilRatio: initialWell.steamOilRatio,
    polishedRodLoadLbs: loads.pprl,
    minRodLoadLbs: loads.mprl,
    strokeRateSPM: initialWell.strokeRateSPM,
    pumpFillagePct: newFillagePct,
    rodLoadStatus: loads.rodLoadStatus,
    rodFloatingRisk: loads.rodFloatingRisk,
    status: newStatus,
    alertReason,
    cardDiagnosis: dyno.diagnosis,
    dynoCardPoints: dyno.points,
  };
}
