import { useCV } from '@/contexts/CVContext';
import { v4 as uuid } from 'uuid';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import type {
  SectionType,
  PersonalInfoContent, SummaryContent, ExperienceContent, EducationContent,
  SkillsContent, ProjectsContent, CertificationsContent, LanguagesContent,
  SpacerContent, ExperienceItem, EducationItem,
} from '@/types/cv';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function Label({ children }: { readonly children: React.ReactNode }) {
  return <p className="property-label mb-1 block">{children}</p>;
}

function Field({
  label, value, onChange, type = 'text', placeholder,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly type?: string;
  readonly placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full property-input rounded-md px-2"
      />
    </div>
  );
}

function Textarea({
  label, value, onChange, rows = 3,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly rows?: number;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full property-input rounded-md px-2 py-1.5 resize-none text-sm"
      />
    </div>
  );
}

function AddButton({ label, onClick }: { readonly label: string; readonly onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-primary border border-dashed border-primary/40 rounded-md hover:bg-accent transition-colors"
    >
      <Plus className="w-3 h-3" /> {label}
    </button>
  );
}

function RemoveButton({ onClick }: { readonly onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
      title="Remove"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

function Divider() {
  return <hr className="border-border" />;
}

// ---------------------------------------------------------------------------
// Per-section property editors
// ---------------------------------------------------------------------------

function PersonalInfoProps({ id, content }: { readonly id: string; readonly content: PersonalInfoContent }) {
  const { updateSectionContent } = useCV();
  const set = (field: keyof PersonalInfoContent, v: string) =>
    updateSectionContent(id, { ...content, [field]: v });

  return (
    <>
      <Field label="Full Name"  value={content.fullName}  onChange={v => set('fullName', v)} />
      <Field label="Job Title"  value={content.jobTitle}  onChange={v => set('jobTitle', v)} />
      <Field label="Email"      value={content.email}     onChange={v => set('email', v)}     type="email" />
      <Field label="Phone"      value={content.phone}     onChange={v => set('phone', v)}     type="tel" />
      <Field label="Location"   value={content.location}  onChange={v => set('location', v)} />
      <Field label="LinkedIn"   value={content.linkedin ?? ''}  onChange={v => set('linkedin', v)}  placeholder="linkedin.com/in/..." />
      <Field label="Website"    value={content.website  ?? ''}  onChange={v => set('website', v)}   placeholder="yoursite.com" />
    </>
  );
}

function SummaryProps({ id, content }: { readonly id: string; readonly content: SummaryContent }) {
  const { updateSectionContent } = useCV();
  return (
    <Textarea
      label="Summary Text"
      value={content.text}
      onChange={v => updateSectionContent(id, { text: v })}
      rows={6}
    />
  );
}

function ExperienceProps({ id, content }: { readonly id: string; readonly content: ExperienceContent }) {
  const { updateSectionContent } = useCV();

  const patch = (items: ExperienceItem[]) => updateSectionContent(id, { items });

  const updateItem = (itemId: string, field: keyof ExperienceItem, value: string | string[]) =>
    patch(content.items.map(i => i.id === itemId ? { ...i, [field]: value } : i));

  const addItem = () => patch([
    ...content.items,
    { id: uuid(), company: 'Company', role: 'Role', startDate: '', endDate: '', bullets: [''] },
  ]);

  const removeItem = (itemId: string) => patch(content.items.filter(i => i.id !== itemId));

  const updateBullet = (itemId: string, bi: number, v: string) => {
    const item = content.items.find(i => i.id === itemId);
    if (!item) return;
    const bullets = [...item.bullets];
    bullets[bi] = v;
    updateItem(itemId, 'bullets', bullets);
  };

  const addBullet = (itemId: string) => {
    const item = content.items.find(i => i.id === itemId);
    if (!item) return;
    updateItem(itemId, 'bullets', [...item.bullets, '']);
  };

  const removeBullet = (itemId: string, bi: number) => {
    const item = content.items.find(i => i.id === itemId);
    if (!item) return;
    updateItem(itemId, 'bullets', item.bullets.filter((_, i) => i !== bi));
  };

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <div key={item.id} className="space-y-2 p-3 bg-muted/40 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Role {idx + 1}</span>
            <RemoveButton onClick={() => removeItem(item.id)} />
          </div>
          <Field label="Role"    value={item.role}      onChange={v => updateItem(item.id, 'role', v)} />
          <Field label="Company" value={item.company}   onChange={v => updateItem(item.id, 'company', v)} />
          <Field label="Start"   value={item.startDate} onChange={v => updateItem(item.id, 'startDate', v)} placeholder="Jan 2022" />
          <Field label="End"     value={item.endDate}   onChange={v => updateItem(item.id, 'endDate', v)}   placeholder="Present" />
          <div>
            <Label>Bullets</Label>
            <div className="space-y-1.5">
              {item.bullets.map((b, bi) => (
                <div key={`${item.id}-${bi}`} className="flex gap-1">
                  <input
                    type="text"
                    value={b}
                    onChange={e => updateBullet(item.id, bi, e.target.value)}
                    className="flex-1 property-input rounded-md px-2 text-sm"
                    placeholder="Describe achievement…"
                  />
                  <RemoveButton onClick={() => removeBullet(item.id, bi)} />
                </div>
              ))}
            </div>
            <button
              onClick={() => addBullet(item.id)}
              className="mt-1.5 text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add bullet
            </button>
          </div>
        </div>
      ))}
      <AddButton label="Add Role" onClick={addItem} />
    </div>
  );
}

