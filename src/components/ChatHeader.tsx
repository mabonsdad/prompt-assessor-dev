import { MessageSquare, Trash2, Sparkles } from "lucide-react";

interface ChatHeaderProps {
  onClear: () => void;
  hasMessages: boolean;
}

export function ChatHeader({ onClear, hasMessages }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Prompt Coach
            <Sparkles className="w-4 h-4 text-primary" />
          </h1>
          <p className="text-xs text-muted-foreground">
            Get AI responses + prompt improvement tips
          </p>
        </div>
      </div>

      {hasMessages && (
        <button
          onClick={onClear}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Clear chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </header>
  );
}
