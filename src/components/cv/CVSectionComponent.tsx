import { useCV } from '@/contexts/CVContext';
import type {
  CVSection, PersonalInfoContent, SummaryContent, ExperienceContent,
  EducationContent, SkillsContent, ProjectsContent, CertificationsContent,
  LanguagesContent, SpacerContent, ExperienceItem, EducationItem,
  TemplateType,
} from '@/types/cv';
import { v4 as uuid } from 'uuid';
import { Trash2, Copy, Lock, Unlock, GripVertical, Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useCallback } from 'react';

type Template = TemplateType;

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

function getHeadingStyle(template: Template) {
  switch (template) {
    case 'modern':
      return {
        className: 'text-sm font-bold uppercase tracking-wider mb-2 pb-1',
        style: { borderBottom: '3px solid #111', color: '#111', letterSpacing: '0.15em' } as React.CSSProperties,
      };
    case 'minimal':
      return {
        className: 'text-xs font-medium uppercase tracking-widest mb-3 pb-1',
        style: { borderBottom: '1px solid #ccc', color: '#888' } as React.CSSProperties,
      };
    case 'executive':
      return {
        className: 'text-sm font-semibold uppercase tracking-wider mb-2 pb-2',
        style: { borderBottom: '1px solid #8b6914', color: '#6b4f10', letterSpacing: '0.12em' } as React.CSSProperties,
      };
    case 'creative':
      return {
        className: 'text-base font-black mb-2 pb-1',
        style: { borderBottom: '4px solid #e11d48', color: '#be123c', borderImage: 'linear-gradient(90deg, #e11d48, #7c3aed) 1' } as React.CSSProperties,
      };
    default:
      return {
        className: 'text-sm font-bold uppercase tracking-wider mb-2 pb-1',
        style: { borderBottom: '2px solid #2563eb', color: '#1e40af' } as React.CSSProperties,
      };
  }
}

function getHeaderStyle(template: Template) {
  switch (template) {
    case 'modern':
      return {
        wrapper: { background: '#111', color: '#fff', padding: '24px', marginBottom: '16px', borderRadius: '0' } as React.CSSProperties,
        name: { color: '#fff', fontSize: '28px' } as React.CSSProperties,
        subtitle: { color: '#ccc' } as React.CSSProperties,
        contact: { color: '#999' } as React.CSSProperties,
      };
    case 'minimal':
      return {
        wrapper: { borderBottom: '1px solid #ddd', paddingBottom: '12px', marginBottom: '16px' } as React.CSSProperties,
        name: { color: '#333', fontWeight: 400, fontSize: '24px', letterSpacing: '0.1em' } as React.CSSProperties,
        subtitle: { color: '#888' } as React.CSSProperties,
        contact: { color: '#999' } as React.CSSProperties,
      };
    case 'executive':
      return {
        wrapper: { borderBottom: '2px solid #8b6914', paddingBottom: '16px', marginBottom: '20px', textAlign: 'left' as const } as React.CSSProperties,
        name: { color: '#1a1a1a', fontSize: '30px', fontWeight: 700, letterSpacing: '0.04em' } as React.CSSProperties,
        subtitle: { color: '#6b4f10', fontWeight: 500, fontSize: '16px' } as React.CSSProperties,
        contact: { color: '#555' } as React.CSSProperties,
      };
    case 'creative':
      return {
        wrapper: { background: 'linear-gradient(135deg, #fdf2f8, #f5f3ff)', padding: '24px', marginBottom: '16px', borderRadius: '12px', borderLeft: '5px solid #e11d48' } as React.CSSProperties,
        name: { color: '#1a1a1a', fontSize: '32px', fontWeight: 900 } as React.CSSProperties,
        subtitle: { color: '#7c3aed', fontWeight: 600, fontSize: '15px' } as React.CSSProperties,
        contact: { color: '#666' } as React.CSSProperties,
      };
    default:
      return {
        wrapper: { borderBottom: '2px solid #2563eb', paddingBottom: '12px', marginBottom: '16px' } as React.CSSProperties,
        name: { color: '#111' } as React.CSSProperties,
        subtitle: { color: '#444' } as React.CSSProperties,
        contact: { color: '#666' } as React.CSSProperties,
      };
  }
}

function getBodyTextColor(template: Template): string {
  switch (template) {
    case 'modern': return '#222';
    case 'minimal': return '#555';
    case 'executive': return '#2a2a2a';
    case 'creative': return '#333';
    default: return '#333';
  }
}

