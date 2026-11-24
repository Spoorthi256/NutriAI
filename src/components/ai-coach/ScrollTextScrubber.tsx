import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

interface ScrollTextScrubberProps {
  text?: string;
}

const Word: React.FC<{
  word: string;
  index: number;
  total: number;
  progress: any;
}> = ({ word, index, total, progress }) => {
  // Staggered threshold for each word to illuminate smoothly
  const start = index / total;
  const end = Math.min(1, start + 1.2 / total);

  const opacity = useTransform(progress, [start, end], [0.18, 1]);
  const color = useTransform(progress, [start, end], ['#416552', '#FFFFFF']);
  const textShadow = useTransform(
    progress,
    [start, end],
    ['0 0 0px rgba(100,216,142,0)', '0 0 28px rgba(100,216,142,0.45)']
  );

  return (
    <motion.span
      style={{ opacity, color, textShadow }}
      className="inline-block mr-[0.24em] last:mr-0 transition-colors will-change-transform"
    >
      {word}
    </motion.span>
  );
};

export const ScrollTextScrubber: React.FC<ScrollTextScrubberProps> = ({
  text = 'NutriAI Intelligence is faster, smarter and engineered for human performance',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const words = text.split(' ');
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.98]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[220vh] bg-gradient-to-b from-[#07130D] via-[#0A1A12] to-[#07130D]"
    >
      {/* Sticky Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[680px] h-[400px] rounded-full bg-[#2F7D4A]/12 blur-[130px]" />
        </div>

        {/* Top Eyebrow Badge */}
        <div className="relative z-10 mb-8 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#122D1F] border border-[#1E4D34] text-[#64D88E] font-mono text-xs uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#64D88E] animate-pulse" />
          Autonomous Nutrition Core
        </div>

        {/* Main Scrubbing Text */}
        <motion.div style={{ scale }} className="relative z-10 max-w-[1100px] mx-auto text-center">
          <h2 className="font-display text-[42px] sm:text-[64px] md:text-[84px] lg:text-[96px] leading-[1.02] tracking-[-0.015em] uppercase select-none">
            {words.map((word, i) => (
              <Word
                key={i}
                word={word}
                index={i}
                total={words.length}
                progress={scrollYProgress}
              />
            ))}
          </h2>
        </motion.div>

        {/* Bottom Scroll Progress Bar & Helper */}
        <div className="relative z-10 mt-12 flex flex-col items-center gap-3">
          <div className="w-48 h-1 rounded-full bg-[#143625] overflow-hidden">
            <motion.div
              style={{ scaleX: scrollYProgress }}
              className="h-full bg-gradient-to-r from-[#2F7D4A] to-[#64D88E] origin-left"
            />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#7A9988] uppercase tracking-wider">
            <span>Scroll to explore models</span>
            <ArrowDown className="w-3 h-3 text-[#64D88E] animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};
