"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";

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

const stackCards = [
  { x: 0, y: 0, rotate: -1.4, accent: false },
  { x: -16, y: -10, rotate: 2, accent: false },
  { x: 12, y: -21, rotate: -1.5, accent: true },
  { x: -7, y: -32, rotate: 1.4, accent: false },
  { x: 17, y: -43, rotate: -1.8, accent: false },
  { x: -14, y: -54, rotate: 1.1, accent: false },
];

const thoughts = [
  { size: 18, start: [-52, -24], drift: [-36, -30], cluster: [-16, -10], delay: 0 },
  { size: 24, start: [42, -28], drift: [54, -12], cluster: [9, -14], delay: 0.25, accent: true },
  { size: 16, start: [-44, 30], drift: [-58, 12], cluster: [-2, 9], delay: 0.55 },
  { size: 22, start: [28, 34], drift: [46, 26], cluster: [16, 8], delay: 0.8 },
  { size: 14, start: [0, -42], drift: [-10, -54], cluster: [-10, -2], delay: 1.1 },
  { size: 20, start: [62, 8], drift: [34, 46], cluster: [4, 16], delay: 1.35, accent: true },
  { size: 15, start: [-64, 4], drift: [-34, 42], cluster: [-18, 14], delay: 1.65 },
  { size: 17, start: [8, 52], drift: [22, 35], cluster: [13, -1], delay: 1.95 },
  { size: 13, start: [-16, 10], drift: [8, -24], cluster: [-5, -15], delay: 2.25 },
];