// Generic helper so renderer updateItem functions don't duplicate identical logic
function patchItem<T extends { id: string }>(items: T[], id: string, patch: Partial<T>): T[] {
  return items.map(item => item.id === id ? { ...item, ...patch } : item);
}

// ---------------------------------------------------------------------------
// InlineEdit — contentEditable span/element
// ---------------------------------------------------------------------------

interface InlineEditProps {
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly className?: string;
  readonly tag?: keyof JSX.IntrinsicElements;
  readonly multiline?: boolean;
  readonly style?: React.CSSProperties;
}

function InlineEdit({ value, onChange, className = '', tag: Tag = 'span', multiline, style: inlineStyle }: InlineEditProps) {
  const handleBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
    const next = e.currentTarget.textContent ?? '';
    if (next !== value) onChange(next);
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }, [multiline]);

  // Pass children as 3rd arg to createElement (not as a prop)
  return React.createElement(
    Tag,
    {
      contentEditable: true,
      suppressContentEditableWarning: true,
      className: `cv-inline-edit ${className}`,
      style: inlineStyle,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
    },
    value,
  );
}

// ---------------------------------------------------------------------------
// CVSectionComponent — outer shell (drag handle, toolbar)
// ---------------------------------------------------------------------------

interface Props {
  readonly section: CVSection;
  readonly isPreview?: boolean;
}

