import React from 'react';
import { NutriProvider, useNutri } from './context/NutriContext';
import { LandingPage } from './components/landing/LandingPage';
import { AppShell } from './components/layout/AppShell';
import { AICoachDedicatedPage } from './components/ai-coach/AICoachDedicatedPage';
import { AuthPage } from './components/auth/AuthPage';
import { DeliveryPartnerView } from './components/delivery/DeliveryPartnerView';

const MainView: React.FC = () => {
  const { activeView } = useNutri();

  // Scroll to top instantly whenever view changes (e.g. from Landing to AI Coach, Auth, etc.)
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeView]);

  if (activeView === 'landing') return <LandingPage />;
  if (activeView === 'ai_coach_page') return <AICoachDedicatedPage />;
  if (activeView === 'auth') return <AuthPage />;
  if (activeView === 'delivery_partner') return <DeliveryPartnerView />;
  return <AppShell />;
};

export function App() {
  return (
    <NutriProvider>
      <MainView />
    </NutriProvider>
  );
}

export default App;
