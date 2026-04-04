'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  showCloseButton?: boolean;
  zIndex?: number;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  className = '',
  maxWidth = 'max-w-sm',
  showCloseButton = true,
  zIndex = 50,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  // React 19 derived-state-from-props pattern
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
    }
  }

  // Unmount after close transition
  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 170);
    return () => clearTimeout(timer);
  }, [closing]);

  // ESC key
  useEffect(() => {
    if (!mounted) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mounted, onClose]);

  if (!mounted) return null;

  const entering = !closing;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex }}
    >
      {/* Overlay — CSS transition, no class swap flicker */}
      <div
        className={`absolute inset-0 bg-black/40 modal-overlay ${entering ? 'entering' : ''}`}
        onClick={onClose}
      />
      {/* Content */}
      <div
        className={`relative bg-surface rounded-2xl shadow-xl ${maxWidth} w-full p-6 modal-panel ${entering ? 'entering' : ''} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-all duration-200 active:scale-95"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
