import { useState } from 'react';
import { Download, X } from 'lucide-react';

interface Props {
  readonly defaultName: string;
  readonly format: 'PDF' | 'DOCX' | 'HTML';
  readonly onConfirm: (filename: string) => void;
  readonly onCancel: () => void;
}

export function ExportDialog({ defaultName, format, onConfirm, onCancel }: Props) {
  const ext = format.toLowerCase();
  const [name, setName] = useState(defaultName.replace(/\.[^.]+$/, ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safe = (name.trim() || defaultName).replace(/[/\\:*?"<>|]/g, '-');
    onConfirm(`${safe}.${ext}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-card rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-base">Export as {format}</h2>
          </div>
          <button onClick={onCancel} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Filename
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 property-input rounded-l-md px-3 py-2 text-sm border-r-0 rounded-r-none"
                placeholder="my-cv"
                autoFocus
                spellCheck={false}
              />
              <span className="px-3 py-2 text-sm bg-muted border border-border rounded-r-md text-muted-foreground select-none">
                .{ext}
              </span>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
