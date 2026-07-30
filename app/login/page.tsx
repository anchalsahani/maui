"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");

    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: string; user?: { onboardingCompleted?: boolean; survey?: unknown } }
      | null;

    if (!response.ok) {
      setError(data?.error ?? "Login failed. Please try again.");
      return;
    }

    const nextRoute =
      data?.user?.onboardingCompleted && data.user.survey ? "/dashboard" : "/onboarding";

    router.push(nextRoute);
    router.refresh();
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[var(--color-bg)]">
      <div className="app-page-wash pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-72 w-72 rounded-full bg-[var(--color-primary)]/10 blur-[72px]" />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-5 sm:px-6">
        <div className="app-card-strong w-full max-w-[500px] rounded-[26px] p-5 sm:rounded-[34px] sm:p-9">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-button-primary)] text-sm font-bold text-[var(--color-button-primary-text)]">
              M
            </span>
            <span className="text-lg font-semibold">Maui</span>
          </Link>

          <div className="mb-7 space-y-3">
            <h1 className="text-[2rem] font-semibold leading-[1] tracking-[-0.04em] text-[var(--color-dark)] sm:text-[2.5rem] sm:tracking-[-0.06em]">
              Welcome back
            </h1>

            <p className="text-[15px] leading-7 text-[var(--color-text-secondary)]">
              Sign in to continue to your Maui workspace.
            </p>
          </div>

          <form
            className="space-y-4"
            action={(formData) => startTransition(() => void handleSubmit(formData))}
          >
            <label className="block space-y-1.5">
              <span className="text-[13px] font-medium text-[var(--color-dark)]">
                Email
              </span>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                className="input"
                disabled={isPending}
                autoComplete="email"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[13px] font-medium text-[var(--color-dark)]">
                Password
              </span>
              <input
                name="password"
                type="password"
                placeholder="Your password"
                className="input"
                disabled={isPending}
                autoComplete="current-password"
              />
            </label>

            {error ? (
              <p role="alert" className="rounded-2xl border border-[var(--color-error)]/25 bg-[var(--color-error)]/8 px-4 py-3 text-sm text-[var(--color-error)]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="maui-button-primary group flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium transition-all duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>{isPending ? "Logging in..." : "Login"}</span>
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
            <div className="h-px bg-[var(--color-border)]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              or
            </span>
            <div className="h-px bg-[var(--color-border)]" />
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/api/auth/google";
            }}
            disabled={isPending}
            className="maui-button-secondary mt-5 flex h-[52px] w-full items-center justify-center gap-3 rounded-full px-4 text-[15px] font-medium transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-strong)] text-[15px] font-semibold text-[#4285F4]">
              G
            </span>
            <span>Continue with Google</span>
          </button>

          <div className="mt-7 flex flex-wrap items-center gap-2 text-[14px] text-[var(--color-text-secondary)] sm:mt-8">
            <span>Don&apos;t have an account?</span>
            <Link
              href="/signup"
              className="font-medium text-[var(--color-primary)] transition-opacity hover:opacity-70"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
