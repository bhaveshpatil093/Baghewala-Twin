import React from 'react';

interface SkeletonBlockProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

/**
 * Industrial flat squared skeleton-block placeholder animation.
 * Uses a simple pulsing opacity change (animate-pulse), strictly squared (borderRadius: 0),
 * without any shimmer gradient sweeps.
 */
export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  className = '',
  width,
  height,
  style = {},
}) => {
  return (
    <div
      className={`bg-[#252B30] border border-[#2E343A] opacity-80 select-none ${className}`}
      style={{
        borderRadius: 0,
        width,
        height,
        ...style,
      }}
    />
  );
};

export default SkeletonBlock;
