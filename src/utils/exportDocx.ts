import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  LevelFormat, TabStopType, TabStopPosition, BorderStyle
} from 'docx';
import { saveAs } from 'file-saver';
import type {
  CVData, PersonalInfoContent, SummaryContent, ExperienceContent,
  EducationContent, SkillsContent, ProjectsContent, CertificationsContent,
  LanguagesContent
} from '@/types/cv';

export async function exportDOCX(cv: CVData, filename: string = 'cv.docx') {
  const children: Paragraph[] = [];

  for (const section of cv.sections) {
    switch (section.type) {
      case 'personal-info': {
        const c = section.content as PersonalInfoContent;
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [new TextRun({ text: c.fullName, bold: true, size: 32, font: 'Arial' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [new TextRun({ text: c.jobTitle, size: 24, font: 'Arial', color: '444444' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new TextRun({ text: [c.email, c.phone, c.location].filter(Boolean).join(' | '), size: 20, font: 'Arial', color: '666666' })],
          }),
        );
        if (c.linkedin || c.website) {
          children.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: [c.linkedin, c.website].filter(Boolean).join(' | '), size: 20, font: 'Arial', color: '666666' })],
          }));
        }
        break;
      }

      case 'summary': {
        const c = section.content as SummaryContent;
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563EB', space: 4 } },
            children: [new TextRun({ text: section.title.toUpperCase(), bold: true, size: 22, font: 'Arial', color: '1E40AF' })],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [new TextRun({ text: c.text, size: 22, font: 'Arial' })],
          }),
        );
        break;
      }

      case 'experience': {
        const c = section.content as ExperienceContent;
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563EB', space: 4 } },
          children: [new TextRun({ text: section.title.toUpperCase(), bold: true, size: 22, font: 'Arial', color: '1E40AF' })],
        }));
        for (const item of c.items) {
          children.push(
            new Paragraph({
              spacing: { before: 120 },
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
              children: [
                new TextRun({ text: `${item.role} — ${item.company}`, bold: true, size: 22, font: 'Arial' }),
                new TextRun({ text: `\t${item.startDate} – ${item.endDate}`, size: 20, font: 'Arial', color: '666666' }),
              ],
            }),
          );
          for (const bullet of item.bullets) {
            children.push(new Paragraph({
              numbering: { reference: 'bullets', level: 0 },
              spacing: { after: 40 },
              children: [new TextRun({ text: bullet, size: 22, font: 'Arial' })],
            }));
          }
        }
        break;
      }

      case 'education': {
        const c = section.content as EducationContent;
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563EB', space: 4 } },
          children: [new TextRun({ text: section.title.toUpperCase(), bold: true, size: 22, font: 'Arial', color: '1E40AF' })],
        }));
        for (const item of c.items) {
          children.push(new Paragraph({
            spacing: { before: 120 },
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: `${item.degree} — ${item.institution}`, bold: true, size: 22, font: 'Arial' }),
              new TextRun({ text: `\t${item.startDate} – ${item.endDate}`, size: 20, font: 'Arial', color: '666666' }),
            ],
          }));
          if (item.details) {
            children.push(new Paragraph({
              spacing: { after: 40 },
              children: [new TextRun({ text: item.details, size: 22, font: 'Arial', color: '555555' })],
            }));
          }
        }
        break;
      }

      case 'skills': {
        const c = section.content as SkillsContent;
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563EB', space: 4 } },
          children: [new TextRun({ text: section.title.toUpperCase(), bold: true, size: 22, font: 'Arial', color: '1E40AF' })],
        }));
        for (const cat of c.categories) {
          children.push(new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: `${cat.name}: `, bold: true, size: 22, font: 'Arial' }),
              new TextRun({ text: cat.skills.join(', '), size: 22, font: 'Arial' }),
            ],
          }));
        }
        break;
      }

      case 'projects': {
        const c = section.content as ProjectsContent;
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563EB', space: 4 } },
          children: [new TextRun({ text: section.title.toUpperCase(), bold: true, size: 22, font: 'Arial', color: '1E40AF' })],
        }));
        for (const item of c.items) {
          children.push(
            new Paragraph({ spacing: { before: 100 }, children: [new TextRun({ text: item.name, bold: true, size: 22, font: 'Arial' })] }),
            new Paragraph({ children: [new TextRun({ text: item.description, size: 22, font: 'Arial' })] }),
            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: item.technologies, italics: true, size: 22, font: 'Arial', color: '555555' })] }),
          );
        }
        break;
      }

      case 'certifications': {
        const c = section.content as CertificationsContent;
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563EB', space: 4 } },
          children: [new TextRun({ text: section.title.toUpperCase(), bold: true, size: 22, font: 'Arial', color: '1E40AF' })],
        }));
        for (const item of c.items) {
          children.push(new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            children: [new TextRun({ text: `${item.name} — ${item.issuer} (${item.date})`, size: 22, font: 'Arial' })],
          }));
        }
        break;
      }

      case 'languages': {
        const c = section.content as LanguagesContent;
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563EB', space: 4 } },
          children: [new TextRun({ text: section.title.toUpperCase(), bold: true, size: 22, font: 'Arial', color: '1E40AF' })],
        }));
        for (const item of c.items) {
          children.push(new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            children: [new TextRun({ text: `${item.language} — ${item.proficiency}`, size: 22, font: 'Arial' })],
          }));
        }
        break;
      }

      case 'spacer':
        children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
        break;
    }
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, filename);
}
