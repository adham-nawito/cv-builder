import type { SkillsSection } from '@/schemas/cv'
import { SectionHeading } from './SectionHeading'

type Props = Readonly<{ section: SkillsSection; headingClassName?: string }>

export function SkillsRenderer({ section, headingClassName }: Props) {
  const listBlocks = section.blocks.filter((b) => b.type === 'list')
  const textBlocks = section.blocks.filter((b) => b.type === 'text')

  return (
    <div>
      <SectionHeading title={section.title} className={headingClassName} />
      {section.blocks.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">No skills yet</p>
      ) : (
        <div className="space-y-2">
          {textBlocks.map((b) => (
            <p key={b.id} className="text-sm">{b.type === 'text' ? b.value : ''}</p>
          ))}
          {listBlocks.map((b) => b.type === 'list' && (
            <div key={b.id} className="flex flex-wrap gap-1.5">
              {b.items.map((skill, i) => (
                <span key={i} className="rounded-sm bg-muted px-2 py-0.5 text-xs">
                  {skill}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