function EducationProps({ id, content }: { readonly id: string; readonly content: EducationContent }) {
  const { updateSectionContent } = useCV();

  const patch = (items: EducationItem[]) => updateSectionContent(id, { items });
  const updateItem = (itemId: string, field: keyof EducationItem, value: string) =>
    patch(content.items.map(i => i.id === itemId ? { ...i, [field]: value } : i));
  const addItem = () => patch([
    ...content.items,
    { id: uuid(), institution: 'Institution', degree: 'Degree', startDate: '', endDate: '' },
  ]);
  const removeItem = (itemId: string) => patch(content.items.filter(i => i.id !== itemId));

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <div key={item.id} className="space-y-2 p-3 bg-muted/40 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Entry {idx + 1}</span>
            <RemoveButton onClick={() => removeItem(item.id)} />
          </div>
          <Field label="Degree"      value={item.degree}      onChange={v => updateItem(item.id, 'degree', v)} />
          <Field label="Institution" value={item.institution} onChange={v => updateItem(item.id, 'institution', v)} />
          <Field label="Start"       value={item.startDate}   onChange={v => updateItem(item.id, 'startDate', v)} placeholder="2018" />
          <Field label="End"         value={item.endDate}     onChange={v => updateItem(item.id, 'endDate', v)}   placeholder="2022" />
          <Field label="Details"     value={item.details ?? ''} onChange={v => updateItem(item.id, 'details', v)} placeholder="GPA, honours…" />
        </div>
      ))}
      <AddButton label="Add Entry" onClick={addItem} />
    </div>
  );
}

function SkillsProps({ id, content }: { readonly id: string; readonly content: SkillsContent }) {
  const { updateSectionContent } = useCV();

  const patchCats = (categories: SkillsContent['categories']) =>
    updateSectionContent(id, { categories });

  const updateCategory = (catId: string, field: 'name' | 'skills', value: string | string[]) =>
    patchCats(content.categories.map(c => c.id === catId ? { ...c, [field]: value } : c));

  const addCategory = () => patchCats([...content.categories, { id: uuid(), name: 'Category', skills: [] }]);
  const removeCategory = (catId: string) => patchCats(content.categories.filter(c => c.id !== catId));

  const updateSkill = (catId: string, si: number, v: string) => {
    const cat = content.categories.find(c => c.id === catId);
    if (!cat) return;
    const skills = [...cat.skills];
    skills[si] = v;
    updateCategory(catId, 'skills', skills);
  };

  const addSkill = (catId: string) => {
    const cat = content.categories.find(c => c.id === catId);
    if (!cat) return;
    updateCategory(catId, 'skills', [...cat.skills, '']);
  };

  const removeSkill = (catId: string, si: number) => {
    const cat = content.categories.find(c => c.id === catId);
    if (!cat) return;
    updateCategory(catId, 'skills', cat.skills.filter((_, i) => i !== si));
  };

  return (
    <div className="space-y-4">
      {content.categories.map((cat, idx) => (
        <div key={cat.id} className="space-y-2 p-3 bg-muted/40 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Category {idx + 1}</span>
            <RemoveButton onClick={() => removeCategory(cat.id)} />
          </div>
          <Field
            label="Category Name"
            value={cat.name}
            onChange={v => updateCategory(cat.id, 'name', v)}
          />
          <div>
            <Label>Skills</Label>
            <div className="space-y-1.5">
              {cat.skills.map((skill, si) => (
                <div key={`${cat.id}-${si}`} className="flex gap-1">
                  <input
                    type="text"
                    value={skill}
                    onChange={e => updateSkill(cat.id, si, e.target.value)}
                    className="flex-1 property-input rounded-md px-2 text-sm"
                    placeholder="Skill name"
                  />
                  <RemoveButton onClick={() => removeSkill(cat.id, si)} />
                </div>
              ))}
            </div>
            <button
              onClick={() => addSkill(cat.id)}
              className="mt-1.5 text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add skill
            </button>
          </div>
        </div>
      ))}
      <AddButton label="Add Category" onClick={addCategory} />
    </div>
  );
}

