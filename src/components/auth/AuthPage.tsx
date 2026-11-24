import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  BarChart3,
  Leaf,
  X,
} from 'lucide-react';
import { useNutri } from '../../context/NutriContext';

export const AuthPage: React.FC = () => {
  const {
    setActiveView,
    setActiveTab,
    updateProfile,
    userProfile,
    resetOnboardingChat,
    generateUserMealPlan,
    setActiveThreadId,
    authMode,
    setAuthMode,
  } = useNutri();

  const [mode, setMode] = useState<'signin' | 'signup'>(authMode || 'signin');
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (authMode) {
      setMode(authMode);
    }
  }, [authMode]);

  // Form State
  const [name, setName] = useState(userProfile.name || 'Yuvraj');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateProfile({ name: name.trim() });
    }

    if (mode === 'signup') {
      // 1. Sign Up Flow: Starts fresh onboarding with zero mock data
      resetOnboardingChat();
      setActiveView('app');
      setActiveTab('home');
    } else {
      // 2. Sign In Flow: Existing account -> loads plan -> directly opens meal page -> dashboard
      generateUserMealPlan();
      setActiveThreadId('thread-assistant-main');
      setActiveView('app');
      setActiveTab('meals');
    }
  };

  const handleSocialAuth = (provider: 'google' | 'apple') => {
    if (!name.trim()) {
      updateProfile({ name: 'Yuvraj' });
    }
    if (mode === 'signup') {
      resetOnboardingChat();
      setActiveView('app');
      setActiveTab('home');
    } else {
      generateUserMealPlan();
      setActiveThreadId('thread-assistant-main');
      setActiveView('app');
      setActiveTab('meals');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#B4C3BA] flex items-center justify-center p-4 sm:p-6 md:p-8 font-tight antialiased select-none">
      {/* Centered Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[1040px] min-h-[640px] rounded-[32px] sm:rounded-[38px] bg-[#F4F7F4] shadow-[0_24px_70px_-15px_rgba(25,48,38,0.28)] border border-white/60 overflow-hidden grid grid-cols-1 md:grid-cols-[1.08fr_1fr]"
      >
        {/* Close / Back to Landing Button */}
        <button
          onClick={() => setActiveView('landing')}
          aria-label="Back to landing"
          className="absolute right-5 top-5 z-20 w-9 h-9 rounded-full bg-[#E5EFE7] hover:bg-[#D5E3D8] text-[#1F3A30] flex items-center justify-center transition-colors shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ============================================================== */}
        {/* LEFT COLUMN: BRANDING, VALUE PROPOSITION & BOTANICAL OVERLAY   */}
        {/* ============================================================== */}
        <div className="relative bg-[#CAD7CF] p-8 sm:p-11 flex flex-col justify-between overflow-hidden">
          {/* Subtle natural sunlight gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/[0.04] pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-2.5">
            <img
              src="/nutriai_logo.png"
              alt="NutriAI"
              className="w-7 h-7 object-contain rounded-full"
            />
            <span className="font-tight font-bold tracking-tight text-[18px] text-[#1A3328] uppercase">
              NUTRI-AI
            </span>
          </div>

          {/* Center Copy & Benefit Bullets */}
          <div className="relative z-10 my-auto py-6 space-y-6">
            <div>
              <h1 className="font-tight font-extrabold text-[36px] sm:text-[44px] leading-[1.08] text-[#1A3328] tracking-[-0.025em]">
                Better Nutrition
                <br />
                Starts Here.
              </h1>
              <p className="mt-3 font-tight text-[14.5px] leading-relaxed text-[#435C4E] max-w-[360px]">
                Personalised meal plans, macro targets, intelligent coaching and more — all in one place.
              </p>
            </div>

            {/* 3 Benefit Rows */}
            <div className="space-y-4 pt-1">
              {/* Bullet 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#BAC8BF] flex items-center justify-center text-[#1A3328] shrink-0 shadow-xs">
                  <BarChart3 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-tight font-bold text-[14px] text-[#1A3328] leading-tight">
                    Evidence-based nutrition
                  </h4>
                  <p className="font-tight text-[12px] text-[#4A6355] mt-0.5 leading-snug">
                    Backed by science, not trends.
                  </p>
                </div>
              </div>

              {/* Bullet 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#BAC8BF] flex items-center justify-center text-[#1A3328] shrink-0 shadow-xs">
                  <User className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-tight font-bold text-[14px] text-[#1A3328] leading-tight">
                    Personalised for you
                  </h4>
                  <p className="font-tight text-[12px] text-[#4A6355] mt-0.5 leading-snug">
                    Plans that adapt to your goals and lifestyle.
                  </p>
                </div>
              </div>

              {/* Bullet 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#BAC8BF] flex items-center justify-center text-[#1A3328] shrink-0 shadow-xs">
                  <Leaf className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-tight font-bold text-[14px] text-[#1A3328] leading-tight">
                    AI-powered coaching
                  </h4>
                  <p className="font-tight text-[12px] text-[#4A6355] mt-0.5 leading-snug">
                    Get guidance, track progress and stay consistent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: WELCOME BACK / AUTH FORM                         */}
        {/* ============================================================== */}
        <div className="bg-[#F4F7F4] p-8 sm:p-11 flex flex-col justify-between">
          <div className="max-w-[360px] mx-auto w-full my-auto space-y-5">
            {/* Top Centered Logo Badge */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#CAD7CF] flex items-center justify-center shadow-xs mb-3.5">
                <img
                  src="/nutriai_logo.png"
                  alt="NutriAI"
                  className="w-8 h-8 object-contain rounded-full"
                />
              </div>
              <h2 className="font-tight font-extrabold text-[24px] sm:text-[26px] text-[#1A3328] tracking-tight">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="font-tight text-[12.5px] text-[#556F60] mt-1">
                {mode === 'signin'
                  ? 'Sign in to continue to NutriAI'
                  : 'Sign up to start your personalized plan'}
              </p>
            </div>

            {/* Segmented Pill Toggle: Sign In / Sign Up */}
            <div className="p-1 rounded-xl bg-[#E2EBE4] grid grid-cols-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-[#CCD9D0] text-[#1A3328] shadow-xs'
                    : 'text-[#617B6D] hover:text-[#1A3328]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-[#CCD9D0] text-[#1A3328] shadow-xs'
                    : 'text-[#617B6D] hover:text-[#1A3328]'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              {/* Optional Name field in Sign Up mode */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    <label className="block text-[11.5px] font-semibold text-[#1A3328]">
                      Full Name
                    </label>
                    <div className="h-11 rounded-xl bg-transparent border border-[#CAD7CF] focus-within:border-[#1A3328] focus-within:ring-1 focus-within:ring-[#1A3328] px-3.5 flex items-center gap-2.5 transition-all">
                      <User className="w-4 h-4 text-[#738B7D] shrink-0" />
                      <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent text-xs text-[#1A3328] placeholder-[#879D90] focus:outline-none font-medium"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#1A3328]">
                  Email
                </label>
                <div className="h-11 rounded-xl bg-transparent border border-[#CAD7CF] focus-within:border-[#1A3328] focus-within:ring-1 focus-within:ring-[#1A3328] px-3.5 flex items-center gap-2.5 transition-all">
                  <Mail className="w-4 h-4 text-[#738B7D] shrink-0" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent text-xs text-[#1A3328] placeholder-[#879D90] focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[11.5px] font-semibold text-[#1A3328]">
                  Password
                </label>
                <div className="h-11 rounded-xl bg-transparent border border-[#CAD7CF] focus-within:border-[#1A3328] focus-within:ring-1 focus-within:ring-[#1A3328] px-3.5 flex items-center gap-2.5 transition-all">
                  <Lock className="w-4 h-4 text-[#738B7D] shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent text-xs text-[#1A3328] placeholder-[#879D90] focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-[#738B7D] hover:text-[#1A3328] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              {mode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-[11.5px] text-[#435C4E] hover:text-[#1A3328] hover:underline transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#203D32] hover:bg-[#2A4E40] text-white font-tight font-semibold text-[14px] flex items-center justify-center gap-2 shadow-xs transition-all hover:-translate-y-0.5 mt-2"
              >
                <span>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="w-full border-t border-[#D9E3DC]" />
              <span className="absolute bg-[#F4F7F4] px-3 font-tight text-[11px] text-[#7A9184]">
                or continue with
              </span>
            </div>

            {/* Social Auth Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                className="h-10 px-3 rounded-xl bg-white border border-[#D9E3DC] hover:bg-[#EAF1EC] text-[11.5px] font-semibold text-[#1A3328] flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                {/* Google G Logo */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('apple')}
                className="h-10 px-3 rounded-xl bg-white border border-[#D9E3DC] hover:bg-[#EAF1EC] text-[11.5px] font-semibold text-[#1A3328] flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                {/* Apple Logo */}
                <svg className="w-3.5 h-3.5 fill-[#1A3328]" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.8-8.15-12.33-15.22-6.52-10.19-11.49-21.75-14.9-34.69-3.41-12.94-5.12-25.02-5.12-36.24 0-14.35 3.48-26.4 10.45-36.14 6.97-9.74 15.63-14.76 25.99-15.06 4.79 0 10.44 1.34 16.94 4.02 6.5 2.68 10.51 4.07 12.02 4.18 1.45 0 5.68-1.5 12.69-4.51 7.02-3.01 12.98-4.35 17.89-4.02 13.73.67 24.38 5.62 31.95 14.86-12.03 7.25-17.93 17.2-17.69 29.86.23 9.94 4.02 18.23 11.38 24.87 7.36 6.64 16.07 10.47 26.13 11.5-2.24 6.92-4.8 13.43-7.69 19.53zM119.22 31.84c0-7.37 2.63-14.41 7.89-21.12 5.25-6.71 11.83-10.72 19.74-12.02.22 1.34.33 2.57.33 3.69 0 7.37-2.73 14.46-8.2 21.28-5.46 6.81-12.05 10.73-19.76 11.75v-3.58z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Bottom Toggle Text */}
            <div className="text-center pt-2">
              <span className="text-[12px] text-[#617B6D]">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
                className="text-[12px] font-bold text-[#1A3328] hover:underline ml-1"
              >
                {mode === 'signin' ? 'Create one' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
