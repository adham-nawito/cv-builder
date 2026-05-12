import React, { createContext, useContext, useCallback, useReducer, useEffect, useRef, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { CVData, CVSection, SectionType, SectionContent } from '@/types/cv';
export type { CVSectionStyle } from '@/types/cv';
import { createSampleCV } from '@/utils/sampleData';
import { arrayMove } from '@dnd-kit/sortable';
import { saveCV as persistCV, saveSession } from '@/lib/storage';

// ---------------------------------------------------------------------------
// State & Action types
// ---------------------------------------------------------------------------

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
  | { type: 'MOVE_SECTION'; payload: { id: string; direction: 'up' | 'down' } }
  | { type: 'SELECT_SECTION'; payload: string | null }
  | { type: 'TOGGLE_LOCK'; payload: string }
  | { type: 'TOGGLE_VISIBILITY'; payload: string }
  | { type: 'SET_SECTION_STYLE'; payload: { id: string; style: import('@/types/cv').CVSectionStyle } }
  | { type: 'SET_TEMPLATE'; payload: CVData['template'] }
  | { type: 'IMPORT_CV'; payload: CVData }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'NEW_CV' }
  | { type: 'LOAD_CV'; payload: CVData };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  newHistory.push(structuredClone(state.cv));
  return { ...state, history: newHistory.slice(-50), historyIndex: newHistory.length - 1 };
}

function now() { return new Date().toISOString(); }

function applyMoveSection(state: CVState, id: string, direction: 'up' | 'down'): CVState {
  const idx = state.cv.sections.findIndex(s => s.id === id);
  if (idx === -1) return state;
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= state.cv.sections.length) return state;
  const next = pushHistory(state);
  return { ...next, cv: { ...next.cv, sections: arrayMove(next.cv.sections, idx, targetIdx), updatedAt: now() } };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

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
      const next = pushHistory(state);
      return { ...next, cv: { ...next.cv, sections, updatedAt: now() }, selectedSectionId: newSection.id };
    }

    case 'UPDATE_SECTION': {
      const sections = state.cv.sections.map(s =>
        s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
      );
      const next = pushHistory(state);
      return { ...next, cv: { ...next.cv, sections, updatedAt: now() } };
    }

    case 'UPDATE_SECTION_CONTENT': {
      const sections = state.cv.sections.map(s =>
        s.id === action.payload.id ? { ...s, content: action.payload.content } : s
      );
      return { ...state, cv: { ...state.cv, sections, updatedAt: now() } };
    }

    case 'DELETE_SECTION': {
      const next = pushHistory(state);
      const sections = next.cv.sections.filter(s => s.id !== action.payload);
      return { ...next, cv: { ...next.cv, sections, updatedAt: now() }, selectedSectionId: null };
    }

    case 'DUPLICATE_SECTION': {
      const idx = state.cv.sections.findIndex(s => s.id === action.payload);
      if (idx === -1) return state;
      const duplicate: CVSection = { ...structuredClone(state.cv.sections[idx]), id: uuid() };
      const sections = [...state.cv.sections];
      sections.splice(idx + 1, 0, duplicate);
      const next = pushHistory(state);
      return { ...next, cv: { ...next.cv, sections, updatedAt: now() }, selectedSectionId: duplicate.id };
    }

    case 'REORDER_SECTIONS': {
      const next = pushHistory(state);
      return { ...next, cv: { ...next.cv, sections: action.payload, updatedAt: now() } };
    }

    case 'MOVE_SECTION':
      return applyMoveSection(state, action.payload.id, action.payload.direction);

    case 'SELECT_SECTION':
      return { ...state, selectedSectionId: action.payload };

    case 'TOGGLE_LOCK': {
      const sections = state.cv.sections.map(s =>
        s.id === action.payload ? { ...s, locked: !s.locked } : s
      );
      return { ...state, cv: { ...state.cv, sections } };
    }

    case 'TOGGLE_VISIBILITY': {
      const sections = state.cv.sections.map(s =>
        s.id === action.payload ? { ...s, hidden: !s.hidden } : s
      );
      return { ...state, cv: { ...state.cv, sections } };
    }

    case 'SET_SECTION_STYLE': {
      const sections = state.cv.sections.map(s =>
        s.id === action.payload.id ? { ...s, style: { ...s.style, ...action.payload.style } } : s
      );
      return { ...state, cv: { ...state.cv, sections } };
    }

    case 'SET_TEMPLATE':
      return { ...state, cv: { ...state.cv, template: action.payload } };

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return { ...state, cv: structuredClone(state.history[newIndex]), historyIndex: newIndex };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return { ...state, cv: structuredClone(state.history[newIndex]), historyIndex: newIndex };
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
    case 'IMPORT_CV':
      return { ...state, cv: action.payload, selectedSectionId: null, history: [action.payload], historyIndex: 0 };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CVContextValue {
  state: CVState;
  dispatch: React.Dispatch<Action>;
  addSection: (type: SectionType) => void;
  updateSectionContent: (id: string, content: SectionContent) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  selectSection: (id: string | null) => void;
  selectedSection: CVSection | null;
  setSectionStyle: (id: string, style: import('@/types/cv').CVSectionStyle) => void;
  isDirty: boolean;
  markSaved: () => void;
}

