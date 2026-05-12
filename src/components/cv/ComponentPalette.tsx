import { useCV } from '@/contexts/CVContext';
import { useI18n } from '../../lib/I18nContext';
import type { SectionType } from '@/types/cv';
import {
  User, AlignLeft, Briefcase, GraduationCap, Wrench, FolderOpen,
  Award, Globe, SquarePlus, Minus,
} from 'lucide-react';

const PALETTE_ITEMS: { type: SectionType; icon: typeof User; labelKey: string }[] = [
  { type: 'personal-info',  icon: User,          labelKey: 'section.personalInfo'   },
  { type: 'summary',        icon: AlignLeft,      labelKey: 'section.summary'        },
  { type: 'experience',     icon: Briefcase,      labelKey: 'section.experience'     },
  { type: 'education',      icon: GraduationCap,  labelKey: 'section.education'      },
  { type: 'skills',         icon: Wrench,         labelKey: 'section.skills'         },
  { type: 'projects',       icon: FolderOpen,     labelKey: 'section.projects'       },
  { type: 'certifications', icon: Award,          labelKey: 'section.certifications' },
  { type: 'languages',      icon: Globe,          labelKey: 'section.languages'      },
  { type: 'custom',         icon: SquarePlus,     labelKey: 'section.custom'         },
  { type: 'spacer',         icon: Minus,          labelKey: 'section.spacer'         },
];

export function ComponentPalette() {
  const { addSection } = useCV();
  const { t } = useI18n();

  return (
    <div className="w-60 border-e border-border bg-card flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('palette.title')}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {PALETTE_ITEMS.map(({ type, icon: Icon, labelKey }) => {
          const label = t(labelKey);
          return (
            <button
              key={type}
              onClick={() => addSection(type, label)}
              className="palette-item w-full"
              aria-label={label}
            >
              <Icon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <div className="p-3 border-t border-border">
        <div className="bg-accent/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">{t('palette.atsTip')}</p>
        </div>
      </div>
    </div>
  );
}
