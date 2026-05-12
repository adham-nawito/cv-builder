import { useCV } from '@/contexts/CVContext';
import { useI18n } from '../../lib/I18nContext';
import { useEffect, useState } from 'react';
import {
  Command, CommandDialog, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import {
  Plus, Layout, Eye, EyeOff, Undo2, Redo2, Download,
  User, AlignLeft, Briefcase, GraduationCap, Wrench,
  FolderOpen, Award, Globe, SquarePlus, Minus,
} from 'lucide-react';
import type { SectionType, TemplateType } from '@/types/cv';

const SECTION_ICONS: Record<SectionType, typeof User> = {
  'personal-info':  User,
  'summary':        AlignLeft,
  'experience':     Briefcase,
  'education':      GraduationCap,
  'skills':         Wrench,
  'projects':       FolderOpen,
  'certifications': Award,
  'languages':      Globe,
  'custom':         SquarePlus,
  'spacer':         Minus,
};

const SECTION_LABEL_KEYS: Record<SectionType, string> = {
  'personal-info':  'section.personalInfo',
  'summary':        'section.summary',
  'experience':     'section.experience',
  'education':      'section.education',
  'skills':         'section.skills',
  'projects':       'section.projects',
  'certifications': 'section.certifications',
  'languages':      'section.languages',
  'custom':         'section.custom',
  'spacer':         'section.spacer',
};

const TEMPLATES: { key: TemplateType; label: string }[] = [
  { key: 'classic',   label: 'Classic'   },
  { key: 'modern',    label: 'Modern'    },
  { key: 'minimal',   label: 'Minimal'   },
  { key: 'executive', label: 'Executive' },
  { key: 'creative',  label: 'Creative'  },
];

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onExportPDF: () => void;
}

export function CommandPalette({ open, onClose, onExportPDF }: Props) {
  const { state, dispatch, addSection, selectSection } = useCV();
  const { t } = useI18n();

  const runAndClose = (fn: () => void) => {
    fn();
    onClose();
  };

  return (
    <CommandDialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <Command>
        <CommandInput placeholder={t('cmd.placeholder')} />
        <CommandList>
          <CommandEmpty>{t('cmd.empty')}</CommandEmpty>

          <CommandGroup heading={t('cmd.jumpTo')}>
            {state.cv.sections.map(section => {
              const Icon = SECTION_ICONS[section.type] ?? SquarePlus;
              return (
                <CommandItem
                  key={section.id}
                  onSelect={() => runAndClose(() => selectSection(section.id))}
                >
                  <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
                  {section.title}
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={t('cmd.addSection')}>
            {(Object.keys(SECTION_ICONS) as SectionType[]).map(type => {
              const Icon = SECTION_ICONS[type];
              return (
                <CommandItem
                  key={type}
                  onSelect={() => runAndClose(() => addSection(type, t(SECTION_LABEL_KEYS[type])))}
                >
                  <Icon className="w-4 h-4 mr-2 text-primary" />
                  {t('cmd.add')} {t(SECTION_LABEL_KEYS[type])}
                  <span className="ml-auto">
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={t('cmd.templates')}>
            {TEMPLATES.map(tpl => (
              <CommandItem
                key={tpl.key}
                onSelect={() => runAndClose(() => dispatch({ type: 'SET_TEMPLATE', payload: tpl.key }))}
              >
                <Layout className="w-4 h-4 mr-2 text-muted-foreground" />
                {tpl.label}
                {state.cv.template === tpl.key && (
                  <span className="ml-auto text-xs text-primary font-medium">{t('cmd.active')}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={t('cmd.actions')}>
            <CommandItem onSelect={() => runAndClose(() => dispatch({ type: 'TOGGLE_PREVIEW' }))}>
              {state.isPreviewMode
                ? <><EyeOff className="w-4 h-4 mr-2" /> {t('cmd.exitPreview')}</>
                : <><Eye    className="w-4 h-4 mr-2" /> {t('cmd.previewCV')}</>
              }
            </CommandItem>
            <CommandItem onSelect={() => runAndClose(() => dispatch({ type: 'UNDO' }))}>
              <Undo2 className="w-4 h-4 mr-2" /> {t('cmd.undo')}
              <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
            </CommandItem>
            <CommandItem onSelect={() => runAndClose(() => dispatch({ type: 'REDO' }))}>
              <Redo2 className="w-4 h-4 mr-2" /> {t('cmd.redo')}
              <span className="ml-auto text-xs text-muted-foreground">⌘⇧Z</span>
            </CommandItem>
            <CommandItem onSelect={() => runAndClose(onExportPDF)}>
              <Download className="w-4 h-4 mr-2" /> {t('cmd.exportPdf')}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    globalThis.addEventListener('keydown', handler);
    return () => globalThis.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen };
}
