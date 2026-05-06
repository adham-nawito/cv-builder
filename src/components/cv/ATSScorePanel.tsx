import { useCV } from '@/contexts/CVContext';
import { calculateATSScore, type ATSScore, type ATSTip } from '../../utils/atsScore';
import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp, Target, TrendingUp } from 'lucide-react';
import { useI18n } from '../../lib/I18nContext';

const categoryIcons: Record<ATSTip['category'], typeof AlertTriangle> = {
  critical: AlertTriangle,
  warning: Info,
  suggestion: CheckCircle2,
};

const categoryColors: Record<ATSTip['category'], string> = {
  critical: 'text-destructive',
  warning: 'text-warning',
  suggestion: 'text-muted-foreground',
};

function GradeRing({ percentage, grade }: { percentage: number; grade: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage >= 85 ? 'hsl(var(--success))' : percentage >= 55 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{grade}</span>
        <span className="text-xs text-muted-foreground">{percentage}%</span>
      </div>
    </div>
  );
}

export function ATSScorePanel() {
  const { state } = useCV();
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(true);
  const [showAllTips, setShowAllTips] = useState(false);

  const score: ATSScore = useMemo(() => calculateATSScore(state.cv), [state.cv]);
  const visibleTips = showAllTips ? score.tips : score.tips.slice(0, 4);

  return (
    <div className="border-t border-border bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{t('ats.title')}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            score.percentage >= 85 ? 'bg-success/20 text-success' :
            score.percentage >= 55 ? 'bg-warning/20 text-warning' :
            'bg-destructive/20 text-destructive'
          }`}>{score.percentage}%</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <GradeRing percentage={score.percentage} grade={score.grade} />

          {/* Breakdown bars */}
          <div className="space-y-2">
            {score.breakdown.map(b => (
              <div key={b.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{b.category}</span>
                  <span className="font-medium">{b.score}/{b.max}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(b.score / b.max) * 100}%`,
                      background: b.score / b.max >= 0.8 ? 'hsl(var(--success))' :
                        b.score / b.max >= 0.5 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          {visibleTips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <TrendingUp className="w-3 h-3" /> {t('ats.tips')}
              </div>
              {visibleTips.map(tip => {
                const Icon = categoryIcons[tip.category];
                return (
                  <div key={tip.id} className="flex items-start gap-2 text-xs p-2 rounded-md bg-muted/50">
                    <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${categoryColors[tip.category]}`} />
                    <span>{tip.message}</span>
                  </div>
                );
              })}
              {score.tips.length > 4 && (
                <button onClick={() => setShowAllTips(!showAllTips)}
                  className="text-xs text-primary hover:underline">
                  {showAllTips ? t('ats.showLess') : `${t('ats.showMore')} (${score.tips.length - 4})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
