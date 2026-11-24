import React, { useState } from 'react';
import { useNutri } from '../../context/NutriContext';
import {
  Truck,
  MapPin,
  QrCode,
  CreditCard,
  X,
  Lock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
  PauseCircle,
} from 'lucide-react';

export const DeliveryView: React.FC = () => {
  const {
    deliveries,
    cancelDelivery,
    holdDelivery,
    postponeDelivery,
    hasSubscription,
    openSubscriptionModal,
    userProfile,
    credits,
    redeemCredit,
    setActiveView,
  } = useNutri();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'address' | 'plan'>('upcoming');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [activeQRModalOrder, setActiveQRModalOrder] = useState<any | null>(null);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [showLiveMapModal, setShowLiveMapModal] = useState<boolean>(false);

  // Address form fields
  const [fullName, setFullName] = useState(userProfile.name || 'Yuvraj');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [addressLine1, setAddressLine1] = useState('Sector 62, Green Park Towers, Flat 402');
  const [city, setCity] = useState('Noida');
  const [postalCode, setPostalCode] = useState('201309');

  const daysOfWeek = [
    { name: 'Mon', num: '6', full: 'Monday' },
    { name: 'Tue', num: '7', full: 'Tuesday' },
    { name: 'Wed', num: '8', full: 'Wednesday' },
    { name: 'Thu', num: '9', full: 'Thursday' },
    { name: 'Fri', num: '10', full: 'Friday' },
    { name: 'Sat', num: '11', full: 'Saturday' },
    { name: 'Sun', num: '12', full: 'Sunday' },
  ];

  // IF USER DOES NOT HAVE AN ACTIVE SUBSCRIPTION -> SHOW LOCKED GATEWAY
  if (!hasSubscription) {
    return (
      <div className="h-full overflow-y-auto bg-[#E4ECE6] text-[#1F3A30] font-tight select-none p-4 sm:p-7 flex items-center justify-center">
        <div className="max-w-xl w-full bg-[#F4F7F4] rounded-[32px] border border-[#CAD7CF] p-8 sm:p-10 shadow-xl space-y-6 text-center animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#DCE6E0] border border-[#CAD7CF] flex items-center justify-center text-[#203D32] shadow-sm">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#587263] uppercase tracking-wider bg-[#DCE6E0] px-3 py-1 rounded-full border border-[#CAD7CF]">
              Subscription Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F3A30] tracking-tight">
              Doorstep Deliveries Locked
            </h1>
            <p className="text-xs sm:text-sm text-[#587263] max-w-md mx-auto leading-relaxed">
              Doorstep meal delivery activates once you choose a subscription plan. Enjoy chef-prepared meals delivered twice daily in synchronized thermal boxes with digital QR pass redemption.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D5E1D8] text-left text-xs space-y-2 text-[#3E574B]">
            <div className="flex items-center justify-between">
              <span className="font-bold">Weekly Tier (7 Credits)</span>
              <span className="font-mono font-bold text-[#1F3A30]">₹999 / week</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1F3A30]">Monthly Pro (30 Credits) ★</span>
              <span className="font-mono font-bold text-[#1F3A30]">₹2,999 / month</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold">Annual Tier (400 Credits)</span>
              <span className="font-mono font-bold text-[#1F3A30]">₹24,999 / year</span>
            </div>
          </div>

          <button
            onClick={openSubscriptionModal}
            className="w-full h-12 rounded-2xl bg-[#1F3A30] hover:bg-[#2B4E3F] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Select a Plan to Unlock Deliveries</span>
          </button>
        </div>
      </div>
    );
  }

  // Active delivery for today's tracker
  const activeDelivery = deliveries.find((d) => d.status !== 'Cancelled') || deliveries[0];

  const handleRedeemPass = (order: any) => {
    const success = redeemCredit(order.id);
    if (success) {
      setActiveQRModalOrder(null);
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-7 overflow-y-auto h-full bg-[#E4ECE6] text-[#1F3A30] font-tight select-none">
      {/* ============================================================== */}
      {/* 1. TOP HEADER (MATCHING IMAGE 5)                                */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F3A30] tracking-tight">
            Doorstep Meal Delivery
          </h1>
          <p className="text-xs sm:text-sm text-[#587263] mt-0.5">
            Fresh, chef-crafted nutrition — delivered to your chosen address.
          </p>
        </div>

        {/* Right Controls: Location Dropdown + Date Range Navigator */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Location Dropdown Pill */}
          <button
            onClick={() => setShowAddressModal(true)}
            className="h-10 px-3.5 rounded-xl bg-[#F4F7F4] hover:bg-white border border-[#CAD7CF] text-[#1F3A30] text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-[#203D32]" />
            <span>{fullName} • {city}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B8074]" />
          </button>

          {/* Date Range Navigator */}
          <div className="h-10 px-3 rounded-xl bg-[#F4F7F4] border border-[#CAD7CF] text-[#1F3A30] text-xs font-bold flex items-center gap-2 shadow-2xs">
            <button
              onClick={() => setSelectedDayIndex((prev) => (prev > 0 ? prev - 1 : 6))}
              className="p-1 hover:bg-[#CAD7CF] rounded-md transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#6B8074]" />
            </button>
            <div className="flex items-center gap-1.5 px-1">
              <Calendar className="w-3.5 h-3.5 text-[#203D32]" />
              <span>Oct 6 — Oct 12, 2026</span>
            </div>
            <button
              onClick={() => setSelectedDayIndex((prev) => (prev < 6 ? prev + 1 : 0))}
              className="p-1 hover:bg-[#CAD7CF] rounded-md transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#6B8074]" />
            </button>
          </div>

          {/* Courier Partner Hub Switcher */}
          <button
            onClick={() => setActiveView('delivery_partner')}
            className="h-10 px-3.5 rounded-xl bg-[#203D32] hover:bg-[#2A4E40] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Open Courier Logistics Portal (Scan QR)"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Courier Hub</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUBNAV SEGMENTED PILLS + STATUS LEGENDS                      */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Segmented Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'history', label: 'History' },
            { id: 'address', label: 'Delivery Address' },
            { id: 'plan', label: 'Manage Plan' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'address') setShowAddressModal(true);
                  else if (tab.id === 'plan') openSubscriptionModal();
                  else setActiveTab(tab.id as any);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#1F3A30] text-white shadow-2xs'
                    : 'bg-[#DCE6E0] hover:bg-[#CAD7CF] text-[#486355]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Status Legends matching Image 5 */}
        <div className="flex items-center gap-4 text-xs font-semibold text-[#587263]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-700" />
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-600" />
            <span>Preparing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>Out for Delivery</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. TWO-COLUMN LAYOUT (MATCHING IMAGE 5)                         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: THIS WEEK'S DELIVERIES CARDS                     */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <h2 className="text-base font-extrabold text-[#1F3A30] tracking-tight">
              This Week's Deliveries
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-[#D4E0D8] px-2.5 py-0.5 rounded-full font-mono">
                ⚡ {credits} Credits Available
              </span>
            </div>
          </div>

          {/* Delivery Cards matching Image 5 */}
          {deliveries.map((item, idx) => {
            const isDelivered = item.status === 'Delivered';
            const isCancelled = item.status === 'Cancelled';
            const isOut = item.status === 'Out for Delivery';
            const isPreparing = item.status === 'Preparing';

            return (
              <div
                key={item.id}
                className={`rounded-[22px] border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-2xs ${
                  isCancelled
                    ? 'bg-[#E5ECE7]/50 border-[#D5E1D8] opacity-60'
                    : 'bg-[#F4F7F4] border-[#D5E1D8] hover:border-[#CAD7CF]'
                }`}
              >
                {/* Left: Date Block + Meal Info */}
                <div className="flex items-start gap-4 min-w-0">
                  {/* Left Date Block matching Image 5 */}
                  <div className="w-14 sm:w-16 h-16 sm:h-18 rounded-2xl bg-[#E2ECE5] border border-[#CAD7CF] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-extrabold text-[#587263] uppercase tracking-wider">
                      {item.day.slice(0, 3).toUpperCase()}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#1F3A30] leading-none my-0.5">
                      {idx < 2 ? '6' : idx < 4 ? '7' : '8'}
                    </span>
                    <span className="text-[10px] font-bold text-[#587263]">Oct</span>
                  </div>

                  {/* Meal Content */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#DCE6E0] text-[#1F3A30]">
                        {item.mealCategory}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-[#1F3A30] tracking-tight truncate">
                      {item.mealName}
                    </h3>

                    {/* Ingredients Dot String matching Image 5 */}
                    <p className="text-xs text-[#587263] truncate">
                      Paneer • Brown Rice • Mint Gravy • Bell Peppers
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#587263] pt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-[#6B8074]" /> {item.timeSlot}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#6B8074]" /> Delivering to {city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Pill + Actions (QR Pass, Cancel) */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D5E1D8]">
                  {/* Status Pill matching Image 5 */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOut
                          ? 'bg-amber-100 text-amber-800'
                          : isPreparing
                          ? 'bg-sky-100 text-sky-800'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-[#E0EBE3] text-[#2D473C]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isDelivered
                            ? 'bg-emerald-700'
                            : isOut
                            ? 'bg-amber-600 animate-pulse'
                            : isPreparing
                            ? 'bg-sky-600'
                            : isCancelled
                            ? 'bg-rose-600'
                            : 'bg-emerald-600'
                        }`}
                      />
                      <span>{item.status}</span>
                    </span>
                  </div>

                  {/* Buttons: QR Pass + Cancel */}
                  {!isCancelled && !isDelivered && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveQRModalOrder(item)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#E5ECE7] border border-[#CAD7CF] text-[#1F3A30] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        title="Open QR pass to redeem meal"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#203D32]" />
                        <span>QR Pass</span>
                      </button>

                      <button
                        onClick={() => cancelDelivery(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        title="Cancel this order"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}

                  {isDelivered && (
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Delivered & Redeemed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: CALENDAR STRIP + TODAY'S DELIVERY TRACKER       */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-4">
          {/* Day Calendar Strip matching Image 5 */}
          <div className="bg-[#F4F7F4] border border-[#D5E1D8] rounded-[22px] p-3 flex items-center justify-between gap-1 shadow-2xs">
            {daysOfWeek.map((d, i) => {
              const isSelected = selectedDayIndex === i;
              return (
                <button
                  key={d.name}
                  onClick={() => setSelectedDayIndex(i)}
                  className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F3A30] text-white shadow-2xs font-extrabold'
                      : 'hover:bg-[#E2ECE5] text-[#587263]'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">{d.name}</span>
                  <span className="text-sm font-extrabold mt-0.5 leading-none">{d.num}</span>
                  <span
                    className={`w-1 h-1 rounded-full mt-1.5 ${
                      isSelected ? 'bg-emerald-400' : 'bg-emerald-700/40'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Today's Delivery Card with Timeline matching Image 5 */}
          <div className="bg-[#F4F7F4] border border-[#D5E1D8] rounded-[26px] p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#1F3A30]">Today's Delivery</h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                <span>Out for Delivery</span>
              </span>
            </div>

            {/* Vertical Timeline Steps matching Image 5 */}
            <div className="space-y-4 relative pl-1 text-xs">
              {/* Step 1 */}
              <div className="flex items-start gap-3 relative">
                <div className="flex flex-col items-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 flex items-center justify-center ring-4 ring-emerald-100" />
                  <span className="w-0.5 h-10 bg-emerald-700 mt-1" />
                </div>
                <div className="flex-1 -mt-0.5 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-[#1F3A30]">Kitchen Preparation</h4>
                    <p className="text-[11px] text-[#587263]">Meal is being prepared fresh</p>
                  </div>
                  <span className="text-[10.5px] font-mono text-[#6B8074]">11:30 AM</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 relative">
                <div className="flex flex-col items-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 flex items-center justify-center ring-4 ring-emerald-100" />
                  <span className="w-0.5 h-10 bg-sky-600 mt-1" />
                </div>
                <div className="flex-1 -mt-0.5 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-[#1F3A30]">Insulated Packaging</h4>
                    <p className="text-[11px] text-[#587263]">Sealed with temperature control</p>
                  </div>
                  <span className="text-[10.5px] font-mono text-[#6B8074]">12:05 PM</span>
                </div>
              </div>

              {/* Step 3 (Active) */}
              <div className="flex items-start gap-3 relative">
                <div className="flex flex-col items-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-600 flex items-center justify-center ring-4 ring-sky-200 animate-pulse" />
                  <span className="w-0.5 h-8 bg-[#CAD7CF] mt-1" />
                </div>
                <div className="flex-1 -mt-0.5 flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sky-900">Out for Delivery</h4>
                    <p className="text-[11px] text-sky-700 font-semibold">Rider arriving in 18 mins</p>
                  </div>
                  <span className="text-[10.5px] font-mono text-sky-800">12:20 PM</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 relative">
                <div className="flex flex-col items-center">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#CAD7CF] bg-white flex items-center justify-center" />
                </div>
                <div className="flex-1 -mt-0.5 flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-[#6B8074]">Delivered</h4>
                    <p className="text-[11px] text-[#6B8074]">Awaiting delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Route Map Graphic matching Image 5 */}
            <div className="bg-[#E5ECE7] rounded-2xl p-3 border border-[#CAD7CF] space-y-2">
              <div className="h-14 w-full bg-[#D4E0D8] rounded-xl relative overflow-hidden flex items-center justify-between px-4 border border-[#CAD7CF]">
                {/* Kitchen Origin */}
                <div className="w-5 h-5 rounded-full bg-[#1F3A30] text-white flex items-center justify-center shadow-xs text-[10px] font-bold z-10">
                  ●
                </div>

                {/* Road Path Line with moving courier truck */}
                <div className="flex-1 h-1 bg-[#203D32]/30 relative mx-2">
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1F3A30] text-white p-1 rounded-full shadow-md animate-bounce"
                    title="Courier Rider"
                  >
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Home Destination */}
                <div className="w-6 h-6 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-xs z-10">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-[#1F3A30]">Rider arriving in 18 mins</span>
                <button
                  onClick={() => setShowLiveMapModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#DCE6E0] text-[11px] font-bold text-[#1F3A30] border border-[#CAD7CF] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <span>View Live Location</span>
                  <ExternalLink className="w-3 h-3 text-[#6B8074]" />
                </button>
              </div>
            </div>

            {/* 100% Biodegradable Packaging Info Box matching Image 5 */}
            <div className="p-3.5 rounded-2xl bg-[#E5ECE7] border border-[#CAD7CF] flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#CAD7CF] flex items-center justify-center text-[#203D32] shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1F3A30]">100% Biodegradable Packaging</h4>
                <p className="text-[11px] text-[#587263] mt-0.5 leading-relaxed">
                  Every container is food-grade, plant fiber and compostable. We collect sanitized containers on subsequent deliveries for zero-waste recycling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. DIGITAL QR PASS MODAL (WITH -1 CREDIT REDEMPTION)           */}
      {/* ============================================================== */}
      {activeQRModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F4F7F4] border border-[#CAD7CF] rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E1D8]">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#203D32]" />
                <h3 className="font-extrabold text-base text-[#1F3A30]">
                  Doorstep Delivery QR Pass
                </h3>
              </div>
              <button
                onClick={() => setActiveQRModalOrder(null)}
                className="w-8 h-8 rounded-full bg-[#DCE6E0] text-[#1F3A30] flex items-center justify-center hover:bg-[#CAD7CF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#D5E1D8] text-center space-y-3">
              <div className="w-44 h-44 mx-auto bg-[#E5EFE8] rounded-2xl flex items-center justify-center border-2 border-dashed border-[#203D32]/30 p-2.5">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `NUTRIAI-ORDER:${activeQRModalOrder.orderId}-PASS:${activeQRModalOrder.qrCodeId}`
                  )}`}
                  alt="QR Pass"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <div>
                <span className="text-[11px] text-[#587263] uppercase font-bold tracking-wider block">
                  Cryptographic Passcode
                </span>
                <span className="font-mono text-lg font-black text-[#1F3A30]">
                  {activeQRModalOrder.qrCodeId}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#E5ECE7] rounded-xl text-xs space-y-1 text-[#2D473C] border border-[#CAD7CF]">
              <div className="flex justify-between">
                <span className="font-semibold">Meal:</span>
                <span className="font-bold">{activeQRModalOrder.mealName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Window:</span>
                <span className="font-mono">{activeQRModalOrder.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Remaining Credits:</span>
                <span className="font-bold text-emerald-800">⚡ {credits} Credits</span>
              </div>
            </div>

            {/* Simulated Courier Scan Button (-1 Credit) */}
            <button
              onClick={() => handleRedeemPass(activeQRModalOrder)}
              className="w-full py-3.5 rounded-xl bg-[#1F3A30] hover:bg-[#2B4E3F] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>Simulate Courier Scan & Redeem (-1 Credit)</span>
            </button>
          </div>
        </div>
      )}

      {/* Address Edit Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F4F7F4] border border-[#CAD7CF] rounded-[30px] max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E1D8]">
              <h3 className="font-extrabold text-base text-[#1F3A30]">Update Delivery Address</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="w-8 h-8 rounded-full bg-[#CAD7CF] text-[#1F3A30] flex items-center justify-center hover:bg-[#BAC8BF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowAddressModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[#1F3A30] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-[#CAD7CF] rounded-xl px-3 py-2 text-[#1F3A30] font-medium focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1F3A30] font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-[#CAD7CF] rounded-xl px-3 py-2 text-[#1F3A30] font-medium focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1F3A30] font-semibold mb-1">Street Address</label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-white border border-[#CAD7CF] rounded-xl px-3 py-2 text-[#1F3A30] font-medium focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#1F3A30] font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-[#CAD7CF] rounded-xl px-3 py-2 text-[#1F3A30] font-medium focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#1F3A30] font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-white border border-[#CAD7CF] rounded-xl px-3 py-2 text-[#1F3A30] font-medium focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D5E1D8]">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#CAD7CF] text-[#1F3A30] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1F3A30] hover:bg-[#2B4E3F] text-white font-semibold shadow-xs cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Map Modal */}
      {showLiveMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F4F7F4] border border-[#CAD7CF] rounded-[30px] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E1D8]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#203D32]" />
                <h3 className="font-extrabold text-base text-[#1F3A30]">Live Courier GPS Tracking</h3>
              </div>
              <button
                onClick={() => setShowLiveMapModal(false)}
                className="w-8 h-8 rounded-full bg-[#CAD7CF] text-[#1F3A30] flex items-center justify-center hover:bg-[#BAC8BF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-64 rounded-2xl bg-[#E2ECE5] border border-[#CAD7CF] relative overflow-hidden flex flex-col items-center justify-center p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#1F3A30] text-white flex items-center justify-center shadow-lg animate-pulse mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm text-[#1F3A30]">Rider Ramesh Kumar (EV-409)</h4>
              <p className="text-xs text-[#587263] mt-1 max-w-xs">
                Distance: 1.4 km away • Current speed: 28 km/h • Estimated arrival: 12:38 PM
              </p>
              <span className="mt-3 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                ● Live GPS Signal Active
              </span>
            </div>

            <button
              onClick={() => setShowLiveMapModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#1F3A30] text-white font-bold text-xs cursor-pointer"
            >
              Close Live Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
