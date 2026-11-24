import React, { useState } from 'react';
import { useNutri } from '../../context/NutriContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatWorkspace } from '../chat/ChatWorkspace';
import { ArtifactWorkspace } from '../artifacts/ArtifactWorkspace';
import { WeeklyPlannerView } from '../meal-plan/WeeklyPlannerView';
import { DashboardView } from '../dashboard/DashboardView';
import { DeliveryView } from '../delivery/DeliveryView';
import { SubscriptionModal } from '../subscription/SubscriptionModal';
import { MealPlanGenerationModal } from '../meal-plan/MealPlanGenerationModal';
import { X, LayoutPanelTop } from 'lucide-react';

export const AppShell: React.FC = () => {
  const {
    activeTab,
    mobileArtifactOpen,
    setMobileArtifactOpen,
    isGeneratingPlan,
    completePlanGeneration,
  } = useNutri();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#E4ECE6] flex flex-col overflow-hidden text-[#1F3A30] font-tight antialiased">
      {/* Full-Width Top Header (Matching Image 2) */}
      <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

      {/* Main Row: Left Icon Rail + Dynamic Content Columns */}
      <div className="flex-1 flex h-full min-h-0 overflow-hidden relative">
        {/* Desktop Left Icon Rail (4 tabs: Home, Meals, Dashboard, Deliveries) */}
        <div className="hidden md:block h-full shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Slide-over Drawer for Icon Rail */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex">
            <div className="w-[72px] h-full bg-[#E4ECE6] shadow-modal">
              <Sidebar onItemClick={() => setMobileSidebarOpen(false)} />
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="flex-1 h-full cursor-default"
              aria-label="Close menu"
            />
          </div>
        )}

        {/* Dynamic Main Workspace Column: Only Home, Meals, Dashboard, Deliveries */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#E4ECE6]">
          {activeTab === 'home' && <ChatWorkspace />}
          {(activeTab === 'meals' || activeTab === 'meal_plans' || activeTab === 'nutrition') && <WeeklyPlannerView />}
          {(activeTab === 'dashboard' || activeTab === 'progress') && <DashboardView />}
          {activeTab === 'deliveries' && <DeliveryView />}
        </div>
      </div>

      {/* Global Subscription Modal */}
      <SubscriptionModal />

      {/* Global Realistic Meal Plan Generation Loader Modal */}
      <MealPlanGenerationModal
        isOpen={isGeneratingPlan}
        onComplete={completePlanGeneration}
      />

      {/* Mobile / Tablet Responsive Slide-up Sheet / Drawer for Artifacts */}
      {mobileArtifactOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/40 backdrop-blur-xs flex flex-col justify-end">
          <div className="h-[85vh] w-full bg-white rounded-t-3xl border-t border-surface-border flex flex-col overflow-hidden animate-slide-up shadow-modal">
            <div className="p-4 border-b border-surface-border flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 font-bold text-sm text-brand-800 px-2">
                <LayoutPanelTop className="w-4 h-4 text-brand-600" />
                Structured Artifact Panel
              </div>
              <button
                onClick={() => setMobileArtifactOpen(false)}
                className="p-1.5 rounded-lg text-surface-muted hover:text-brand-800 hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ArtifactWorkspace />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
