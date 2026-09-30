import React from 'react';
import { 
  LayoutGrid,        // Field Overview
  Database,          // Well Fleet (all wells)
  GitCompare,        // Well Comparison
  Cpu,               // Digital Twin (single well deep-dive)
  Flame,             // CSS Cycle Planner
  Activity,          // SRP Control Console
  ListChecks,        // Fleet AI Actions
  AlertTriangle,     // Alerts & Diagnostics
  Wrench,            // Maintenance Log
  ClipboardCheck,    // Audit Log & Traceability
  FileText,          // Reports & Economics
  TrendingUp,        // Historical Trends
  Binary,            // Data & Simulation
  Settings as Cog,   // Settings
  BookOpen,          // About This System / Methodology
  Layers             // Internal Design Tokens Spec
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  route: string;
  code: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tag?: string;
  tagColor?: string;
}

export const navItems: NavItem[] = [
  {
    id: 'field-overview',
    label: 'Field Overview',
    route: '/field-overview',
    code: 'NAV-01',
    icon: LayoutGrid,
    tag: '35 WELLS',
    tagColor: 'text-[#8A8F94]',
  },
  {
    id: 'well-fleet',
    label: 'Well Fleet',
    route: '/well-fleet',
    code: 'NAV-02',
    icon: Database,
    tag: 'FLEET',
    tagColor: 'text-[#C9B896]',
  },
  {
    id: 'well-comparison',
    label: 'Well Comparison',
    route: '/well-comparison',
    code: 'NAV-02B',
    icon: GitCompare,
    tag: 'COMPARE',
    tagColor: 'text-[#C8551D]',
  },
  {
    id: 'digital-twin',
    label: 'Digital Twin',
    route: '/digital-twin',
    code: 'NAV-03',
    icon: Cpu,
    tag: 'T-μ COUPLED',
    tagColor: 'text-[#C9B896]',
  },
  {
    id: 'css-cycle-planner',
    label: 'CSS Cycle Planner',
    route: '/css-cycle-planner',
    code: 'NAV-04',
    icon: Flame,
    tag: 'THERMAL',
    tagColor: 'text-[#C8551D]',
  },
  {
    id: 'srp-control-console',
    label: 'SRP Control Console',
    route: '/srp-control-console',
    code: 'NAV-05',
    icon: Activity,
    tag: 'LIFT',
    tagColor: 'text-[#8A8F94]',
  },
  {
    id: 'fleet-actions',
    label: 'Fleet AI Actions',
    route: '/fleet-actions',
    code: 'NAV-05B',
    icon: ListChecks,
    tag: '8 OPEN',
    tagColor: 'text-[#C8551D]',
  },
  {
    id: 'alerts-diagnostics',
    label: 'Alerts & Diagnostics',
    route: '/alerts-diagnostics',
    code: 'NAV-06',
    icon: AlertTriangle,
    tag: '2 ALERTS',
    tagColor: 'text-[#C8551D]',
  },
  {
    id: 'maintenance-log',
    label: 'Maintenance Log',
    route: '/maintenance-log',
    code: 'NAV-06B',
    icon: Wrench,
    tag: 'MTBF LOG',
    tagColor: 'text-[#C9B896]',
  },
  {
    id: 'audit-log',
    label: 'Audit Log',
    route: '/audit-log',
    code: 'NAV-06C',
    icon: ClipboardCheck,
    tag: 'TRACE',
    tagColor: 'text-[#4E9B68]',
  },
  {
    id: 'reports-economics',
    label: 'Reports & Economics',
    route: '/reports-economics',
    code: 'NAV-07',
    icon: FileText,
    tag: 'OPEX',
    tagColor: 'text-[#8A8F94]',
  },
  {
    id: 'historical-trends',
    label: 'Historical Trends',
    route: '/historical-trends',
    code: 'NAV-07B',
    icon: TrendingUp,
    tag: 'TIME-SERIES',
    tagColor: 'text-[#C9B896]',
  },
  {
    id: 'data-simulation',
    label: 'Data & Simulation',
    route: '/data-simulation',
    code: 'NAV-08',
    icon: Binary,
    tag: 'SCENARIO',
    tagColor: 'text-[#8A8F94]',
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    code: 'NAV-09',
    icon: Cog,
    tag: 'SYS-CFG',
    tagColor: 'text-[#8A8F94]',
  },
];

