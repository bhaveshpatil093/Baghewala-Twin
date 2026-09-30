export interface DailyDataPoint {
  date: string; // "YYYY-MM-DD"
  displayDate: string; // "14 Sep '26" or "Sep 14"
  oilRateBOPD: number; // Daily oil production rate (e.g. 1,845 BOPD field-wide or 34 BOPD for BGW-09)
  waterCutPct: number;
  steamOilRatio: number; // SOR (e.g. 2.4 - 4.8)
  energyKwhPerBbl: number; // Energy per barrel (e.g. 22 - 46 kWh/bbl)
  rodFailureCount: number; // 0 or 1+ failure events on this day
  rodFailureWell?: string; // well ID if failure occurred
  rodFailureDetails?: string; // description
  cyclePhase?: 'INJECTION' | 'SOAK' | 'EARLY_PROD' | 'LATE_PROD';
}

export interface WellHistoricalData {
  wellId: string;
  pad: string;
  data: DailyDataPoint[];
}

// Generate realistic 730-day time series from Oct 1, 2024 to Sep 27, 2026
export function generateHistoricalTimeSeries(
  targetWellId: string = 'FIELD',
  days: number = 365
): DailyDataPoint[] {
  const points: DailyDataPoint[] = [];
  const endDate = new Date('2026-09-27T00:00:00Z');
  
  // Specific seed offsets depending on well
  const isField = targetWellId === 'FIELD';
  const baseOil = isField ? 1820 : (targetWellId === 'BGW-01' ? 68 : targetWellId === 'BGW-04' ? 42 : 34);
  const baseSor = isField ? 3.2 : (targetWellId === 'BGW-09' ? 4.1 : 3.0);
  const baseEnergy = isField ? 28.5 : (targetWellId === 'BGW-09' ? 36.2 : 26.8);

  // Failure event anchors (relative day offsets from end date)
  // These correlate with the real maintenance logs and alerts
  const failureOffsets: Record<number, { well: string; details: string; count: number }> = {
    9: { well: 'BGW-09', details: 'Rod Buckling & Fatigue (Viscous Drag > 1,600 cP)', count: 1 },
    54: { well: 'BGW-09', details: 'Pump Unseating / Stuck Plunger in Asphaltene', count: 1 },
    67: { well: 'BGW-04', details: 'Traveling Valve Erosion from Sand Inflow', count: 1 },
    107: { well: 'BGW-09', details: 'Sucker Rod Parting at 420m (H2S Embrittlement)', count: 1 },
    132: { well: 'BGW-04', details: 'Cyclic Overload Tension from Heavy Bitumen', count: 1 },
    192: { well: 'BGW-16', details: 'Polished Rod Liner Wear & Packing Leak', count: 1 },
    206: { well: 'BGW-22', details: 'Pin Thread Fatigue Fracture at 680m', count: 1 },
    260: { well: 'BGW-12', details: 'Standing Valve Tar Scale Accumulation', count: 1 },
    311: { well: 'BGW-01', details: 'Pump Stuck Post-Soak Emulsion Flash', count: 1 },
  };

  for (let i = days - 1; i >= 0; i--) {
    const curDate = new Date(endDate);
    curDate.setDate(curDate.getDate() - i);
    const dateStr = curDate.toISOString().slice(0, 10);
    const displayDate = curDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    // Cyclic thermal wave pattern: CSS cycles last ~150-180 days
    const cyclePhaseProgress = (i % 160) / 160; // 0 to 1
    
    // Thermal production surge immediately after soak, then decay
    let thermalMultiplier = 1.0;
    let sorValue = baseSor;
    let phase: 'INJECTION' | 'SOAK' | 'EARLY_PROD' | 'LATE_PROD' = 'EARLY_PROD';

    if (cyclePhaseProgress < 0.08) {
      phase = 'INJECTION';
      thermalMultiplier = 0.15; // Shut in or low injection return
      sorValue = baseSor * 1.8;
    } else if (cyclePhaseProgress < 0.14) {
      phase = 'SOAK';
      thermalMultiplier = 0.25;
      sorValue = baseSor * 1.5;
    } else if (cyclePhaseProgress < 0.50) {
      phase = 'EARLY_PROD';
      thermalMultiplier = 1.35 - (cyclePhaseProgress - 0.14) * 0.8; // Peak flush oil
      sorValue = baseSor * 0.75 + Math.sin(i * 0.2) * 0.15;
    } else {
      phase = 'LATE_PROD';
      thermalMultiplier = 0.85 - (cyclePhaseProgress - 0.50) * 0.45; // Viscosity builds back up
      sorValue = baseSor * 1.25 + Math.sin(i * 0.15) * 0.2;
    }

    // Daily noise & seasonal temperature shift
    const noise = Math.sin(i * 0.35) * 0.05 + Math.cos(i * 0.12) * 0.03;
    const oilRate = Math.max(isField ? 600 : 8, Math.round(baseOil * thermalMultiplier * (1 + noise)));

    // Energy per barrel increases as wellbore cools and crude viscosity rises
    const coolingPenalty = phase === 'LATE_PROD' ? 8.5 * (cyclePhaseProgress - 0.5) : 0;
    const energyKwh = Number((baseEnergy + coolingPenalty + Math.cos(i * 0.25) * 2.2).toFixed(1));

    // Water cut
    const waterCut = Math.min(88, Math.max(38, Math.round(52 + Math.sin(i * 0.08) * 12 + (phase === 'EARLY_PROD' ? 18 : 0))));

    // Rod failure event on this day?
    const failureEvent = failureOffsets[i];
    let failureCount = 0;
    let failureWell: string | undefined = undefined;
    let failureDetails: string | undefined = undefined;

    if (failureEvent) {
      if (isField || failureEvent.well === targetWellId) {
        failureCount = failureEvent.count;
        failureWell = failureEvent.well;
        failureDetails = failureEvent.details;
      }
    }

    points.push({
      date: dateStr,
      displayDate,
      oilRateBOPD: oilRate,
      waterCutPct: waterCut,
      steamOilRatio: Number(Math.max(1.2, sorValue).toFixed(2)),
      energyKwhPerBbl: Math.max(12, energyKwh),
      rodFailureCount: failureCount,
      rodFailureWell: failureWell,
      rodFailureDetails: failureDetails,
      cyclePhase: phase,
    });
  }

  return points;
}
