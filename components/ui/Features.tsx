"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const STAGES = [
  {
    problem: "Frozen by choice paralysis?",
    solution: "AI Task Assignment",
    description: "We pick the perfect task for your current energy levels.",
    color: "#EBFADC",
    icon: "⚡",
  },
  {
    problem: "Drowning in a massive project?",
    solution: "Task Breakdown System",
    description: "Intimidating goals become tiny, bite-sized victories.",
    color: "#F7FEE7",
    icon: "🧩",
  },
  {
    problem: "Lost in the chaos of priorities?",
    solution: "Urgency-Based Sorting",
    description: "Auto-ranked schedules that clear the mental fog.",
    color: "#ECFCCB",
    icon: "🎯",
  },
];

function MetamorphosisStage({
  stage,
  index,
  scrollYProgress,
}: {
  stage: (typeof STAGES)[number];
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const portion = 1 / STAGES.length;
  const start = index * portion;
  const end = (index + 1) * portion;
  const opacity = useTransform(
    scrollYProgress,
    [start, start + portion * 0.2, end - portion * 0.2, end],
    [0, 1, 1, 0]
  );
  const problemY = useTransform(scrollYProgress, [start, start + portion * 0.4], [0, -60]);
  const problemOpacity = useTransform(scrollYProgress, [start, start + portion * 0.3], [1, 0]);
  const solutionY = useTransform(scrollYProgress, [start + portion * 0.3, start + portion * 0.6], [80, 0]);
  const solutionOpacity = useTransform(scrollYProgress, [start + portion * 0.3, start + portion * 0.5], [0, 1]);

  return (
    <motion.div
      style={{
        opacity,
        backgroundColor: stage.color,
        zIndex: index,
      }}
      className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center md:p-16"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        className="mb-6 text-6xl md:text-8xl"
      >
        {stage.icon}
      </motion.div>

      <motion.h3
        style={{ y: problemY, opacity: problemOpacity }}
        className="absolute px-6 text-3xl font-bold leading-tight text-[var(--color-dark)]/30 md:text-5xl"
      >
        {stage.problem}
      </motion.h3>

      <motion.div
        style={{ y: solutionY, opacity: solutionOpacity }}
        className="flex flex-col items-center space-y-6"
      >
        <h3 className="text-4xl font-black tracking-tighter text-[var(--color-dark)] md:text-7xl">
          {stage.solution}
        </h3>
        <p className="max-w-md text-lg text-[var(--color-text-secondary)] md:text-xl">
          {stage.description}
        </p>

        <div className="maui-button-primary mt-4 inline-flex items-center gap-3 rounded-full px-8 py-3">
          <span className="text-sm font-bold uppercase tracking-wider">How it works</span>
          <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export const MauiMetamorphosis = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-[var(--color-bg)]">
      <div className="sticky top-0 flex h-screen items-center justify-center px-6">
        
        <div className="relative h-[550px] w-full max-w-5xl overflow-hidden rounded-[40px] border border-[var(--color-dark)]/5 bg-white shadow-2xl">
          
          {STAGES.map((stage, index) => (
            <MetamorphosisStage
              key={stage.solution}
              stage={stage}
              index={index}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
