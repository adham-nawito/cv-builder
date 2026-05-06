import React, { createContext, useContext, useCallback, useReducer, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import type { CVData, CVSection, SectionType, SectionContent } from '@/types/cv';
import { createSampleCV } from '@/utils/sampleData';

interface CVState {
  cv: CVData;
  selectedSectionId: string | null;
  history: CVData[];
  historyIndex: number;
  isDarkMode: boolean;
  isPreviewMode: boolean;
}

type Action =
  | { type: 'SET_CV'; payload: CVData }
  | { type: 'ADD_SECTION'; payload: { sectionType: SectionType; index?: number } }
  | { type: 'UPDATE_SECTION'; payload: { id: string; updates: Partial<CVSection> } }
  | { type: 'UPDATE_SECTION_CONTENT'; payload: { id: string; content: SectionContent } }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'DUPLICATE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: CVSection[] }
  | { type: 'SELECT_SECTION'; payload: string | null }
  | { type: 'TOGGLE_LOCK'; payload: string }
  | { type: 'SET_TEMPLATE'; payload: CVData['template'] }
  | { type: 'IMPORT_CV'; payload: CVData }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'NEW_CV' }
  | { type: 'LOAD_CV'; payload: CVData };

function getDefaultContent(type: SectionType): SectionContent {
  switch (type) {
    case 'personal-info':
      return { fullName: 'Your Name', jobTitle: 'Your Title', email: 'email@example.com', phone: '', location: '' };
    case 'summary':
      return { text: 'Write your professional summary here...' };
    case 'experience':
      return { items: [{ id: uuid(), company: 'Company', role: 'Role', startDate: 'Start', endDate: 'End', bullets: ['Describe your achievement'] }] };
    case 'education':
      return { items: [{ id: uuid(), institution: 'University', degree: 'Degree', startDate: 'Start', endDate: 'End' }] };
    case 'skills':
      return { categories: [{ id: uuid(), name: 'Category', skills: ['Skill 1', 'Skill 2'] }] };
    case 'projects':
      return { items: [{ id: uuid(), name: 'Project Name', description: 'Description', technologies: 'Tech stack' }] };
    case 'certifications':
      return { items: [{ id: uuid(), name: 'Certification', issuer: 'Issuer', date: 'Date' }] };
    case 'languages':
      return { items: [{ id: uuid(), language: 'Language', proficiency: 'Proficiency' }] };
    case 'custom':
      return { html: '<p>Custom content here</p>' };
    case 'spacer':
      return { height: 24 };
  }
}

const SECTION_TITLES: Record<SectionType, string> = {
  'personal-info': 'Personal Info',
  'summary': 'Professional Summary',
  'experience': 'Experience',
  'education': 'Education',
  'skills': 'Skills',
  'projects': 'Projects',
  'certifications': 'Certifications',
  'languages': 'Languages',
  'custom': 'Custom Section',
  'spacer': 'Spacer',
};

function pushHistory(state: CVState): CVState {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.cv)));
  return { ...state, history: newHistory.slice(-50), historyIndex: newHistory.length - 1 };
}

