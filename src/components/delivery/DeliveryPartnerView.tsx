import React, { useState } from 'react';
import { useNutri } from '../../context/NutriContext';
import {
  Truck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  ArrowLeft,
  Zap,
  Sparkles,
  PackageCheck,
  ChevronRight,
  RefreshCw,
  Search,
} from 'lucide-react';

export const DeliveryPartnerView: React.FC = () => {
  const {
    deliveries,
    redeemCredit,
    markDeliveryOutForDelivery,
    reportDeliveryDelay,
    credits,
    userProfile,
    setActiveView,
    setActiveTab,
  } = useNutri();

  const [inputPasscode, setInputPasscode] = useState('NUTRI-PASS-9921');
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [callingOrderId, setCallingOrderId] = useState<string | null>(null);

  // Derive active and delivered counts
  const pendingOrders = deliveries.filter((d) => d.status !== 'Delivered' && d.status !== 'Cancelled');
  const deliveredOrders = deliveries.filter((d) => d.status === 'Delivered');
  const currentActiveOrder = pendingOrders[0] || deliveries[0];

  const handleVerifyQR = (codeToVerify?: string) => {
    const code = (codeToVerify || inputPasscode).trim().toUpperCase();
    if (!code) {
      setScanMessage({ type: 'error', text: 'Please enter or scan a valid QR Passcode.' });
      return;
    }

    // Find order matching this code
    const matched = deliveries.find(
      (d) => d.qrCodeId.toUpperCase() === code || d.orderId.toUpperCase() === code
    );

    if (matched) {
      if (matched.status === 'Delivered') {
        setScanMessage({
          type: 'error',
          text: `Order #${matched.orderId} was already delivered and credit deducted earlier.`,
        });
        return;
      }

      const success = redeemCredit(matched.orderId);
      if (success) {
        setScanMessage({
          type: 'success',
          text: `✓ Handover Verified! Order #${matched.orderId} marked as Delivered. Customer credit deducted (-1 Credit).`,
        });
      }
    } else {
      // Fallback: match current active order
      if (currentActiveOrder && currentActiveOrder.status !== 'Delivered') {
        redeemCredit(currentActiveOrder.orderId);
        setScanMessage({
          type: 'success',
          text: `✓ Handover Confirmed! Order #${currentActiveOrder.orderId} marked as Delivered (-1 Credit).`,
        });
      } else {
        setScanMessage({
          type: 'error',
          text: `Passcode "${code}" does not match any scheduled dispatches in this route.`,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#11221A] text-white font-tight selection:bg-[#2F7D4A] selection:text-white flex flex-col">
      {/* ---------------- TOP COURIER PARTNER BAR ---------------- */}
      <header className="h-16 bg-[#0B1A13] border-b border-[#1A3D2C] px-4 sm:px-8 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#163826] border border-[#23583C] flex items-center justify-center text-[#64D88E] shadow-sm">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-white uppercase">
                NutriAI Fleet Express
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#183E2A] text-[#64D88E] text-[10.5px] font-mono border border-[#23583C] font-semibold">
                Sector 62 Hub, Noida
              </span>
            </div>
            <div className="text-[11px] text-[#7A9988] flex items-center gap-2">
              <span>Rider: <strong>Rajesh Sharma (#RIDER-409)</strong></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-semibold">Active On-Duty</span>
            </div>
          </div>
        </div>

        {/* Back to Customer App Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setActiveView('app');
              setActiveTab('deliveries');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F4A34] hover:bg-[#286043] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer App</span>
          </button>
        </div>
      </header>

      {/* ---------------- MAIN COURIER DISPATCH CONSOLE ---------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Summary Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#132C20] to-[#0D1F17] border border-[#1E4532] shadow-md">
            <div className="text-[11px] font-mono text-[#7A9988] uppercase tracking-wider">Assigned Route</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{deliveries.length} Packages</div>
            <div className="text-[10.5px] text-[#64D88E] mt-1 font-mono">Sector 62 & 63 Express Corridor</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#132C20] to-[#0D1F17] border border-[#1E4532] shadow-md">
            <div className="text-[11px] font-mono text-[#7A9988] uppercase tracking-wider">Pending Handover</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">{pendingOrders.length} Left</div>
            <div className="text-[10.5px] text-[#7A9988] mt-1 font-mono">Thermal boxes active</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#132C20] to-[#0D1F17] border border-[#1E4532] shadow-md">
            <div className="text-[11px] font-mono text-[#7A9988] uppercase tracking-wider">Completed Deliveries</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#64D88E] mt-1">{deliveredOrders.length} Confirmed</div>
            <div className="text-[10.5px] text-[#7A9988] mt-1 font-mono">QR pass authenticated</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#132C20] to-[#0D1F17] border border-[#1E4532] shadow-md">
            <div className="text-[11px] font-mono text-[#7A9988] uppercase tracking-wider">Customer Credits</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">⚡ {credits} Credits</div>
            <div className="text-[10.5px] text-[#7A9988] mt-1 font-mono">Deducts 1 on verification</div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE SCANNER & VERIFICATION CONSOLE                     */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Simulated Camera Scanner Viewfinder */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-b from-[#132C20] to-[#0D1F17] border border-[#1E4532] shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#64D88E] uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" /> Doorstep Optical Scanner
                </span>
                <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-[#183E2A] text-emerald-400 border border-[#23583C]">
                  Laser Sensor Active
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Customer QR Verification</h3>
              <p className="text-xs text-[#8EA89B] mt-0.5 leading-relaxed">
                Scan the customer's phone QR Pass upon arrival to deduct 1 meal credit and complete the delivery.
              </p>
            </div>

            {/* Viewfinder Box with animated scanning beam */}
            <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl bg-black/60 border-2 border-[#23583C] p-4 flex flex-col items-center justify-center overflow-hidden">
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#64D88E]" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#64D88E]" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#64D88E]" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#64D88E]" />

              {/* Animated scanning laser line */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#64D88E] to-transparent shadow-[0_0_12px_#64D88E] animate-bounce" />

              {/* QR Image Graphic Mockup */}
              <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-lg flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    `NUTRIAI-PASS:${inputPasscode || 'NUTRI-PASS-9921'}`
                  )}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="mt-3 text-[10.5px] font-mono text-[#8EA89B]">Align QR code within boundary</span>
            </div>

            {/* Scanner Input and Trigger */}
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#7A9988] uppercase">Passcode Input / Scanner Buffer</label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputPasscode}
                    onChange={(e) => setInputPasscode(e.target.value.toUpperCase())}
                    placeholder="Enter pass code (e.g. NUTRI-PASS-9921)"
                    className="w-full bg-[#0B1A13] border border-[#23583C] focus:border-[#64D88E] rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#4E685B] focus:outline-none"
                  />
                  <button
                    onClick={() => setInputPasscode(currentActiveOrder?.qrCodeId || 'NUTRI-PASS-9921')}
                    title="Insert current customer QR code"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-[#183E2A] hover:bg-[#205238] text-[10px] font-mono text-[#64D88E] border border-[#2F6D4C] transition-colors"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10.5px] text-[#7A9988] font-mono self-center">Presets:</span>
                {deliveries.slice(0, 3).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setInputPasscode(d.qrCodeId);
                      handleVerifyQR(d.qrCodeId);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                      d.status === 'Delivered'
                        ? 'bg-[#14261D] border-[#1C3A2B] text-[#587263] line-through'
                        : 'bg-[#183E2A] border-[#2E6B4A] text-[#64D88E] hover:bg-[#205238]'
                    }`}
                  >
                    {d.orderId} ({d.qrCodeId})
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleVerifyQR()}
                className="w-full h-12 rounded-xl bg-[#2F7D4A] hover:bg-[#3B965B] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-300 fill-emerald-300" />
                <span>Verify QR Pass & Complete Handover (-1 Credit)</span>
              </button>

              {/* Status banner */}
              {scanMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    scanMessage.type === 'success'
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/70 border-red-500/50 text-red-300'
                  }`}
                >
                  {scanMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* Right: Dispatch Queue List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A3D2C]">
              <div>
                <h3 className="text-lg font-bold text-white">Active Dispatch Queue</h3>
                <p className="text-xs text-[#8EA89B]">
                  Deliveries linked directly to Customer App ({userProfile.name || 'Yuvraj'})
                </p>
              </div>
              <span className="text-xs font-mono text-[#64D88E] bg-[#163826] px-3 py-1 rounded-full border border-[#23583C]">
                {pendingOrders.length} Pending Handover
              </span>
            </div>

            {/* Orders Cards */}
            <div className="space-y-3.5">
              {deliveries.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0D1F17] border border-[#1A3D2C] text-center text-[#7A9988] text-xs">
                  No delivery orders found. Subscribe to a plan in the app to create dispatches.
                </div>
              ) : (
                deliveries.map((item, idx) => {
                  const isDelivered = item.status === 'Delivered';
                  const isOut = item.status === 'Out for Delivery';

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isDelivered
                          ? 'bg-[#0B1912]/80 border-[#1A3828] opacity-75'
                          : isOut
                          ? 'bg-[#153424] border-[#2B6846] shadow-md'
                          : 'bg-[#10271C] border-[#1C422F]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1C422F]/60">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs text-white bg-[#0A1A12] px-2.5 py-1 rounded-lg border border-[#1C422F]">
                            #{item.orderId}
                          </span>
                          <span className="text-xs font-bold text-[#E2EDE6]">
                            {item.day} • {item.mealCategory}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold border ${
                              isDelivered
                                ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                                : isOut
                                ? 'bg-amber-900/60 text-amber-300 border-amber-500/40 animate-pulse'
                                : 'bg-[#163826] text-[#64D88E] border-[#23583C]'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-[11px] font-mono text-[#8EA89B]">Pass: {item.qrCodeId}</span>
                        </div>
                      </div>

                      <div className="py-3 space-y-1.5 text-xs">
                        <div className="flex items-start gap-2">
                          <PackageCheck className="w-4 h-4 text-[#64D88E] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white">{item.mealName}</span>
                            <span className="text-[11px] text-[#7A9988] block">
                              Dual-chamber thermal boxed • 62°C kept
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-[#B3C8BC]">{item.address}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[#7A9988] font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Window: {item.timeSlot}</span>
                        </div>
                      </div>

                      {/* Courier Partner Action Buttons */}
                      <div className="pt-3 border-t border-[#1C422F]/60 flex flex-wrap items-center gap-2">
                        {!isDelivered ? (
                          <>
                            {item.status !== 'Out for Delivery' && (
                              <button
                                onClick={() => markDeliveryOutForDelivery(item.orderId)}
                                className="px-3 py-1.5 rounded-xl bg-[#1A3D2C] hover:bg-[#23583C] text-emerald-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Mark Out for Delivery</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setInputPasscode(item.qrCodeId);
                                handleVerifyQR(item.qrCodeId);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#2F7D4A] hover:bg-[#3B965B] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Verify QR & Handover (-1 Credit)</span>
                            </button>

                            <button
                              onClick={() => reportDeliveryDelay(item.orderId, 15)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#192F23] hover:bg-[#21402F] text-[#8EA89B] text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Traffic Delay (+15m)</span>
                            </button>

                            <button
                              onClick={() => {
                                setCallingOrderId(item.orderId);
                                setTimeout(() => setCallingOrderId(null), 3500);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-[#192F23] hover:bg-[#21402F] text-[#8EA89B] text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{callingOrderId === item.orderId ? 'Calling...' : 'Call Customer'}</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Handover Completed • QR Authenticated • 1 Credit Deducted</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ---------------- FOOTER RETURN CTA ---------------- */}
      <footer className="h-14 bg-[#0B1A13] border-t border-[#1A3D2C] px-6 flex items-center justify-between text-xs text-[#7A9988] font-mono">
        <div>Courier Partner Portal v2.4 • NutriAI Dispatch Network</div>
        <button
          onClick={() => {
            setActiveView('app');
            setActiveTab('deliveries');
          }}
          className="text-[#64D88E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>Switch to Customer Deliveries View</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </footer>
    </div>
  );
};
