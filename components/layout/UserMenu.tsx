"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, User } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { appPages } from "@/lib/app-pages";

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
        className="flex h-11 items-center gap-2 rounded-full border border-white/35 bg-white/55 px-3 text-[var(--color-dark)] shadow-[0_8px_24px_rgba(16,47,21,0.08)] backdrop-blur-xl transition-transform hover:-translate-y-0.5"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${userName} menu`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)]/55 text-[var(--color-primary-deep)]">
          <User size={16} />
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[320px] rounded-[24px] border border-white/45 bg-white/90 p-3 shadow-[0_24px_80px_rgba(16,47,21,0.16)] backdrop-blur-2xl">
          <div className="rounded-[20px] bg-[var(--color-bg)]/75 px-4 py-3">
            <p className="text-sm font-semibold text-[var(--color-dark)]">
              {userName}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Your Maui workspace
            </p>
          </div>

          <div className="mt-3 space-y-1">
            {appPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                onClick={() => setOpen(false)}
                className="block rounded-[18px] px-4 py-3 transition-colors hover:bg-[var(--color-bg)]"
              >
                <p className="text-sm font-medium text-[var(--color-dark)]">
                  {page.label}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[var(--color-text-secondary)]">
                  {page.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-3 border-t border-[var(--color-border)] pt-3">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium text-[var(--color-dark)] transition-colors hover:bg-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogOut size={16} />
              <span>{isPending ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
