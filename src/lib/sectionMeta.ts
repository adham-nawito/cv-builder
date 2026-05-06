import {
  User, Briefcase, GraduationCap, Wrench, FolderOpen,
  Award, Languages, LayoutList, Minus,
} from 'lucide-react'
import type { SectionType } from '@/schemas/cv'

export const SECTION_ICONS: Record<SectionType, React.ElementType> = {
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

export const SECTION_LABELS: Record<SectionType, string> = {
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
