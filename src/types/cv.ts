export type SectionType =
  | 'personal-info'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'custom'
  | 'spacer';

export interface CVSectionStyle {
  fontSize?: number;   // px, overrides template default
  spacing?: number;    // margin-bottom px
}

export interface CVSection {
  id: string;
  type: SectionType;
  title: string;
  content: SectionContent;
  locked?: boolean;
  hidden?: boolean;
  style?: CVSectionStyle;
}

export interface PersonalInfoContent {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface SummaryContent {
  text: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ExperienceContent {
  items: ExperienceItem[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  details?: string;
}

export interface EducationContent {
  items: EducationItem[];
}

export interface SkillsContent {
  categories: { id: string; name: string; skills: string[] }[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link?: string;
}

export interface ProjectsContent {
  items: ProjectItem[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface CertificationsContent {
  items: CertificationItem[];
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: string;
}

export interface LanguagesContent {
  items: LanguageItem[];
}

export interface CustomContent {
  html: string;
}

export interface SpacerContent {
  height: number;
}

export type SectionContent =
  | PersonalInfoContent
  | SummaryContent
  | ExperienceContent
  | EducationContent
  | SkillsContent
  | ProjectsContent
  | CertificationsContent
  | LanguagesContent
  | CustomContent
  | SpacerContent;

export type TemplateType = 'classic' | 'modern' | 'minimal' | 'executive' | 'creative';

export interface CVData {
  id: string;
  name: string;
  sections: CVSection[];
  template: TemplateType;
  createdAt: string;
  updatedAt: string;
}

export interface CVState {
  cv: CVData;
  selectedSectionId: string | null;
  history: CVData[];
  historyIndex: number;
  isDarkMode: boolean;
  isPreviewMode: boolean;
}

export const SECTION_LABELS: Record<SectionType, string> = {
  'personal-info': 'Personal Info',
  'summary': 'Summary',
  'experience': 'Experience',
  'education': 'Education',
  'skills': 'Skills',
  'projects': 'Projects',
  'certifications': 'Certifications',
  'languages': 'Languages',
  'custom': 'Custom Section',
  'spacer': 'Spacer',
};
