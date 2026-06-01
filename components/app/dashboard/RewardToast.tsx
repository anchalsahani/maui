"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";

export default function RewardToast({
  open,
  points,
  title,
}: {
  open: boolean;
  points: number;
  title: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center px-5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,249,243,0.94))] p-7 text-center shadow-[0_35px_100px_rgba(16,47,21,0.22)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(207,232,213,0.95),transparent_68%)]" />
            <motion.div
              initial={{ rotate: -8, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 18 }}
              className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-primary-deep)] text-white shadow-[0_18px_36px_rgba(53,85,63,0.24)]"
            >
              <Trophy size={28} />
            </motion.div>
            <p className="relative mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary-deep)]">
              Session complete
            </p>
            <h3 className="relative mt-2 text-[2rem] font-semibold leading-none text-[var(--color-dark)]">
              Nice work
            </h3>
            <p className="relative mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {title}
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-white/82 px-5 py-3 text-sm font-bold text-[var(--color-primary-deep)] shadow-[0_12px_28px_rgba(53,85,63,0.1)]"
            >
              <Sparkles size={16} />
              +{points} points earned
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
