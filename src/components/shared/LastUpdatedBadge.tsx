import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCw } from 'lucide-react';

interface LastUpdatedBadgeProps {
  /** Optional custom label prefix (e.g. 'VFD', 'SCADA', 'DYNO', or omitted) */
  label?: string;
  /** Automatic polling refresh interval in seconds (default 3s for fast SCADA telemetry) */
  pollIntervalSec?: number;
  /** Optional callback fired when manual refresh button is clicked or auto-poll ticks */
  onRefresh?: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

export const LastUpdatedBadge: React.FC<LastUpdatedBadgeProps> = ({
  label,
  pollIntervalSec = 3,
  onRefresh,
  className = '',
}) => {
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  // Tick the seconds counter every 1000ms
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => {
        const next = prev + 1;
        if (next >= pollIntervalSec) {
          // Trigger automated SCADA polling fetch
          if (onRefreshRef.current) {
            onRefreshRef.current();
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pollIntervalSec]);

  const handleManualRefresh = useCallback(() => {
    setIsSpinning(true);
    setSecondsAgo(0);
    if (onRefreshRef.current) {
      onRefreshRef.current();
    }
    setTimeout(() => {
      setIsSpinning(false);
    }, 500);
  }, []);

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#14171A] border border-[#2E343A] font-mono text-[9px] text-[#8A8F94] select-none ${className}`}
      style={{ borderRadius: 0 }}
      title={`Real-time SCADA polling active (interval: ${pollIntervalSec}s). Click refresh button to trigger instantaneous telemetry packet fetch.`}
    >
      {/* Live SCADA indicator pulse square */}
      <span 
        className={`w-1.5 h-1.5 shrink-0 transition-colors duration-100 ease-linear ${
          secondsAgo === 0 || isSpinning ? 'bg-[#4E9B68] ring-1 ring-[#4E9B68]/60' : 'bg-[#3A5F45]'
        }`} 
        style={{ borderRadius: 0 }} 
      />

      {/* Timestamp text: Small squared 'last updated Xs ago' indicator */}
      <span className="font-semibold tracking-wider text-[#C9B896] uppercase">
        {label ? `${label} // ` : ''}LAST UPDATED <span className="text-[#E8E6E1] font-bold">{secondsAgo}s</span> AGO
      </span>

      {/* Manual Refresh Icon Button Beside It */}
      <button
        type="button"
        onClick={handleManualRefresh}
        aria-label="Manual SCADA poll refresh"
        className="p-0.5 text-[#8A8F94] hover:text-[#C8551D] hover:bg-[#1F2428] transition-none cursor-pointer focus:outline-none"
        style={{ borderRadius: 0 }}
        title="Force instantaneous manual SCADA poll"
      >
        <RotateCw 
          className={`w-2.5 h-2.5 ${isSpinning ? 'animate-spin text-[#C8551D]' : ''}`} 
        />
      </button>
    </div>
  );
};

export default LastUpdatedBadge;
