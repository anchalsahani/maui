"use client";

import React from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] px-6 py-12">
      
      {/* 🌿 Ambient Background Blurs (Matches Home Page) */}
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--color-primary)]/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--color-accent)]/30 blur-[100px]" />

      <div className="relative z-10 w-full max-w-[440px]">
        
        {/* Back to Home Link */}
        <Link 
          href="/" 
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-dark)]"
        >
          <span className="text-lg">←</span> Back to Maui
        </Link>

        {/* The Auth Card */}
        <div className="rounded-[32px] border border-white/40 bg-white/40 p-8 shadow-[0_20px_50px_rgba(16,47,21,0.06)] backdrop-blur-2xl md:p-10">
          
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-dark)]">
              Create Account
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              Build a system that works <br />
              <span className="font-semibold text-[var(--color-primary)]">with your brain.</span>
            </p>
          </div>

          <form className="flex flex-col gap-5">
            {/* 
              Note: Ensure your Input component accepts 
              className props to allow for this custom styling 
            */}
            <div className="space-y-4">
              <Input 
                placeholder="Full Name" 
                className="h-12 rounded-2xl border-white/50 bg-white/50 px-5 focus:ring-2 focus:ring-[var(--color-primary)]/20" 
              />
              <Input 
                type="email" 
                placeholder="Email Address" 
                className="h-12 rounded-2xl border-white/50 bg-white/50 px-5 focus:ring-2 focus:ring-[var(--color-primary)]/20" 
              />
              <Input 
                type="password" 
                placeholder="Password" 
                className="h-12 rounded-2xl border-white/50 bg-white/50 px-5 focus:ring-2 focus:ring-[var(--color-primary)]/20" 
              />
            </div>

            {/* Using your custom animated Primary Button */}
            <Button type="submit" variant="primary" className="mt-4 w-full">
              Create Account
            </Button>
          </form>

          {/* Bottom Link */}
          <div className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[var(--color-dark)] hover:underline">
              Check in
            </Link>
          </div>
        </div>

        {/* Small Footer Detail */}
        <p className="mt-8 text-center text-[12px] uppercase tracking-widest text-[var(--color-dark)]/30">
          Secure & ADHD Friendly
        </p>
      </div>
    </div>
  );
}