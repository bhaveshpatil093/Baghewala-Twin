/**
 * Economic & Energy Cost Models for Baghewala CSS-SRP Asset
 * Formation: Jodhpur Sandstone Heavy Oil (16-18° API)
 * Standard Tariffs:
 * - Industrial Grid Power: ₹7.20 / kWh ($0.086 / kWh)
 * - Steam Generation (CNG/Fuel + Water Softening): ₹1,420 / Tonne Steam ($17.00 / t)
 * - Workover Rig Dayrate & Parts: ₹14.50 Lakhs / Incident average
 * - Crude Benchmark (Heavy Discounted): $70.00 / bbl (₹5,850 / bbl)
 */

export interface WellEconomics {
  wellId: string;
  pad: string;
  oilRateBOPD: number;
  steamOilRatio: number; // m3 steam / m3 oil or bbl/bbl
  
  // 1. Energy Consumption per Barrel
  historicalEnergyKwhPerBbl: number;
  optimizedEnergyKwhPerBbl: number;
  energySavingsPct: number;

  // 2. Steam Cost per Cycle (in INR Lakhs & USD)
  steamTonnesPerCycle: number;
  historicalSteamCostLakhs: number;
  optimizedSteamCostLakhs: number;
  steamCostSavingsLakhs: number;
  steamCostUSD: number;

  // 3. Comparison Metrics (Historical vs Optimized)
  historicalAnnualOpexLakhs: number;
  optimizedAnnualOpexLakhs: number;
  annualSavingsLakhs: number;
  annualSavingsUSD: number;

  // Lifting Cost Breakdown per Barrel (₹/bbl)
  historicalLiftingCostPerBblINR: number;
  optimizedLiftingCostPerBblINR: number;

  // Savings Breakdown (in Lakhs INR / year)
  savingsBreakdown: {
    steamOptimizationLakhs: number;
    powerVfdSavingsLakhs: number;
    workoverAvoidanceLakhs: number;
    deferredProductionRecoveryLakhs: number;
  };

  // Operational Cycle Details
  cycleDays: number;
  mtbfImprovementDays: number; // e.g. +78 days
}

export const FIELD_ECONOMIC_SUMMARY = {
  activeWells: 35,
  grossFieldBOPD: 1845,
  averageSOR: 3.24, // m3 steam / m3 oil

  // Field Level Energy Consumption per Barrel
  historicalEnergyKwhPerBbl: 38.6,
  optimizedEnergyKwhPerBbl: 27.4,
  energySavingsPct: 29.0,

  // Field Steam Cost per Cycle (Fleet Average)
  steamTonnesPerCycleAvg: 1950,
  historicalSteamCostLakhsAvg: 28.4,
  optimizedSteamCostLakhsAvg: 21.6,
  steamCostSavingsLakhsAvg: 6.8,

  // Total Field Annual Financial Impact
  totalHistoricalAnnualOpexCrores: 34.8, // ₹34.8 Crores
  totalOptimizedAnnualOpexCrores: 26.2,  // ₹26.2 Crores
  totalAnnualSavingsCrores: 8.6,        // ₹8.60 Crores saved annually
  totalAnnualSavingsUSD: 1032000,       // $1.032M USD

  // Field-wide Lifting Cost (₹/bbl)
  historicalLiftingCostINR: 1940, // ₹1,940 / bbl
  optimizedLiftingCostINR: 1460,  // ₹1,460 / bbl
  liftingCostReductionPct: 24.7,

  // Annual Field Breakdown (in Crores INR)
  fieldSavingsBreakdown: {
    steamEfficiencyCrores: 3.85,
    powerVfdCrores: 1.65,
    workoverAvoidanceCrores: 2.10,
    productionRecoveryCrores: 1.00,
  },
};

