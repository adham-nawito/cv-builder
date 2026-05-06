import type { Section, TextBlock, ListBlock, DateRangeBlock } from '@/schemas/cv'
import { SectionHeading } from './SectionHeading'

type Props = Readonly<{ section: Section; headingClassName?: string }>

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

export function GenericSectionRenderer({ section, headingClassName }: Props) {
  if (section.type === 'spacer') {
    return <div style={{ height: section.height }} aria-hidden="true" />
  }

  return (
    <div>
      <SectionHeading title={section.title} className={headingClassName} />
      {section.blocks.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">No content yet</p>
      ) : (
        <div className="space-y-2">
          {section.blocks.map((b) => renderBlock(b as TextBlock | ListBlock | DateRangeBlock))}
        </div>
      )}
    </div>
  )
}
