import { useCV } from '@/contexts/CVContext';
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

  const runAndClose = (fn: () => void) => {
    fn();
    onClose();
  };

  return (
    <CommandDialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <Command>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Sections — Jump to">
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

          <CommandGroup heading="Add Section">
            {(Object.keys(SECTION_ICONS) as SectionType[]).map(type => {
              const Icon = SECTION_ICONS[type];
              return (
                <CommandItem
                  key={type}
                  onSelect={() => runAndClose(() => addSection(type))}
                >
                  <Icon className="w-4 h-4 mr-2 text-primary" />
                  Add {type.replace('-', ' ')}
                  <span className="ml-auto">
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Templates">
            {TEMPLATES.map(tpl => (
              <CommandItem
                key={tpl.key}
                onSelect={() => runAndClose(() => dispatch({ type: 'SET_TEMPLATE', payload: tpl.key }))}
              >
                <Layout className="w-4 h-4 mr-2 text-muted-foreground" />
                {tpl.label}
                {state.cv.template === tpl.key && (
                  <span className="ml-auto text-xs text-primary font-medium">active</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runAndClose(() => dispatch({ type: 'TOGGLE_PREVIEW' }))}>
              {state.isPreviewMode
                ? <><EyeOff className="w-4 h-4 mr-2" /> Exit Preview</>
                : <><Eye className="w-4 h-4 mr-2" /> Preview CV</>
              }
            </CommandItem>
            <CommandItem onSelect={() => runAndClose(() => dispatch({ type: 'UNDO' }))}>
              <Undo2 className="w-4 h-4 mr-2" /> Undo
              <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
            </CommandItem>
            <CommandItem onSelect={() => runAndClose(() => dispatch({ type: 'REDO' }))}>
              <Redo2 className="w-4 h-4 mr-2" /> Redo
              <span className="ml-auto text-xs text-muted-foreground">⌘⇧Z</span>
            </CommandItem>
            <CommandItem onSelect={() => runAndClose(onExportPDF)}>
              <Download className="w-4 h-4 mr-2" /> Export PDF
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
