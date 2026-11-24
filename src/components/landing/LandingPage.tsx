import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, ArrowUpRight, Menu, X, ChevronDown, Mail, Check } from 'lucide-react';
import { useNutri } from '../../context/NutriContext';

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1] as const;

const LogoMark: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <img src="/nutriai_logo.png" alt="NutriAI" className={`${className} object-contain rounded-full`} />
);

const Wordmark: React.FC<{ className?: string; markClass?: string }> = ({ className = '', markClass = 'w-6 h-6' }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <LogoMark className={markClass} />
    <span className="font-tight font-semibold italic tracking-[-0.03em]">NutriAI</span>
  </span>
);

/** Avatar cropped from a 2x2 sprite of headshots. */
const SpriteAvatar: React.FC<{ index: 0 | 1 | 2 | 3; className?: string }> = ({ index, className = '' }) => {
  const pos = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'][index];
  return (
    <div
      className={`rounded-full bg-cover shadow-md ring-2 ring-white/70 ${className}`}
      style={{ backgroundImage: 'url(/landing/avatars.jpg)', backgroundSize: '200% 200%', backgroundPosition: pos }}
    />
  );
};

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

/* ------------------------------------------------------------------ */
/* Bento card wrapper                                                  */
/* ------------------------------------------------------------------ */

const BentoCard: React.FC<{ className?: string; delay?: number; children: React.ReactNode }> = ({
  className = '',
  delay = 0,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.8, delay, ease: EASE }}
    whileHover={{ y: -6, transition: { duration: 0.35, ease: EASE } }}
    className={`group relative overflow-hidden rounded-[22px] bg-cf-card border border-cf-line transition-shadow duration-500 hover:shadow-[0_28px_60px_-24px_rgba(31,58,48,0.35)] ${className}`}
  >
    {children}
  </motion.div>
);

const SmallCardText: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="absolute inset-x-0 bottom-0 px-6 pb-6 pt-16 bg-gradient-to-t from-cf-card via-cf-card to-transparent">
    <h4 className="font-tight font-bold text-[19px] tracking-[-0.02em] text-cf-ink">{title}</h4>
    <p className="mt-1 font-tight text-[13.5px] leading-snug text-cf-text">{body}</p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Bento card contents                                                 */
/* ------------------------------------------------------------------ */

const ORBIT = 400; // orbit diameter (px)
const orbitAvatars: { angle: number; size: number; idx: 0 | 1 | 2 | 3 }[] = [
  { angle: 300, size: 46, idx: 0 },
  { angle: 160, size: 52, idx: 1 },
  { angle: 25, size: 56, idx: 3 },
  { angle: 228, size: 40, idx: 2 },
];

const AdaptiveCoachingCard: React.FC = () => (
  <BentoCard className="h-[380px]">
    {/* concentric rings */}
    <div className="absolute left-1/2 top-[-150px] -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-cf-ink/[0.07]" />
    <div className="absolute left-1/2 top-[-60px] -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-cf-ink/[0.09]" />

    {/* rotating orbit of avatars (spins on hover) */}
    <div
      className="absolute left-1/2 top-[-60px] animate-[spin_40s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running]"
      style={{ width: ORBIT, height: ORBIT, marginLeft: -ORBIT / 2 }}
    >
      {orbitAvatars.map((a) => {
        const r = ORBIT / 2;
        const x = r + r * Math.cos((a.angle * Math.PI) / 180) - a.size / 2;
        const y = r + r * Math.sin((a.angle * Math.PI) / 180) - a.size / 2;
        return (
          <div key={a.angle} className="absolute" style={{ left: x, top: y, width: a.size, height: a.size }}>
            <div className="w-full h-full animate-[spin_40s_linear_infinite_reverse] [animation-play-state:paused] group-hover:[animation-play-state:running]">
              <SpriteAvatar index={a.idx} className="w-full h-full" />
            </div>
          </div>
        );
      })}
    </div>

    {/* centre AI coach avatar */}
    <div className="absolute left-1/2 top-[44px] -translate-x-1/2 w-[172px] h-[172px] rounded-full overflow-hidden shadow-[0_20px_40px_-12px_rgba(31,58,48,0.35)] ring-[6px] ring-white/50 bg-[#CCD8D1] transition-transform duration-700 ease-out group-hover:scale-[1.06] flex items-center justify-center p-3">
      <img src="/nutriai_logo.png" alt="NutriAI AI Coach" className="w-full h-full object-contain rounded-full" />
    </div>

    <div className="absolute inset-x-0 bottom-0 px-7 pb-7 pt-24 bg-gradient-to-t from-cf-card via-cf-card/95 to-transparent">
      <h3 className="font-display text-cf-ink text-[30px] md:text-[34px] leading-none tracking-[-0.005em]">
        AI-powered Adaptive Nutrition
      </h3>
      <p className="mt-3 font-tight text-[14.5px] leading-relaxed text-cf-text max-w-[440px]">
        Dynamic, real-time meal planning powered by nutrition science — adapting seamlessly to your goals, diet and
        schedule.
      </p>
    </div>
  </BentoCard>
);

const IntelligenceCard: React.FC<{ onExplore?: () => void }> = ({ onExplore }) => (
  <BentoCard className="h-[380px] cursor-pointer" delay={0.08}>
    <div onClick={onExplore} className="w-full h-full">
      {/* faint line-art circles */}
      <div className="absolute right-[-80px] top-[-90px] w-[420px] h-[420px] rounded-full border border-cf-ink/[0.06]" />
      <div className="absolute right-[-20px] top-[-30px] w-[300px] h-[300px] rounded-full border border-cf-ink/[0.06]" />
      <div className="absolute right-[40px] top-[30px] w-[180px] h-[180px] rounded-full border border-cf-ink/[0.06]" />

      <img
        src="/landing/knot.jpg"
        alt=""
        style={{
          WebkitMaskImage: 'radial-gradient(circle at 50% 48%, #000 52%, transparent 70%)',
          maskImage: 'radial-gradient(circle at 50% 48%, #000 52%, transparent 70%)',
        }}
        className="absolute right-[-20px] top-[-50px] w-[400px] h-[400px] object-cover mix-blend-multiply transition-transform duration-[1200ms] ease-out group-hover:rotate-[8deg] group-hover:scale-[1.06]"
      />

      <div className="absolute inset-x-0 bottom-0 px-7 pb-7 pt-24 bg-gradient-to-t from-cf-card via-cf-card/95 to-transparent">
        <h3 className="font-display text-cf-ink text-[30px] md:text-[34px] leading-none tracking-[-0.005em]">
          NutriAI Intelligence
        </h3>
        <div className="mt-3 flex items-end justify-between gap-6">
          <p className="font-tight text-[14.5px] leading-relaxed text-cf-text max-w-[420px]">
            The machine-learning engine that ranks every meal for you, so each recommendation is uniquely personal.
          </p>
          <div className="inline-flex items-center gap-1.5 font-tight font-semibold text-[13px] text-cf-ink flex-shrink-0 mb-1 group-hover:translate-x-1 transition-transform">
            <span>Explore</span>
            <ArrowRight className="w-4 h-4 text-cf-ink flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  </BentoCard>
);

// Weight chart geometry (values in kg mapped to a 75–100 axis)
const weights = [96, 95, 93, 94, 90, 87, 83];
const dates = ['4/5', '4/6', '4/7', '4/8', '4/9', '4/10', '4/11'];
const cx = (i: number) => 34 + i * 42;
const cy = (v: number) => 24 + ((100 - v) / 25) * 102;
const linePath = weights.map((v, i) => `${i === 0 ? 'M' : 'L'}${cx(i)} ${cy(v)}`).join(' ');
const areaPath = `${linePath} L${cx(weights.length - 1)} 126 L${cx(0)} 126 Z`;

const ProgressCard: React.FC = () => (
  <BentoCard className="h-[300px]" delay={0.05}>
    <div className="absolute left-6 top-5 font-display text-cf-ink text-[17px] tracking-wide">WEIGHT</div>
    <svg viewBox="0 0 300 150" className="absolute left-2 right-2 top-8 w-[calc(100%-16px)]">
      <defs>
        <linearGradient id="wArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F3A30" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#1F3A30" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[100, 87.5, 75].map((v) => (
        <text key={v} x="18" y={cy(v) + 3} textAnchor="end" className="fill-cf-text" fontSize="7">
          {v}
        </text>
      ))}
      {weights.map((_, i) => (
        <line key={i} x1={cx(i)} x2={cx(i)} y1="18" y2="126" stroke="#1F3A30" strokeOpacity="0.06" />
      ))}
      <motion.path
        d={areaPath}
        fill="url(#wArea)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.6 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke="#1F3A30"
        strokeWidth="1.4"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
      {/* marker */}
      <line x1={cx(5)} x2={cx(5)} y1="16" y2="126" stroke="#1F3A30" strokeWidth="1" />
      <text x={cx(5)} y="12" textAnchor="middle" fontSize="7.5" fontWeight="700" className="fill-cf-ink">
        87KG
      </text>
      {weights.map((v, i) => (
        <circle
          key={i}
          cx={cx(i)}
          cy={cy(v)}
          r={i === 5 ? 3.6 : 3.2}
          fill={i === 5 ? '#1F3A30' : '#FFFFFF'}
          stroke="#1F3A30"
          strokeWidth="1.2"
          className="origin-center transition-transform duration-300 group-hover:scale-125"
          style={{ transformBox: 'fill-box' }}
        />
      ))}
      {dates.map((d, i) => (
        <text key={d} x={cx(i)} y="140" textAnchor="middle" fontSize="6.5" className="fill-cf-text">
          {d}
        </text>
      ))}
    </svg>
    <SmallCardText
      title="Performance Insight"
      body="Real-time analytics that give you the insight to make powerful, informed decisions."
    />
  </BentoCard>
);

const PrecisionNutritionCard: React.FC = () => (
  <BentoCard className="h-[300px]" delay={0.12}>
    <div className="absolute left-1/2 top-3 -translate-x-1/2 w-[78%] h-[230px] rounded-t-[30px] bg-gradient-to-b from-[#E6E3DC] to-cf-card border border-cf-line border-b-0 transition-transform duration-500 group-hover:-translate-y-1.5">
      <div className="mx-auto mt-3 w-20 h-5 rounded-full bg-[#D5D1C9]" />
      <div className="px-3.5 mt-4 space-y-3">
        <div className="flex items-start gap-2 transition-transform duration-500 group-hover:translate-x-1">
          <img
            src="/nutriai_logo.png"
            alt="AI Coach"
            className="w-6 h-6 rounded-full object-contain flex-shrink-0 ring-1 ring-white/60 shadow-sm bg-[#CCD8D1] p-0.5"
          />
          <div className="bg-cf-ink text-white font-tight text-[10px] leading-snug rounded-xl rounded-tl-sm px-3 py-2 max-w-[80%] shadow-sm">
            We can train according to your schedule and calibrate your nutrition. 🤖✨
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 transition-transform duration-500 delay-75 group-hover:-translate-x-1">
          <div className="bg-[#DEDAD2] text-cf-ink font-tight text-[10px] leading-snug rounded-xl rounded-tr-sm px-3 py-2 max-w-[72%]">
            Thanks a lot! and yes I have a few diet questions
          </div>
          <div className="w-7 h-7 rounded-full bg-cf-ink text-white font-tight font-bold text-[9.5px] flex items-center justify-center flex-shrink-0">
            You
          </div>
        </div>
      </div>
    </div>
    <SmallCardText
      title="Precision Nutrition"
      body="Seamless nutrition tracking integrated into NutriAI Intelligence for optimum performance."
    />
  </BentoCard>
);

const DeliveryCard: React.FC = () => (
  <BentoCard className="h-[300px]" delay={0.19}>
    <div className="absolute inset-x-0 top-0 h-[210px]">
      {/* day header */}
      <div className="grid grid-cols-[52px_1fr_1fr_1fr] font-tight text-[10.5px] pt-3">
        <span />
        <span className="text-cf-ink font-semibold text-center">Mon</span>
        <span className="text-cf-text/60 text-center">Tue</span>
        <span className="text-cf-text/60 text-center">Wed</span>
      </div>
      {/* time labels */}
      <div className="absolute left-3 top-[48px] space-y-[32px] font-tight text-[8.5px] text-cf-text/60">
        <div>12:00 pm</div>
        <div>1:00 pm</div>
        <div>2:00 pm</div>
      </div>
      {/* timeline */}
      <div className="absolute left-[38px] right-0 top-[54px] h-px bg-cf-ink/80" />
      <div className="absolute left-[34px] top-[49px] w-[11px] h-[11px] rounded-full border-[1.5px] border-cf-ink bg-cf-card" />
      {/* rest day hatch */}
      <div
        className="absolute right-0 top-[40px] w-[30%] h-[150px] opacity-60"
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(31,58,48,0.08) 0 1px, transparent 1px 7px)' }}
      />
      <div className="absolute right-[6%] top-[110px] font-tight text-[9px] text-cf-text/70">Rest Day</div>
      {/* blocks */}
      <div className="absolute left-[64px] top-[42px] w-[86px] rounded-md bg-cf-ink text-white px-2.5 py-2 shadow-lg transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-2deg]">
        <div className="font-tight font-bold text-[9.5px] leading-tight">Functional Training 🏋️</div>
        <div className="font-tight text-[8px] opacity-80 mt-1">12:00 pm – 1:00 pm</div>
      </div>
      <div className="absolute left-[46%] top-[72px] w-[80px] rounded-md bg-[#E2DED6] border border-white/60 text-cf-text px-2.5 py-2 transition-transform duration-500 group-hover:translate-y-1">
        <div className="font-tight font-semibold text-[9.5px] leading-tight">Weight Lifting 🏋️</div>
        <div className="font-tight text-[8px] opacity-70 mt-1">1:00 pm – 2:00 pm</div>
      </div>
    </div>
    <SmallCardText
      title="Community"
      body="Connect and compete in a supportive team environment — with challenges, leaderboards and shared progress to keep you consistent and motivated."
    />
  </BentoCard>
);

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

const testimonials: { brand: string; quote: string; name: string; role: string; avatar: 0 | 1 | 2 | 3 }[] = [
  {
    brand: 'R I Z E',
    quote:
      'NutriAI has transformed my approach to personal health. What stands out most about NutriAI is the support and accountability provided by the AI health coach. For anyone eager to take charge of their health and fitness journey with dedicated support, I highly recommend NutriAI.',
    name: 'Macgill Davis',
    role: 'Co-Founder, Rize',
    avatar: 1,
  },
  {
    brand: 'V E R D E',
    quote:
      'NutriAI unifies nutrition science with conversational intelligence. What used to take hours of manual tracking now happens in seconds through natural conversation.',
    name: 'Arjun Mehta',
    role: 'Co-Founder, Verde',
    avatar: 3,
  },
  {
    brand: 'K I N E T I C',
    quote:
      'I have a peanut allergy and I’m vegetarian — NutriAI respects my constraints first, then finds meals I truly enjoy. The weekly plan and deliveries just work.',
    name: 'Priya Raman',
    role: 'Product Designer, Kinetic',
    avatar: 2,
  },
];

const Testimonials: React.FC = () => {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);

  const go = (d: number) => setState(([i]) => [(i + d + testimonials.length) % testimonials.length, d]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
  }, [paused, index]);

  const t = testimonials[index];

  return (
    <section id="testimonials" className="bg-cf-cream py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between gap-6 mb-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display text-cf-ink text-[38px] md:text-[48px] leading-none tracking-[-0.005em]"
          >
            Real people. Real performance.
          </motion.h2>
          <div className="flex gap-2">
            {[
              { d: -1, Icon: ArrowLeft, label: 'Previous' },
              { d: 1, Icon: ArrowRight, label: 'Next' },
            ].map(({ d, Icon, label }) => (
              <button
                key={label}
                onClick={() => go(d)}
                aria-label={label}
                className="w-11 h-11 rounded-xl bg-cf-sage hover:bg-cf-sageDark text-cf-ink flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1E392F] via-[#3A574B] to-[#5E7D6E] min-h-[540px] flex items-center justify-center px-6 md:px-24 py-16"
        >
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={index}
              custom={dir}
              initial={{ opacity: 0, x: dir * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -50 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="flex flex-col items-center text-center"
            >
              <div className="font-tight font-light text-white text-[24px] tracking-[0.45em] pl-[0.45em]">{t.brand}</div>
              <blockquote className="mt-10 max-w-[820px] font-tight font-semibold text-white text-[21px] md:text-[26px] leading-[1.5] tracking-[-0.01em]">
                “{t.quote}”
              </blockquote>
              <div className="mt-12 flex items-center gap-4 text-left">
                <SpriteAvatar index={t.avatar} className="w-12 h-12 ring-0" />
                <div>
                  <div className="font-tight font-bold text-white text-[14px]">{t.name}</div>
                  <div className="font-tight text-white/75 text-[13px]">{t.role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setState([i, i > index ? 1 : -1])}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* FAQs                                                                */
/* ------------------------------------------------------------------ */

const faqs: { q: string; a: string }[] = [
  {
    q: 'What is NutriAI?',
    a: 'NutriAI is an intelligent health and performance platform. You converse with an adaptive AI coach about your targets, body metrics, and lifestyle to receive calibrated nutrition plans, meal recommendations, and guidance.',
  },
  {
    q: 'How does the AI Coach adapt to my diet and goals?',
    a: 'NutriAI adapts instantly to your conditions. If you have digestive sensitivities, injuries, joint strain, or unique dietary constraints, tell the AI coach and your macronutrient allocation and meals adjust seamlessly.',
  },
  {
    q: 'Can I swap or customize meals just by chatting?',
    a: 'Yes. You chat directly with your AI Coach in the app workspace. Ask for recipe swaps, macro adjustments, or meal prep suggestions anytime — your coach updates your weekly plan in real time.',
  },
  {
    q: 'What if I have food allergies or dietary restrictions?',
    a: 'NutriAI puts constraint satisfaction first. Every recommendation is strictly filtered against your allergen profile and dislikes before being scored by the ML recommendation engine.',
  },
  {
    q: 'How does the Doorstep Delivery and Meal Pass Credits system work?',
    a: 'Subscribed members receive digital meal credits (7 for Weekly, 30 for Monthly, 400 for Annual). For each delivery, our central kitchen in Sector 62, Noida prepares your dish in tamper-proof thermal boxes. When the courier arrives, they scan your digital QR Pass ("NUTRI-PASS-9921"), deducting 1 meal credit upon physical handover.',
  },
  {
    q: 'Can I pause, hold, or reschedule my deliveries if I am traveling?',
    a: 'Yes, full logistical control is in your hands. You can ask the AI Coach directly in chat (e.g. "Hold my deliveries for 3 days" or "Postpone today\'s lunch to tomorrow evening") or manage holds with one tap in your Deliveries tab. No credits are wasted while on hold.',
  },
  {
    q: 'What if I want to cancel or change my subscription plan?',
    a: 'You can cancel or upgrade your subscription at any time. Simply tell your AI Coach "Cancel my subscription" to downgrade to the free tier immediately, or ask to "Upgrade plan" to view our Weekly, Monthly, or Annual options with test Razorpay integration.',
  },
];

const FAQs: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faqs" className="bg-white py-24 px-6">
      <div className="max-w-[1040px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-display text-cf-ink text-[40px] md:text-[46px] leading-none mb-4"
        >
          FAQs
        </motion.h2>
        <div>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.03, ease: EASE }}
                className="border-b border-[#E3E3DE]"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-[22px] text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="font-tight font-semibold text-[15px] tracking-[-0.01em] text-cf-ink transition-colors group-hover:text-cf-inkHover">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-cf-ink flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 font-tight text-[14.5px] leading-relaxed text-cf-text max-w-[820px]">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const LandingPage: React.FC = () => {
  const { setActiveView, setActiveTab, resetConversation, setAuthMode } = useNutri();
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Deep-link support: /#features, /#faqs, etc.
  useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView(), 100);
  }, []);

  const handleStartOnboarding = () => {
    setAuthMode('signup');
    setActiveView('auth');
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setActiveView('auth');
  };

  const openAICoach = () => {
    setActiveView('ai_coach_page');
  };

  const navLinks: { label: string; onClick: () => void }[] = [
    { label: 'Home', onClick: () => scrollToId('top') },
    { label: 'About', onClick: () => scrollToId('features') },
    { label: 'AI Coach', onClick: openAICoach },
  ];

  const menuLinks: { label: string; onClick: () => void }[] = [
    ...navLinks,
    { label: 'Sign In', onClick: handleSignIn },
    { label: 'Sign Up (New Account)', onClick: handleStartOnboarding },
    { label: 'Reviews', onClick: () => scrollToId('testimonials') },
    { label: 'FAQs', onClick: () => scrollToId('faqs') },
    { label: 'Stay updated', onClick: () => scrollToId('newsletter') },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  const footerCols: { title: string; links: { label: string; onClick: () => void }[] }[] = [
    {
      title: 'Product',
      links: [
        { label: 'AI Coach', onClick: openAICoach },
        { label: 'FAQs', onClick: () => scrollToId('faqs') },
        { label: 'Build my plan', onClick: handleStartOnboarding },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About NutriAI', onClick: () => scrollToId('features') },
        { label: 'Reviews', onClick: () => scrollToId('testimonials') },
        { label: 'Contact', onClick: () => scrollToId('newsletter') },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Use', onClick: () => scrollToId('faqs') },
        { label: 'Privacy Policy', onClick: () => scrollToId('faqs') },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white font-tight text-cf-ink antialiased selection:bg-cf-sage selection:text-cf-ink">
      {/* ---------------- NAVBAR ---------------- */}
      <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4">
        <motion.nav
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative w-full max-w-[780px] h-[56px] flex items-center justify-between gap-4 rounded-full bg-cf-pill/95 backdrop-blur-md px-3 sm:px-4 shadow-[0_12px_32px_-8px_rgba(31,58,48,0.22)] border border-cf-line/40"
        >
          <button
            onClick={() => scrollToId('top')}
            className="flex items-center gap-2 pl-2 text-cf-ink hover:opacity-90 transition-opacity"
          >
            <Wordmark markClass="w-[22px] h-[22px]" />
          </button>

          <div className="hidden md:flex items-center gap-1.5">
            {navLinks.map((l) => (
              <button
                key={l.label}
                onClick={l.onClick}
                className="px-4 py-1.5 rounded-full font-tight text-[14px] text-cf-ink/80 hover:text-cf-ink hover:bg-black/[0.04] font-medium transition-all"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSignIn}
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full font-tight text-[14px] text-cf-ink font-semibold hover:bg-black/[0.04] transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={handleStartOnboarding}
              className="group hidden sm:inline-flex items-center gap-2 h-[42px] px-5 rounded-full bg-cf-ink hover:bg-cf-inkHover text-white font-tight font-semibold text-[14px] tracking-[-0.01em] transition-all shadow-sm"
            >
              Start your plan now
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Open menu"
              className="w-[42px] h-[42px] rounded-full bg-cf-sage hover:bg-cf-sageDark text-cf-ink flex items-center justify-center transition-all"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
            </button>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-2xl bg-cf-pill p-2 shadow-[0_20px_40px_-12px_rgba(31,58,48,0.25)] border border-cf-line"
              >
                {menuLinks.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => {
                      setMenuOpen(false);
                      l.onClick();
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-[14.5px] text-cf-ink hover:bg-cf-sage/60 transition-colors"
                  >
                    {l.label}
                    <ArrowUpRight className="w-4 h-4 opacity-50" />
                  </button>
                ))}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleStartOnboarding();
                  }}
                  className="sm:hidden mt-1 w-full h-11 rounded-xl bg-cf-ink text-white font-semibold text-[14.5px]"
                >
                  Start your plan now
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </header>

      {/* ---------------- HERO ---------------- */}
      <section id="top" className="relative bg-cf-sage min-h-screen flex items-center justify-center px-6 pt-36 pb-24 overflow-hidden">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="p-1 rounded-full bg-white/40 backdrop-blur-sm shadow-[0_12px_28px_-8px_rgba(31,58,48,0.25)] ring-2 ring-white/60"
            >
              <LogoMark className="w-[110px] h-[110px] sm:w-[132px] sm:h-[132px]" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="mt-8 font-display text-cf-ink text-[42px] sm:text-[60px] md:text-[74px] leading-[1.04] tracking-[-0.005em]"
          >
            Whole-Body Nutrition.
            <br />
            Powered by Intelligent Coaching.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            className="mt-6 max-w-[620px] font-tight text-[16px] md:text-[17px] leading-[1.6] text-cf-text"
          >
            NutriAI unifies evidence-based nutrition science with machine-learning personalisation — giving you adaptive
            meal plans, macro targets and meal delivery in one seamless ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          >
            <button
              onClick={handleStartOnboarding}
              className="group mt-9 inline-flex items-center gap-2.5 h-[56px] px-7 rounded-xl bg-cf-ink hover:bg-cf-inkHover text-white font-tight font-semibold text-[16px] tracking-[-0.01em] shadow-[0_12px_30px_-10px_rgba(31,58,48,0.6)] transition-colors duration-200 cursor-pointer"
            >
              Start Your Personalised Plan
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ---------------- BENTO FEATURES ---------------- */}
      <section id="features" className="bg-white py-24 px-6">
        <div className="max-w-[1040px] mx-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AdaptiveCoachingCard />
            <IntelligenceCard onExplore={openAICoach} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ProgressCard />
            <PrecisionNutritionCard />
            <DeliveryCard />
          </div>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <Testimonials />

      {/* ---------------- FAQS ---------------- */}
      <FAQs />

      {/* ---------------- NEWSLETTER ---------------- */}
      <section id="newsletter" className="bg-gradient-to-br from-[#2A453A] via-[#3B574B] to-[#577566] py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="max-w-[1000px] mx-auto rounded-[28px] bg-white/[0.2] border border-white/10 backdrop-blur-sm px-6 py-20 text-center"
        >
          <h2 className="font-display text-[#F4F1EA] text-[38px] md:text-[46px] leading-[1.06]">
            Stay Connected to
            <br />
            the NutriAI Journey
          </h2>
          <p className="mt-4 mx-auto max-w-[380px] font-tight text-[15px] leading-relaxed text-white/75">
            Be the first to hear about new features, recipes and what we’re building next.
          </p>

          <AnimatePresence mode="wait">
            {subscribed ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 mx-auto max-w-[320px] h-[96px] rounded-xl bg-white/90 flex flex-col items-center justify-center gap-1 text-cf-ink"
              >
                <Check className="w-5 h-5" />
                <span className="font-semibold text-[14.5px]">Thanks — you’re on the list.</span>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubscribe} className="mt-8 mx-auto max-w-[320px] space-y-2.5" exit={{ opacity: 0 }}>
                <label className="flex items-center gap-2.5 h-[46px] px-4 rounded-xl bg-white focus-within:ring-2 focus-within:ring-white/60 transition">
                  <Mail className="w-4 h-4 text-cf-ink" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="flex-1 bg-transparent outline-none font-tight text-[14.5px] text-cf-ink placeholder:text-cf-text/60"
                  />
                </label>
                <button
                  type="submit"
                  className="group w-full h-[46px] rounded-xl bg-cf-ink hover:bg-[#16291F] text-white font-tight font-semibold text-[14px] inline-flex items-center justify-center gap-2 transition-colors"
                >
                  Get Early Access Updates
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-cf-night text-white px-6 pt-14 pb-10">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-12">
          <div>
            <Wordmark className="text-[30px] text-white" markClass="w-[28px] h-[28px]" />
            <p className="mt-10 max-w-[280px] font-tight font-bold text-[15px] leading-snug">
              Intelligent Nutrition for Individuals, Families and Active Lifestyles.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {footerCols.map((col) => (
              <div key={col.title}>
                <div className="font-tight font-semibold text-[15px]">{col.title}</div>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button
                        onClick={l.onClick}
                        className="font-tight text-[13.5px] text-white/80 hover:text-white transition-colors text-left"
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-[1000px] mx-auto mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 font-tight text-[12px] text-white/50">
          <span>© {new Date().getFullYear()} NutriAI Health Systems. All rights reserved.</span>
          <span>Nutrition estimates are for planning purposes and are not medical advice.</span>
        </div>
      </footer>
    </div>
  );
};
