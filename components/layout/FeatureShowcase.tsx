import type { CSSProperties, ReactNode } from "react";

import styles from "./FeatureShowcase.module.css";

type Feature = {
  title: string;
  description: string;
  status: string;
  glow: string;
  visual: ReactNode;
};

const panelStyle: CSSProperties = {
  fill: "color-mix(in srgb, var(--color-card-hover) 86%, transparent)",
  stroke: "var(--color-border-strong)",
};

function AdaptivePlanningVisual() {
  return (
    <svg className={styles.scene} viewBox="0 0 320 244" aria-hidden="true">
      <defs>
        <linearGradient id="adaptive-wave" x1="0" x2="1">
          <stop stopColor="#5ba8ff" stopOpacity=".2" />
          <stop offset=".52" stopColor="var(--color-primary)" stopOpacity=".9" />
          <stop offset="1" stopColor="#f0d98b" stopOpacity=".28" />
        </linearGradient>
      </defs>
      <path className={styles.drift} d="M-18 170C49 102 89 203 151 143S247 101 342 154" fill="none" stroke="url(#adaptive-wave)" strokeWidth="38" strokeLinecap="round" opacity=".42" />
      <path d="M-18 170C49 102 89 203 151 143S247 101 342 154" fill="none" stroke="white" strokeWidth="2" opacity=".5" />
      <g className={styles.float}>
        <rect x="39" y="45" width="119" height="48" rx="14" style={panelStyle} />
        <circle cx="58" cy="69" r="7" fill="var(--color-primary)" />
        <rect x="73" y="61" width="61" height="6" rx="3" fill="var(--color-primary-deep)" opacity=".58" />
        <rect x="73" y="73" width="40" height="5" rx="2.5" fill="var(--color-primary)" opacity=".35" />
      </g>
      <g className={styles.floatSlow}>
        <rect x="166" y="91" width="116" height="48" rx="14" style={panelStyle} />
        <circle cx="185" cy="115" r="7" fill="#f0d98b" />
        <rect x="200" y="107" width="58" height="6" rx="3" fill="var(--color-primary-deep)" opacity=".58" />
        <rect x="200" y="119" width="35" height="5" rx="2.5" fill="var(--color-primary)" opacity=".35" />
      </g>
      <g className={styles.pulse}>
        <circle cx="153" cy="157" r="17" fill="var(--color-mainstar)" />
        <path d="m146 157 5 5 10-12" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function ExecutiveSupportVisual() {
  return (
    <svg className={styles.scene} viewBox="0 0 320 244" aria-hidden="true">
      <defs>
        <linearGradient id="steps-fill" x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="var(--color-primary)" stopOpacity=".28" />
          <stop offset="1" stopColor="var(--color-primary)" stopOpacity=".88" />
        </linearGradient>
      </defs>
      <circle className={styles.pulse} cx="87" cy="137" r="54" fill="var(--color-primary)" opacity=".09" />
      <path d="M50 186h50v-31h42v-34h43V87h43V53h42" fill="none" stroke="url(#steps-fill)" strokeWidth="20" strokeLinejoin="round" opacity=".4" />
      <path className={styles.draw} d="M50 176h43v-31h42v-34h43V77h43V43h49" fill="none" stroke="var(--color-primary-deep)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {[["70","176"],["114","145"],["157","111"],["200","77"],["243","43"]].map(([x, y], index) => (
        <g key={x} className={index === 0 ? styles.pulse : styles.floatSlow} style={{ transformOrigin: `${x}px ${y}px` }}>
          <circle cx={x} cy={y} r={index === 0 ? "14" : "9"} fill={index === 0 ? "var(--color-mainstar)" : "var(--color-card-hover)"} stroke="var(--color-primary-deep)" strokeWidth="2" />
          {index === 0 && <path d="m64 176 4 4 8-9" fill="none" stroke="white" strokeWidth="2" />}
        </g>
      ))}
      <rect x="188" y="154" width="80" height="27" rx="13.5" fill="var(--color-card-hover)" stroke="var(--color-border)" />
      <text x="228" y="172" textAnchor="middle" fill="var(--color-primary-deep)" fontSize="10" fontWeight="700">ONE STEP</text>
    </svg>
  );
}

