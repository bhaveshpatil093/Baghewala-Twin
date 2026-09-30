import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Clock, 
  Cpu, 
  SlidersHorizontal,
  ChevronDown,
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  Bot,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Eye,
  Lock
} from 'lucide-react';
import { useNotification } from '@/src/context/NotificationContext';
import { useRole } from '@/src/context/RoleContext';
import { useDemoMode } from '@/src/context/DemoModeContext';
import LastUpdatedBadge from '@/src/components/shared/LastUpdatedBadge';
import { BAGHEWALA_WELLS } from '@/src/data/wellsData';
import DS from '@/src/design-system';

interface TopBarProps {
  currentRoute: string;
  onLockConsole?: () => void;
  onNavigate?: (routeId: string) => void;
  onNavigateWell?: (wellId: string) => void;
  isAssistantOpen?: boolean;
  onToggleAssistant?: () => void;
  onOpenOnboarding?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  currentRoute, 
  onLockConsole, 
  onNavigate,
  onNavigateWell,
  isAssistantOpen,
  onToggleAssistant,
  onOpenOnboarding,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showSimulateMenu, setShowSimulateMenu] = useState<boolean>(false);
  const { notifyCritical, notifyWarning, notifyInfo, toasts } = useNotification();
  const { role, isFieldEngineer, isViewer, toggleRole, userProfile } = useRole();
  const { isDemoActive, demoStep, startDemo, goToStep } = useDemoMode();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Formatted as standard industrial SCADA timestamp: YYYY-MM-DD HH:mm:ss IST
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const dateStr = now.toISOString().slice(0, 10);
      setCurrentTime(`${dateStr} ${timeStr} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateAlert = (severity: 'critical' | 'warning' | 'info') => {
    setShowSimulateMenu(false);
    if (severity === 'critical') {
      notifyCritical(
        'ROD FLOATING & DOWNSTROKE FLUID DRAG',
        'Severe viscous drag on BGW-09 downstroke. Polished rod tension dropped to 790 lbs (rod floating limit: 2,000 lbs).',
        {
          wellId: 'BGW-09',
          triggerMetric: 'MPRL: 790 lbs (< 2,000 lbs)',
          actionLabel: 'OPEN BGW-09 TWIN',
          onAction: () => onNavigateWell ? onNavigateWell('BGW-09') : onNavigate?.('digital-twin'),
        }
      );
    } else if (severity === 'warning') {
      notifyWarning(
        'RAPID BHT THERMAL DECAY DETECTED',
        'Downhole DTS fiber on BGW-04 logged -3.2°C drop in past 4 hours. Viscous drag onset anticipated in +6h.',
        {
          wellId: 'BGW-04',
          triggerMetric: 'BHT: 114.8°C (-3.2°C/4h)',
          actionLabel: 'OPEN BGW-04 TWIN',
          onAction: () => onNavigateWell ? onNavigateWell('BGW-04') : onNavigate?.('digital-twin'),
        }
      );
    } else {
      notifyInfo(
        'CSS STEAM INJECTION TARGET REACHED',
        'Steam Generator SG-02 achieved cumulative 850 tonnes injected into BGW-14 at 78% dryness.',
        {
          wellId: 'BGW-14',
          triggerMetric: 'Cumulative: 850t @ 14.2 MPa',
          actionLabel: 'OPEN BGW-14 TWIN',
          onAction: () => onNavigateWell ? onNavigateWell('BGW-14') : onNavigate?.('digital-twin'),
        }
      );
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#1F2428] border-b border-[#2E343A] z-50 flex items-center justify-between px-4 select-none">
      {/* Left: OIL Logo Placeholder & Field Identifier */}
      <div className="flex items-center gap-4">
        {/* Oil India Limited Logo Placeholder - Sharp Technical Insignia */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#14171A] border border-[#C8551D] flex flex-col items-center justify-center relative">
            <span className="font-bold text-xs tracking-tight text-[#C8551D] leading-none">OIL</span>
            <span className="text-[7px] font-mono text-[#C9B896] tracking-widest leading-none mt-0.5">PSU</span>
            {/* 1px flat square corner accent */}
            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#C8551D]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest uppercase text-[#E8E6E1]">
                OIL INDIA LIMITED
              </span>
              <span className="text-[10px] text-[#2E343A] font-mono">|</span>
              <span className="text-[11px] font-mono tracking-wider text-[#C8551D] font-bold">
                BAGHEWALA TWIN
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="font-semibold text-[#C9B896]">Baghewala Field, Rajasthan</span>
              <span className="text-[#8A8F94]">·</span>
              <span className="font-mono text-[#8A8F94]">Jodhpur Basin (Thar Desert HEC Asset)</span>
            </div>
          </div>
        </div>

        {/* Vertical 1px technical divider */}
        <div className="h-7 w-[1px] bg-[#2E343A] mx-1 hidden lg:block" />

        {/* Telemetry quick status flags (Strict: only #3A5F45 for normal, #C8551D for active) */}
        <div className="hidden xl:flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-[#8A8F94]">
            <Radio strokeWidth={1.25} className="w-3.5 h-3.5 text-[#4E9B68]" />
            <span className="text-[#8A8F94]">SCADA:</span>
            <span className="text-[#4E9B68] font-bold">ONLINE [35/35]</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#8A8F94]">
            <Cpu strokeWidth={1.25} className="w-3.5 h-3.5 text-[#D96B27]" />
            <span className="text-[#8A8F94]">TWIN COUPLING:</span>
            <span className="text-[#E8E6E1] font-semibold">CSS ⇄ SRP SYNC</span>
          </div>
        </div>
      </div>

      {/* Center: System Real-time Heartbeat & Monospace Instrumentation Clock */}
      <div className="hidden md:flex items-center gap-3 bg-[#14171A] border border-[#2E343A] px-3 py-1">
        <div className="flex items-center gap-2">
          <Radio strokeWidth={1.5} className="w-3.5 h-3.5 text-[#4E9B68]" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8F94] font-semibold">
            TELEMETRY LINK:
          </span>
          <span className="text-[9.5px] font-mono font-bold text-[#4E9B68]">
            ACTIVE
          </span>
        </div>
        <div className="w-[1px] h-3 bg-[#2E343A]" />
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#E8E6E1]">
          <Clock strokeWidth={1.25} className="w-3.5 h-3.5 text-[#D96B27]" />
          <span>{currentTime || '2026-09-27 19:45:00 IST'}</span>
        </div>
        <div className="w-[1px] h-3 bg-[#2E343A]" />
        <LastUpdatedBadge label="POLL" pollIntervalSec={3} />

        {/* Direct Well Jump Selector */}
        {onNavigateWell && (
          <>
            <div className="w-[1px] h-3 bg-[#2E343A]" />
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <span className="text-[#8A8F94] text-[9px] uppercase font-bold">JUMP:</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    onNavigateWell(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="bg-[#191D21] border border-[#2E343A] text-[#C9B896] hover:text-[#E8E6E1] text-[9.5px] font-bold px-1.5 py-0.5 outline-none cursor-pointer focus:border-[#C8551D]"
                style={{ borderRadius: 0 }}
                title="Quickly jump to any of the 35 well Digital Twins"
              >
                <option value="" disabled className="bg-[#191D21] text-[#8A8F94]">WELL TWIN...</option>
                {BAGHEWALA_WELLS.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[#191D21] text-[#E8E6E1]">
                    {w.id} ({w.pad}) {w.status !== 'normal' ? `[${w.status.toUpperCase()}]` : ''}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Right: Alarm Annunciator & User Profile */}
      <div className="flex items-center gap-2.5">
        {/* Slide-out AI Assistant Toggle Button */}
        <button
          type="button"
          onClick={onToggleAssistant}
          className={`px-2.5 py-1 border text-[10px] font-mono flex items-center gap-1.5 transition-none cursor-pointer ${
            isAssistantOpen
              ? 'bg-[#C8551D] border-[#C8551D] text-[#FFFFFF] font-bold'
              : 'bg-[#14171A] hover:bg-[#1F2428] border-[#2E343A] hover:border-[#C8551D] text-[#E8E6E1]'
          }`}
          style={{ borderRadius: 0 }}
          title="Toggle AI Engineering Assistant (Baghewala Co-Pilot)"
        >
          <Bot className={`w-3.5 h-3.5 ${isAssistantOpen ? 'text-white' : 'text-[#D96B27]'}`} />
          <span className="hidden sm:inline font-bold">AI CO-PILOT</span>
          <span className="text-[8px] font-bold text-[#4E9B68]">ONLINE</span>
        </button>

        {/* Hackathon Judges Pre-scripted Demo Button */}
        <button
          type="button"
          onClick={() => {
            if (!isDemoActive) {
              startDemo();
            } else {
              goToStep(demoStep);
            }
          }}
          className={`px-2.5 py-1 border text-[10px] font-mono flex items-center gap-1.5 transition-none cursor-pointer font-bold ${
            isDemoActive
              ? 'bg-[#C8551D] border-[#C8551D] text-white'
              : 'bg-[#14171A] hover:bg-[#201A15] border-[#C8551D] text-[#C8551D]'
          }`}
          style={{ borderRadius: 0 }}
          title="Launch Hackathon Judges Scripted Scenario Walkthrough (BGW-09 Rod-Floating Emergency)"
        >
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">{isDemoActive ? `DEMO [0${demoStep}/05]` : 'JUDGES DEMO'}</span>
        </button>

        {/* First-Time User Onboarding Tour Button */}
        {onOpenOnboarding && (
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="px-2 py-1 bg-[#14171A] hover:bg-[#1F2428] border border-[#2E343A] hover:border-[#C9B896] text-[10px] font-mono text-[#8A8F94] hover:text-[#E8E6E1] flex items-center gap-1.5 transition-none cursor-pointer"
            style={{ borderRadius: 0 }}
            title="Replay First-Time Engineering Onboarding Sequence"
          >
            <HelpCircle className="w-3 h-3 text-[#C9B896]" />
            <span className="hidden xl:inline font-bold">TOUR</span>
          </button>
        )}

        {/* Simulate Real-Time Alert Trigger Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSimulateMenu(prev => !prev)}
            className="px-2 py-1 bg-[#14171A] hover:bg-[#1F2428] border border-[#2E343A] hover:border-[#C8551D] text-[10px] font-mono text-[#E8E6E1] flex items-center gap-1.5 transition-none cursor-pointer"
            title="Simulate real-time SCADA alert banner"
          >
            <Bell className="w-3 h-3 text-[#D96B27]" />
            <span className="hidden sm:inline font-bold">TEST ALERT</span>
            <ChevronDown className="w-3 h-3 text-[#8A8F94]" />
          </button>

          {showSimulateMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-[#191D21] border border-[#2E343A] shadow-2xl p-1 z-50 font-mono text-[10px] flex flex-col space-y-1">
              <span className="px-2 py-1 text-[8.5px] text-[#8A8F94] uppercase font-bold border-b border-[#252B30]">
                TRIGGER REAL-TIME SCADA BANNER
              </span>
              <button
                type="button"
                onClick={() => handleSimulateAlert('critical')}
                className="w-full text-left px-2 py-1.5 bg-[#14171A] hover:bg-[#8C2F2F] text-[#FFFFFF] border border-[#8C2F2F] flex items-center gap-2 cursor-pointer"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-[#DE5959] shrink-0" />
                <div>
                  <strong className="block text-[9.5px]">CRITICAL FAULT</strong>
                  <span className="text-[7.5px] text-[#FFFFFF]/75">Requires Manual Dismissal</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateAlert('warning')}
                className="w-full text-left px-2 py-1.5 bg-[#14171A] hover:bg-[#C8551D] text-[#FFFFFF] border border-[#C8551D] flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#D96B27] shrink-0" />
                <div>
                  <strong className="block text-[9.5px]">WARNING ALERT</strong>
                  <span className="text-[7.5px] text-[#FFFFFF]/75">Auto-Dismisses in 6s</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateAlert('info')}
                className="w-full text-left px-2 py-1.5 bg-[#14171A] hover:bg-[#3A5F45] text-[#FFFFFF] border border-[#3A5F45] flex items-center gap-2 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-[#4E9B68] shrink-0" />
                <div>
                  <strong className="block text-[9.5px]">SYSTEM INFO</strong>
                  <span className="text-[7.5px] text-[#FFFFFF]/75">Auto-Dismisses in 6s</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* SCADA Annunciator Status Flags (ISA-18.2 compliant) */}
        <div 
          onClick={() => onNavigate?.('alerts-diagnostics')}
          className="flex items-center border border-[#2E343A] bg-[#14171A] divide-x divide-[#2E343A] cursor-pointer hover:border-[#8A8F94]"
          title="Open Alerts & Diagnostics Page"
        >
          <div className="px-2.5 py-1 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-[#DE5959]" />
            <span className="font-mono text-xs font-bold text-[#DE5959]">
              {toasts.filter(t => t.severity === 'critical').length}
            </span>
            <span className="text-[10px] font-mono text-[#8A8F94] uppercase font-bold">FAULT</span>
          </div>
          <div className="px-2.5 py-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D96B27]" />
            <span className="font-mono text-xs font-bold text-[#D96B27]">
              {Math.max(2, toasts.filter(t => t.severity === 'warning').length)}
            </span>
            <span className="text-[10px] font-mono text-[#8A8F94] uppercase font-bold">ALERT</span>
          </div>
        </div>

        {/* Role-Based Access Control Switcher */}
        <button
          type="button"
          onClick={toggleRole}
          className={`flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[9.5px] transition-none cursor-pointer ${
            isFieldEngineer
              ? 'bg-[#14171A] hover:bg-[#1B221E] border-[#3A5F45] text-[#E8E6E1]'
              : 'bg-[#14171A] hover:bg-[#251E1A] border-[#D96B27] text-[#E8E6E1]'
          }`}
          style={{ borderRadius: 0 }}
          title={
            isFieldEngineer
              ? 'ACTIVE ROLE: Field Engineer (Can view & apply all recommendations). Click to switch to Viewer.'
              : 'ACTIVE ROLE: Viewer (Read-only access. Apply buttons disabled). Click to switch to Field Engineer.'
          }
        >
          {isFieldEngineer ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-[#4E9B68]" />
              <span className="hidden xl:inline text-[#8A8F94]">ROLE:</span>
              <strong className="text-[#4E9B68]">FIELD ENGINEER</strong>
              <span className="text-[7.5px] font-bold bg-[#3A5F45]/30 text-[#4E9B68] px-1 py-0.5 border border-[#3A5F45]/50">
                WRITE PERMITTED
              </span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-[#D96B27]" />
              <span className="hidden xl:inline text-[#8A8F94]">ROLE:</span>
              <strong className="text-[#D96B27]">VIEWER</strong>
              <span className="text-[7.5px] font-bold bg-[#D96B27]/20 text-[#D96B27] px-1 py-0.5 border border-[#D96B27]/50 flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />
                READ-ONLY
              </span>
            </>
          )}
        </button>

        {/* Petroleum Engineer / Viewer User Profile Area */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#2E343A]">
          <div className={`w-8 h-8 bg-[#14171A] border flex items-center justify-center text-xs font-mono font-bold ${
            isFieldEngineer ? 'border-[#3A5F45] text-[#4E9B68]' : 'border-[#D96B27] text-[#D96B27]'
          }`}>
            {isFieldEngineer ? 'ENG' : 'VIEW'}
          </div>
          <div className="flex flex-col text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs font-semibold text-[#E8E6E1]">{userProfile.name}</span>
              <span className={`text-[7.5px] font-mono font-bold px-1 border ${
                isFieldEngineer ? 'text-[#4E9B68] border-[#3A5F45]' : 'text-[#D96B27] border-[#D96B27]'
              }`}>
                {userProfile.role.toUpperCase()}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8A8F94]">
              {userProfile.desk} · {isFieldEngineer ? 'Full Control' : 'Audit Mode'}
            </span>
          </div>
          {onLockConsole && (
            <button
              onClick={onLockConsole}
              title="Lock Console / Logout to Login Screen"
              className="ml-1 px-2 py-1 bg-[#14171A] hover:bg-[#272E34] border border-[#2E343A] hover:border-[#C8551D] text-[10px] font-mono uppercase text-[#8A8F94] hover:text-[#E8E6E1] transition-none"
            >
              LOCK
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
