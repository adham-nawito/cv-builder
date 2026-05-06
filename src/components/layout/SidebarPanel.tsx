import { useTranslation } from 'react-i18next'
import { useCVStore } from '@/store'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'
import {
  User, Briefcase, GraduationCap, Wrench, FolderOpen,
  Award, Languages, LayoutList, Plus, Minus,
} from 'lucide-react'
import type { Section, SectionType } from '@/schemas/cv'

const SECTION_ICONS: Record<SectionType, React.ElementType> = {
  personalInfo: User,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderOpen,
  certifications: Award,
  languages: Languages,
  custom: LayoutList,
  spacer: Minus,
}

const SECTION_LABELS: Record<SectionType, string> = {
  personalInfo: 'Personal Info',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  custom: 'Custom',
  spacer: 'Spacer',
}

function createSection(type: SectionType): Section {
  const base = { id: uuidv4(), title: SECTION_LABELS[type], visible: true, locked: false, blocks: [] }
  if (type === 'personalInfo') return { ...base, type, name: '', email: '', phone: '', location: '', website: '', linkedin: '' }
  if (type === 'spacer') return { ...base, type, title: '', height: 24 }
  return { ...base, type } as Section
}

const PALETTE_TYPES: SectionType[] = [
  'experience', 'education', 'skills', 'projects',
  'certifications', 'languages', 'custom', 'spacer',
]

export function SidebarPanel() {
  const { t } = useTranslation()
  const sections = useCVStore((s) => s.cv.sections)
  const selectedId = useCVStore((s) => s.selectedSectionId)
  const selectSection = useCVStore((s) => s.selectSection)
  const addSection = useCVStore((s) => s.addSection)

  return (
    <aside className="flex h-full flex-col overflow-hidden">
      {/* Current sections list */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('sidebar.sections')}
        </span>
      </div>
      <Separator />
      <nav className="flex-1 overflow-y-auto p-2" aria-label="CV sections">
        <ul className="space-y-0.5">
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section.type] ?? LayoutList
            return (
              <li key={section.id}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent',
                    selectedId === section.id && 'bg-accent font-medium',
                    !section.visible && 'opacity-50',
                  )}
                  onClick={() => selectSection(section.id)}
                  aria-current={selectedId === section.id ? 'true' : undefined}
                >
                  <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate">{section.title || SECTION_LABELS[section.type]}</span>
                  {section.locked && <span className="ms-auto text-[10px] text-muted-foreground">🔒</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Add section palette */}
      <Separator />
      <div className="p-2">
        <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('sidebar.addSection')}
        </p>
        <ul className="grid grid-cols-2 gap-1">
          {PALETTE_TYPES.map((type) => {
            const Icon = SECTION_ICONS[type]
            return (
              <li key={type}>
                <button
                  type="button"
                  className="flex w-full items-center gap-1.5 rounded-md border border-dashed px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    const section = createSection(type)
                    addSection(section)
                    selectSection(section.id)
                  }}
                  aria-label={`Add ${SECTION_LABELS[type]} section`}
                >
                  <Icon className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{SECTION_LABELS[type]}</span>
                  <Plus className="ms-auto size-3 shrink-0 opacity-60" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
