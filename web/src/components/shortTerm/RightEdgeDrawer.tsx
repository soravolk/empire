import React, { useEffect, useRef } from "react";

interface RightEdgeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Accessible right-edge drawer.
 * - Locks body scroll while open
 * - Closes on ESC or backdrop click
 * - Moves focus to panel on open, restores on close
 */
export default function RightEdgeDrawer({
  isOpen,
  onClose,
  title = "Details",
  children,
}: RightEdgeDrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // Focus panel
      panelRef.current?.focus();
    } else {
      // Restore focus
      previouslyFocused.current?.focus?.();
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="right-edge-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div
          ref={panelRef}
          tabIndex={-1}
          className="w-[92vw] sm:w-[28rem] h-full bg-white shadow-xl border-l outline-none transform transition-transform duration-200 ease-out translate-x-0"
        >
          <div className="h-12 px-4 flex items-center justify-between border-b">
            <h2 id="right-edge-drawer-title" className="text-sm font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-sm"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>
          <div className="h-[calc(100%-3rem)] overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