function StackingCardsIllustration() {
  return (
    <div className="relative z-10 h-[124px] overflow-hidden">
      <div className="absolute bottom-3 left-1/2 h-2 w-28 -translate-x-1/2 rounded-full bg-[var(--color-mainstar)]/20 blur-[1px]" />
      <div className="problem-stack-frame absolute bottom-5 left-1/2 h-[82px] w-[138px] -translate-x-1/2 origin-bottom">
        {stackCards.map((card, i) => (
          <div
            key={i}
            className="problem-stack-card absolute left-1/2 top-1/2 h-[34px] w-[108px] rounded-xl border shadow-[0_12px_22px_rgba(53,85,63,0.16)]"
            style={{
              "--x": `${card.x}px`,
              "--y": `${card.y}px`,
              "--r": `${card.rotate}deg`,
              "--start-opacity": i === 0 ? "1" : "0.42",
              "--delay": `${i * 0.12}s`,
              backgroundColor: card.accent
                ? "rgba(143, 191, 159, 0.9)"
                : "rgba(57, 92, 67, 0.34)",
              borderColor: card.accent
                ? "rgba(90, 118, 99, 0.38)"
                : "rgba(57, 92, 67, 0.28)",
            } as CSSProperties}
          >
            <div
              className={`absolute left-3 top-3 h-1.5 rounded-full ${
                card.accent
                  ? "w-8 bg-[var(--color-mainstar)]/45"
                  : "w-10 bg-[var(--color-mainstar)]/35"
              }`}
            />
            <div className="absolute bottom-3 left-3 h-1.5 w-14 rounded-full bg-white/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ThoughtClusterIllustration() {
  return (
    <div className="relative z-10 h-[110px] overflow-hidden">
      <div className="problem-thought-ring absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-mainstar)]/12" />
      {thoughts.map((thought, i) => (
        <div
          key={i}
          className={`problem-thought absolute left-1/2 top-1/2 rounded-full border border-white/60 shadow-[0_8px_18px_rgba(53,85,63,0.06)] ${
            thought.accent
              ? "bg-[var(--color-primary)]/90"
              : "bg-[var(--color-mainstar)]/40"
          }`}
          style={{
            "--sx": `${thought.start[0] * 1.15}px`,
            "--sy": `${thought.start[1] * 1.15}px`,
            "--dx": `${thought.drift[0] * 1.2}px`,
            "--dy": `${thought.drift[1] * 1.2}px`,
            "--cx": `${thought.cluster[0]}px`,
            "--cy": `${thought.cluster[1]}px`,
            "--delay": `${thought.delay * 0.45}s`,
            width: thought.size,
            height: thought.size,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

function AvoidanceIllustration() {
  return (
    <div className="relative z-10 flex h-[110px] items-center justify-center overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-20 w-32 -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-[var(--color-mainstar)]/10" />
      <div className="absolute left-1/2 top-1/2 h-12 w-20 -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-[var(--color-mainstar)]/12" />
      <div className="problem-avoidance-card relative h-[58px] w-[132px] rounded-2xl border border-[var(--color-primary-deep)]/35 bg-[var(--color-mainstar)]/35 shadow-[0_16px_30px_rgba(53,85,63,0.2)]">
        <div className="absolute left-4 top-4 h-3 w-3 rounded-md border border-[var(--color-primary-deep)]/40 bg-[var(--color-primary)]/80" />
        <div className="absolute left-10 top-[18px] h-1.5 w-16 rounded-full bg-[var(--color-mainstar)]/35" />
        <div className="absolute bottom-4 left-4 h-1.5 w-24 rounded-full bg-white/70" />
      </div>
    </div>
  );
}

function ProblemAnimationStyles() {
  return (
    <style>{`
      .problem-stack-frame {
        animation: problem-stack-weight 5.8s ease-in-out infinite;
      }

      .problem-stack-card {
        animation: problem-stack-card 5.8s ease-in-out infinite;
        animation-delay: var(--delay);
        opacity: var(--start-opacity);
        transform: translate(-50%, -50%) translate(calc(var(--x) - 76px), calc(var(--y) - 42px)) rotate(calc(var(--r) - 5deg));
      }

      .problem-thought {
        animation: problem-thought-cluster 5.6s ease-in-out infinite;
        animation-delay: var(--delay);
        opacity: 0.7;
        transform: translate(-50%, -50%) translate(var(--sx), var(--sy)) scale(0.9);
      }

      .problem-thought-ring {
        animation: problem-thought-ring 5.6s ease-in-out infinite;
      }

      .problem-avoidance-card {
        animation: problem-avoidance-drift 5.4s ease-in-out infinite;
        opacity: 1;
        transform: translateY(8px) scale(1.08);
      }

      @keyframes problem-stack-weight {
        0%, 58%, 100% {
          transform: translateX(-50%) translateY(0) scaleY(1);
        }
        76%, 90% {
          transform: translateX(-50%) translateY(12px) scaleY(0.88);
        }
      }

      @keyframes problem-stack-card {
        0%, 100% {
          opacity: var(--start-opacity);
          transform: translate(-50%, -50%) translate(calc(var(--x) - 76px), calc(var(--y) - 42px)) rotate(calc(var(--r) - 5deg));
        }
        8% {
          opacity: var(--start-opacity);
          transform: translate(-50%, -50%) translate(calc(var(--x) - 34px), calc(var(--y) - 18px)) rotate(calc(var(--r) - 2deg));
        }
        22% {
          opacity: 1;
          transform: translate(-50%, -50%) translate(var(--x), var(--y)) rotate(var(--r));
        }
        46% {
          opacity: 1;
          transform: translate(-50%, -50%) translate(calc(var(--x) - 2px), calc(var(--y) + 3px)) rotate(calc(var(--r) + 0.3deg));
        }
        70% {
          opacity: 1;
          transform: translate(-50%, -50%) translate(calc(var(--x) + 2px), calc(var(--y) + 5px)) rotate(calc(var(--r) + 0.6deg));
        }
        90% {
          opacity: 1;
          transform: translate(-50%, -50%) translate(calc(var(--x) + 3px), calc(var(--y) + 5px)) rotate(calc(var(--r) + 0.6deg));
        }
      }

      @keyframes problem-thought-cluster {
        0%, 100% {
          opacity: 0.7;
          transform: translate(-50%, -50%) translate(var(--sx), var(--sy)) scale(0.9);
        }
        18% {
          opacity: 0.82;
          transform: translate(-50%, -50%) translate(calc(var(--sx) * 0.88), calc(var(--sy) * 0.88)) scale(1.08);
        }
        48% {
          opacity: 0.96;
          transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.94);
        }
        72%, 88% {
          opacity: 1;
          transform: translate(-50%, -50%) translate(var(--cx), var(--cy)) scale(1.16);
        }
      }

      @keyframes problem-thought-ring {
        0%, 35%, 100% {
          opacity: 0.35;
          transform: translate(-50%, -50%) scale(1);
        }
        72%, 88% {
          opacity: 0.75;
          transform: translate(-50%, -50%) scale(0.42);
        }
      }

      @keyframes problem-avoidance-drift {
        0%, 100% {
          opacity: 1;
          filter: blur(0);
          transform: translateY(8px) scale(1.08);
        }
        22% {
          opacity: 0.92;
          filter: blur(0.1px);
          transform: translateY(-6px) scale(0.94);
        }
        52% {
          opacity: 0.72;
          filter: blur(0.8px);
          transform: translateY(-24px) scale(0.72);
        }
        78%, 90% {
          opacity: 0.36;
          filter: blur(1.8px);
          transform: translateY(-43px) scale(0.46);
        }
      }
    `}</style>
  );
}

export default function ProblemSection() {
  return (
    <section id="problems" className="relative overflow-hidden bg-[var(--color-section-muted)] py-16 sm:py-24">
      <ProblemAnimationStyles />

      {/* BG GLOW */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[var(--color-primary)]/8 blur-[120px]" />

      {/* GRID */}
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div className="h-full w-full bg-[linear-gradient(to_right,var(--color-grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-grid-line)_1px,transparent_1px)] bg-[size:72px_72px]" />
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
              className="grid items-center gap-4 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-panel)] p-3 shadow-[0_12px_35px_rgba(53,85,63,0.08)] backdrop-blur-sm sm:gap-6 sm:p-4 lg:grid-cols-[240px_1fr]"
            >
              {/* VISUAL CARD */}
              <div className="relative overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:rounded-[24px] sm:p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/[0.03] to-transparent" />

                {/* GRID */}
                {problem.visual === "grid" && (
                  <StackingCardsIllustration />
                )}

                {/* BARS */}
                {problem.visual === "bars" && (
                  <ThoughtClusterIllustration />
                )}

                {/* LINES */}
                {problem.visual === "lines" && (
                  <AvoidanceIllustration />
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
