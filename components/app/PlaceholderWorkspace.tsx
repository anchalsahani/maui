import Navbar from "@/components/layout/Navbar";

interface PlaceholderWorkspaceProps {
  title: string;
  description: string;
  badge: string;
}

export default function PlaceholderWorkspace({
  title,
  description,
  badge,
}: PlaceholderWorkspaceProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[var(--color-primary)]/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-15%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[var(--color-accent)]/35 blur-[100px]" />

      <div className="relative z-50">
        <Navbar />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-28">
        <section className="w-full rounded-[36px] border border-white/40 bg-white/65 p-8 shadow-[0_30px_100px_rgba(53,85,63,0.12)] backdrop-blur-2xl sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)]/55 px-4 py-2 text-sm font-medium text-[var(--color-primary-deep)]">
            {badge}
          </div>

          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-[clamp(2.4rem,5vw,4.6rem)] font-bold leading-[0.95] tracking-[-0.06em] text-[var(--color-dark)]">
              {title}
            </h1>
            <p className="max-w-2xl text-[16px] leading-7 text-[var(--color-text-secondary)]">
              {description}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              "Primary view",
              "AI assistance",
              "State and progress",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-[var(--color-border)] bg-white/72 p-5 shadow-[0_12px_35px_rgba(53,85,63,0.06)]"
              >
                <p className="text-sm font-semibold text-[var(--color-dark)]">
                  {item}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Placeholder block ready for this page&apos;s final feature set.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
