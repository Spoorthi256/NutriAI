import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Sparkles,
  ShieldCheck,
  X,
  Leaf,
  Crown,
  Zap,
} from 'lucide-react';
import { useNutri } from '../../context/NutriContext';
import { openRazorpayCheckout } from '../../services/razorpayService';

export const SubscriptionModal: React.FC = () => {
  const {
    isSubscriptionModalOpen,
    closeSubscriptionModal,
    activateSubscription,
    userProfile,
    setActiveTab,
    subscriptionPlan,
  } = useNutri();

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isSubscriptionModalOpen) return null;

  const tiers = [
    {
      id: 'weekly' as const,
      name: 'Starter (Weekly)',
      credits: 7,
      icon: <Leaf className="w-5 h-5 text-[#203D32]" />,
      subtitle: 'Get started with the basics.',
      priceDisplay: '₹999',
      periodText: '/ week',
      amountINR: 999,
      popular: false,
      features: [
        '7 Chef-prepared meals (7 credits)',
        'Basic meal plans & calibrated macros',
        'Basic nutrition tracking',
        'Limited AI coaching (10 queries/day)',
        'Digital QR courier verification',
      ],
    },
    {
      id: 'monthly' as const,
      name: 'Pro (Monthly)',
      credits: 30,
      icon: <Sparkles className="w-5 h-5 text-[#203D32]" />,
      subtitle: 'Everything you need for real progress.',
      priceDisplay: '₹2,999',
      periodText: '/ month',
      amountINR: 2999,
      popular: true,
      features: [
        '30 Chef-prepared meals (30 credits)',
        'Personalised adaptive meal plans',
        'Advanced nutrition tracking & BMR sync',
        'Unlimited Groq AI coaching & swaps',
        'Smart hold & postpone logistics controls',
        'Priority temperature-controlled courier',
      ],
    },
    {
      id: 'yearly' as const,
      name: 'Ultra (Annual)',
      credits: 400,
      icon: <Crown className="w-5 h-5 text-[#203D32]" />,
      subtitle: 'Maximum performance, no limits.',
      priceDisplay: '₹24,999',
      periodText: '/ year',
      amountINR: 24999,
      popular: false,
      features: [
        '400 Chef-prepared meals (400 credits)',
        'Everything in Pro Monthly',
        'Advanced goal & hypertrophy optimisation',
        'Custom macro targets & sports dietitian review',
        'Early access to new chef creations',
        'Dedicated 30-min doorstep arrival windows',
      ],
    },
  ];

  const handleSelectTier = async (tier: typeof tiers[0]) => {
    setIsProcessing(true);

    try {
      await openRazorpayCheckout({
        planTier: tier.id,
        planName: tier.name,
        amountInINR: tier.amountINR,
        userName: userProfile.name || 'Yuvraj',
        userEmail: 'yuvraj@nutriai.app',
        onSuccess: () => {
          setIsProcessing(false);
          activateSubscription(tier.id);
          closeSubscriptionModal();
          // Navigate to newly unlocked deliveries tab
          setActiveTab('deliveries');
        },
        onFailure: () => {
          setIsProcessing(false);
        },
      });
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        className="relative bg-[#EBF1ED] border border-[#CAD7CF] rounded-[32px] w-full max-w-5xl overflow-hidden shadow-2xl p-6 sm:p-8 font-tight text-[#1F3A30] my-auto"
      >
        {/* Close Button */}
        <button
          onClick={closeSubscriptionModal}
          className="absolute right-5 top-5 w-9 h-9 rounded-full bg-[#DCE6E0] hover:bg-[#CAD7CF] text-[#1F3A30] flex items-center justify-center transition-colors shadow-2xs z-10 cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-1.5 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE6E0] text-[#1F3A30] border border-[#CAD7CF] text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" />
            <span>Meal Credits & Delivery Subscriptions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F3A30] tracking-tight">
            Select Your Nutrition Plan
          </h2>
          <p className="text-xs sm:text-sm text-[#587263]">
            Subscribing assigns meal credits (Week: 7, Month: 30, Year: 400) and unlocks daily chef deliveries with digital QR pass redemption.
          </p>
        </div>

        {/* 3 Cards Container Exactly Matching Image 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {tiers.map((tier) => {
            const isCurrentActive = subscriptionPlan === tier.id;

            return (
              <div
                key={tier.id}
                className={`rounded-[26px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 relative ${
                  tier.popular
                    ? 'bg-[#E5ECE7] border-2 border-[#1F3A30] shadow-md'
                    : 'bg-[#E5ECE7]/70 border border-[#CAD7CF] hover:bg-[#E5ECE7] shadow-xs'
                }`}
              >
                {/* Most Popular Badge on Top Right */}
                {tier.popular && (
                  <div className="absolute top-5 right-5">
                    <span className="text-[11px] font-bold text-[#1F3A30] bg-[#CAD7CF] px-3 py-1 rounded-full shadow-2xs border border-[#BAC8BF]">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Top Section */}
                <div className="space-y-4">
                  {/* Icon in Circle */}
                  <div className="w-11 h-11 rounded-full bg-[#D4E0D8] border border-[#CAD7CF] flex items-center justify-center shadow-2xs">
                    {tier.icon}
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="font-extrabold text-xl text-[#1F3A30] tracking-tight">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-[#587263] mt-1">{tier.subtitle}</p>
                    <div className="inline-flex items-center gap-1 mt-2 text-[11px] font-mono font-bold text-emerald-800 bg-[#D4E0D8] px-2 py-0.5 rounded-md">
                      <span>⚡ {tier.credits} Meal Credits Included</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-2">
                    <span className="font-extrabold text-3xl sm:text-4xl text-[#1F3A30] tracking-tight">
                      {tier.priceDisplay}
                    </span>
                    <span className="text-xs text-[#587263] font-medium ml-1.5">
                      {tier.periodText}
                    </span>
                  </div>

                  {/* Features List with Clean Checkmarks */}
                  <div className="space-y-2.5 pt-3 border-t border-[#CAD7CF]/70">
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#2D483B]">
                        <Check className="w-4 h-4 text-[#1F3A30] stroke-[2.4] shrink-0 mt-0.5" />
                        <span className="font-medium leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button Matching Image 3 */}
                <div className="pt-6 mt-6 border-t border-[#CAD7CF]/70">
                  <button
                    onClick={() => handleSelectTier(tier)}
                    disabled={isProcessing}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-2xs ${
                      tier.popular
                        ? 'bg-[#1F3A30] hover:bg-[#2B4E3F] text-white'
                        : isCurrentActive
                        ? 'bg-[#1F3A30] text-white'
                        : 'bg-white hover:bg-[#F2F6F3] border border-[#CAD7CF] text-[#1F3A30]'
                    }`}
                  >
                    {isProcessing
                      ? 'Connecting Razorpay...'
                      : isCurrentActive
                      ? 'Active Plan ✓'
                      : 'Select Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Razorpay Footer */}
        <div className="mt-6 pt-4 border-t border-[#CAD7CF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#587263] gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Secure Razorpay Gateway • Test Key: rzp_test_Tkiv94rlfEXazD</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#587263]">
            <span>UPI</span>
            <span>•</span>
            <span>Cards</span>
            <span>•</span>
            <span>NetBanking</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
