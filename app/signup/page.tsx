"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { ArrowRight, CircleDashed, ShieldCheck } from "lucide-react";

import styles from "./Signup.module.css";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const googleAuthError = searchParams.get("authError");

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

    setSuccess("Account created. Preparing your Maui setup...");
    window.setTimeout(() => {
      router.push("/onboarding");
      router.refresh();
    }, 1200);
  }

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.shell}>
        <section className={styles.story} aria-label="About Maui">
          <Link href="/" className={styles.brand} aria-label="Maui home">
            <span className={styles.brandMark}>
              <CircleDashed size={19} strokeWidth={1.8} />
            </span>
            <span>Maui</span>
          </Link>

          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>Maui</p>
            <h1>Welcome to Maui.</h1>
            <p>
              Create your account to personalise Maui around the way you work.
            </p>
          </div>

          <div className={styles.illustration} aria-hidden="true">
            <svg viewBox="0 0 520 300" role="presentation">
              <defs>
                <radialGradient id="signup-orb" cx="50%" cy="45%" r="58%">
                  <stop offset="0%" stopColor="var(--color-accent)" />
                  <stop
                    offset="70%"
                    stopColor="var(--color-primary)"
                    stopOpacity="0.36"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-primary)"
                    stopOpacity="0"
                  />
                </radialGradient>
              </defs>
              <circle cx="260" cy="150" r="112" fill="url(#signup-orb)" />
              <circle
                cx="260"
                cy="150"
                r="86"
                fill="none"
                stroke="var(--color-primary)"
                strokeOpacity="0.28"
              />
              <circle
                cx="260"
                cy="150"
                r="54"
                fill="var(--color-card)"
                stroke="var(--color-border-strong)"
              />
              <path
                d="M90 184C145 124 194 124 260 164C326 204 378 205 430 138"
                fill="none"
                stroke="var(--color-primary)"
                strokeLinecap="round"
                strokeOpacity="0.48"
                strokeWidth="3"
              />
              <circle cx="91" cy="184" r="7" fill="var(--color-primary)" />
              <circle cx="430" cy="138" r="7" fill="var(--color-accent)" />
              <path
                d="m245 151 11 11 22-26"
                fill="none"
                stroke="var(--color-primary-deep)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="5"
              />
            </svg>
          </div>

          <p className={styles.trust}>
            <span aria-hidden="true" />
            Free to start. Set up in under a minute.
          </p>
        </section>

        <section className={styles.formPanel}>
          <div className={styles.mobileBrandRow}>
            <Link href="/" className={styles.brand} aria-label="Maui home">
              <span className={styles.brandMark}>
                <CircleDashed size={18} strokeWidth={1.8} />
              </span>
              <span>Maui</span>
            </Link>
            <Link href="/login" className={styles.signInLink}>
              Sign in
            </Link>
          </div>

          <div className={styles.formCard}>
            <header className={styles.formHeader}>
              <div>
                <p className={styles.eyebrow}>Maui account</p>
                <h2>Create your account.</h2>
                <p>It only takes a minute to get started.</p>
              </div>
              <p className={styles.desktopSignIn}>
                Already a member?{" "}
                <Link href="/login" className={styles.signInLink}>
                  Sign in
                </Link>
              </p>
            </header>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/api/auth/google";
              }}
              disabled={isPending}
              className={styles.googleButton}
            >
              <span aria-hidden="true">G</span>
              Continue with Google
            </button>

            <div className={styles.divider}>
              <span />
              <small>or use email</small>
              <span />
            </div>

            <form
              className={styles.form}
              action={(formData) =>
                startTransition(() => void handleSignup(formData))
              }
            >
              <div className={styles.nameGrid}>
                <Field
                  label="First name"
                  name="firstName"
                  autoComplete="given-name"
                  placeholder="John"
                  disabled={isPending}
                />
                <Field
                  label="Last name"
                  name="lastName"
                  autoComplete="family-name"
                  placeholder="Doe"
                  disabled={isPending}
                />
              </div>

              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isPending}
              />

              <Field
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
                disabled={isPending}
                hint="Use 8 or more characters."
              />

              {error || googleAuthError ? (
                <p className={styles.error} role="alert">
                  {error ||
                    (googleAuthError === "google_configuration"
                      ? "Google sign up is not configured yet."
                      : googleAuthError === "google_cancelled"
                        ? "Google sign in was cancelled. Please try again when you are ready."
                        : googleAuthError === "google_state_invalid"
                          ? "Your Google sign-in session expired or was opened from another domain. Please start again from this page."
                      : "Google sign up could not be completed. Please try again.")}
                </p>
              ) : null}

              {success ? (
                <p className={styles.success} role="status" aria-live="polite">
                  {success}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isPending}
                className={styles.submitButton}
              >
                <span>{isPending ? "Creating account..." : "Create account"}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>

            <div className={styles.assurance}>
              <ShieldCheck size={15} aria-hidden="true" />
              <span>No credit card required.</span>
            </div>

            <p className={styles.terms}>
              By creating an account, you agree to Maui&apos;s Terms and Privacy
              Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  placeholder: string;
  autoComplete: string;
  disabled: boolean;
  minLength?: number;
  hint?: string;
};

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  minLength,
  hint,
}: FieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        minLength={minLength}
        required
      />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.loading}>
          <div aria-label="Loading sign up" />
        </main>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
