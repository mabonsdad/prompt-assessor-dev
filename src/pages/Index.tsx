import { useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ChatHeader } from "@/components/ChatHeader";
import { EmptyState } from "@/components/EmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader onClear={clearChat} hasMessages={messages.length > 0} />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex-1 flex flex-col min-h-0 max-w-3xl mx-auto w-full px-4">
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
        )}
      </main>

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default Index;