interface SidebarProps {
  currentRoute: string;
  onNavigate: (routeId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate }) => {
  return (
    <aside 
      className="fixed top-14 bottom-0 left-0 w-14 lg:w-64 bg-[#1F2428] border-r border-[#2E343A] z-40 flex flex-col justify-between select-none transition-none"
      style={{ borderRadius: 0 }}
    >
      {/* Upper Navigation Area */}
      <div className="flex flex-col">
        {/* Navigation Header / Console ID */}
        <div className="px-2 lg:px-3 py-2 bg-[#191D21] border-b border-[#2E343A] flex items-center justify-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#C8551D] shrink-0" style={{ borderRadius: 0 }} />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#8A8F94] uppercase hidden lg:inline">
              CONTROL CONSOLE
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#C9B896] font-semibold hidden lg:inline">BAGHEWALA · RTU-01</span>
        </div>

        {/* Section Label */}
        <div className="px-1 lg:px-3 py-1.5 flex items-center justify-center lg:justify-between text-[10px] font-mono uppercase tracking-wider text-[#8A8F94] bg-[#14171A] border-b border-[#2E343A]">
          <span className="hidden lg:inline">SYSTEM MODULES</span>
          <span className="text-[9px] text-[#5F656B] hidden lg:inline">09 CHANNELS</span>
          <span className="text-[8px] text-[#5F656B] lg:hidden font-bold">NAV</span>
        </div>

        {/* Navigation Items (Exact requested order, solid left orange border, squared selection) */}
        <nav className="py-1 space-y-[1px] overflow-y-auto max-h-[calc(100vh-14.5rem)]">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id || 
              (item.id === 'reports-economics' && currentRoute === 'print-monthly-report') ||
              (item.id === 'settings' && (currentRoute === 'design-tokens' || currentRoute === 'design-system'));
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={`${item.label} (${item.code})`}
                className={`w-full flex items-center justify-center lg:justify-between px-2 lg:px-3 py-3 lg:py-2.5 text-left transition-none text-xs font-medium cursor-pointer ${
                  isActive
                    ? 'bg-[#272E34] text-[#E8E6E1] border-l-[3px] border-[#C8551D]'
                    : 'text-[#8A8F94] hover:text-[#E8E6E1] hover:bg-[#272E34] border-l-[3px] border-transparent'
                }`}
                style={{ borderRadius: 0 }}
              >
                <div className="flex items-center justify-center lg:justify-start gap-2.5 truncate">
                  <Icon 
                    strokeWidth={1.25}
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C8551D]' : 'text-[#8A8F94]'}`} 
                  />
                  <span className={`hidden lg:inline truncate tracking-wide ${isActive ? 'font-semibold text-[#E8E6E1]' : ''}`}>
                    {item.label}
                  </span>
                </div>

                <div className="hidden lg:flex items-center gap-1.5">
                  {item.tag && (
                    <span 
                      className={`text-[9px] font-mono px-1 py-0.5 border border-[#2E343A] bg-[#14171A] ${isActive ? 'border-[#C8551D] text-[#C8551D]' : item.tagColor}`}
                      style={{ borderRadius: 0 }}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Instrumentation & Telemetry Status Box */}
      <div className="p-2 lg:p-3 bg-[#191D21] border-t border-[#2E343A] space-y-2">
        {/* Desktop View */}
        <div className="hidden lg:block space-y-2">
          {/* About This System & Physics Methodology Button */}
          <button
            type="button"
            onClick={() => onNavigate('about-system')}
            className={`w-full py-2 px-2.5 border text-left flex items-center justify-between text-xs font-mono transition-none cursor-pointer ${
              currentRoute === 'about-system'
                ? 'bg-[#272E34] border-[#C8551D] text-[#E8E6E1]'
                : 'bg-[#14171A] hover:bg-[#1E2328] border-[#2E343A] hover:border-[#C8551D] text-[#8A8F94] hover:text-[#E8E6E1]'
            }`}
            style={{ borderRadius: 0 }}
            title="Read detailed engineering physics and ML methodology for judges"
          >
            <div className="flex items-center gap-2 truncate">
              <BookOpen className="w-3.5 h-3.5 text-[#C8551D] shrink-0" />
              <span className="font-bold tracking-wide truncate">About This System</span>
            </div>
            <span className="text-[8.5px] bg-[#C8551D]/20 text-[#C8551D] border border-[#C8551D]/50 px-1 py-0.2 font-bold shrink-0">
              METHODOLOGY
            </span>
          </button>

          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#8A8F94] uppercase">SCADA DCS LINK</span>
            <span className="text-[#3A5F45] font-bold">HEALTHY</span>
          </div>

          <div className="space-y-1 font-mono text-[10px] text-[#8A8F94] bg-[#14171A] border border-[#2E343A] p-2" style={{ borderRadius: 0 }}>
            <div className="flex justify-between">
              <span className="text-[#5F656B]">NODE ID:</span>
              <span className="text-[#E8E6E1]">OIL-RAJ-BGW-01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5F656B]">POLL FREQ:</span>
              <span className="text-[#C8551D] font-bold">1.0 SEC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5F656B]">FORMATION:</span>
              <span className="text-[#C9B896]">JODHPUR HEAVY</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-[#5F656B] pt-0.5">
            <span>OIL INDIA LIMITED</span>
            <button
              type="button"
              onClick={() => onNavigate('design-tokens')}
              className={`hover:text-[#C9B896] hover:underline cursor-pointer transition-none ${
                currentRoute === 'design-tokens' ? 'text-[#C8551D] font-bold' : 'text-[#C9B896]'
              }`}
              title="Open Internal Engineering Design Tokens Reference Page"
            >
              TOKENS SPEC ➔
            </button>
          </div>
        </div>

        {/* Tablet Icon Rail Minimal Indicator */}
        <div className="flex lg:hidden flex-col items-center justify-center py-1 gap-2">
          <button
            type="button"
            onClick={() => onNavigate('about-system')}
            title="About This System // Methodology & Physics"
            className={`p-1.5 border cursor-pointer ${
              currentRoute === 'about-system' 
                ? 'bg-[#C8551D] text-white border-[#C8551D]' 
                : 'bg-[#14171A] text-[#8A8F94] border-[#2E343A] hover:text-[#E8E6E1]'
            }`}
            style={{ borderRadius: 0 }}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C8551D]" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('design-tokens')}
            title="Design Tokens Reference (Internal Specification)"
            className={`p-1.5 border cursor-pointer ${
              currentRoute === 'design-tokens' 
                ? 'bg-[#C8551D] text-white border-[#C8551D]' 
                : 'bg-[#14171A] text-[#8A8F94] border-[#2E343A] hover:text-[#E8E6E1]'
            }`}
            style={{ borderRadius: 0 }}
          >
            <Layers className="w-3.5 h-3.5 text-[#C9B896]" />
          </button>
          <div className="flex flex-col items-center gap-0.5" title="SCADA DCS LINK: HEALTHY (OIL-RAJ-BGW-01)">
            <div className="w-2.5 h-2.5 bg-[#3A5F45]" style={{ borderRadius: 0 }} />
            <span className="text-[7.5px] font-mono text-[#8A8F94] font-bold">DCS</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
