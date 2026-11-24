import React from 'react';
import { useNutri } from '../../context/NutriContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { userProfile } = useNutri();

  return (
    <div className="space-y-6 p-4 sm:p-6 overflow-y-auto h-full max-w-5xl mx-auto bg-surface-bg">
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-600" /> Metabolic & Physical Progress
          </h1>
          <p className="text-xs text-surface-muted mt-1">
            Tracking your trajectory towards target mass and muscle composition.
          </p>
        </div>
        <Badge variant="emerald" size="md">ON TRACK</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2 bg-white border-surface-border">
          <span className="text-xs font-semibold text-surface-muted uppercase">Start Weight</span>
          <div className="text-2xl font-extrabold text-brand-800">87.0 kg</div>
          <span className="text-[11px] text-surface-muted">Baseline recorded 2 weeks ago</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-brand-300 shadow-card-subtle">
          <span className="text-xs font-semibold text-brand-700 uppercase">Target Weight</span>
          <div className="text-2xl font-extrabold text-brand-700">{userProfile.targetWeightKg || 84.0} kg</div>
          <span className="text-[11px] text-surface-muted">Targeting lean body mass</span>
        </Card>

        <Card className="p-5 space-y-2 bg-white border-surface-border">
          <span className="text-xs font-semibold text-sky-700 uppercase">Consistency Score</span>
          <div className="text-2xl font-extrabold text-sky-700">96.8%</div>
          <span className="text-[11px] text-surface-muted">14/14 days macro compliance</span>
        </Card>
      </div>

      <Card className="p-6 space-y-4 bg-white border-surface-border">
        <h3 className="text-xs font-bold text-surface-muted uppercase tracking-wider">Macro Adherence Log</h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-surface-border">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <div>
                <div className="font-bold text-brand-800">Week 1 Adherence (2,450 kcal / day avg)</div>
                <div className="text-surface-muted">130g Protein target met 7/7 days</div>
              </div>
            </div>
            <span className="font-mono font-bold text-brand-700">+1.2 kg Muscle Mass</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-surface-border">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <div>
                <div className="font-bold text-brand-800">Week 2 Adherence (2,450 kcal / day avg)</div>
                <div className="text-surface-muted">Hydration & micro-nutrients synchronized</div>
              </div>
            </div>
            <span className="font-mono font-bold text-brand-700">Optimal Recovery</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
