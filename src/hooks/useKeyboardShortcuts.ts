import { useEffect } from 'react'
import { useCVStore } from '@/store'

export function useKeyboardShortcuts() {
  const undo = useCVStore((s) => s.undo)
  const redo = useCVStore((s) => s.redo)
  const selectedId = useCVStore((s) => s.selectedSectionId)
  const removeSection = useCVStore((s) => s.removeSection)
  const duplicateSection = useCVStore((s) => s.duplicateSection)
  const selectSection = useCVStore((s) => s.selectSection)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement
      const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      // Undo: Cmd/Ctrl+Z
      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      // Redo: Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y
      if ((meta && e.shiftKey && e.key === 'z') || (meta && e.key === 'y')) {
        e.preventDefault()
        redo()
        return
      }

      if (isEditing) return

      // Delete selected section
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        removeSection(selectedId)
        return
      }

      // Duplicate: Cmd/Ctrl+D
      if (meta && e.key === 'd' && selectedId) {
        e.preventDefault()
        duplicateSection(selectedId)
        return
      }

      // Deselect: Escape
      if (e.key === 'Escape') {
        selectSection(null)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, selectedId, removeSection, duplicateSection, selectSection])
}
