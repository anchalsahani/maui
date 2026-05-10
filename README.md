# Maui

<img width="1906" height="860" alt="image" src="https://github.com/user-attachments/assets/e97a29df-31fb-4531-a5db-0d293b06f14e" />

**Maui** is a real-time anti-procrastination system designed for individuals struggling with **Executive Dysfunction** and **Task Initiation**. Unlike traditional "to-do" lists that trigger overwhelm, Maui removes decision friction by choosing your next task for you, breaking it into micro-steps, and adapting to your emotional state in real-time.

---

## 🚀 The Core Problem
Most productivity tools fail because "just start" isn't simple for everyone.
* **Decision Paralysis:** Too many choices lead to doing nothing.
* **Overwhelm:** Large tasks feel like mountains.
* **The "Wall of Awful":** Negative emotions make starting feel physically impossible.
* **Burnout:** Overworking without realizing it leads to total system failure.

---

## ✨ Key Features

| Feature | How it Helps |
| :--- | :--- |
| **⚡ AI Task Assignment** | Automatically picks your highest-priority task to eliminate decision fatigue. |
| **🧩 Task Breakdown** | Converts intimidating projects into tiny, actionable steps. |
| **🗣️ Emotion Engine** | Rant about your day; Maui analyzes your stress and adjusts your workload. |
| **🔥 Burnout Protection** | Tracks behavior patterns (like frequent exits) and triggers "Survival Mode." |
| **🎮 Reward System** | Reinforces the *act of starting* rather than just the result. |

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS
- **Backend:** Node.js, Express.js, Socket.IO (Real-time layers)
- **Database:** PostgreSQL, Prisma ORM, 
- **Intelligence:** OpenAI API (Emotion Analysis), Custom Algorithms
- **Auth:** JWT Auth

---

## 🧠 System Logic & UX Rules

Maui follows strict psychological rules to ensure task completion:
1.  **Rule 1:** No more than 1 decision per screen.
2.  **Rule 2:** User starts work within 10 seconds of opening the app.
3.  **Rule 3:** Never show the full task list (prevents overwhelm).
4.  **Rule 4:** Always provide a fallback (Survival Mode).

### Core Algorithms
* **Task Selection:** `score = urgency + deadlineWeight - difficulty`
* **Burnout Detection:** `burnoutScore = (earlyExitRate * 0.4) + (lowCompletion * 0.3) + (shortSessions * 0.3)`

