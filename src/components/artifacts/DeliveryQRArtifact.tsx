import React, { useState } from 'react';
import { useNutri } from '../../context/NutriContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Truck,
  MapPin,
  CheckCircle2,
  PackageCheck,
  ShieldCheck,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const DeliveryQRArtifact: React.FC = () => {
  const { deliveries, cancelDelivery, sendMessage } = useNutri();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeOrder = deliveries[0] || {
    id: 'ord-fallback',
    orderId: 'ORD-8492',
    day: 'Today',
    mealName: 'Paneer Power Bowl with Wild Quinoa',
    mealCategory: 'Lunch',
    timeSlot: '12:30 PM - 1:15 PM',
    status: 'Preparing',
    address: 'Sector 62, Green Park Towers, Flat 402, Noida',
    qrCodeId: 'NUTRI-PASS-9921',
  };

  const isCancelled = activeOrder.status === 'Cancelled';
  const isDelivered = activeOrder.status === 'Delivered';

  const handleCancelClick = () => {
    cancelDelivery(activeOrder.orderId);
    setToastMessage(`Order #${activeOrder.orderId} cancelled.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-4 animate-fade-in text-[#1F3A30] font-tight select-none">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#203D32] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Card */}
      <Card className="bg-[#F4F7F4] border border-[#CAD7CF]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isCancelled ? 'neutral' : 'amber'}>
                {isCancelled ? 'CANCELLED' : 'DELIVERY ARTIFACT'}
              </Badge>
              <span className="text-[11px] font-mono text-[#587263]">
                ORDER #{activeOrder.orderId}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#1F3A30] tracking-tight">
              DIGITAL QR DELIVERY PASS
            </h2>
            <p className="text-xs text-[#587263] mt-0.5">
              Live doorstep dispatch & cryptographic QR validation.
            </p>
          </div>

          <div className="w-9 h-9 rounded-xl bg-[#CAD7CF] text-[#1F3A30] flex items-center justify-center font-bold">
            <Truck className="w-5 h-5 text-[#203D32]" />
          </div>
        </div>
      </Card>

      {/* Digital QR Pass Widget */}
      <Card className="p-6 text-center space-y-4 bg-white border border-[#CAD7CF] shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5EFE8] text-[#1F3A30] border border-[#CAD7CF] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#203D32]" /> Authorized NutriPass QR Validation
        </div>

        {/* Dynamic SVG QR Code or Cancelled State */}
        {isCancelled ? (
          <div className="w-44 h-44 mx-auto bg-red-50/60 rounded-2xl border-2 border-dashed border-red-300 flex flex-col items-center justify-center p-4 space-y-2">
            <XCircle className="w-10 h-10 text-red-600" />
            <span className="text-xs font-bold text-red-700">Order Cancelled</span>
            <span className="text-[10px] text-red-600">This pass is no longer active</span>
          </div>
        ) : (
          <div className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl shadow-sm border-4 border-[#CAD7CF] flex flex-col items-center justify-center relative">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                `NUTRIAI-ORDER:${activeOrder.orderId}-PASS:${activeOrder.qrCodeId}`
              )}`}
              alt="QR Delivery Pass"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-7 h-7 rounded-lg bg-[#203D32] text-white font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-sm">
                ✦
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="font-mono text-xs text-[#1F3A30] font-extrabold break-all px-2">
            {activeOrder.qrCodeId}
          </div>
          <div className="text-[11px] text-[#587263]">
            {isCancelled
              ? 'Delivery dispatch cancelled by user'
              : 'Show this QR code to courier driver upon delivery'}
          </div>
        </div>

        {/* Cancel Delivery Action */}
        {!isCancelled && !isDelivered && (
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleCancelClick}
              className="px-4 py-2 rounded-xl text-xs font-bold text-red-700 hover:text-white bg-red-50 hover:bg-red-700 border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel This Delivery
            </button>
          </div>
        )}

        {isDelivered && (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F3A30] bg-[#CAD7CF] px-3.5 py-1.5 rounded-xl border border-[#BAC8BF]">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" /> VERIFIED & DELIVERED
          </div>
        )}
      </Card>

      {/* Delivery Order & Meal Details */}
      <div className="p-4 rounded-2xl bg-[#F4F7F4] border border-[#CAD7CF] space-y-2 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#D5E1D8]">
          <span className="text-[#587263] font-semibold">Scheduled Meal:</span>
          <span className="font-bold text-[#1F3A30]">{activeOrder.mealName}</span>
        </div>
        <div className="flex items-center justify-between pb-2 border-b border-[#D5E1D8]">
          <span className="text-[#587263] font-semibold">Time Slot:</span>
          <span className="font-bold text-[#1F3A30]">{activeOrder.timeSlot}</span>
        </div>
        <div className="flex items-start gap-2 pt-1 text-[#3E574B]">
          <MapPin className="w-4 h-4 text-[#203D32] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#1F3A30] block">Destination:</span>
            <span className="text-[#587263]">{activeOrder.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
