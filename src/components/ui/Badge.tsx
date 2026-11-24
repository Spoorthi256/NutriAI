import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'amber' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  className,
}) => {
  const variants = {
    emerald: 'bg-brand-100 text-brand-700 border border-brand-300/80 font-medium',
    cyan: 'bg-sky-50 text-sky-700 border border-sky-200 font-medium',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200 font-medium',
    neutral: 'bg-surface-subtle text-brand-800 border border-surface-border font-medium',
    outline: 'border border-surface-border text-surface-muted bg-white',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-medium rounded-md',
    md: 'px-2.5 py-1 text-xs font-medium rounded-lg',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 transition-colors',
          variants[variant],
          sizes[size],
          className
        )
      )}
    >
      {children}
    </span>
  );
};
