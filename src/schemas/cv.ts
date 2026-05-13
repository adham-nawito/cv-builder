import { z } from 'zod';

// ---------------------------------------------------------------------------
// Primitive schemas
// ---------------------------------------------------------------------------

const idSchema = z.string().min(1);

// ---------------------------------------------------------------------------
// Section content schemas
// ---------------------------------------------------------------------------

export const PersonalInfoContentSchema = z.object({
  fullName: z.string(),
  jobTitle: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
});

export const SummaryContentSchema = z.object({
  text: z.string(),
});

export const ExperienceItemSchema = z.object({
  id: idSchema,
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()),
});

export const ExperienceContentSchema = z.object({
  items: z.array(ExperienceItemSchema),
});

export const EducationItemSchema = z.object({
  id: idSchema,
  institution: z.string(),
  degree: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  details: z.string().optional(),
});

export const EducationContentSchema = z.object({
  items: z.array(EducationItemSchema),
});

export const SkillsCategorySchema = z.object({
  id: idSchema,
  name: z.string(),
  skills: z.array(z.string()),
});

export const SkillsContentSchema = z.object({
  categories: z.array(SkillsCategorySchema),
});

export const ProjectItemSchema = z.object({
  id: idSchema,
  name: z.string(),
  description: z.string(),
  technologies: z.string(),
  link: z.string().optional(),
});

export const ProjectsContentSchema = z.object({
  items: z.array(ProjectItemSchema),
});

export const CertificationItemSchema = z.object({
  id: idSchema,
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
});

export const CertificationsContentSchema = z.object({
  items: z.array(CertificationItemSchema),
});

export const LanguageItemSchema = z.object({
  id: idSchema,
  language: z.string(),
  proficiency: z.string(),
});

export const LanguagesContentSchema = z.object({
  items: z.array(LanguageItemSchema),
});

export const CustomContentSchema = z.object({
  html: z.string(),
});

export const SpacerContentSchema = z.object({
  height: z.number(),
});

// ---------------------------------------------------------------------------
// Section schema (discriminated union on type)
// ---------------------------------------------------------------------------

const CVSectionStyleSchema = z.object({
  fontSize: z.number().optional(),
  spacing: z.number().optional(),
});

const baseSectionFields = {
  id: idSchema,
  title: z.string(),
  locked: z.boolean().optional(),
  hidden: z.boolean().optional(),
  style: CVSectionStyleSchema.optional(),
};

export const CVSectionSchema = z.discriminatedUnion('type', [
  z.object({ ...baseSectionFields, type: z.literal('personal-info'), content: PersonalInfoContentSchema }),
  z.object({ ...baseSectionFields, type: z.literal('summary'),        content: SummaryContentSchema }),
  z.object({ ...baseSectionFields, type: z.literal('experience'),     content: ExperienceContentSchema }),
  z.object({ ...baseSectionFields, type: z.literal('education'),      content: EducationContentSchema }),
  z.object({ ...baseSectionFields, type: z.literal('skills'),         content: SkillsContentSchema }),
  z.object({ ...baseSectionFields, type: z.literal('projects'),       content: ProjectsContentSchema }),
  z.object({ ...baseSectionFields, type: z.literal('certifications'), content: CertificationsContentSchema }),
  z.object({ ...baseSectionFields, type: z.literal('languages'),      content: LanguagesContentSchema }),
  z.object({ ...baseSectionFields, type: z.literal('custom'),         content: CustomContentSchema }),
  z.object({ ...baseSectionFields, type: z.literal('spacer'),         content: SpacerContentSchema }),
]);

// ---------------------------------------------------------------------------
// CVData schema
// ---------------------------------------------------------------------------

export const TemplateTypeSchema = z.enum(['classic', 'modern', 'minimal', 'executive', 'creative']);

export const CVDataSchema = z.object({
  id: idSchema,
  name: z.string(),
  version: z.string().optional(),
  template: TemplateTypeSchema,
  sections: z.array(CVSectionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CVDataSchemaType = z.infer<typeof CVDataSchema>;

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

export function validateCVData(raw: unknown): { success: true; data: CVDataSchemaType } | { success: false; error: string } {
  const result = CVDataSchema.safeParse(raw);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') };
}
