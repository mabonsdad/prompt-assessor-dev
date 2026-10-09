import { useEffect, useRef, useState } from "react";
import { ClipboardCheck, Compass, Loader2, Paperclip, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_UPLOAD_BYTES, type ReviewMode, type SendOptions } from "@/hooks/useChat";

interface ChatInputProps {
  onSend: (message: string, options: SendOptions) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ReviewMode>("coach");
  const [attachment, setAttachment] = useState<File>();
  const [uploadError, setUploadError] = useState("");
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirmUploadRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showUploadWarning) confirmUploadRef.current?.focus();
  }, [showUploadWarning]);

  const selectAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/\.(pdf|txt|md|docx|csv)$/i.test(file.name)) {
      setUploadError("Choose a PDF, Word document, TXT, Markdown, or CSV file.");
      return;
    }
    if (file.size === 0) {
      setUploadError("The selected file is empty.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("Choose a file smaller than 2 MB.");
      return;
    }
    setAttachment(file);
    setUploadError("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input, {
        mode,
        attachment: mode === "workflow" ? attachment : undefined,
        useWebSearch,
        compactAnswer: window.matchMedia("(max-width: 639px)").matches,
      });
      setInput("");
      setAttachment(undefined);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2" aria-label="Review mode">
        <button
          type="button"
          onClick={() => {
            setMode("coach");
            setAttachment(undefined);
            setUseWebSearch(false);
            setUploadError("");
          }}
          disabled={isLoading}
          className={cn(
            "rounded-xl border p-2.5 text-left transition-colors sm:p-3",
            mode === "coach" ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary/60"
          )}
        >
          <span className="flex items-center gap-2 text-sm font-medium"><Compass className="h-4 w-4 text-primary" />Prompt Coach</span>
          <span className="mt-1 block text-xs text-muted-foreground">Improve a simple prompt.</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("workflow")}
          disabled={isLoading}
          className={cn(
            "rounded-xl border p-2.5 text-left transition-colors sm:p-3",
            mode === "workflow" ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary/60"
          )}
        >
          <span className="flex items-center gap-2 text-sm font-medium"><ClipboardCheck className="h-4 w-4 text-primary" />Workflow Coach</span>
          <span className="mt-1 block text-xs text-muted-foreground">Map complex work; advice only.</span>
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md,.csv" onChange={selectAttachment} hidden tabIndex={-1} />

      {attachment && mode === "workflow" && (
        <div className="flex items-center gap-2 text-xs text-foreground">
          <Paperclip className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">{attachment.name}</span>
          <button type="button" onClick={() => setAttachment(undefined)} disabled={isLoading} aria-label="Remove attachment" className="rounded p-1 hover:bg-secondary"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
      {uploadError && <p role="alert" className="text-xs text-destructive">{uploadError}</p>}

      <div className="relative rounded-2xl border border-border bg-chat-input shadow-lg transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
        {mode === "workflow" && (
          <button
            type="button"
            onClick={() => { setUploadError(""); setShowUploadWarning(true); }}
            disabled={isLoading}
            aria-label="Attach reference material"
            title="Attach reference material"
            className="absolute bottom-2 left-2 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          >
            <Paperclip className="h-5 w-5" />
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === "coach" ? "Type a prompt..." : "Type a complex prompt..."}
          disabled={isLoading}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground",
            "min-h-[52px] max-h-[200px] rounded-2xl py-3.5 pr-12 focus:outline-none",
            mode === "workflow" ? "pl-12" : "pl-4"
          )}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          aria-label={mode === "coach" ? "Coach this prompt" : "Review this workflow prompt"}
          className="absolute bottom-2 right-2 rounded-xl bg-primary p-2 text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
      {mode === "workflow" && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={useWebSearch} onChange={(event) => setUseWebSearch(event.target.checked)} disabled={isLoading} className="h-4 w-4 accent-primary" />
          Check public sources in review
        </label>
      )}

      {showUploadWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onKeyDown={(event) => { if (event.key === "Escape") setShowUploadWarning(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="upload-warning-title" className="w-full max-w-sm space-y-3 rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <h2 id="upload-warning-title" className="text-base font-semibold text-foreground">Before you attach a file</h2>
            <p className="text-sm text-foreground">Your prompt and file will be sent to OpenAI for the trial answer and review. Upload only material you are allowed to share; remove personal or confidential details unless approved.</p>
            {useWebSearch && <p className="text-sm text-muted-foreground">Web search may include details from your prompt or file in search queries.</p>}
            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, Markdown or CSV; maximum 2 MB.</p>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowUploadWarning(false)} className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary">Cancel</button>
              <button ref={confirmUploadRef} type="button" onClick={() => { setShowUploadWarning(false); fileInputRef.current?.click(); }} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Choose file</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
