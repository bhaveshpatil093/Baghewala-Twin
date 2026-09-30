import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  strokeWidth?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#C9B896', // Default to Thar desert sand
  height = 24,
  width = 120,
  strokeWidth = 1.25,
}) => {
  if (!data || data.length === 0) {
    return (
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible block opacity-40"
      >
        <line
          x1={2}
          y1={height / 2}
          x2={width - 2}
          y2={height / 2}
          stroke="#2E343A"
          strokeWidth={strokeWidth}
          strokeDasharray="2,2"
        />
      </svg>
    );
  }

  // Gracefully handle single data point: display a steady horizontal line with a centered square marker
  if (data.length === 1) {
    const y = Math.round(height / 2);
    return (
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible block"
      >
        {/* Steady horizontal instantaneous telemetry baseline */}
        <line
          x1={2}
          y1={y}
          x2={width - 2}
          y2={y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray="3,2"
        />
        {/* Centered single reading square marker */}
        <rect
          x={width / 2 - 2}
          y={y - 2}
          width={4}
          height={4}
          fill={color}
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const usableHeight = height - padding * 2;

  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1)) * (width - 4) + 2;
      const y = height - padding - ((val - min) / range) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible block"
    >
      {/* Strict Rule: Single line with NO fill colour */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
        points={points}
      />
    </svg>
  );
};

export default Sparkline;
