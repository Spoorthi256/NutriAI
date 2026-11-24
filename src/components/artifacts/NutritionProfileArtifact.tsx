import React, { useState } from 'react';
import { useNutri } from '../../context/NutriContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { GOAL_LABELS, ACTIVITY_LABELS, DIET_LABELS } from '../../utils/nutritionCalculator';
import {
  Flame,
  Dumbbell,
  TrendingUp,
  Zap,
  RotateCw,
  Edit3,
  Check,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const NutritionProfileArtifact: React.FC = () => {
  const { userProfile, updateProfile, sendMessage } = useNutri();
  const [isEditing, setIsEditing] = useState(false);
  const [editWeight, setEditWeight] = useState((userProfile.weightKg ?? 87).toString());
  const [editHeight, setEditHeight] = useState((userProfile.heightCm ?? 178).toString());

  const handleSaveEdit = () => {
    const w = parseFloat(editWeight) || (userProfile.weightKg ?? 87);
    const h = parseFloat(editHeight) || (userProfile.heightCm ?? 178);
    updateProfile({ weightKg: w, heightCm: h });
    setIsEditing(false);
    sendMessage(`I updated my height to ${h}cm and weight to ${w}kg.`);
  };

  const currentGoalInfo = GOAL_LABELS[userProfile.goal || 'muscle_gain'] || GOAL_LABELS.muscle_gain;

  return (
    <div className="space-y-5 animate-fade-in transition-all duration-300">
      {/* Top Header Card */}
      <Card className="bg-white border-surface-border">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald">LIVE ARTIFACT</Badge>
              <span className="text-[11px] font-mono text-surface-muted">ID: #NP-9921</span>
            </div>
            <h2 className="text-xl font-extrabold text-brand-800 tracking-tight">NUTRITION PROFILE</h2>
            <p className="text-xs text-surface-muted mt-0.5">
              Live synchronized health baseline & derived targets.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-lg bg-surface-subtle hover:bg-brand-100 text-brand-700 transition-colors"
              title="Edit Profile Data"
            >
              <Edit3 className="w-4 h-4 text-brand-600" />
            </button>
            <button
              onClick={() => sendMessage('Recalculate my nutrition profile targets')}
              className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors"
              title="Refresh Targets"
            >
              <RotateCw className="w-4 h-4 text-sky-600" />
            </button>
          </div>
        </div>
      </Card>

      {/* Goal Summary */}
      <div className="bg-brand-50 p-4 rounded-2xl border border-brand-200 flex items-center gap-4 transition-all duration-300">
        <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 border border-brand-300 flex items-center justify-center flex-shrink-0 shadow-sm">
          {userProfile.goal === 'muscle_gain' && <Dumbbell className="w-6 h-6 text-brand-600" />}
          {userProfile.goal === 'weight_loss' && <Flame className="w-6 h-6 text-amber-600" />}
          {userProfile.goal === 'weight_gain' && <TrendingUp className="w-6 h-6 text-sky-600" />}
          {userProfile.goal === 'maintenance' && <Zap className="w-6 h-6 text-purple-600" />}
        </div>
        <div>
          <div className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Primary Goal</div>
          <div className="text-base font-bold text-brand-800">{currentGoalInfo.label}</div>
          <div className="text-xs text-surface-muted mt-0.5">{currentGoalInfo.description}</div>
        </div>
      </div>

      {/* Profile Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 space-y-1 transition-all duration-300 hover:border-brand-300">
          <span className="text-[11px] font-medium text-surface-muted">Current Weight</span>
          {isEditing ? (
            <input
              type="number"
              value={editWeight}
              onChange={(e) => setEditWeight(e.target.value)}
              className="w-full bg-white border border-brand-300 rounded-lg px-2 py-1 text-sm font-bold text-brand-800"
            />
          ) : (
            <div className="text-lg font-extrabold text-brand-800">
              {userProfile.weightKg || '87'} <span className="text-xs font-normal text-surface-muted">kg</span>
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-1 transition-all duration-300 hover:border-brand-300">
          <span className="text-[11px] font-medium text-surface-muted">Height</span>
          {isEditing ? (
            <input
              type="number"
              value={editHeight}
              onChange={(e) => setEditHeight(e.target.value)}
              className="w-full bg-white border border-brand-300 rounded-lg px-2 py-1 text-sm font-bold text-brand-800"
            />
          ) : (
            <div className="text-lg font-extrabold text-brand-800">
              {userProfile.heightCm || '178'} <span className="text-xs font-normal text-surface-muted">cm</span>
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-surface-muted">Activity Level</span>
          <div className="text-xs font-semibold text-brand-800 truncate">
            {userProfile.activityLevel ? ACTIVITY_LABELS[userProfile.activityLevel]?.split('(')[0] : 'Moderately Active'}
          </div>
        </Card>

        <Card className="p-4 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-surface-muted">Dietary Style</span>
          <div className="text-xs font-semibold text-brand-800 truncate">
            {userProfile.dietType ? DIET_LABELS[userProfile.dietType as keyof typeof DIET_LABELS]?.split('(')[0] || userProfile.dietType : 'Vegetarian'}
          </div>
        </Card>
      </div>

      {isEditing && (
        <Button variant="primary" size="sm" onClick={handleSaveEdit} icon={<Check className="w-4 h-4" />} className="w-full">
          Save Baseline Updates
        </Button>
      )}

      {/* Target Daily Caloric & Macro Breakdown */}
      <Card className="p-5 space-y-4 border-surface-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-surface-muted font-mono">
              <Sparkles className="w-3 h-3 text-brand-600" /> Derived Target
            </div>
            <div className="text-3xl font-extrabold text-brand-700 tracking-tight mt-0.5">
              {userProfile.dailyCalories} <span className="text-base font-medium text-surface-muted">kcal/day</span>
            </div>
          </div>
          <Badge variant="emerald" size="md">CALCULATED TARGET</Badge>
        </div>

        {/* Visual Macro Progress Bars */}
        <div className="space-y-3 pt-2">
          {/* Protein */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-brand-800">Protein Target</span>
              <span className="text-brand-700 font-bold">{userProfile.proteinGrams}g</span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-subtle overflow-hidden">
              <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-brand-800">Carbohydrates</span>
              <span className="text-sky-700 font-bold">{userProfile.carbsGrams}g</span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-subtle overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Fat */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-brand-800">Dietary Fats</span>
              <span className="text-amber-700 font-bold">{userProfile.fatGrams}g</span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-subtle overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Allergies / Disliked Foods */}
      <div className="p-4 rounded-xl bg-white border border-surface-border space-y-2 text-xs shadow-card-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-800">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Allergies: <strong>{userProfile.allergies?.length ? userProfile.allergies.join(', ') : 'None specified'}</strong></span>
          </div>
        </div>
        {userProfile.dislikedFoods && userProfile.dislikedFoods.length > 0 && (
          <div className="text-surface-muted pl-6">
            Disliked Foods: <span className="text-brand-800 font-medium">{userProfile.dislikedFoods.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Subtle Nutrition Disclaimer */}
      <div className="px-2 text-center">
        <p className="text-[11px] text-surface-muted italic">
          Nutrition estimates are for planning purposes and are not medical advice.
        </p>
      </div>
    </div>
  );
};