function ProjectsProps({ id, content }: { readonly id: string; readonly content: ProjectsContent }) {
  const { updateSectionContent } = useCV();

  const patch = (items: ProjectsContent['items']) => updateSectionContent(id, { items });
  const updateItem = (itemId: string, field: keyof ProjectsContent['items'][number], value: string) =>
    patch(content.items.map(i => i.id === itemId ? { ...i, [field]: value } : i));
  const addItem = () => patch([
    ...content.items,
    { id: uuid(), name: 'Project Name', description: '', technologies: '', link: '' },
  ]);
  const removeItem = (itemId: string) => patch(content.items.filter(i => i.id !== itemId));

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <div key={item.id} className="space-y-2 p-3 bg-muted/40 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Project {idx + 1}</span>
            <RemoveButton onClick={() => removeItem(item.id)} />
          </div>
          <Field label="Name"         value={item.name}         onChange={v => updateItem(item.id, 'name', v)} />
          <Textarea label="Description" value={item.description} onChange={v => updateItem(item.id, 'description', v)} rows={3} />
          <Field label="Technologies" value={item.technologies} onChange={v => updateItem(item.id, 'technologies', v)} placeholder="React, Node.js…" />
          <Field label="Link"         value={item.link ?? ''}   onChange={v => updateItem(item.id, 'link', v)}         placeholder="https://…" />
        </div>
      ))}
      <AddButton label="Add Project" onClick={addItem} />
    </div>
  );
}

function CertificationsProps({ id, content }: { readonly id: string; readonly content: CertificationsContent }) {
  const { updateSectionContent } = useCV();

  const patch = (items: CertificationsContent['items']) => updateSectionContent(id, { items });
  const updateItem = (itemId: string, field: keyof CertificationsContent['items'][number], value: string) =>
    patch(content.items.map(i => i.id === itemId ? { ...i, [field]: value } : i));
  const addItem = () => patch([
    ...content.items,
    { id: uuid(), name: 'Certification', issuer: 'Issuer', date: '' },
  ]);
  const removeItem = (itemId: string) => patch(content.items.filter(i => i.id !== itemId));

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <div key={item.id} className="space-y-2 p-3 bg-muted/40 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Cert {idx + 1}</span>
            <RemoveButton onClick={() => removeItem(item.id)} />
          </div>
          <Field label="Name"   value={item.name}   onChange={v => updateItem(item.id, 'name', v)} />
          <Field label="Issuer" value={item.issuer} onChange={v => updateItem(item.id, 'issuer', v)} />
          <Field label="Date"   value={item.date}   onChange={v => updateItem(item.id, 'date', v)} placeholder="2024" />
        </div>
      ))}
      <AddButton label="Add Certification" onClick={addItem} />
    </div>
  );
}

function LanguagesProps({ id, content }: { readonly id: string; readonly content: LanguagesContent }) {
  const { updateSectionContent } = useCV();

  const patch = (items: LanguagesContent['items']) => updateSectionContent(id, { items });
  const updateItem = (itemId: string, field: 'language' | 'proficiency', value: string) =>
    patch(content.items.map(i => i.id === itemId ? { ...i, [field]: value } : i));
  const addItem = () => patch([...content.items, { id: uuid(), language: 'Language', proficiency: 'Fluent' }]);
  const removeItem = (itemId: string) => patch(content.items.filter(i => i.id !== itemId));

  return (
    <div className="space-y-4">
      {content.items.map((item, idx) => (
        <div key={item.id} className="space-y-2 p-3 bg-muted/40 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Language {idx + 1}</span>
            <RemoveButton onClick={() => removeItem(item.id)} />
          </div>
          <Field label="Language"    value={item.language}    onChange={v => updateItem(item.id, 'language', v)} />
          <Field label="Proficiency" value={item.proficiency} onChange={v => updateItem(item.id, 'proficiency', v)} placeholder="Native / Fluent / B2…" />
        </div>
      ))}
      <AddButton label="Add Language" onClick={addItem} />
    </div>
  );
}

