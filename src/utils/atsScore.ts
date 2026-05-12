import type { CVData, PersonalInfoContent, SummaryContent, ExperienceContent, SkillsContent, EducationContent, LanguagesContent } from '@/types/cv';

export interface ATSTip {
  id: string;
  category: 'critical' | 'warning' | 'suggestion';
  message: string;
  points: number;
}

/** Maps section type → severity of issues found, used for canvas highlighting */
export type SectionIssueMap = Record<string, 'critical' | 'warning' | null>;

export interface ATSScore {
  total: number;
  maxScore: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  tips: ATSTip[];
  breakdown: { category: string; score: number; max: number }[];
  /** Keyed by section.type — worst severity found for that section */
  sectionIssues: SectionIssueMap;
}

const POWER_VERBS = [
  'achieved', 'built', 'created', 'delivered', 'designed', 'developed', 'drove',
  'established', 'generated', 'implemented', 'improved', 'increased', 'launched',
  'led', 'managed', 'optimized', 'orchestrated', 'produced', 'reduced', 'resolved',
  'revamped', 'scaled', 'spearheaded', 'streamlined', 'supervised', 'transformed',
];

const METRICS_PATTERN = /\d+[%+x]|\$[\d,]+|\d+\s*(users|customers|clients|projects|people|engineers|developers|team)/i;

