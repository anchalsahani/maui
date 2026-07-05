import React from "react";
import { ArrowUpRight, Play } from "lucide-react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
}: ButtonProps) {
  
  const baseStyles = `
    group
    relative
    inline-flex
    min-w-0
    items-center
    rounded-full
    overflow-hidden
    p-1.5
    transition-all
    duration-500
    active:scale-[0.97]
  `;

  const variants = {
    primary: {
      button: `
        bg-[var(--color-accent)]
        text-[var(--color-dark)]
        shadow-[0_10px_30px_rgba(0,0,0,0.08)]
      `,
      fill: "bg-[var(--color-dark)]",
      text: "group-hover:text-white",
      iconContainer: `
        bg-[var(--color-dark)]
        text-white 
        group-hover:bg-white
        group-hover:text-[var(--color-dark)]
      `,
      // Define the icon component for primary
      Icon: ArrowUpRight, 
    },
    secondary: {
      button: `
        bg-[var(--color-bg)]
        text-slate-500
        shadow-[-5px_-5px_10px_rgba(255,255,255,0.8),5px_5px_10px_rgba(0,0,0,0.25)]
        hover:shadow-[-1px_-1px_5px_rgba(255,255,255,0.6),1px_1px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(0,0,0,0.3)]
        hover:text-[var(--color-primary)]
      `,
      fill: "hidden", 
      text: " ",
      iconContainer: `
        bg-transparent
        text-slate-500
        group-hover:text-[var(--color-primary)]
      `,
      // Define the icon component for secondary
      Icon: Play,
    },
  };

  const current = variants[variant];
  const IconComponent = current.Icon;

  return (
    <button
      type={type}
      className={`${baseStyles} ${current.button} ${className}`}
    >
      {/* Fill Layer (Only for Primary) */}
      {variant === "primary" && (
        <span
          className={`
            absolute
            inset-0
            z-0
            scale-0
            rounded-full
            origin-center
            transition-transform
            duration-700
            ease-[cubic-bezier(0.19,1,0.22,1)]
            group-hover:scale-[2.5]
            ${current.fill}
          `}
        />
      )}

      <div className="relative z-10 grid w-full grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-1.5 sm:grid-cols-[24px_minmax(0,1fr)_auto] sm:gap-2">
        
        {/* The Left Padding Spacer */}
        <div className="w-4 sm:w-6" />

        {/* TEXT */}
        <span
          className={`
            text-[15px]
            font-semibold
            tracking-tight
            text-center
            pr-1
            transition-colors
            duration-500
            whitespace-nowrap
            ${current.text }
          `}
        >
          {children}
        </span>

        {/* ICON CONTAINER */}
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            transition-all
            duration-500
            sm:h-11
            sm:w-11
            ${current.iconContainer}
          `}
        >
          <IconComponent
            size={variant === "secondary" ? 16 : 20} // Play icon usually looks better slightly smaller
            className={`transition-transform duration-500 ${variant === "primary" ? "group-hover:rotate-45" : "group-hover:scale-110"}`}
          />
        </div>
      </div>
    </button>
  );
}
