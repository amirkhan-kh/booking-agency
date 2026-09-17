"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, title, onClose, children, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  // Portal: ota elementdagi transform/animation (animate-fade-up) fixed
  // pozitsiyani buzmasin — modal doim viewport markazida.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[rgba(15,23,42,0.45)] p-4 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "glass-strong my-auto w-full max-w-5xl rounded-2xl shadow-[0_24px_64px_rgba(15,23,42,0.24)]",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--glass-border)] px-5 py-4 sm:px-6">
          {title ? (
            <h3 className="font-display text-lg font-semibold text-[var(--accent-deep)]">
              {title}
            </h3>
          ) : (
            <span />
          )}
          <button
            type="button"
            aria-label="Yopish"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl leading-none text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text)]"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
