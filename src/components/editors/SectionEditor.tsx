import { useCVStore } from '@/store'
import type { Section } from '@/schemas/cv'
import { PersonalInfoEditor } from './PersonalInfoEditor'
import { BlockListEditor } from './BlockListEditor'
import { SpacerEditor } from './SpacerEditor'
import { FormField, FieldInput } from './FormField'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const ATS_TIPS: Partial<Record<Section['type'], string>> = {
  personalInfo: 'Include a professional email and LinkedIn URL for recruiter contact.',
  experience: 'Start bullet points with strong action verbs (Led, Built, Reduced…).',
  skills: 'List skills as comma-separated keywords — ATS parsers prefer flat lists.',
  education: 'Include graduation year and GPA if above 3.5.',
  projects: 'Link to GitHub or live demos to add credibility.',
  certifications: 'Include certification date and issuing body.',
  languages: 'Specify proficiency level (Native, Fluent, Conversational).',
}

type Props = Readonly<{ section: Section }>

export function SectionEditor({ section }: Props) {
  const updateSection = useCVStore((s) => s.updateSection)
  const tip = ATS_TIPS[section.type]

  return (
    <div className="space-y-4">
      {/* Common fields */}
      {section.type !== 'spacer' && (
        <FormField label="Section title" htmlFor="sec-title">
          <FieldInput
            id="sec-title"
            value={section.title}
            onChange={(e) => updateSection(section.id, { title: e.target.value })}
          />
        </FormField>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor="sec-visible" className="text-xs text-muted-foreground">Visible</Label>
        <Switch
          id="sec-visible"
          checked={section.visible}
          onCheckedChange={(v) => updateSection(section.id, { visible: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="sec-locked" className="text-xs text-muted-foreground">Locked</Label>
        <Switch
          id="sec-locked"
          checked={section.locked}
          onCheckedChange={(v) => updateSection(section.id, { locked: v })}
        />
      </div>

      <Separator />

      {/* Type-specific editor */}
      {section.type === 'personalInfo' && <PersonalInfoEditor section={section} />}
      {section.type === 'spacer' && <SpacerEditor section={section} />}
      {section.type !== 'personalInfo' && section.type !== 'spacer' && (
        <BlockListEditor section={section} />
      )}

      {/* ATS tip */}
      {tip && (
        <>
          <Separator />
          <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <span className="font-semibold">ATS tip: </span>{tip}
          </div>
        </>
      )}
    </div>
  )
}
