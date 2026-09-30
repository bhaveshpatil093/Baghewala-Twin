import React, { useEffect, useState } from 'react';
import { useNotification, NotificationToast, ToastSeverity } from '@/src/context/NotificationContext';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  X, 
  ArrowRight, 
  ShieldAlert, 
  CheckSquare, 
  Clock, 
  BellRing,
  ExternalLink
} from 'lucide-react';

interface ToastItemProps {
  toast: NotificationToast;
  onDismiss: (id: string) => void;
  onNavigateWell?: (wellId: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, onNavigateWell }) => {
  const isCritical = toast.severity === 'critical';
  const isWarning = toast.severity === 'warning';
  
  // Progress state for auto-dismiss timer on non-critical toasts
  const [progressPct, setProgressPct] = useState<number>(100);

  useEffect(() => {
    if (isCritical || !toast.autoDismissMs) return;

    const intervalMs = 50;
    const step = (intervalMs / toast.autoDismissMs) * 100;

    const timer = setInterval(() => {
      setProgressPct((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          return 0;
        }
        return prev - step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isCritical, toast.autoDismissMs]);

  // Styling based on severity using flat solid backgrounds matching the severity colour
  const getSeverityTheme = (severity: ToastSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-[#8C2F2F]', // Flat solid rust-red
          borderColor: 'border-[#5C1B1B]',
          timerColor: 'bg-[#FFFFFF]/40',
          badgeBg: 'bg-[#5C1B1B]',
          badgeText: 'text-[#FFFFFF]',
          icon: <AlertOctagon strokeWidth={2} className="w-5 h-5 text-[#FFFFFF] shrink-0" />,
          label: 'CRITICAL ALARM',
        };
      case 'warning':
        return {
          bgColor: 'bg-[#C8551D]', // Flat solid rig-orange
          borderColor: 'border-[#8C3A12]',
          timerColor: 'bg-[#FFFFFF]/35',
          badgeBg: 'bg-[#8C3A12]',
          badgeText: 'text-[#FFFFFF]',
          icon: <AlertTriangle strokeWidth={2} className="w-5 h-5 text-[#FFFFFF] shrink-0" />,
          label: 'PREDICTIVE WARNING',
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-[#3A5F45]', // Flat solid slate-green
          borderColor: 'border-[#243F2D]',
          timerColor: 'bg-[#FFFFFF]/35',
          badgeBg: 'bg-[#243F2D]',
          badgeText: 'text-[#FFFFFF]',
          icon: <Info strokeWidth={2} className="w-5 h-5 text-[#FFFFFF] shrink-0" />,
          label: 'SYSTEM NOTICE',
        };
    }
  };

  const theme = getSeverityTheme(toast.severity);

  const handleAction = () => {
    if (toast.onAction) {
      toast.onAction();
    } else if (toast.wellId && onNavigateWell) {
      onNavigateWell(toast.wellId);
    }
    onDismiss(toast.id);
  };

  return (
    <div
      role="alert"
      className={`pointer-events-auto w-full border-2 ${theme.borderColor} ${theme.bgColor} text-[#FFFFFF] p-3 flex flex-col space-y-2 relative transition-opacity duration-100 ease-linear rounded-none font-mono select-none`}
      style={{
        animation: 'slideInRight 120ms linear forwards',
      }}
    >
      {/* Toast Top Bar: Tag, Monospace Timestamp, and Manual Dismissal 'X' */}
      <div className="flex items-center justify-between border-b border-[#FFFFFF]/25 pb-1.5 text-[9px]">
        <div className="flex items-center gap-2">
          {theme.icon}
          <span className={`px-1.5 py-0.5 font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText}`}>
            {theme.label}
          </span>
          {toast.wellId && (
            <span className="font-bold text-[#FFFFFF] px-1 py-0.5 bg-[#000000]/30 border border-[#FFFFFF]/30">
              {toast.wellId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9.5px] text-[#F5F4F0]/80">
            {toast.timestamp}
          </span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="p-1 hover:bg-[#000000]/25 text-[#FFFFFF] hover:text-[#FFFFFF] transition-none rounded-none"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Toast Content: Title & Plain-Language Message */}
      <div className="space-y-1">
        <h4 className="font-bold text-xs text-[#FFFFFF] uppercase tracking-wide leading-tight">
          {toast.title}
        </h4>
        <p className="text-[10px] text-[#F5F4F0] leading-relaxed">
          {toast.message}
        </p>
      </div>

      {/* Trigger Metric Callout if provided */}
      {toast.triggerMetric && (
        <div className="bg-[#000000]/25 border border-[#FFFFFF]/20 px-2 py-1 flex items-center justify-between text-[9px]">
          <span className="text-[#F5F4F0]/80 uppercase">TRIGGER SENSOR:</span>
          <span className="font-bold text-[#FFFFFF]">{toast.triggerMetric}</span>
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-between pt-1 gap-2">
        {/* Left: Dismissal Status Requirement */}
        <div className="text-[8.5px]">
          {isCritical ? (
            <span className="bg-[#000000]/40 text-[#FFFFFF] px-1.5 py-0.5 font-bold uppercase border border-[#FFFFFF]/30 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#FFFFFF]" />
              MANUAL ACKNOWLEDGMENT REQUIRED
            </span>
          ) : (
            <span className="text-[#F5F4F0]/75">
              AUTO-DISMISSING ({(progressPct / 100 * ((toast.autoDismissMs || 6000) / 1000)).toFixed(0)}s)
            </span>
          )}
        </div>

        {/* Right: Action and Dismiss Buttons */}
        <div className="flex items-center gap-1.5">
          {(toast.actionLabel || toast.wellId) && (
            <button
              type="button"
              onClick={handleAction}
              className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F5F4F0] text-[#14171A] font-bold text-[9px] uppercase transition-none flex items-center gap-1 shadow-sm"
            >
              <span>{toast.actionLabel || `OPEN ${toast.wellId}`}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {isCritical && (
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="px-2.5 py-1 bg-[#000000]/40 hover:bg-[#000000]/60 text-[#FFFFFF] border border-[#FFFFFF]/40 font-bold text-[9px] uppercase transition-none"
            >
              ACKNOWLEDGE
            </button>
          )}
        </div>
      </div>

      {/* Timer Bar for Auto-Dismissing Toasts (Non-Critical) */}
      {!isCritical && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#000000]/30 overflow-hidden">
          <div
            className={`h-full ${theme.timerColor} transition-all duration-75 ease-linear`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
};

interface NotificationToastContainerProps {
  onNavigateWell?: (wellId: string) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({ 
  onNavigateWell 
}) => {
  const { toasts, dismissToast, clearAll } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <>
      {/* Keyframe animation injected into DOM */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Fixed Toast Banner Stack in Top-Right Corner */}
      <aside
        aria-label="Real-time alerts"
        className="fixed top-16 right-4 z-50 flex flex-col space-y-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
      >
        {/* Banner Stack Header when multiple alerts exist */}
        {toasts.length > 2 && (
          <div className="pointer-events-auto self-end bg-[#191D21] border border-[#2E343A] px-2 py-0.5 flex items-center gap-2 text-[9px] font-mono text-[#8A8F94]">
            <span>{toasts.length} ACTIVE ALERTS IN STACK</span>
            <button
              type="button"
              onClick={clearAll}
              className="text-[#C8551D] hover:underline font-bold uppercase"
            >
              DISMISS ALL
            </button>
          </div>
        )}

        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
            onNavigateWell={onNavigateWell}
          />
        ))}
      </aside>
    </>
  );
};

export default NotificationToastContainer;
