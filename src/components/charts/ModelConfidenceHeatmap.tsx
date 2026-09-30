import React, { useState, useMemo } from 'react';
import { BAGHEWALA_WELLS, WellData } from '@/src/data/wellsData';
import { 
  Cpu, 
  Database, 
  Share2, 
  ArrowRight, 
  Info, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Sparkles
} from 'lucide-react';

export interface WellModelConfidence {
  wellId: string;
  pad: string;
  cycleNumber: number;
  daysHistory: number;
  empiricalRatioPct: number; // 0 - 100% direct historical SCADA data
  transferRatioPct: number;  // 0 - 100% transfer learning from offset analog wells
  confidenceScore: number;   // 0 - 100% overall digital twin model fidelity
  category: 'DATA_RICH' | 'MODERATE' | 'TRANSFER_RELIANT' | 'NEWLY_ONLINE';
  donorAnalogWells: string[];
  recordsCount: number;
  statusText: string;
}

interface ModelConfidenceHeatmapProps {
  onNavigateToWell?: (wellId: string) => void;
  className?: string;
}

export const ModelConfidenceHeatmap: React.FC<ModelConfidenceHeatmapProps> = ({
  onNavigateToWell,
  className = '',
}) => {
  const [selectedWellId, setSelectedWellId] = useState<string>('BGW-09');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'DATA_RICH' | 'MODERATE' | 'TRANSFER_RELIANT' | 'NEWLY_ONLINE'>('ALL');

  // Compute confidence and transfer learning metrics for all 35 wells
  const wellConfidenceData: WellModelConfidence[] = useMemo(() => {
    return BAGHEWALA_WELLS.map((w, idx) => {
      // Deterministically derive historical data depth based on cycle number and well age
      let daysHistory = 0;
      let empiricalRatio = 50;
      let transferRatio = 50;
      let confidence = 75;
      let category: 'DATA_RICH' | 'MODERATE' | 'TRANSFER_RELIANT' | 'NEWLY_ONLINE' = 'MODERATE';
      let donors: string[] = [];
      let recordsCount = 2000;
      let statusText = 'Trained on local SCADA with offset analog priors.';

      const wellNum = parseInt(w.id.replace('BGW-', ''), 10);

      // Wells with high cycle numbers or low index are older, data-rich pilot wells
      if (w.cycleNumber >= 3 || [1, 2, 4, 5, 9, 11, 13, 14, 15, 21].includes(wellNum)) {
        category = 'DATA_RICH';
        empiricalRatio = 82 + (idx % 15);
        transferRatio = 100 - empiricalRatio;
        confidence = 88 + (idx % 10);
        daysHistory = 340 + (idx * 22);
        recordsCount = 12000 + (idx * 650);
        donors = ['Self-calibrated', `Pad-${w.pad.replace('Pad-', '')} Historical Baseline`];
        statusText = 'High confidence empirical digital twin with 3+ calibrated CSS cycles.';
      } else if (w.cycleNumber === 2 || [3, 7, 8, 10, 12, 16, 17, 18, 20, 22, 23, 25].includes(wellNum)) {
        category = 'MODERATE';
        empiricalRatio = 55 + (idx % 18);
        transferRatio = 100 - empiricalRatio;
        confidence = 72 + (idx % 12);
        daysHistory = 140 + (idx * 14);
        recordsCount = 5200 + (idx * 310);
        donors = ['BGW-01', 'BGW-09'];
        statusText = 'Balanced hybrid twin: empirical data supplemented by nearest pad analogs.';
      } else if ([6, 19, 24, 26, 27, 29, 30, 32].includes(wellNum)) {
        category = 'TRANSFER_RELIANT';
        empiricalRatio = 28 + (idx % 12);
        transferRatio = 100 - empiricalRatio;
        confidence = 60 + (idx % 10);
        daysHistory = 45 + (idx * 6);
        recordsCount = 1800 + (idx * 120);
        donors = ['BGW-04', 'BGW-09', 'BGW-15'];
        statusText = 'High transfer dependency: physics-informed neural network (PINN) priors from Pad-02.';
      } else {
        // Newly brought online wells (e.g. 28, 31, 33, 34, 35)
        category = 'NEWLY_ONLINE';
        empiricalRatio = 10 + (idx % 8);
        transferRatio = 100 - empiricalRatio;
        confidence = 48 + (idx % 8);
        daysHistory = 12 + (idx % 15);
        recordsCount = 420 + (idx * 45);
        donors = ['BGW-09 (Pilot Prime)', 'BGW-14', 'Pad-01 Master Model'];
        statusText = 'Newly commissioned well. Twin seeded via cross-well transfer learning; awaiting Cycle 1 steam breakthrough.';
      }

      return {
        wellId: w.id,
        pad: w.pad,
        cycleNumber: w.cycleNumber,
        daysHistory,
        empiricalRatioPct: empiricalRatio,
        transferRatioPct: transferRatio,
        confidenceScore: confidence,
        category,
        donorAnalogWells: donors,
        recordsCount,
        statusText,
      };
    });
  }, []);

  // Filtered wells
  const displayedWells = useMemo(() => {
    if (filterCategory === 'ALL') return wellConfidenceData;
    return wellConfidenceData.filter(w => w.category === filterCategory);
  }, [wellConfidenceData, filterCategory]);

  // Selected well object
  const activeWellData = useMemo(() => {
    return wellConfidenceData.find(w => w.wellId === selectedWellId) || wellConfidenceData[0];
  }, [wellConfidenceData, selectedWellId]);

  // Cell flat color mapping based on category (STRICTLY FLAT, NO GRADIENTS)
  const getCellColor = (category: WellModelConfidence['category']): string => {
    switch (category) {
      case 'DATA_RICH':
        return '#3A5F45'; // Sage green
      case 'MODERATE':
        return '#8B7E58'; // Bronze/warm gold
      case 'TRANSFER_RELIANT':
        return '#C8551D'; // Rig orange
      case 'NEWLY_ONLINE':
        return '#8C2F2F'; // Crimson red
      default:
        return '#2E343A';
    }
  };

  // Fleet summary counts
  const dataRichCount = wellConfidenceData.filter(w => w.category === 'DATA_RICH').length;
  const moderateCount = wellConfidenceData.filter(w => w.category === 'MODERATE').length;
  const transferCount = wellConfidenceData.filter(w => w.category === 'TRANSFER_RELIANT').length;
  const newOnlineCount = wellConfidenceData.filter(w => w.category === 'NEWLY_ONLINE').length;
  const avgConfidence = Math.round(
    wellConfidenceData.reduce((acc, w) => acc + w.confidenceScore, 0) / wellConfidenceData.length
  );
  const avgTransfer = Math.round(
    wellConfidenceData.reduce((acc, w) => acc + w.transferRatioPct, 0) / wellConfidenceData.length
  );

  return (
    <div 
      className={`bg-[#191D21] border border-[#2E343A] p-3 space-y-3 font-mono select-none ${className}`}
      style={{ borderRadius: 0 }}
    >
      {/* 1. Header & Technical Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2 text-[10px]">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#14171A] border border-[#C8551D] text-[#C8551D]">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-[#E8E6E1] uppercase tracking-wider block">
              MODEL CONFIDENCE BY WELL // TRANSFER LEARNING HEATMAP
            </span>
            <span className="text-[8.5px] text-[#8A8F94]">
              HISTORICAL SCADA DATA RICHNESS VS. CROSS-WELL PHYSICS INFERENCE RATIO (35 WELL FLEET)
            </span>
          </div>
        </div>

        {/* Global Fleet Metrics Badges */}
        <div className="flex items-center gap-3 text-[9px]">
          <div className="bg-[#14171A] border border-[#2E343A] px-2 py-0.5">
            <span className="text-[#5F656B]">AVG CONFIDENCE:</span>{' '}
            <strong className="text-[#3A5F45]">{avgConfidence}%</strong>
          </div>
          <div className="bg-[#14171A] border border-[#2E343A] px-2 py-0.5">
            <span className="text-[#5F656B]">AVG X-WELL TRANSFER:</span>{' '}
            <strong className="text-[#C8551D]">{avgTransfer}%</strong>
          </div>
        </div>
      </div>

      {/* 2. Heatmap Legend & Category Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#14171A] border border-[#2E343A] p-2 text-[9px]">
        {/* Category Buttons with strict flat colors */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[#5F656B] uppercase font-bold mr-1">FILTER TIERS:</span>

          <button
            type="button"
            onClick={() => setFilterCategory('ALL')}
            className={`px-2 py-0.5 border text-[8.5px] font-bold uppercase transition-none ${
              filterCategory === 'ALL'
                ? 'border-[#E8E6E1] bg-[#272E34] text-[#E8E6E1]'
                : 'border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1]'
            }`}
            style={{ borderRadius: 0 }}
          >
            ALL (35)
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('DATA_RICH')}
            className={`px-2 py-0.5 border text-[8.5px] font-bold uppercase transition-none flex items-center gap-1 ${
              filterCategory === 'DATA_RICH'
                ? 'border-[#3A5F45] bg-[#3A5F45]/20 text-[#E8E6E1]'
                : 'border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1]'
            }`}
            style={{ borderRadius: 0 }}
          >
            <span className="w-2 h-2 bg-[#3A5F45]" />
            <span>DATA-RICH ({dataRichCount})</span>
            <span className="text-[#5F656B]">[&gt;80% Empirical]</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('MODERATE')}
            className={`px-2 py-0.5 border text-[8.5px] font-bold uppercase transition-none flex items-center gap-1 ${
              filterCategory === 'MODERATE'
                ? 'border-[#8B7E58] bg-[#8B7E58]/20 text-[#E8E6E1]'
                : 'border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1]'
            }`}
            style={{ borderRadius: 0 }}
          >
            <span className="w-2 h-2 bg-[#8B7E58]" />
            <span>MODERATE ({moderateCount})</span>
            <span className="text-[#5F656B]">[50-79%]</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('TRANSFER_RELIANT')}
            className={`px-2 py-0.5 border text-[8.5px] font-bold uppercase transition-none flex items-center gap-1 ${
              filterCategory === 'TRANSFER_RELIANT'
                ? 'border-[#C8551D] bg-[#C8551D]/20 text-[#E8E6E1]'
                : 'border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1]'
            }`}
            style={{ borderRadius: 0 }}
          >
            <span className="w-2 h-2 bg-[#C8551D]" />
            <span>TRANSFER-RELIANT ({transferCount})</span>
            <span className="text-[#5F656B]">[&gt;50% Transfer]</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('NEWLY_ONLINE')}
            className={`px-2 py-0.5 border text-[8.5px] font-bold uppercase transition-none flex items-center gap-1 ${
              filterCategory === 'NEWLY_ONLINE'
                ? 'border-[#8C2F2F] bg-[#8C2F2F]/20 text-[#E8E6E1]'
                : 'border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1]'
            }`}
            style={{ borderRadius: 0 }}
          >
            <span className="w-2 h-2 bg-[#8C2F2F]" />
            <span>NEWLY ONLINE ({newOnlineCount})</span>
            <span className="text-[#5F656B]">[&gt;80% Transfer]</span>
          </button>
        </div>

        <span className="text-[8px] text-[#5F656B]">
          CLICK ANY SQUARED CELL TO INSPECT ANALOG WEIGHTS
        </span>
      </div>

      {/* 3. SQUARED HEATMAP GRID (35 WELL CELLS) */}
      <div className="bg-[#14171A] border border-[#2E343A] p-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-7 gap-1.5">
          {displayedWells.map((item) => {
            const isSelected = item.wellId === selectedWellId;
            const flatColor = getCellColor(item.category);

            return (
              <button
                key={item.wellId}
                type="button"
                onClick={() => setSelectedWellId(item.wellId)}
                className={`p-2 border transition-none flex flex-col justify-between text-left relative cursor-pointer group ${
                  isSelected
                    ? 'border-[#E8E6E1] ring-1 ring-[#E8E6E1] bg-[#1F2428]'
                    : 'border-[#2E343A] hover:border-[#8A8F94] bg-[#171B1E]'
                }`}
                style={{ borderRadius: 0 }}
              >
                {/* Top Corner: Well ID & Pad */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-bold text-[#E8E6E1] group-hover:text-[#C8551D]">
                    {item.wellId}
                  </span>
                  <span className="text-[7.5px] text-[#8A8F94] font-normal">
                    {item.pad}
                  </span>
                </div>

                {/* Flat Horizontal Indicator Bar (Strictly flat color, zero gradient) */}
                <div 
                  className="w-full h-2 bg-[#14171A] border border-[#2E343A] overflow-hidden my-1"
                  style={{ borderRadius: 0 }}
                >
                  <div
                    style={{
                      width: `${item.confidenceScore}%`,
                      backgroundColor: flatColor,
                      borderRadius: 0,
                    }}
                    className="h-full transition-none"
                  />
                </div>

                {/* Bottom Row: Confidence & Transfer Tag */}
                <div className="flex items-center justify-between w-full text-[8px] pt-0.5">
                  <span 
                    className="font-bold"
                    style={{ color: flatColor }}
                  >
                    {item.confidenceScore}% FIDELITY
                  </span>
                  <span className="text-[#5F656B]">
                    {item.empiricalRatioPct}% DATA
                  </span>
                </div>

                {/* Tiny corner tag for newly online wells */}
                {item.category === 'NEWLY_ONLINE' && (
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#8C2F2F]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVE WELL CONFIDENCE INSPECTOR DOSSIER */}
      {activeWellData && (
        <div 
          className="bg-[#14171A] border border-[#2E343A] border-l-4 p-3 space-y-2.5"
          style={{ 
            borderLeftColor: getCellColor(activeWellData.category),
            borderRadius: 0 
          }}
        >
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#252B30] pb-2 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#E8E6E1]">
                {activeWellData.wellId}
              </span>
              <span className="px-1.5 py-0.2 bg-[#191D21] border border-[#2E343A] text-[#C9B896] text-[8.5px]">
                {activeWellData.pad}
              </span>
              <span 
                className="px-2 py-0.2 font-bold text-[9px] uppercase border"
                style={{
                  color: getCellColor(activeWellData.category),
                  borderColor: getCellColor(activeWellData.category),
                  borderRadius: 0,
                }}
              >
                {activeWellData.category.replace('_', ' ')}
              </span>
            </div>

            {/* Direct Link to Well's Digital Twin */}
            {onNavigateToWell && (
              <button
                type="button"
                onClick={() => onNavigateToWell(activeWellData.wellId)}
                className="px-2.5 py-1 bg-[#191D21] hover:bg-[#252B30] border border-[#C8551D] text-[#E8E6E1] text-[9.5px] uppercase font-bold flex items-center gap-1.5 transition-none shadow-sm"
                style={{ borderRadius: 0 }}
              >
                <span>OPEN {activeWellData.wellId} DIGITAL TWIN</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C8551D]" />
              </button>
            )}
          </div>

          {/* Detailed Ratio Gauge Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[9px]">
            {/* Box 1: Empirical SCADA Ratio */}
            <div className="bg-[#191D21] border border-[#2E343A] p-2 space-y-1" style={{ borderRadius: 0 }}>
              <div className="flex items-center justify-between">
                <span className="text-[#8A8F94] uppercase">LOCAL HISTORICAL SCADA:</span>
                <strong className="text-[#3A5F45] font-bold text-[10px]">{activeWellData.empiricalRatioPct}%</strong>
              </div>
              <div className="w-full bg-[#14171A] h-2 border border-[#2E343A] overflow-hidden" style={{ borderRadius: 0 }}>
                <div 
                  style={{ width: `${activeWellData.empiricalRatioPct}%`, backgroundColor: '#3A5F45', borderRadius: 0 }} 
                  className="h-full transition-none" 
                />
              </div>
              <span className="text-[7.5px] text-[#5F656B] block">
                {activeWellData.recordsCount.toLocaleString()} calibrated time-series points · {activeWellData.daysHistory} days on stream
              </span>
            </div>

            {/* Box 2: Cross-Well Transfer Learning Ratio */}
            <div className="bg-[#191D21] border border-[#2E343A] p-2 space-y-1" style={{ borderRadius: 0 }}>
              <div className="flex items-center justify-between">
                <span className="text-[#8A8F94] uppercase">CROSS-WELL TRANSFER WEIGHT:</span>
                <strong className="text-[#C8551D] font-bold text-[10px]">{activeWellData.transferRatioPct}%</strong>
              </div>
              <div className="w-full bg-[#14171A] h-2 border border-[#2E343A] overflow-hidden" style={{ borderRadius: 0 }}>
                <div 
                  style={{ width: `${activeWellData.transferRatioPct}%`, backgroundColor: '#C8551D', borderRadius: 0 }} 
                  className="h-full transition-none" 
                />
              </div>
              <span className="text-[7.5px] text-[#5F656B] block">
                Priors from: {activeWellData.donorAnalogWells.join(', ')}
              </span>
            </div>

            {/* Box 3: Model Verification Status */}
            <div className="bg-[#191D21] border border-[#2E343A] p-2 space-y-1" style={{ borderRadius: 0 }}>
              <div className="flex items-center justify-between">
                <span className="text-[#8A8F94] uppercase">MODEL FIDELITY:</span>
                <strong className="text-[#E8E6E1] font-bold text-[10px]">{activeWellData.confidenceScore}%</strong>
              </div>
              <p className="text-[8px] text-[#8A8F94] leading-tight pt-1">
                {activeWellData.statusText}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Transfer Learning Methodology Footer */}
      <div className="bg-[#14171A] border border-[#2E343A] p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[8px] text-[#5F656B]">
        <div className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-[#8A8F94]" />
          <span>METHODOLOGY: PHYSICS-INFORMED NEURAL NETWORK (PINN) + CMG STARS EMBEDDINGS</span>
        </div>
        <span>TRAINED ON 35 BIKANER-NAGAUR HEAVY OIL WELLBORES</span>
      </div>
    </div>
  );
};

export default ModelConfidenceHeatmap;
