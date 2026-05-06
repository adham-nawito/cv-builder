import type { ExperienceSection, TextBlock, ListBlock, DateRangeBlock } from '@/schemas/cv'
import { SectionHeading } from './SectionHeading'

type Props = Readonly<{ section: ExperienceSection; headingClassName?: string }>

function renderBlock(block: TextBlock | ListBlock | DateRangeBlock) {
  if (block.type === 'text') {
    return (
      <p key={block.id} className={`text-sm${block.bold ? ' font-semibold' : ''}${block.italic ? ' italic' : ''}`}>
        {block.value}
      </p>
    )
  }
  if (block.type === 'list') {
    return (
      <ul key={block.id} className="ms-4 list-disc space-y-0.5 text-sm">
        {block.items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    )
  }
  if (block.type === 'dateRange') {
    const end = block.present ? 'Present' : (block.end ?? '')
    return (
      <p key={block.id} className="text-xs text-muted-foreground">
        {block.start}{block.start && end ? ' – ' : ''}{end}
      </p>
    )
  }
}

export function ExperienceRenderer({ section, headingClassName }: Props) {
  return (
    <div>
      <SectionHeading title={section.title} className={headingClassName} />
      {section.blocks.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">No entries yet</p>
      ) : (
        <div className="space-y-3">
          {section.blocks.map((b) => renderBlock(b as TextBlock | ListBlock | DateRangeBlock))}
        </div>
      )}
    </div>
  )
}
