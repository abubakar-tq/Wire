import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Send, AlertCircle, Trash2 } from "lucide-react";
import type { ChatMessage } from "./useChatBot";

interface ChatPanelProps {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (text: string) => void;
  clearChat: () => void;
}

const QUICK_REPLIES = [
  "How do I join a contest?",
  "How do I build my squad?",
  "What are WIRE tokens?",
  "Help me connect my wallet",
  "Why can't I see my NFT?"
];

export function ChatPanel({ isOpen, messages, isLoading, sendMessage, clearChat }: ChatPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Intelligent Scroll-to-bottom
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    sendMessage(input);
    setInput("");
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed bottom-24 right-6 z-[60] flex h-[500px] max-h-[calc(100vh-120px)] w-[360px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/85 shadow-2xl backdrop-blur-xl animate-slide-in-right">
      
      {/* HEADER */}      <div className="flex items-center justify-between border-b border-slate-200/60 bg-white/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">WireGuide AI</h3>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Web3 Concierge</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={clearChat} 
            className="text-slate-400 hover:text-red-500 transition-colors tooltip"
            title="Clear Chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* CHAT ARENA */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-end gap-2 pb-2">
            <div className="rounded-2xl rounded-tl-sm bg-slate-50 border border-slate-100 p-4 shadow-sm relative mr-6 animate-fade-in-up">
              <p className="text-sm text-slate-700 font-medium">Hello! Ready to conquer the Fantasy Arena?</p>
              <p className="text-xs text-slate-500 mt-1">Ask me anything about squads, NFTs, or claiming rewards.</p>
            </div>
            
            <div className="mt-4 flex w-full gap-2 overflow-x-auto pb-2 scrollbar-none animate-fade-in delay-200">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-2">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
              >
                <div 
                  className={`relative max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm ${
                    msg.role === "user" 
                      ? "bg-slate-900 text-white rounded-tr-sm" 
                      : msg.isError 
                        ? "bg-red-50 border border-red-100 text-red-900 rounded-tl-sm"
                        : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm leading-relaxed"
                  }`}
                >
                  {msg.isError && <AlertCircle className="inline h-4 w-4 mr-1 text-red-600 mb-0.5" />}
                  {msg.content === "" ? (
                    <div className="flex gap-1 h-5 items-center px-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-100"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-200"></span>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="border-t border-slate-200/60 bg-white p-4">
        <form onSubmit={onSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask WireGuide..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 pl-4 pr-12 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition-all disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 active:scale-95"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>
      
    </div>,
    document.body
  );
}
