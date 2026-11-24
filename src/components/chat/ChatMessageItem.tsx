import React, { useState } from 'react';
import { marked } from 'marked';
import { ChatMessage, QuickActionOption, NutritionProfile } from '../../types';
import { useNutri } from '../../context/NutriContext';
import { GOAL_LABELS, ACTIVITY_LABELS, DIET_LABELS } from '../../utils/nutritionCalculator';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Sparkles, ChevronRight, Check, Edit3, ArrowRight } from 'lucide-react';

marked.setOptions({
  gfm: true,
  breaks: true,
});

const renderMarkdown = (content: string) => {
  try {
    const rawHtml = marked.parse(content) as string;
    return (
      <div
        className="markdown-content text-xs sm:text-sm leading-relaxed text-[#1F3A30]"
        dangerouslySetInnerHTML={{ __html: rawHtml }}
      />
    );
  } catch {
    return <p className="leading-relaxed text-[#1F3A30]">{content}</p>;
  }
};

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const { selectQuickAction, submitNumberInput, userProfile, sendMessage, submitInput, messages } = useNutri();
  const isAI = message.role === 'ai' || message.sender === 'ai';

  const [numValue, setNumValue] = useState<string>(() => {
    if (message.inputConfig) {
      const field = message.inputConfig.field;
      const initial = userProfile[field as keyof NutritionProfile];
      return initial ? String(initial) : '';
    }
    return '';
  });

  React.useEffect(() => {
    if (message.inputConfig) {
      const field = message.inputConfig.field;
      const initial = userProfile[field as keyof NutritionProfile];
      setNumValue(initial ? String(initial) : '');
    }
  }, [message.id, message.inputConfig]);

  // Check if this message was already answered in conversation
  const msgIndex = messages.findIndex((m) => m.id === message.id);
  const nextMsg = msgIndex !== -1 && msgIndex < messages.length - 1 ? messages[msgIndex + 1] : null;
  const isAnswered = nextMsg !== null && (nextMsg.role === 'user' || nextMsg.sender === 'user');

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = numValue.trim() || (message.inputConfig?.field === 'name' ? 'Yuvraj' : '');
    if (!message.inputConfig || !val) return;
    submitInput(val, message.inputConfig.field);
  };

  if (!isAI) {
    return (
      <div className="flex justify-end my-3 ml-auto max-w-2xl animate-fade-in">
        <div className="bg-[#CAD7CF] border border-[#BAC8BF] rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-[#1F3A30] shadow-2xs">
          <div className="flex items-center gap-2 mb-1 justify-end">
            <span className="text-[10px] font-semibold text-[#3B5446] uppercase tracking-wider">
              {userProfile.name}
            </span>
            <div className="w-5 h-5 rounded-full bg-[#203D32] text-white flex items-center justify-center font-bold text-[10px]">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="text-[#1F3A30] font-medium text-xs sm:text-sm">{message.content}</div>
          <div className="text-[10px] text-[#587263] text-right mt-1.5 font-mono">
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 animate-fade-in w-full max-w-3xl mr-auto">
      <div className="flex items-start gap-3">
        {/* AI Icon Header */}
        <div className="w-8 h-8 rounded-full bg-[#CAD7CF] flex items-center justify-center p-1.5 shadow-2xs shrink-0">
          <img
            src="/nutriai_logo.png"
            alt="NutriAI"
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-[#1F3A30] tracking-tight">NutriAI</span>
            <span className="text-[10.5px] text-[#6B8074] font-mono">{message.timestamp}</span>
          </div>

          {/* AI Message Card */}
          <div className="bg-[#F3F7F4] border border-[#D5E1D8] rounded-[22px] p-4 sm:p-5 text-sm text-[#1F3A30] shadow-2xs space-y-3">
            {renderMarkdown(message.content)}

            {/* Profile Review Summary Component (Styled to match website theme) */}
            {message.type === 'review_summary' && (
              <div className="my-3 p-4 bg-[#E5EFE8] border border-[#CAD7CF] rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#CAD7CF] pb-2">
                  <span className="text-xs font-bold text-[#1F3A30] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#203D32]" /> Precision Profile Blueprint
                  </span>
                  <span className="text-[10px] font-bold bg-[#CAD7CF] text-[#1F3A30] px-2.5 py-0.5 rounded-full uppercase">
                    Ready For Plan
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-[#F4F7F4] p-3 rounded-xl border border-[#D5E1D8]">
                    <span className="text-[#587263] block text-[10px] font-semibold">Name & Baseline</span>
                    <span className="font-bold text-[#1F3A30]">
                      {userProfile.name}{userProfile.age ? `, ${userProfile.age} yrs` : ''} {userProfile.gender ? `(${userProfile.gender})` : ''}
                    </span>
                  </div>
                  <div className="bg-[#F4F7F4] p-3 rounded-xl border border-[#D5E1D8]">
                    <span className="text-[#587263] block text-[10px] font-semibold">Primary Goal</span>
                    <span className="font-bold text-[#1F3A30]">
                      {userProfile.goal ? GOAL_LABELS[userProfile.goal]?.label : 'Build Muscle'}
                    </span>
                  </div>
                  <div className="bg-[#F4F7F4] p-3 rounded-xl border border-[#D5E1D8]">
                    <span className="text-[#587263] block text-[10px] font-semibold">Height & Weight</span>
                    <span className="font-bold text-[#1F3A30]">
                      {userProfile.heightCm} cm / {userProfile.weightKg} kg
                    </span>
                  </div>
                  <div className="bg-[#F4F7F4] p-3 rounded-xl border border-[#D5E1D8]">
                    <span className="text-[#587263] block text-[10px] font-semibold">Diet & Cadence</span>
                    <span className="font-bold text-[#1F3A30]">
                      {userProfile.dietType || 'vegetarian'} • {userProfile.mealsPerDay || 4} meals/day
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-1 text-xs text-[#1F3A30]">
                  {userProfile.allergies && userProfile.allergies.length > 0 && (
                    <div>
                      Allergies:{' '}
                      <span className="text-amber-800 font-semibold">{userProfile.allergies.join(', ')}</span>
                    </div>
                  )}
                  {userProfile.dislikedFoods && userProfile.dislikedFoods.length > 0 && (
                    <div>
                      Disliked Foods:{' '}
                      <span className="text-[#587263] font-semibold">{userProfile.dislikedFoods.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compact Inline Numeric / Text Input */}
            {message.inputConfig && (
              <>
                {isAnswered ? (
                  <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DCE8DF] border border-[#CCD8CF] text-xs font-semibold text-[#1F3A30]">
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                    <span>
                      Confirmed: <strong>{nextMsg?.content || numValue}</strong>
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleInputSubmit} className="mt-3 flex items-center gap-2.5 max-w-sm">
                    <div className="relative flex-1">
                      <input
                        type={message.inputConfig.inputType}
                        min={message.inputConfig.min}
                        max={message.inputConfig.max}
                        value={numValue}
                        onChange={(e) => setNumValue(e.target.value)}
                        placeholder={message.inputConfig.placeholder}
                        autoFocus
                        className="w-full bg-[#E5EFE8] border border-[#CCD8CF] rounded-full px-4 py-2 text-xs font-semibold text-[#1F3A30] focus:outline-none focus:ring-1 focus:ring-[#1F3A30]"
                      />
                      {message.inputConfig.unit && (
                        <span className="absolute right-3.5 top-2 text-[11px] font-semibold text-[#6B8074] pointer-events-none">
                          {message.inputConfig.unit}
                        </span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={!numValue.trim()}
                      className="h-9 px-5 rounded-full bg-[#203D32] hover:bg-[#2B4E3F] text-white font-tight font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> Submit
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Quick Action Pill Buttons */}
            {message.quickActions && message.quickActions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#D5E1D8]">
                <div className="text-[11px] font-semibold text-[#587263] mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#203D32]" />{' '}
                  {isAnswered ? 'Selected Option:' : 'Select Response:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {message.quickActions.map((option: QuickActionOption, idx: number) => {
                    const isSelected = nextMsg?.content === option.label;
                    if (isAnswered && !isSelected) return null; // Show only the chosen option if answered
                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => selectQuickAction(option.label, option.value, option.category)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-2xs ${
                          isSelected || isAnswered
                            ? 'bg-[#CAD7CF] text-[#1F3A30] border border-[#BAC8BF]'
                            : 'bg-[#E5EFE8] hover:bg-[#D7E2DB] text-[#1F3A30] border border-[#CCD8CF] active:scale-95 cursor-pointer'
                        }`}
                      >
                        {isAnswered && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />}
                        <span>{option.label}</span>
                        {!isAnswered && (
                          <ChevronRight className="w-3.5 h-3.5 text-[#587263] group-hover:translate-x-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

