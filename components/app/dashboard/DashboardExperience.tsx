"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  CirclePause,
  Coffee,
  Play,
  RotateCcw,
  Sparkles,
  TimerReset,
} from "lucide-react";

import FocusTimer from "@/components/app/dashboard/FocusTimer";
import { useFocusTimer } from "@/components/app/dashboard/useFocusTimer";
import type { PlanningSystemState, RewardState, TaskItem } from "@/components/app/dashboard/types";

type DashboardExperienceProps = {
  userName: string;
  planning: PlanningSystemState | null;
  nextTask: TaskItem | null;
  reward: RewardState;
  emotion: string;
  recentMoments: string[];
  onStart: () => void;
  onStuck: () => void;
  onCheckIn: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onReset: () => void;
};

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date)
    : "When you’re ready";
}

function isRecovery(type: string) {
  return type === "recovery" || type === "rest" || type === "reset";
}

const cardMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardExperience({
  userName,
  planning,
  nextTask,
  reward,
  emotion,
  recentMoments,
  onStart,
  onStuck,
  onCheckIn,
  onSkip,
  onComplete,
  onReset,
}: DashboardExperienceProps) {
  const firstName = userName.split(" ")[0];
  const schedule = planning?.activePlan?.schedule ?? [];
  const timer = useFocusTimer();
  const activeSession = planning?.activeSession;
  const visibleSchedule = schedule.slice(0, 5);
  const progress = schedule.length
    ? Math.round((Object.values(planning?.blockStatus ?? {}).filter((status) => status === "completed" || status === "skipped").length / schedule.length) * 100)
    : 0;
  const recovery = schedule.find((block) => isRecovery(block.type));

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[var(--color-bg)] pb-16 pt-20 sm:pt-24">
      <div className="app-page-wash pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[var(--color-accent)]/30 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-12rem] top-40 h-80 w-80 rounded-full bg-[var(--color-primary)]/15 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.header {...cardMotion} transition={{ duration: 0.38 }} className="mb-7 flex items-end justify-between gap-5 sm:mb-9">
          <div>
            <p className="text-sm text-[var(--color-text-secondary)]">Good afternoon, {firstName}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.05em] sm:text-[2rem]">Your day, already thought through.</h1>
          </div>
          <Link href="/planner" className="maui-button-secondary hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium sm:inline-flex">Open planner <ArrowRight size={15} /></Link>
        </motion.header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.85fr)]">
          <motion.section {...cardMotion} transition={{ duration: 0.4, delay: 0.05 }} className="app-card-strong relative overflow-hidden rounded-[32px] p-5 sm:p-8">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[var(--color-accent)]/30 blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-deep)]"><Sparkles size={14} /> Today&apos;s AI plan</p>
                <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-card-soft)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)]">{progress}% through today</span>
              </div>

              <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-end">
                <div>
                  <p className="text-sm font-medium text-[var(--color-primary-deep)]">Up now</p>
                  <h2 className="mt-2 max-w-xl text-[clamp(1.9rem,4vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.065em] text-[var(--color-dark)]">{nextTask?.title ?? "Make space for one small win."}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">{planning?.activePlan?.strategy ?? "Maui has selected the most startable thing, so you do not have to decide alone."}</p>
                </div>
                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card-soft)] p-4 lg:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">Focus block</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{timer.status === "active" || timer.status === "paused" ? Math.ceil(timer.remainingSeconds / 60) : activeSession?.focusMinutes ?? nextTask?.focusMinutes ?? 20}<span className="ml-1 text-base text-[var(--color-text-secondary)]">min</span></p>
                  <p className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">Energy: <span className="capitalize text-[var(--color-dark)]">{emotion}</span></p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={onStart} className="maui-button-primary inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"><Play size={16} fill="currentColor" /> Start this block</button>
                <button type="button" onClick={onStuck} className="maui-button-secondary inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium"><TimerReset size={16} /> Make it smaller</button>
                <button type="button" onClick={onSkip} className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-card-soft)] hover:text-[var(--color-dark)]">Skip for now <ArrowRight size={15} /></button>
              </div>
            </div>
          </motion.section>

          <motion.aside {...cardMotion} transition={{ duration: 0.4, delay: 0.1 }} className="app-card rounded-[32px] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Focus space</p><FocusTimer compact onAutoComplete={onComplete} /></div><CirclePause size={20} className="text-[var(--color-primary-deep)]" /></div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--color-accent)]/35"><motion.div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-primary-deep))]" animate={{ width: `${timer.totalSeconds ? Math.round((timer.elapsedSeconds / timer.totalSeconds) * 100) : 0}%` }} /></div>
            <div className="mt-5 flex gap-2">{timer.status === "active" || timer.status === "paused" ? <button type="button" onClick={onComplete} className="maui-button-primary flex-1 rounded-full px-4 py-2.5 text-sm font-semibold">Mark complete</button> : <button type="button" onClick={onStart} className="maui-button-primary flex-1 rounded-full px-4 py-2.5 text-sm font-semibold">Begin session</button>}<button type="button" onClick={onReset} className="maui-button-secondary flex h-10 w-10 items-center justify-center rounded-full" aria-label="Reset session"><RotateCcw size={15} /></button></div>
          </motion.aside>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,0.8fr)]">
          <motion.section {...cardMotion} transition={{ duration: 0.4, delay: 0.15 }} className="app-card rounded-[30px] p-5 sm:p-7">
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">A gentle route through today</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.045em]">Your plan, in sequence</h2></div><Link href="/planner" className="text-sm font-medium text-[var(--color-primary-deep)]">View all</Link></div>
            <div className="relative mt-6 space-y-2 before:absolute before:bottom-7 before:left-[1.15rem] before:top-7 before:w-px before:bg-[var(--color-border)]">
              {visibleSchedule.length ? visibleSchedule.map((block, index) => {
                const isCurrent = block.id === activeSession?.blockId || (!activeSession && block.taskId === nextTask?.id) || (!activeSession && index === 0);
                const rest = isRecovery(block.type);
                return <div key={block.id} className={`relative flex gap-4 rounded-2xl p-3 transition-all duration-200 hover:-translate-y-0.5 ${isCurrent ? "bg-[var(--color-accent)]/45 shadow-[0_14px_35px_rgba(53,85,63,0.08)]" : "hover:bg-[var(--color-card-soft)]"}`}><span className={`relative z-10 mt-1.5 flex h-3 w-3 shrink-0 rounded-full ring-4 ring-[var(--color-card)] ${rest ? "bg-[var(--color-primary)]/60" : isCurrent ? "bg-[var(--color-primary-deep)]" : "bg-[var(--color-border-strong)]"}`} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold text-[var(--color-dark)]">{block.title}</p><span className="shrink-0 text-xs text-[var(--color-text-secondary)]">{formatTime(block.startTime)}</span></div><p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{rest ? "Recovery time — protected by your plan" : `${block.durationMinutes} min focus block`} {block.reason ? `· ${block.reason}` : ""}</p></div></div>;
              }) : <div className="rounded-2xl bg-[var(--color-card-soft)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]">Your plan will appear here as soon as Maui has enough context.</div>}
            </div>
          </motion.section>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <motion.section {...cardMotion} transition={{ duration: 0.4, delay: 0.2 }} className="app-card rounded-[30px] p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Next recovery</p><p className="mt-3 text-xl font-semibold tracking-[-0.04em]">{recovery ? recovery.title : "A pause when you need it"}</p><p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{recovery ? `${formatTime(recovery.startTime)} · ${recovery.durationMinutes} minutes` : "Maui will protect your energy as the day changes."}</p></motion.section>
            <motion.section {...cardMotion} transition={{ duration: 0.4, delay: 0.25 }} className="app-card rounded-[30px] p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Need a different route?</p><div className="mt-4 grid gap-2"><button type="button" onClick={onCheckIn} className="app-subcard flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--color-card-hover)]"><Coffee size={16} className="text-[var(--color-primary-deep)]" /> Check in with Maui</button><button type="button" onClick={onStuck} className="app-subcard flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--color-card-hover)]"><TimerReset size={16} className="text-[var(--color-primary-deep)]" /> Replan this task</button></div></motion.section>
          </div>
        </div>

        <motion.section {...cardMotion} transition={{ duration: 0.4, delay: 0.3 }} className="mt-5 grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div className="app-muted-card rounded-2xl px-4 py-4"><div className="flex items-center justify-between"><div><p className="text-lg font-semibold tracking-[-0.04em]">{reward.streak} day streak</p><p className="mt-1 text-xs text-[var(--color-text-secondary)]">Small actions, consistently.</p></div><div className="grid grid-cols-7 gap-1">{Array.from({ length: 14 }, (_, index) => <span key={index} className={`h-2 w-2 rounded-sm ${index < Math.min(reward.streak, 14) ? "bg-[var(--color-primary-deep)]" : "bg-[var(--color-border)]"}`} />)}</div></div></div>
          <Link href="/rewards" className="app-muted-card rounded-2xl px-4 py-4 transition-all hover:-translate-y-0.5 hover:bg-[var(--color-card-hover)]"><p className="text-lg font-semibold tracking-[-0.04em]">{reward.points} points</p><p className="mt-1 text-xs text-[var(--color-text-secondary)]">Your progress</p></Link>
          <div className="app-muted-card rounded-2xl px-4 py-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">Latest moment</p><p className="mt-2 line-clamp-2 text-sm leading-5 text-[var(--color-dark)]">{recentMoments[0] ?? "Your next win will land here."}</p></div>
        </motion.section>
      </div>
    </main>
  );
}
