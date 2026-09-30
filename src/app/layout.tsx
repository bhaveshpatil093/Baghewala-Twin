import React, { useState } from 'react';
import { TopBar } from '@/src/components/navigation/TopBar';
import { Sidebar } from '@/src/components/navigation/Sidebar';
import { SimulationControlStrip } from '@/src/components/navigation/SimulationControlStrip';
import NotificationToastContainer from '@/src/components/notifications/NotificationToastContainer';
import AiAssistantSidePanel from '@/src/components/navigation/AiAssistantSidePanel';
import OnboardingModal from '@/src/components/navigation/OnboardingModal';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (routeId: string) => void;
  onLockConsole?: () => void;
  onNavigateWell?: (wellId: string) => void;
}

export const RootLayout: React.FC<LayoutProps> = ({ 
  children, 
  currentRoute, 
  onNavigate,
  onLockConsole,
  onNavigateWell,
}) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('baghewala_onboarding_completed') !== 'true';
  });

  return (
    <div className="min-h-screen bg-[#14171A] text-[#E8E6E1] flex flex-col font-sans select-none antialiased relative">
      {/* Real-time Notification Toast Banners Stack (Top-Right) */}
      <NotificationToastContainer onNavigateWell={onNavigateWell} />

      {/* Fixed Industrial SCADA Top Bar */}
      <TopBar 
        currentRoute={currentRoute} 
        onLockConsole={onLockConsole} 
        onNavigate={onNavigate}
        onNavigateWell={onNavigateWell}
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={() => setIsAssistantOpen(prev => !prev)}
        onOpenOnboarding={() => setShowOnboarding(true)}
      />

      {/* First-Time User Onboarding Sequence Modal (4 Squared Step Cards) */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onNavigate={onNavigate}
      />

      {/* Slide-out AI Assistant Side Panel */}
      <AiAssistantSidePanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onNavigateWell={onNavigateWell}
        onNavigate={onNavigate}
      />

      {/* Main Container below Top Bar */}
      <div className="flex pt-14 flex-1">
        {/* Fixed Industrial Left Navigation Sidebar */}
        <Sidebar currentRoute={currentRoute} onNavigate={onNavigate} />

        {/* Main Content Area (Shifted by 14 / 56px for tablet icon rail or 64 / 256px for desktop sidebar) */}
        <main className="ml-14 lg:ml-64 flex-1 min-h-[calc(100vh-3.5rem)] bg-[#14171A] flex flex-col">
          {/* Real-time Thermodynamic Physical Drift Engine Strip */}
          <SimulationControlStrip onNavigateToSimPage={() => onNavigate('data-simulation')} />
          {children}
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
