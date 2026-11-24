import React from 'react';
import { useNutri } from '../../context/NutriContext';
import { AppNavigationTab } from '../../types';
import {
  Home,
  UtensilsCrossed,
  LayoutDashboard,
  Truck,
  ArrowLeft,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const {
    activeTab,
    setActiveTab,
    setActiveView,
    setActiveArtifact,
    hasSubscription,
    openSubscriptionModal,
  } = useNutri();

  const navItems: { tab: AppNavigationTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Home', icon: <Home className="w-5 h-5 stroke-[2]" /> },
    { tab: 'meals', label: 'Meals', icon: <UtensilsCrossed className="w-5 h-5 stroke-[2]" /> },
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 stroke-[2]" /> },
    ...(hasSubscription
      ? [
          {
            tab: 'deliveries' as AppNavigationTab,
            label: 'Deliveries',
            icon: <Truck className="w-5 h-5 stroke-[2]" />,
          },
        ]
      : []),
  ];

  const handleNavClick = (tab: AppNavigationTab) => {
    setActiveTab(tab);
    if (tab === 'meals' || tab === 'meal_plans') {
      setActiveArtifact('weekly_meal_plan');
    } else if (tab === 'deliveries') {
      setActiveArtifact('delivery_schedule');
    }
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <aside className="w-[68px] sm:w-[72px] bg-[#E4ECE6] border-r border-[#D5E1D8] flex flex-col justify-between items-center h-full py-5 shrink-0 select-none font-tight">
      {/* Navigation Icons: Home, Meals, Dashboard, (Deliveries only once subscribed) */}
      <div className="flex flex-col items-center gap-3 w-full">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.tab ||
            (item.tab === 'meals' && (activeTab === 'meal_plans' || activeTab === 'nutrition')) ||
            (item.tab === 'dashboard' && activeTab === 'progress');

          return (
            <button
              key={item.tab}
              onClick={() => handleNavClick(item.tab)}
              title={item.label}
              className={`relative group w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#203D32] text-white shadow-xs scale-100'
                  : 'text-[#587263] hover:text-[#1F3A30] hover:bg-[#CAD7CF]'
              }`}
            >
              {item.icon}

              {/* Tooltip on hover */}
              <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg bg-[#1F3A30] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Actions: Courier Hub + Back to Website */}
      <div className="flex flex-col items-center gap-2.5 w-full pt-4 border-t border-[#D5E1D8]">
        <button
          onClick={() => setActiveView('delivery_partner')}
          title="Courier Partner Console"
          className="relative group w-10 h-10 rounded-xl text-[#587263] hover:text-[#1F3A30] hover:bg-[#CAD7CF] flex items-center justify-center transition-colors cursor-pointer"
        >
          <Truck className="w-4 h-4 stroke-[2]" />
          <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg bg-[#1F3A30] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Courier Hub (Scan QR)
          </span>
        </button>

        <button
          onClick={() => setActiveView('landing')}
          title="Back to Website"
          className="relative group w-10 h-10 rounded-xl text-[#587263] hover:text-[#1F3A30] hover:bg-[#CAD7CF] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2]" />
          <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg bg-[#1F3A30] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Back to Website
          </span>
        </button>
      </div>
    </aside>
  );
};
