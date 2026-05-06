import { useCV } from '@/contexts/CVContext';
import type { SectionType } from '@/types/cv';
import {
  User, AlignLeft, Briefcase, GraduationCap, Wrench, FolderOpen,
  Award, Globe, SquarePlus, Minus,
} from 'lucide-react';

const PALETTE_ITEMS: { type: SectionType; icon: typeof User; label: string }[] = [
  { type: 'personal-info', icon: User,           label: 'Personal Info' },
  { type: 'summary',       icon: AlignLeft,       label: 'Summary' },
  { type: 'experience',    icon: Briefcase,       label: 'Experience' },
  { type: 'education',     icon: GraduationCap,   label: 'Education' },
  { type: 'skills',        icon: Wrench,          label: 'Skills' },
  { type: 'projects',      icon: FolderOpen,      label: 'Projects' },
  { type: 'certifications',icon: Award,           label: 'Certifications' },
  { type: 'languages',     icon: Globe,           label: 'Languages' },
  { type: 'custom',        icon: SquarePlus,      label: 'Custom Section' },
  { type: 'spacer',        icon: Minus,           label: 'Spacer' },
];

export function ComponentPalette() {
  const { addSection } = useCV();

  return (
    <div className="w-60 border-r border-border bg-card flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Components</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {PALETTE_ITEMS.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => addSection(type)}
            className="palette-item w-full"
            aria-label={`Add ${label} section`}
          >
            <Icon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="p-3 border-t border-border">
        <div className="bg-accent/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-accent-foreground">ATS Tip:</strong> Keep your CV single-column with standard section headings for best compatibility.
          </p>
        </div>
      </div>
    </div>
  );
}
