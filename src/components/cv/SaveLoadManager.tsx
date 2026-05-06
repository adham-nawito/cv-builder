import { useCV } from '@/contexts/CVContext';
import type { CVData } from '@/types/cv';
import { useState, useEffect } from 'react';
import { FolderOpen, Trash2, X, FileText, Edit2, Check } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SaveLoadManager({ open, onClose }: Props) {
  const { state, dispatch } = useCV();
  const [cvList, setCvList] = useState<CVData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (open) {
      try {
        const list = JSON.parse(localStorage.getItem('cvforge_list') || '[]');
        setCvList(list);
      } catch {
        setCvList([]);
      }
    }
  }, [open]);

  const saveCurrentCV = () => {
    const list = [...cvList];
    const existing = list.findIndex(c => c.id === state.cv.id);
    if (existing >= 0) list[existing] = state.cv;
    else list.push(state.cv);
    localStorage.setItem('cvforge_list', JSON.stringify(list));
    setCvList(list);
  };

  const loadCV = (cv: CVData) => {
    dispatch({ type: 'LOAD_CV', payload: cv });
    onClose();
  };

  const deleteCV = (id: string) => {
    const list = cvList.filter(c => c.id !== id);
    localStorage.setItem('cvforge_list', JSON.stringify(list));
    setCvList(list);
  };

  const renameCV = (id: string) => {
    const list = cvList.map(c => c.id === id ? { ...c, name: editName } : c);
    localStorage.setItem('cvforge_list', JSON.stringify(list));
    setCvList(list);
    setEditingId(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" /> CV Manager
          </h2>
          <button onClick={onClose} className="toolbar-btn"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Current:</span>{' '}
              <span className="font-medium">{state.cv.name}</span>
            </div>
            <button onClick={saveCurrentCV} className="toolbar-btn-primary text-sm">Save Current</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cvList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No saved CVs yet. Click "Save Current" to save your first CV.</p>
          ) : (
            <div className="space-y-2">
              {cvList.map(cv => (
                <div key={cv.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${cv.id === state.cv.id ? 'border-primary bg-accent/50' : 'border-border hover:bg-muted/50'}`}>
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    {editingId === cv.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && renameCV(cv.id)}
                          className="property-input rounded px-2 flex-1 text-sm"
                          autoFocus
                        />
                        <button onClick={() => renameCV(cv.id)} className="p-1 hover:bg-muted rounded">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium truncate">{cv.name}</p>
                        <p className="text-xs text-muted-foreground">{cv.template} • {new Date(cv.updatedAt).toLocaleDateString()}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setEditingId(cv.id); setEditName(cv.name); }} className="p-1.5 hover:bg-muted rounded" title="Rename">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => loadCV(cv)} className="p-1.5 hover:bg-accent rounded text-primary" title="Load">
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteCV(cv.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
