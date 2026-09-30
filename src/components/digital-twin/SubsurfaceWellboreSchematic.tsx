import React, { useState } from 'react';
import { WellData } from '@/src/data/wellsData';
import { Layers, Thermometer, Droplet, Eye, HelpCircle } from 'lucide-react';

interface SubsurfaceWellboreSchematicProps {
  well: WellData;
}

export const SubsurfaceWellboreSchematic: React.FC<SubsurfaceWellboreSchematicProps> = ({ well }) => {
  const [selectedDepth, setSelectedDepth] = useState<string | null>(null);

  // Derive physics profiles based on well's actual telemetry
  const bht = well.bottomholeTempC;
  const visc = well.crudeViscosityCP;
  const daysPostInj = well.daysSinceInjection;

  // Temperature gradient estimation along wellbore depth (0m to 1,250m)
  // Surface is cooler (~45°C), gradually warming to pump intake, with highest at reservoir
  const surfaceTemp = Math.round(Math.max(38, bht * 0.32));
  const shallowTemp = Math.round(surfaceTemp + (bht - surfaceTemp) * 0.28);
  const midTemp = Math.round(surfaceTemp + (bht - surfaceTemp) * 0.62);
  const pumpTemp = Math.round(bht * 0.94);
  const resHotTemp = Math.round(bht * 1.08);
  const resWarmTemp = Math.round(bht * 0.76);
  const resCoolTemp = 68; // Native cold Jodhpur baseline

  // Viscosity inversely proportional to temperature (mu = A * exp(B / T))
  const surfaceVisc = Math.min(12000, Math.round(visc * 4.2));
  const shallowVisc = Math.min(9500, Math.round(visc * 2.8));
  const midVisc = Math.min(6000, Math.round(visc * 1.7));
  const pumpVisc = Math.round(visc * 1.05);
  const resHotVisc = Math.max(18, Math.round(visc * 0.35));
  const resWarmVisc = Math.round(visc * 1.15);
  const resCoolVisc = 8500; // Native heavy oil cold viscosity (8,500+ cP)

  // Heat penetration radius percentage based on days post injection
  // Fresh injection (days = 0-5) has deep penetration (65%), older cycles shrink down to 20-30%
  const hotBandWidthPct = Math.max(18, Math.min(55, Math.round(55 - daysPostInj * 0.55)));
  const warmBandWidthPct = Math.max(25, Math.min(45, Math.round(42 - daysPostInj * 0.15)));
  // Remaining is cold native zone

  const depthPoints = [
    {
      id: 'surface',
      depthM: 0,
      label: 'SURFACE WELLHEAD / STUFFING BOX',
      sub: 'Tubing head flange · Polish rod entry',
      temp: surfaceTemp,
      visc: surfaceVisc,
      yPos: 38,
    },
    {
      id: 'shallow',
      depthM: 350,
      label: 'UPPER CASING / TUBING STRING',
      sub: '7" 23# Casing · 2-7/8" J-55 Tubing',
      temp: shallowTemp,
      visc: shallowVisc,
      yPos: 110,
    },
    {
      id: 'mid',
      depthM: 780,
      label: 'MID-DEPTH SUCKER ROD STRING',
      sub: 'Grade D 7/8" continuous rod string',
      temp: midTemp,
      visc: midVisc,
      yPos: 185,
    },
    {
      id: 'pump',
      depthM: 1160,
      label: 'INSERT ROD PUMP INTAKE',
      sub: 'API 25-175 RHBC · Standing & Traveling Valves',
      temp: pumpTemp,
      visc: pumpVisc,
      yPos: 260,
    },
    {
      id: 'perfs',
      depthM: 1220,
      label: 'CASING PERFORATIONS / PAY ENTRY',
      sub: '4 SPF deep charge · Sand screen liner',
      temp: resHotTemp,
      visc: resHotVisc,
      yPos: 320,
    },
    {
      id: 'reservoir',
      depthM: 1250,
      label: 'JODHPUR SANDSTONE RESERVOIR',
      sub: 'Heavy oil depocenter · 17° API bitumen',
      temp: bht,
      visc: visc,
      yPos: 380,
    },
  ];

  return (
    <div className="bg-[#14171A] border border-[#2E343A] p-3 flex flex-col space-y-3 select-none">
      {/* Schematic Header and Subsurface Parameters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#C8551D]" />
          <span className="font-bold text-[#E8E6E1] uppercase">
            VERTICAL WELLBORE CROSS-SECTION SCHEMATIC // 0 TO 1,250m KB
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#8A8F94]">
          <span>
            FORMATION: <strong className="text-[#C9B896]">JODHPUR SS (PERMIAN)</strong>
          </span>
          <span className="text-[#5F656B]">|</span>
          <span>
            PAY DEPTH: <strong className="text-[#E8E6E1]">1,220m–1,254m</strong>
          </span>
        </div>
      </div>

      {/* Main Diagram Area: Flat Vector Line-Art SVG + Depth Telemetry Monospace Callouts */}
      <div className="relative w-full overflow-x-auto bg-[#191D21] border border-[#2E343A] p-2">
        <svg
          viewBox="0 0 740 450"
          className="w-full min-w-[680px] h-auto block"
          style={{ maxHeight: '460px' }}
        >
          {/* Defs for flat hatches / styling (Strictly NO gradients) */}
          <defs>
            {/* Casing outer boundary pattern */}
            <pattern id="overburden-hatch" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 0 16 L 16 0" fill="none" stroke="#252B30" strokeWidth="0.75" />
            </pattern>
          </defs>

          {/* 1. Geological Overburden Surrounding Rock (0m to 1,200m) */}
          <rect x="15" y="25" width="225" height="285" fill="url(#overburden-hatch)" />
          <rect x="300" y="25" width="225" height="285" fill="url(#overburden-hatch)" />
          <line x1="15" y1="25" x2="525" y2="25" stroke="#2E343A" strokeWidth="1" />
          <line x1="15" y1="310" x2="525" y2="310" stroke="#2E343A" strokeWidth="1" strokeDasharray="3,3" />

          {/* Geological Formation Text Callouts */}
          <text x="25" y="45" fill="#5F656B" fontSize="8" fontFamily="monospace">SURFACE OVERBURDEN (0–400m)</text>
          <text x="25" y="160" fill="#5F656B" fontSize="8" fontFamily="monospace">SHALE / SILTSTONE CAPROCK (400–1,200m)</text>
          <text x="25" y="305" fill="#C9B896" fontSize="8.5" fontFamily="monospace" fontWeight="bold">TOP OF JODHPUR PAY (+1,218m KB)</text>

          {/* 2. THE RESERVOIR ZONE (1,215m to 1,260m) AT THE BOTTOM */}
          {/* Strictly 3 Flat Color Stops: Hot (swept), Warm (conduction), Cool (native cold oil) */}
          <g transform="translate(15, 310)">
            {/* Total reservoir background frame */}
            <rect x="0" y="0" width="510" height="120" fill="#14171A" stroke="#2E343A" strokeWidth="1" />

            {/* Left Wing Reservoir Horizontal Gradient Bands */}
            {/* Cool Zone (Far native formation): Dark Slate Charcoal */}
            <rect x="0" y="0" width="90" height="120" fill="#20262B" stroke="#2E343A" strokeWidth="0.5" />
            
            {/* Warm Zone (Intermediate thermal transition): Flat Desert Sand */}
            <rect x="90" y="0" width="80" height="120" fill="#4A3F2C" stroke="#2E343A" strokeWidth="0.5" />
            
            {/* Hot Zone (Near-wellbore steam swept): Flat Rig-Orange / Oxide */}
            <rect x="170" y="0" width="55" height="120" fill="#C8551D" fillOpacity="0.85" stroke="#2E343A" strokeWidth="0.5" />

            {/* Right Wing Reservoir Horizontal Gradient Bands (Symmetric around wellbore at center ~270) */}
            {/* Hot Zone (Near-wellbore right): Flat Rig-Orange / Oxide */}
            <rect x="285" y="0" width="55" height="120" fill="#C8551D" fillOpacity="0.85" stroke="#2E343A" strokeWidth="0.5" />

            {/* Warm Zone (Intermediate transition right): Flat Desert Sand */}
            <rect x="340" y="0" width="80" height="120" fill="#4A3F2C" stroke="#2E343A" strokeWidth="0.5" />

            {/* Cool Zone (Far native right): Dark Slate Charcoal */}
            <rect x="420" y="0" width="90" height="120" fill="#20262B" stroke="#2E343A" strokeWidth="0.5" />

            {/* Perforation Jet Openings through Casing into Formation */}
            <g stroke="#E8E6E1" strokeWidth="1.25">
              <line x1="220" y1="20" x2="235" y2="20" />
              <line x1="220" y1="35" x2="235" y2="35" />
              <line x1="220" y1="50" x2="235" y2="50" />
              <line x1="220" y1="65" x2="235" y2="65" />
              <line x1="220" y1="80" x2="235" y2="80" />

              <line x1="275" y1="20" x2="290" y2="20" />
              <line x1="275" y1="35" x2="290" y2="35" />
              <line x1="275" y1="50" x2="290" y2="50" />
              <line x1="275" y1="65" x2="290" y2="65" />
              <line x1="275" y1="80" x2="290" y2="80" />
            </g>

            {/* Reservoir In-Situ Annotation Legends on the bands */}
            <text x="25" y="105" fill="#8A8F94" fontSize="7.5" fontFamily="monospace">
              COOL NATIVE [68°C · 8.5k cP]
            </text>
            <text x="100" y="105" fill="#C9B896" fontSize="7.5" fontFamily="monospace">
              WARM BUFFER [{resWarmTemp}°C]
            </text>
            <text x="175" y="25" fill="#FFFFFF" fontSize="8" fontFamily="monospace" fontWeight="bold">
              HOT STEAM SWEPT
            </text>
            <text x="175" y="37" fill="#FFFFFF" fontSize="7.5" fontFamily="monospace">
              [{resHotTemp}°C · {resHotVisc} cP]
            </text>
          </g>

          {/* 3. WELLBORE TUBULAR SCHEMATIC (FLAT LINE-ART, CENTERED AT X=255) */}
          <g stroke="#E8E6E1" fill="none">
            {/* Surface Wellhead / Christmas Tree Equipment (0m to 25m) */}
            <rect x="235" y="5" width="40" height="20" fill="#14171A" stroke="#E8E6E1" strokeWidth="1.5" />
            <rect x="225" y="12" width="10" height="6" fill="#C8551D" stroke="#C8551D" strokeWidth="1" />
            <rect x="275" y="12" width="10" height="6" fill="#C8551D" stroke="#C8551D" strokeWidth="1" />
            <line x1="255" y1="0" x2="255" y2="5" stroke="#C8551D" strokeWidth="2" /> {/* Polished rod entry */}

            {/* 7" Production Casing (Outer boundary, X=240 to 270) */}
            <line x1="240" y1="25" x2="240" y2="400" stroke="#8A8F94" strokeWidth="1.5" />
            <line x1="270" y1="25" x2="270" y2="400" stroke="#8A8F94" strokeWidth="1.5" />
            
            {/* Casing Shoe at 1,245m */}
            <path d="M 238 400 L 243 408 L 243 400 Z" fill="#8A8F94" stroke="#8A8F94" />
            <path d="M 272 400 L 267 408 L 267 400 Z" fill="#8A8F94" stroke="#8A8F94" />

            {/* 2-7/8" Production Tubing (Inner string, X=246 to 264) */}
            <line x1="247" y1="25" x2="247" y2="340" stroke="#C9B896" strokeWidth="1.25" />
            <line x1="263" y1="25" x2="263" y2="340" stroke="#C9B896" strokeWidth="1.25" />

            {/* Tubing Seating Nipple & Hold-Down at 1,160m */}
            <rect x="245" y="275" width="20" height="5" fill="#C9B896" stroke="#C9B896" strokeWidth="1" />

            {/* DOWNHOLE INSERT SUCKER ROD PUMP (RHBC) at 1,160m - 1,180m */}
            {/* Pump Barrel */}
            <rect x="249" y="280" width="12" height="35" fill="#14171A" stroke="#C8551D" strokeWidth="1.5" />
            
            {/* Traveling Valve & Plunger (Strictly squared valve seat) */}
            <rect x="251" y="288" width="8" height="12" fill="#C8551D" stroke="#C8551D" strokeWidth="1" />
            <rect x="253" y="292" width="4" height="4" fill="#E8E6E1" />
            
            {/* Standing Valve (Ball & Seat at bottom of pump) */}
            <line x1="250" y1="310" x2="260" y2="310" stroke="#E8E6E1" strokeWidth="1.5" />
            <rect x="253" y="305" width="4" height="4" fill="#E8E6E1" />

            {/* Tubing Gas Anchor & Mud Anchor Tailpipe (below pump down to 1,220m) */}
            <line x1="251" y1="315" x2="251" y2="350" stroke="#C9B896" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="259" y1="315" x2="259" y2="350" stroke="#C9B896" strokeWidth="1" strokeDasharray="2,2" />

            {/* SUCKER ROD STRING (Center rod line, X=255, running from wellhead down to pump plunger) */}
            <line 
              x1="255" 
              y1="5" 
              x2="255" 
              y2="288" 
              stroke="#E8E6E1" 
              strokeWidth="2" 
            />

            {/* Rod Guides / Centralizers on Sucker Rods */}
            <rect x="252" y="90" width="6" height="3" fill="#C9B896" stroke="#C9B896" strokeWidth="0.5" />
            <rect x="252" y="165" width="6" height="3" fill="#C9B896" stroke="#C9B896" strokeWidth="0.5" />
            <rect x="252" y="235" width="6" height="3" fill="#C9B896" stroke="#C9B896" strokeWidth="0.5" />
          </g>

          {/* 4. DEPTH CALLOUT LINES & MONOSPACE NUMERIC TELEMETRY LABELS (RIGHT SIDE, X=525 to 730) */}
          <g>
            {depthPoints.map((dp, idx) => {
              const isSelected = selectedDepth === dp.id;

              return (
                <g 
                  key={dp.id} 
                  transform={`translate(0, ${dp.yPos})`}
                  className="cursor-pointer"
                  onClick={() => setSelectedDepth(isSelected ? null : dp.id)}
                >
                  {/* Subtle horizontal reference pointer to wellbore */}
                  <line
                    x1="270"
                    y1="0"
                    x2="525"
                    y2="0"
                    stroke="#2E343A"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  
                  {/* Wellbore target anchor square */}
                  <rect x="268" y="-2" width="4" height="4" fill="#C9B896" />

                  {/* Right side callout box */}
                  <rect
                    x="525"
                    y="-15"
                    width="205"
                    height="32"
                    fill={isSelected ? '#272E34' : '#14171A'}
                    stroke={isSelected ? '#C8551D' : '#2E343A'}
                    strokeWidth="1"
                  />

                  {/* Depth in meters */}
                  <text
                    x="533"
                    y="-3"
                    fill="#C9B896"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {dp.depthM === 0 ? '0 m (SURFACE)' : `${dp.depthM} m KB`}
                  </text>

                  {/* Sub-label */}
                  <text
                    x="533"
                    y="10"
                    fill="#8A8F94"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    {dp.label}
                  </text>

                  {/* Monospace Numeric Values: Temperature (°C) and Viscosity (cP) */}
                  <text
                    x="722"
                    y="-3"
                    fill={dp.temp >= 150 ? '#C8551D' : '#E8E6E1'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    T: {dp.temp} °C
                  </text>
                  
                  <text
                    x="722"
                    y="10"
                    fill={dp.visc > 1000 ? '#8C2F2F' : '#C9B896'}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    μ: {dp.visc.toLocaleString()} cP
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* 3. SOLID 3-STOP TEMPERATURE GRADIENT BAND EXPLANATION KEY */}
      <div className="bg-[#191D21] border border-[#2E343A] p-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono border-b border-[#2E343A] pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[#E8E6E1] font-bold uppercase">
              RESERVOIR THERMAL PENETRATION // 3 SOLID FLAT COLOUR STOPS
            </span>
          </div>
          <span className="text-[#C9B896]">
            EST. HEAT FRONT RADIUS: {Math.round(28 * (hotBandWidthPct / 50))} METERS
          </span>
        </div>

        {/* The 3 Solid Colour Stops Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] font-mono">
          {/* Stop 1: Hot Swept Zone */}
          <div className="bg-[#14171A] border border-[#C8551D] p-2 flex items-start gap-2">
            <div className="w-3.5 h-3.5 bg-[#C8551D] shrink-0 mt-0.5" />
            <div>
              <div className="text-[#E8E6E1] font-bold">1. HOT ZONE (SWEPT RADIUS)</div>
              <div className="text-[#C8551D] font-bold text-xs mt-0.5">
                {resHotTemp} °C · {resHotVisc} cP
              </div>
              <p className="text-[9px] text-[#8A8F94] mt-0.5 leading-snug">
                Superheated steam chamber near wellbore. Low viscosity ensures easy fluid mobility into the pump.
              </p>
            </div>
          </div>

          {/* Stop 2: Warm Conduction Zone */}
          <div className="bg-[#14171A] border border-[#C9B896] p-2 flex items-start gap-2">
            <div className="w-3.5 h-3.5 bg-[#4A3F2C] border border-[#C9B896] shrink-0 mt-0.5" />
            <div>
              <div className="text-[#E8E6E1] font-bold">2. WARM ZONE (TRANSITION BUFFER)</div>
              <div className="text-[#C9B896] font-bold text-xs mt-0.5">
                {resWarmTemp} °C · {resWarmVisc} cP
              </div>
              <p className="text-[9px] text-[#8A8F94] mt-0.5 leading-snug">
                Conductive heat boundary. Viscosity climbs rapidly as temperature drops below 120°C threshold.
              </p>
            </div>
          </div>

          {/* Stop 3: Cool Native Zone */}
          <div className="bg-[#14171A] border border-[#2E343A] p-2 flex items-start gap-2">
            <div className="w-3.5 h-3.5 bg-[#20262B] border border-[#2E343A] shrink-0 mt-0.5" />
            <div>
              <div className="text-[#E8E6E1] font-bold">3. COOL ZONE (NATIVE FORMATION)</div>
              <div className="text-[#8A8F94] font-bold text-xs mt-0.5">
                {resCoolTemp} °C · {resCoolVisc.toLocaleString()} cP
              </div>
              <p className="text-[9px] text-[#8A8F94] mt-0.5 leading-snug">
                Cold heavy oil reservoir outside thermal sweep. Immobile bitumen (16° API, 8,500+ cP) resisting flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubsurfaceWellboreSchematic;
