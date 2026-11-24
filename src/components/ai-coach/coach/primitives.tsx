import React, { useEffect, useId, useRef, useState } from 'react';
import { animate, motion, useInView } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Palette used across the AI Coach page (forest + emerald, no black, no white boxes). */
export const C = {
  page: '#07130D',
  inner: '#10281C',
  line: '#1A3D2C',
  lineHover: '#2F6D4C',
  mint: '#64D88E',
  green: '#2F7D4A',
  sage: '#88D1A3',
  pale: '#A8D5B5',
  muted: '#8EA89B',
  dim: '#5F7D6D',
  track: '#0A1A12',
};

/* ------------------------------------------------------------------ */
/* Bento card                                                          */
/* ------------------------------------------------------------------ */

export const BentoCard: React.FC<{
  className?: string;
  delay?: number;
  children: React.ReactNode;
}> = ({ className = '', delay = 0, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={`group/card relative min-w-0 overflow-hidden rounded-[28px] border border-[#1A3D2C] bg-gradient-to-b from-[#0F271C] to-[#0B1D14] p-6 sm:p-7 transition-[border-color,box-shadow] duration-500 hover:border-[#2F6D4C] hover:shadow-[0_30px_60px_-30px_rgba(100,216,142,0.28)] ${className}`}
    >
      {/* cursor spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background:
            'radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(100,216,142,0.09), transparent 45%)',
        }}
      />
      <div className="relative flex h-full min-w-0 flex-col">{children}</div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Card header                                                         */
/* ------------------------------------------------------------------ */

export const CardHeader: React.FC<{
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}> = ({ eyebrow, title, right }) => (
  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#64D88E]">{eyebrow}</div>
      <h3 className="mt-1.5 font-tight text-[19px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[21px]">
        {title}
      </h3>
    </div>
    {right && <div className="shrink-0">{right}</div>}
  </div>
);

/* ------------------------------------------------------------------ */
/* Segmented control with sliding pill                                 */
/* ------------------------------------------------------------------ */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <div className="inline-flex rounded-full border border-[#1A3D2C] bg-[#0A1A12] p-1">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`relative rounded-full px-3 py-1 font-mono text-[11px] transition-colors ${
              active ? 'text-white' : 'text-[#8EA89B] hover:text-white'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-[#1D4D35]"
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Count-up number (animates once when scrolled into view)             */
/* ------------------------------------------------------------------ */

export const CountUp: React.FC<{ value: number; decimals?: number; suffix?: string }> = ({
  value,
  decimals = 0,
  suffix = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, { duration: 1.6, ease: EASE, onUpdate: setDisplay });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
};

/** Small pill used in card header right slots. */
export const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#23583C] bg-[#12301F] px-2.5 py-1 font-mono text-[10.5px] text-[#A8D5B5]">
    {children}
  </span>
);

/** Floating tooltip box (positioned by parent). */
export const TipBox: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 6, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 6, scale: 0.97 }}
    transition={{ duration: 0.18 }}
    className={`pointer-events-none z-20 rounded-xl border border-[#2F6D4C] bg-[#0E2A1C]/95 px-3 py-2 font-tight text-[11.5px] text-white shadow-[0_16px_32px_-12px_rgba(0,0,0,0.6)] backdrop-blur ${className}`}
  >
    {children}
  </motion.div>
);
