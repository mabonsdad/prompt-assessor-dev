import { User, Bot, AlertTriangle, Sparkles } from "lucide-react";
import { Message } from "@/hooks/useChat";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  isPinned?: boolean;
}

export function ChatMessage({ message, isPinned }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className="space-y-4">
      {/* Main message */}
      <div
        className={cn(
          "flex gap-4 p-6 rounded-2xl transition-all",
          isUser 
            ? "bg-chat-user border border-border/50" 
            : "bg-chat-response border border-primary/20"
        )}
      >
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            isUser ? "bg-primary/20 text-primary" : "bg-primary/30 text-primary"
          )}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {isUser ? (isPinned ? "Your Prompt" : "You") : "AI Response"}
          </p>
          <div className="prose prose-invert prose-sm max-w-none">
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : message.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>Thinking...</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Critique panel - only show for assistant messages */}
      {!isUser && (message.critique || message.isLoading) && (
        <div className="bg-chat-critique border border-warning/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-semibold">Prompt Analysis</span>
            <Sparkles className="w-3 h-3 ml-auto opacity-50" />
          </div>
          
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-warning prose-strong:text-warning/90">
            {message.critique ? (
              <ReactMarkdown>{message.critique}</ReactMarkdown>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-warning rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-warning rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-warning rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>Analyzing your prompt...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
