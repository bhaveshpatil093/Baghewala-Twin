import React from 'react';
import { AlertOctagon, RotateCcw, WifiOff, Terminal, ShieldAlert } from 'lucide-react';

interface InlineErrorCardProps {
  title?: string;
  errorCode?: string;
  errorMessage: string;
  technicalDetails?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * Industrial squared red-bordered inline error message.
 * Displays specific error context, technical diagnostics, and a squared 'Retry' button.
 * Designed to keep the engineer in control without ever showing a generic broken-page screen.
 */
export const InlineErrorCard: React.FC<InlineErrorCardProps> = ({
  title = 'SCADA SENSOR TELEMETRY FAULT',
  errorCode = 'ERR_MODBUS_TIMEOUT',
  errorMessage,
  technicalDetails,
  onRetry,
  isRetrying = false,
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={`bg-[#191D21] border-2 border-[#8C2F2F] text-left font-mono select-none shadow-lg ${
        compact ? 'p-3 space-y-2' : 'p-4 space-y-3'
      } ${className}`}
      style={{ borderRadius: 0 }}
      role="alert"
    >
      {/* Top Header Strip with Error Tag & Error Code */}
      <div className="flex items-center justify-between border-b border-[#2E343A] pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#8C2F2F] text-[#FFFFFF]" style={{ borderRadius: 0 }}>
            <AlertOctagon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-[#E8E6E1] uppercase tracking-wider">
            {title}
          </span>
        </div>

        <span className="px-1.5 py-0.5 bg-[#14171A] border border-[#8C2F2F] text-[8px] font-bold text-[#8C2F2F]">
          {errorCode}
        </span>
      </div>

      {/* Specific Error Message */}
      <div className="space-y-1">
        <p className="text-xs text-[#E8E6E1] font-semibold leading-relaxed">
          {errorMessage}
        </p>

        {technicalDetails && (
          <div className="p-2 bg-[#14171A] border border-[#2E343A] text-[8.5px] text-[#8A8F94] font-mono break-all flex items-start gap-1.5 mt-1">
            <Terminal className="w-3 h-3 text-[#8C2F2F] shrink-0 mt-0.5" />
            <span>{technicalDetails}</span>
          </div>
        )}
      </div>

      {/* Squared Action Button Row */}
      {onRetry && (
        <div className="pt-1 flex items-center justify-between">
          <span className="text-[8px] text-[#5F656B] uppercase">
            FAIL-SAFE PROTOCOL: MANUAL RETRY REQUIRED UNDER DGMS OISD-173
          </span>

          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="px-3 py-1 bg-[#8C2F2F] hover:bg-[#A83838] disabled:bg-[#2E343A] text-[#FFFFFF] text-[9.5px] font-bold uppercase flex items-center gap-1.5 transition-none shadow-sm cursor-pointer"
            style={{ borderRadius: 0 }}
          >
            <RotateCcw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'RECONNECTING RTU...' : 'RETRY TELEMETRY LINK'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default InlineErrorCard;
