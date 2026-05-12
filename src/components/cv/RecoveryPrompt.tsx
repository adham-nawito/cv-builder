import { RotateCcw, X } from 'lucide-react';
import type { CVData } from '@/types/cv';

interface Props {
  readonly session: CVData;
  readonly onRestore: () => void;
  readonly onDiscard: () => void;
}

export function RecoveryPrompt({ session, onRestore, onDiscard }: Props) {
  const when = new Date(session.updatedAt).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-card border border-amber-400/60 rounded-xl shadow-lg p-4 flex items-start gap-3 animate-fade-in">
        <RotateCcw className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Unsaved session found</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="font-medium">{session.name}</span> was last edited {when} and was not saved to your CV list.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onRestore}
              className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Restore
            </button>
            <button
              onClick={onDiscard}
              className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
        <button onClick={onDiscard} className="p-1 hover:bg-muted rounded shrink-0">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
