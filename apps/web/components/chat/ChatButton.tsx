import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, X } from "lucide-react";

interface ChatButtonProps {
  isOpen: boolean;
  toggle: () => void;
}

export function ChatButton({ isOpen, toggle }: ChatButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <button
      onClick={toggle}
      className={`fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-hover transition-transform duration-300 hover:scale-110 active:scale-95 animate-scale-in`}
      aria-label="Toggle WireGuide AI"
    >
      <div className="relative flex h-full w-full items-center justify-center">        {isOpen ? (
          <X className="absolute h-6 w-6 animate-fade-in" />
        ) : (
          <MessageCircle className="absolute h-6 w-6 animate-fade-in" />
        )}
      </div>
    </button>,
    document.body
  );
}
