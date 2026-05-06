import type { CV } from '@/schemas/cv'
import { PersonalInfoRenderer } from '../PersonalInfoRenderer'
import { ExperienceRenderer } from '../ExperienceRenderer'
import { EducationRenderer } from '../EducationRenderer'
import { SkillsRenderer } from '../SkillsRenderer'
import { GenericSectionRenderer } from '../GenericSectionRenderer'

type Props = Readonly<{ cv: CV }>

const HEADING = 'mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'

export function CompactTemplate({ cv }: Props) {
  const visible = cv.sections.filter((s) => s.visible)
  const personalInfo = visible.find((s) => s.type === 'personalInfo')
  const skills = visible.find((s) => s.type === 'skills')
  const rest = visible.filter((s) => s.type !== 'personalInfo' && s.type !== 'skills')

  return (
    <article
      className="prose prose-sm max-w-none text-[12px] leading-snug text-foreground"
      aria-label="CV preview"
    >
      {/* Compact header */}
      <div className="border-b px-8 py-5">
        {personalInfo?.type === 'personalInfo' && (
          <PersonalInfoRenderer section={personalInfo} />
        )}
      </div>

      {/* Two-column: body left, skills right */}
      <div className="flex gap-0">
        <div className="flex-1 space-y-4 px-8 py-5">
          {rest.map((section) => {
            if (section.type === 'experience') return <ExperienceRenderer key={section.id} section={section} headingClassName={HEADING} />
            if (section.type === 'education') return <EducationRenderer key={section.id} section={section} headingClassName={HEADING} />
            return <GenericSectionRenderer key={section.id} section={section} headingClassName={HEADING} />
          })}
        </div>

        {/* Skills sidebar — ATS warning: two-column layout may not parse correctly */}
        {skills && (
          <div className="w-44 shrink-0 border-s bg-muted/30 px-4 py-5">
            <SkillsRenderer section={skills} headingClassName={HEADING} />
          </div>
        )}
      </div>
    </article>
  )
}
