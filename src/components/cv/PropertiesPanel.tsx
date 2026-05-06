import { useCV } from '@/contexts/CVContext';
import type { PersonalInfoContent, SummaryContent, ExperienceContent, EducationContent, SkillsContent, SpacerContent } from '@/types/cv';

export function PropertiesPanel() {
  const { selectedSection, updateSectionContent, dispatch } = useCV();

  if (!selectedSection) {
    return (
      <div className="w-64 border-l border-border bg-card hidden lg:flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground text-center">Select a section to edit its properties</p>
        </div>
      </div>
    );
  }

  const { id, type, title, content, locked } = selectedSection;

  const updateTitle = (newTitle: string) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { id, updates: { title: newTitle } } });
  };

  return (
    <div className="w-64 border-l border-border bg-card hidden lg:flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Properties</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Section title */}
        <div>
          <label className="property-label mb-1 block">Section Title</label>
          <input
            type="text"
            value={title}
            onChange={e => updateTitle(e.target.value)}
            className="w-full property-input rounded-md px-2"
            disabled={locked}
          />
        </div>

        {/* Type-specific properties */}
        {type === 'spacer' && (
          <div>
            <label className="property-label mb-1 block">Height (px)</label>
            <input
              type="number"
              value={(content as SpacerContent).height}
              onChange={e => updateSectionContent(id, { height: parseInt(e.target.value) || 8 })}
              className="w-full property-input rounded-md px-2"
              min={8}
              max={200}
              step={8}
            />
          </div>
        )}

        {type === 'personal-info' && (
          <PersonalInfoProps sectionId={id} content={content as PersonalInfoContent} />
        )}

        {/* ATS Tips */}
        <div className="mt-6 bg-accent/50 rounded-lg p-3">
          <p className="text-xs font-semibold text-accent-foreground mb-1">ATS Tips</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use standard section headings</li>
            <li>• Keep single-column layout</li>
            <li>• Avoid images and graphics</li>
            <li>• Use bullet points for achievements</li>
            <li>• Include relevant keywords</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function PersonalInfoProps({ sectionId, content }: { sectionId: string; content: PersonalInfoContent }) {
  const { updateSectionContent } = useCV();

  const update = (field: keyof PersonalInfoContent, value: string) => {
    updateSectionContent(sectionId, { ...content, [field]: value });
  };

  const fields: { key: keyof PersonalInfoContent; label: string }[] = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'website', label: 'Website' },
  ];

  return (
    <>
      {fields.map(f => (
        <div key={f.key}>
          <label className="property-label mb-1 block">{f.label}</label>
          <input
            type="text"
            value={(content[f.key] as string) || ''}
            onChange={e => update(f.key, e.target.value)}
            className="w-full property-input rounded-md px-2"
          />
        </div>
      ))}
    </>
  );
}
