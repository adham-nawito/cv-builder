import type { CV } from '@/schemas/cv'
import { PersonalInfoRenderer } from '../PersonalInfoRenderer'
import { ExperienceRenderer } from '../ExperienceRenderer'
import { EducationRenderer } from '../EducationRenderer'
import { SkillsRenderer } from '../SkillsRenderer'
import { GenericSectionRenderer } from '../GenericSectionRenderer'

type Props = Readonly<{ cv: CV }>

const HEADING = 'mb-2 border-b border-foreground pb-0.5 text-xs font-bold uppercase tracking-widest text-foreground'

export function MinimalTemplate({ cv }: Props) {
  const visible = cv.sections.filter((s) => s.visible)

  return (
    <article
      className="prose prose-sm max-w-none px-12 py-10 font-serif text-[13px] leading-relaxed text-foreground"
      aria-label="CV preview"
    >
      {visible.map((section) => {
        if (section.type === 'personalInfo') {
          return (
            <div key={section.id} className="mb-6 text-center">
              <PersonalInfoRenderer section={section} />
            </div>
          )
        }
        if (section.type === 'experience') {
          return <div key={section.id} className="mb-5"><ExperienceRenderer section={section} headingClassName={HEADING} /></div>
        }
        if (section.type === 'education') {
          return <div key={section.id} className="mb-5"><EducationRenderer section={section} headingClassName={HEADING} /></div>
        }
        if (section.type === 'skills') {
          return <div key={section.id} className="mb-5"><SkillsRenderer section={section} headingClassName={HEADING} /></div>
        }
        return <div key={section.id} className="mb-5"><GenericSectionRenderer section={section} headingClassName={HEADING} /></div>
      })}
    </article>
  )
}
