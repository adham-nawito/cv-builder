import type { CVData, PersonalInfoContent, SummaryContent, ExperienceContent, SkillsContent, EducationContent } from '@/types/cv';

export interface ATSTip {
  id: string;
  category: 'critical' | 'warning' | 'suggestion';
  message: string;
  points: number;
}

export interface ATSScore {
  total: number;
  maxScore: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  tips: ATSTip[];
  breakdown: { category: string; score: number; max: number }[];
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

  return { total, maxScore, percentage, grade, tips: tips.filter(t => t.points > 0), breakdown };
}
