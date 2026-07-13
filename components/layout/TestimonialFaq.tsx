"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const testimonials = [
  {
    title: "It makes starting feel smaller",
    body: "Maui does not ask me to become a different person. It gives me one tiny next move when my brain is refusing the whole task.",
    name: "Aanya",
    role: "College student",
  },
  {
    title: "Gentle without being vague",
    body: "The plan feels practical. I can rant, say I am stuck, or start a timer, and Maui adapts without making the day feel bigger.",
    name: "Rohan",
    role: "Designer",
  },
  {
    title: "Good for messy days",
    body: "I use it when I am overwhelmed and need a reset. The tiny steps and support plan help me return without the shame spiral.",
    name: "Mira",
    role: "Founder",
  },
  {
    title: "Calm structure",
    body: "It feels like a quiet workspace for my brain. No loud productivity pressure, just enough structure to begin.",
    name: "Dev",
    role: "Developer",
  },
];

const faqs = [
  {
    question: "Do I need experience with productivity or mental health apps to use Maui?",
    answer:
      "No. Maui is designed to feel simple from the first screen. You choose how you feel, write what is true if you want, and Maui gives you one clear next step.",
  },
  {
    question: "How is Maui different from a normal planner or timer?",
    answer:
      "Most planners assume you can already start. Maui focuses on the moment before starting, when tasks feel heavy, confusing, or emotionally loaded. It adjusts task size, support tone, and session length around that state.",
  },
  {
    question: "How does the AI support plan work?",
    answer:
      "Maui reads your current task list, mood, notes, and recent patterns, then creates a smaller plan for the next useful action. It is meant to reduce friction, not overload you with a perfect schedule.",
  },
  {
    question: "Is Maui a replacement for therapy or medical support?",
    answer:
      "No. Maui is a productivity and emotional support tool, not a medical service. If you are in crisis or need clinical care, contact a trusted person, local emergency services, or a qualified mental health professional.",
  },
  {
    question: "Can I use Maui on low-energy days?",
    answer:
      "Yes. That is the point. Maui can shrink tasks, suggest a lower-pressure plan, or help you name what is happening before you try to work.",
  },
];

export default function TestimonialFaq() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-bg)] px-3 py-16 sm:px-6 sm:py-24">
      <div className="app-page-wash pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="glass-card mb-5 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2">
            <span className="text-[12px] font-medium text-[var(--color-dark)]/70">
              What users notice
            </span>
          </div>
          <h2 className="text-[clamp(2rem,7.5vw,4.45rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--color-dark)]">
            Calm support for the hard part.
          </h2>
        </motion.div>

        <div className="mt-9 grid gap-4 lg:grid-cols-12 lg:gap-5">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="app-card-strong flex min-h-[250px] flex-col justify-between rounded-[24px] p-5 sm:min-h-[270px] sm:rounded-[26px] sm:p-6 lg:col-span-4"
          >
            <p className="max-w-sm text-[15px] leading-7 text-[var(--color-text-secondary)]">
              {testimonials[0].body}
            </p>
            <div>
              <h3 className="text-[clamp(1.85rem,4.8vw,3rem)] font-semibold leading-none tracking-[-0.05em] text-[var(--color-dark)]">
                {testimonials[0].title}
              </h3>
              <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                <span className="font-semibold text-[var(--color-dark)]">
                  {testimonials[0].name}
                </span>{" "}
                - {testimonials[0].role}
              </p>
            </div>
          </motion.article>

          <div className="flex items-center justify-center lg:col-span-2">
            <div className="hidden h-20 w-20 items-center justify-center text-[var(--color-mainstar)] lg:flex">
              <ChevronDown size={56} strokeWidth={1.6} />
            </div>
          </div>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="app-card-strong flex min-h-[250px] flex-col justify-between rounded-[24px] p-5 sm:min-h-[270px] sm:rounded-[26px] sm:p-6 lg:col-span-4 lg:col-start-9"
          >
            <p className="max-w-sm text-[15px] leading-7 text-[var(--color-text-secondary)]">
              {testimonials[1].body}
            </p>
            <div>
              <h3 className="text-[clamp(1.85rem,4.8vw,3rem)] font-semibold leading-none tracking-[-0.05em] text-[var(--color-dark)]">
                {testimonials[1].title}
              </h3>
              <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                <span className="font-semibold text-[var(--color-dark)]">
                  {testimonials[1].name}
                </span>{" "}
                - {testimonials[1].role}
              </p>
            </div>
          </motion.article>

          <div className="hidden lg:col-span-3 lg:block" />

          {testimonials.slice(2).map((testimonial, index) => (
            <motion.article
              key={testimonial.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.12 + index * 0.06 }}
              className="app-card flex min-h-[220px] flex-col justify-between rounded-[24px] p-5 sm:min-h-[235px] sm:rounded-[26px] sm:p-6 lg:col-span-3"
            >
              <p className="text-[15px] leading-7 text-[var(--color-text-secondary)]">
                {testimonial.body}
              </p>
              <div>
                <h3 className="text-[clamp(1.75rem,4.2vw,2.55rem)] font-semibold leading-none tracking-[-0.05em] text-[var(--color-dark)]">
                  {testimonial.title}
                </h3>
                <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                  <span className="font-semibold text-[var(--color-dark)]">
                    {testimonial.name}
                  </span>{" "}
                  - {testimonial.role}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="app-card-strong mt-16 overflow-hidden rounded-[28px] px-5 py-10 sm:mt-20 sm:rounded-[32px] sm:px-8 sm:py-14"
        >
          <h2 className="text-center text-[clamp(2rem,7.5vw,4.45rem)] font-semibold leading-none tracking-[-0.05em] text-[var(--color-dark)]">
            Frequently Asked Questions
          </h2>

          <div className="mx-auto mt-8 max-w-5xl divide-y divide-[var(--color-border)] sm:mt-12">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-[1.05rem] font-medium leading-7 text-[var(--color-dark)] sm:text-[1.25rem]">
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={22}
                    className="shrink-0 text-[var(--color-text-secondary)] transition-transform duration-300 group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-3xl pt-3 text-[15px] leading-7 text-[var(--color-text-secondary)] sm:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
