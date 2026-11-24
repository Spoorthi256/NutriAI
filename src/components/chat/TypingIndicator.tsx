import React from 'react';
import { Sparkles } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 my-4 animate-fade-in">
      <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 border border-brand-300 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
        ✦
      </div>
      <div className="bg-white border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-brand-800 flex items-center gap-2 shadow-card-subtle">
        <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin" />
        <span className="font-medium text-surface-muted">NutriAI is analyzing & updating artifacts...</span>
        <div className="flex gap-1 items-center ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>
    </div>
  );
};