export const WELL_ECONOMICS_DATABASE: Record<string, WellEconomics> = {
  'BGW-09': {
    wellId: 'BGW-09',
    pad: 'Pad-02',
    oilRateBOPD: 34,
    steamOilRatio: 4.12,
    historicalEnergyKwhPerBbl: 44.2,
    optimizedEnergyKwhPerBbl: 29.8,
    energySavingsPct: 32.6,
    steamTonnesPerCycle: 2200,
    historicalSteamCostLakhs: 31.2,
    optimizedSteamCostLakhs: 23.4,
    steamCostSavingsLakhs: 7.8,
    steamCostUSD: 28080,
    historicalAnnualOpexLakhs: 98.4,
    optimizedAnnualOpexLakhs: 69.8,
    annualSavingsLakhs: 28.6,
    annualSavingsUSD: 34320,
    historicalLiftingCostPerBblINR: 2380,
    optimizedLiftingCostPerBblINR: 1690,
    savingsBreakdown: {
      steamOptimizationLakhs: 12.4,
      powerVfdSavingsLakhs: 4.6,
      workoverAvoidanceLakhs: 8.2,
      deferredProductionRecoveryLakhs: 3.4,
    },
    cycleDays: 142,
    mtbfImprovementDays: 94,
  },
  'BGW-04': {
    wellId: 'BGW-04',
    pad: 'Pad-01',
    oilRateBOPD: 42,
    steamOilRatio: 3.85,
    historicalEnergyKwhPerBbl: 41.0,
    optimizedEnergyKwhPerBbl: 28.5,
    energySavingsPct: 30.5,
    steamTonnesPerCycle: 2050,
    historicalSteamCostLakhs: 29.5,
    optimizedSteamCostLakhs: 22.1,
    steamCostSavingsLakhs: 7.4,
    steamCostUSD: 26520,
    historicalAnnualOpexLakhs: 104.2,
    optimizedAnnualOpexLakhs: 75.4,
    annualSavingsLakhs: 28.8,
    annualSavingsUSD: 34560,
    historicalLiftingCostPerBblINR: 2210,
    optimizedLiftingCostPerBblINR: 1600,
    savingsBreakdown: {
      steamOptimizationLakhs: 13.0,
      powerVfdSavingsLakhs: 4.8,
      workoverAvoidanceLakhs: 7.5,
      deferredProductionRecoveryLakhs: 3.5,
    },
    cycleDays: 155,
    mtbfImprovementDays: 86,
  },
  'BGW-12': {
    wellId: 'BGW-12',
    pad: 'Pad-02',
    oilRateBOPD: 28,
    steamOilRatio: 4.45,
    historicalEnergyKwhPerBbl: 46.8,
    optimizedEnergyKwhPerBbl: 31.2,
    energySavingsPct: 33.3,
    steamTonnesPerCycle: 2300,
    historicalSteamCostLakhs: 32.8,
    optimizedSteamCostLakhs: 24.6,
    steamCostSavingsLakhs: 8.2,
    steamCostUSD: 29520,
    historicalAnnualOpexLakhs: 92.6,
    optimizedAnnualOpexLakhs: 66.2,
    annualSavingsLakhs: 26.4,
    annualSavingsUSD: 31680,
    historicalLiftingCostPerBblINR: 2490,
    optimizedLiftingCostPerBblINR: 1780,
    savingsBreakdown: {
      steamOptimizationLakhs: 11.8,
      powerVfdSavingsLakhs: 4.2,
      workoverAvoidanceLakhs: 7.2,
      deferredProductionRecoveryLakhs: 3.2,
    },
    cycleDays: 138,
    mtbfImprovementDays: 78,
  },
  'BGW-01': {
    wellId: 'BGW-01',
    pad: 'Pad-01',
    oilRateBOPD: 68,
    steamOilRatio: 2.65,
    historicalEnergyKwhPerBbl: 32.4,
    optimizedEnergyKwhPerBbl: 24.1,
    energySavingsPct: 25.6,
    steamTonnesPerCycle: 1750,
    historicalSteamCostLakhs: 24.8,
    optimizedSteamCostLakhs: 19.4,
    steamCostSavingsLakhs: 5.4,
    steamCostUSD: 23280,
    historicalAnnualOpexLakhs: 118.5,
    optimizedAnnualOpexLakhs: 91.2,
    annualSavingsLakhs: 27.3,
    annualSavingsUSD: 32760,
    historicalLiftingCostPerBblINR: 1590,
    optimizedLiftingCostPerBblINR: 1220,
    savingsBreakdown: {
      steamOptimizationLakhs: 12.1,
      powerVfdSavingsLakhs: 5.4,
      workoverAvoidanceLakhs: 6.2,
      deferredProductionRecoveryLakhs: 3.6,
    },
    cycleDays: 185,
    mtbfImprovementDays: 105,
  },
  'BGW-16': {
    wellId: 'BGW-16',
    pad: 'Pad-03',
    oilRateBOPD: 52,
    steamOilRatio: 3.10,
    historicalEnergyKwhPerBbl: 36.5,
    optimizedEnergyKwhPerBbl: 26.8,
    energySavingsPct: 26.6,
    steamTonnesPerCycle: 1850,
    historicalSteamCostLakhs: 26.5,
    optimizedSteamCostLakhs: 20.8,
    steamCostSavingsLakhs: 5.7,
    steamCostUSD: 24960,
    historicalAnnualOpexLakhs: 102.4,
    optimizedAnnualOpexLakhs: 78.5,
    annualSavingsLakhs: 23.9,
    annualSavingsUSD: 28680,
    historicalLiftingCostPerBblINR: 1740,
    optimizedLiftingCostPerBblINR: 1330,
    savingsBreakdown: {
      steamOptimizationLakhs: 10.5,
      powerVfdSavingsLakhs: 4.8,
      workoverAvoidanceLakhs: 5.6,
      deferredProductionRecoveryLakhs: 3.0,
    },
    cycleDays: 170,
    mtbfImprovementDays: 82,
  },
  'BGW-22': {
    wellId: 'BGW-22',
    pad: 'Pad-04',
    oilRateBOPD: 38,
    steamOilRatio: 3.90,
    historicalEnergyKwhPerBbl: 42.5,
    optimizedEnergyKwhPerBbl: 29.5,
    energySavingsPct: 30.6,
    steamTonnesPerCycle: 2000,
    historicalSteamCostLakhs: 28.6,
    optimizedSteamCostLakhs: 21.5,
    steamCostSavingsLakhs: 7.1,
    steamCostUSD: 25800,
    historicalAnnualOpexLakhs: 96.8,
    optimizedAnnualOpexLakhs: 71.4,
    annualSavingsLakhs: 25.4,
    annualSavingsUSD: 30480,
    historicalLiftingCostPerBblINR: 2260,
    optimizedLiftingCostPerBblINR: 1670,
    savingsBreakdown: {
      steamOptimizationLakhs: 11.2,
      powerVfdSavingsLakhs: 4.5,
      workoverAvoidanceLakhs: 6.8,
      deferredProductionRecoveryLakhs: 2.9,
    },
    cycleDays: 150,
    mtbfImprovementDays: 74,
  },
};

