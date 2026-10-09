import { useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ChatHeader } from "@/components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

const Index = () => {
  const { messages, sendMessage, isLoading, clearChat } = useChat();
  const responseEndRef = useRef<HTMLDivElement>(null);

  // Get the last user message and its corresponding assistant response
  const lastUserMessage = messages.filter(m => m.role === "user").slice(-1)[0];
  const lastAssistantMessage = messages.filter(m => m.role === "assistant").slice(-1)[0];

  // Auto-scroll response area when new content arrives
  useEffect(() => {
    responseEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lastAssistantMessage?.content, lastAssistantMessage?.critique]);

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <ChatHeader onClear={clearChat} hasMessages={messages.length > 0} />

      {messages.length > 0 && (
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 max-w-3xl mx-auto w-full px-4">
            <div className="flex justify-end pt-2 sm:hidden">
              <button type="button" onClick={clearChat} aria-label="Clear chat" className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {/* Pinned User Prompt - max 50% height, scrollable */}
            {lastUserMessage && (
              <div className="flex-shrink-0 max-h-[50%] py-4">
                <ScrollArea className="h-full">
                  <ChatMessage message={lastUserMessage} isPinned />
                </ScrollArea>
              </div>
            )}

            {/* Response and Critique - independently scrollable */}
            {lastAssistantMessage && (
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="py-4 space-y-4">
                    <ChatMessage message={lastAssistantMessage} />
                    <div ref={responseEndRef} />
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </main>
      )}

      <footer className={messages.length === 0
        ? "flex flex-1 items-center justify-center px-3 py-5 sm:px-6"
        : "border-t border-border bg-card/50 px-3 py-3 backdrop-blur-sm sm:px-4"}>
        <div className="mx-auto w-full max-w-3xl">
          {messages.length === 0 && (
            <div className="mb-5 hidden text-center sm:block">
              <h2 className="text-xl font-semibold text-foreground">Try a prompt</h2>
              <p className="mt-1 text-sm text-muted-foreground">See a trial answer and how to improve the request.</p>
            </div>
          )}
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default Index;