function EmotionCompanionVisual() {
  return (
    <svg className={styles.scene} viewBox="0 0 320 244" aria-hidden="true">
      <defs>
        <radialGradient id="emotion-orb">
          <stop stopColor="#fff" />
          <stop offset=".3" stopColor="#cfe8d5" />
          <stop offset=".75" stopColor="#86b8ff" stopOpacity=".78" />
          <stop offset="1" stopColor="#5a7663" stopOpacity=".08" />
        </radialGradient>
        <filter id="emotion-blur"><feGaussianBlur stdDeviation="12" /></filter>
      </defs>
      <circle className={styles.pulse} cx="160" cy="119" r="77" fill="#7bb5ff" opacity=".1" />
      <circle cx="160" cy="119" r="56" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 7" opacity=".55" />
      <circle className={styles.float} cx="160" cy="119" r="39" fill="url(#emotion-orb)" />
      <circle cx="148" cy="106" r="8" fill="white" opacity=".65" filter="url(#emotion-blur)" />
      <path className={styles.draw} d="M54 124c14-28 27 28 41 0s27 28 41 0M184 124c14-28 27 28 41 0s27 28 41 0" fill="none" stroke="var(--color-primary-deep)" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      <g className={styles.floatSlow}>
        <rect x="50" y="49" width="71" height="28" rx="14" style={panelStyle} />
        <circle cx="66" cy="63" r="4" fill="#86b8ff" />
        <rect x="77" y="60" width="29" height="5" rx="2.5" fill="var(--color-primary-deep)" opacity=".45" />
      </g>
      <g className={styles.float}>
        <rect x="207" y="170" width="65" height="28" rx="14" style={panelStyle} />
        <circle cx="223" cy="184" r="4" fill="#f0d98b" />
        <rect x="234" y="181" width="22" height="5" rx="2.5" fill="var(--color-primary-deep)" opacity=".45" />
      </g>
    </svg>
  );
}

function PriorityEngineVisual() {
  return (
    <svg className={styles.scene} viewBox="0 0 320 244" aria-hidden="true">
      <circle cx="160" cy="122" r="82" fill="none" stroke="var(--color-border-strong)" />
      <circle cx="160" cy="122" r="55" fill="none" stroke="var(--color-primary)" strokeDasharray="2 7" opacity=".55" />
      <g className={styles.pulse} style={{ transformOrigin: "160px 122px" }}>
        <circle cx="160" cy="122" r="31" fill="var(--color-mainstar)" />
        <circle cx="160" cy="122" r="20" fill="none" stroke="white" strokeOpacity=".36" />
        <circle cx="160" cy="122" r="7" fill="white" />
      </g>
      <g className={styles.float}>
        <rect x="35" y="58" width="90" height="37" rx="12" style={panelStyle} />
        <circle cx="53" cy="76" r="6" fill="#f08b78" />
        <rect x="67" y="72" width="39" height="6" rx="3" fill="var(--color-primary-deep)" opacity=".5" />
      </g>
      <g className={styles.floatSlow}>
        <rect x="207" y="155" width="81" height="37" rx="12" style={panelStyle} />
        <circle cx="225" cy="173" r="6" fill="#f0d98b" />
        <rect x="239" y="169" width="31" height="6" rx="3" fill="var(--color-primary-deep)" opacity=".5" />
      </g>
      <path d="M110 102 139 116M184 139l28 18" stroke="var(--color-primary-deep)" strokeWidth="1.5" strokeDasharray="3 5" />
    </svg>
  );
}

