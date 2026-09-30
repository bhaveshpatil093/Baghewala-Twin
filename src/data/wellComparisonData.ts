import { BAGHEWALA_WELLS, WellData } from './wellsData';

export interface WellTimeSeriesPoint {
  day: number;
  oilRateBOPD: number;
  steamOilRatio: number;
  bottomholeTempC: number;
  peakRodLoadLbs: number;
  minRodLoadLbs: number;
}

export interface WellComparisonSeries {
  well: WellData;
  timeSeries: WellTimeSeriesPoint[];
}

// Generate realistic 30-day time series data for any well based on its CSS & SRP physics
export function getWellComparisonSeries(wellId: string): WellComparisonSeries {
  const well = BAGHEWALA_WELLS.find(w => w.id === wellId) || BAGHEWALA_WELLS[0];
  const days = 30;
  const timeSeries: WellTimeSeriesPoint[] = [];

  // Determine physics baseline for this well
  const initialTemp = Math.min(255, Math.max(220, well.reservoirTempC + (well.daysSinceInjection * 1.5)));
  const baseTemp = 75; // Pre-steam baseline reservoir temp of Jodhpur formation
  const coolingRate = well.rodFloatingRisk ? 0.038 : 0.022; // Flagged wells cool faster
  
  const peakProd = well.cyclePhase === 'Injection' || well.cyclePhase === 'Soaking' 
    ? 0 
    : Math.max(20, well.oilRateBOPD * 1.35);

  const baseSOR = well.steamOilRatio;

  for (let d = 0; d <= days; d += 2) {
    // Temperature decay formula: T(t) = T_base + (T_init - T_base) * exp(-coolingRate * (d + offset))
    const effectiveDay = Math.max(0, well.daysSinceInjection - (days - d));
    const temp = Math.round(baseTemp + (initialTemp - baseTemp) * Math.exp(-coolingRate * effectiveDay));
    
    // Viscosity as exponential function of temperature
    // mu(T) = A * exp(B / (T + 273))
    const viscosity = Math.round(5000 * Math.exp(-0.028 * (temp - 75)));

    // Oil rate correlates inversely with viscosity post-soak
    let prod = 0;
    if (well.cyclePhase !== 'Injection' && well.cyclePhase !== 'Soaking') {
      const prodDecay = Math.exp(-0.018 * effectiveDay);
      prod = Math.round(Math.max(10, peakProd * prodDecay));
    }

    // SOR slowly increases as production declines against cumulative steam
    const sorDrift = 1 + (effectiveDay * 0.008);
    const sor = Number((baseSOR * sorDrift).toFixed(2));

    // Rod loading: higher viscosity increases both peak load (upstroke fluid friction)
    // and decreases min load (downstroke rod drag / floating!)
    const peakLoad = well.strokeRateSPM > 0 
      ? Math.round(16000 + (viscosity * 4.5)) 
      : 0;

    const minLoad = well.strokeRateSPM > 0
      ? Math.max(200, Math.round(5500 - (viscosity * 4.8)))
      : 0;

    timeSeries.push({
      day: d,
      oilRateBOPD: prod,
      steamOilRatio: sor,
      bottomholeTempC: temp,
      peakRodLoadLbs: Math.min(25000, peakLoad),
      minRodLoadLbs: Math.max(200, minLoad),
    });
  }

  return {
    well,
    timeSeries,
  };
}

// Shared Y-Axis Scales across all compared wells (Fixed bounds so visually comparable at a glance)
export const COMPARISON_SCALES = {
  production: {
    min: 0,
    max: 150,
    unit: 'BOPD',
    ticks: [0, 50, 100, 150],
  },
  sor: {
    min: 1.0,
    max: 6.0,
    unit: 'm³/m³',
    ticks: [1.0, 2.5, 4.0, 5.5],
  },
  temperature: {
    min: 60,
    max: 260,
    unit: '°C',
    ticks: [80, 140, 200, 260],
  },
  rodLoad: {
    min: 0,
    max: 26000,
    unit: 'lbs',
    ticks: [0, 8000, 16000, 24000],
  },
} as const;
