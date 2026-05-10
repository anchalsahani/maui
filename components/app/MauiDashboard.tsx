"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Clock3,
  Coffee,
  Gauge,
  Play,
  Sparkles,
  TimerReset,
  Trophy,
} from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";

import ReadyFlowModal from "@/components/app/dashboard/ReadyFlowModal";
import StuckFlowModal from "@/components/app/dashboard/StuckFlowModal";
import TiredFlowModal from "@/components/app/dashboard/TiredFlowModal";
import FocusTimer from "@/components/app/dashboard/FocusTimer";
import {
  completeFocusTimer,
  pauseFocusTimer,
  resetFocusTimer,
  resumeFocusTimer,
  startFocusTimer,
} from "@/components/app/dashboard/focusTimerStore";
import type {
  EmotionState,
  EntryMode,
  PersistedDashboardState,
  RewardState,
  SessionState,
  TaskItem,
} from "@/components/app/dashboard/types";
import type { UserSurvey } from "@/lib/auth/types";
import FloatingModal from "@/components/ui/FloatingModal";

const STORAGE_KEY = "maui-dashboard-state";

const starterTasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Finish the landing page copy pass",
    urgency: 9,
    difficulty: 4,
    deadlineWeight: 3,
    focusMinutes: 20,
    steps: [
      "Open the working file",
      "Read the first section only",
      "Rewrite the headline",
      "Tighten one paragraph",
    ],
  },
  {
    id: "task-2",
    title: "Review auth flow edge cases",
    urgency: 8,
    difficulty: 5,
    deadlineWeight: 2,
    focusMinutes: 20,
    steps: [
      "Open the login and signup routes",
      "List one missing edge case",
      "Check one redirect path",
      "Write the next fix note",
    ],
  },
  {
    id: "task-3",
    title: "Prepare dashboard feature notes",
    urgency: 6,
    difficulty: 3,
    deadlineWeight: 1,
    focusMinutes: 20,
    steps: [
      "Open the notes doc",
      "Write one user goal",
      "Write one blocker",
      "Choose one feature to build next",
    ],
  },
];

const idleSession: SessionState = {
  status: "idle",
  title: "",
  mode: "pomodoro",
  focusMinutes: 20,
  runId: 0,
};

function getSupportTone(survey: UserSurvey) {
  switch (survey.supportStyle) {
    case "direct":
      return "Clear next move. No overthinking.";
    case "encouraging":
      return "You do not need perfect energy to begin.";
    default:
      return "Gentle structure for a harder day.";
  }
}

function buildStarterTasks(survey: UserSurvey): TaskItem[] {
  return starterTasks.map((task) => ({
    ...task,
    focusMinutes: 20,
    difficulty:
      survey.energyPattern === "low" ? Math.max(1, task.difficulty - 1) : task.difficulty,
    steps:
      survey.taskPace === "tiny"
        ? [
            "Open the task",
            task.steps[0],
            task.steps[1] ?? "Do one tiny visible action",
            "Stop after one small win if needed",
          ]
        : task.steps,
  }));
}

function getInitialDashboardState(survey: UserSurvey): PersistedDashboardState {
  return {
    tasks: buildStarterTasks(survey),
    reward: {
      points: 12,
      streak: 3,
      sessionsCompleted: 0,
      microTasksCompleted: 0,
    },
    session: idleSession,
    recentMoments: ["You showed up today. That counts."],
    completedMicroSteps: [],
  };
}

function getTaskScore(task: TaskItem) {
  return task.urgency + task.deadlineWeight - task.difficulty;
}

