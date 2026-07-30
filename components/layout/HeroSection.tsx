import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-[var(--color-bg)] px-3 pb-4 pt-20 sm:px-6 sm:pb-6 sm:pt-24 lg:px-8">
      <section className="relative flex min-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-[1.35rem] border border-[var(--color-border)] bg-[image:var(--color-hero-panel)] shadow-[0_30px_90px_rgba(47,74,57,0.14),inset_0_1px_0_rgba(255,255,255,0.18)] sm:min-h-[calc(100vh-7.5rem)] sm:rounded-[2.5rem]">
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-[var(--color-primary)]/10" />

      {/* BACKGROUND GLOW */}
      <div className="hero-glow-primary pointer-events-none absolute left-1/2 top-[10%] h-[360px] w-[360px] -translate-x-1/2 rounded-full sm:h-[620px] sm:w-[620px]" />

      <div className="hero-glow-accent pointer-events-none absolute bottom-0 left-0 h-[260px] w-[260px] rounded-full sm:h-[420px] sm:w-[420px]" />

      {/* SUBTLE GRID */}
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div className="h-full w-full bg-[linear-gradient(to_right,var(--color-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-grid-line)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* HERO */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-36 pt-14 text-center sm:px-6 sm:pb-44 sm:pt-20">
        {/* BADGE */}
        <div className="hero-enter hero-enter-badge glass-card mb-6 max-w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 sm:mb-8 sm:px-6">
          <span className="text-[13px] font-medium text-[var(--color-dark)]/70">
            Work with your brain, not against it.
          </span>
        </div>

        {/* HEADLINE */}
        <div className="hero-enter hero-enter-heading max-w-7xl">
          <h1 className="text-[clamp(2.45rem,15vw,6.8rem)] font-bold leading-[0.92] tracking-[-0.04em] text-[var(--color-dark)] sm:leading-[0.9] sm:tracking-[-0.08em]">
            Helping you start,
            <br />

            <span className="bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-primary)] bg-clip-text text-transparent">
              even on your worst days.
            </span>
          </h1>
        </div>

        {/* BUTTON */}
        <div className="hero-enter hero-enter-cta mt-9 transition-transform duration-300 hover:scale-[1.03] sm:mt-12">
          <Button href="#problems" variant="secondary">
            Watch Demo
          </Button>
        </div>
      </main>

      {/* HANDHOLD STYLE RIBBON WAVE */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[-2vh] z-0 h-[140px] overflow-hidden sm:bottom-[-3vh] sm:h-[clamp(170px,22vw,280px)]">
        <div className="hero-ribbon-motion absolute left-1/2 top-1/2 w-[180vw] min-w-[680px] sm:w-[145vw] sm:min-w-[1180px]">
          <svg
            viewBox="0 0 1800 420"
            preserveAspectRatio="none"
            className="h-[140px] w-full sm:h-[clamp(170px,22vw,280px)]"
            aria-hidden="true"
          >
            <defs>
              <filter id="ribbonGrain" x="-12%" y="-55%" width="124%" height="210%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.82"
                  numOctaves="2"
                  seed="11"
                  result="noise"
                />
                <feColorMatrix
                  in="noise"
                  type="matrix"
                  values="0 0 0 0 0.56 0 0 0 0 0.74 0 0 0 0 0.62 0 0 0 .22 0"
                  result="coloredNoise"
                />
                <feComposite
                  in="coloredNoise"
                  in2="SourceAlpha"
                  operator="in"
                  result="clippedNoise"
                />
                <feBlend in="SourceGraphic" in2="clippedNoise" mode="multiply" />
              </filter>

              <linearGradient id="ribbonSage" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cfe8d5" stopOpacity="0.05" />
                <stop offset="18%" stopColor="#f0d98b" stopOpacity="0.54" />
                <stop offset="36%" stopColor="var(--color-primary)" stopOpacity="0.34" />
                <stop offset="58%" stopColor="#f4d778" stopOpacity="0.55" />
                <stop offset="80%" stopColor="var(--color-primary)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#f0d98b" stopOpacity="0.1" />
              </linearGradient>

              <linearGradient id="ribbonBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.06" />
                <stop offset="22%" stopColor="#5ba8ff" stopOpacity="0.58" />
                <stop offset="45%" stopColor="#d7ebff" stopOpacity="0.08" />
                <stop offset="72%" stopColor="#4d9df7" stopOpacity="0.52" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            <g filter="url(#ribbonGrain)" opacity="0.96" style={{ mixBlendMode: "multiply" }}>
              <path
                d="M-80 214C40 130 154 130 260 216C368 304 478 306 588 216C706 118 832 112 958 212C1078 306 1198 308 1318 216C1440 122 1556 124 1680 214C1778 286 1886 294 1962 238"
                fill="none"
                stroke="url(#ribbonSage)"
                strokeLinecap="round"
                strokeWidth="102"
              />
              <path
                d="M-100 246C28 312 154 292 274 202C386 118 496 112 606 202C720 296 846 300 966 206C1084 112 1210 114 1330 208C1452 302 1568 306 1690 212C1782 142 1884 122 1980 176"
                fill="none"
                stroke="url(#ribbonBlue)"
                strokeLinecap="round"
                strokeWidth="82"
              />
            </g>

            <g opacity="0.5">
              <path
                d="M-80 214C40 130 154 130 260 216C368 304 478 306 588 216C706 118 832 112 958 212C1078 306 1198 308 1318 216C1440 122 1556 124 1680 214C1778 286 1886 294 1962 238"
                fill="none"
                stroke="white"
                strokeLinecap="round"
                strokeWidth="22"
              />
              <path
                d="M-100 246C28 312 154 292 274 202C386 118 496 112 606 202C720 296 846 300 966 206C1084 112 1210 114 1330 208C1452 302 1568 306 1690 212C1782 142 1884 122 1980 176"
                fill="none"
                stroke="white"
                strokeLinecap="round"
                strokeWidth="16"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* BOTTOM FADE */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-full bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/70 to-transparent" />
      </section>
    </div>
  );
}
