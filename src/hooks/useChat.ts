import { useState, useCallback } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  critique?: string;
  isLoading?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const CHAT_URL = `${API_BASE_URL}/api/chat`;

async function requestChat({
  messages,
  type,
}: {
  messages: Array<{ role: string; content: string }>;
  type: "chat" | "critique";
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, type }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.error || "Failed to fetch response");
  }

  return data.content as string | undefined;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    let assistantContent = "";
    let critiqueContent = "";

    try {
      const chatMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: input.trim() },
      ];

      assistantContent = (await requestChat({
        messages: chatMessages,
        type: "chat",
      })) || "";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: assistantContent, isLoading: true }
            : m
        )
      );

      critiqueContent = (await requestChat({
        messages: [{ role: "user", content: input.trim() }],
        type: "critique",
      })) || "";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, critique: critiqueContent, isLoading: false }
            : m
        )
      );
      setIsLoading(false);
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : "Something went wrong"}`;
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content: assistantContent || errorMessage,
                critique: assistantContent ? errorMessage : m.critique,
                isLoading: false,
              }
            : m
        )
      );
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, sendMessage, isLoading, clearChat };
}
