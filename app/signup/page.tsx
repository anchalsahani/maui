"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowRight,
  Bolt,
  Brain,
  CircleDashed,
  MessageSquareHeart,
  Split,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Bolt,
    title: "AI task assignment",
    description: "Instantly picks the next task so you can start faster.",
  },
  {
    icon: Split,
    title: "Task breakdown",
    description: "Turns big, intimidating work into tiny doable steps.",
  },
  {
    icon: Brain,
    title: "Auto planning",
    description: "Builds structure for you when planning feels too heavy.",
  },
  {
    icon: MessageSquareHeart,
    title: "Emotion-aware support",
    description: "Adjusts task intensity based on what you are feeling.",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(formData: FormData) {
    setError("");
    setSuccess("");

    const payload = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!response.ok) {
      setError(data?.error ?? "Unable to create your account right now.");
      return;
    }

    setSuccess("Signup successful. Taking you to the main page...");
    window.setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1200);
  }

  function handleGoogleClick() {
    setError("Google sign up is not connected yet. Use email for now.");
    setSuccess("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-3 py-2 sm:px-4 sm:py-2 lg:px-5 lg:py-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-54 bg-[radial-gradient(circle_at_top,rgba(207,232,213,0.95),transparent_62%)]" />
      <div className="pointer-events-none absolute right-[-8rem] top-16 h-64 w-64 rounded-full bg-[var(--color-primary)]/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-5rem] left-[-4rem] h-56 w-56 rounded-full bg-[var(--color-accent)] blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-1rem)] w-full max-w-7xl overflow-hidden rounded-[28px] border border-black/5 bg-white/60 shadow-[0_25px_90px_rgba(53,85,63,0.12)] backdrop-blur-xl lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(243,249,245,0.98))] px-5 py-4 sm:px-6 sm:py-5 lg:px-9 lg:py-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--color-primary)]/18 text-[var(--color-primary-deep)]">
                  <CircleDashed size={18} />
                </div>
                <div>
                  <p className="text-base font-semibold tracking-[-0.04em] text-[var(--color-dark)]">
                    Maui
                  </p>
                  <p className="text-[13px] text-[var(--color-text-secondary)]">
                    Helping you start, gently.
                  </p>
                </div>
              </Link>

              <div className="hidden rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-1.5 text-[13px] text-[var(--color-text-secondary)] sm:block">
                One calm step at a time
              </div>
            </div>

            <div className="max-w-xl space-y-5 pt-2 lg:pt-4">
              <div className="space-y-4">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-primary)]/22 bg-[var(--color-accent)]/50 px-3 py-1.5 text-[12px] font-medium text-[var(--color-primary-deep)]">
                  <Sparkles size={13} />
                  Gentle support for rough days
                </div>

                <h1 className="text-[clamp(2.1rem,3.9vw,3.7rem)] font-bold leading-[0.92] text-[var(--color-dark)]">
                  <span className="block">Start even when</span>
                  <span className="block">your brain says no.</span>
                </h1>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-secondary)]/80">
                What you get
              </p>
              <div className="mt-3 space-y-3">
                {features.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="flex items-start gap-4 rounded-[22px] border border-[var(--color-border)] bg-white/72 px-4 py-3 shadow-[0_12px_35px_rgba(53,85,63,0.06)] backdrop-blur-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/14 text-[var(--color-primary-deep)]">
                      <Icon size={17} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[15px] font-semibold text-[var(--color-dark)]">
                        {title}
                      </p>
                      <p className="text-[13px] leading-5 text-[var(--color-text-secondary)]">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(241,250,244,0.98),rgba(217,236,223,0.96))] px-4 py-4 sm:px-5 sm:py-4 lg:px-7 lg:pt-30 lg:pb-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.78),transparent_28%),radial-gradient(circle_at_20%_30%,rgba(143,191,159,0.26),transparent_30%)]" />
            <div className="absolute right-[-4rem] top-8 h-64 w-64 rounded-full bg-[var(--color-accent)]/80 blur-3xl" />
            <div className="absolute left-[-4rem] top-28 h-64 w-64 rounded-full bg-[var(--color-primary)]/22 blur-3xl" />
            <div className="absolute bottom-10 right-[-3rem] h-48 w-80 rounded-[100%] bg-[linear-gradient(135deg,rgba(207,232,213,0.92),rgba(143,191,159,0.46))] blur-2xl" />
            <div className="absolute bottom-4 left-2 h-28 w-64 rounded-[999px] border border-white/55 bg-white/28 opacity-90 blur-[1px]" />
            <div className="absolute bottom-14 left-14 h-20 w-52 rounded-[999px] border border-white/45 bg-[var(--color-accent)]/28 opacity-85 blur-[1px]" />
            <div className="absolute top-1/2 right-10 h-24 w-40 rounded-[999px] bg-[var(--color-primary)]/16 blur-2xl" />
          </div>

          <div className="relative ml-auto w-full max-w-lg rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4 shadow-[var(--shadow-card)] sm:p-4.5">
            <div className="flex flex-col gap-2 border-b border-[var(--color-border)] pb-3.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-accent)]/55 px-3 py-1 text-[12px] font-medium text-[var(--color-primary-deep)]">
                  Your first step starts here
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-[1.45rem] font-semibold leading-none text-[var(--color-dark)] sm:text-[1.7rem]">
                    Create your calm setup.
                  </h2>
                  <p className="max-w-sm text-[12px] leading-5 text-[var(--color-text-secondary)] sm:text-[13px]">
                    One account. One decision. Then you can begin.
                  </p>
                </div>
              </div>

              <p className="pt-0.5 text-[12px] text-[var(--color-text-secondary)] sm:text-[13px]">
                Already with us?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[var(--color-primary-deep)] transition-opacity hover:opacity-75"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <form
              className="mt-3.5 space-y-2.5"
              action={(formData) => startTransition(() => void handleSignup(formData))}
            >
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-[12px] font-medium text-[var(--color-dark)]">
                    First name
                  </span>
                  <input
                    name="firstName"
                    type="text"
                    placeholder="Anchal"
                    className="input"
                    disabled={isPending}
                    autoComplete="given-name"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-[12px] font-medium text-[var(--color-dark)]">
                    Last name
                  </span>
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Sharma"
                    className="input"
                    disabled={isPending}
                    autoComplete="family-name"
                  />
                </label>
              </div>

              <label className="space-y-1">
                <span className="text-[12px] font-medium text-[var(--color-dark)]">
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

              <label className="space-y-1">
                <span className="text-[12px] font-medium text-[var(--color-dark)]">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="input"
                  disabled={isPending}
                  autoComplete="new-password"
                />
              </label>

              <label className="flex items-start gap-2.5 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-bg)]/75 p-2.5">
                <input
                  type="checkbox"
                  className="mt-0.5 h-3.5 w-3.5 rounded border-[var(--color-border-strong)] text-[var(--color-primary-deep)] accent-[var(--color-primary-deep)]"
                  disabled={isPending}
                />
                <span className="text-[11px] leading-4.5 text-[var(--color-text-secondary)] sm:text-[12px]">
                  Send me occasional focus tips and product updates. Keep it useful,
                  never noisy.
                </span>
              </label>

              {error ? (
                <p className="rounded-2xl border border-[var(--color-error)]/25 bg-[var(--color-error)]/8 px-4 py-3 text-sm text-[var(--color-error)]">
                  {error}
                </p>
              ) : null}

              {success ? (
                <p className="rounded-2xl border border-[var(--color-primary)]/25 bg-[var(--color-accent)]/45 px-4 py-3 text-sm text-[var(--color-primary-deep)]">
                  {success}
                </p>
              ) : null}

              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 pt-0.5">
                <button
                  type="submit"
                  disabled={isPending}
                  className="group flex h-10 min-w-0 items-center justify-center gap-2 rounded-full bg-[var(--color-primary-deep)] px-3.5 text-[12px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-dark)] hover:shadow-[0_16px_30px_rgba(26,26,26,0.14)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="truncate">
                    {isPending ? "Creating..." : "Create account"}
                  </span>
                  <ArrowRight
                    size={14}
                    className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>

                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  or
                </span>

                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={isPending}
                  className="flex h-10 min-w-0 items-center justify-center gap-2 rounded-full bg-[#171717] px-3.5 text-[12px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-[#4285F4]">
                    G
                  </span>
                  <span className="truncate">Sign up with Google</span>
                </button>
              </div>
            </form>

            <p className="mt-3 text-center text-[10px] leading-4.5 text-[var(--color-text-secondary)] sm:text-[11px]">
              By signing up, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
