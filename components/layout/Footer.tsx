import Link from "next/link";
import { Mail, Sparkles } from "lucide-react";

const footerLinks = [
  { href: "#problems", label: "Problem" },
  { href: "#features", label: "Solution" },
  { href: "#faq", label: "FAQ" },
  { href: "/signup", label: "Start" },
  { href: "/login", label: "Sign in" },
];

const socialLinks = [
  { href: "https://github.com/", label: "GitHub" },
  { href: "https://www.linkedin.com/", label: "LinkedIn" },
  { href: "https://x.com/", label: "X" },
];

const pillClassName =
  "group rounded-full border border-[var(--color-border)] bg-[var(--color-card-soft)] px-6 py-3 text-sm font-medium text-[var(--color-dark)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-mainstar)] hover:bg-[var(--color-card-hover)] hover:shadow-[0_10px_30px_rgba(143,191,159,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mainstar)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]";

export default function Footer() {
  return (
    <footer className="landing-deferred relative overflow-hidden bg-[var(--color-bg)] px-4 pb-6 sm:px-6 sm:pb-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-[var(--color-border)] bg-[var(--color-card-gradient)] px-8 py-16 shadow-[var(--shadow-card)]">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="footer-radial-glow absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full" />

          <div className="absolute bottom-0 left-1/2 h-80 w-[70%] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(143,191,159,0.08),transparent_70%)]" />
        </div>

        <div className="relative flex flex-col items-center text-center">
          {/* Animated Heading */}
          <h2 className="select-none bg-gradient-to-r from-white via-white to-[var(--color-mainstar)] bg-[length:250%] bg-clip-text text-[clamp(5rem,18vw,11rem)] font-semibold leading-none tracking-[-0.08em] text-transparent">
            Maui
          </h2>

          {/* Animated Divider */}
          <div className="mt-5 h-px w-56 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-20 translate-x-16 bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>

          {/* Description */}
          <p className="mt-8 max-w-2xl text-center text-[16px] leading-8 text-[var(--color-text-secondary)]">
            Built for the moments when starting feels heavier than the task
            itself. Maui helps you begin gently, organize your thoughts, and
            move forward one small step at a time.
          </p>

          {/* Navigation */}
          <nav
            className="mt-12 flex flex-wrap justify-center gap-3"
            aria-label="Main footer navigation"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pillClassName}
              >
                <span className="transition-opacity group-hover:opacity-90">
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Social links */}
          <div className="mt-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Follow Us
            </p>
            <nav
              className="mt-4 flex flex-wrap justify-center gap-3"
              aria-label="Maui social links"
            >
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={pillClassName}
                >
                  <span className="transition-opacity group-hover:opacity-90">
                    {link.label}
                  </span>
                </a>
              ))}
              <a
                href="mailto:hello@maui.app"
                className={`${pillClassName} inline-flex items-center gap-2`}
              >
                <Mail size={15} aria-hidden="true" />
                <span className="transition-opacity group-hover:opacity-90">
                  Email
                </span>
              </a>
            </nav>
          </div>

          {/* Divider */}
          <div className="mt-14 h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

          {/* Bottom */}
          <div className="mt-7 flex items-center text-sm text-[var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={15} />© 2026 Maui. Crafted with care.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
