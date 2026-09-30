import React, { useState, useMemo } from 'react';
import { WellData } from '@/src/data/wellsData';
import { Activity, Clock, ZoomIn, Eye, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import LastUpdatedBadge from '@/src/components/shared/LastUpdatedBadge';
import { generateSyntheticDynoPoints } from '@/src/data/simulationEngine';

interface DynacardPoint {
  pos: number; // inches (0 to 168)
  load: number; // lbs (0 to 32,000)
}

export type FaultClassificationType = 
  | 'Normal'
  | 'Rod Floating'
  | 'Pump-Off'
  | 'Gas Interference'
  | 'Traveling Valve Leak';

interface HistoricalCard {
  id: string;
  label: string;
  sub: string;
  pprl: number;
  mprl: number;
  fillagePct: number;
  classification: FaultClassificationType;
  statusLevel: 'normal' | 'warning' | 'fault';
  confidencePct: number;
  shapeExplanation: string;
  points: DynacardPoint[];
}

interface DynamometerCardPanelProps {
  well: WellData;
}

export const DynamometerCardPanel: React.FC<DynamometerCardPanelProps> = ({ well }) => {
  const [selectedCardId, setSelectedCardId] = useState<string>('c-now');
  const [overrideArchetype, setOverrideArchetype] = useState<FaultClassificationType | null>(null);
  const [loadJitter, setLoadJitter] = useState<number>(0);
  const [isDynoPollingFlash, setIsDynoPollingFlash] = useState<boolean>(false);

  const handleDynoRefresh = () => {
    setIsDynoPollingFlash(true);
    setLoadJitter((Math.random() - 0.5) * 55);
    setTimeout(() => {
      setIsDynoPollingFlash(false);
    }, 450);
  };

  const strokeLength = 168; // 168 inches
  const isVirginWell = well.cycleNumber <= 0;
  const isParkedOrVirgin = isVirginWell || well.cyclePhase === 'Shut-in' || well.strokeRateSPM === 0;
  const isRodFloat = !isParkedOrVirgin && (well.rodFloatingRisk || well.status === 'fault');
  const livePPRL = isParkedOrVirgin 
    ? (well.polishedRodLoadLbs > 0 ? well.polishedRodLoadLbs : 14200) 
    : Math.round((well.polishedRodLoadLbs > 0 ? well.polishedRodLoadLbs : 24800) + loadJitter);
  const liveMPRL = isParkedOrVirgin 
    ? (well.minRodLoadLbs > 0 ? well.minRodLoadLbs : 4800) 
    : Math.round(Math.max(120, (well.minRodLoadLbs > 0 ? well.minRodLoadLbs : 840) + loadJitter * 0.4));

  // Generate current surface dynacard closed-loop profile
  const generateCardPoints = (type: 'normal' | 'fluid-pound' | 'rod-float' | 'intermediate' | 'gas-interference' | 'valve-leak'): DynacardPoint[] => {
    const pts: DynacardPoint[] = [];

    if (type === 'rod-float') {
      // Severe viscous drag & rod floating: Downstroke load drops dangerously low (almost flatlines < 1,000 lbs)
      pts.push({ pos: 0, load: 1200 });
      pts.push({ pos: 12, load: 8400 });
      pts.push({ pos: 28, load: 19500 });
      pts.push({ pos: 50, load: 24200 });
      pts.push({ pos: 90, load: 26100 });
      pts.push({ pos: 130, load: 25800 });
      pts.push({ pos: 155, load: 25100 });
      pts.push({ pos: 168, load: 23400 });
      // Downstroke (delayed rod fall, fluid friction drags rod, severe depression)
      pts.push({ pos: 155, load: 14200 });
      pts.push({ pos: 135, load: 7100 });
      pts.push({ pos: 110, load: 2400 });
      pts.push({ pos: 80, load: 950 });
      pts.push({ pos: 50, load: 820 });
      pts.push({ pos: 20, load: 840 });
      pts.push({ pos: 0, load: 1200 });
    } else if (type === 'fluid-pound') {
      // Fluid pound: sharp drop in middle of downstroke when plunger hits liquid level
      pts.push({ pos: 0, load: 4500 });
      pts.push({ pos: 15, load: 12000 });
      pts.push({ pos: 35, load: 22000 });
      pts.push({ pos: 75, load: 24500 });
      pts.push({ pos: 120, load: 24800 });
      pts.push({ pos: 168, load: 23900 });
      // Downstroke with sharp pound drop at mid-stroke (~80")
      pts.push({ pos: 150, load: 22100 });
      pts.push({ pos: 110, load: 21500 });
      pts.push({ pos: 80, load: 6200 }); // Sudden impact drop
      pts.push({ pos: 50, load: 5100 });
      pts.push({ pos: 20, load: 4800 });
      pts.push({ pos: 0, load: 4500 });
    } else if (type === 'gas-interference') {
      // Gas interference: classic S-shaped concave expansion on downstroke
      pts.push({ pos: 0, load: 5200 });
      pts.push({ pos: 18, load: 14200 });
      pts.push({ pos: 42, load: 22400 });
      pts.push({ pos: 90, load: 24800 });
      pts.push({ pos: 140, load: 24900 });
      pts.push({ pos: 168, load: 23600 });
      // Downstroke: gradual convex/concave slope as gas expands before liquid contact
      pts.push({ pos: 150, load: 21800 });
      pts.push({ pos: 125, load: 18200 });
      pts.push({ pos: 95, load: 13400 });
      pts.push({ pos: 60, load: 8600 });
      pts.push({ pos: 25, load: 5600 });
      pts.push({ pos: 0, load: 5200 });
    } else if (type === 'valve-leak') {
      // Traveling valve leak: rounded bottom-right corner and delayed load transfer
      pts.push({ pos: 0, load: 5800 });
      pts.push({ pos: 20, load: 15200 });
      pts.push({ pos: 50, load: 23100 });
      pts.push({ pos: 100, load: 24600 });
      pts.push({ pos: 145, load: 24400 });
      pts.push({ pos: 168, load: 23200 });
      // Rounded bottom right slope
      pts.push({ pos: 155, load: 19800 });
      pts.push({ pos: 135, load: 16400 });
      pts.push({ pos: 105, load: 12800 });
      pts.push({ pos: 70, load: 9200 });
      pts.push({ pos: 30, load: 6800 });
      pts.push({ pos: 0, load: 5800 });
    } else if (type === 'intermediate') {
      // Beginning of cooling / moderate viscosity drag
      pts.push({ pos: 0, load: 3800 });
      pts.push({ pos: 18, load: 14000 });
      pts.push({ pos: 40, load: 22800 });
      pts.push({ pos: 85, load: 24600 });
      pts.push({ pos: 130, load: 24900 });
      pts.push({ pos: 168, load: 23800 });
      pts.push({ pos: 150, load: 16200 });
      pts.push({ pos: 120, load: 11400 });
      pts.push({ pos: 80, load: 5800 });
      pts.push({ pos: 40, load: 3600 });
      pts.push({ pos: 15, load: 3200 });
      pts.push({ pos: 0, load: 3800 });
    } else {
      // Normal full-barrel pump card (near-ideal parallelogram)
      pts.push({ pos: 0, load: 6200 });
      pts.push({ pos: 15, load: 16500 });
      pts.push({ pos: 35, load: 23400 });
      pts.push({ pos: 85, load: 24200 });
      pts.push({ pos: 135, load: 24500 });
      pts.push({ pos: 168, load: 23600 });
      pts.push({ pos: 150, load: 13200 });
      pts.push({ pos: 130, load: 8100 });
      pts.push({ pos: 85, load: 7400 });
      pts.push({ pos: 40, load: 6800 });
      pts.push({ pos: 15, load: 6100 });
      pts.push({ pos: 0, load: 6200 });
    }

    return pts;
  };

  // 6 Historical Cards trending over time leading up to 'TODAY'
  const historicalCards: HistoricalCard[] = [
    {
      id: 'c-30d',
      label: 'D-30',
      sub: 'PEAK HEAT',
      pprl: 23800,
      mprl: 6800,
      fillagePct: 94,
      classification: 'Normal',
      statusLevel: 'normal',
      confidencePct: 99.2,
      shapeExplanation: 'Upright rectangular profile with sharp vertical load pickups at stroke reversals and zero downstroke depression.',
      points: generateCardPoints('normal'),
    },
    {
      id: 'c-24d',
      label: 'D-24',
      sub: 'EARLY COOL',
      pprl: 24100,
      mprl: 5900,
      fillagePct: 91,
      classification: 'Normal',
      statusLevel: 'normal',
      confidencePct: 98.4,
      shapeExplanation: 'Consistent full-barrel card with flat lower boundary indicating unrestricted traveling valve fluid passage.',
      points: generateCardPoints('normal'),
    },
    {
      id: 'c-18d',
      label: 'D-18',
      sub: 'MID CYCLE',
      pprl: 24500,
      mprl: 4200,
      fillagePct: 84,
      classification: 'Normal',
      statusLevel: 'normal',
      confidencePct: 92.1,
      shapeExplanation: 'Minor downstroke load slope onset driven by cooling Jodhpur bitumen viscous skin friction.',
      points: generateCardPoints('intermediate'),
    },
    {
      id: 'c-12d',
      label: 'D-12',
      sub: 'COOLING FRONT',
      pprl: 25100,
      mprl: 2600,
      fillagePct: 76,
      classification: 'Rod Floating',
      statusLevel: 'warning',
      confidencePct: 87.6,
      shapeExplanation: 'Progressive lower boundary sag between 80" and 20" signals impending downstroke rod deceleration.',
      points: generateCardPoints('intermediate'),
    },
    {
      id: 'c-6d',
      label: 'D-06',
      sub: 'ALERT PHASE',
      pprl: 25700,
      mprl: 1400,
      fillagePct: 69,
      classification: 'Pump-Off',
      statusLevel: 'warning',
      confidencePct: 94.5,
      shapeExplanation: 'Steep mid-downstroke vertical load drop at 80" marks plunger impact slamming into an incomplete liquid surface.',
      points: isRodFloat ? generateCardPoints('fluid-pound') : generateCardPoints('intermediate'),
    },
    {
      id: 'c-now',
      label: 'TODAY',
      sub: 'LIVE SCADA',
      pprl: livePPRL,
      mprl: liveMPRL,
      fillagePct: well.pumpFillagePct,
      classification: isRodFloat ? 'Rod Floating' : (well.crudeViscosityCP > 500 ? 'Pump-Off' : 'Normal'),
      statusLevel: isRodFloat ? 'fault' : (well.crudeViscosityCP > 500 ? 'warning' : 'normal'),
      confidencePct: isRodFloat ? 98.7 : 97.5,
      shapeExplanation: isRodFloat
        ? 'Downstroke load collapse below 1,000 lbs between 110" and 20" indicates heavy crude drag impeding rod string gravity descent.'
        : well.crudeViscosityCP > 500
        ? 'Viscous fluid resistance delaying traveling valve opening and causing partial fillage reduction.'
        : 'Nominal full barrel stroke with balanced load transfer and no mechanical binding.',
      points: generateSyntheticDynoPoints(strokeLength, livePPRL, liveMPRL, well.crudeViscosityCP, well.pumpFillagePct).points,
    },
  ];

  // Active display card (default to selected historical card, initially 'TODAY')
  const baseActiveCard = historicalCards.find((c) => c.id === selectedCardId) || historicalCards[5];

  // If override archetype is selected for inspection
  const activeCard: HistoricalCard = overrideArchetype
    ? {
        ...baseActiveCard,
        classification: overrideArchetype,
        statusLevel: 
          overrideArchetype === 'Normal' ? 'normal' :
          overrideArchetype === 'Pump-Off' || overrideArchetype === 'Gas Interference' ? 'warning' : 'fault',
        confidencePct: 
          overrideArchetype === 'Normal' ? 99.2 :
          overrideArchetype === 'Rod Floating' ? 98.7 :
          overrideArchetype === 'Pump-Off' ? 94.5 :
          overrideArchetype === 'Gas Interference' ? 96.1 : 93.8,
        shapeExplanation: 
          overrideArchetype === 'Rod Floating'
            ? 'Downstroke load collapse below 1,000 lbs between 110" and 20" indicates heavy crude drag impeding rod string gravity descent.'
            : overrideArchetype === 'Normal'
            ? 'Upright rectangular profile with sharp vertical load pickups at stroke reversals and zero downstroke depression.'
            : overrideArchetype === 'Pump-Off'
            ? 'Sharp vertical drop at mid-downstroke (80") indicates plunger slamming into incomplete liquid fillage in the barrel.'
            : overrideArchetype === 'Gas Interference'
            ? 'S-shaped concave decompression on downstroke caused by compressed gas expanding inside the barrel before valve opening.'
            : 'Rounded lower-right corner and delayed load release on downstroke indicate fluid leaking past worn ball and seat.',
        points: 
          overrideArchetype === 'Rod Floating' ? generateCardPoints('rod-float') :
          overrideArchetype === 'Pump-Off' ? generateCardPoints('fluid-pound') :
          overrideArchetype === 'Gas Interference' ? generateCardPoints('gas-interference') :
          overrideArchetype === 'Traveling Valve Leak' ? generateCardPoints('valve-leak') :
          generateCardPoints('normal'),
      }
    : baseActiveCard;

  // Chart Scale Parameters
  const chartW = 540;
  const chartH = 260;
  const padLeft = 48;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 32;

  const innerW = chartW - padLeft - padRight;
  const innerH = chartH - padTop - padBottom;

  const maxLoad = 30000; // 30,000 lbs
  const maxPos = 168; // 168 inches stroke

  const getX = (pos: number) => padLeft + (pos / maxPos) * innerW;
  const getY = (load: number) => padTop + innerH - (Math.max(0, Math.min(maxLoad, load)) / maxLoad) * innerH;

  const activeCardPath = activeCard.points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.pos).toFixed(1)} ${getY(p.load).toFixed(1)}`)
    .join(' ') + ' Z';

  // Y-axis tick intervals: 0, 6k, 12k, 18k, 24k, 30k lbs
  const yTicks = [0, 6000, 12000, 18000, 24000, 30000];
  const xTicks = [0, 28, 56, 84, 112, 140, 168];

  // Critical Minimum Rod Load threshold line (e.g. 2,000 lbs, below which rod floats)
  const critLoadY = getY(2000);

  // Status system colors helper
  const getStatusStyle = (level: 'normal' | 'warning' | 'fault') => {
    switch (level) {
      case 'fault':
        return {
          text: 'text-[#8C2F2F]',
          border: 'border-[#8C2F2F]',
          bg: 'bg-[#14171A]',
          tagBg: 'bg-[#8C2F2F]',
          dot: 'bg-[#8C2F2F]',
          label: 'CRITICAL FAULT',
        };
      case 'warning':
        return {
          text: 'text-[#C8551D]',
          border: 'border-[#C8551D]',
          bg: 'bg-[#14171A]',
          tagBg: 'bg-[#C8551D]',
          dot: 'bg-[#C8551D]',
          label: 'ABNORMAL WARNING',
        };
      case 'normal':
      default:
        return {
          text: 'text-[#3A5F45]',
          border: 'border-[#3A5F45]',
          bg: 'bg-[#14171A]',
          tagBg: 'bg-[#3A5F45]',
          dot: 'bg-[#3A5F45]',
          label: 'OPERATIONAL NOMINAL',
        };
    }
  };

  const statusStyle = getStatusStyle(activeCard.statusLevel);

  return (
    <div className="bg-[#191D21] border border-[#2E343A] p-3 flex flex-col space-y-3 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <Activity strokeWidth={1.5} className="w-4 h-4 text-[#C8551D]" />
          <div>
            <span className="font-bold text-[#E8E6E1] text-xs uppercase tracking-wider block">
              DYNAMOMETER CARD // SURFACE CLOSED-LOOP LOAD ⇄ POSITION
            </span>
            <span className="text-[9px] text-[#8A8F94]">
              {isParkedOrVirgin 
                ? 'LOAD CELL: TRANSDUCER CH-04 · 0.0 SPM [SRP UNIT PARKED / PRE-COMMISSIONING]'
                : `LOAD CELL: TRANSDUCER CH-04 · 168" STROKE · ${well.strokeRateSPM} SPM`}
            </span>
          </div>
        </div>

        {/* Selected Card Diagnostic Pill & Real-time SCADA Polling Badge */}
        <div className="flex items-center gap-2">
          <LastUpdatedBadge label="DYNO" pollIntervalSec={3} onRefresh={handleDynoRefresh} />

          <div className="px-2 py-0.5 bg-[#14171A] border border-[#2E343A] flex items-center gap-2 font-mono text-[9px]">
            <span className="text-[#8A8F94]">VIEWING:</span>
            <strong className="text-[#C9B896]">{activeCard.label} [{activeCard.sub}]</strong>
          </div>

          <div className={`px-2 py-0.5 border font-bold text-[9px] font-mono uppercase ${
            activeCard.mprl < 1500
              ? 'border-[#8C2F2F] text-[#8C2F2F] bg-[#14171A]'
              : 'border-[#3A5F45] text-[#3A5F45] bg-[#14171A]'
          }`}>
            {activeCard.classification}
          </div>
        </div>
      </div>

      {/* Main Dynamometer Section: Grid with Plot on Left (8 cols) and Fault Classification Area on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
        {/* Left (8 cols): Main Dynamometer SVG Plot */}
        <div className={`lg:col-span-8 bg-[#14171A] border p-2 relative overflow-hidden flex flex-col justify-between transition-colors duration-100 ease-linear ${
          isDynoPollingFlash ? 'border-[#4E9B68] ring-1 ring-[#4E9B68]/30' : 'border-[#2E343A]'
        }`}>
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full h-auto block overflow-visible"
            style={{ maxHeight: '270px' }}
          >
            {/* Dotted Horizontal Load Gridlines & Square Y-Axis Labels */}
            {yTicks.map((tick) => {
              const y = getY(tick);
              return (
                <g key={`y-${tick}`}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={chartW - padRight}
                    y2={y}
                    stroke="#252B30"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  {/* Square Axis Label Box for Y */}
                  <rect
                    x={padLeft - 42}
                    y={y - 7}
                    width="36"
                    height="14"
                    fill="#191D21"
                    stroke="#2E343A"
                    strokeWidth="0.75"
                  />
                  <text
                    x={padLeft - 24}
                    y={y + 3}
                    fill="#8A8F94"
                    fontSize="7.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {tick === 0 ? '0' : `${tick / 1000}k`} lbs
                  </text>
                </g>
              );
            })}

            {/* Dotted Vertical Position Gridlines & Square X-Axis Labels */}
            {xTicks.map((pos) => {
              const x = getX(pos);
              return (
                <g key={`x-${pos}`}>
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + innerH}
                    stroke="#252B30"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  {/* Square Axis Label Box for X */}
                  <rect
                    x={x - 14}
                    y={padTop + innerH + 4}
                    width="28"
                    height="13"
                    fill="#191D21"
                    stroke="#2E343A"
                    strokeWidth="0.75"
                  />
                  <text
                    x={x}
                    y={padTop + innerH + 13}
                    fill="#8A8F94"
                    fontSize="7.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {pos}"
                  </text>
                </g>
              );
            })}

            {/* Critical Minimum Rod Load Line (Rod Floating Warning at 2,000 lbs) */}
            <line
              x1={padLeft}
              y1={critLoadY}
              x2={chartW - padRight}
              y2={critLoadY}
              stroke="#8C2F2F"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text
              x={chartW - padRight - 8}
              y={critLoadY - 4}
              fill="#8C2F2F"
              fontSize="7.5"
              fontFamily="monospace"
              textAnchor="end"
            >
              ROD-FLOATING RISK CEILING (MIN LOAD &lt; 2,000 LBS)
            </text>

            {/* Upstroke & Downstroke Directional Arrows */}
            <g transform={`translate(${getX(84)}, ${getY(activeCard.pprl) - 6})`}>
              <text fill="#8A8F94" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                UPSTROKE → (LIFTING FLUID)
              </text>
            </g>
            <g transform={`translate(${getX(84)}, ${getY(activeCard.mprl) + 12})`}>
              <text fill="#8A8F94" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                ← DOWNSTROKE (VALVE TRANSFER)
              </text>
            </g>

            {/* DYNAMOMETER CARD: FLAT LINE-DRAWN CLOSED LOOP PLOT */}
            <path
              d={activeCardPath}
              fill="none"
              stroke={activeCard.statusLevel === 'fault' ? '#C8551D' : activeCard.statusLevel === 'warning' ? '#C9B896' : '#E8E6E1'}
              strokeWidth="2"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />

            {/* PPRL (Peak Polished Rod Load) Point Marker */}
            <g transform={`translate(${getX(90)}, ${getY(activeCard.pprl)})`}>
              <rect x="-3" y="-3" width="6" height="6" fill="#C8551D" stroke="#E8E6E1" strokeWidth="1" />
              <rect x="6" y="-12" width="92" height="15" fill="#14171A" stroke="#2E343A" strokeWidth="0.75" />
              <text x="10" y="-2" fill="#E8E6E1" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                PPRL: {activeCard.pprl.toLocaleString()} lbs
              </text>
            </g>

            {/* MPRL (Minimum Polished Rod Load) Point Marker */}
            <g transform={`translate(${getX(50)}, ${getY(activeCard.mprl)})`}>
              <rect
                x="-3"
                y="-3"
                width="6"
                height="6"
                fill={activeCard.mprl < 1500 ? '#8C2F2F' : '#C9B896'}
                stroke="#14171A"
                strokeWidth="1"
              />
              <rect x="6" y="-3" width="92" height="15" fill="#14171A" stroke="#2E343A" strokeWidth="0.75" />
              <text
                x="10"
                y="8"
                fill={activeCard.mprl < 1500 ? '#8C2F2F' : '#C9B896'}
                fontSize="7.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                MPRL: {activeCard.mprl.toLocaleString()} lbs
              </text>
            </g>

            {/* Y-Axis Title & X-Axis Title in Crisp Monospace */}
            <text
              x={padLeft - 8}
              y={padTop - 6}
              fill="#8A8F94"
              fontSize="7.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              POLISHED ROD LOAD (lbs)
            </text>
            <text
              x={chartW - padRight}
              y={padTop + innerH + 26}
              fill="#8A8F94"
              fontSize="7.5"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="end"
            >
              POLISHED ROD POSITION (inches) →
            </text>
          </svg>
        </div>

        {/* Right (4 cols): AI Fault Classification Result Area */}
        <div className="lg:col-span-4 bg-[#14171A] border border-[#2E343A] p-3 flex flex-col justify-between space-y-2.5 font-mono">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2E343A] pb-1.5 text-[9px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#C8551D]" />
              <span className="text-[#E8E6E1] font-bold uppercase">
                AI FAULT CLASSIFICATION
              </span>
            </div>
            <span className="text-[#5F656B]">DYNANET-V3</span>
          </div>

          {/* 1. SQUARED STATUS TAG (THREE-COLOUR STATUS SYSTEM) */}
          <div className="space-y-1">
            <span className="text-[8.5px] text-[#5F656B] uppercase block">
              DIAGNOSTIC STATUS:
            </span>
            <div
              className={`p-2 border ${statusStyle.border} ${statusStyle.bg} flex items-center justify-between`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 ${statusStyle.dot}`} />
                <span className={`font-bold text-xs uppercase tracking-wide ${statusStyle.text}`}>
                  {activeCard.classification}
                </span>
              </div>
              <span
                className={`text-[8px] font-bold px-1.5 py-0.5 border ${statusStyle.border} ${statusStyle.text} uppercase`}
              >
                {statusStyle.label}
              </span>
            </div>
          </div>

          {/* 2. CONFIDENCE PERCENTAGE IN MONOSPACE BENEATH IT */}
          <div className="space-y-1 bg-[#191D21] border border-[#2E343A] p-2">
            <div className="flex items-baseline justify-between text-[9px]">
              <span className="text-[#8A8F94]">INFERENCE CONFIDENCE:</span>
              <span className="text-xs font-bold text-[#E8E6E1]">
                {activeCard.confidencePct.toFixed(1)}%
              </span>
            </div>
            {/* Confidence Bar */}
            <div className="w-full bg-[#14171A] h-1.5 border border-[#2E343A]">
              <div
                style={{ width: `${activeCard.confidencePct}%` }}
                className={`h-full ${statusStyle.tagBg}`}
              />
            </div>
            <div className="flex justify-between text-[7.5px] text-[#5F656B]">
              <span>SAMPLE WINDOW: 12 CYCLES</span>
              <span>ENTROPY: 0.04</span>
            </div>
          </div>

          {/* 3. ONE-LINE PLAIN-LANGUAGE EXPLANATION OF WHICH PART OF CARD SHAPE DROVE CLASSIFICATION */}
          <div className="space-y-1">
            <span className="text-[8px] text-[#5F656B] uppercase block">
              CARD SHAPE FEATURE DRIVER:
            </span>
            <div className="bg-[#191D21] border border-[#2E343A] p-2">
              <p className="text-[9.5px] text-[#C9B896] leading-relaxed">
                "{activeCard.shapeExplanation}"
              </p>
            </div>
          </div>

          {/* Core Shape Geometry Drivers Strip */}
          <div className="grid grid-cols-2 gap-1.5 text-[8.5px] pt-1 border-t border-[#252B30]">
            <div className="bg-[#191D21] p-1 border border-[#2E343A]">
              <span className="text-[#5F656B] block">PPRL / MPRL:</span>
              <strong className="text-[#E8E6E1]">
                {(activeCard.pprl / 1000).toFixed(1)}k / {(activeCard.mprl / 1000).toFixed(1)}k lbs
              </strong>
            </div>
            <div className="bg-[#191D21] p-1 border border-[#2E343A]">
              <span className="text-[#5F656B] block">PUMP FILLAGE:</span>
              <strong className={activeCard.fillagePct < 75 ? 'text-[#8C2F2F]' : 'text-[#3A5F45]'}>
                {activeCard.fillagePct}%
              </strong>
            </div>
          </div>

          {/* Quick Archetype Inspection Bar */}
          <div className="space-y-1 pt-1 border-t border-[#252B30]">
            <div className="flex items-center justify-between text-[8px] text-[#5F656B]">
              <span>TEST SIGNATURE ARCHETYPES:</span>
              {overrideArchetype && (
                <button
                  type="button"
                  onClick={() => setOverrideArchetype(null)}
                  className="text-[#C8551D] hover:underline font-bold uppercase"
                >
                  [REVERT TO SCADA]
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {(['Normal', 'Rod Floating', 'Pump-Off', 'Gas Interference', 'Traveling Valve Leak'] as FaultClassificationType[]).map((arch) => (
                <button
                  key={arch}
                  type="button"
                  onClick={() => setOverrideArchetype(arch)}
                  className={`text-[8px] px-1.5 py-0.5 border font-mono transition-none ${
                    activeCard.classification === arch
                      ? 'border-[#C8551D] bg-[#191D21] text-[#E8E6E1] font-bold'
                      : 'border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1] bg-[#14171A]'
                  }`}
                >
                  {arch}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HORIZONTAL STRIP OF LAST 6 HISTORICAL CARDS (THUMBNAIL VERSIONS) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[9px] font-mono border-b border-[#2E343A] pb-1">
          <div className="flex items-center gap-1.5">
            <Clock strokeWidth={1.5} className="w-3.5 h-3.5 text-[#C9B896]" />
            <span className="font-bold text-[#E8E6E1] uppercase">
              HISTORICAL SHAPE TRENDING STRIP // LAST 6 LOGGED DYNACARDS
            </span>
          </div>
          <span className="text-[#8A8F94]">CLICK THUMBNAIL TO LOAD OVERLAY</span>
        </div>

        {/* 6 Thumbnail Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {historicalCards.map((card) => {
            const isSelected = card.id === selectedCardId;
            const isToday = card.id === 'c-now';

            // Generate thumbnail SVG mini path (scaled to 100x60)
            const thumbW = 90;
            const thumbH = 50;
            const tPad = 4;
            const tInnerW = thumbW - tPad * 2;
            const tInnerH = thumbH - tPad * 2;

            const getThumbX = (p: number) => tPad + (p / 168) * tInnerW;
            const getThumbY = (l: number) => tPad + tInnerH - (Math.max(0, Math.min(30000, l)) / 30000) * tInnerH;

            const thumbPath = card.points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getThumbX(p.pos).toFixed(1)} ${getThumbY(p.load).toFixed(1)}`)
              .join(' ') + ' Z';

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={`bg-[#14171A] border p-1.5 flex flex-col justify-between space-y-1 cursor-pointer transition-none ${
                  isSelected
                    ? 'border-[#C8551D] bg-[#1F2428]'
                    : isToday
                    ? 'border-[#C9B896]'
                    : 'border-[#2E343A] hover:border-[#8A8F94]'
                }`}
              >
                {/* Thumbnail Header */}
                <div className="flex items-center justify-between font-mono text-[8.5px]">
                  <span className={`font-bold ${isSelected ? 'text-[#C8551D]' : isToday ? 'text-[#C9B896]' : 'text-[#E8E6E1]'}`}>
                    {card.label}
                  </span>
                  <span className="text-[7.5px] text-[#5F656B]">
                    {card.sub}
                  </span>
                </div>

                {/* Thumbnail SVG Closed-Loop Mini Canvas */}
                <div className="w-full bg-[#191D21] border border-[#252B30] p-0.5">
                  <svg
                    viewBox={`0 0 ${thumbW} ${thumbH}`}
                    className="w-full h-auto block"
                  >
                    {/* Reference baseline */}
                    <line x1={tPad} y1={thumbH - tPad} x2={thumbW - tPad} y2={thumbH - tPad} stroke="#2E343A" strokeWidth="0.5" />
                    {/* Mini closed-loop path */}
                    <path
                      d={thumbPath}
                      fill="none"
                      stroke={card.mprl < 1500 ? '#8C2F2F' : isSelected ? '#C8551D' : '#8A8F94'}
                      strokeWidth={isSelected ? '1.5' : '1'}
                    />
                  </svg>
                </div>

                {/* Thumbnail Telemetry Metrics */}
                <div className="font-mono text-[8px] space-y-0.5 text-[#8A8F94]">
                  <div className="flex justify-between">
                    <span>PPRL:</span>
                    <strong className="text-[#E8E6E1]">{(card.pprl / 1000).toFixed(1)}k</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>MPRL:</span>
                    <strong className={card.mprl < 1500 ? 'text-[#8C2F2F]' : 'text-[#C9B896]'}>
                      {(card.mprl / 1000).toFixed(1)}k
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynacard Technical Diagnostics Strip */}
      <div className="bg-[#14171A] border border-[#2E343A] p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[9.5px] font-mono text-[#8A8F94]">
        <div className="flex items-center gap-3">
          <span>DAMPING FACTOR: <strong className="text-[#E8E6E1]">0.045</strong></span>
          <span className="text-[#5F656B]">|</span>
          <span>FLUID FRICTION: <strong className={well.crudeViscosityCP > 1000 ? 'text-[#8C2F2F]' : 'text-[#C9B896]'}>
            {well.crudeViscosityCP > 1000 ? 'HIGH VISCOUS SHEAR' : 'NOMINAL'}
          </strong></span>
        </div>
        <div className="text-[#5F656B]">
          GIBBS STRETCH ALGORITHM APPLIED (FULL WAVE EQUATION)
        </div>
      </div>
    </div>
  );
};

export default DynamometerCardPanel;
