import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[var(--color-bg)]">
      <div className="relative z-50">
        <Navbar />
      </div>

      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[var(--color-primary)]/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-15%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[var(--color-accent)]/40 blur-[100px]" />

      <main className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-8 inline-block rounded-full border border-[var(--color-dark)]/5 bg-white/30 px-6 py-2 shadow-sm backdrop-blur-xl">
          <span className="text-[14px] font-semibold tracking-tight text-[var(--color-dark)]/80">
            Work with your brain, not against it.
          </span>
        </div>

        <div className="max-w-7xl">
          <h1 className="text-[clamp(2.5rem,8vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.06em] text-[var(--color-dark)]">
            Helping you start,
            <br />
            <span className="opacity-70">even on your worst days.</span>
          </h1>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Button variant="secondary">Watch Demo</Button>
        </div>
      </main>
    </div>
  );
}
