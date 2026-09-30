import React from 'react';

interface DataPoint {
  x: number;
  y: number;
}

interface ComparisonLineChartProps {
  data: DataPoint[];
  minY: number;
  maxY: number;
  yTicks: number[];
  color?: string;
  secondData?: DataPoint[];
  secondColor?: string;
  height?: number;
  currentValue?: string | number;
  unit?: string;
  thresholdLine?: number; // e.g., 1,500 lbs rod float threshold
  thresholdLabel?: string;
}

export const ComparisonLineChart: React.FC<ComparisonLineChartProps> = ({
  data,
  minY,
  maxY,
  yTicks,
  color = '#C9B896', // Default Thar Desert sand
  secondData,
  secondColor = '#C8551D', // Rig-orange
  height = 110,
  currentValue,
  unit,
  thresholdLine,
  thresholdLabel,
}) => {
  const width = 300;
  const paddingLeft = 36;
  const paddingRight = 10;
  const paddingTop = 12;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const isSinglePoint = data.length === 1;
  const isSecondSinglePoint = secondData && secondData.length === 1;

  const minX = data.length > 0 ? data[0].x : 0;
  const maxX = data.length > 1 ? data[data.length - 1].x : (data.length === 1 ? data[0].x + 1 : 30);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const getX = (val: number) => paddingLeft + ((val - minX) / rangeX) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minY) / rangeY) * chartHeight;

  // Primary line path points (Strict single line, NO fill)
  const linePoints = data.length > 1
    ? data
        .map(p => `${getX(p.x).toFixed(1)},${getY(Math.max(minY, Math.min(maxY, p.y))).toFixed(1)}`)
        .join(' ')
    : '';

  // Secondary line path points (if present, e.g. Min Rod Load)
  const secondLinePoints = secondData && secondData.length > 1
    ? secondData
        .map(p => `${getX(p.x).toFixed(1)},${getY(Math.max(minY, Math.min(maxY, p.y))).toFixed(1)}`)
        .join(' ')
    : null;

  return (
    <div className="w-full bg-[#14171A] border border-[#2E343A] p-2 select-none">
      {/* Current Value Monospace Banner if provided */}
      {currentValue !== undefined && (
        <div className="flex items-baseline justify-between mb-1 px-1">
          <span className="font-mono text-xs font-bold text-[#E8E6E1]">
            {currentValue} {unit && <span className="text-[10px] text-[#8A8F94] font-normal">{unit}</span>}
          </span>
          <span className="text-[9px] font-mono text-[#5F656B]">
            RANGE: {minY}–{maxY} {unit}
          </span>
        </div>
      )}

      {/* SVG Chart with Subtle Dotted Gridlines & Flat Single Lines */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full block overflow-visible"
        style={{ height: `${height}px` }}
      >
        {/* Subtle Dotted Horizontal Gridlines & Y-Axis Scale Numbers */}
        {yTicks.map(tick => {
          const y = getY(tick);
          return (
            <g key={tick}>
              {/* Dotted horizontal gridline */}
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#2E343A"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              {/* Y-axis tick label (Monospace) */}
              <text
                x={paddingLeft - 4}
                y={y + 3}
                fill="#5F656B"
                fontSize="8"
                fontFamily="monospace"
                textAnchor="end"
              >
                {tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick}
              </text>
            </g>
          );
        })}

        {/* Optional Threshold Dotted Line (e.g. 1500 lb Rod Float Warning) */}
        {thresholdLine !== undefined && thresholdLine >= minY && thresholdLine <= maxY && (
          <g>
            <line
              x1={paddingLeft}
              y1={getY(thresholdLine)}
              x2={width - paddingRight}
              y2={getY(thresholdLine)}
              stroke="#8C2F2F"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            {thresholdLabel && (
              <text
                x={width - paddingRight}
                y={getY(thresholdLine) - 2}
                fill="#8C2F2F"
                fontSize="7.5"
                fontFamily="monospace"
                textAnchor="end"
              >
                {thresholdLabel}
              </text>
            )}
          </g>
        )}

        {/* X-Axis baseline */}
        <line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={width - paddingRight}
          y2={paddingTop + chartHeight}
          stroke="#2E343A"
          strokeWidth="1"
        />

        {/* X-Axis Ticks */}
        {isSinglePoint ? (
          <text
            x={paddingLeft + chartWidth / 2}
            y={height - 4}
            fill="#8A8F94"
            fontSize="8"
            fontFamily="monospace"
            textAnchor="middle"
          >
            D+{data[0].x} [SINGLE TELEMETRY SAMPLE]
          </text>
        ) : (
          <>
            <text
              x={paddingLeft}
              y={height - 4}
              fill="#5F656B"
              fontSize="8"
              fontFamily="monospace"
            >
              0d
            </text>
            <text
              x={paddingLeft + chartWidth / 2}
              y={height - 4}
              fill="#5F656B"
              fontSize="8"
              fontFamily="monospace"
              textAnchor="middle"
            >
              15d
            </text>
            <text
              x={width - paddingRight}
              y={height - 4}
              fill="#5F656B"
              fontSize="8"
              fontFamily="monospace"
              textAnchor="end"
            >
              30d
            </text>
          </>
        )}

        {/* STRICT REQUIREMENT: Single-Colour Flat Line with NO Fill Gradient Underneath */}
        {data.length > 1 ? (
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="square"
            strokeLinejoin="miter"
            points={linePoints}
          />
        ) : isSinglePoint ? (
          <g>
            {/* Horizontal steady reference line for single data point across width */}
            <line
              x1={paddingLeft}
              y1={getY(Math.max(minY, Math.min(maxY, data[0].y)))}
              x2={width - paddingRight}
              y2={getY(Math.max(minY, Math.min(maxY, data[0].y)))}
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="4,2"
            />
            {/* Centered single reading square marker */}
            <rect
              x={paddingLeft + chartWidth / 2 - 3}
              y={getY(Math.max(minY, Math.min(maxY, data[0].y))) - 3}
              width="6"
              height="6"
              fill={color}
              stroke="#14171A"
              strokeWidth="1"
            />
          </g>
        ) : null}

        {/* Optional Second Line (e.g. Min Rod Load) */}
        {secondData && secondData.length > 1 ? (
          <polyline
            fill="none"
            stroke={secondColor}
            strokeWidth="1.5"
            strokeLinecap="square"
            strokeLinejoin="miter"
            points={secondLinePoints!}
          />
        ) : isSecondSinglePoint ? (
          <g>
            <line
              x1={paddingLeft}
              y1={getY(Math.max(minY, Math.min(maxY, secondData![0].y)))}
              x2={width - paddingRight}
              y2={getY(Math.max(minY, Math.min(maxY, secondData![0].y)))}
              stroke={secondColor}
              strokeWidth="1.5"
              strokeDasharray="4,2"
            />
            <rect
              x={paddingLeft + chartWidth / 2 - 3}
              y={getY(Math.max(minY, Math.min(maxY, secondData![0].y))) - 3}
              width="6"
              height="6"
              fill={secondColor}
              stroke="#14171A"
              strokeWidth="1"
            />
          </g>
        ) : null}

        {/* Latest Data Point Square End Marker for Multi-point series */}
        {data.length > 1 && (
          <rect
            x={getX(data[data.length - 1].x) - 2}
            y={getY(Math.max(minY, Math.min(maxY, data[data.length - 1].y))) - 2}
            width="4"
            height="4"
            fill={color}
          />
        )}

        {secondData && secondData.length > 1 && (
          <rect
            x={getX(secondData[secondData.length - 1].x) - 2}
            y={getY(Math.max(minY, Math.min(maxY, secondData[secondData.length - 1].y))) - 2}
            width="4"
            height="4"
            fill={secondColor}
          />
        )}
      </svg>
    </div>
  );
};

export default ComparisonLineChart;
