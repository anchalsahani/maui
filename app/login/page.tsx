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
      data?.user?.onboardingCompleted && data.user.survey ? "/dashboard" : "/personalization";

    router.push(nextRoute);
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)]">
      <div className="absolute right-[-180px] top-[-180px] h-[700px] w-[700px] rounded-full bg-[var(--color-primary)]/15 blur-3xl" />
      <div className="absolute bottom-[-200px] left-[-120px] h-[500px] w-[500px] rounded-full bg-[var(--color-accent)]/20 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-20">
        <div className="w-full max-w-[480px] rounded-[32px] border border-white/20 bg-white/20 p-8 shadow-[0_8px_40px_rgba(16,47,21,0.08)] backdrop-blur-2xl sm:p-10">
          <div className="mb-6 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-xl">
            <span className="text-[13px] font-medium tracking-[-0.02em] text-[var(--color-primary)]">
              Welcome back
            </span>
          </div>

          <div className="mb-8 space-y-3">
            <h1 className="text-[2.5rem] font-semibold leading-[1] tracking-[-0.06em] text-[var(--color-dark)]">
              Continue where
              <br />
              you left off.
            </h1>

            <p className="text-[15px] leading-7 text-[var(--color-text-secondary)]">
              Maui helps you start before your brain talks you out of it.
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
              <p className="rounded-2xl border border-[var(--color-error)]/25 bg-[var(--color-error)]/8 px-4 py-3 text-sm text-[var(--color-error)]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-dark)] text-[15px] font-medium text-white transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(16,47,21,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
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
            className="mt-5 flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#171717] px-4 text-[15px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[15px] font-semibold text-[#4285F4]">
              G
            </span>
            <span>Continue with Google</span>
          </button>

          <div className="mt-8 flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)]">
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
