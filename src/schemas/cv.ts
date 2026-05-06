import { z } from 'zod'

export const SCHEMA_VERSION = 1

// ── Block content types ──────────────────────────────────────────────────────

const TextBlockSchema = z.object({
  id: z.uuid(),
  type: z.literal('text'),
  value: z.string(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
})

const ListBlockSchema = z.object({
  id: z.uuid(),
  type: z.literal('list'),
  items: z.array(z.string()),
})

const DateRangeBlockSchema = z.object({
  id: z.uuid(),
  type: z.literal('dateRange'),
  start: z.string().optional(),
  end: z.string().optional(),
  present: z.boolean().optional(),
})

const BlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  ListBlockSchema,
  DateRangeBlockSchema,
])

// ── Section types ────────────────────────────────────────────────────────────

const BaseSectionSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  blocks: z.array(BlockSchema),
})

export const PersonalInfoSectionSchema = BaseSectionSchema.extend({
  type: z.literal('personalInfo'),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
})

export const ExperienceSectionSchema = BaseSectionSchema.extend({
  type: z.literal('experience'),
})

export const EducationSectionSchema = BaseSectionSchema.extend({
  type: z.literal('education'),
})

export const SkillsSectionSchema = BaseSectionSchema.extend({
  type: z.literal('skills'),
})

export const ProjectsSectionSchema = BaseSectionSchema.extend({
  type: z.literal('projects'),
})

export const CertificationsSectionSchema = BaseSectionSchema.extend({
  type: z.literal('certifications'),
})

export const LanguagesSectionSchema = BaseSectionSchema.extend({
  type: z.literal('languages'),
})

export const CustomSectionSchema = BaseSectionSchema.extend({
  type: z.literal('custom'),
})

export const SpacerSectionSchema = z.object({
  id: z.uuid(),
  type: z.literal('spacer'),
  title: z.string().default(''),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  blocks: z.array(BlockSchema).default([]),
  height: z.number().min(4).max(120).default(24),
})

export const SectionSchema = z.discriminatedUnion('type', [
  PersonalInfoSectionSchema,
  ExperienceSectionSchema,
  EducationSectionSchema,
  SkillsSectionSchema,
  ProjectsSectionSchema,
  CertificationsSectionSchema,
  LanguagesSectionSchema,
  CustomSectionSchema,
  SpacerSectionSchema,
])

// ── CV document ──────────────────────────────────────────────────────────────

export const CVSchema = z.object({
  version: z.number().default(SCHEMA_VERSION),
  id: z.uuid(),
  name: z.string().default('Untitled CV'),
  template: z.enum(['minimal', 'modern', 'compact']).default('minimal'),
  sections: z.array(SectionSchema),
  updatedAt: z.iso.datetime().optional(),
  createdAt: z.iso.datetime(),
})

export type PersonalInfoSection = z.infer<typeof PersonalInfoSectionSchema>
export type ExperienceSection = z.infer<typeof ExperienceSectionSchema>
export type EducationSection = z.infer<typeof EducationSectionSchema>
export type SkillsSection = z.infer<typeof SkillsSectionSchema>
export type ProjectsSection = z.infer<typeof ProjectsSectionSchema>
export type CertificationsSection = z.infer<typeof CertificationsSectionSchema>
export type LanguagesSection = z.infer<typeof LanguagesSectionSchema>
export type CustomSection = z.infer<typeof CustomSectionSchema>
export type SpacerSection = z.infer<typeof SpacerSectionSchema>

export type Block = z.infer<typeof BlockSchema>
export type TextBlock = z.infer<typeof TextBlockSchema>
export type ListBlock = z.infer<typeof ListBlockSchema>
export type DateRangeBlock = z.infer<typeof DateRangeBlockSchema>
export type Section = z.infer<typeof SectionSchema>
export type CV = z.infer<typeof CVSchema>
export type SectionType = Section['type']
export type Template = CV['template']

// ── Schema migration skeleton ────────────────────────────────────────────────

export function migrateSchema(data: Record<string, unknown>): CV {
  const version = (data.version as number) ?? 0
  if (version === SCHEMA_VERSION) {
    return CVSchema.parse(data)
  }
  // Future: add version-specific migrations here before parsing
  return CVSchema.parse({ ...data, version: SCHEMA_VERSION })
}
