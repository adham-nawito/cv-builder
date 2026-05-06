import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { CV, Section, Template } from '@/schemas/cv'

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
        blocks: [],
      },
      {
        id: uuidv4(),
        type: 'education',
        title: 'Education',
        visible: true,
        blocks: [],
      },
      {
        id: uuidv4(),
        type: 'skills',
        title: 'Skills',
        visible: true,
        blocks: [],
      },
    ],
  }
}

type CVStore = {
  cv: CV
  selectedSectionId: string | null
  isDirty: boolean

  setCV: (cv: CV) => void
  updateCV: (partial: Partial<CV>) => void
  setTemplate: (template: Template) => void
  setSections: (sections: Section[]) => void
  updateSection: (id: string, partial: Partial<Section>) => void
  addSection: (section: Section) => void
  removeSection: (id: string) => void
  selectSection: (id: string | null) => void
  markClean: () => void
}

export const useCVStore = create<CVStore>((set) => ({
  cv: createDefaultCV(),
  selectedSectionId: null,
  isDirty: false,

  setCV: (cv) => set({ cv, isDirty: false }),

  updateCV: (partial) =>
    set((state) => ({
      cv: { ...state.cv, ...partial, updatedAt: new Date().toISOString() },
      isDirty: true,
    })),

  setTemplate: (template) =>
    set((state) => ({
      cv: { ...state.cv, template, updatedAt: new Date().toISOString() },
      isDirty: true,
    })),

  setSections: (sections) =>
    set((state) => ({
      cv: { ...state.cv, sections, updatedAt: new Date().toISOString() },
      isDirty: true,
    })),

  updateSection: (id, partial) =>
    set((state) => ({
      cv: {
        ...state.cv,
        sections: state.cv.sections.map((s) =>
          s.id === id ? ({ ...s, ...partial } as Section) : s
        ),
        updatedAt: new Date().toISOString(),
      },
      isDirty: true,
    })),

  addSection: (section) =>
    set((state) => ({
      cv: {
        ...state.cv,
        sections: [...state.cv.sections, section],
        updatedAt: new Date().toISOString(),
      },
      isDirty: true,
    })),

  removeSection: (id) =>
    set((state) => ({
      cv: {
        ...state.cv,
        sections: state.cv.sections.filter((s) => s.id !== id),
        updatedAt: new Date().toISOString(),
      },
      isDirty: true,
    })),

  selectSection: (id) => set({ selectedSectionId: id }),

  markClean: () => set({ isDirty: false }),
}))
