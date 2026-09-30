import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type AuditCategory = 'SRP_KINEMATICS' | 'CSS_THERMAL' | 'WELLBORE_INTEGRITY' | 'POWER_TARIFF';
export type AuditStatus = 'COMMITTED_SCADA' | 'DISPATCHED_RTU' | 'SCHEDULED' | 'VERIFIED';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO or SCADA IST format
  wellId: string;
  pad: string;
  category: AuditCategory;
  parameter: string;
  previousValue: string;
  appliedValue: string;
  diffSummary?: string;
  appliedBy: string;
  role: string;
  desk: string;
  status: AuditStatus;
  modbusRegister?: string;
  reasoning: string;
  confidenceScore: number;
  expectedGain?: string;
  acknowledgementMs?: number;
}

const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-2026-0929-012',
    timestamp: '2026-09-29 10:14:22 IST',
    wellId: 'BGW-09',
    pad: 'PAD-B',
    category: 'SRP_KINEMATICS',
    parameter: 'Pumping Speed (SPM)',
    previousValue: '4.2 SPM',
    appliedValue: '2.6 SPM',
    diffSummary: '-1.6 SPM (-38%)',
    appliedBy: 'Er. A. K. Sharma',
    role: 'Sr. Reservoir & Production Engineer',
    desk: 'DESK-04',
    status: 'COMMITTED_SCADA',
    modbusRegister: 'HR-40102 (VFD_FREQ_CMD)',
    reasoning: 'Downstroke load dropped below 840 lbs due to 1,620 cP crude viscous drag. Cutting speed restored MPRL > 2,200 lbs to prevent rod floating.',
    confidenceScore: 96,
    expectedGain: 'Mitigate rod part risk; +14 BOPD net',
    acknowledgementMs: 84,
  },
  {
    id: 'AUD-2026-0929-011',
    timestamp: '2026-09-29 09:42:15 IST',
    wellId: 'BGW-09',
    pad: 'PAD-B',
    category: 'SRP_KINEMATICS',
    parameter: 'Polished Rod Stroke Length',
    previousValue: '168 in (Pos 3)',
    appliedValue: '144 in (Pos 2)',
    diffSummary: '-24 in (-14%)',
    appliedBy: 'Er. A. K. Sharma',
    role: 'Sr. Reservoir & Production Engineer',
    desk: 'DESK-04',
    status: 'COMMITTED_SCADA',
    modbusRegister: 'HR-40108 (STROKE_CONFIG)',
    reasoning: 'Shortened beam stroke reduces peak downstroke velocity by 41%, eliminating fluid pound impact on pump barrel draw.',
    confidenceScore: 94,
    expectedGain: 'Eliminate fluid pound shock',
    acknowledgementMs: 92,
  },
  {
    id: 'AUD-2026-0929-010',
    timestamp: '2026-09-29 08:30:00 IST',
    wellId: 'BGW-04',
    pad: 'PAD-A',
    category: 'CSS_THERMAL',
    parameter: 'Steam Cycle Dispatch Allocation',
    previousValue: 'Cycle 02 (Soaking)',
    appliedValue: 'Cycle 03 (4,200 t @ 14.2 MPa)',
    diffSummary: '+1,400 t steam allocation',
    appliedBy: 'Er. P. K. Rathore',
    role: 'Field Operations Superintendent',
    desk: 'FIELD-RTU-01',
    status: 'SCHEDULED',
    modbusRegister: 'HR-40301 (STEAM_GEN_SG01)',
    reasoning: 'Sandface temperature decayed to 114.8°C (-3.2°C/4h). Commencing Cycle 03 injection restores reservoir thermal bank in Jodhpur Sandstone.',
    confidenceScore: 98,
    expectedGain: '+42 BOPD peak post-soak',
    acknowledgementMs: 110,
  },
  {
    id: 'AUD-2026-0929-009',
    timestamp: '2026-09-29 07:15:48 IST',
    wellId: 'BGW-14',
    pad: 'PAD-C',
    category: 'SRP_KINEMATICS',
    parameter: 'VFD Output Frequency',
    previousValue: '35.1 Hz (4.2 SPM)',
    appliedValue: '25.0 Hz (3.0 SPM)',
    diffSummary: '-10.1 Hz (-28.8%)',
    appliedBy: 'Er. V. Sundaram',
    role: 'SCADA Control Room Specialist',
    desk: 'DESK-02',
    status: 'DISPATCHED_RTU',
    modbusRegister: 'HR-40102 (VFD_FREQ_CMD)',
    reasoning: 'Acoustic fluid level echo indicated pump fillage dropped to 62%. Speed trim matches reservoir inflow recharge rate.',
    confidenceScore: 91,
    expectedGain: 'Power savings 6.4 kW; pump protection',
    acknowledgementMs: 76,
  },
  {
    id: 'AUD-2026-0928-008',
    timestamp: '2026-09-28 17:50:33 IST',
    wellId: 'BGW-22',
    pad: 'PAD-D',
    category: 'WELLBORE_INTEGRITY',
    parameter: 'Sinker Bar Assembly',
    previousValue: 'Standard 220 lbs Steel',
    appliedValue: '500 lbs Tungsten Heavy Sinker',
    diffSummary: '+280 lbs downward gravitational force',
    appliedBy: 'Er. P. K. Rathore',
    role: 'Field Operations Superintendent',
    desk: 'FIELD-RTU-02',
    status: 'VERIFIED',
    modbusRegister: 'LOG-MECH-8821',
    reasoning: 'Downhole mechanical drag exceeded buoyant weight of 7/8" rod string in 1,840 cP cooled crude during winter night hours.',
    confidenceScore: 95,
    expectedGain: 'Prevent rod string parting ($18k workover saved)',
    acknowledgementMs: 140,
  },
  {
    id: 'AUD-2026-0928-007',
    timestamp: '2026-09-28 14:22:10 IST',
    wellId: 'BGW-01',
    pad: 'PAD-A',
    category: 'POWER_TARIFF',
    parameter: 'VFD Night Tariff Scheduling',
    previousValue: 'Fixed 3.8 SPM continuous',
    appliedValue: '3.2 SPM (Day) / 4.6 SPM (Night 22:00-06:00)',
    diffSummary: 'Off-peak power tariff optimization',
    appliedBy: 'Er. A. K. Sharma',
    role: 'Sr. Reservoir & Production Engineer',
    desk: 'DESK-04',
    status: 'COMMITTED_SCADA',
    modbusRegister: 'HR-40210 (TARIFF_CYCLE)',
    reasoning: 'Off-peak power tariff reduction (₹4.20/kWh vs ₹8.60/kWh) reduces lifting OPEX by 21% while maintaining average 3.8 SPM drawdown.',
    confidenceScore: 89,
    expectedGain: '₹142,000 monthly power OPEX savings',
    acknowledgementMs: 65,
  },
  {
    id: 'AUD-2026-0928-006',
    timestamp: '2026-09-28 11:05:19 IST',
    wellId: 'BGW-18',
    pad: 'PAD-C',
    category: 'CSS_THERMAL',
    parameter: 'Soak Duration Extension',
    previousValue: '4 Days Scheduled',
    appliedValue: '6 Days Optimized Soak',
    diffSummary: '+2 Days thermal conduction soak',
    appliedBy: 'Er. A. K. Sharma',
    role: 'Sr. Reservoir & Production Engineer',
    desk: 'DESK-04',
    status: 'COMMITTED_SCADA',
    modbusRegister: 'HR-40304 (SOAK_TIMER_HR)',
    reasoning: 'Numerical simulation indicates 6-day soak achieves uniform heating of 22m radius in 18% porosity Jodhpur sandstone, reducing initial SOR to 2.4.',
    confidenceScore: 93,
    expectedGain: 'SOR reduction from 3.2 to 2.4 m³/m³',
    acknowledgementMs: 88,
  },
  {
    id: 'AUD-2026-0927-005',
    timestamp: '2026-09-27 16:30:42 IST',
    wellId: 'BGW-31',
    pad: 'PAD-D',
    category: 'SRP_KINEMATICS',
    parameter: 'Pumping Speed (SPM)',
    previousValue: '1.8 SPM',
    appliedValue: '2.8 SPM',
    diffSummary: '+1.0 SPM (+55%)',
    appliedBy: 'Er. V. Sundaram',
    role: 'SCADA Control Room Specialist',
    desk: 'DESK-02',
    status: 'COMMITTED_SCADA',
    modbusRegister: 'HR-40102 (VFD_FREQ_CMD)',
    reasoning: 'Post-soak sandface temperature peaked at 245°C. Lower crude viscosity (180 cP) permits higher drawdown without rod friction.',
    confidenceScore: 97,
    expectedGain: '+28 BOPD incremental production',
    acknowledgementMs: 70,
  },
];

