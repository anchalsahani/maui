"use client";

import { motion } from "framer-motion";
import {
  PlayCircle,
  Brain,
  Heart,
  Target,
  LockKeyhole,
  UsersRound,
  Leaf,
} from "lucide-react";

const solutions = [
  {
    step: "1",
    title: "Breaks tasks into tiny steps",
    text: "Turns overwhelming tasks into small, clear next steps.",
    icon: Brain,
    rotate: "-rotate-6",
    translate: "lg:translate-y-10",
  },
  {
    step: "2",
    title: "Helps you start within 10 seconds",
    text: "Reduces friction and helps you take action immediately.",
    icon: PlayCircle,
    rotate: "rotate-0",
    translate: "z-20",
  },
  {
    step: "3",
    title: "Adjusts to your emotional state",
    text: "Reads your mood and adapts sessions to support you.",
    icon: Heart,
    rotate: "rotate-6",
    translate: "lg:translate-y-8",
  },
];

const trustCards = [
  {
    title: "Evidence-based",
    text: "Grounded in neuroscience and psychology.",
    icon: Target,
  },
  {
    title: "Private & secure",
    text: "Your data is encrypted and never shared.",
    icon: LockKeyhole,
  },
  {
    title: "Trusted by thousands",
    text: "Join a growing community feeling better every day.",
    icon: UsersRound,
  },
  {
    title: "Small steps, big change",
    text: "Consistent progress, one session at a time.",
    icon: Leaf,
  },
];

export default function ProblemSection() {
  return (
    <section className="relative overflow-hidden py-32">
      {/* BG */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(143,191,159,0.08),transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          {/* BADGE */}
          <div className="glass-card mb-5 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2">
            <span className="text-[12px] font-medium text-[var(--color-dark)]/70">
              The solution
            </span>
          </div>

          {/* HEADING */}
          <h4 className="text-[clamp(1.2rem,2vw,1.8rem)] font-semibold leading-[1.3] tracking-[-0.04em] text-[var(--color-dark)]">
            Meet MAUI - {" "} <br></br>
            <span className="text-[var(--color-mainstar)]">
              A Real-Time Adaptive Productivity System <br></br> for ADHD & Executive Dysfunction
            </span>
          </h4>

          {/* SUBTEXT */}
          <p className="mx-auto mt-4  max-w-full text-center text-[1.05rem] leading-relaxed text-[var(--color-dark)]">
            MAUI helps people with ADHD and executive dysfunction start tasks, manage overwhelm, and stay productive through real-time adaptive planning and behavioral support.
          </p>
        </motion.div>

        {/* CARDS */}
        <div className="relative mt-28 flex flex-col items-center justify-center gap-10 lg:flex-row lg:gap-0">
          {solutions.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{
                  opacity: 0,
                  y: 60,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.12,
                }}
                className={`relative ${item.rotate} ${item.translate}`}
              >

                {/* CARD */}
                <div className="group relative w-[320px] overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_100px_rgba(143,191,159,0.12)] sm:w-[360px] lg:w-[390px]">
                  {/* GLOW */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* CONTENT */}
                  <div className="relative z-10">
                    {/* ICON */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[var(--color-primary)]/10">
                      <Icon className="h-10 w-10 text-[var(--color-mainstar)]" />
                    </div>

                    {/* TITLE */}
                    <h3 className="mt-8 max-w-[260px] text-[1.9rem] font-semibold leading-[1] tracking-[-0.05em] text-[var(--color-dark)]">
                      {item.title}
                    </h3>

                    {/* TEXT */}
                    <p className="mt-5 max-w-[300px] text-[1rem] leading-relaxed text-[var(--color-text-secondary)]">
                      {item.text}
                    </p>

                    {/* FAKE UI */}
                    <div className="mt-8 space-y-3">
                      <div className="h-3 w-full rounded-full bg-[var(--color-dark)]/[0.05]" />
                      <div className="h-3 w-[85%] rounded-full bg-[var(--color-dark)]/[0.05]" />
                      <div className="h-3 w-[60%] rounded-full bg-[var(--color-primary)]/20" />
                    </div>
                  </div>
                </div>

                {/* ARROW */}
                {index !== solutions.length - 1 && (
                  <div className="absolute -right-10 top-1/2 z-30 hidden -translate-y-1/2 lg:flex">
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* TRUST CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-28 max-w-7xl"
        >
          <div className="relative overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[rgba(255,255,255,0.74)] px-6 py-6 shadow-[0_20px_80px_rgba(47,74,57,0.08)] backdrop-blur-2xl sm:px-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-[var(--color-border)]">
              {trustCards.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.08 * index }}
                    className="flex items-center gap-4 px-2 py-2 xl:px-6"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-primary)]/12 shadow-[0_12px_32px_rgba(47,74,57,0.10)]">
                      <Icon className="h-8 w-8 text-[var(--color-mainstar)]" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-[1rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--color-dark)]">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-[0.92rem] leading-relaxed text-[var(--color-text-secondary)]">
                        {item.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
