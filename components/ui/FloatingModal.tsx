"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

interface FloatingModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
}

const widthClasses = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function FloatingModal({
  open,
  onClose,
  title,
  description,
  children,
  size = "lg",
}: FloatingModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => {
      if (
        document.activeElement &&
        panelRef.current?.contains(document.activeElement) &&
        document.activeElement !== panelRef.current
      ) {
        return;
      }

      panelRef.current?.focus();
    }, 20);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            className="absolute inset-0 bg-[rgba(17,24,22,0.38)] backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={`relative z-[101] w-full ${widthClasses[size]} overflow-hidden rounded-[32px] border border-white/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(245,250,247,0.82))] shadow-[0_40px_120px_rgba(14,30,20,0.22),0_0_0_1px_rgba(207,232,213,0.32)] outline-none backdrop-blur-2xl`}
            initial={{ opacity: 0, y: 28, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.97, filter: "blur(6px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(207,232,213,0.9),transparent_68%)]" />
            <div className="pointer-events-none absolute right-[-4rem] top-[-2rem] h-40 w-40 rounded-full bg-[var(--color-primary)]/18 blur-3xl" />

            <div className="relative border-b border-[var(--color-border)]/80 px-5 py-5 sm:px-7">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-white/72 text-[var(--color-text-secondary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/25 hover:bg-white hover:text-[var(--color-dark)]"
                aria-label="Close modal"
              >
                <X size={17} />
              </button>

              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--color-text-secondary)]">
                Maui Flow
              </p>
              <h2
                id={titleId}
                className="mt-3 max-w-[24ch] text-[1.9rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--color-dark)] sm:text-[2.25rem]"
              >
                {title}
              </h2>
              {description ? (
                <p
                  id={descriptionId}
                  className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-[15px]"
                >
                  {description}
                </p>
              ) : null}
            </div>

            <div className="relative max-h-[min(80vh,860px)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
