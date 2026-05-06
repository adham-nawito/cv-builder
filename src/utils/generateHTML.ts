import type { CVData, PersonalInfoContent, SummaryContent, ExperienceContent, EducationContent, SkillsContent, ProjectsContent, CertificationsContent, LanguagesContent, SpacerContent } from '@/types/cv';

export function generateHTML(cv: CVData): string {
  const sections = cv.sections.map(section => {
    switch (section.type) {
      case 'personal-info': {
        const c = section.content as PersonalInfoContent;
        return `    <header>
      <h1>${esc(c.fullName)}</h1>
      <p>${esc(c.jobTitle)}</p>
      <p>${[c.email, c.phone, c.location].filter(Boolean).map(esc).join(' | ')}</p>
      ${c.linkedin ? `<p>${esc(c.linkedin)}${c.website ? ' | ' + esc(c.website) : ''}</p>` : ''}
    </header>`;
      }
      case 'summary': {
        const c = section.content as SummaryContent;
        return `    <section>
      <h2>${esc(section.title)}</h2>
      <p>${esc(c.text)}</p>
    </section>`;
      }
      case 'experience': {
        const c = section.content as ExperienceContent;
        const items = c.items.map(item => `      <div>
        <h3>${esc(item.role)} — ${esc(item.company)}</h3>
        <p>${esc(item.startDate)} – ${esc(item.endDate)}</p>
        <ul>
${item.bullets.map(b => `          <li>${esc(b)}</li>`).join('\n')}
        </ul>
      </div>`).join('\n');
        return `    <section>
      <h2>${esc(section.title)}</h2>
${items}
    </section>`;
      }
      case 'education': {
        const c = section.content as EducationContent;
        const items = c.items.map(item => `      <div>
        <h3>${esc(item.degree)} — ${esc(item.institution)}</h3>
        <p>${esc(item.startDate)} – ${esc(item.endDate)}</p>
        ${item.details ? `<p>${esc(item.details)}</p>` : ''}
      </div>`).join('\n');
        return `    <section>
      <h2>${esc(section.title)}</h2>
${items}
    </section>`;
      }
      case 'skills': {
        const c = section.content as SkillsContent;
        const cats = c.categories.map(cat =>
          `      <p><strong>${esc(cat.name)}:</strong> ${cat.skills.map(esc).join(', ')}</p>`
        ).join('\n');
        return `    <section>
      <h2>${esc(section.title)}</h2>
${cats}
    </section>`;
      }
      case 'projects': {
        const c = section.content as ProjectsContent;
        const items = c.items.map(item => `      <div>
        <h3>${esc(item.name)}</h3>
        <p>${esc(item.description)}</p>
        <p><em>${esc(item.technologies)}</em></p>
      </div>`).join('\n');
        return `    <section>
      <h2>${esc(section.title)}</h2>
${items}
    </section>`;
      }
      case 'certifications': {
        const c = section.content as CertificationsContent;
        const items = c.items.map(item =>
          `      <li>${esc(item.name)} — ${esc(item.issuer)} (${esc(item.date)})</li>`
        ).join('\n');
        return `    <section>
      <h2>${esc(section.title)}</h2>
      <ul>
${items}
      </ul>
    </section>`;
      }
      case 'languages': {
        const c = section.content as LanguagesContent;
        const items = c.items.map(item =>
          `      <li>${esc(item.language)} — ${esc(item.proficiency)}</li>`
        ).join('\n');
        return `    <section>
      <h2>${esc(section.title)}</h2>
      <ul>
${items}
      </ul>
    </section>`;
      }
      case 'spacer': {
        const c = section.content as SpacerContent;
        return `    <div style="height: ${c.height}px;"></div>`;
      }
      default:
        return '';
    }
  }).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(cv.sections.find(s => s.type === 'personal-info') ? ((cv.sections.find(s => s.type === 'personal-info')!.content as PersonalInfoContent).fullName + ' - CV') : 'CV')}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 28px; margin: 0 0 4px; }
    h2 { font-size: 18px; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin-top: 24px; color: #1e40af; }
    h3 { font-size: 15px; margin: 12px 0 4px; }
    p { margin: 4px 0; }
    ul { margin: 4px 0; padding-left: 20px; }
    li { margin: 2px 0; }
    header p { color: #555; }
  </style>
</head>
<body>
${sections}
</body>
</html>`;
}

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
