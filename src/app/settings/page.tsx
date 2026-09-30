import React, { useState } from 'react';
import PageHeader from '@/src/components/layout/PageHeader';
import SquareToggleSwitch from '@/src/components/shared/SquareToggleSwitch';
import { useUnitPreferences, TemperatureUnit, VolumeUnit, PressureUnit } from '@/src/context/UnitPreferencesContext';
import { useRole, UserRole } from '@/src/context/RoleContext';
import { useNotification } from '@/src/context/NotificationContext';
import { useDemoMode } from '@/src/context/DemoModeContext';
import { 
  Bell, 
  Sliders, 
  User, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Key, 
  RotateCcw, 
  Check, 
  Volume2, 
  Activity, 
  Flame, 
  Radio, 
  Thermometer, 
  Layers, 
  Gauge, 
  Server, 
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface NotificationSettingsState {
  criticalRodFloat: boolean;
  thermalDecayAlarm: boolean;
  cssCycleMilestones: boolean;
  dynoCardAnomalies: boolean;
  scadaHeartbeatDrop: boolean;
  morningAiDigest: boolean;
  audibleKlaxon: boolean;
  desktopPush: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationSettingsState = {
  criticalRodFloat: true,
  thermalDecayAlarm: true,
  cssCycleMilestones: true,
  dynoCardAnomalies: true,
  scadaHeartbeatDrop: true,
  morningAiDigest: false,
  audibleKlaxon: true,
  desktopPush: false,
};

interface SettingsPageProps {
  onNavigate?: (route: string) => void;
}

export default function SettingsPage({ onNavigate }: SettingsPageProps = {}) {
  const { 
    preferences, 
    setTemperatureUnit, 
    setVolumeUnit, 
    setPressureUnit,
    formatTemp,
    formatVolume,
    formatPressure
  } = useUnitPreferences();

  const { role, setRole, isFieldEngineer, isViewer, userProfile, accessNotice } = useRole();
  const { notifyCritical, notifyInfo, notifyWarning } = useNotification();
  const { 
    isDemoActive, 
    demoStep, 
    startDemo, 
    stopDemo, 
    goToStep, 
    autoPlay, 
    toggleAutoPlay 
  } = useDemoMode();

  // Notification Preferences State (stored in localStorage or state)
  const [notifications, setNotifications] = useState<NotificationSettingsState>(() => {
    try {
      const saved = localStorage.getItem('baghewala_notif_prefs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Update notification preference
  const updateNotif = (key: keyof NotificationSettingsState, value: boolean) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem('baghewala_notif_prefs', JSON.stringify(next));
      } catch {
        // fallback
      }
      return next;
    });
  };

  const handleResetNotifications = () => {
    setNotifications(DEFAULT_NOTIFICATIONS);
    try {
      localStorage.setItem('baghewala_notif_prefs', JSON.stringify(DEFAULT_NOTIFICATIONS));
    } catch {
      // fallback
    }
    showSavedFeedback('NOTIFICATION PREFERENCES RESTORED TO FIELD DEFAULT');
  };

  const showSavedFeedback = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Test Dispatch
  const handleTestDispatch = () => {
    if (notifications.audibleKlaxon) {
      notifyCritical(
        'TEST DISPATCH: CRITICAL TELEMETRY FAULT',
        'Simulated klaxon trigger: Rod-float threshold violation on BGW-09 downstroke (MPRL: 840 lbs < 2,000 lbs).',
        {
          wellId: 'BGW-09',
          triggerMetric: 'MPRL: 840 lbs',
        }
      );
    } else {
      notifyInfo(
        'TEST NOTIFICATION: SCADA HEARTBEAT NOMINAL',
        'All 35 RTU Modbus nodes streaming telemetry without acoustic klaxon.',
        {
          wellId: 'ALL-PADS',
          triggerMetric: '35/35 Active',
        }
      );
    }
    showSavedFeedback('DISPATCHED TEST SCADA TELEMETRY ALERT');
  };

  return (
    <div className="flex-1 p-4 bg-[#14171A] flex flex-col space-y-4 select-none">
      {/* Page Header */}
      <PageHeader 
        code="NAV-09"
        title="SYSTEM &amp; STATION SETTINGS"
        subtitle="Manage SCADA alarm routing, engineering unit standards, and authenticated operator account credentials"
        badge="SYS-CONFIG"
        statusText={`ROLE: ${role.toUpperCase()} // DESK-04`}
      />

      {/* Save / Feedback Banner */}
      {saveToast && (
        <div 
          className="bg-[#191D21] border border-[#3A5F45] p-2.5 flex items-center justify-between text-xs font-mono text-[#4E9B68] animate-scada-fade"
          style={{ borderRadius: 0 }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4E9B68]" />
            <span className="font-bold">{saveToast}</span>
          </div>
          <span className="text-[9px] text-[#8A8F94] uppercase">COMMITTED TO LOCAL DCS</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HACKATHON DEMO MODE BANNER & SCRIPTED INCIDENT WALKTHROUGH                */}
      {/* ========================================================================= */}
      <section
        className={`p-4 border-2 transition-colors duration-100 ease-linear ${
          isDemoActive ? 'border-[#C8551D] bg-[#1F1914]' : 'border-[#2E343A] bg-[#191D21]'
        }`}
        style={{ borderRadius: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#2E343A]">
          <div className="flex items-start gap-3">
            <div className={`p-2 border shrink-0 mt-0.5 ${
              isDemoActive ? 'border-[#C8551D] bg-[#14171A] text-[#C8551D]' : 'border-[#2E343A] bg-[#14171A] text-[#C9B896]'
            }`} style={{ borderRadius: 0 }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#E8E6E1] uppercase tracking-wider">
                  HACKATHON DEMO MODE // PRE-SCRIPTED INCIDENT WALKTHROUGH
                </span>
                <span className={`px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase border ${
                  isDemoActive 
                    ? 'border-[#C8551D] bg-[#C8551D] text-white' 
                    : 'border-[#2E343A] bg-[#14171A] text-[#8A8F94]'
                }`} style={{ borderRadius: 0 }}>
                  {isDemoActive ? `ACTIVE // STEP 0${demoStep} OF 05` : 'STANDBY'}
                </span>
              </div>
              <p className="font-sans text-xs text-[#C9B896] mt-0.5 max-w-3xl leading-relaxed">
                Walks hackathon judges through an end-to-end operational emergency on well <strong>BGW-09</strong>: rapid thermal decay causes severe rod-floating risk, the AI flags it 14 hours early, computes an optimal VFD trim, commits a SCADA dispatch, and verifies a <strong>+14 BOPD</strong> / <strong>-22% SOR</strong> recovery.
              </p>
            </div>
          </div>

          {/* Squared Sliding Toggle for Demo Mode */}
          <div className="shrink-0 flex items-center gap-3">
            <div className="bg-[#14171A] border border-[#2E343A] px-3 py-1.5 flex items-center gap-3" style={{ borderRadius: 0 }}>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] font-bold text-[#E8E6E1] uppercase">DEMO CONTROLLER:</span>
                <span className="font-mono text-[8px] text-[#8A8F94]">{isDemoActive ? 'SCRIPT RUNNING' : 'INACTIVE'}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isDemoActive}
                onClick={() => {
                  if (isDemoActive) {
                    stopDemo();
                    showSavedFeedback('HACKATHON DEMO MODE TERMINATED');
                  } else {
                    startDemo();
                    showSavedFeedback('HACKATHON SCRIPTED DEMO INITIATED — NAVIGATING TO BGW-09');
                  }
                }}
                className={`relative w-12 h-6 border transition-colors duration-100 ease-linear cursor-pointer flex items-center p-0.5 select-none ${
                  isDemoActive 
                    ? 'border-[#C8551D] bg-[#14171A]' 
                    : 'border-[#2E343A] bg-[#14171A] hover:border-[#3E454D]'
                }`}
                style={{ borderRadius: 0 }}
                title="Toggle Hackathon Pre-Scripted Demo Mode"
              >
                <div 
                  className={`absolute inset-0 transition-opacity duration-100 ease-linear pointer-events-none ${
                    isDemoActive ? 'bg-[#C8551D]/15 opacity-100' : 'opacity-0'
                  }`} 
                />
                <span
                  className={`w-4.5 h-4.5 block shadow-sm transform transition-transform duration-100 ease-linear ${
                    isDemoActive 
                      ? 'translate-x-5.5 bg-[#C8551D]' 
                      : 'translate-x-0 bg-[#5F656B]'
                  }`}
                  style={{ borderRadius: 0 }}
                />
              </button>
            </div>

            {/* Launch / Continue Action Button */}
            <button
              type="button"
              onClick={() => {
                if (!isDemoActive) {
                  startDemo();
                  showSavedFeedback('HACKATHON SCRIPTED DEMO INITIATED — NAVIGATING TO BGW-09');
                } else {
                  goToStep(demoStep);
                }
              }}
              className="py-2 px-3.5 bg-[#C8551D] hover:bg-[#D9652D] text-white font-mono text-[10px] font-bold uppercase transition-none flex items-center gap-1.5 shadow-md cursor-pointer border border-[#C8551D]"
              style={{ borderRadius: 0 }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isDemoActive ? `RESUME TOUR [0${demoStep}/05]` : 'LAUNCH SCRIPTED DEMO'}</span>
            </button>
          </div>
        </div>

        {/* 5-Phase Storyline Roadmap Tiles for Hackathon Judges */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-3 font-mono">
          {[
            {
              step: 1,
              phase: 'PHASE 01',
              title: 'ROD-FLOAT HAZARD',
              metric: 'MPRL: 790 lbs (< 2,000)',
              desc: 'Crude viscosity surges to 1,620 cP; rod string decelerates under viscous drag.',
              status: 'CRITICAL HAZARD',
              color: 'border-[#DE5959] text-[#DE5959]',
            },
            {
              step: 2,
              phase: 'PHASE 02',
              title: 'AI EARLY INFERENCE',
              metric: '+14h 20m LEAD TIME',
              desc: 'Digital Twin identifies dynocard bottom compression flattening early.',
              status: '96.4% CONFIDENCE',
              color: 'border-[#D96B27] text-[#D96B27]',
            },
            {
              step: 3,
              phase: 'PHASE 03',
              title: 'KINEMATIC VFD TRIM',
              metric: '2.6 SPM / 144" STROKE',
              desc: 'Physics solver cuts downstroke speed by 41% to restore safe rod fall.',
              status: '₹14.8L SAVED',
              color: 'border-[#C8551D] text-[#C8551D]',
            },
            {
              step: 4,
              phase: 'PHASE 04',
              title: 'SCADA DISPATCH',
              metric: 'MODBUS HR-40102',
              desc: 'Field Engineer commits setpoint with 82ms RTU acknowledgement loop.',
              status: 'AUDIT COMMITTED',
              color: 'border-[#C9B896] text-[#C9B896]',
            },
            {
              step: 5,
              phase: 'PHASE 05',
              title: 'RECOVERY & PAYOFF',
              metric: 'MPRL: 2,420 lbs (SAFE)',
              desc: 'Rod float eliminated, net production surges +14 BOPD, and SOR drops 22%.',
              status: '+14 BOPD / -22% SOR',
              color: 'border-[#4E9B68] text-[#4E9B68]',
            },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => {
                if (!isDemoActive) startDemo();
                goToStep(item.step);
              }}
              className={`p-2 border bg-[#14171A] text-left transition-none cursor-pointer flex flex-col justify-between ${
                demoStep === item.step && isDemoActive
                  ? `${item.color} ring-1 ring-white bg-[#1C2024]`
                  : 'border-[#2E343A] hover:border-[#3E454D] text-[#8A8F94]'
              }`}
              style={{ borderRadius: 0 }}
            >
              <div className="flex items-center justify-between border-b border-[#252B30] pb-1">
                <span className="text-[8px] font-bold text-[#8A8F94]">{item.phase}</span>
                <span className={`text-[7.5px] font-bold px-1 py-0.2 uppercase border ${item.color}`}>
                  {item.status}
                </span>
              </div>
              <span className="text-[9.5px] font-bold text-[#E8E6E1] mt-1 block">
                {item.title}
              </span>
              <span className="text-[8.5px] text-[#C9B896] font-bold block mt-0.5">
                {item.metric}
              </span>
              <p className="font-sans text-[8.5px] text-[#5F656B] mt-1 leading-tight line-clamp-2">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 3 CORE SQUARED SECTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* ========================================================================= */}
        {/* SECTION 1: NOTIFICATION PREFERENCES (SQUARED SLIDING TOGGLES) (7 COLS)    */}
        {/* ========================================================================= */}
        <section 
          className="lg:col-span-7 bg-[#191D21] border border-[#2E343A] p-4 flex flex-col space-y-3"
          style={{ borderRadius: 0 }}
        >
          {/* Section Header with Monospace Tag */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#2E343A] gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#C9B896]" style={{ borderRadius: 0 }} />
              <div>
                <h2 className="font-mono text-xs font-bold text-[#E8E6E1] uppercase tracking-wider">
                  SEC-01 // SCADA ALARM &amp; NOTIFICATION PREFERENCES
                </h2>
                <span className="font-mono text-[9px] text-[#8A8F94]">
                  REAL-TIME TELEMETRY THRESHOLD ROUTING &amp; ANNUNCIATOR CHANNELS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestDispatch}
                className="px-2.5 py-1 bg-[#14171A] hover:bg-[#22282E] border border-[#2E343A] hover:border-[#C8551D] text-[#C9B896] font-mono text-[9.5px] uppercase font-bold flex items-center gap-1.5 transition-none cursor-pointer"
                style={{ borderRadius: 0 }}
                title="Send a sample SCADA telemetry alert through active channels"
              >
                <Radio className="w-3 h-3 text-[#C9B896]" />
                <span>TEST DISPATCH</span>
              </button>

              <button
                type="button"
                onClick={handleResetNotifications}
                className="p-1 bg-[#14171A] hover:bg-[#22282E] border border-[#2E343A] hover:border-[#8A8F94] text-[#8A8F94] hover:text-[#E8E6E1] transition-none cursor-pointer"
                style={{ borderRadius: 0 }}
                title="Reset all notification switches to field default"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <p className="font-sans text-xs text-[#8A8F94] leading-relaxed">
            Configure automated alarm annunciators and push routing for downhole DTS fiber sensors, surface dynamometer transducers, and VFD inverters. All switches utilize strictly squared industrial sliding contacts.
          </p>

          {/* List of Squared Sliding Toggle Switches */}
          <div className="space-y-1 pt-1 divide-y divide-[#252B30]">
            
            {/* Toggle 1: Critical Rod-Floating Alerts */}
            <SquareToggleSwitch
              id="notif-rod-float"
              checked={notifications.criticalRodFloat}
              onChange={(val) => updateNotif('criticalRodFloat', val)}
              label="Critical Rod-Floating &amp; Compressive Buckling Alerts"
              description="Immediately trigger visual alarms when minimum polished rod load collapses below 2,000 lbs due to severe bitumen drag."
              colorScheme="orange"
            />

            {/* Toggle 2: Thermal Decay Rate Alarms */}
            <SquareToggleSwitch
              id="notif-thermal-decay"
              checked={notifications.thermalDecayAlarm}
              onChange={(val) => updateNotif('thermalDecayAlarm', val)}
              label="Reservoir Thermal Decay &amp; Sandface Cooling Warnings"
              description="Annunciate when downhole DTS temperature rate of decay exceeds -3.0°C per 4 hours or sandface cools below 120°C."
              colorScheme="orange"
            />

            {/* Toggle 3: CSS Cycle Milestones */}
            <SquareToggleSwitch
              id="notif-css-cycle"
              checked={notifications.cssCycleMilestones}
              onChange={(val) => updateNotif('cssCycleMilestones', val)}
              label="Cyclic Steam Stimulation (CSS) Milestones"
              description="Notify upon steam generator target injection completion (e.g. 4,200 tons reached) and soak-to-production transitions."
              colorScheme="green"
            />

            {/* Toggle 4: Dynamometer Card Anomalies */}
            <SquareToggleSwitch
              id="notif-dyno-anomalies"
              checked={notifications.dynoCardAnomalies}
              onChange={(val) => updateNotif('dynoCardAnomalies', val)}
              label="Dynamometer Closed-Loop Card Faults (Fluid Pound / Gas Lock)"
              description="Surface load cell detection of steep downstroke load drops, liquid slugging, or delayed traveling valve reopening."
              colorScheme="orange"
            />

            {/* Toggle 5: SCADA RTU Heartbeat Watchdog */}
            <SquareToggleSwitch
              id="notif-scada-heartbeat"
              checked={notifications.scadaHeartbeatDrop}
              onChange={(val) => updateNotif('scadaHeartbeatDrop', val)}
              label="Modbus RTU Watchdog &amp; Telemetry Polling Failures"
              description="Trigger warnings if a wellhead PLC fails to acknowledge cyclical poll packet requests within 4,000 ms."
              colorScheme="orange"
            />

            {/* Toggle 6: Audible Acoustic Klaxon */}
            <SquareToggleSwitch
              id="notif-audible-klaxon"
              checked={notifications.audibleKlaxon}
              onChange={(val) => updateNotif('audibleKlaxon', val)}
              label="Control Room Audible Klaxon Sound"
              description="Play high-frequency audio warning chime on critical priority faults to alert monitoring operators."
              colorScheme="green"
            />

            {/* Toggle 7: Morning AI Fleet Digest */}
            <SquareToggleSwitch
              id="notif-morning-digest"
              checked={notifications.morningAiDigest}
              onChange={(val) => updateNotif('morningAiDigest', val)}
              label="Daily Morning AI Fleet Recommendation Digest"
              description="Generate a 06:00 IST prioritized dispatch summary of overnight restimulation candidates and VFD trims."
              colorScheme="green"
            />

            {/* Toggle 8: Desktop System Notifications */}
            <SquareToggleSwitch
              id="notif-desktop-push"
              checked={notifications.desktopPush}
              onChange={(val) => updateNotif('desktopPush', val)}
              label="Browser Background Push Notifications"
              description="Deliver OS-level desktop notification banners when the browser tab is minimized or running in background."
              colorScheme="green"
            />

          </div>

          {/* Section Summary Strip */}
          <div className="pt-2 border-t border-[#252B30] flex items-center justify-between text-[9px] font-mono text-[#8A8F94]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#4E9B68]" style={{ borderRadius: 0 }} />
              <span>ROUTING STATUS: 8/8 CHANNELS CONFIGURED</span>
            </div>
            <span>OPC-UA EVENT BUS // RTU-BROKER</span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (5 COLS): UNIT PREFERENCES & ACCOUNT DETAILS                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* ======================================================================= */}
          {/* SECTION 2: UNIT PREFERENCES (METRIC / IMPERIAL)                         */}
          {/* ======================================================================= */}
          <section 
            className="bg-[#191D21] border border-[#2E343A] p-4 flex flex-col space-y-3"
            style={{ borderRadius: 0 }}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#2E343A]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#C9B896]" style={{ borderRadius: 0 }} />
                <div>
                  <h2 className="font-mono text-xs font-bold text-[#E8E6E1] uppercase tracking-wider">
                    SEC-02 // ENGINEERING UNIT PREFERENCES
                  </h2>
                  <span className="font-mono text-[9px] text-[#8A8F94]">
                    TEMPERATURE, FLUID VOLUME &amp; PRESSURE STANDARDS
                  </span>
                </div>
              </div>
              <span className="font-mono text-[9px] text-[#C9B896] uppercase font-bold border border-[#2E343A] px-1.5 py-0.5 bg-[#14171A]">
                SI / FIELD
              </span>
            </div>

            <p className="font-sans text-xs text-[#8A8F94] leading-relaxed">
              Select standard measurement units used across dynocards, thermal decay profiles, and production totals. Conversions apply dynamically throughout all dashboard panels.
            </p>

            {/* 3 Squared Unit Selectors */}
            <div className="space-y-3 pt-1">
              
              {/* Unit 1: Temperature */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#8A8F94] uppercase font-bold flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-[#C8551D]" />
                    TEMPERATURE UNIT
                  </span>
                  <span className="text-[#C9B896] font-bold">
                    {preferences.temperature === 'celsius' ? 'CELSIUS [°C]' : 'FAHRENHEIT [°F]'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTemperatureUnit('celsius');
                      showSavedFeedback('TEMPERATURE STANDARD SET TO CELSIUS (°C)');
                    }}
                    className={`py-2 px-3 border font-mono text-xs transition-none cursor-pointer flex items-center justify-between ${
                      preferences.temperature === 'celsius'
                        ? 'bg-[#14171A] border-[#C8551D] text-[#E8E6E1] font-bold ring-1 ring-[#C8551D]'
                        : 'bg-[#191D21] border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#1E2328]'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 ${preferences.temperature === 'celsius' ? 'bg-[#C8551D]' : 'bg-[#2E343A]'}`} style={{ borderRadius: 0 }} />
                      <span>CELSIUS</span>
                    </div>
                    <strong className="text-[11px] text-[#C9B896]">°C</strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTemperatureUnit('fahrenheit');
                      showSavedFeedback('TEMPERATURE STANDARD SET TO FAHRENHEIT (°F)');
                    }}
                    className={`py-2 px-3 border font-mono text-xs transition-none cursor-pointer flex items-center justify-between ${
                      preferences.temperature === 'fahrenheit'
                        ? 'bg-[#14171A] border-[#C8551D] text-[#E8E6E1] font-bold ring-1 ring-[#C8551D]'
                        : 'bg-[#191D21] border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#1E2328]'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 ${preferences.temperature === 'fahrenheit' ? 'bg-[#C8551D]' : 'bg-[#2E343A]'}`} style={{ borderRadius: 0 }} />
                      <span>FAHRENHEIT</span>
                    </div>
                    <strong className="text-[11px] text-[#C9B896]">°F</strong>
                  </button>
                </div>
              </div>

              {/* Unit 2: Fluid Volume & Cumulative Recovery */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#8A8F94] uppercase font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#3A5F45]" />
                    FLUID VOLUME &amp; STEAM INJECTION
                  </span>
                  <span className="text-[#C9B896] font-bold">
                    {preferences.volume === 'metric' ? 'METRIC [m³ / t]' : 'IMPERIAL [bbl / STB]'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVolumeUnit('metric');
                      showSavedFeedback('VOLUME STANDARD SET TO METRIC (m³ / t)');
                    }}
                    className={`py-2 px-3 border font-mono text-xs transition-none cursor-pointer flex items-center justify-between ${
                      preferences.volume === 'metric'
                        ? 'bg-[#14171A] border-[#3A5F45] text-[#E8E6E1] font-bold ring-1 ring-[#3A5F45]'
                        : 'bg-[#191D21] border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#1E2328]'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 ${preferences.volume === 'metric' ? 'bg-[#3A5F45]' : 'bg-[#2E343A]'}`} style={{ borderRadius: 0 }} />
                      <span>METRIC</span>
                    </div>
                    <strong className="text-[11px] text-[#4E9B68]">m³ / t</strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVolumeUnit('imperial');
                      showSavedFeedback('VOLUME STANDARD SET TO IMPERIAL (bbl / STB)');
                    }}
                    className={`py-2 px-3 border font-mono text-xs transition-none cursor-pointer flex items-center justify-between ${
                      preferences.volume === 'imperial'
                        ? 'bg-[#14171A] border-[#3A5F45] text-[#E8E6E1] font-bold ring-1 ring-[#3A5F45]'
                        : 'bg-[#191D21] border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#1E2328]'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 ${preferences.volume === 'imperial' ? 'bg-[#3A5F45]' : 'bg-[#2E343A]'}`} style={{ borderRadius: 0 }} />
                      <span>OILFIELD IMPERIAL</span>
                    </div>
                    <strong className="text-[11px] text-[#4E9B68]">bbl</strong>
                  </button>
                </div>
              </div>

              {/* Unit 3: Wellhead & Injection Pressure */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#8A8F94] uppercase font-bold flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-[#C9B896]" />
                    PRESSURE STANDARD
                  </span>
                  <span className="text-[#C9B896] font-bold">
                    {preferences.pressure === 'mpa' ? 'MEGAPASCALS [MPa]' : 'POUNDS/SQ IN [psi]'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPressureUnit('mpa');
                      showSavedFeedback('PRESSURE STANDARD SET TO MEGAPASCALS (MPa)');
                    }}
                    className={`py-2 px-3 border font-mono text-xs transition-none cursor-pointer flex items-center justify-between ${
                      preferences.pressure === 'mpa'
                        ? 'bg-[#14171A] border-[#C9B896] text-[#E8E6E1] font-bold ring-1 ring-[#C9B896]'
                        : 'bg-[#191D21] border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#1E2328]'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 ${preferences.pressure === 'mpa' ? 'bg-[#C9B896]' : 'bg-[#2E343A]'}`} style={{ borderRadius: 0 }} />
                      <span>MEGAPASCALS</span>
                    </div>
                    <strong className="text-[11px] text-[#C9B896]">MPa</strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPressureUnit('psi');
                      showSavedFeedback('PRESSURE STANDARD SET TO PSI');
                    }}
                    className={`py-2 px-3 border font-mono text-xs transition-none cursor-pointer flex items-center justify-between ${
                      preferences.pressure === 'psi'
                        ? 'bg-[#14171A] border-[#C9B896] text-[#E8E6E1] font-bold ring-1 ring-[#C9B896]'
                        : 'bg-[#191D21] border-[#2E343A] text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#1E2328]'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 ${preferences.pressure === 'psi' ? 'bg-[#C9B896]' : 'bg-[#2E343A]'}`} style={{ borderRadius: 0 }} />
                      <span>POUNDS / SQ IN</span>
                    </div>
                    <strong className="text-[11px] text-[#C9B896]">psi</strong>
                  </button>
                </div>
              </div>

            </div>

            {/* Dynamic Live Conversion Benchmark Card */}
            <div className="p-2.5 bg-[#14171A] border border-[#2E343A] space-y-1.5 text-[9.5px] font-mono">
              <span className="text-[#8A8F94] uppercase font-bold block border-b border-[#252B30] pb-1">
                LIVE DYNAMIC UNIT CONVERSION PREVIEW [BGW-09 BENCHMARK]:
              </span>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <div>
                  <span className="text-[#5F656B] block">HEAT (BHT):</span>
                  <strong className="text-[#C8551D] text-xs font-bold">{formatTemp(235)}</strong>
                </div>
                <div>
                  <span className="text-[#5F656B] block">STEAM VOL:</span>
                  <strong className="text-[#4E9B68] text-xs font-bold">{formatVolume(4200)}</strong>
                </div>
                <div>
                  <span className="text-[#5F656B] block">PRESSURE:</span>
                  <strong className="text-[#C9B896] text-xs font-bold">{formatPressure(14.2)}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================================= */}
          {/* SECTION 3: ACCOUNT DETAILS & RBAC SECURITY CONTEXT                      */}
          {/* ======================================================================= */}
          <section 
            className="bg-[#191D21] border border-[#2E343A] p-4 flex flex-col space-y-3"
            style={{ borderRadius: 0 }}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#2E343A]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#3A5F45]" style={{ borderRadius: 0 }} />
                <div>
                  <h2 className="font-mono text-xs font-bold text-[#E8E6E1] uppercase tracking-wider">
                    SEC-03 // OPERATOR ACCOUNT DETAILS
                  </h2>
                  <span className="font-mono text-[9px] text-[#8A8F94]">
                    SCADA TERMINAL IDENTIFIER &amp; ROLE AUTHORIZATION
                  </span>
                </div>
              </div>
              <span className="font-mono text-[9px] text-[#4E9B68] font-bold border border-[#3A5F45] px-1.5 py-0.5 bg-[#14171A]">
                ACTIVE LEASE
              </span>
            </div>

            <p className="font-sans text-xs text-[#8A8F94] leading-relaxed">
              Official Oil India Limited (OIL) personnel security certificate and workstation lease for the Baghewala Petroleum Mining Lease (PML).
            </p>

            {/* Operator Attributes Matrix */}
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between items-center p-2 bg-[#14171A] border border-[#2E343A]">
                <span className="text-[#8A8F94]">ENGINEER NAME:</span>
                <strong className="text-[#E8E6E1]">{userProfile.name}</strong>
              </div>

              <div className="flex justify-between items-center p-2 bg-[#14171A] border border-[#2E343A]">
                <span className="text-[#8A8F94]">WORKSTATION DESK:</span>
                <strong className="text-[#C9B896]">{userProfile.desk} [JODHPUR OPS]</strong>
              </div>

              <div className="flex justify-between items-center p-2 bg-[#14171A] border border-[#2E343A]">
                <span className="text-[#8A8F94]">FIELD ASSET LEASE:</span>
                <span className="text-[#E8E6E1]">Baghewala Heavy Oil PML (35 Wells)</span>
              </div>

              <div className="flex justify-between items-center p-2 bg-[#14171A] border border-[#2E343A]">
                <span className="text-[#8A8F94]">DEPARTMENT:</span>
                <span className="text-[#8A8F94]">{userProfile.department}</span>
              </div>

              <div className="flex justify-between items-center p-2 bg-[#14171A] border border-[#2E343A]">
                <span className="text-[#8A8F94]">OFFICIAL EMAIL:</span>
                <span className="text-[#8A8F94]">{userProfile.email}</span>
              </div>

              {/* Role-Based Access Segment inside Account Details */}
              <div className="p-2.5 bg-[#14171A] border border-[#2E343A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#8A8F94] uppercase font-bold">ACTIVE ROLE ASSIGNMENT:</span>
                  <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase ${
                    isFieldEngineer 
                      ? 'border-[#3A5F45] text-[#4E9B68] bg-[#3A5F45]/20' 
                      : 'border-[#D96B27] text-[#D96B27] bg-[#D96B27]/20'
                  }`}>
                    {role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('Field Engineer');
                      showSavedFeedback('ROLE SWITCHED TO FIELD ENGINEER (FULL WRITE ACCESS)');
                    }}
                    className={`p-1.5 border font-mono text-[9.5px] uppercase font-bold flex items-center justify-center gap-1.5 transition-none cursor-pointer ${
                      isFieldEngineer
                        ? 'bg-[#3A5F45] text-[#FFFFFF] border-[#3A5F45]'
                        : 'bg-[#191D21] text-[#8A8F94] border-[#2E343A] hover:text-[#E8E6E1]'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>FIELD ENGINEER</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('Viewer');
                      showSavedFeedback('ROLE SWITCHED TO VIEWER (READ-ONLY AUDIT MODE)');
                    }}
                    className={`p-1.5 border font-mono text-[9.5px] uppercase font-bold flex items-center justify-center gap-1.5 transition-none cursor-pointer ${
                      isViewer
                        ? 'bg-[#D96B27] text-[#FFFFFF] border-[#D96B27]'
                        : 'bg-[#191D21] text-[#8A8F94] border-[#2E343A] hover:text-[#E8E6E1]'
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <Eye className="w-3 h-3" />
                    <span>VIEWER (READ-ONLY)</span>
                  </button>
                </div>

                <p className="font-sans text-[10px] text-[#8A8F94] leading-tight">
                  {accessNotice}
                </p>
              </div>

              {/* Session Security Details */}
              <div className="flex justify-between items-center p-2 bg-[#14171A] border border-[#2E343A]">
                <span className="text-[#8A8F94]">SCADA LEASE EXPIRY:</span>
                <span className="text-[#4E9B68] font-bold">11h 42m (19:30 IST)</span>
              </div>
            </div>

            {/* Account Quick Action Buttons */}
            <div className="pt-2 border-t border-[#252B30] flex items-center justify-between text-[9px] font-mono text-[#8A8F94]">
              <span className="text-[#5F656B]">LDAP SERVER: OIL-JDP-DC01</span>
              <span className="text-[#C9B896]">PML-BAGHEWALA-01</span>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 5: INTERNAL ENGINEERING // DESIGN TOKENS REFERENCE (NOT USER-FACING)*/}
          {/* ========================================================================= */}
          <section className="bg-[#191D21] border border-[#2E343A] p-3 space-y-3 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2E343A] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#C9B896]" style={{ borderRadius: 0 }} />
                <h3 className="text-xs font-bold text-[#E8E6E1] uppercase tracking-wider font-mono">
                  5. INTERNAL ENGINEERING // NEXT.JS DESIGN TOKENS SPECIFICATION
                </h3>
              </div>
              <span className="text-[9px] font-mono text-[#C9B896] bg-[#14171A] border border-[#2E343A] px-1.5 py-0.5 font-bold">
                INTERNAL · FOR TEAM USE
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#14171A] p-3 border border-[#2E343A]">
              <div className="space-y-1">
                <span className="font-bold text-[#E8E6E1] font-mono block">
                  DESIGN TOKEN DICTIONARY &amp; WCAG AA PALETTE MATRIX
                </span>
                <p className="font-sans text-[11px] text-[#8A8F94] leading-relaxed max-w-2xl">
                  Contains every single color token, typography scale, spacing unit, layout constant, and 1-click copyable Tailwind CSS configuration to keep the Next.js migration visually identical.
                </p>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('design-tokens')}
                  className="px-3 py-2 bg-[#C8551D] hover:bg-[#B24816] text-white font-mono text-xs font-bold uppercase transition-none flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
                  style={{ borderRadius: 0 }}
                  title="Open Internal Design Tokens Reference Page"
                >
                  <span>INSPECT DESIGN TOKENS SPEC</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
