import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  subMessage?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Industrial flat empty state component.
 * Displays a simple flat icon with a short grey monospace sentence
 * (e.g. 'No active alerts for this well') rather than any cartoon illustration.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  message,
  subMessage,
  actionText,
  onAction,
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={`bg-[#14171A] border border-[#2E343A] flex flex-col items-center justify-center text-center font-mono select-none ${
        compact ? 'p-4 space-y-1.5' : 'p-8 space-y-3'
      } ${className}`}
      style={{ borderRadius: 0 }}
    >
      {Icon && (
        <div
          className="p-2 bg-[#191D21] border border-[#2E343A] text-[#8A8F94]"
          style={{ borderRadius: 0 }}
        >
          <Icon strokeWidth={1.25} className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
        </div>
      )}

      <div className="space-y-1">
        <p className="text-xs text-[#8A8F94] uppercase tracking-wider font-bold">
          {message}
        </p>
        {subMessage && (
          <p className="text-[9px] text-[#5F656B] max-w-md">
            {subMessage}
          </p>
        )}
      </div>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 px-3 py-1 bg-[#191D21] hover:bg-[#252B30] border border-[#2E343A] hover:border-[#C8551D] text-[#C9B896] hover:text-[#FFFFFF] text-[9.5px] uppercase font-bold transition-none cursor-pointer"
          style={{ borderRadius: 0 }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
