import { v4 as uuid } from 'uuid';
import type { CVData } from '@/types/cv';

export function createSampleCV(): CVData {
  return {
    id: uuid(),
    name: 'My CV',
    template: 'classic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: uuid(),
        type: 'personal-info',
        title: 'Personal Info',
        content: {
          fullName: 'Alex Johnson',
          jobTitle: 'Senior Software Engineer',
          email: 'alex.johnson@email.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          linkedin: 'linkedin.com/in/alexjohnson',
          website: 'alexjohnson.dev',
        },
      },
      {
        id: uuid(),
        type: 'summary',
        title: 'Professional Summary',
        content: {
          text: 'Results-driven software engineer with 8+ years of experience building scalable web applications. Proficient in React, TypeScript, Node.js, and cloud infrastructure. Passionate about clean code, mentoring teams, and delivering impactful products.',
        },
      },
      {
        id: uuid(),
        type: 'experience',
        title: 'Experience',
        content: {
          items: [
            {
              id: uuid(),
              company: 'TechCorp Inc.',
              role: 'Senior Software Engineer',
              startDate: 'Jan 2021',
              endDate: 'Present',
              bullets: [
                'Led a team of 5 engineers to redesign the core platform, improving performance by 40%',
                'Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes',
                'Mentored junior developers through code reviews and pair programming sessions',
              ],
            },
            {
              id: uuid(),
              company: 'StartupXYZ',
              role: 'Full Stack Developer',
              startDate: 'Mar 2018',
              endDate: 'Dec 2020',
              bullets: [
                'Built responsive web applications serving 100K+ monthly active users',
                'Designed and implemented RESTful APIs with Node.js and PostgreSQL',
                'Reduced page load times by 60% through code splitting and lazy loading',
              ],
            },
          ],
        },
      },
      {
        id: uuid(),
        type: 'education',
        title: 'Education',
        content: {
          items: [
            {
              id: uuid(),
              institution: 'University of California, Berkeley',
              degree: 'B.S. Computer Science',
              startDate: '2014',
              endDate: '2018',
              details: 'GPA: 3.8/4.0 • Dean\'s List',
            },
          ],
        },
      },
      {
        id: uuid(),
        type: 'skills',
        title: 'Skills',
        content: {
          categories: [
            { id: uuid(), name: 'Languages', skills: ['TypeScript', 'JavaScript', 'Python', 'Go'] },
            { id: uuid(), name: 'Frameworks', skills: ['React', 'Next.js', 'Node.js', 'Express'] },
            { id: uuid(), name: 'Tools', skills: ['Docker', 'AWS', 'Git', 'PostgreSQL', 'Redis'] },
          ],
        },
      },
      {
        id: uuid(),
        type: 'languages',
        title: 'Languages',
        content: {
          items: [
            { id: uuid(), language: 'English', proficiency: 'Native' },
            { id: uuid(), language: 'Spanish', proficiency: 'Professional' },
          ],
        },
      },
    ],
  };
}

export function createEmptyCV(): CVData {
  return {
    id: uuid(),
    name: 'Untitled CV',
    template: 'classic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [],
  };
}