export function CVSectionComponent({ section, isPreview }: Props) {
  const { state, selectSection, deleteSection, duplicateSection, dispatch } = useCV();
  const isSelected = state.selectedSectionId === section.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id, disabled: section.locked || isPreview });

  const sectionStyle = { transform: CSS.Transform.toString(transform), transition };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreview) selectSection(section.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isPreview && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      selectSection(section.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={sectionStyle}
      aria-selected={isPreview ? undefined : isSelected}
      className={`cv-section group ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isPreview ? '' : 'cursor-pointer'}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {!isPreview && isSelected && (
        <div className="absolute -top-8 right-0 flex items-center gap-1 bg-card border border-border rounded-md shadow-sm px-1 py-0.5 z-10 animate-fade-in">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_LOCK', payload: section.id })}
            className="p-1 hover:bg-muted rounded"
            title={section.locked ? 'Unlock' : 'Lock'}
          >
            {section.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => duplicateSection(section.id)} className="p-1 hover:bg-muted rounded" title="Duplicate">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => deleteSection(section.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!isPreview && !section.locked && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      <SectionRenderer section={section} isPreview={isPreview} template={state.cv.template} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionRenderer — dispatches to the right renderer
// ---------------------------------------------------------------------------

interface RendererProps {
  readonly section: CVSection;
  readonly isPreview?: boolean;
  readonly template: Template;
}

function SectionRenderer({ section, isPreview, template }: RendererProps) {
  switch (section.type) {
    case 'personal-info':    return <PersonalInfoRenderer section={section} isPreview={isPreview} template={template} />;
    case 'summary':          return <SummaryRenderer section={section} isPreview={isPreview} template={template} />;
    case 'experience':       return <ExperienceRenderer section={section} isPreview={isPreview} template={template} />;
    case 'education':        return <EducationRenderer section={section} isPreview={isPreview} template={template} />;
    case 'skills':           return <SkillsRenderer section={section} isPreview={isPreview} template={template} />;
    case 'projects':         return <ProjectsRenderer section={section} isPreview={isPreview} template={template} />;
    case 'certifications':   return <CertificationsRenderer section={section} isPreview={isPreview} template={template} />;
    case 'languages':        return <LanguagesRenderer section={section} isPreview={isPreview} template={template} />;
    case 'spacer':           return <SpacerRenderer section={section} />;
    default:                 return <div className="p-2 text-muted-foreground text-sm">Custom section</div>;
  }
}

// ---------------------------------------------------------------------------
// Per-section renderers
// ---------------------------------------------------------------------------

function PersonalInfoRenderer({ section, isPreview, template }: RendererProps) {
  const { updateSectionContent } = useCV();
  const c = section.content as PersonalInfoContent;
  const hs = getHeaderStyle(template);

  const update = (field: keyof PersonalInfoContent, value: string) =>
    updateSectionContent(section.id, { ...c, [field]: value });

  const contactLine = [c.email, c.phone, c.location].filter(Boolean).join(' | ');
  const linksLine   = [c.linkedin, c.website].filter(Boolean).join(' | ');

  if (isPreview) {
    return (
      <header className="text-center mb-6 pb-4" style={hs.wrapper}>
        <h1 className="text-2xl font-bold mb-1" style={hs.name}>{c.fullName}</h1>
        <p className="text-base mb-1" style={hs.subtitle}>{c.jobTitle}</p>
        <p className="text-sm" style={hs.contact}>{contactLine}</p>
        {linksLine && <p className="text-sm" style={hs.contact}>{linksLine}</p>}
      </header>
    );
  }

  return (
    <header className="text-center mb-6 pb-4" style={hs.wrapper}>
      <InlineEdit tag="h1" value={c.fullName} onChange={v => update('fullName', v)} className="text-2xl font-bold mb-1 block" style={hs.name} />
      <InlineEdit tag="p" value={c.jobTitle} onChange={v => update('jobTitle', v)} className="text-base mb-1 block" style={hs.subtitle} />
      <InlineEdit
        tag="p"
        value={contactLine}
        onChange={v => {
          const [email = '', phone = '', location = ''] = v.split('|').map(s => s.trim());
          updateSectionContent(section.id, { ...c, email, phone, location });
        }}
        className="text-sm block"
        style={hs.contact}
      />
    </header>
  );
}

function SummaryRenderer({ section, isPreview, template }: RendererProps) {
  const { updateSectionContent } = useCV();
  const c = section.content as SummaryContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  return (
    <section className="mb-5">
      <h2 className={headingStyle.className} style={headingStyle.style}>{section.title}</h2>
      {isPreview
        ? <p className="text-sm leading-relaxed" style={{ color: textColor }}>{c.text}</p>
        : <InlineEdit tag="p" value={c.text} onChange={v => updateSectionContent(section.id, { text: v })} className="text-sm leading-relaxed block" style={{ color: textColor }} multiline />
      }
    </section>
  );
}

function ExperienceRenderer({ section, isPreview, template }: RendererProps) {
  const { updateSectionContent } = useCV();
  const c = section.content as ExperienceContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  const updateItem = (itemId: string, patch: Partial<ExperienceItem>) =>
    updateSectionContent(section.id, { items: patchItem(c.items, itemId, patch) });

  const addItem = () =>
    updateSectionContent(section.id, {
      items: [...c.items, { id: uuid(), company: 'Company', role: 'Role', startDate: 'Start', endDate: 'End', bullets: ['Achievement'] }],
    });

  const addBullet = (itemId: string) =>
    updateItem(itemId, { bullets: [...(c.items.find(i => i.id === itemId)?.bullets ?? []), 'New achievement'] });

  const updateBullet = (itemId: string, bi: number, v: string) => {
    const item = c.items.find(i => i.id === itemId);
    if (!item) return;
    const bullets = [...item.bullets];
    bullets[bi] = v;
    updateItem(itemId, { bullets });
  };

  return (
    <section className="mb-5">
      <h2 className={headingStyle.className} style={headingStyle.style}>{section.title}</h2>
      {c.items.map(item => (
        <div key={item.id} className="mb-4">
          <div className="flex justify-between items-baseline mb-1">
            {isPreview ? (
              <>
                <h3 className="text-sm font-semibold" style={{ color: textColor }}>{item.role} — {item.company}</h3>
                <span className="text-xs" style={{ color: '#666' }}>{item.startDate} – {item.endDate}</span>
              </>
            ) : (
              <>
                <InlineEdit
                  tag="h3"
                  value={`${item.role} — ${item.company}`}
                  onChange={v => {
                    const [role = '', ...rest] = v.split('—').map(s => s.trim());
                    updateItem(item.id, { role, company: rest.join(' — ') });
                  }}
                  className="text-sm font-semibold"
                  style={{ color: textColor }}
                />
                <InlineEdit
                  value={`${item.startDate} – ${item.endDate}`}
                  onChange={v => {
                    const [startDate = '', ...rest] = v.split('–').map(s => s.trim());
                    updateItem(item.id, { startDate, endDate: rest.join(' – ') });
                  }}
                  className="text-xs shrink-0"
                />
              </>
            )}
          </div>
          <ul className={`list-disc ml-5 space-y-0.5 ${template === 'minimal' ? 'list-none ml-0' : ''}`}>
            {item.bullets.map((bullet, bi) => (
              <li
                key={`${item.id}-${bi}`}
                className={`text-sm ${template === 'minimal' ? 'before:content-["–"] before:mr-2 before:text-muted-foreground' : ''}`}
                style={{ color: textColor }}
              >
                {isPreview ? bullet : (
                  <InlineEdit
                    value={bullet}
                    onChange={v => updateBullet(item.id, bi, v)}
                  />
                )}
              </li>
            ))}
          </ul>
          {!isPreview && (
            <button onClick={() => addBullet(item.id)} className="text-xs text-primary hover:underline mt-1 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add bullet
            </button>
          )}
        </div>
      ))}
      {!isPreview && (
        <button onClick={addItem} className="text-xs text-primary hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add experience
        </button>
      )}
    </section>
  );
}

function EducationRenderer({ section, isPreview, template }: RendererProps) {
  const { updateSectionContent } = useCV();
  const c = section.content as EducationContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  const updateItem = (itemId: string, patch: Partial<EducationItem>) =>
    updateSectionContent(section.id, { items: patchItem(c.items, itemId, patch) });

  const addItem = () =>
    updateSectionContent(section.id, {
      items: [...c.items, { id: uuid(), institution: 'Institution', degree: 'Degree', startDate: 'Start', endDate: 'End' }],
    });

  return (
    <section className="mb-5">
      <h2 className={headingStyle.className} style={headingStyle.style}>{section.title}</h2>
      {c.items.map(item => (
        <div key={item.id} className="mb-3">
          <div className="flex justify-between items-baseline">
            {isPreview ? (
              <>
                <h3 className="text-sm font-semibold" style={{ color: textColor }}>{item.degree} — {item.institution}</h3>
                <span className="text-xs" style={{ color: '#666' }}>{item.startDate} – {item.endDate}</span>
              </>
            ) : (
              <>
                <InlineEdit
                  tag="h3"
                  value={`${item.degree} — ${item.institution}`}
                  onChange={v => {
                    const [degree = '', ...rest] = v.split('—').map(s => s.trim());
                    updateItem(item.id, { degree, institution: rest.join(' — ') });
                  }}
                  className="text-sm font-semibold"
                  style={{ color: textColor }}
                />
                <InlineEdit
                  value={`${item.startDate} – ${item.endDate}`}
                  onChange={v => {
                    const [startDate = '', ...rest] = v.split('–').map(s => s.trim());
                    updateItem(item.id, { startDate, endDate: rest.join(' – ') });
                  }}
                  className="text-xs shrink-0"
                />
              </>
            )}
          </div>
          {item.details && <p className="text-sm" style={{ color: '#555' }}>{item.details}</p>}
        </div>
      ))}
      {!isPreview && (
        <button onClick={addItem} className="text-xs text-primary hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add education
        </button>
      )}
    </section>
  );
}

function SkillsRenderer({ section, isPreview, template }: RendererProps) {
  const { updateSectionContent } = useCV();
  const c = section.content as SkillsContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  const updateCategory = (catId: string, raw: string) => {
    const skills = raw.split(',').map(s => s.trim()).filter(Boolean);
    updateSectionContent(section.id, {
      categories: c.categories.map(cc => cc.id === catId ? { ...cc, skills } : cc),
    });
  };

  return (
    <section className="mb-5">
      <h2 className={headingStyle.className} style={headingStyle.style}>{section.title}</h2>
      {c.categories.map(cat => (
        <p key={cat.id} className="text-sm mb-1" style={{ color: textColor }}>
          <strong>{cat.name}:</strong>{' '}
          {isPreview ? cat.skills.join(', ') : (
            <InlineEdit
              value={cat.skills.join(', ')}
              onChange={v => updateCategory(cat.id, v)}
            />
          )}
        </p>
      ))}
    </section>
  );
}

function ProjectsRenderer({ section, isPreview, template }: RendererProps) {
  const { updateSectionContent } = useCV();
  const c = section.content as ProjectsContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  const updateItem = (id: string, field: 'name' | 'description' | 'technologies', value: string) =>
    updateSectionContent(section.id, { items: patchItem(c.items, id, { [field]: value }) });

  const addItem = () =>
    updateSectionContent(section.id, {
      items: [...c.items, { id: uuid(), name: 'Project Name', description: 'Description', technologies: 'Tech stack', link: '' }],
    });

  return (
    <section className="mb-5">
      <h2 className={headingStyle.className} style={headingStyle.style}>{section.title}</h2>
      {c.items.map(item => (
        <div key={item.id} className="mb-3">
          {isPreview ? (
            <>
              <h3 className="text-sm font-semibold" style={{ color: textColor }}>{item.name}</h3>
              <p className="text-sm" style={{ color: textColor }}>{item.description}</p>
              <p className="text-sm italic" style={{ color: '#555' }}>{item.technologies}</p>
            </>
          ) : (
            <>
              <InlineEdit tag="h3" value={item.name} onChange={v => updateItem(item.id, 'name', v)} className="text-sm font-semibold block" style={{ color: textColor }} />
              <InlineEdit tag="p" value={item.description} onChange={v => updateItem(item.id, 'description', v)} className="text-sm block" style={{ color: textColor }} multiline />
              <InlineEdit tag="p" value={item.technologies} onChange={v => updateItem(item.id, 'technologies', v)} className="text-sm italic block" style={{ color: '#555' }} />
            </>
          )}
        </div>
      ))}
      {!isPreview && (
        <button onClick={addItem} className="text-xs text-primary hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add project
        </button>
      )}
    </section>
  );
}

function CertificationsRenderer({ section, isPreview, template }: RendererProps) {
  const { updateSectionContent } = useCV();
  const c = section.content as CertificationsContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  const updateItem = (id: string, field: 'name' | 'issuer' | 'date', value: string) =>
    updateSectionContent(section.id, { items: patchItem(c.items, id, { [field]: value }) });

  const addItem = () =>
    updateSectionContent(section.id, {
      items: [...c.items, { id: uuid(), name: 'Certification Name', issuer: 'Issuer', date: '2024' }],
    });

  return (
    <section className="mb-5">
      <h2 className={headingStyle.className} style={headingStyle.style}>{section.title}</h2>
      <ul className={`list-disc ml-5 ${template === 'minimal' ? 'list-none ml-0' : ''}`}>
        {c.items.map(item => (
          <li key={item.id} className="text-sm" style={{ color: textColor }}>
            {isPreview ? (
              <>{item.name} — {item.issuer} ({item.date})</>
            ) : (
              <>
                <InlineEdit value={item.name} onChange={v => updateItem(item.id, 'name', v)} className="font-medium" />
                {' — '}
                <InlineEdit value={item.issuer} onChange={v => updateItem(item.id, 'issuer', v)} />
                {' ('}
                <InlineEdit value={item.date} onChange={v => updateItem(item.id, 'date', v)} className="text-xs" />
                {')'}
              </>
            )}
          </li>
        ))}
      </ul>
      {!isPreview && (
        <button onClick={addItem} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
          <Plus className="w-3 h-3" /> Add certification
        </button>
      )}
    </section>
  );
}

function LanguagesRenderer({ section, isPreview, template }: RendererProps) {
  const { updateSectionContent } = useCV();
  const c = section.content as LanguagesContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  const updateItem = (id: string, field: 'language' | 'proficiency', value: string) =>
    updateSectionContent(section.id, { items: patchItem(c.items, id, { [field]: value }) });

  const addItem = () =>
    updateSectionContent(section.id, {
      items: [...c.items, { id: uuid(), language: 'Language', proficiency: 'Fluent' }],
    });

  return (
    <section className="mb-5">
      <h2 className={headingStyle.className} style={headingStyle.style}>{section.title}</h2>
      <ul className={`list-disc ml-5 ${template === 'minimal' ? 'list-none ml-0' : ''}`}>
        {c.items.map(item => (
          <li key={item.id} className="text-sm" style={{ color: textColor }}>
            {isPreview ? (
              <>{item.language} — {item.proficiency}</>
            ) : (
              <>
                <InlineEdit value={item.language} onChange={v => updateItem(item.id, 'language', v)} className="font-medium" />
                {' — '}
                <InlineEdit value={item.proficiency} onChange={v => updateItem(item.id, 'proficiency', v)} />
              </>
            )}
          </li>
        ))}
      </ul>
      {!isPreview && (
        <button onClick={addItem} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
          <Plus className="w-3 h-3" /> Add language
        </button>
      )}
    </section>
  );
}

function SpacerRenderer({ section }: { readonly section: CVSection }) {
  const c = section.content as SpacerContent;
  return <div style={{ height: c.height }} />;
}
