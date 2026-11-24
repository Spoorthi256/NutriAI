import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: 'emerald' | 'cyan' | 'none';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glow = 'none',
  hoverEffect = false,
  ...props
}) => {
  const glowStyles = {
    none: '',
    emerald: 'border-brand-300 shadow-glow-emerald',
    cyan: 'border-accent-cyan/30 shadow-sm',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'bg-surface-card border border-surface-border rounded-2xl p-6 transition-all duration-200 shadow-card-subtle',
          hoverEffect && 'hover:border-brand-300 hover:shadow-card-hover',
          glowStyles[glow],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
