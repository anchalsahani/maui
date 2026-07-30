"use client";

import {
  ArrowUpRight,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { workspaceNavigationGroups } from "@/lib/app-pages";

export default function WorkspaceMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open workspace navigation"
        className={`group flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold text-[var(--color-dark)] shadow-[0_8px_24px_rgba(16,47,21,0.08)] transition-all duration-200 hover:-translate-y-0.5 sm:h-11 sm:px-4 ${
          open
            ? "border-[var(--color-primary)]/35 bg-[var(--color-card-hover)]"
            : "border-[var(--color-border)] bg-[var(--color-nav-surface)]"
        }`}
      >
        <LayoutGrid size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Workspace</span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Workspace navigation"
          className="app-card-strong fixed left-3 right-3 top-16 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-[22px] p-3 sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:w-[380px] sm:rounded-[28px]"
        >
          {workspaceNavigationGroups.map((group, groupIndex) => (
            <section
              key={group.label}
              className={groupIndex > 0 ? "mt-3 border-t border-[var(--color-border)] pt-3" : ""}
            >
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                {group.label}
              </p>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`group/item flex items-start justify-between gap-3 rounded-[18px] border px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 ${
                        active
                          ? "border-[var(--color-primary)]/35 bg-[var(--color-accent)]/36"
                          : "border-[var(--color-border)]/70 bg-[var(--color-card-soft)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-card-hover)]"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-[var(--color-dark)]">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-[var(--color-text-secondary)]">
                          {item.description}
                        </span>
                      </span>
                      <ArrowUpRight
                        size={15}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-[var(--color-primary-deep)]/65 transition-transform duration-200 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5"
                      />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}
