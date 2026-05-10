"use client";

import { motion } from "framer-motion";

const problems = [
  {
    title: "Starting feels physically heavy",
    text: "Even simple tasks can feel impossible to begin when your brain treats effort like danger.",
    visual: "grid",
  },
  {
    title: "Overwhelm creates shutdown",
    text: "Too many tabs, thoughts, decisions, and expectations pile up until your brain freezes completely.",
    visual: "bars",
  },
  {
    title: "Guilt turns into avoidance",
    text: "The longer something stays unfinished, the harder it becomes to return without shame or anxiety.",
    visual: "lines",
  },
];

export default function ProblemSection() {
  return (
    <section className="relative overflow-hidden py-28">
      {/* BG GLOW */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]/8 blur-[120px]" />

      {/* GRID */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          {/* BADGE */}
          <div className="glass-card mb-5 inline-flex rounded-full px-5 py-2">
            <span className="text-[13px] font-medium text-[var(--color-dark)]/70">
              The problem
            </span>
          </div>

          {/* HEADING */}
            <h4 className="text-[clamp(1.3rem,2vw,2rem)] font-semibold leading-[1.2] tracking-[-0.04em] text-[var(--color-dark)]">
              Because{" "}
              
              <span className="relative inline-block text-[var(--color-primary-deep)]">
                “just start”
              </span>{" "}
              
              isn&apos;t that simple.
            </h4>
        </motion.div>

        {/* ITEMS */}
        <div className="mt-24 space-y-10">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: index * 0.08,
              }}
              className="grid items-center gap-8 lg:grid-cols-[320px_1fr]"
            >
              {/* VISUAL CARD */}
              <div className="relative overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/[0.03] to-transparent" />

                {/* GRID */}
                {problem.visual === "grid" && (
                  <div className="grid grid-cols-8 gap-2">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={
                          i === 22
                            ? {
                                opacity: [0.5, 1, 0.5],
                                scale: [1, 1.08, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className={`h-8 rounded-lg ${
                          i === 22
                            ? "bg-[var(--color-primary)] shadow-[0_0_20px_rgba(143,191,159,0.35)]"
                            : i === 19
                            ? "bg-[var(--color-primary)]/10"
                            : "bg-[var(--color-dark)]/[0.04]"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* BARS */}
                {problem.visual === "bars" && (
                  <div className="flex h-[170px] items-end gap-2">
                    {[22, 18, 74, 16, 10, 14, 13, 15, 12, 12, 78, 58].map(
                      (height, i) => (
                        <motion.div
                          key={i}
                          animate={
                            i === 2 || i === 10 || i === 11
                              ? {
                                  height: [
                                    `${height}%`,
                                    `${height + 10}%`,
                                    `${height}%`,
                                  ],
                                }
                              : {}
                          }
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.08,
                          }}
                          className={`w-full rounded-full ${
                            i === 2 || i === 10 || i === 11
                              ? "bg-[var(--color-primary)]"
                              : "bg-[var(--color-dark)]/[0.05]"
                          }`}
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      )
                    )}
                  </div>
                )}

                {/* LINES */}
                {problem.visual === "lines" && (
                  <div className="flex h-[170px] items-center justify-center gap-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={
                          i > 5 && i < 14
                            ? {
                                opacity: [0.2, 0.8, 0.2],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.12,
                        }}
                        className={`h-full w-2 rounded-full ${
                          i > 5 && i < 14
                            ? "bg-[var(--color-primary)]/18"
                            : "bg-[var(--color-dark)]/[0.04]"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* TEXT */}
              <div className="max-w-lg">
                <h3 className="text-[2rem] font-bold leading-[1] tracking-[-0.05em] text-[var(--color-dark)]">
                  {problem.title}
                </h3>

                <p className="mt-4 text-[1rem] leading-relaxed text-[var(--color-text-secondary)]">
                  {problem.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}