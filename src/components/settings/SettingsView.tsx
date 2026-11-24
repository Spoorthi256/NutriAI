import React, { useState } from 'react';
import { useNutri } from '../../context/NutriContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { GoalType, ActivityLevel, DietaryType } from '../../types';
import {
  Settings,
  User,
  Database,
  Check,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { userProfile, updateProfile, sendMessage } = useNutri();
  const [name, setName] = useState(userProfile.name);
  const [goal, setGoal] = useState<GoalType>(userProfile.goal || 'muscle_gain');
  const [weight, setWeight] = useState((userProfile.weightKg ?? 87).toString());
  const [height, setHeight] = useState((userProfile.heightCm ?? 178).toString());
  const [activity, setActivity] = useState<ActivityLevel>(userProfile.activityLevel || 'moderate');
  const [diet, setDiet] = useState<DietaryType>(userProfile.dietType || 'vegetarian');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      goal,
      weightKg: parseFloat(weight) || 87,
      heightCm: parseFloat(height) || 178,
      activityLevel: activity,
      dietType: diet,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    sendMessage(`I updated my settings: Goal -> ${goal}, Weight -> ${weight}kg, Diet -> ${diet}.`);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 overflow-y-auto h-full max-w-4xl mx-auto bg-surface-bg">
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-600" /> Account & Nutrition Settings
          </h1>
          <p className="text-xs text-surface-muted mt-1">
            Manage your physical baseline, dietary preferences, and backend API connection parameters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details */}
        <Card className="p-6 space-y-4 bg-white border-surface-border shadow-card-subtle">
          <h3 className="text-xs font-bold text-surface-muted uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" /> Personal Baseline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-brand-800 font-medium">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-surface-border rounded-xl px-3 py-2.5 text-brand-800 font-medium focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-brand-800 font-medium">Health Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as GoalType)}
                className="w-full bg-white border border-surface-border rounded-xl px-3 py-2.5 text-brand-800 font-medium focus:border-brand-500 focus:outline-none"
              >
                <option value="muscle_gain">Build Muscle (Hypertrophy)</option>
                <option value="weight_loss">Lose Weight (Caloric Deficit)</option>
                <option value="weight_gain">Gain Weight (Mass Surplus)</option>
                <option value="maintenance">Maintain & Optimize</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-brand-800 font-medium">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-white border border-surface-border rounded-xl px-3 py-2.5 text-brand-800 font-medium focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-brand-800 font-medium">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-white border border-surface-border rounded-xl px-3 py-2.5 text-brand-800 font-medium focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-brand-800 font-medium">Activity Level</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                className="w-full bg-white border border-surface-border rounded-xl px-3 py-2.5 text-brand-800 font-medium focus:border-brand-500 focus:outline-none"
              >
                <option value="sedentary">Sedentary (Desk Job)</option>
                <option value="light">Lightly Active (1-2 days/wk)</option>
                <option value="moderate">Moderately Active (3-5 days/wk)</option>
                <option value="very_active">Very Active (6-7 days/wk)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-brand-800 font-medium">Dietary Preference</label>
              <select
                value={diet}
                onChange={(e) => setDiet(e.target.value as DietaryType)}
                className="w-full bg-white border border-surface-border rounded-xl px-3 py-2.5 text-brand-800 font-medium focus:border-brand-500 focus:outline-none"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="non_vegetarian">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="mediterranean">Mediterranean</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Django REST Backend Readiness */}
        <Card className="p-6 space-y-3 bg-white border-brand-200 shadow-card-subtle">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-surface-muted uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-600" /> Django REST Backend Readiness
            </h3>
            <Badge variant="emerald" size="sm">READY FOR API</Badge>
          </div>

          <p className="text-xs text-surface-muted">
            Frontend architecture is structured for seamless plug-and-play integration with Django REST framework backend endpoints.
          </p>

          <div className="font-mono text-xs bg-surface-subtle p-3 rounded-xl border border-surface-border text-brand-800 space-y-1">
            <div>API_BASE_URL: <span className="text-brand-700 font-bold">http://localhost:8000/api/v1</span></div>
            <div>STATUS: <span className="text-brand-700 font-bold">Phase 2 Onboarding Engine Active</span></div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-xs text-brand-700 font-bold flex items-center gap-1"><Check className="w-4 h-4 text-brand-600" /> Settings Saved!</span>}
          <Button type="submit" variant="primary" size="md">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