export function calculateATSScore(cv: CVData): ATSScore {
  const tips: ATSTip[] = [];
  const breakdown: { category: string; score: number; max: number }[] = [];
  let tipId = 0;

  // --- Contact Info (15 pts) ---
  let contactScore = 0;
  const personalSection = cv.sections.find(s => s.type === 'personal-info');
  if (personalSection) {
    const info = personalSection.content as PersonalInfoContent;
    if (info.fullName && info.fullName !== 'Your Name') contactScore += 3;
    else tips.push({ id: `t${tipId++}`, category: 'critical', message: 'Add your full name', points: 3 });

    if (info.email && info.email.includes('@') && info.email !== 'email@example.com') contactScore += 3;
    else tips.push({ id: `t${tipId++}`, category: 'critical', message: 'Add a valid email address', points: 3 });

    if (info.phone && info.phone.length > 5) contactScore += 3;
    else tips.push({ id: `t${tipId++}`, category: 'warning', message: 'Include a phone number', points: 3 });

    if (info.location) contactScore += 3;
    else tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Add your location for local job matching', points: 3 });

    if (info.linkedin) contactScore += 3;
    else tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Add your LinkedIn profile URL', points: 3 });
  } else {
    tips.push({ id: `t${tipId++}`, category: 'critical', message: 'Add a Personal Info section with contact details', points: 15 });
  }
  breakdown.push({ category: 'Contact Info', score: contactScore, max: 15 });

  // --- Summary (15 pts) ---
  let summaryScore = 0;
  const summarySection = cv.sections.find(s => s.type === 'summary');
  if (summarySection) {
    const text = (summarySection.content as SummaryContent).text || '';
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (wordCount >= 30 && wordCount <= 80) {
      summaryScore += 8;
    } else if (wordCount > 0) {
      summaryScore += 4;
      if (wordCount < 30) tips.push({ id: `t${tipId++}`, category: 'warning', message: 'Summary is too short — aim for 30-80 words', points: 4 });
      if (wordCount > 80) tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Summary is lengthy — keep it under 80 words for ATS', points: 4 });
    } else {
      tips.push({ id: `t${tipId++}`, category: 'warning', message: 'Write a professional summary', points: 8 });
    }

    if (/\d/.test(text)) summaryScore += 4;
    else tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Add quantified achievements to your summary (e.g., "8+ years")', points: 4 });

    if (text && !text.startsWith('Write your')) summaryScore += 3;
  } else {
    tips.push({ id: `t${tipId++}`, category: 'warning', message: 'Add a Professional Summary section', points: 15 });
  }
  breakdown.push({ category: 'Summary', score: summaryScore, max: 15 });

  // --- Experience (30 pts) ---
  let expScore = 0;
  const expSection = cv.sections.find(s => s.type === 'experience');
  if (expSection) {
    const items = (expSection.content as ExperienceContent).items || [];
    if (items.length >= 2) expScore += 6;
    else if (items.length === 1) { expScore += 3; tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Add at least 2 work experiences', points: 3 }); }
    else tips.push({ id: `t${tipId++}`, category: 'critical', message: 'Add work experience entries', points: 6 });

    let totalBullets = 0;
    let powerVerbCount = 0;
    let metricsCount = 0;

    items.forEach(item => {
      totalBullets += item.bullets.length;
      item.bullets.forEach(b => {
        const firstWord = b.trim().split(/\s/)[0]?.toLowerCase();
        if (POWER_VERBS.includes(firstWord)) powerVerbCount++;
        if (METRICS_PATTERN.test(b)) metricsCount++;
      });
    });

    if (totalBullets >= 6) expScore += 6;
    else if (totalBullets >= 3) { expScore += 3; tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Add more bullet points (aim for 3-5 per role)', points: 3 }); }
    else tips.push({ id: `t${tipId++}`, category: 'warning', message: 'Add detailed bullet points to each experience', points: 6 });

    if (powerVerbCount >= 3) expScore += 6;
    else tips.push({ id: `t${tipId++}`, category: 'warning', message: `Start bullets with action verbs (e.g., Led, Built, Improved). Found ${powerVerbCount} so far.`, points: 6 - powerVerbCount * 2 });

    if (metricsCount >= 2) expScore += 6;
    else tips.push({ id: `t${tipId++}`, category: 'warning', message: 'Quantify achievements with numbers, percentages, or dollar amounts', points: 6 - metricsCount * 3 });

    const hasDates = items.every(i => i.startDate && i.endDate);
    if (hasDates) expScore += 6;
    else tips.push({ id: `t${tipId++}`, category: 'critical', message: 'Ensure all roles have start and end dates', points: 6 });
  } else {
    tips.push({ id: `t${tipId++}`, category: 'critical', message: 'Add an Experience section — critical for ATS', points: 30 });
  }
  breakdown.push({ category: 'Experience', score: expScore, max: 30 });

  // --- Education (10 pts) ---
  let eduScore = 0;
  const eduSection = cv.sections.find(s => s.type === 'education');
  if (eduSection) {
    const items = (eduSection.content as EducationContent).items || [];
    if (items.length > 0) {
      eduScore += 5;
      const hasDetails = items.some(i => i.degree && i.institution);
      if (hasDetails) eduScore += 5;
      else tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Include degree and institution for education', points: 5 });
    }
  } else {
    tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Add an Education section', points: 10 });
  }
  breakdown.push({ category: 'Education', score: eduScore, max: 10 });

  // --- Skills (15 pts) ---
  let skillScore = 0;
  const skillSection = cv.sections.find(s => s.type === 'skills');
  if (skillSection) {
    const cats = (skillSection.content as SkillsContent).categories || [];
    const totalSkills = cats.reduce((n, c) => n + c.skills.length, 0);
    if (totalSkills >= 8) skillScore += 8;
    else if (totalSkills >= 4) { skillScore += 4; tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Add more skills (aim for 8+)', points: 4 }); }
    else tips.push({ id: `t${tipId++}`, category: 'warning', message: 'Add more skills to improve keyword matching', points: 8 });

    if (cats.length >= 2) skillScore += 4;
    else tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Organize skills into categories', points: 4 });

    skillScore += 3; // base for having the section
  } else {
    tips.push({ id: `t${tipId++}`, category: 'warning', message: 'Add a Skills section for ATS keyword matching', points: 15 });
  }
  breakdown.push({ category: 'Skills', score: skillScore, max: 15 });

  // --- Languages (5 pts) ---
  let langScore = 0;
  const langSection = cv.sections.find(s => s.type === 'languages');
  if (langSection) {
    const items = (langSection.content as LanguagesContent).items || [];
    if (items.length >= 1 && items.some(i => i.language && i.proficiency)) {
      langScore += 5;
    } else {
      tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Add spoken languages with proficiency levels', points: 5 });
    }
  } else {
    tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Add a Languages section to stand out in multilingual roles', points: 5 });
  }
  breakdown.push({ category: 'Languages', score: langScore, max: 5 });

  // --- Structure & Formatting (15 pts) ---
  let structScore = 0;
  const sectionCount = cv.sections.length;
  if (sectionCount >= 4) structScore += 5;
  else tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'A well-structured CV should have at least 4 sections', points: 5 });

  const hasCustom = cv.sections.some(s => s.type === 'custom');
  if (!hasCustom) structScore += 5;
  else tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Custom HTML sections may not parse well in ATS systems', points: 5 });

  if (cv.template === 'classic' || cv.template === 'minimal') structScore += 5;
  else tips.push({ id: `t${tipId++}`, category: 'suggestion', message: 'Classic or Minimal templates are most ATS-friendly', points: 5 });

  breakdown.push({ category: 'Structure', score: structScore, max: 15 });

  // --- Totals ---
  const total = breakdown.reduce((s, b) => s + b.score, 0);
  const maxScore = breakdown.reduce((s, b) => s + b.max, 0);
  const percentage = Math.round((total / maxScore) * 100);
  const grade: ATSScore['grade'] =
    percentage >= 95 ? 'A+' : percentage >= 85 ? 'A' : percentage >= 70 ? 'B' : percentage >= 55 ? 'C' : percentage >= 40 ? 'D' : 'F';

  // --- Build section issue map (keyed by section type) ---
  // Walk the filtered tips and assign the worst severity per section type
  const sectionTypeForTip: Record<string, string> = {};
  const filteredTips = tips.filter(t => t.points > 0);

  // Map tip IDs back to section types by re-scoring to determine which tips
  // belong to which section. We use a heuristic: tips generated within each
  // scoring block share a section-type prefix derived from their order.
  // Simpler: re-derive from tip messages and the live tip list.
  const sectionIssues: SectionIssueMap = {};

  // personal-info
  const piSection = cv.sections.find(s => s.type === 'personal-info');
  if (piSection) {
    const piTips = filteredTips.filter(t =>
      ['Add your full name', 'Add a valid email', 'Include a phone', 'Add your location', 'Add your LinkedIn'].some(m => t.message.startsWith(m))
    );
    if (piTips.some(t => t.category === 'critical')) sectionIssues['personal-info'] = 'critical';
    else if (piTips.some(t => t.category === 'warning')) sectionIssues['personal-info'] = 'warning';
    else sectionIssues['personal-info'] = null;
  }

  const summaryIssues = filteredTips.filter(t =>
    ['Write a professional summary', 'Summary is too short', 'Summary is lengthy', 'Add quantified', 'Add a Professional Summary'].some(m => t.message.startsWith(m))
  );
  if (summaryIssues.some(t => t.category === 'critical')) sectionIssues['summary'] = 'critical';
  else if (summaryIssues.some(t => t.category === 'warning')) sectionIssues['summary'] = 'warning';
  else sectionIssues['summary'] = null;

  const expIssues = filteredTips.filter(t =>
    ['Add work experience', 'Add at least 2', 'Add more bullet', 'Add detailed bullet', 'Start bullets with action', 'Quantify achievements', 'Ensure all roles have'].some(m => t.message.startsWith(m))
  );
  if (expIssues.some(t => t.category === 'critical')) sectionIssues['experience'] = 'critical';
  else if (expIssues.some(t => t.category === 'warning')) sectionIssues['experience'] = 'warning';
  else sectionIssues['experience'] = null;

  const eduIssues = filteredTips.filter(t =>
    ['Add an Education', 'Include degree and institution'].some(m => t.message.startsWith(m))
  );
  if (eduIssues.some(t => t.category === 'critical')) sectionIssues['education'] = 'critical';
  else if (eduIssues.some(t => t.category === 'warning')) sectionIssues['education'] = 'warning';
  else sectionIssues['education'] = null;

  const skillIssues = filteredTips.filter(t =>
    ['Add more skills', 'Add a Skills', 'Organize skills'].some(m => t.message.startsWith(m))
  );
  if (skillIssues.some(t => t.category === 'critical')) sectionIssues['skills'] = 'critical';
  else if (skillIssues.some(t => t.category === 'warning')) sectionIssues['skills'] = 'warning';
  else sectionIssues['skills'] = null;

  const langIssues = filteredTips.filter(t =>
    ['Add spoken languages', 'Add a Languages section'].some(m => t.message.startsWith(m))
  );
  if (langIssues.some(t => t.category === 'critical')) sectionIssues['languages'] = 'critical';
  else if (langIssues.some(t => t.category === 'warning')) sectionIssues['languages'] = 'warning';
  else sectionIssues['languages'] = null;

  void sectionTypeForTip; // unused — kept for clarity

  return { total, maxScore, percentage, grade, tips: filteredTips, breakdown, sectionIssues };
}
