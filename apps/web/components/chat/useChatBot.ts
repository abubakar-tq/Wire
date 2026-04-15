import { useState, useCallback, useRef } from "react";
import type { ViewType } from "@/types/index";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

export function useChatBot(currentView: ViewType) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const toggleOpen = useCallback(() => setIsOpen((o) => !o), []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsgId = crypto.randomUUID();
      const assistantMsgId = crypto.randomUUID();

      setMessages((prev) => {
        // MEMORY CAPPING (CLIENT SIDE): Max 50 messages on DOM
        const history = prev.length > 50 ? prev.slice(-50) : prev;
        return [
          ...history,
          { id: userMsgId, role: "user", content: text },
          { id: assistantMsgId, role: "assistant", content: "" }
        ];
      });

      setIsLoading(true);

      // Cancel any ongoing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const payload = {
          messages: [...messages, { role: "user", content: text }].map(m => ({ 
            role: m.role, 
            content: m.content 
          })),
          currentView
        };

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error || "Network response was not ok");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Stream not available");

        const decoder = new TextDecoder("utf-8");
        let streamString = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          streamString += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: streamString } : msg
            )
          );
        }
      } catch (error: any) {
        if (error.name === "AbortError") return;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: error.message || "Failed to connect to WireGuide.", isError: true }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, currentView]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  }, []);

  return {
    isOpen,
    toggleOpen,
    messages,
    isLoading,
    sendMessage,
    clearChat
  };
}
