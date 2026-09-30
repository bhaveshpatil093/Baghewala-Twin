/**
 * Baghewala Twin - AI-enabled Well-to-Surface Digital Twin platform
 * Oil India Limited (OIL), Baghewala Heavy Oil Field, Rajasthan
 * Smart India Hackathon
 */

import React, { useState } from 'react';
import RootLayout from '@/src/app/layout';
import LoginScreen from '@/src/components/auth/LoginScreen';
import { NotificationProvider } from '@/src/context/NotificationContext';
import { SimulationProvider } from '@/src/context/SimulationContext';
import { RoleProvider } from '@/src/context/RoleContext';
import { UnitPreferencesProvider } from '@/src/context/UnitPreferencesContext';

// Routed Pages
import FieldOverviewPage from '@/src/app/field-overview/page';
import WellFleetPage from '@/src/app/well-fleet/page';
import WellComparisonPage from '@/src/app/well-comparison/page';
import DigitalTwinPage from '@/src/app/digital-twin/page';
import CssCyclePlannerPage from '@/src/app/css-cycle-planner/page';
import SrpControlConsolePage from '@/src/app/srp-control-console/page';
import FleetActionsPage from '@/src/app/fleet-actions/page';
import AlertsDiagnosticsPage from '@/src/app/alerts-diagnostics/page';
import MaintenanceLogPage from '@/src/app/maintenance-log/page';
import AuditLogPage from '@/src/app/audit-log/page';
import ReportsEconomicsPage from '@/src/app/reports-economics/page';
import HistoricalTrendsPage from '@/src/app/historical-trends/page';
import PrintableMonthlyReport from '@/src/components/reports/PrintableMonthlyReport';
import DataSimulationPage from '@/src/app/data-simulation/page';
import SettingsPage from '@/src/app/settings/page';
import AboutSystemPage from '@/src/app/about-system/page';
import DesignTokensPage from '@/src/app/design-tokens/page';
import { AuditLogProvider } from '@/src/context/AuditLogContext';
import { DemoModeProvider, useDemoMode } from '@/src/context/DemoModeContext';
import DemoCalloutOverlay from '@/src/components/demo/DemoCalloutOverlay';

interface AppContentProps {
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  selectedWellId: string;
  setSelectedWellId: (wellId: string) => void;
  handleLockConsole: () => void;
  handleNavigateToWell: (wellId: string) => void;
  renderActiveRoute: () => React.ReactNode;
}

const AppContent: React.FC<AppContentProps> = ({
  currentRoute,
  setCurrentRoute,
  selectedWellId,
  setSelectedWellId,
  handleLockConsole,
  handleNavigateToWell,
  renderActiveRoute,
}) => {
  const { registerNavigationHandler } = useDemoMode();

  React.useEffect(() => {
    registerNavigationHandler((route: string, wellId?: string) => {
      if (wellId) {
        setSelectedWellId(wellId);
      }
      setCurrentRoute(route);
    });
  }, [registerNavigationHandler, setCurrentRoute, setSelectedWellId]);

  return (
    <RootLayout 
      currentRoute={currentRoute} 
      onNavigate={setCurrentRoute}
      onLockConsole={handleLockConsole}
      onNavigateWell={handleNavigateToWell}
    >
      {renderActiveRoute()}
      <DemoCalloutOverlay />
    </RootLayout>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<string>('field-overview');
  const [selectedWellId, setSelectedWellId] = useState<string>('BGW-09');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLockConsole = () => {
    setIsAuthenticated(false);
  };

  const handleNavigateToWell = (wellId: string) => {
    setSelectedWellId(wellId);
    setCurrentRoute('digital-twin');
  };

  if (!isAuthenticated) {
    return (
      <RoleProvider>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </RoleProvider>
    );
  }

  const renderActiveRoute = () => {
    switch (currentRoute) {
      case 'field-overview':
        return <FieldOverviewPage onNavigateToWell={handleNavigateToWell} />;
      case 'well-fleet':
        return (
          <WellFleetPage 
            onNavigateToWell={handleNavigateToWell} 
            onNavigateToComparison={() => setCurrentRoute('well-comparison')} 
          />
        );
      case 'well-comparison':
        return <WellComparisonPage onNavigateToWell={handleNavigateToWell} />;
      case 'digital-twin':
        return (
          <DigitalTwinPage 
            selectedWellId={selectedWellId} 
            onSelectWell={setSelectedWellId} 
          />
        );
      case 'css-cycle-planner':
        return <CssCyclePlannerPage onNavigateToWell={handleNavigateToWell} />;
      case 'srp-control-console':
        return <SrpControlConsolePage onNavigateToWell={handleNavigateToWell} />;
      case 'fleet-actions':
        return <FleetActionsPage onNavigateToWell={handleNavigateToWell} />;
      case 'alerts-diagnostics':
        return <AlertsDiagnosticsPage onNavigateToWell={handleNavigateToWell} />;
      case 'maintenance-log':
        return <MaintenanceLogPage onNavigateToWell={handleNavigateToWell} />;
      case 'audit-log':
        return <AuditLogPage onNavigateToWell={handleNavigateToWell} />;
      case 'reports-economics':
        return <ReportsEconomicsPage onNavigateToWell={handleNavigateToWell} />;
      case 'historical-trends':
        return <HistoricalTrendsPage onNavigateToWell={handleNavigateToWell} />;
      case 'print-monthly-report':
        return (
          <PrintableMonthlyReport 
            initialWellId={selectedWellId} 
            onClose={() => setCurrentRoute('reports-economics')} 
            onNavigateToWell={handleNavigateToWell}
          />
        );
      case 'data-simulation':
        return <DataSimulationPage onNavigateToWell={handleNavigateToWell} />;
      case 'settings':
        return <SettingsPage onNavigate={setCurrentRoute} />;
      case 'design-tokens':
      case 'design-system':
        return <DesignTokensPage onNavigate={setCurrentRoute} />;
      case 'about-system':
        return <AboutSystemPage onNavigateToRoute={setCurrentRoute} onNavigateToWell={handleNavigateToWell} />;
      default:
        return <FieldOverviewPage onNavigateToWell={handleNavigateToWell} />;
    }
  };

  return (
    <RoleProvider>
      <UnitPreferencesProvider>
        <AuditLogProvider>
          <DemoModeProvider>
            <NotificationProvider>
              <SimulationProvider>
                <AppContent
                  currentRoute={currentRoute}
                  setCurrentRoute={setCurrentRoute}
                  selectedWellId={selectedWellId}
                  setSelectedWellId={setSelectedWellId}
                  handleLockConsole={handleLockConsole}
                  handleNavigateToWell={handleNavigateToWell}
                  renderActiveRoute={renderActiveRoute}
                />
              </SimulationProvider>
            </NotificationProvider>
          </DemoModeProvider>
        </AuditLogProvider>
      </UnitPreferencesProvider>
    </RoleProvider>
  );
}
