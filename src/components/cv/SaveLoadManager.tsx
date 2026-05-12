import { useCV } from '@/contexts/CVContext';
import type { CVData } from '@/types/cv';
import { useState, useEffect, useRef } from 'react';
import {
  FolderOpen, Trash2, X, FileText, Edit2, Check,
  Copy, Upload, AlertTriangle,
} from 'lucide-react';
import { saveCV, loadAllCVs, deleteCV, duplicateCV } from '@/lib/storage';

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function SaveLoadManager({ open, onClose }: Props) {
  const { state, dispatch, markSaved } = useCV();
  const [cvList, setCvList] = useState<CVData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLDialogElement>(null);

  // Drive native dialog open/close from the `open` prop
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      setCvList(loadAllCVs());
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  // Keep confirm dialog in sync
  useEffect(() => {
    const el = confirmRef.current;
    if (!el) return;
    if (confirmDeleteId) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [confirmDeleteId]);

  const refresh = () => setCvList(loadAllCVs());

  const saveCurrentCV = () => {
    saveCV(state.cv);
    markSaved();
    refresh();
  };

  const handleLoad = (cv: CVData) => {
    dispatch({ type: 'LOAD_CV', payload: cv });
    onClose();
  };

  const handleDelete = (id: string) => {
    deleteCV(id);
    setConfirmDeleteId(null);
    refresh();
  };

  const handleDuplicate = (id: string) => {
    duplicateCV(id);
    refresh();
  };

  const renameCV = (id: string) => {
    const updated = cvList.map(c => c.id === id ? { ...c, name: editName.trim() || c.name } : c);
    updated.forEach(c => { if (c.id === id) saveCV(c); });
    setCvList(updated);
    setEditingId(null);
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as CVData;
      if (data.sections && data.id) { saveCV(data); refresh(); }
    } catch { /* invalid JSON */ }
    e.target.value = '';
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />

      {/* Main dialog */}
      <dialog
        ref={dialogRef}
        onClose={onClose}
        className="w-full max-w-lg max-h-[80vh] rounded-xl border-0 shadow-2xl bg-card p-0 flex flex-col backdrop:bg-foreground/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" /> CV Manager
          </h2>
          <button onClick={onClose} className="toolbar-btn"><X className="w-4 h-4" /></button>
        </div>

        {/* Current CV + actions */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
          <div className="text-sm min-w-0">
            <span className="text-muted-foreground">Current: </span>
            <span className="font-medium truncate">{state.cv.name}</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => fileInputRef.current?.click()} className="toolbar-btn text-xs">
              <Upload className="w-3.5 h-3.5" /> Import JSON
            </button>
            <button onClick={saveCurrentCV} className="toolbar-btn-primary text-xs">
              Save Current
            </button>
          </div>
        </div>

        {/* CV list */}
        <div className="flex-1 overflow-y-auto p-4">
          {cvList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No saved CVs yet. Click "Save Current" to save your first CV.
            </p>
          ) : (
            <div className="space-y-2">
              {cvList.map(cv => (
                <div
                  key={cv.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${cv.id === state.cv.id ? 'border-primary bg-accent/50' : 'border-border hover:bg-muted/50'}`}
                >
                  <FileText className="w-4 h-4 text-primary shrink-0" />

                  <div className="flex-1 min-w-0">
                    {editingId === cv.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { renameCV(cv.id); }
                            else if (e.key === 'Escape') { setEditingId(null); }
                          }}
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
                        <p className="text-xs text-muted-foreground">
                          {cv.template} · {new Date(cv.updatedAt).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingId(cv.id); setEditName(cv.name); }}
                      className="p-1.5 hover:bg-muted rounded" title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(cv.id)}
                      className="p-1.5 hover:bg-muted rounded" title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleLoad(cv)}
                      className="p-1.5 hover:bg-accent rounded text-primary" title="Load"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(cv.id)}
                      className="p-1.5 hover:bg-destructive/10 text-destructive rounded" title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </dialog>

      {/* Delete confirmation dialog */}
      <dialog
        ref={confirmRef}
        onClose={() => setConfirmDeleteId(null)}
        className="w-full max-w-sm rounded-xl border-0 shadow-2xl bg-card p-6 backdrop:bg-foreground/60"
      >
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Delete this CV?</p>
            <p className="text-xs text-muted-foreground mt-1">
              "{cvList.find(c => c.id === confirmDeleteId)?.name}" will be permanently removed.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setConfirmDeleteId(null)}
            className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            className="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </dialog>
    </>
  );
}
