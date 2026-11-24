import React, { useState, useRef, useEffect } from 'react';
import { useNutri } from '../../context/NutriContext';
import {
  Bell,
  HelpCircle,
  Menu,
  CheckCircle2,
  Sparkles,
  Info,
  X,
  ExternalLink,
  CreditCard,
  ShieldCheck,
  Truck,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    setActiveTab,
    setActiveView,
    userProfile,
    hasSubscription,
    subscriptionPlan,
    openSubscriptionModal,
    credits,
    notifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
  } = useNutri();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-[#E4ECE6] border-b border-[#D5E1D8] px-4 sm:px-6 flex items-center justify-between shrink-0 select-none font-tight relative z-30">
      {/* Left Section: Mobile Menu Toggle & Brand Marker */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation menu"
          className="md:hidden p-2 rounded-xl bg-[#CAD7CF] hover:bg-[#BAC8BF] text-[#1F3A30] transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4 stroke-[2.2]" />
        </button>

        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-[#587263]">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Adaptive Intelligence Active</span>
        </div>
      </div>

      {/* Center Section: Centered NutriAI Logo & Wordmark (Strictly matching Image 2) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 pointer-events-auto">
        <div className="w-7 h-7 rounded-full bg-[#CAD7CF] flex items-center justify-center p-0.5 shadow-2xs">
          <img
            src="/nutriai_logo.png"
            alt="NutriAI"
            className="w-full h-full object-contain rounded-full"
          />
        </div>
        <span className="font-tight font-extrabold text-[16.5px] sm:text-[18px] tracking-[0.04em] text-[#1F3A30] uppercase">
          NUTRI-AI
        </span>
      </div>

      {/* Right Section: Subscription Pill + Credits + Notifications + Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Credits Badge (When Subscribed) */}
        {hasSubscription && (
          <div
            title="Available Meal Credits"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E2ECE5] border border-[#CAD7CF] text-[#1F3A30] text-xs font-bold shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>{credits} Credits</span>
          </div>
        )}

        {/* Subscription Pill */}
        {hasSubscription ? (
          <button
            onClick={openSubscriptionModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 text-xs font-bold transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="capitalize">★ {subscriptionPlan || 'Pro'} Active</span>
          </button>
        ) : (
          <button
            onClick={openSubscriptionModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#CAD7CF] hover:bg-[#BAC8BF] text-[#1F3A30] text-xs font-bold transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#1F3A30]" />
            <span>Subscribe Plan</span>
          </button>
        )}

        {/* Courier Partner Console Switcher */}
        <button
          onClick={() => setActiveView('delivery_partner')}
          title="Courier Partner Portal (QR Scanner & Verification)"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D5E1D8] hover:bg-[#CAD7CF] text-[#1F3A30] text-xs font-bold transition-colors cursor-pointer"
        >
          <Truck className="w-3.5 h-3.5 text-[#203D32]" />
          <span>Courier Hub</span>
        </button>

        {/* Notification Bell Button with Counter */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              const nextState = !notificationsOpen;
              setNotificationsOpen(nextState);
              setHelpOpen(false);
              if (nextState) markNotificationsAsRead();
            }}
            title="Notifications"
            className="w-9 h-9 rounded-full bg-[#CAD7CF] hover:bg-[#BAC8BF] text-[#1F3A30] flex items-center justify-center transition-colors shadow-2xs relative cursor-pointer"
          >
            <Bell className="w-4 h-4 stroke-[2.2]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#203D32] text-white text-[9.5px] font-extrabold flex items-center justify-center shadow-2xs animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-[#F4F7F4] border border-[#CAD7CF] shadow-[0_16px_36px_-10px_rgba(31,58,48,0.25)] p-4 animate-fade-in z-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#D5E1D8]">
                <h4 className="font-tight font-bold text-sm text-[#1F3A30]">Notifications</h4>
                <span className="text-[10.5px] font-mono text-[#587263]">
                  {notifications.length} total
                </span>
              </div>
              <div className="space-y-2.5 pt-3 max-h-80 overflow-y-auto no-scrollbar">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[#E6EFE8] flex items-start gap-2.5 border border-[#CAD7CF]/60"
                  >
                    {item.type === 'delivery' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : item.type === 'warning' ? (
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-[#203D32] shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-[#1F3A30] truncate">{item.title}</p>
                        <span className="text-[10px] text-[#6B8074] font-mono shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-[#587263] mt-0.5 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Button */}
        <div className="relative" ref={helpRef}>
          <button
            onClick={() => {
              setHelpOpen((prev) => !prev);
              setNotificationsOpen(false);
            }}
            title="Help & Support"
            className="w-9 h-9 rounded-full bg-[#CAD7CF] hover:bg-[#BAC8BF] text-[#1F3A30] flex items-center justify-center transition-colors shadow-2xs font-bold text-xs"
          >
            <HelpCircle className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Help Quick Modal */}
          {helpOpen && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl bg-[#F4F7F4] border border-[#CAD7CF] shadow-[0_16px_36px_-10px_rgba(31,58,48,0.25)] p-4 animate-fade-in z-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#D5E1D8]">
                <h4 className="font-tight font-bold text-sm text-[#1F3A30]">NutriAI Quick Guide</h4>
                <button
                  onClick={() => setHelpOpen(false)}
                  className="text-[#587263] hover:text-[#1F3A30]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2.5 pt-3 text-xs text-[#3E574B]">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#203D32] shrink-0 mt-0.5" />
                  <p>
                    <strong>Precision Chat:</strong> Type meal swaps, macro queries, or food allergies directly in chat.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#203D32] shrink-0 mt-0.5" />
                  <p>
                    <strong>Navigation Rail:</strong> Switch between Home Chat, Meals, Dashboard, and Deliveries.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveView('ai_coach_page');
                    setHelpOpen(false);
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-[#203D32] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#2A4E40] transition-colors"
                >
                  <span>Explore AI Coach Specs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
