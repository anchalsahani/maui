import styles from "./Problem.module.css";

const struggles = [
  {
    number: "01",
    label: "Choice overload",
    title: "Every option becomes another decision.",
    text: "Priorities compete, small tasks feel equally urgent, and choosing where to begin drains the energy you needed to begin.",
    visual: "choices",
  },
  {
    number: "02",
    label: "Task paralysis",
    title: "The task feels heavier than it is.",
    text: "Your brain can understand the assignment and still experience the first step like a wall—especially when the outcome matters.",
    visual: "weight",
  },
  {
    number: "03",
    label: "The shame loop",
    title: "Avoidance quietly feeds itself.",
    text: "A missed task becomes guilt. Guilt makes returning harder. Soon, the emotional weight is larger than the work itself.",
    visual: "loop",
  },
];

function ChoiceOverloadVisual() {
  return (
    <svg viewBox="0 0 320 190" className={styles.scene} aria-hidden="true">
      <circle cx="160" cy="95" r="56" fill="none" stroke="var(--problem-line)" strokeDasharray="3 7" />
      <circle className={styles.choicePulse} cx="160" cy="95" r="23" fill="var(--color-card-hover)" stroke="var(--color-primary-deep)" strokeWidth="1.5" />
      <circle cx="160" cy="95" r="6" fill="var(--color-primary)" />
      {[
        { x: 47, y: 35, w: 85, accent: false },
        { x: 201, y: 28, w: 74, accent: true },
        { x: 36, y: 128, w: 95, accent: true },
        { x: 207, y: 126, w: 78, accent: false },
      ].map((item, index) => (
        <g
          key={`${item.x}-${item.y}`}
          className={index % 2 ? styles.floatSlow : styles.float}
        >
          <rect
            x={item.x}
            y={item.y}
            width={item.w}
            height="32"
            rx="12"
            fill="var(--color-card-hover)"
            stroke="var(--color-border-strong)"
          />
          <circle
            cx={item.x + 16}
            cy={item.y + 16}
            r="5"
            fill={item.accent ? "#f0d98b" : "var(--color-primary)"}
          />
          <rect
            x={item.x + 29}
            y={item.y + 13}
            width={item.w - 42}
            height="6"
            rx="3"
            fill="var(--color-primary-deep)"
            opacity=".42"
          />
        </g>
      ))}
      <path d="M131 65 148 82M193 61l-20 21M132 129l17-20M194 128l-20-19" stroke="var(--color-primary-deep)" strokeDasharray="3 5" opacity=".35" />
    </svg>
  );
}

function TaskWeightVisual() {
  return (
    <svg viewBox="0 0 320 190" className={styles.scene} aria-hidden="true">
      <defs>
        <radialGradient id="problem-weight-orb" cx=".38" cy=".3">
          <stop stopColor="#b9d9c2" />
          <stop offset=".72" stopColor="var(--color-primary-deep)" />
          <stop offset="1" stopColor="var(--color-mainstar)" />
        </radialGradient>
        <filter id="problem-shadow">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <ellipse cx="160" cy="161" rx="70" ry="10" fill="var(--color-mainstar)" opacity=".17" filter="url(#problem-shadow)" />
      <g className={styles.weight}>
        <circle cx="160" cy="91" r="55" fill="url(#problem-weight-orb)" opacity=".9" />
        <circle cx="142" cy="72" r="13" fill="white" opacity=".18" />
      </g>
      <rect x="114" y="146" width="92" height="19" rx="9.5" fill="var(--color-card-hover)" stroke="var(--color-border-strong)" />
      <rect x="128" y="153" width="64" height="5" rx="2.5" fill="var(--color-primary-deep)" opacity=".38" />
      <path className={styles.pressureLine} d="M93 50c17-22 39-34 67-34s50 12 67 34" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShameLoopVisual() {
  return (
    <svg viewBox="0 0 320 190" className={styles.scene} aria-hidden="true">
      <defs>
        <linearGradient id="problem-loop" x1="0" x2="1">
          <stop stopColor="var(--color-primary)" />
          <stop offset=".48" stopColor="#f0d98b" />
          <stop offset="1" stopColor="#f08b78" />
        </linearGradient>
      </defs>
      <path d="M91 101c0-42 31-67 69-67 45 0 72 27 72 64 0 34-25 59-61 59-31 0-54-17-61-43" fill="none" stroke="var(--problem-line)" strokeWidth="18" strokeLinecap="round" />
      <path className={styles.loopPath} d="M91 101c0-42 31-67 69-67 45 0 72 27 72 64 0 34-25 59-61 59-31 0-54-17-61-43" fill="none" stroke="url(#problem-loop)" strokeWidth="3" strokeLinecap="round" />
      <path d="m101 125 7-15 15 8" fill="none" stroke="var(--color-primary-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <g className={styles.fadingTask}>
        <rect x="120" y="67" width="82" height="55" rx="15" fill="var(--color-card-hover)" stroke="var(--color-border-strong)" />
        <rect x="136" y="82" width="11" height="11" rx="4" fill="#f08b78" opacity=".72" />
        <rect x="156" y="84" width="31" height="6" rx="3" fill="var(--color-primary-deep)" opacity=".42" />
        <rect x="136" y="103" width="51" height="5" rx="2.5" fill="var(--color-primary)" opacity=".28" />
      </g>
    </svg>
  );
}

function StruggleVisual({ type }: { type: string }) {
  if (type === "choices") return <ChoiceOverloadVisual />;
  if (type === "weight") return <TaskWeightVisual />;
  return <ShameLoopVisual />;
}

export default function ProblemSection() {
  return (
    <section id="problems" className={styles.section} aria-labelledby="problem-heading">
      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowMark} />
            The Problem
          </div>
          <h2 id="problem-heading" className={styles.heading}>
            You know what to do.
            <span>Your brain still won&apos;t let you start.</span>
          </h2>
          <p className={styles.intro}>
            It is not laziness, a lack of ambition, or a broken routine. For an
            executive-functioning brain, the space between intention and action
            can be the hardest part of the day.
          </p>
        </div>

        <div className={styles.intentionMap}>
          <div className={styles.mapGlow} />
          <div className={styles.mapEndpoint}>
            <span className={styles.mapLabel}>You decide</span>
            <strong>I want to do this</strong>
          </div>

          <div className={styles.frictionField} aria-hidden="true">
            <div className={styles.pathLine} />
            <span className={`${styles.frictionDot} ${styles.dotOne}`} />
            <span className={`${styles.frictionDot} ${styles.dotTwo}`} />
            <span className={`${styles.frictionDot} ${styles.dotThree}`} />
            <div className={styles.frictionLabel}>
              <span>invisible friction</span>
              <small>energy · emotions · decision fatigue</small>
            </div>
          </div>

          <div className={`${styles.mapEndpoint} ${styles.mapEndpointMuted}`}>
            <span className={styles.mapLabel}>Your brain says</span>
            <strong>&ldquo;I know… but I can&apos;t start.&rdquo;</strong>
          </div>
        </div>

        <div className={styles.cards}>
          {struggles.map((struggle) => (
            <article
              key={struggle.title}
              className={styles.card}
            >
              <div className={styles.cardVisual}>
                <StruggleVisual type={struggle.visual} />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <span>{struggle.number}</span>
                  <span>{struggle.label}</span>
                </div>
                <h3>{struggle.title}</h3>
                <p>{struggle.text}</p>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
