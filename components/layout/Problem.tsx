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
    <section className="relative overflow-hidden bg-amber-50 py-16 sm:py-24">
      {/* BG GLOW */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]/8 blur-[120px]" />

      {/* GRID */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* BADGE */}
          <div className="glass-card mb-4 inline-flex rounded-full px-4 py-2">
            <span className="text-[12px] font-medium text-[var(--color-dark)]/70">
              The problems
            </span>
          </div>

          {/* HEADING */}
          <h4 className="text-[clamp(1.45rem,7vw,1.8rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-[var(--color-dark)] sm:leading-[1.3] sm:tracking-[-0.04em]">
            Knowing what to do{" "}
            <span className="relative inline-block text-[var(--color-mainstar)]">
              isn&apos;t enough
            </span>{" "}
            <br></br>
            {" "}
            <span className="relative inline-block text-[var(--color-mainstar)]">
              executive dysfuntion
            </span>{" "}
            can still keep you stuck.
          </h4>

          {/* SUBTEXT */}
          <p className="mx-auto mt-4 max-w-full text-center text-[0.98rem] leading-7 text-[var(--color-dark)] sm:text-[1.05rem]">
            ADHD creates {" "} <span className="relative inline-block text-[var(--color-mainstar)]">
            invisible friction
            </span>{" "} between <br></br> intention,
            action, overwhelm, and emotional burnout.
          </p>
        </motion.div>

        {/* ITEMS */}
        <div className="mt-10 space-y-6 sm:mt-16 sm:space-y-8">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
              }}
              className="grid items-center gap-4 rounded-[24px] border border-white/60 bg-white/42 p-3 shadow-[0_12px_35px_rgba(53,85,63,0.06)] backdrop-blur-sm sm:gap-6 sm:p-4 lg:grid-cols-[240px_1fr]"
            >
              {/* VISUAL CARD */}
              <div className="relative overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:rounded-[24px] sm:p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/[0.03] to-transparent" />

                {/* GRID */}
                {problem.visual === "grid" && (
                  <div className="grid grid-cols-8 gap-1.5">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={
                          i === 22
                            ? {
                                opacity: [0.5, 1, 0.5],
                                scale: [1, 1.06, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className={`h-5 rounded-md ${
                          i === 22
                            ? "bg-[var(--color-primary)] shadow-[0_0_16px_rgba(143,191,159,0.3)]"
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
                  <div className="flex h-[110px] items-end gap-1.5">
                    {[22, 18, 74, 16, 10, 14, 13, 15, 12, 12, 78, 58].map(
                      (height, i) => (
                        <motion.div
                          key={i}
                          animate={
                            i === 2 || i === 10 || i === 11
                              ? {
                                  height: [
                                    `${height}%`,
                                    `${height + 8}%`,
                                    `${height}%`,
                                  ],
                                }
                              : {}
                          }
                          transition={{
                            duration: 2,
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
                  <div className="flex h-[110px] items-center justify-center gap-1.5">
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
                          delay: i * 0.1,
                        }}
                        className={`h-full w-1.5 rounded-full ${
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
              <div className="mx-auto max-w-md px-1 text-center lg:text-left">
                <h3 className="text-[1.35rem] font-semibold leading-[1.1] tracking-[-0.04em] text-[var(--color-dark)]">
                  {problem.title}
                </h3>

                <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--color-text-secondary)]">
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
