import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useCVStore } from '@/store'
import type { Section, Block, TextBlock, ListBlock, DateRangeBlock } from '@/schemas/cv'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FieldInput, FieldTextarea } from './FormField'
import { Plus, Trash2, GripVertical } from 'lucide-react'

type Props = Readonly<{ section: Section }>

function TextBlockEditor({ block, onChange }: Readonly<{ block: TextBlock; onChange: (b: TextBlock) => void }>) {
  return (
    <div className="space-y-1.5">
      <FieldTextarea
        value={block.value}
        onChange={(e) => onChange({ ...block, value: e.target.value })}
        placeholder="Enter text…"
        rows={2}
      />
      <div className="flex gap-3">
        <label className="flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={!!block.bold} onChange={(e) => onChange({ ...block, bold: e.target.checked })} />
          Bold
        </label>
        <label className="flex items-center gap-1.5 text-xs">
          <input type="checkbox" checked={!!block.italic} onChange={(e) => onChange({ ...block, italic: e.target.checked })} />
          Italic
        </label>
      </div>
    </div>
  )
}

function ListBlockEditor({ block, onChange }: Readonly<{ block: ListBlock; onChange: (b: ListBlock) => void }>) {
  return (
    <div className="space-y-1">
      {block.items.map((item, i) => (
        <div key={i} className="flex gap-1">
          <FieldInput
            value={item}
            onChange={(e) => {
              const items = [...block.items]
              items[i] = e.target.value
              onChange({ ...block, items })
            }}
            placeholder={`Bullet ${i + 1}`}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            aria-label="Remove bullet"
            onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-1 w-full text-xs"
        onClick={() => onChange({ ...block, items: [...block.items, ''] })}
      >
        <Plus className="size-3" /> Add bullet
      </Button>
    </div>
  )
}

function DateRangeBlockEditor({ block, onChange }: Readonly<{ block: DateRangeBlock; onChange: (b: DateRangeBlock) => void }>) {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <div className="flex-1 space-y-0.5">
          <Label className="text-[10px] text-muted-foreground">Start</Label>
          <FieldInput
            type="month"
            value={block.start ?? ''}
            onChange={(e) => onChange({ ...block, start: e.target.value })}
          />
        </div>
        <div className="flex-1 space-y-0.5">
          <Label className="text-[10px] text-muted-foreground">End</Label>
          <FieldInput
            type="month"
            value={block.end ?? ''}
            onChange={(e) => onChange({ ...block, end: e.target.value })}
            disabled={block.present}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs">
        <Switch
          checked={!!block.present}
          onCheckedChange={(v) => onChange({ ...block, present: v })}
          id={`present-${block.id}`}
        />
        <span>Present / Current</span>
      </label>
    </div>
  )
}

const BLOCK_TYPE_LABELS = { text: 'Text', list: 'Bullet list', dateRange: 'Date range' } as const
type BlockType = Block['type']

export function BlockListEditor({ section }: Props) {
  const updateSection = useCVStore((s) => s.updateSection)
  const [addType, setAddType] = useState<BlockType>('text')

  if (section.type === 'spacer') return null

  function updateBlock(updated: Block) {
    const blocks = section.blocks.map((b) => (b.id === updated.id ? updated : b))
    updateSection(section.id, { blocks } as Partial<Section>)
  }

  function removeBlock(id: string) {
    const blocks = section.blocks.filter((b) => b.id !== id)
    updateSection(section.id, { blocks } as Partial<Section>)
  }

  function addBlock() {
    let block: Block
    if (addType === 'text') block = { id: uuidv4(), type: 'text', value: '' }
    else if (addType === 'list') block = { id: uuidv4(), type: 'list', items: [''] }
    else block = { id: uuidv4(), type: 'dateRange', start: '', present: false }
    updateSection(section.id, { blocks: [...section.blocks, block] } as Partial<Section>)
  }

  return (
    <div className="space-y-3">
      {section.blocks.map((block, i) => (
        <div key={block.id} className="rounded-md border p-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <GripVertical className="size-3" aria-hidden="true" />
              {BLOCK_TYPE_LABELS[block.type]} {i + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              aria-label="Remove block"
              onClick={() => removeBlock(block.id)}
            >
              <Trash2 className="size-3 text-muted-foreground" />
            </Button>
          </div>

          {block.type === 'text' && (
            <TextBlockEditor block={block} onChange={(b) => updateBlock(b)} />
          )}
          {block.type === 'list' && (
            <ListBlockEditor block={block} onChange={(b) => updateBlock(b)} />
          )}
          {block.type === 'dateRange' && (
            <DateRangeBlockEditor block={block} onChange={(b) => updateBlock(b)} />
          )}
        </div>
      ))}

      <div className="flex gap-1.5">
        <select
          className="flex-1 rounded-md border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          value={addType}
          onChange={(e) => setAddType(e.target.value as BlockType)}
          aria-label="Block type to add"
        >
          <option value="text">Text</option>
          <option value="list">Bullet list</option>
          <option value="dateRange">Date range</option>
        </select>
        <Button type="button" size="sm" onClick={addBlock} className="shrink-0">
          <Plus className="size-3" /> Add
        </Button>
      </div>
    </div>
  )
}
