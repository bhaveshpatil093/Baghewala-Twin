import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ToastSeverity = 'critical' | 'warning' | 'info';

export interface NotificationToast {
  id: string;
  title: string;
  message: string;
  severity: ToastSeverity;
  timestamp: string;
  wellId?: string;
  triggerMetric?: string;
  actionLabel?: string;
  onAction?: () => void;
  autoDismissMs?: number; // Ignored for 'critical' which always requires manual dismissal
}

interface NotificationContextType {
  toasts: NotificationToast[];
  addToast: (toast: Omit<NotificationToast, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
  notifyCritical: (title: string, message: string, opts?: Partial<NotificationToast>) => string;
  notifyWarning: (title: string, message: string, opts?: Partial<NotificationToast>) => string;
  notifyInfo: (title: string, message: string, opts?: Partial<NotificationToast>) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (toastInput: Omit<NotificationToast, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const generatedId = toastInput.id || `TOAST-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

      const newToast: NotificationToast = {
        ...toastInput,
        id: generatedId,
        timestamp: toastInput.timestamp || `${timeStr} UTC`,
        autoDismissMs: toastInput.severity === 'critical' ? undefined : (toastInput.autoDismissMs ?? 6000),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep maximum 5 on screen

      // Set auto-dismiss timer for non-critical alerts
      if (newToast.severity !== 'critical' && newToast.autoDismissMs && newToast.autoDismissMs > 0) {
        setTimeout(() => {
          dismissToast(generatedId);
        }, newToast.autoDismissMs);
      }

      return generatedId;
    },
    [dismissToast]
  );

  const notifyCritical = useCallback(
    (title: string, message: string, opts?: Partial<NotificationToast>) => {
      return addToast({
        title,
        message,
        severity: 'critical',
        ...opts,
      });
    },
    [addToast]
  );

  const notifyWarning = useCallback(
    (title: string, message: string, opts?: Partial<NotificationToast>) => {
      return addToast({
        title,
        message,
        severity: 'warning',
        ...opts,
      });
    },
    [addToast]
  );

  const notifyInfo = useCallback(
    (title: string, message: string, opts?: Partial<NotificationToast>) => {
      return addToast({
        title,
        message,
        severity: 'info',
        ...opts,
      });
    },
    [addToast]
  );

  // Initialize with a demonstration real-time toast after 2.5s to show the live notification banner
  useEffect(() => {
    const timer = setTimeout(() => {
      addToast({
        id: 'INIT-ALERT-01',
        title: 'ROD-FLOATING HAZARD DETECTED',
        message: 'Polished rod downstroke drag exceeded threshold on BGW-09. Minimum load dropped to 840 lbs.',
        severity: 'critical', // Critical requires manual dismissal!
        wellId: 'BGW-09',
        triggerMetric: 'MPRL: 840 lbs (< 2,000 lbs)',
        actionLabel: 'INSPECT WELL TWIN',
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [addToast]);

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        addToast,
        dismissToast,
        clearAll,
        notifyCritical,
        notifyWarning,
        notifyInfo,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const useNotifications = useNotification;

export default NotificationContext;
