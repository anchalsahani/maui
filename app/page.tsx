"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button"; 
export default function Home() {
  return (
    /* FIXED: Removed 'center', added flex classes to ensure the whole page stays centered */
    <div className="relative flex min-h-screen flex-col bg-[var(--color-bg)] overflow-x-hidden">
      
      {/* Navbar needs to stay on top */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* 🌿 Ambient Backgrounds */}
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[var(--color-primary)]/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-15%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[var(--color-accent)]/40 blur-[100px]" />

      {/* FIXED: Added w-full and flex-1 to ensure the main section takes up space and centers properly */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-24 text-center w-full">
        
        {/* Top Badge */}
        <div className="mb-8 inline-block rounded-full border border-[var(--color-dark)]/5 bg-white/30 px-6 py-2 shadow-sm backdrop-blur-xl">
          <span className="text-[14px] font-semibold tracking-tight text-[var(--color-dark)]/80">
            ✨ Work with your brain, not against it.
          </span>
        </div>

        {/* Heading Section */}
        <div className="max-w-5xl">
          <h1 className="text-[clamp(2.5rem,8vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.06em] text-[var(--color-dark)]">
            Helping you start,<br />
            <span className="opacity-70">
              even on your worst days.
            </span>
          </h1>
 
        </div>

        {/* CTA Section */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">

          <Button variant="secondary" >
             Watch Demo
          </Button>
        </div>
      </main>
    </div>
  );
}