import { useState, useCallback } from "react";

export type ReviewMode = "coach" | "workflow";

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export interface AttachmentPayload {
  name: string;
  data: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode: ReviewMode;
  attachmentName?: string;
  critique?: string;
  isLoading?: boolean;
}

export interface SendOptions {
  mode: ReviewMode;
  attachment?: File;
  useWebSearch: boolean;
  compactAnswer: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const CHAT_URL = `${API_BASE_URL}/api/chat`;

async function requestChat({
  messages,
  type,
  options,
  attachment,
}: {
  messages: Array<{ role: string; content: string }>;
  type: "chat" | "critique";
  options: SendOptions;
  attachment?: AttachmentPayload;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      type,
      mode: options.mode,
      attachment: options.mode === "workflow" ? attachment : undefined,
      useWebSearch: options.mode === "workflow" && options.useWebSearch,
      compactAnswer: options.compactAnswer,
    }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || "Failed to fetch response");

  return data.content as string | undefined;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (input: string, options: SendOptions) => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      mode: options.mode,
      attachmentName: options.attachment?.name,
    };
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      mode: options.mode,
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    let assistantContent = "";
    try {
      const attachment = options.mode === "workflow" && options.attachment
        ? { name: options.attachment.name, data: await readAttachment(options.attachment) }
        : undefined;
      const chatMessages = [
        ...messages.map((message) => ({ role: message.role, content: message.content })),
        { role: "user", content: input.trim() },
      ];

      assistantContent = (await requestChat({
        messages: chatMessages,
        type: "chat",
        options,
        attachment,
      })) || "";

      setMessages((prev) => prev.map((message) =>
        message.id === assistantMessage.id
          ? { ...message, content: assistantContent, isLoading: true }
          : message
      ));

      const critique = (await requestChat({
        messages: [
          { role: "user", content: input.trim() },
          { role: "assistant", content: assistantContent },
        ],
        type: "critique",
        options,
        attachment,
      })) || "";

      setMessages((prev) => prev.map((message) =>
        message.id === assistantMessage.id
          ? { ...message, critique, isLoading: false }
          : message
      ));
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : "Something went wrong"}`;
      console.error("Chat error:", error);
      setMessages((prev) => prev.map((message) =>
        message.id === assistantMessage.id
          ? {
              ...message,
              content: assistantContent || errorMessage,
              critique: assistantContent ? errorMessage : message.critique,
              isLoading: false,
            }
          : message
      ));
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, sendMessage, isLoading, clearChat };
}

function readAttachment(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    return Promise.reject(new Error("Choose a file smaller than 2 MB."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Could not read the selected file."));
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}