function detectEmotion(input: string): {
  state: EmotionState;
  title: string;
  body: string;
  keywords: string[];
} {
  const text = input.toLowerCase();
  const keywords = [
    "stuck",
    "overwhelmed",
    "panic",
    "stress",
    "deadline",
    "tired",
    "drained",
    "exhausted",
    "sad",
    "anxious",
    "ready",
    "okay",
    "hopeful",
  ].filter((keyword) => text.includes(keyword));

  if (/(panic|spiral|overwhelmed|too much|freeze|stuck)/.test(text)) {
    return {
      state: "overwhelmed",
      title: "You sound overwhelmed.",
      body: "Maui should lower the pressure, cut the task smaller, and avoid asking you to plan the whole thing.",
      keywords,
    };
  }

  if (/(tired|exhausted|drained|sleepy|burnt)/.test(text)) {
    return {
      state: "tired",
      title: "Low energy detected.",
      body: "Maui should keep things lighter right now and prefer a gentler first action over a full session.",
      keywords,
    };
  }

  if (/(stress|anxious|pressure|deadline|worried)/.test(text)) {
    return {
      state: "stressed",
      title: "Stress is showing up here.",
      body: "A very concrete next move will help more than a long plan. Keep the scope small and visible.",
      keywords,
    };
  }

  if (/(ready|okay|good|better|hopeful)/.test(text)) {
    return {
      state: "hopeful",
      title: "There is some momentum here.",
      body: "This is a good moment to start a normal task block before the energy fades.",
      keywords,
    };
  }

  return {
    state: "steady",
    title: "A steady state for now.",
    body: "No strong signal showed up, so Maui should offer one calm next step without extra pressure.",
    keywords,
  };
}

function buildMicroSteps(task: TaskItem, survey: UserSurvey) {
  const prepStep =
    survey.overwhelmTrigger === "starting"
      ? "Open the notebook, file, or tab for this task."
      : survey.overwhelmTrigger === "planning"
        ? "Ignore the whole plan. Look only at the first visible action."
        : "Set up only the piece you need right now.";

  const tinyBridge =
    survey.taskPace === "tiny"
      ? "Touch the first line, button, or page so the task is officially started."
      : "Complete the first small visible move.";

  return [prepStep, tinyBridge, ...task.steps].slice(0, 5);
}

function FlowCard({
  title,
  body,
  tone,
  icon: Icon,
  active,
  onClick,
}: {
  title: string;
  body: string;
  tone: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -6, rotateX: 2 }}
      whileTap={{ scale: 0.985 }}
      className={`group relative overflow-hidden rounded-[30px] border p-5 text-left transition-all duration-300 ${
        active
          ? "border-[var(--color-primary)]/42 bg-[linear-gradient(180deg,rgba(207,232,213,0.42),rgba(255,255,255,0.86))] shadow-[0_30px_70px_rgba(53,85,63,0.12)]"
          : "border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,250,248,0.8))] shadow-[0_18px_55px_rgba(53,85,63,0.08)]"
      }`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(207,232,213,0.5),transparent_38%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-white/78 text-[var(--color-primary-deep)] shadow-[0_10px_24px_rgba(53,85,63,0.08)]">
            <Icon size={20} />
          </div>
          <ChevronRight
            className="mt-1 text-[var(--color-text-secondary)] transition-transform duration-300 group-hover:translate-x-1"
            size={18}
          />
        </div>
        <h2 className="mt-5 text-[1.4rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {body}
        </p>
        <div className="mt-5 inline-flex rounded-full border border-white/55 bg-white/72 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-primary-deep)]">
          {tone}
        </div>
      </div>
    </motion.button>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/45 bg-white/70 p-5 shadow-[0_18px_55px_rgba(53,85,63,0.08)]">
      <div className="h-12 w-12 animate-pulse rounded-2xl bg-[var(--color-accent)]/45" />
      <div className="mt-5 h-6 w-28 animate-pulse rounded-full bg-[var(--color-accent)]/38" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full animate-pulse rounded-full bg-[var(--color-accent)]/28" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-[var(--color-accent)]/28" />
      </div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-[26px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(247,250,248,0.78))] p-4 shadow-[0_18px_55px_rgba(53,85,63,0.08)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)]/48 text-[var(--color-primary-deep)]">
          <Icon size={18} />
        </div>
        <p className="text-[1.45rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
          {value}
        </p>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
        {label}
      </p>
    </motion.div>
  );
}

