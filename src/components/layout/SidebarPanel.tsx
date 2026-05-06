import { useTranslation } from 'react-i18next'
import { useCVStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  User, Briefcase, GraduationCap, Wrench, FolderOpen,
  Award, Languages, LayoutList, Plus,
} from 'lucide-react'
import type { SectionType } from '@/schemas/cv'

const SECTION_ICONS: Record<SectionType, React.ElementType> = {
  personalInfo: User,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderOpen,
  certifications: Award,
  languages: Languages,
  custom: LayoutList,
  spacer: LayoutList,
}

export function SidebarPanel() {
  const { t } = useTranslation()
  const sections = useCVStore((s) => s.cv.sections)
  const selectedId = useCVStore((s) => s.selectedSectionId)
  const selectSection = useCVStore((s) => s.selectSection)

  return (
    <aside className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('sidebar.sections')}
        </span>
        <Button variant="ghost" size="icon" className="size-6">
          <Plus className="size-3.5" />
        </Button>
      </div>
      <Separator />
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5" role="list">
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section.type] ?? LayoutList
            return (
              <li key={section.id}>
                <button
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent',
                    selectedId === section.id && 'bg-accent font-medium'
                  )}
                  onClick={() => selectSection(section.id)}
                >
                  <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{section.title}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