export interface AuditLogContextType {
  logs: AuditLogEntry[];
  addAuditEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  exportToCsv: () => void;
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);

export const AuditLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('baghewala_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return SEED_AUDIT_LOGS;
  });

  const saveLogs = useCallback((newLogs: AuditLogEntry[]) => {
    setLogs(newLogs);
    try {
      localStorage.setItem('baghewala_audit_logs', JSON.stringify(newLogs));
    } catch {
      // fallback
    }
  }, []);

  const addAuditEntry = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
    const formattedTimestamp = `${dateStr} ${timeStr} IST`;
    
    const count = logs.length + 1;
    const countFormatted = String(count).padStart(3, '0');
    const id = `AUD-${dateStr.replace(/-/g, '')}-${countFormatted}`;

    const newRecord: AuditLogEntry = {
      ...entry,
      id,
      timestamp: formattedTimestamp,
    };

    saveLogs([newRecord, ...logs]);
  }, [logs, saveLogs]);

  const clearLogs = useCallback(() => {
    saveLogs([]);
  }, [saveLogs]);

  const exportToCsv = useCallback(() => {
    if (logs.length === 0) return;

    const headers = [
      'Audit ID',
      'Timestamp (IST)',
      'Well ID',
      'Pad',
      'Category',
      'Parameter',
      'Previous Value',
      'Applied Value',
      'Diff Summary',
      'Applied By',
      'Role',
      'Workstation Desk',
      'SCADA Status',
      'Modbus Register',
      'Engineering Justification',
      'AI Confidence (%)',
      'Expected Gain',
    ];

    const rows = logs.map(l => [
      l.id,
      l.timestamp,
      l.wellId,
      l.pad,
      l.category,
      `"${l.parameter.replace(/"/g, '""')}"`,
      `"${l.previousValue.replace(/"/g, '""')}"`,
      `"${l.appliedValue.replace(/"/g, '""')}"`,
      `"${(l.diffSummary || '').replace(/"/g, '""')}"`,
      `"${l.appliedBy.replace(/"/g, '""')}"`,
      `"${l.role.replace(/"/g, '""')}"`,
      l.desk,
      l.status,
      l.modbusRegister || '',
      `"${l.reasoning.replace(/"/g, '""')}"`,
      `${l.confidenceScore}%`,
      `"${(l.expectedGain || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OIL_BAGHEWALA_AUDIT_TRAIL_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [logs]);

  return (
    <AuditLogContext.Provider value={{ logs, addAuditEntry, clearLogs, exportToCsv }}>
      {children}
    </AuditLogContext.Provider>
  );
};

export const useAuditLog = (): AuditLogContextType => {
  const context = useContext(AuditLogContext);
  if (!context) {
    throw new Error('useAuditLog must be used within an AuditLogProvider');
  }
  return context;
};

export default AuditLogContext;
