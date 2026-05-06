import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)]">

      {/* Background */}
      <div className="absolute right-[-180px] top-[-180px] h-[700px] w-[700px] rounded-full bg-[var(--color-primary)]/15 blur-3xl" />

      <div className="absolute bottom-[-200px] left-[-120px] h-[500px] w-[500px] rounded-full bg-[var(--color-accent)]/20 blur-3xl" />

      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-32">

        {/* Card */}
        <div className="w-full max-w-[480px] rounded-[32px] border border-white/20 bg-white/20 p-10 shadow-[0_8px_40px_rgba(16,47,21,0.08)] backdrop-blur-2xl">

          {/* Badge */}
          <div className="mb-6 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-xl">

            <span className="text-[13px] font-medium tracking-[-0.02em] text-[var(--color-primary)]">
              Welcome back
            </span>

          </div>

          {/* Heading */}
          <div className="mb-8 space-y-3">

            <h1 className="text-[2.5rem] font-semibold leading-[1] tracking-[-0.06em] text-[var(--color-dark)]">

              Continue where
              <br />
              you left off.

            </h1>

            <p className="text-[15px] leading-7 text-[var(--color-text-secondary)]">

              Maui helps you start before your brain
              talks you out of it.

            </p>

          </div>

          {/* Form */}
          <div className="space-y-4">

            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-2xl border border-white/20 bg-white/30 px-4 py-4 text-[15px] text-[var(--color-dark)] outline-none backdrop-blur-xl placeholder:text-[var(--color-text-secondary)] transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-2xl border border-white/20 bg-white/30 px-4 py-4 text-[15px] text-[var(--color-dark)] outline-none backdrop-blur-xl placeholder:text-[var(--color-text-secondary)] transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
            />

            {/* Button */}
            <button className="group flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[var(--color-dark)] text-[15px] font-medium text-white transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(16,47,21,0.16)]">

              <span>Login</span>

            </button>

          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)]">

            <span>Don’t have an account?</span>

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