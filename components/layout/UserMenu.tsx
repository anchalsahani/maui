"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  LogOut,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

interface UserMenuProps {
  userName: string;
}

export default function UserMenu({ userName }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      setOpen(false);
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`group flex h-10 items-center gap-1.5 rounded-full border px-2 text-[var(--color-dark)] shadow-[0_8px_24px_rgba(16,47,21,0.08)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 sm:h-11 sm:gap-2 sm:px-3 ${
          open
            ? "border-[var(--color-primary)]/35 bg-[var(--color-card-hover)] shadow-[0_14px_30px_rgba(16,47,21,0.14)]"
            : "border-[var(--color-border)] bg-[var(--color-nav-surface)]"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${userName} menu`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)]/60 text-[var(--color-primary-deep)] transition-transform duration-200 group-hover:scale-105">
          <User size={16} />
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="app-card-strong fixed left-3 right-3 top-16 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-[22px] p-3 animate-in fade-in zoom-in-95 duration-200 sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:w-[340px] sm:max-h-[calc(100dvh-6rem)] sm:rounded-[28px]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(207,232,213,0.55),transparent)]" />

          <div className="app-subcard relative rounded-[22px] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--color-dark)]">
                  {userName}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                  Your Maui workspace
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-card-hover)] text-[var(--color-primary-deep)] shadow-[0_8px_18px_rgba(16,47,21,0.08)]">
                <Sparkles size={15} />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-secondary)]/80">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]/60" />
              Ready to start gently
            </div>
          </div>

          <div className="relative mt-3">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between rounded-[20px] border border-[var(--color-border)]/75 bg-[var(--color-card-soft)] px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/45 hover:bg-[var(--color-card-hover)]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)]/45 text-[var(--color-primary-deep)]">
                  <Settings size={16} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[var(--color-dark)]">
                    Settings
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--color-text-secondary)]">
                    Account and personalization
                  </span>
                </span>
              </span>
              <ArrowUpRight
                size={15}
                className="text-[var(--color-primary-deep)]/65 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          <div className="relative mt-3 border-t border-[var(--color-border)]/80 pt-3">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={isPending}
              className="group flex w-full items-center justify-between rounded-[20px] border border-[var(--color-border)]/75 bg-[var(--color-card-soft)] px-4 py-3 text-left text-sm font-medium text-[var(--color-dark)] transition-all duration-200 hover:border-[var(--color-error)]/35 hover:bg-[var(--color-card-hover)] hover:shadow-[0_14px_28px_rgba(16,47,21,0.08)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-error)]/12 text-[var(--color-error)] transition-colors duration-200 group-hover:bg-[var(--color-error)]/18">
                  <LogOut size={16} />
                </span>
                <span>{isPending ? "Logging out..." : "Logout"}</span>
              </span>
              <ArrowUpRight
                size={15}
                className="text-[var(--color-error)]/65 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-error)]"
              />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
