"use client";

import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--color-bg)] px-4 pb-6 pt-24 sm:px-6 lg:px-8">
      <section className="relative flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(250,250,250,0.68))] shadow-[0_30px_90px_rgba(47,74,57,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] sm:rounded-[2.5rem]">
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-[var(--color-primary)]/10" />

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute left-1/2 top-[10%] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]/10 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px] rounded-full bg-[var(--color-accent)]/60 blur-[120px]" />

      {/* SUBTLE GRID */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* HERO */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-44 pt-20 text-center">
        {/* BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card mb-8 rounded-full border border-[var(--color-border)] bg-white/60 px-6 py-2 backdrop-blur-xl"
        >
          <span className="text-[13px] font-medium text-[var(--color-dark)]/70">
            Work with your brain, not against it.
          </span>
        </motion.div>

        {/* HEADLINE */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-7xl"
        >
          <h1 className="text-[clamp(3.4rem,8vw,6.8rem)] font-bold leading-[0.9] tracking-[-0.08em] text-[var(--color-dark)]">
            Helping you start,
            <br />

            <span className="bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-primary)] bg-clip-text text-transparent">
              even on your worst days.
            </span>
          </h1>
        </motion.div>

        {/* BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-12 transition-transform duration-300 hover:scale-[1.03]"
        >
          <Button variant="secondary">
            Watch Demo
          </Button>
        </motion.div>
      </main>

      {/* HANDHOLD STYLE RIBBON WAVE */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[-3vh] z-0 h-[clamp(170px,22vw,280px)] overflow-visible">
        <motion.div
          animate={{
            x: ["-2.5%", "2.5%", "-2.5%"],
            y: [0, -8, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-1/2 w-[145vw] min-w-[1180px] -translate-x-1/2 -translate-y-1/2"
        >
          <svg
            viewBox="0 0 1800 420"
            preserveAspectRatio="none"
            className="h-[clamp(170px,22vw,280px)] w-full"
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
        </motion.div>
      </div>

      {/* BOTTOM FADE */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-full bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/70 to-transparent" />
      </section>
    </div>
  );
}