function SpacerProps({ id, content }: { readonly id: string; readonly content: SpacerContent }) {
  const { updateSectionContent } = useCV();
  return (
    <div>
      <Label>Height (px)</Label>
      <input
        type="number"
        value={content.height}
        onChange={e => updateSectionContent(id, { height: parseInt(e.target.value) || 8 })}
        className="w-full property-input rounded-md px-2"
        min={8}
        max={200}
        step={8}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-section ATS tips
// ---------------------------------------------------------------------------

const ATS_TIPS: Record<SectionType, string[]> = {
  'personal-info':  ['Include email, phone, and LinkedIn URL', 'Keep location to city/country only', 'No photo — ATS systems ignore or reject images'],
  'summary':        ['2–4 sentences max', 'Include your target job title', 'Mirror keywords from the job description'],
  'experience':     ['Start bullets with strong action verbs', 'Include measurable results (%, $, time)', 'List most recent roles first'],
  'education':      ['Spell out degree names in full', 'Include graduation year', 'GPA optional unless above 3.5'],
  'skills':         ['Use exact tool/technology names', 'Group by category for readability', 'Match keywords from the job posting'],
  'projects':       ['Link to live demos or GitHub', 'Name the tech stack explicitly', 'Quantify impact where possible'],
  'certifications': ['Include issuer name and date', 'List active/unexpired certs only', 'Spell out acronyms once'],
  'languages':      ['Use standard proficiency labels (Native, C1, B2…)', 'Only list languages relevant to the role'],
  'custom':         ['Keep headings simple and recognisable', 'Avoid tables or multi-column layouts'],
  'spacer':         ['Spacers are stripped by ATS parsers — use sparingly'],
};

// ---------------------------------------------------------------------------
// Slider primitive (wraps native range input)
// ---------------------------------------------------------------------------

function SliderField({
  label, value, min, max, step, unit, onChange,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly unit: string;
  readonly onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-primary"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function PropertiesPanel() {
  const { selectedSection, dispatch, setSectionStyle } = useCV();

  if (!selectedSection) {
    return (
      <div className="w-64 border-l border-border bg-card hidden lg:flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">Select a section to edit its properties</p>
          <p className="text-xs text-muted-foreground/60 text-center">⌘K to open command palette</p>
        </div>
      </div>
    );
  }

  const { id, type, title, content, locked, hidden, style } = selectedSection;
  const fontSize = style?.fontSize ?? 14;
  const spacing  = style?.spacing  ?? 20;

  return (
    <div className="w-64 border-l border-border bg-card hidden lg:flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Properties</h3>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_VISIBILITY', payload: id })}
          className={`p-1 rounded transition-colors ${hidden ? 'text-muted-foreground/40 hover:text-muted-foreground' : 'text-primary hover:text-primary/70'}`}
          title={hidden ? 'Show section' : 'Hide section'}
        >
          {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Section title */}
        <div>
          <Label>Section Title</Label>
          <input
            type="text"
            value={title}
            onChange={e => dispatch({ type: 'UPDATE_SECTION', payload: { id, updates: { title: e.target.value } } })}
            className="w-full property-input rounded-md px-2"
            disabled={locked}
          />
        </div>

        {/* Style controls */}
        <SliderField
          label="Font Size"
          value={fontSize}
          min={10}
          max={20}
          step={1}
          unit="px"
          onChange={v => setSectionStyle(id, { fontSize: v })}
        />
        <SliderField
          label="Section Spacing"
          value={spacing}
          min={4}
          max={60}
          step={4}
          unit="px"
          onChange={v => setSectionStyle(id, { spacing: v })}
        />

        <Divider />

        {/* Type-specific fields */}
        {type === 'personal-info'   && <PersonalInfoProps    id={id} content={content as PersonalInfoContent}    />}
        {type === 'summary'         && <SummaryProps         id={id} content={content as SummaryContent}         />}
        {type === 'experience'      && <ExperienceProps      id={id} content={content as ExperienceContent}      />}
        {type === 'education'       && <EducationProps       id={id} content={content as EducationContent}       />}
        {type === 'skills'          && <SkillsProps          id={id} content={content as SkillsContent}          />}
        {type === 'projects'        && <ProjectsProps        id={id} content={content as ProjectsContent}        />}
        {type === 'certifications'  && <CertificationsProps  id={id} content={content as CertificationsContent}  />}
        {type === 'languages'       && <LanguagesProps       id={id} content={content as LanguagesContent}       />}
        {type === 'spacer'          && <SpacerProps          id={id} content={content as SpacerContent}          />}

        <Divider />

        {/* Per-section ATS tips */}
        <div className="bg-accent/50 rounded-lg p-3">
          <p className="text-xs font-semibold text-accent-foreground mb-1">ATS Tips</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {ATS_TIPS[type]?.map(tip => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
