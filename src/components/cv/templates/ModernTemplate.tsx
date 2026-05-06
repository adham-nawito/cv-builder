import type { CV } from '@/schemas/cv'
import { ExperienceRenderer } from '../ExperienceRenderer'
import { EducationRenderer } from '../EducationRenderer'
import { SkillsRenderer } from '../SkillsRenderer'
import { GenericSectionRenderer } from '../GenericSectionRenderer'

type Props = Readonly<{ cv: CV }>

const HEADING = 'mb-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400'

export function ModernTemplate({ cv }: Props) {
  const visible = cv.sections.filter((s) => s.visible)

  return (
    <article
      className="prose prose-sm max-w-none text-[13px] leading-relaxed text-foreground"
      aria-label="CV preview"
    >
      {/* Blue accent header */}
      <div className="bg-blue-600 px-10 py-8 text-white dark:bg-blue-800">
        {visible
          .filter((s) => s.type === 'personalInfo')
          .map((section) =>
            section.type === 'personalInfo' ? (
              <div key={section.id}>
                {section.name && (
                  <h1 className="text-2xl font-bold leading-tight text-white">{section.name}</h1>
                )}
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-100">
                  {section.email && <span>{section.email}</span>}
                  {section.phone && <span>{section.phone}</span>}
                  {section.location && <span>{section.location}</span>}
                  {section.website && <span>{section.website}</span>}
                  {section.linkedin && <span>{section.linkedin}</span>}
                </div>
              </div>
            ) : null
          )}
      </div>

      {/* Body */}
      <div className="px-10 py-8 space-y-5">
        {visible
          .filter((s) => s.type !== 'personalInfo')
          .map((section) => {
            if (section.type === 'experience') return <ExperienceRenderer key={section.id} section={section} headingClassName={HEADING} />
            if (section.type === 'education') return <EducationRenderer key={section.id} section={section} headingClassName={HEADING} />
            if (section.type === 'skills') return <SkillsRenderer key={section.id} section={section} headingClassName={HEADING} />
            return <GenericSectionRenderer key={section.id} section={section} headingClassName={HEADING} />
          })}
      </div>
    </article>
  )
}