const CVContext = createContext<CVContextValue | null>(null);

export function CVProvider({ children }: { readonly children: React.ReactNode }) {
  const loadedCV = useMemo(() => {
    try {
      const saved = localStorage.getItem('cvforge_current');
      if (saved) return JSON.parse(saved) as CVData;
    } catch { /* ignore */ }
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

  // Keep a ref to the current selectedSectionId so the keyboard handler
  // (registered once) can always read the latest value without stale closure.
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = state.selectedSectionId;

  // saveCVRef lets the keyboard shortcut call the save function without a stale closure
  const saveCVRef = useRef<(() => void) | null>(null);

  // Dirty-state: true whenever cv changes and hasn't been explicitly saved to the named list
  const [isDirty, setIsDirty] = useState(false);
  const markSaved = useCallback(() => setIsDirty(false), []);

  // Session auto-save (debounced 500ms) + dirty flag
  useEffect(() => {
    setIsDirty(true);
    const timer = setTimeout(() => {
      saveSession(state.cv);
    }, 500);
    return () => clearTimeout(timer);
  }, [state.cv]);

  // Keep saveCVRef fresh so Ctrl+S can call persistCV directly
  const cvRef = useRef(state.cv);
  cvRef.current = state.cv;
  saveCVRef.current = () => {
    persistCV(cvRef.current);
    setIsDirty(false);
  };

  // Dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.isDarkMode);
  }, [state.isDarkMode]);

  // Keyboard shortcuts — registered once, uses ref for fresh selected id
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (meta && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? 'REDO' : 'UNDO' });
        return;
      }

      if (meta && e.key === 's') {
        e.preventDefault();
        // Explicit save — persisted automatically but this triggers a visual cue
        saveCVRef.current?.();
        return;
      }

      if (isEditing) return;

      const selected = selectedIdRef.current;
      if (selected === null) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        dispatch({ type: 'DELETE_SECTION', payload: selected });
      } else if (meta && e.key === 'd') {
        e.preventDefault();
        dispatch({ type: 'DUPLICATE_SECTION', payload: selected });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        dispatch({ type: 'MOVE_SECTION', payload: { id: selected, direction: 'up' } });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        dispatch({ type: 'MOVE_SECTION', payload: { id: selected, direction: 'down' } });
      }
    };
    globalThis.addEventListener('keydown', handler);
    return () => globalThis.removeEventListener('keydown', handler);
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

  const setSectionStyle = useCallback((id: string, style: import('@/types/cv').CVSectionStyle) => {
    dispatch({ type: 'SET_SECTION_STYLE', payload: { id, style } });
  }, []);

  const selectedSection = state.cv.sections.find(s => s.id === state.selectedSectionId) ?? null;

  const value = useMemo<CVContextValue>(() => ({
    state, dispatch, addSection, updateSectionContent,
    deleteSection, duplicateSection, selectSection, selectedSection, setSectionStyle,
    isDirty, markSaved,
  }), [state, dispatch, addSection, updateSectionContent, deleteSection, duplicateSection, selectSection, selectedSection, setSectionStyle, isDirty, markSaved]);

  return (
    <CVContext.Provider value={value}>
      {children}
    </CVContext.Provider>
  );
}

export function useCV() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error('useCV must be used within CVProvider');
  return ctx;
}
