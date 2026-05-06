import { useState, useEffect } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useCVStore } from '@/store'
import { v4 as uuidv4 } from 'uuid'
import type { Section, SectionType } from '@/schemas/cv'
import {
  Undo2, Redo2, Briefcase, GraduationCap, Wrench,
  FolderOpen, Award, Languages, LayoutList, Minus,
} from 'lucide-react'

const ADD_SECTIONS: { type: SectionType; label: string; icon: React.ElementType }[] = [
  { type: 'experience', label: 'Add Experience section', icon: Briefcase },
  { type: 'education', label: 'Add Education section', icon: GraduationCap },
  { type: 'skills', label: 'Add Skills section', icon: Wrench },
  { type: 'projects', label: 'Add Projects section', icon: FolderOpen },
  { type: 'certifications', label: 'Add Certifications section', icon: Award },
  { type: 'languages', label: 'Add Languages section', icon: Languages },
  { type: 'custom', label: 'Add Custom section', icon: LayoutList },
  { type: 'spacer', label: 'Add Spacer', icon: Minus },
]

function makeSection(type: SectionType): Section {
  const base = { id: uuidv4(), title: type === 'spacer' ? '' : type.charAt(0).toUpperCase() + type.slice(1), visible: true, locked: false, blocks: [] }
  if (type === 'spacer') return { ...base, type, height: 24 }
  return { ...base, type } as Section
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const sections = useCVStore((s) => s.cv.sections)
  const addSection = useCVStore((s) => s.addSection)
  const selectSection = useCVStore((s) => s.selectSection)
  const undo = useCVStore((s) => s.undo)
  const redo = useCVStore((s) => s.redo)
  const canUndo = useCVStore((s) => s.canUndo)
  const canRedo = useCVStore((s) => s.canRedo)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    globalThis.addEventListener('keydown', handler)
    return () => globalThis.removeEventListener('keydown', handler)
  }, [])

  function run(fn: () => void) {
    fn()
    setOpen(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search actions and sections…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem disabled={!canUndo} onSelect={() => run(undo)}>
            <Undo2 className="me-2 size-4" />
            Undo
          </CommandItem>
          <CommandItem disabled={!canRedo} onSelect={() => run(redo)}>
            <Redo2 className="me-2 size-4" />
            Redo
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Add section">
          {ADD_SECTIONS.map(({ type, label, icon: Icon }) => (
            <CommandItem
              key={type}
              onSelect={() => run(() => {
                const s = makeSection(type)
                addSection(s)
                selectSection(s.id)
              })}
            >
              <Icon className="me-2 size-4" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>

        {sections.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Jump to section">
              {sections.map((s) => (
                <CommandItem key={s.id} onSelect={() => run(() => selectSection(s.id))}>
                  {s.title || s.type}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
