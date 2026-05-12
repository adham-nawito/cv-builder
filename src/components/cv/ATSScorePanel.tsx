import { useCV } from '@/contexts/CVContext';
import type { ATSTip } from '../../utils/atsScore';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, ChevronDown, ChevronUp, Target, TrendingUp, Plus } from 'lucide-react';
import { useI18n } from '../../lib/I18nContext';
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';
import type { SectionType } from '@/types/cv';

const SECTION_TITLE_KEYS: Partial<Record<SectionType, string>> = {
  'summary':       'section.summary',
  'skills':        'section.skills',
  'experience':    'section.experience',
  'education':     'section.education',
  'personal-info': 'section.personalInfo',
};

const categoryIcons: Record<ATSTip['category'], typeof AlertTriangle> = {
  critical:   AlertTriangle,
  warning:    Info,
  suggestion: CheckCircle2,
};

const categoryColors: Record<ATSTip['category'], string> = {
  critical:   'text-destructive',
  warning:    'text-warning',
  suggestion: 'text-muted-foreground',
};

const RADIAL_BAR_BG = { fill: 'hsl(var(--border))' };

function badgeColorClass(pct: number): string {
  if (pct >= 85) return 'bg-success/20 text-success';
  if (pct >= 55) return 'bg-warning/20 text-warning';
  return 'bg-destructive/20 text-destructive';
}

function barColor(ratio: number): string {
  if (ratio >= 0.8) return 'hsl(var(--success))';
  if (ratio >= 0.5) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
}

// One-click suggestion: maps a tip message prefix → section type to add
const QUICK_ADD: { match: string; sectionType: SectionType; label: string }[] = [
  { match: 'Add a Professional Summary', sectionType: 'summary',        label: 'Add Summary' },
  { match: 'Add a Skills section',       sectionType: 'skills',         label: 'Add Skills' },
  { match: 'Add an Experience section',  sectionType: 'experience',     label: 'Add Experience' },
  { match: 'Add an Education section',   sectionType: 'education',      label: 'Add Education' },
  { match: 'Add a Personal Info',        sectionType: 'personal-info',  label: 'Add Personal Info' },
];

function scoreColor(pct: number) {
  if (pct >= 75) return 'hsl(var(--success))';
  if (pct >= 50) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
}

function ScoreGauge({ percentage, grade }: { readonly percentage: number; readonly grade: string }) {
  const data = [{ value: percentage, fill: scoreColor(percentage) }];
  return (
    <div className="relative w-28 h-28 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          data={data}
          barSize={10}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={RADIAL_BAR_BG}
            dataKey="value"
            angleAxisId={0}
            cornerRadius={5}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold leading-none">{grade}</span>
        <span className="text-xs text-muted-foreground">{percentage}%</span>
      </div>
    </div>
  );
}

export function ATSScorePanel() {
  const { addSection, atsScore: score } = useCV();
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(true);
  const [showAllTips, setShowAllTips] = useState(false);

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
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColorClass(score.percentage)}`}>
            {score.percentage}%
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <ScoreGauge percentage={score.percentage} grade={score.grade} />

          {/* Breakdown bars */}
          <div className="space-y-2">
            {score.breakdown.map(b => {
              const ratio = b.score / b.max;
              return (
                <div key={b.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{b.category}</span>
                    <span className="font-medium">{b.score}/{b.max}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${ratio * 100}%`, background: barColor(ratio) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips + one-click suggestions */}
          {visibleTips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <TrendingUp className="w-3 h-3" /> {t('ats.tips')}
              </div>
              {visibleTips.map(tip => {
                const Icon = categoryIcons[tip.category];
                const quickAdd = QUICK_ADD.find(q => tip.message.startsWith(q.match));
                return (
                  <div key={tip.id} className="text-xs p-2 rounded-md bg-muted/50 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${categoryColors[tip.category]}`} />
                      <span>{tip.message}</span>
                    </div>
                    {quickAdd && (
                      <button
                        onClick={() => addSection(quickAdd.sectionType, t(SECTION_TITLE_KEYS[quickAdd.sectionType] ?? quickAdd.sectionType))}
                        className="flex items-center gap-1 text-primary hover:underline pl-5"
                      >
                        <Plus className="w-3 h-3" /> {quickAdd.label}
                      </button>
                    )}
                  </div>
                );
              })}
              {score.tips.length > 4 && (
                <button
                  onClick={() => setShowAllTips(!showAllTips)}
                  className="text-xs text-primary hover:underline"
                >
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
