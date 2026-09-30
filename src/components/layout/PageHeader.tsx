import React from 'react';

interface PageHeaderProps {
  code: string;
  title: string;
  subtitle?: string;
  badge?: string;
  statusText?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  code,
  title,
  subtitle,
  badge = 'OIL-RAJ-BGW',
  statusText = 'TELEMETRY SYNC',
}) => {
  return (
    <div className="border border-[#2E343A] bg-[#1F2428] px-3 py-2.5 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2 select-none">
      {/* Left: Code, Title (Monospace), Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-[#C9B896] shrink-0" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#C9B896] uppercase tracking-wider">
              [{code}]
            </span>
            <h1 className="font-mono text-sm md:text-base font-bold text-[#E8E6E1] tracking-wide uppercase">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-[11px] font-mono text-[#8A8F94] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Instrumentation Indicators */}
      <div className="flex items-center gap-3 text-[10px] font-mono self-end md:self-auto">
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-[#14171A] border border-[#2E343A] text-[#8A8F94]">
          <span className="text-[#5F656B]">ASSET:</span>
          <span className="text-[#C9B896] font-semibold">{badge}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#14171A] border border-[#2E343A] text-[#3A5F45]">
          <span className="w-1.5 h-1.5 bg-[#3A5F45]" />
          <span className="font-bold">{statusText}</span>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