function reducer(state: CVState, action: Action): CVState {
  switch (action.type) {
    case 'SET_CV':
      return { ...state, cv: action.payload };

    case 'ADD_SECTION': {
      const { sectionType, index } = action.payload;
      const newSection: CVSection = {
        id: uuid(),
        type: sectionType,
        title: SECTION_TITLES[sectionType],
        content: getDefaultContent(sectionType),
      };
      const sections = [...state.cv.sections];
      if (index !== undefined) {
        sections.splice(index, 0, newSection);
      } else {
        sections.push(newSection);
      }
      const newState = pushHistory(state);
      return { ...newState, cv: { ...newState.cv, sections, updatedAt: new Date().toISOString() }, selectedSectionId: newSection.id };
    }

    case 'UPDATE_SECTION': {
      const sections = state.cv.sections.map(s =>
        s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
      );
      const newState = pushHistory(state);
      return { ...newState, cv: { ...newState.cv, sections, updatedAt: new Date().toISOString() } };
    }

    case 'UPDATE_SECTION_CONTENT': {
      const sections = state.cv.sections.map(s =>
        s.id === action.payload.id ? { ...s, content: action.payload.content } : s
      );
      return { ...state, cv: { ...state.cv, sections, updatedAt: new Date().toISOString() } };
    }

    case 'DELETE_SECTION': {
      const newState = pushHistory(state);
      const sections = newState.cv.sections.filter(s => s.id !== action.payload);
      return { ...newState, cv: { ...newState.cv, sections, updatedAt: new Date().toISOString() }, selectedSectionId: null };
    }

    case 'DUPLICATE_SECTION': {
      const idx = state.cv.sections.findIndex(s => s.id === action.payload);
      if (idx === -1) return state;
      const original = state.cv.sections[idx];
      const duplicate: CVSection = { ...JSON.parse(JSON.stringify(original)), id: uuid() };
      const sections = [...state.cv.sections];
      sections.splice(idx + 1, 0, duplicate);
      const newState = pushHistory(state);
      return { ...newState, cv: { ...newState.cv, sections, updatedAt: new Date().toISOString() }, selectedSectionId: duplicate.id };
    }

    case 'REORDER_SECTIONS': {
      const newState = pushHistory(state);
      return { ...newState, cv: { ...newState.cv, sections: action.payload, updatedAt: new Date().toISOString() } };
    }

    case 'SELECT_SECTION':
      return { ...state, selectedSectionId: action.payload };

    case 'TOGGLE_LOCK': {
      const sections = state.cv.sections.map(s =>
        s.id === action.payload ? { ...s, locked: !s.locked } : s
      );
      return { ...state, cv: { ...state.cv, sections } };
    }

    case 'SET_TEMPLATE':
      return { ...state, cv: { ...state.cv, template: action.payload } };

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return { ...state, cv: JSON.parse(JSON.stringify(state.history[newIndex])), historyIndex: newIndex };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return { ...state, cv: JSON.parse(JSON.stringify(state.history[newIndex])), historyIndex: newIndex };
    }

    case 'TOGGLE_DARK_MODE':
      return { ...state, isDarkMode: !state.isDarkMode };

    case 'TOGGLE_PREVIEW':
      return { ...state, isPreviewMode: !state.isPreviewMode, selectedSectionId: null };

    case 'NEW_CV': {
      const cv = createSampleCV();
      return { ...state, cv, selectedSectionId: null, history: [cv], historyIndex: 0 };
    }

    case 'LOAD_CV':
      return { ...state, cv: action.payload, selectedSectionId: null, history: [action.payload], historyIndex: 0 };

    case 'IMPORT_CV':
      return { ...state, cv: action.payload, selectedSectionId: null, history: [action.payload], historyIndex: 0 };

    default:
      return state;
  }
}

interface CVContextValue {
  state: CVState;
  dispatch: React.Dispatch<Action>;
  addSection: (type: SectionType) => void;
  updateSectionContent: (id: string, content: SectionContent) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  selectSection: (id: string | null) => void;
  selectedSection: CVSection | null;
}

const CVContext = createContext<CVContextValue | null>(null);

export function CVProvider({ children }: { children: React.ReactNode }) {
  const loadedCV = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('cvforge_current');
      if (saved) return JSON.parse(saved) as CVData;
    } catch {}
    return createSampleCV();
  }, []);

  const [state, dispatch] = useReducer(reducer, {
    cv: loadedCV,
    selectedSectionId: null,
    history: [loadedCV],
    historyIndex: 0,
    isDarkMode: false,
    isPreviewMode: false,
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('cvforge_current', JSON.stringify(state.cv));
  }, [state.cv]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDarkMode);
  }, [state.isDarkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? 'REDO' : 'UNDO' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const addSection = useCallback((type: SectionType) => {
    dispatch({ type: 'ADD_SECTION', payload: { sectionType: type } });
  }, []);

  const updateSectionContent = useCallback((id: string, content: SectionContent) => {
    dispatch({ type: 'UPDATE_SECTION_CONTENT', payload: { id, content } });
  }, []);

  const deleteSection = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SECTION', payload: id });
  }, []);

  const duplicateSection = useCallback((id: string) => {
    dispatch({ type: 'DUPLICATE_SECTION', payload: id });
  }, []);

  const selectSection = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_SECTION', payload: id });
  }, []);

  const selectedSection = state.cv.sections.find(s => s.id === state.selectedSectionId) || null;

  return (
    <CVContext.Provider value={{ state, dispatch, addSection, updateSectionContent, deleteSection, duplicateSection, selectSection, selectedSection }}>
      {children}
    </CVContext.Provider>
  );
}

export function useCV() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error('useCV must be used within CVProvider');
  return ctx;
}
