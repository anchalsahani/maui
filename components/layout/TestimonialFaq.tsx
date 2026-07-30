import { ChevronDown } from "lucide-react";

import FaqList from "./FaqList";

const testimonials = [
  {
    title: "It makes starting feel smaller",
    body:
      "Maui gives me one tiny next move when my brain is refusing the whole task.",
    name: "Aanya",
    role: "College student",
  },
  {
    title: "Gentle without being vague",
    body:
      "I can say I am stuck and get a practical plan without making the day feel bigger.",
    name: "Rohan",
    role: "Designer",
  },
  {
    title: "Good for messy days",
    body:
      "Tiny steps help me return to unfinished work without the usual shame spiral.",
    name: "Mira",
    role: "Founder",
  },
  {
    title: "Calm structure",
    body:
      "A quiet workspace for my brain—just enough structure to begin.",
    name: "Dev",
    role: "Developer",
  },
];

const faqs = [
  {
    question: "How is Maui different from a normal planner or timer?",
    answer:
      "Most planners assume you can already start. Maui focuses on the moment before starting, then adjusts task size, support, and session length around your current capacity.",
  },
  {
    question: "How does the AI support plan work?",
    answer:
      "Maui uses your current tasks, mood, notes, and recent patterns to suggest one smaller, useful next action instead of another overwhelming schedule.",
  },
  {
    question: "Can I use Maui on low-energy days?",
    answer:
      "Yes. Maui can shrink tasks, suggest a lower-pressure plan, or help you name what is happening before you try to work.",
  },
  {
    question: "Is Maui a replacement for therapy or medical support?",
    answer:
      "No. Maui is a productivity and emotional-support tool, not a medical service or substitute for professional care.",
  },
];

const featuredCardClass =
  "app-card-strong group flex min-h-[170px] flex-col justify-between rounded-[24px] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)]/40 hover:shadow-[0_22px_50px_rgba(47,74,57,0.1)]";

export default function TestimonialFaq() {
  return (
    <section className="landing-deferred relative overflow-hidden bg-[var(--color-bg)] px-3 py-12 sm:px-6 sm:py-16">
      <div className="app-page-wash pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass-card mb-3 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
            <span className="text-[12px] font-medium text-[var(--color-dark)]/70">
              What users notice
            </span>
          </div>
          <h2 className="text-[clamp(2rem,6vw,3.65rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--color-dark)]">
            Calm support for the hard part.
          </h2>
        </div>

        <div className="mt-7 grid gap-3 lg:grid-cols-12 lg:gap-4">
          <article className={`${featuredCardClass} lg:col-span-4`}>
            <p className="max-w-sm text-[14px] leading-[1.55] text-[var(--color-text-secondary)]">
              {testimonials[0].body}
            </p>
            <TestimonialAttribution testimonial={testimonials[0]} featured />
          </article>

          <div className="hidden items-center justify-center lg:col-span-2 lg:flex">
            <ChevronDown
              size={42}
              strokeWidth={1.5}
              className="text-[var(--color-mainstar)] transition-transform duration-300 hover:translate-y-1"
              aria-hidden="true"
            />
          </div>

          <article
            className={`${featuredCardClass} lg:col-span-4 lg:col-start-9`}
          >
            <p className="max-w-sm text-[14px] leading-[1.55] text-[var(--color-text-secondary)]">
              {testimonials[1].body}
            </p>
            <TestimonialAttribution testimonial={testimonials[1]} featured />
          </article>

          <div className="hidden lg:col-span-3 lg:block" aria-hidden="true" />

          {testimonials.slice(2).map((testimonial) => (
            <article
              key={testimonial.title}
              className="app-card group flex min-h-[150px] flex-col justify-between rounded-[24px] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)]/40 hover:shadow-[0_20px_44px_rgba(47,74,57,0.09)] lg:col-span-3"
            >
              <p className="text-[14px] leading-[1.55] text-[var(--color-text-secondary)]">
                {testimonial.body}
              </p>
              <TestimonialAttribution testimonial={testimonial} />
            </article>
          ))}
        </div>

        <div
          id="faq"
          className="app-card-strong mt-10 scroll-mt-24 overflow-hidden rounded-[26px] px-5 py-8 sm:px-8 sm:py-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-primary-deep)]">
                Quick answers
              </span>
              <h2 className="mt-3 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-none tracking-[-0.055em] text-[var(--color-dark)]">
                Good to know.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">
                Just the essentials, without the fine-print maze.
              </p>
            </div>

            <FaqList items={faqs} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialAttribution({
  testimonial,
  featured = false,
}: {
  testimonial: (typeof testimonials)[number];
  featured?: boolean;
}) {
  return (
    <div className="pt-4">
      <h3
        className={
          featured
            ? "text-[clamp(1.55rem,3.3vw,2.1rem)] font-semibold leading-none tracking-[-0.05em] text-[var(--color-dark)]"
            : "text-[clamp(1.4rem,3vw,1.8rem)] font-semibold leading-none tracking-[-0.05em] text-[var(--color-dark)]"
        }
      >
        {testimonial.title}
      </h3>
      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
        <span className="font-semibold text-[var(--color-dark)]">
          {testimonial.name}
        </span>{" "}
        · {testimonial.role}
      </p>
    </div>
  );
}