export default function MauiDashboard({
  userName,
  survey,
}: {
  userName: string;
  survey: UserSurvey;
}) {
  const initialState = getInitialDashboardState(survey);
  const [tasks, setTasks] = useState<TaskItem[]>(initialState.tasks);
  const [reward, setReward] = useState<RewardState>(initialState.reward);
  const [session, setSession] = useState<SessionState>(initialState.session);
  const [recentMoments, setRecentMoments] = useState<string[]>(
    initialState.recentMoments
  );
  const [completedMicroSteps, setCompletedMicroSteps] = useState<string[]>(
    initialState.completedMicroSteps
  );
  const [activeModal, setActiveModal] = useState<EntryMode>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [emotionInput, setEmotionInput] = useState("");
  const [emotionState, setEmotionState] = useState<EmotionState>("steady");
  const [emotionKeywords, setEmotionKeywords] = useState<string[]>([]);
  const [emotionMessage, setEmotionMessage] = useState({
    title: "Tell Maui what your brain feels like.",
    body: "A short rant is enough. Maui will look for emotional cues and reduce pressure from there.",
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (raw) {
        window.setTimeout(() => {
          const parsed = JSON.parse(raw) as Partial<PersistedDashboardState>;
          setTasks(parsed.tasks ?? initialState.tasks);
          setReward(parsed.reward ?? initialState.reward);
          setSession(parsed.session ?? initialState.session);
          setRecentMoments(parsed.recentMoments ?? initialState.recentMoments);
          setCompletedMicroSteps(
            parsed.completedMicroSteps ?? initialState.completedMicroSteps
          );
        }, 0);
      }
    } catch {
      // Ignore invalid stored state and keep the fresh snapshot.
    } finally {
      window.setTimeout(() => setIsRestoring(false), 220);
    }
  }, [
    initialState.completedMicroSteps,
    initialState.recentMoments,
    initialState.reward,
    initialState.session,
    initialState.tasks,
  ]);

  useEffect(() => {
    if (isRestoring) {
      return;
    }

    const snapshot: PersistedDashboardState = {
      tasks,
      reward,
      session,
      recentMoments,
      completedMicroSteps,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [completedMicroSteps, isRestoring, recentMoments, reward, session, tasks]);

  const nextTask = useMemo(() => {
    return [...tasks].sort((a, b) => getTaskScore(b) - getTaskScore(a))[0] ?? null;
  }, [tasks]);

  const microSteps = useMemo(() => {
    return nextTask ? buildMicroSteps(nextTask, survey) : [];
  }, [nextTask, survey]);

  const completedCount = microSteps.filter((step) =>
    completedMicroSteps.includes(step)
  ).length;
  const allMicroStepsDone = microSteps.length > 0 && completedCount === microSteps.length;
  const firstName = userName.split(" ")[0];
  const supportTone = getSupportTone(survey);

  function recordMoment(message: string) {
    setRecentMoments((current) => [message, ...current].slice(0, 4));
  }

  function startPomodoro() {
    if (!nextTask) {
      recordMoment("No task is ready yet. Add one small task first.");
      return;
    }

    const runId = session.runId + 1;
    setSession({
      status: "active",
      title: nextTask.title,
      mode: "pomodoro",
      focusMinutes: 20,
      runId,
    });
    startFocusTimer(nextTask.title, 20, runId);
    recordMoment(`Started a 20-minute focus block for "${nextTask.title}".`);
  }

  function pauseOrResumeSession() {
    setSession((current) => {
      const nextStatus = current.status === "active" ? "paused" : "active";
      if (nextStatus === "paused") {
        pauseFocusTimer();
      } else {
        resumeFocusTimer();
      }

      return {
        ...current,
        status: nextStatus,
      };
    });
  }

  function completePomodoro() {
    if (!nextTask) {
      return;
    }

    completeFocusTimer();
    setReward((current) => ({
      ...current,
      points: current.points + 8,
      streak: current.streak + 1,
      sessionsCompleted: current.sessionsCompleted + 1,
    }));
    setTasks((current) => current.filter((task) => task.id !== nextTask.id));
    setSession((current) => ({
      ...current,
      status: "completed",
    }));
    recordMoment(`Completed a focus block for "${nextTask.title}". +8 points.`);
  }

  function resetSession() {
    const runId = session.runId + 1;
    setSession({
      ...idleSession,
      runId,
    });
    resetFocusTimer(20, runId);
  }

  function toggleMicroStep(step: string) {
    const isCompleted = completedMicroSteps.includes(step);

    if (isCompleted) {
      setCompletedMicroSteps((current) => current.filter((item) => item !== step));
      return;
    }

    setCompletedMicroSteps((current) => [...current, step]);
    setReward((current) => ({
      ...current,
      points: current.points + 1,
      microTasksCompleted: current.microTasksCompleted + 1,
    }));
    recordMoment(`Completed micro step: ${step}`);
  }

  function finishBrokenDownTask() {
    if (!nextTask) {
      return;
    }

    setReward((current) => ({
      ...current,
      points: current.points + 4,
      streak: current.streak + 1,
    }));
    setTasks((current) => current.filter((task) => task.id !== nextTask.id));
    setCompletedMicroSteps((current) =>
      current.filter((step) => !microSteps.includes(step))
    );
    recordMoment(`Finished the broken-down task "${nextTask.title}". +4 points.`);
  }

  function analyzeEmotion() {
    const result = detectEmotion(emotionInput);
    setEmotionState(result.state);
    setEmotionKeywords(result.keywords);
    setEmotionMessage({
      title: result.title,
      body: result.body,
    });
    recordMoment(`Emotion check-in analyzed as ${result.state}.`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(207,232,213,0.78),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(143,191,159,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.64),rgba(250,250,250,0.96))]" />
      <div className="pointer-events-none absolute left-[-8%] top-[10%] h-[520px] w-[520px] rounded-full bg-[var(--color-accent)]/42 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-10%] top-[-8%] h-[560px] w-[560px] rounded-full bg-[var(--color-primary)]/12 blur-[120px]" />

      <motion.main
        animate={{ scale: activeModal ? 0.985 : 1, opacity: activeModal ? 0.9 : 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 pt-28 sm:px-6"
      >
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[38px] border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(242,250,244,0.82))] p-7 shadow-[0_36px_110px_rgba(53,85,63,0.12)] backdrop-blur-2xl sm:p-9"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(207,232,213,0.95),transparent_68%)]" />
          <div className="pointer-events-none absolute right-[-4rem] top-[-2rem] h-48 w-48 rounded-full bg-[var(--color-primary)]/18 blur-3xl" />

          <div className="relative flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/72 px-4 py-2 text-sm font-medium text-[var(--color-primary-deep)] shadow-[0_12px_30px_rgba(53,85,63,0.06)]">
                <Sparkles size={16} />
                {supportTone}
              </div>

              <p className="mt-7 text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                Dashboard
              </p>
              <h1 className="mt-3 max-w-[11ch] text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.08em] text-[var(--color-dark)]">
                How are you feeling, {firstName}?
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--color-text-secondary)] sm:text-[16px]">
                Pick the state that feels closest right now. Maui will shape the
                next step around that instead of making you manage everything at once.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:max-w-[420px] xl:flex-1">
              <StatsCard label="Points" value={reward.points} icon={Trophy} />
              <StatsCard label="Streak" value={reward.streak} icon={Sparkles} />
              <StatsCard
                label="Session"
                value={session.status === "active" ? "Live" : "Idle"}
                icon={Clock3}
              />
            </div>
          </div>
        </motion.section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="space-y-5"
          >
            {isRestoring ? (
              <div className="grid gap-4 lg:grid-cols-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                <FlowCard
                  title="Ready"
                  body="Start a focused 20-minute pomodoro with one clear task and zero extra planning."
                  tone="Focus mode"
                  icon={Play}
                  active={activeModal === "ready"}
                  onClick={() => setActiveModal("ready")}
                />
                <FlowCard
                  title="Stuck"
                  body="Break the task into tiny visible actions and collect points for every small completion."
                  tone="Micro steps"
                  icon={TimerReset}
                  active={activeModal === "stuck"}
                  onClick={() => setActiveModal("stuck")}
                />
                <FlowCard
                  title="Tired"
                  body="Rant about what is going on. Maui will detect emotional cues and lower the pressure."
                  tone="Check-in"
                  icon={Coffee}
                  active={activeModal === "tired"}
                  onClick={() => setActiveModal("tired")}
                />
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="rounded-[32px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,250,248,0.8))] p-6 shadow-[0_24px_70px_rgba(53,85,63,0.1)] backdrop-blur-2xl sm:p-7"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-xl">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    Your next anchor
                  </p>
                  <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
                    {nextTask ? nextTask.title : "No active task right now"}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {nextTask
                      ? "Maui already ranked your next task. Open the flow that matches your current state and it will shape the right kind of support."
                      : "You can add one gentle starter task next. The dashboard is ready when you are."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px]">
                  {[
                    { label: "Urgency", value: nextTask?.urgency ?? "-" },
                    { label: "Difficulty", value: nextTask?.difficulty ?? "-" },
                    { label: "Focus", value: nextTask ? `${nextTask.focusMinutes}m` : "-" },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      whileHover={{ y: -4 }}
                      className="rounded-[24px] border border-white/45 bg-white/78 px-4 py-4 shadow-[0_12px_30px_rgba(53,85,63,0.06)]"
                    >
                      <p className="text-[1.5rem] font-semibold tracking-[-0.05em] text-[var(--color-dark)]">
                        {item.value}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                        {item.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {nextTask ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {nextTask.steps.slice(0, 4).map((step) => (
                    <motion.span
                      key={step}
                      whileHover={{ y: -2 }}
                      className="rounded-full border border-white/55 bg-white/74 px-3 py-1.5 text-xs text-[var(--color-text-secondary)] shadow-[0_8px_20px_rgba(53,85,63,0.04)]"
                    >
                      {step}
                    </motion.span>
                  ))}
                </div>
              ) : null}
            </motion.div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="rounded-[32px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,250,248,0.8))] p-6 shadow-[0_24px_70px_rgba(53,85,63,0.1)] backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    Session engine
                  </p>
                  <FocusTimer compact />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/45 text-[var(--color-primary-deep)]">
                  <Gauge size={20} />
                </div>
              </div>
              <button
                type="button"
                onClick={resetSession}
                className="mt-5 flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/82 px-4 text-sm font-medium text-[var(--color-dark)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/24"
              >
                Reset session
              </button>
            </div>

            <div className="rounded-[32px] border border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(247,250,248,0.8))] p-6 shadow-[0_24px_70px_rgba(53,85,63,0.1)] backdrop-blur-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                Gentle notes
              </p>
              <div className="mt-5 space-y-3">
                <AnimatePresence initial={false}>
                  {recentMoments.map((moment, index) => (
                    <motion.div
                      key={`${moment}-${index}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-[22px] border border-white/45 bg-white/74 px-4 py-3 text-sm leading-6 text-[var(--color-dark)]/84 shadow-[0_10px_28px_rgba(53,85,63,0.05)]"
                    >
                      {moment}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>
        </div>
      </motion.main>

      <FloatingModal
        open={activeModal === "ready"}
        onClose={() => setActiveModal(null)}
        title="Ready to begin"
        description="This mode keeps things simple: one task, one timer, and enough motion to get you into the work before hesitation grows."
        size="lg"
      >
        <ReadyFlowModal
          nextTask={nextTask}
          session={session}
          onStart={startPomodoro}
          onPauseResume={pauseOrResumeSession}
          onComplete={completePomodoro}
        />
      </FloatingModal>

      <FloatingModal
        open={activeModal === "stuck"}
        onClose={() => setActiveModal(null)}
        title="Break it down until it feels startable"
        description="This mode turns the task into tiny visible steps. Every micro win counts, and Maui rewards momentum before perfection."
        size="xl"
      >
        <StuckFlowModal
          nextTask={nextTask}
          microSteps={microSteps}
          completedMicroSteps={completedMicroSteps}
          completedCount={completedCount}
          allMicroStepsDone={allMicroStepsDone}
          reward={reward}
          onToggleStep={toggleMicroStep}
          onFinishTask={finishBrokenDownTask}
          onResetSteps={() =>
            setCompletedMicroSteps((current) =>
              current.filter((step) => !microSteps.includes(step))
            )
          }
        />
      </FloatingModal>

      <FloatingModal
        open={activeModal === "tired"}
        onClose={() => setActiveModal(null)}
        title="Tell Maui what is going on"
        description="Use a short rant. Maui will detect emotional keywords, reflect the likely state, and guide you toward a gentler next step."
        size="lg"
      >
        <TiredFlowModal
          emotionInput={emotionInput}
          emotionState={emotionState}
          emotionKeywords={emotionKeywords}
          emotionTitle={emotionMessage.title}
          emotionBody={emotionMessage.body}
          onEmotionChange={setEmotionInput}
          onAnalyze={analyzeEmotion}
        />
      </FloatingModal>
    </div>
  );
}
