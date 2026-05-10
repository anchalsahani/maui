import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[var(--color-bg)]">
      {/* NAVBAR */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute left-1/2 top-[10%] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]/10 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px] rounded-full bg-[var(--color-accent)]/60 blur-[120px]" />

      {/* SUBTLE GRID */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* SOFT WAVE */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-30">
        <svg
          viewBox="0 0 1440 320"
          className="h-[180px] w-full"
          preserveAspectRatio="none"
        >
          <path
            fill="var(--color-primary)"
            fillOpacity="0.12"
            d="M0,224L80,218.7C160,213,320,203,480,197.3C640,192,800,192,960,197.3C1120,203,1280,213,1360,218.7L1440,224L1440,320L0,320Z"
          />
        </svg>
      </div>

      {/* HERO */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* BADGE */}
        <div className="glass-card mb-8 rounded-full px-6 py-2">
          <span className="text-[13px] font-medium text-[var(--color-dark)]/70">
            Work with your brain, not against it.
          </span>
        </div>

        {/* HEADLINE */}
        <div className="max-w-7xl">
          <h1 className="text-[clamp(3.2rem,8vw,6.2rem)] font-bold leading-[0.92] tracking-[-0.07em] text-[var(--color-dark)]">
            Helping you start,
            <br />

            <span className="text-[var(--color-primary-deep)]">
              even on your worst days.
            </span>
          </h1>
        </div>

        {/* BUTTON */}
        <div className="mt-12 transition-transform duration-300 hover:scale-[1.03]">
          <Button variant="secondary">
            Watch Demo
          </Button>
        </div>
      </main>

      {/* BOTTOM FADE */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
    </div>
  );
}