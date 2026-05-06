import { useCV } from '@/contexts/CVContext';
import type {
  CVSection, PersonalInfoContent, SummaryContent, ExperienceContent,
  EducationContent, SkillsContent, ProjectsContent, CertificationsContent,
  LanguagesContent, SpacerContent, ExperienceItem, EducationItem
} from '@/types/cv';
import { v4 as uuid } from 'uuid';
import { Trash2, Copy, Lock, Unlock, GripVertical, Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useCallback } from 'react';

interface Props {
  section: CVSection;
  isPreview?: boolean;
}

import type { TemplateType } from '@/types/cv';

type Template = TemplateType;

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
    case 'classic':
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
    case 'classic':
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

export function CVSectionComponent({ section, isPreview }: Props) {
  const { state, selectSection, deleteSection, duplicateSection, dispatch, updateSectionContent } = useCV();
  const isSelected = state.selectedSectionId === section.id;

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging
  } = useSortable({ id: section.id, disabled: section.locked || isPreview });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreview) selectSection(section.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cv-section group ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isPreview ? '' : 'cursor-pointer'}`}
      onClick={handleClick}
    >
      {!isPreview && isSelected && (
        <div className="absolute -top-8 right-0 flex items-center gap-1 bg-card border border-border rounded-md shadow-sm px-1 py-0.5 z-10 animate-fade-in">
          <button onClick={() => dispatch({ type: 'TOGGLE_LOCK', payload: section.id })} className="p-1 hover:bg-muted rounded" title={section.locked ? 'Unlock' : 'Lock'}>
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
        <div {...attributes} {...listeners} className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      <SectionRenderer section={section} isPreview={isPreview} template={state.cv.template} />
    </div>
  );
}

function SectionRenderer({ section, isPreview, template }: { section: CVSection; isPreview?: boolean; template: Template }) {
  switch (section.type) {
    case 'personal-info': return <PersonalInfoRenderer section={section} isPreview={isPreview} template={template} />;
    case 'summary': return <SummaryRenderer section={section} isPreview={isPreview} template={template} />;
    case 'experience': return <ExperienceRenderer section={section} isPreview={isPreview} template={template} />;
    case 'education': return <EducationRenderer section={section} isPreview={isPreview} template={template} />;
    case 'skills': return <SkillsRenderer section={section} isPreview={isPreview} template={template} />;
    case 'projects': return <ProjectsRenderer section={section} isPreview={isPreview} template={template} />;
    case 'certifications': return <CertificationsRenderer section={section} isPreview={isPreview} template={template} />;
    case 'languages': return <LanguagesRenderer section={section} isPreview={isPreview} template={template} />;
    case 'spacer': return <SpacerRenderer section={section} />;
    default: return <div className="p-2 text-muted-foreground text-sm">Custom section</div>;
  }
}

function InlineEdit({ value, onChange, className = '', tag: Tag = 'span', multiline, style: inlineStyle }: {
  value: string; onChange: (v: string) => void; className?: string; tag?: keyof JSX.IntrinsicElements; multiline?: boolean; style?: React.CSSProperties;
}) {
  const handleBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
    const newValue = e.currentTarget.textContent || '';
    if (newValue !== value) onChange(newValue);
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }, [multiline]);

  return React.createElement(Tag, {
    contentEditable: true,
    suppressContentEditableWarning: true,
    className: `cv-inline-edit ${className}`,
    style: inlineStyle,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    children: value,
  });
}

interface RendererProps {
  section: CVSection;
  isPreview?: boolean;
  template: Template;
}

function PersonalInfoRenderer({ section, isPreview, template }: RendererProps) {
  const { updateSectionContent } = useCV();
  const c = section.content as PersonalInfoContent;
  const hs = getHeaderStyle(template);

  const update = (field: keyof PersonalInfoContent, value: string) => {
    updateSectionContent(section.id, { ...c, [field]: value });
  };

  if (isPreview) {
    return (
      <header className="text-center mb-6 pb-4" style={hs.wrapper}>
        <h1 className="text-2xl font-bold mb-1" style={hs.name}>{c.fullName}</h1>
        <p className="text-base mb-1" style={hs.subtitle}>{c.jobTitle}</p>
        <p className="text-sm" style={hs.contact}>{[c.email, c.phone, c.location].filter(Boolean).join(' | ')}</p>
        {(c.linkedin || c.website) && <p className="text-sm" style={hs.contact}>{[c.linkedin, c.website].filter(Boolean).join(' | ')}</p>}
      </header>
    );
  }

  return (
    <header className="text-center mb-6 pb-4" style={hs.wrapper}>
      <InlineEdit tag="h1" value={c.fullName} onChange={v => update('fullName', v)} className="text-2xl font-bold mb-1 block" style={hs.name} />
      <InlineEdit tag="p" value={c.jobTitle} onChange={v => update('jobTitle', v)} className="text-base mb-1 block" style={hs.subtitle} />
      <InlineEdit tag="p" value={[c.email, c.phone, c.location].filter(Boolean).join(' | ')} onChange={v => {
        const parts = v.split('|').map(s => s.trim());
        updateSectionContent(section.id, { ...c, email: parts[0] || '', phone: parts[1] || '', location: parts[2] || '' });
      }} className="text-sm block" style={hs.contact} />
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
      {isPreview ? (
        <p className="text-sm leading-relaxed" style={{ color: textColor }}>{c.text}</p>
      ) : (
        <InlineEdit tag="p" value={c.text} onChange={v => updateSectionContent(section.id, { text: v })} className="text-sm leading-relaxed block" style={{ color: textColor }} multiline />
      )}
    </section>
  );
}

function ExperienceRenderer({ section, isPreview, template }: RendererProps) {
  const { updateSectionContent } = useCV();
  const c = section.content as ExperienceContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  const updateItem = (itemId: string, updates: Partial<ExperienceItem>) => {
    updateSectionContent(section.id, {
      items: c.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
    });
  };

  const addItem = () => {
    updateSectionContent(section.id, {
      items: [...c.items, { id: uuid(), company: 'Company', role: 'Role', startDate: 'Start', endDate: 'End', bullets: ['Achievement'] }]
    });
  };

  const addBullet = (itemId: string) => {
    updateSectionContent(section.id, {
      items: c.items.map(item => item.id === itemId ? { ...item, bullets: [...item.bullets, 'New achievement'] } : item)
    });
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
                <InlineEdit tag="h3" value={`${item.role} — ${item.company}`} onChange={v => {
                  const [role, ...rest] = v.split('—').map(s => s.trim());
                  updateItem(item.id, { role: role || '', company: rest.join(' — ') || '' });
                }} className="text-sm font-semibold" style={{ color: textColor }} />
                <InlineEdit value={`${item.startDate} – ${item.endDate}`} onChange={v => {
                  const [s, ...rest] = v.split('–').map(s => s.trim());
                  updateItem(item.id, { startDate: s || '', endDate: rest.join(' – ') || '' });
                }} className="text-xs shrink-0" />
              </>
            )}
          </div>
          <ul className={`list-disc ml-5 space-y-0.5 ${template === 'minimal' ? 'list-none ml-0' : ''}`}>
            {item.bullets.map((bullet, bi) => (
              <li key={bi} className={`text-sm ${template === 'minimal' ? 'before:content-["–"] before:mr-2 before:text-muted-foreground' : ''}`} style={{ color: textColor }}>
                {isPreview ? bullet : (
                  <InlineEdit value={bullet} onChange={v => {
                    const bullets = [...item.bullets];
                    bullets[bi] = v;
                    updateItem(item.id, { bullets });
                  }} />
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

  const updateItem = (itemId: string, updates: Partial<EducationItem>) => {
    updateSectionContent(section.id, {
      items: c.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
    });
  };

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
                <InlineEdit tag="h3" value={`${item.degree} — ${item.institution}`} onChange={v => {
                  const [deg, ...rest] = v.split('—').map(s => s.trim());
                  updateItem(item.id, { degree: deg || '', institution: rest.join(' — ') || '' });
                }} className="text-sm font-semibold" style={{ color: textColor }} />
                <InlineEdit value={`${item.startDate} – ${item.endDate}`} onChange={v => {
                  const [s, ...rest] = v.split('–').map(s => s.trim());
                  updateItem(item.id, { startDate: s || '', endDate: rest.join(' – ') || '' });
                }} className="text-xs shrink-0" />
              </>
            )}
          </div>
          {item.details && <p className="text-sm" style={{ color: '#555' }}>{item.details}</p>}
        </div>
      ))}
    </section>
  );
}

function SkillsRenderer({ section, isPreview, template }: RendererProps) {
  const { updateSectionContent } = useCV();
  const c = section.content as SkillsContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  return (
    <section className="mb-5">
      <h2 className={headingStyle.className} style={headingStyle.style}>{section.title}</h2>
      {c.categories.map(cat => (
        <p key={cat.id} className="text-sm mb-1" style={{ color: textColor }}>
          <strong>{cat.name}:</strong>{' '}
          {isPreview ? cat.skills.join(', ') : (
            <InlineEdit value={cat.skills.join(', ')} onChange={v => {
              updateSectionContent(section.id, {
                categories: c.categories.map(cc => cc.id === cat.id ? { ...cc, skills: v.split(',').map(s => s.trim()).filter(Boolean) } : cc)
              });
            }} />
          )}
        </p>
      ))}
    </section>
  );
}

function ProjectsRenderer({ section, isPreview, template }: RendererProps) {
  const c = section.content as ProjectsContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  return (
    <section className="mb-5">
      <h2 className={headingStyle.className} style={headingStyle.style}>{section.title}</h2>
      {c.items.map(item => (
        <div key={item.id} className="mb-3">
          <h3 className="text-sm font-semibold" style={{ color: textColor }}>{item.name}</h3>
          <p className="text-sm" style={{ color: textColor }}>{item.description}</p>
          <p className="text-sm italic" style={{ color: '#555' }}>{item.technologies}</p>
        </div>
      ))}
    </section>
  );
}

function CertificationsRenderer({ section, isPreview, template }: RendererProps) {
  const c = section.content as CertificationsContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  return (
    <section className="mb-5">
      <h2 className={headingStyle.className} style={headingStyle.style}>{section.title}</h2>
      <ul className={`list-disc ml-5 ${template === 'minimal' ? 'list-none ml-0' : ''}`}>
        {c.items.map(item => (
          <li key={item.id} className="text-sm" style={{ color: textColor }}>
            {item.name} — {item.issuer} ({item.date})
          </li>
        ))}
      </ul>
    </section>
  );
}

function LanguagesRenderer({ section, isPreview, template }: RendererProps) {
  const c = section.content as LanguagesContent;
  const headingStyle = getHeadingStyle(template);
  const textColor = getBodyTextColor(template);

  return (
    <section className="mb-5">
      <h2 className={headingStyle.className} style={headingStyle.style}>{section.title}</h2>
      <ul className={`list-disc ml-5 ${template === 'minimal' ? 'list-none ml-0' : ''}`}>
        {c.items.map(item => (
          <li key={item.id} className="text-sm" style={{ color: textColor }}>
            {item.language} — {item.proficiency}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SpacerRenderer({ section }: { section: CVSection }) {
  const c = section.content as SpacerContent;
  return <div style={{ height: c.height }} />;
}
