import React, { useState } from 'react';
import { WellData } from '@/src/data/wellsData';
import { 
  Flame, 
  Activity, 
  AlertTriangle, 
  AlertOctagon, 
  Check, 
  Layers, 
  Cpu, 
  Maximize2,
  Compass,
  ArrowRight
} from 'lucide-react';

interface IsometricFieldSchematicProps {
  wells: WellData[];
  selectedWell: WellData;
  onSelectWell: (well: WellData) => void;
  hoveredWell: WellData | null;
  setHoveredWell: (well: WellData | null) => void;
  filterPad: string;
}

interface PadLayoutConfig {
  id: string;
  name: string;
  subtitle: string;
  baseX: number;
  baseY: number;
  width: number;
  depth: number;
  height: number;
  wellOffsets: Array<{ dx: number; dy: number }>;
}

export const IsometricFieldSchematic: React.FC<IsometricFieldSchematicProps> = ({
  wells,
  selectedWell,
  onSelectWell,
  hoveredWell,
  setHoveredWell,
  filterPad,
}) => {
  const [showPipelines, setShowPipelines] = useState<boolean>(true);
  const [showFaults, setShowFaults] = useState<boolean>(true);

  // Isometric 2:1 projection conversion:
  // isoX = (x - y) * cos(30) ~ (x - y) * 0.866
  // isoY = (x + y) * sin(30) - z ~ (x + y) * 0.5 - z
  const projectIso = (x: number, y: number, z = 0) => {
    const originX = 500;
    const originY = 80;
    const isoX = originX + (x - y) * 0.866;
    const isoY = originY + (x + y) * 0.5 - z;
    return { x: Math.round(isoX), y: Math.round(isoY) };
  };

  // 5 Well Pad Platforms in isometric coordinate space
  const padConfigs: PadLayoutConfig[] = [
    {
      id: 'Pad-01',
      name: 'PAD-01',
      subtitle: 'CREST DEPOCENTER',
      baseX: 120,
      baseY: 100,
      width: 140,
      depth: 90,
      height: 14,
      wellOffsets: [
        { dx: 20, dy: 20 },
        { dx: 55, dy: 20 },
        { dx: 90, dy: 20 },
        { dx: 120, dy: 20 },
        { dx: 35, dy: 60 },
        { dx: 70, dy: 60 },
        { dx: 105, dy: 60 },
      ],
    },
    {
      id: 'Pad-02',
      name: 'PAD-02',
      subtitle: 'NORTH FLANK [BGW-09]',
      baseX: 340,
      baseY: 70,
      width: 140,
      depth: 90,
      height: 14,
      wellOffsets: [
        { dx: 20, dy: 20 },
        { dx: 55, dy: 20 },
        { dx: 90, dy: 20 }, // BGW-09 position
        { dx: 120, dy: 20 },
        { dx: 35, dy: 60 },
        { dx: 70, dy: 60 },
        { dx: 105, dy: 60 },
      ],
    },
    {
      id: 'Pad-03',
      name: 'PAD-03',
      subtitle: 'CENTRAL LEASE HUB',
      baseX: 220,
      baseY: 230,
      width: 140,
      depth: 90,
      height: 14,
      wellOffsets: [
        { dx: 20, dy: 20 },
        { dx: 55, dy: 20 },
        { dx: 90, dy: 20 },
        { dx: 120, dy: 20 },
        { dx: 35, dy: 60 },
        { dx: 70, dy: 60 },
        { dx: 105, dy: 60 },
      ],
    },
    {
      id: 'Pad-04',
      name: 'PAD-04',
      subtitle: 'SOUTH FLANK AREA',
      baseX: 100,
      baseY: 370,
      width: 140,
      depth: 90,
      height: 14,
      wellOffsets: [
        { dx: 20, dy: 20 },
        { dx: 55, dy: 20 },
        { dx: 90, dy: 20 },
        { dx: 120, dy: 20 },
        { dx: 35, dy: 60 },
        { dx: 70, dy: 60 },
        { dx: 105, dy: 60 },
      ],
    },
    {
      id: 'Pad-05',
      name: 'PAD-05',
      subtitle: 'EAST STEP-OUT EXTENSION',
      baseX: 330,
      baseY: 360,
      width: 140,
      depth: 90,
      height: 14,
      wellOffsets: [
        { dx: 20, dy: 20 },
        { dx: 55, dy: 20 },
        { dx: 90, dy: 20 },
        { dx: 120, dy: 20 },
        { dx: 35, dy: 60 },
        { dx: 70, dy: 60 },
        { dx: 105, dy: 60 },
      ],
    },
  ];

  // Steam generation hub (Central facility)
  const steamHub = { x: 280, y: 220, z: 0 };
  const steamHubCenter = projectIso(steamHub.x + 40, steamHub.y + 40, 20);

  // Group wells by pad
  const getPadWells = (padName: string) => {
    return wells.filter(w => w.pad === padName);
  };

  return (
    <div className="relative bg-[#14171A] border border-[#2E343A] overflow-hidden select-none font-mono">
      {/* Schematic Control Header & Layer Toggles */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 text-[9px]">
        <div className="bg-[#191D21] border border-[#2E343A] px-2 py-1 flex items-center gap-1.5 text-[#C9B896] font-bold">
          <Compass className="w-3.5 h-3.5 text-[#C8551D]" />
          <span>ISOMETRIC SCHEMATIC // AXONOMETRIC 30°</span>
        </div>

        <button
          type="button"
          onClick={() => setShowPipelines(prev => !prev)}
          className={`px-2 py-1 border transition-none cursor-pointer flex items-center gap-1 ${
            showPipelines 
              ? 'bg-[#191D21] border-[#C8551D] text-[#C8551D] font-bold' 
              : 'bg-[#14171A] border-[#2E343A] text-[#5F656B]'
          }`}
          style={{ borderRadius: 0 }}
        >
          <span>STEAM / OIL TRUNKLINES: {showPipelines ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowFaults(prev => !prev)}
          className={`px-2 py-1 border transition-none cursor-pointer flex items-center gap-1 ${
            showFaults 
              ? 'bg-[#191D21] border-[#C9B896] text-[#C9B896] font-bold' 
              : 'bg-[#14171A] border-[#2E343A] text-[#5F656B]'
          }`}
          style={{ borderRadius: 0 }}
        >
          <span>FAULT TRACE F-01: {showFaults ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Geodetic Grid Legend on Bottom Left */}
      <div className="absolute bottom-3 left-3 z-10 text-[8.5px] text-[#5F656B] bg-[#14171A]/90 border border-[#2E343A] p-2 space-y-0.5 pointer-events-none">
        <div className="text-[#8A8F94] font-bold">BAGHEWALA PML // JODHPUR SS</div>
        <div>ELEVATION: +114m AMSL · KB: 1,250m</div>
        <div>GRID SPACING: 100m ISOMETRIC</div>
      </div>

      {/* SVG Canvas for Isometric Engineering Schematic */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1000 620"
          className="w-full min-w-[760px] h-[520px] block"
          style={{ background: '#121518' }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="isoGrid" width="40" height="23" patternUnits="userSpaceOnUse">
              <path d="M 0 11.5 L 20 0 L 40 11.5 L 20 23 Z" fill="none" stroke="#1D2227" strokeWidth="0.75" />
            </pattern>
          </defs>

          {/* 1. Background Isometric Mesh Floor */}
          <rect x="0" y="0" width="1000" height="620" fill="url(#isoGrid)" />

          {/* Coordinate Guide Axis Lines */}
          <g stroke="#262D34" strokeWidth="1" strokeDasharray="3 3">
            {/* North-South Axis */}
            <line x1="500" y1="20" x2="80" y2="260" />
            <line x1="500" y1="20" x2="920" y2="260" />
            <line x1="80" y1="260" x2="500" y2="500" />
            <line x1="920" y1="260" x2="500" y2="500" />
          </g>

          {/* Geological Subsurface Fault Zone (F-01 Jodhpur Boundary Fault) */}
          {showFaults && (
            <g>
              <path
                d="M 120 180 Q 320 270 540 340 T 960 480"
                fill="none"
                stroke="#DE5959"
                strokeWidth="1.25"
                strokeDasharray="6 4"
                opacity="0.6"
              />
              <text x="780" y="445" fill="#DE5959" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.8">
                FAULT F-01 (SEAL / PRESSURE BARRIER)
              </text>
            </g>
          )}

          {/* 2. Central Steam Generation Boiler Plant (SG-01 / SG-02) */}
          {(() => {
            const p1 = projectIso(steamHub.x, steamHub.y, 0);
            const p2 = projectIso(steamHub.x + 80, steamHub.y, 0);
            const p3 = projectIso(steamHub.x + 80, steamHub.y + 80, 0);
            const p4 = projectIso(steamHub.x, steamHub.y + 80, 0);
            const h = 22;
            const top1 = projectIso(steamHub.x, steamHub.y, h);
            const top2 = projectIso(steamHub.x + 80, steamHub.y, h);
            const top3 = projectIso(steamHub.x + 80, steamHub.y + 80, h);
            const top4 = projectIso(steamHub.x, steamHub.y + 80, h);

            return (
              <g id="steam-generator-hub">
                {/* Left side slab */}
                <polygon
                  points={`${p4.x},${p4.y} ${p3.x},${p3.y} ${top3.x},${top3.y} ${top4.x},${top4.y}`}
                  fill="#161A1D"
                  stroke="#2E343A"
                  strokeWidth="1"
                />
                {/* Right side slab */}
                <polygon
                  points={`${p2.x},${p2.y} ${p3.x},${p3.y} ${top3.x},${top3.y} ${top2.x},${top2.y}`}
                  fill="#131618"
                  stroke="#2E343A"
                  strokeWidth="1"
                />
                {/* Top face */}
                <polygon
                  points={`${top1.x},${top1.y} ${top2.x},${top2.y} ${top3.x},${top3.y} ${top4.x},${top4.y}`}
                  fill="#20262B"
                  stroke="#C8551D"
                  strokeWidth="1.5"
                />

                {/* Steam Boiler Stack Schematics (2 Vertical Stacks) */}
                <line x1={top1.x + 25} y1={top1.y + 15} x2={top1.x + 25} y2={top1.y - 12} stroke="#C8551D" strokeWidth="2.5" />
                <line x1={top1.x + 45} y1={top1.y + 25} x2={top1.x + 45} y2={top1.y - 2} stroke="#C8551D" strokeWidth="2.5" />

                {/* Central Plant Label */}
                <text x={top3.x - 45} y={top3.y + 16} fill="#E8E6E1" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  SG-01/02 BOILERS
                </text>
                <text x={top3.x - 38} y={top3.y + 26} fill="#C8551D" fontSize="7.5" fontFamily="monospace">
                  45 T/HR STEAM
                </text>
              </g>
            );
          })()}

          {/* 3. Isometric Steam Trunklines & Oil Gathering Lines */}
          {showPipelines && (
            <g id="isometric-pipelines">
              {padConfigs.map((pad) => {
                const padCenter = projectIso(pad.baseX + pad.width / 2, pad.baseY + pad.depth / 2, 0);

                return (
                  <g key={`pipeline-${pad.id}`}>
                    {/* Steam Line (Orange Dashed Line from Central Boiler) */}
                    <line
                      x1={steamHubCenter.x}
                      y1={steamHubCenter.y}
                      x2={padCenter.x}
                      y2={padCenter.y}
                      stroke="#C8551D"
                      strokeWidth="1.25"
                      strokeDasharray="4 3"
                      opacity="0.75"
                    />
                    {/* Return Oil Gathering Trunkline (Green Thin Line) */}
                    <line
                      x1={steamHubCenter.x + 4}
                      y1={steamHubCenter.y + 4}
                      x2={padCenter.x + 4}
                      y2={padCenter.y + 4}
                      stroke="#3A5F45"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* 4. The 5 Well Pad Platforms (Pads 01 to 05) */}
          {padConfigs.map((pad) => {
            const isPadFiltered = filterPad !== 'ALL' && filterPad !== pad.id;
            if (isPadFiltered) return null;

            const padWells = getPadWells(pad.id);
            const { baseX, baseY, width, depth, height } = pad;

            // Compute isometric corners for the platform slab
            const b1 = projectIso(baseX, baseY, 0);
            const b2 = projectIso(baseX + width, baseY, 0);
            const b3 = projectIso(baseX + width, baseY + depth, 0);
            const b4 = projectIso(baseX, baseY + depth, 0);

            const t1 = projectIso(baseX, baseY, height);
            const t2 = projectIso(baseX + width, baseY, height);
            const t3 = projectIso(baseX + width, baseY + depth, height);
            const t4 = projectIso(baseX, baseY + depth, height);

            const isPadActive = selectedWell?.pad === pad.id;

            return (
              <g key={pad.id} id={`pad-platform-${pad.id}`}>
                {/* Platform Base Drop Shadow / Outline */}
                <polygon
                  points={`${b1.x},${b1.y} ${b2.x},${b2.y} ${b3.x},${b3.y} ${b4.x},${b4.y}`}
                  fill="#0E1012"
                  stroke="#1D2227"
                  strokeWidth="1"
                />

                {/* Left Side Face */}
                <polygon
                  points={`${b4.x},${b4.y} ${b3.x},${b3.y} ${t3.x},${t3.y} ${t4.x},${t4.y}`}
                  fill="#15191C"
                  stroke="#2E343A"
                  strokeWidth="1"
                />

                {/* Right Side Face */}
                <polygon
                  points={`${b2.x},${b2.y} ${b3.x},${b3.y} ${t3.x},${t3.y} ${t2.x},${t2.y}`}
                  fill="#121517"
                  stroke="#2E343A"
                  strokeWidth="1"
                />

                {/* Top Platform Face (Flat-shaded concrete drilling cellar pad) */}
                <polygon
                  points={`${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y} ${t4.x},${t4.y}`}
                  fill={isPadActive ? '#1C2329' : '#181D21'}
                  stroke={isPadActive ? '#C8551D' : '#2E343A'}
                  strokeWidth={isPadActive ? '1.5' : '1'}
                />

                {/* Pad Monospace Header Label on Isometric Slab Corner */}
                <text
                  x={t4.x - 30}
                  y={t4.y + 14}
                  fill="#C9B896"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {pad.name}
                </text>
                <text
                  x={t4.x - 30}
                  y={t4.y + 24}
                  fill="#5F656B"
                  fontSize="7.5"
                  fontFamily="monospace"
                >
                  {pad.subtitle}
                </text>

                {/* 5. Wellheads on Platform (7 wells per pad) */}
                {padWells.map((well, idx) => {
                  const offset = pad.wellOffsets[idx] || { dx: 30 + idx * 15, dy: 30 };
                  const wellPos = projectIso(baseX + offset.dx, baseY + offset.dy, height);

                  const isSelected = selectedWell?.id === well.id;
                  const isHovered = hoveredWell?.id === well.id;

                  // Status styling
                  const statusFill = 
                    well.status === 'fault' ? '#DE5959' :
                    well.status === 'alert' ? '#C8551D' : '#3A5F45';

                  const statusStroke = 
                    well.status === 'fault' ? '#8C2F2F' :
                    well.status === 'alert' ? '#B24816' : '#27402F';

                  return (
                    <g
                      key={well.id}
                      className="cursor-pointer transition-none"
                      onClick={() => onSelectWell(well)}
                      onMouseEnter={() => setHoveredWell(well)}
                      onMouseLeave={() => setHoveredWell(null)}
                    >
                      {/* Selection / Hover Indicator Ring */}
                      {(isSelected || isHovered) && (
                        <rect
                          x={wellPos.x - 14}
                          y={wellPos.y - 20}
                          width="28"
                          height="26"
                          fill="none"
                          stroke={isSelected ? '#C8551D' : '#E8E6E1'}
                          strokeWidth="1.5"
                          strokeDasharray={isSelected ? 'none' : '2 2'}
                        />
                      )}

                      {/* Isometric Pumpjack / Wellhead Schematic Vector (Clean Line Perspective) */}
                      {/* Samson Post A-frame (Stroke lines) */}
                      <line x1={wellPos.x - 4} y1={wellPos.y} x2={wellPos.x} y2={wellPos.y - 12} stroke="#8A8F94" strokeWidth="1.25" />
                      <line x1={wellPos.x + 4} y1={wellPos.y} x2={wellPos.x} y2={wellPos.y - 12} stroke="#8A8F94" strokeWidth="1.25" />
                      
                      {/* Walking Beam (Tilted isometric line) */}
                      <line
                        x1={wellPos.x - 8}
                        y1={wellPos.y - 9}
                        x2={wellPos.x + 8}
                        y2={wellPos.y - 15}
                        stroke="#C9B896"
                        strokeWidth="1.75"
                      />

                      {/* Horsehead Curved Arc at Front */}
                      <line
                        x1={wellPos.x + 8}
                        y1={wellPos.y - 15}
                        x2={wellPos.x + 10}
                        y2={wellPos.y - 9}
                        stroke="#C9B896"
                        strokeWidth="1.75"
                      />

                      {/* Polished Rod descending to cellar */}
                      <line
                        x1={wellPos.x + 10}
                        y1={wellPos.y - 9}
                        x2={wellPos.x + 10}
                        y2={wellPos.y + 1}
                        stroke={well.rodFloatingRisk ? '#DE5959' : '#E8E6E1'}
                        strokeWidth="1.25"
                      />

                      {/* Wellhead Cellar Base Box (Strict Square, No Circle) */}
                      <rect
                        x={wellPos.x + 7}
                        y={wellPos.y}
                        width="6"
                        height="5"
                        fill={statusFill}
                        stroke={statusStroke}
                        strokeWidth="1"
                      />

                      {/* Well Label Badge (Directly readable on isometric schematic) */}
                      <g transform={`translate(${wellPos.x - 14}, ${wellPos.y + 8})`}>
                        <rect
                          x="0"
                          y="0"
                          width="28"
                          height="11"
                          fill="#14171A"
                          stroke={isSelected ? '#C8551D' : '#2E343A'}
                          strokeWidth="1"
                        />
                        <text
                          x="14"
                          y="8"
                          textAnchor="middle"
                          fill={isSelected ? '#C8551D' : '#E8E6E1'}
                          fontSize="7.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {well.id}
                        </text>
                      </g>

                      {/* Rod-Float Hazard Warning Beacon if applicable (Strictly squared box) */}
                      {well.rodFloatingRisk && (
                        <rect
                          x={wellPos.x + 8}
                          y={wellPos.y - 18}
                          width="5"
                          height="5"
                          fill="#DE5959"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Isometric Inspector Card (Displays details on hovered/selected well) */}
      <div className="p-3 bg-[#191D21] border-t border-[#2E343A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-[#2E343A] bg-[#14171A] flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-[#C8551D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#8A8F94]">INSPECTED ASSET:</span>
              <strong className="text-sm text-[#E8E6E1] font-bold">
                {hoveredWell?.id || selectedWell.id}
              </strong>
              <span className="text-[10px] text-[#C9B896] uppercase">
                [{hoveredWell?.pad || selectedWell.pad}]
              </span>
              <span className={`px-1.5 py-0.2 text-[8px] font-bold uppercase border ${
                (hoveredWell || selectedWell).status === 'fault'
                  ? 'border-[#DE5959] text-[#DE5959] bg-[#1C1414]'
                  : (hoveredWell || selectedWell).status === 'alert'
                  ? 'border-[#C8551D] text-[#D96B27] bg-[#1C1814]'
                  : 'border-[#3A5F45] text-[#4E9B68] bg-[#141A16]'
              }`}>
                {(hoveredWell || selectedWell).status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-[#8A8F94] mt-0.5">
              <span>PHASE: <strong className="text-[#E8E6E1]">{(hoveredWell || selectedWell).cyclePhase}</strong></span>
              <span>OIL RATE: <strong className="text-[#C9B896]">{(hoveredWell || selectedWell).oilRateBOPD} BOPD</strong></span>
              <span>VISCOSITY: <strong className={(hoveredWell || selectedWell).crudeViscosityCP > 800 ? 'text-[#DE5959]' : 'text-[#E8E6E1]'}>{(hoveredWell || selectedWell).crudeViscosityCP} cP</strong></span>
              <span>BHT: <strong className="text-[#C9B896]">{(hoveredWell || selectedWell).reservoirTempC}°C</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onSelectWell(hoveredWell || selectedWell)}
            className="px-3 py-1.5 bg-[#C8551D] hover:bg-[#D9652D] text-white font-mono text-[10px] font-bold uppercase transition-none flex items-center gap-1.5 cursor-pointer"
            style={{ borderRadius: 0 }}
          >
            <span>OPEN DIGITAL TWIN</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IsometricFieldSchematic;
