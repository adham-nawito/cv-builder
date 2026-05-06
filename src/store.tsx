import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { CV, Section, Template } from '@/schemas/cv'

const MAX_HISTORY = 50

function createDefaultCV(): CV {
  const now = new Date().toISOString()
  return {
    version: 1,
    id: uuidv4(),
    name: 'My CV',
    template: 'minimal',
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        id: uuidv4(),
        type: 'personalInfo',
        title: 'Personal Info',
        visible: true,
        locked: false,
        blocks: [],
        name: 'Your Name',
        email: 'you@example.com',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
      },
      {
        id: uuidv4(),
        type: 'experience',
        title: 'Experience',
        visible: true,
        locked: false,
        blocks: [],
      },
      {
        id: uuidv4(),
        type: 'education',
        title: 'Education',
        visible: true,
        locked: false,
        blocks: [],
      },
      {
        id: uuidv4(),
        type: 'skills',
        title: 'Skills',
        visible: true,
        locked: false,
        blocks: [],
      },
    ],
  }
}

type CVStore = {
  cv: CV
  selectedSectionId: string | null
  isDirty: boolean
  // undo/redo
  past: CV[]
  future: CV[]
  canUndo: boolean
  canRedo: boolean

  setCV: (cv: CV) => void
  updateCV: (partial: Partial<CV>) => void
  setTemplate: (template: Template) => void
  setSections: (sections: Section[]) => void
  updateSection: (id: string, partial: Partial<Section>) => void
  addSection: (section: Section) => void
  removeSection: (id: string) => void
  duplicateSection: (id: string) => void
  selectSection: (id: string | null) => void
  markClean: () => void
  undo: () => void
  redo: () => void
}

function pushHistory(past: CV[], current: CV): CV[] {
  return [...past, current].slice(-MAX_HISTORY)
}

export const useCVStore = create<CVStore>((set, get) => ({
  cv: createDefaultCV(),
  selectedSectionId: null,
  isDirty: false,
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  setCV: (cv) => set({ cv, isDirty: false, past: [], future: [], canUndo: false, canRedo: false }),

  updateCV: (partial) =>
    set((state) => {
      const past = pushHistory(state.past, state.cv)
      return {
        cv: { ...state.cv, ...partial, updatedAt: new Date().toISOString() },
        isDirty: true,
        past,
        future: [],
        canUndo: true,
        canRedo: false,
      }
    }),

  setTemplate: (template) => get().updateCV({ template }),

  setSections: (sections) =>
    set((state) => {
      const past = pushHistory(state.past, state.cv)
      return {
        cv: { ...state.cv, sections, updatedAt: new Date().toISOString() },
        isDirty: true,
        past,
        future: [],
        canUndo: true,
        canRedo: false,
      }
    }),

  updateSection: (id, partial) =>
    set((state) => {
      const past = pushHistory(state.past, state.cv)
      return {
        cv: {
          ...state.cv,
          sections: state.cv.sections.map((s) =>
            s.id === id ? ({ ...s, ...partial } as Section) : s
          ),
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
        past,
        future: [],
        canUndo: true,
        canRedo: false,
      }
    }),

  addSection: (section) =>
    set((state) => {
      const past = pushHistory(state.past, state.cv)
      return {
        cv: {
          ...state.cv,
          sections: [...state.cv.sections, section],
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
        past,
        future: [],
        canUndo: true,
        canRedo: false,
      }
    }),

  removeSection: (id) =>
    set((state) => {
      const past = pushHistory(state.past, state.cv)
      return {
        cv: {
          ...state.cv,
          sections: state.cv.sections.filter((s) => s.id !== id),
          updatedAt: new Date().toISOString(),
        },
        isDirty: true,
        past,
        future: [],
        canUndo: true,
        canRedo: false,
        selectedSectionId: state.selectedSectionId === id ? null : state.selectedSectionId,
      }
    }),

  duplicateSection: (id) =>
    set((state) => {
      const section = state.cv.sections.find((s) => s.id === id)
      if (!section) return state
      const copy = { ...section, id: uuidv4() }
      const idx = state.cv.sections.findIndex((s) => s.id === id)
      const sections = [
        ...state.cv.sections.slice(0, idx + 1),
        copy,
        ...state.cv.sections.slice(idx + 1),
      ]
      const past = pushHistory(state.past, state.cv)
      return {
        cv: { ...state.cv, sections, updatedAt: new Date().toISOString() },
        isDirty: true,
        past,
        future: [],
        canUndo: true,
        canRedo: false,
        selectedSectionId: copy.id,
      }
    }),

  selectSection: (id) => set({ selectedSectionId: id }),

  markClean: () => set({ isDirty: false }),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state
      const prev = state.past[state.past.length - 1]
      const past = state.past.slice(0, -1)
      const future = [state.cv, ...state.future].slice(0, MAX_HISTORY)
      return {
        cv: prev,
        past,
        future,
        canUndo: past.length > 0,
        canRedo: true,
        isDirty: true,
      }
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state
      const next = state.future[0]
      const future = state.future.slice(1)
      const past = pushHistory(state.past, state.cv)
      return {
        cv: next,
        past,
        future,
        canUndo: true,
        canRedo: future.length > 0,
        isDirty: true,
      }
    }),
}))