// Fallback generator for any well ID not in database
export const getWellEconomics = (wellId: string, pad: string = 'Pad-01', bopd: number = 40): WellEconomics => {
  if (WELL_ECONOMICS_DATABASE[wellId]) {
    return WELL_ECONOMICS_DATABASE[wellId];
  }

  // Realistic synthesized metrics
  const histEnergy = Number((38.0 + (bopd % 10) * 0.8).toFixed(1));
  const optEnergy = Number((histEnergy * 0.72).toFixed(1));
  const tonnes = 1900 + (bopd % 5) * 60;
  const histSteam = Number((tonnes * 0.0145).toFixed(1));
  const optSteam = Number((histSteam * 0.76).toFixed(1));
  const steamSav = Number((histSteam - optSteam).toFixed(1));
  const histOpex = Number((90.0 + (bopd % 15) * 1.5).toFixed(1));
  const optOpex = Number((histOpex * 0.73).toFixed(1));
  const annSavings = Number((histOpex - optOpex).toFixed(1));

  return {
    wellId,
    pad,
    oilRateBOPD: bopd,
    steamOilRatio: 3.4,
    historicalEnergyKwhPerBbl: histEnergy,
    optimizedEnergyKwhPerBbl: optEnergy,
    energySavingsPct: Number((((histEnergy - optEnergy) / histEnergy) * 100).toFixed(1)),
    steamTonnesPerCycle: tonnes,
    historicalSteamCostLakhs: histSteam,
    optimizedSteamCostLakhs: optSteam,
    steamCostSavingsLakhs: steamSav,
    steamCostUSD: Math.round(optSteam * 1200),
    historicalAnnualOpexLakhs: histOpex,
    optimizedAnnualOpexLakhs: optOpex,
    annualSavingsLakhs: annSavings,
    annualSavingsUSD: Math.round(annSavings * 1200),
    historicalLiftingCostPerBblINR: 2050,
    optimizedLiftingCostPerBblINR: 1520,
    savingsBreakdown: {
      steamOptimizationLakhs: Number((annSavings * 0.45).toFixed(1)),
      powerVfdSavingsLakhs: Number((annSavings * 0.18).toFixed(1)),
      workoverAvoidanceLakhs: Number((annSavings * 0.25).toFixed(1)),
      deferredProductionRecoveryLakhs: Number((annSavings * 0.12).toFixed(1)),
    },
    cycleDays: 160,
    mtbfImprovementDays: 80,
  };
};
