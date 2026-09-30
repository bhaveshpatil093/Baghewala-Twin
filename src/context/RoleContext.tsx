import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'Field Engineer' | 'Viewer';

export interface UserProfile {
  name: string;
  role: UserRole;
  roleTitle: string;
  desk: string;
  email: string;
  department: string;
}

export interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  isFieldEngineer: boolean;
  isViewer: boolean;
  /** Whether current active role has permission to commit / apply recommendations */
  canApplyRecommendations: boolean;
  /** Full profile object for the current role */
  userProfile: UserProfile;
  /** Helper text explaining the access status */
  accessNotice: string;
}

const FIELD_ENGINEER_PROFILE: UserProfile = {
  name: 'Er. A. K. Sharma',
  role: 'Field Engineer',
  roleTitle: 'Sr. Reservoir & Production Engineer',
  desk: 'DESK-04',
  email: 'aksharma@oilindia.in',
  department: 'Jodhpur Basin - Reservoir & Production',
};

const VIEWER_PROFILE: UserProfile = {
  name: 'Operations Auditor',
  role: 'Viewer',
  roleTitle: 'SCADA Operations Viewer (Read-Only)',
  desk: 'AUDIT-DESK',
  email: 'viewer.audit@oilindia.in',
  department: 'DGH Regulatory & Field Surveillance',
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('baghewala_user_role');
      if (saved === 'Viewer' || saved === 'Field Engineer') {
        return saved;
      }
    } catch {
      // LocalStorage unavailable in iframe fallback
    }
    return 'Field Engineer';
  });

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem('baghewala_user_role', newRole);
    } catch {
      // ignore
    }
  }, []);

  const toggleRole = useCallback(() => {
    setRole(role === 'Field Engineer' ? 'Viewer' : 'Field Engineer');
  }, [role, setRole]);

  const isFieldEngineer = role === 'Field Engineer';
  const isViewer = role === 'Viewer';
  const canApplyRecommendations = isFieldEngineer;

  const userProfile = isFieldEngineer ? FIELD_ENGINEER_PROFILE : VIEWER_PROFILE;
  const accessNotice = isFieldEngineer
    ? 'FULL ACCESS: Authorized to inspect telemetry, modify VFD setpoints, and commit CSS dispatch plans.'
    : 'READ-ONLY ACCESS: Authorized to inspect all field readouts, twin models, and AI factors. Recommendation apply actions are access-controlled.';

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        isFieldEngineer,
        isViewer,
        canApplyRecommendations,
        userProfile,
        accessNotice,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export default RoleContext;
