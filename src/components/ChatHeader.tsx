import { MessageSquare, Trash2 } from "lucide-react";

interface ChatHeaderProps {
  onClear: () => void;
  hasMessages: boolean;
}

export function ChatHeader({ onClear, hasMessages }: ChatHeaderProps) {
  return (
    <header className="hidden items-center justify-between border-b border-border bg-card/50 px-5 py-2.5 sm:flex">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <MessageSquare className="h-4 w-4 text-primary" />
        </div>
        <h1 className="text-sm font-semibold text-foreground">Prompt Assessor</h1>
      </div>

      {hasMessages && (
        <button
          onClick={onClear}
          aria-label="Clear chat"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Clear chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </header>
  );
}
