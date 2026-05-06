import { useCVStore } from '@/store'
import type { SpacerSection } from '@/schemas/cv'
import { FormField } from './FormField'
import { Slider } from '@/components/ui/slider'

type Props = Readonly<{ section: SpacerSection }>

export function SpacerEditor({ section }: Props) {
  const updateSection = useCVStore((s) => s.updateSection)

  return (
    <div className="space-y-4">
      <FormField label={`Height: ${section.height}px`}>
        <Slider
          min={4}
          max={120}
          step={4}
          value={[section.height]}
          onValueChange={([v]) => updateSection(section.id, { height: v })}
          aria-label="Spacer height"
        />
      </FormField>
    </div>
  )
}