function TaskBreakdownVisual() {
  return (
    <svg className={styles.scene} viewBox="0 0 320 244" aria-hidden="true">
      <path className={styles.draw} d="M84 69c43 2 21 47 62 50s10 46 49 50" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="5 6" />
      <g className={styles.floatSlow}>
        <rect x="35" y="37" width="128" height="67" rx="18" style={panelStyle} />
        <rect x="55" y="56" width="74" height="8" rx="4" fill="var(--color-primary-deep)" opacity=".58" />
        <rect x="55" y="73" width="91" height="6" rx="3" fill="var(--color-primary)" opacity=".25" />
        <rect x="55" y="85" width="58" height="6" rx="3" fill="var(--color-primary)" opacity=".2" />
      </g>
      <g className={styles.float}>
        <rect x="122" y="104" width="162" height="103" rx="20" style={panelStyle} />
        {[0,1,2].map((item) => (
          <g key={item} transform={`translate(0 ${item * 25})`}>
            <rect x="143" y="124" width="14" height="14" rx="5" fill={item === 0 ? "var(--color-mainstar)" : "var(--color-primary)"} opacity={item === 0 ? "1" : ".45"} />
            <path d="m147 131 3 3 5-6" fill="none" stroke="white" strokeWidth="1.6" />
            <rect x="167" y="127" width={item === 1 ? "85" : "68"} height="7" rx="3.5" fill="var(--color-primary-deep)" opacity=".42" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function BurnoutPreventionVisual() {
  return (
    <svg className={styles.scene} viewBox="0 0 320 244" aria-hidden="true">
      <defs>
        <linearGradient id="energy-arc" x1="0" x2="1">
          <stop stopColor="#f08b78" />
          <stop offset=".52" stopColor="#f0d98b" />
          <stop offset="1" stopColor="var(--color-primary)" />
        </linearGradient>
      </defs>
      <path d="M72 157a93 93 0 0 1 176 0" fill="none" stroke="var(--color-border-strong)" strokeWidth="17" strokeLinecap="round" />
      <path className={styles.draw} d="M72 157a93 93 0 0 1 176 0" fill="none" stroke="url(#energy-arc)" strokeWidth="17" strokeLinecap="round" />
      <g className={styles.float}>
        <circle cx="160" cy="157" r="42" fill="var(--color-card-hover)" stroke="var(--color-border-strong)" />
        <path d="M160 157c-2-27 10-45 30-54-2 27-12 45-30 54Z" fill="var(--color-primary)" />
        <path d="M160 157c-15-20-31-27-48-24 10 22 25 31 48 24Z" fill="var(--color-primary-deep)" opacity=".58" />
        <path d="M160 157v25" stroke="var(--color-primary-deep)" strokeWidth="2" strokeLinecap="round" />
      </g>
      <rect x="102" y="207" width="116" height="26" rx="13" fill="var(--color-card-hover)" stroke="var(--color-border)" />
      <text x="160" y="224" textAnchor="middle" fill="var(--color-primary-deep)" fontSize="9" fontWeight="700">RECOVERY BUILT IN</text>
    </svg>
  );
}

function ProgressInsightsVisual() {
  const bars = [32, 50, 41, 70, 61, 87, 76];
  return (
    <svg className={styles.scene} viewBox="0 0 320 244" aria-hidden="true">
      <g className={styles.floatSlow}>
        <rect x="31" y="31" width="258" height="181" rx="22" style={panelStyle} />
        <text x="53" y="59" fill="var(--color-primary-deep)" fontSize="10" fontWeight="700">YOUR MOMENTUM</text>
        <text x="53" y="86" fill="var(--color-text-main)" fontSize="25" fontWeight="700">+24%</text>
        <text x="116" y="85" fill="var(--color-text-secondary)" fontSize="9">this month</text>
        {bars.map((height, index) => (
          <rect key={height + index} x={55 + index * 29} y={188 - height} width="13" height={height} rx="6.5" fill={index === 5 ? "var(--color-mainstar)" : "var(--color-primary)"} opacity={index === 5 ? "1" : String(0.28 + index * 0.08)} />
        ))}
        <path className={styles.draw} d="m56 136 29-14 29 6 29-25 29 10 29-34 29 11" fill="none" stroke="#5ba8ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="201" cy="79" r="5" fill="#5ba8ff" stroke="white" strokeWidth="2" />
      </g>
    </svg>
  );
}

function SurvivalModeVisual() {
  return (
    <svg className={styles.scene} viewBox="0 0 320 244" aria-hidden="true">
      <defs>
        <linearGradient id="survival-sea" x1="0" x2="1">
          <stop stopColor="#75b9ff" stopOpacity=".12" />
          <stop offset=".48" stopColor="#75b9ff" stopOpacity=".55" />
          <stop offset="1" stopColor="var(--color-primary)" stopOpacity=".38" />
        </linearGradient>
      </defs>
      <path className={styles.drift} d="M-20 156c49-34 79 24 129-6s83-8 115 8 73-29 116-8v94H-20Z" fill="url(#survival-sea)" />
      <path d="M-20 156c49-34 79 24 129-6s83-8 115 8 73-29 116-8" fill="none" stroke="white" strokeOpacity=".65" strokeWidth="2" />
      <g className={styles.float}>
        <path d="M130 114c24-24 63-16 77 3-14 20-53 28-77 4l-20 16 4-24-4-22Z" fill="var(--color-mainstar)" />
        <circle cx="189" cy="114" r="3.5" fill="white" />
        <path d="M154 116c10-7 19-6 28-1" fill="none" stroke="white" strokeOpacity=".32" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className={styles.floatSlow}>
        <rect x="69" y="42" width="182" height="47" rx="16" style={panelStyle} />
        <circle cx="91" cy="65" r="8" fill="var(--color-primary)" />
        <path d="m87 65 3 3 6-7" fill="none" stroke="white" strokeWidth="1.8" />
        <rect x="109" y="58" width="88" height="6" rx="3" fill="var(--color-primary-deep)" opacity=".58" />
        <rect x="109" y="70" width="57" height="5" rx="2.5" fill="var(--color-primary)" opacity=".3" />
        <rect x="210" y="55" width="23" height="20" rx="10" fill="var(--color-primary)" opacity=".25" />
      </g>
      <circle cx="54" cy="184" r="3" fill="white" opacity=".65" />
      <circle cx="73" cy="205" r="5" fill="white" opacity=".45" />
      <circle cx="262" cy="190" r="4" fill="white" opacity=".5" />
    </svg>
  );
}

const features: Feature[] = [
  {
    title: "Adaptive Task Planning",
    description: "Your day changes, so your plan should too. Maui reorganizes priorities around your energy, deadlines, focus, and progress—keeping the load realistic.",
    status: "Continuously adapting",
    glow: "rgba(91, 168, 255, 0.18)",
    visual: <AdaptivePlanningVisual />,
  },
  {
    title: "Executive Dysfunction Support",
    description: "When starting feels impossible, Maui detects the friction and turns intimidating work into one tiny first move you can actually begin.",
    status: "Gentle by design",
    glow: "rgba(143, 191, 159, 0.24)",
    visual: <ExecutiveSupportVisual />,
  },
  {
    title: "Emotion-Aware AI Companion",
    description: "Talk, vent, or explain what is on your mind. Maui adapts its recommendations, workload, and tone to meet you without judgment.",
    status: "Listening in context",
    glow: "rgba(111, 160, 255, 0.21)",
    visual: <EmotionCompanionVisual />,
  },
  {
    title: "Dynamic Priority Engine",
    description: "Tasks rise and fall automatically based on urgency, deadlines, emotional state, and the capacity you have right now.",
    status: "Live priorities",
    glow: "rgba(240, 217, 139, 0.19)",
    visual: <PriorityEngineVisual />,
  },
  {
    title: "AI Task Breakdown",
    description: "Paste an overwhelming assignment and get a clear roadmap with realistic estimates, achievable milestones, and a place to start.",
    status: "Complexity simplified",
    glow: "rgba(143, 191, 159, 0.22)",
    visual: <TaskBreakdownVisual />,
  },
  {
    title: "Burnout Prevention",
    description: "Maui notices when you are pushing too hard and recommends breaks, lighter workloads, or recovery time before burnout takes over.",
    status: "Energy protected",
    glow: "rgba(240, 139, 120, 0.15)",
    visual: <BurnoutPreventionVisual />,
  },
  {
    title: "Progress Insights",
    description: "See momentum instead of perfection. Calm visual insights make consistency, completed milestones, and long-term growth visible.",
    status: "Growth, made visible",
    glow: "rgba(91, 168, 255, 0.16)",
    visual: <ProgressInsightsVisual />,
  },
  {
    title: "Survival Mode",
    description: "On impossible days, Maui strips the plan back to what matters, protects your energy, and helps you keep moving without defeat.",
    status: "Only what matters",
    glow: "rgba(91, 168, 255, 0.21)",
    visual: <SurvivalModeVisual />,
  },
];

export default function FeatureShowcase() {
  return (
    <section id="features" className={styles.section} aria-labelledby="features-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            The Solution
          </div>
          <h2 id="features-heading" className={styles.heading}>
            Built for the way your{" "}
            <span className={styles.headingAccent}>brain actually works.</span>
          </h2>
          <p className={styles.intro}>
            Maui combines adaptive planning with emotionally aware support, so
            progress feels possible on focused days, messy days, and everything
            in between.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={styles.card}
              style={{ "--scene-glow": feature.glow } as CSSProperties}
            >
              <div className={styles.visual}>{feature.visual}</div>
              <div className={styles.content}>
                <div className={styles.numberRow}>
                  <span className={styles.number}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.status}>{feature.status}</span>
                </div>
                <h3 className={styles.title}>{feature.title}</h3>
                <p className={styles.description}>{feature.description}</p>
                <span className={styles.learnMore} aria-hidden="true">
                  Explore the feature
                  <span className={styles.learnMoreLine} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
